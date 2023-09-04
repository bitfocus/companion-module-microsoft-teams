import { InstanceBase, runEntrypoint, InstanceStatus, combineRgb } from '@companion-module/base'
import WebSocket from 'ws'
import { upgradeScripts } from './upgrade.js'
import { setupActions } from './actions.js'
import { setupFeedbacks } from './feedbacks.js'
import { configFields } from './config.js'


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
		return configFields;
	}

	initFeedbacks() {
		setupFeedbacks(this);
	}

	initActions() {
		setupActions(this);
	}
}

runEntrypoint(WebsocketInstance, upgradeScripts)
