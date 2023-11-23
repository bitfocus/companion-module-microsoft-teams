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
		this.isVideoOn = false;
		this.isHandRaised = false;
		this.isInMeeting = false;
		this.isRecordingOn = false;
		this.isBackgroundBlurred = false;
		this.isSharing = false;
		this.hasUnreadMessages = false;
		this.canToggleMute = false;
		this.canToggleVideo = false;
		this.canToggleHand = false;
		this.canToggleBlur = false;
		this.canLeave = false;
		this.canReact = false;
		this.canToggleShareTray = false;
		this.canToggleChat = false;
		this.canStopSharing = false;
		this.canPair = false;

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

		const url = "ws://" + this.config.targetIp + ":8124?token=" + this.config.apiToken + "&protocol-version=2.0.0&manufacturer=Bitfocus&device=Companion&app=Companion-Microsoft%20Teams&app-version=1.0.2"
		if (!url || !this.config.targetIp) {
			this.updateStatus(InstanceStatus.BadConfig, `No Target IP defined`)
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
			this.ws.send('');
		})
		this.ws.on('close', (code) => {
			if (code == 1006) {
				this.updateStatus(InstanceStatus.Disconnected, `Teams not running`)
			}
			else {
				this.updateStatus(InstanceStatus.Disconnected, `Connection closed with code ${code}`)
			}
			this.maybeReconnect()
		})

		this.ws.on('message', (data) => {
			this.messageReceivedFromWebSocket(data);
		})

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
		if (data.meetingUpdate.meetingState != null) {
			this.isMuted = data.meetingUpdate.meetingState.isMuted;
			this.isVideoOn = data.meetingUpdate.meetingState.isVideoOn;
			this.isHandRaised = data.meetingUpdate.meetingState.isHandRaised;
			this.isInMeeting = data.meetingUpdate.meetingState.isInMeeting;
			this.isRecordingOn = data.meetingUpdate.meetingState.isRecordingOn;
			this.isBackgroundBlurred = data.meetingUpdate.meetingState.isBackgroundBlurred;
			this.isSharing = data.meetingUpdate.meetingState.isSharing;
			this.hasUnreadMessages = data.meetingUpdate.meetingState.hasUnreadMessages;
		}
		if (data.meetingUpdate.meetingPermissions != null) {
			this.canToggleMute = data.meetingUpdate.meetingPermissions.canToggleMute;
			this.canToggleVideo = data.meetingUpdate.meetingPermissions.canToggleVideo;
			this.canToggleHand = data.meetingUpdate.meetingPermissions.canToggleHand;
			this.canToggleBlur = data.meetingUpdate.meetingPermissions.canToggleBlur;
			this.canLeave = data.meetingUpdate.meetingPermissions.canLeave;
			this.canReact = data.meetingUpdate.meetingPermissions.canReact;
			this.canToggleShareTray = data.meetingUpdate.meetingPermissions.canToggleShareTray;
			this.canToggleChat = data.meetingUpdate.meetingPermissions.canToggleChat;
			this.canStopSharing = data.meetingUpdate.meetingPermissions.canStopSharing;
			this.canPair = data.meetingUpdate.meetingPermissions.canPair;
		}
		this.checkFeedbacks();
	}

	messageReceivedFromWebSocket(data) {
		let msgValue = null
		try {
			msgValue = JSON.parse(data)
		} catch (e) {
			msgValue = data
		}
		if (msgValue.tokenRefresh != null) {
			this.config.apiToken = msgValue.tokenRefresh;
			this.saveConfig(this.config)
			this.configUpdated(this.config)
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
