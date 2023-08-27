import { InstanceBase, runEntrypoint, InstanceStatus, combineRgb } from '@companion-module/base'
import WebSocket from 'ws'
import { upgradeScripts } from './upgrade.js'
import { Regex } from '@companion-module/base'


class WebsocketInstance extends InstanceBase {
	isInitialized = false

	async init(config) {
		this.config = config

		this.initWebSocket()
		this.isInitialized = true

		this.isMuted = false;
		this.inMeeting = false;
		this.isCameraOn = false;
		this.isHandRaised = false;
		this.isBackgroundBlurred = false;

		this.initActions()
		this.initFeedbacks()
	}

	async destroy() {
		this.isInitialized = false
		if (this.reconnect_timer) {
			clearTimeout(this.reconnect_timer)
			this.reconnect_timer = null
		}
		if (this.ws) {
			this.ws.close(1000)
			delete this.ws
		}
	}

	async configUpdated(config) {
		this.config = config
		this.initWebSocket()
	}

	maybeReconnect() {
		if (this.isInitialized && this.config.reconnect) {
			if (this.reconnect_timer) {
				clearTimeout(this.reconnect_timer)
			}
			this.reconnect_timer = setTimeout(() => {
				this.initWebSocket()
			}, 5000)
		}
	}

	initWebSocket() {
		if (this.reconnect_timer) {
			clearTimeout(this.reconnect_timer)
			this.reconnect_timer = null
		}

		const url = "ws://" + this.config.targetIp + ":8124?token=" + this.config.apiToken + "&protocol-version=1.0.0&manufacturer=MuteDeck&device=MuteDeck&app=MuteDeck&app-version=1.4"
		if (!url || !this.config.apiToken || !this.config.targetIp) {
			this.updateStatus(InstanceStatus.BadConfig, `API token is missing`)
			return
		}

		this.updateStatus(InstanceStatus.Connecting)

		if (this.ws) {
			this.ws.close(1000)
			delete this.ws
		}
		this.ws = new WebSocket(url)

		this.ws.on('open', () => {
			this.updateStatus(InstanceStatus.Ok);
			this.ws.send('{"apiVersion":"1.0.0","service":"query-meeting-state","action":"query-meeting-state","manufacturer":"Elgato","device":"StreamDeck","timestamp":1675341655453}');
		})
		this.ws.on('close', (code) => {
			if (code == 1006) {
				this.updateStatus(InstanceStatus.Disconnected, `Invalid API token or Teams not running`)
			}
			else {
				this.updateStatus(InstanceStatus.Disconnected, `Connection closed with code ${code}`)
			}
			this.maybeReconnect()
		})

		this.ws.on('message', this.messageReceivedFromWebSocket.bind(this))

		this.ws.on('error', (data) => {
			if (data == "Error: Unexpected server response: 403") {
				this.updateStatus(InstanceStatus.Disconnected, 'Invalid API token or Teams not running')
			}
			else {
				this.log('error', `WebSocket error: ${data}`)
			}
		})
	}


	parseTeamsStatus(data) {
		this.inMeeting = data.meetingUpdate.meetingState.isInMeeting;
		this.isMuted = data.meetingUpdate.meetingState.isMuted;
		this.isCameraOn = data.meetingUpdate.meetingState.isCameraOn;
		this.isHandRaised = data.meetingUpdate.meetingState.isHandRaised;
		this.isBackgroundBlurred = data.meetingUpdate.meetingState.isBackgroundBlurred;
		this.checkFeedbacks();
	}

	messageReceivedFromWebSocket(data) {
		let msgValue = null
		try {
			msgValue = JSON.parse(data)
		} catch (e) {
			msgValue = data
		}
		if (msgValue.meetingUpdate != null) {
			this.parseTeamsStatus(msgValue);
		}
	}

	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value:
					"An API token is needed for this module to be able to control the Teams instance - follow this URL to generate an API token and copy it to the field below: <br> <a href='https://support.microsoft.com/en-us/office/connect-to-third-party-devices-in-microsoft-teams-aabca9f2-47bb-407f-9f9b-81a104a883d6' target='_blank'>Generate API token</a>",
			},
			{
				type: 'textinput',
				id: 'targetIp',
				label: 'Target IP address',
				tooltip: 'For localhost use 127.0.0.1 (loopback IP)',
				default: '127.0.0.1',
				width: 12,
				regex: Regex.IP
			},
			{
				type: 'textinput',
				id: 'apiToken',
				label: 'MS Teams API Token',
				width: 12,
			},
			{
				type: 'checkbox',
				id: 'reconnect',
				label: 'Reconnect',
				tooltip: 'Reconnect on WebSocket error (after 5 secs)',
				width: 6,
				default: true,
			}
		]
	}

	initFeedbacks() {
		this.setFeedbackDefinitions({
			isMuted: {
				type: 'boolean',
				name: 'Is muted',
				description: 'True when the microphone is muted, false when it is not.',
				options: [],
				callback: (feedback, context) => {
					return this.isMuted;
				}
			},
			inMeeting: {
				type: 'boolean',
				name: 'In meeting',
				description: 'True when the user is currently in a meeting, false when he is not.',
				options: [],
				callback: (feedback, context) => {
					return this.inMeeting;
				}
			},
			handRaised: {
				type: 'boolean',
				name: 'Hand raised',
				description: 'True when the hand is raised in a call, false when it is not.',
				options: [],
				callback: (feedback, context) => {
					return this.isHandRaised;
				}
			},
			cameraOn: {
				type: 'boolean',
				name: 'Camera on',
				description: 'True when the camera is on, false when it is not.',
				options: [],
				callback: (feedback, context) => {
					return this.isCameraOn;
				}
			},
			backgroundBlurred: {
				type: 'boolean',
				name: 'Background blurred',
				description: 'True when the background blur is active, false when it is not.',
				options: [],
				callback: (feedback, context) => {
					return this.isBackgroundBlurred;
				}
			},
		})
	}

	initActions() {
		this.setActionDefinitions({
			toggleMute: {
				name: "Toggle mute",
				description: "Enable/Disable the microphone",
				options: [],
				callback: async (action, context) => {
					this.ws.send(
						JSON.stringify({
							apiVersion: "1.0.0",
							service: "toggle-mute",
							action: "toggle-mute",
							manufacturer: "Elgato",
							device: "StreamDeck",
							timestamp: Date.now()
						})
					)
				},
			},
			toggleVideo: {
				name: "Toggle video",
				description: "Enable/Disable the camera",
				options: [],
				callback: async (action, context) => {
					this.ws.send(
						JSON.stringify({
							apiVersion: "1.0.0",
							service: "toggle-video",
							action: "toggle-video",
							manufacturer: "Elgato",
							device: "StreamDeck",
							timestamp: Date.now()
						})
					)
				},
			},
			leaveMeeting: {
				name: "Leave meeting",
				description: "Leave the current meeting",
				options: [],
				callback: async (action, context) => {
					this.ws.send(
						JSON.stringify({
							apiVersion: "1.0.0",
							service: "call",
							action: "leave-call",
							manufacturer: "Elgato",
							device: "StreamDeck",
							timestamp: Date.now()
						})
					)
				},
			},
			toggleBackgroundBlur: {
				name: "Toggle background blur",
				description: "Enable/Disable the backgroud blur effect",
				options: [],
				callback: async (action, context) => {
					this.ws.send(
						JSON.stringify({
							apiVersion: "1.0.0",
							service: "background-blur",
							action: "toggle-background-blur",
							manufacturer: "Elgato",
							device: "StreamDeck",
							timestamp: Date.now()
						})
					)
				},
			},
			toggleHand: {
				name: "Toggle raising hand",
				description: "Raise/Unraise the hand in an active call",
				options: [],
				callback: async (action, context) => {
					this.ws.send(
						JSON.stringify({
							apiVersion: "1.0.0",
							service: "raise-hand",
							action: "toggle-hand",
							manufacturer: "Elgato",
							device: "StreamDeck",
							timestamp: Date.now()
						})
					)
				},
			},
			reaction: {
				name: "Reaction",
				description: "Select one from five reactions to show in an active call",
				options: [
					{
						type: 'dropdown',
						label: 'Reaction',
						id: 'selectedReaction',
						default: 0,
						choices: [
							{ id: 0, label: "Applause" },
							{ id: 1, label: "Laugh" },
							{ id: 2, label: "Like" },
							{ id: 3, label: "Heart" },
							{ id: 4, label: "Wow" },
						],
					},
				],
				callback: async (action, context) => {
					var message = {
						apiVersion: "1.0.0",
						service: "call",
						manufacturer: "Elgato",
						device: "StreamDeck",
						timestamp: Date.now()
					}
					switch (action.options.selectedReaction) {
						case 0: message.action = "react-applause"; break;
						case 1: message.action = "react-laugh"; break;
						case 2: message.action = "react-like"; break;
						case 3: message.action = "react-love"; break;
						case 4: message.action = "react-wow"; break;
					}

					this.ws.send(JSON.stringify(message));
				},
			},
		})
	}
}

runEntrypoint(WebsocketInstance, upgradeScripts)
