import { InstanceBase, runEntrypoint } from '@companion-module/base'
import { upgradeScripts } from './upgrade.js'
import { setupActions as setupActionsV1 } from './api/v1.0.0/actions.js'
import { setupActions as setupActionsV2 } from './api/v2.0.0/actions.js'
import { setupFeedbacks as setupFeedbacksV1 } from './api/v1.0.0/feedbacks.js'
import { setupFeedbacks as setupFeedbacksV2 } from './api/v2.0.0/feedbacks.js'
import { parseStatus as parseStatusV1 } from './api/v1.0.0/messages.js'
import { parseStatus as parseStatusV2 } from './api/v2.0.0/messages.js'
import { initWebSocketHandle as initWebSocketHandleV1 } from './api/v1.0.0/messages.js'
import { initWebSocketHandle as initWebSocketHandleV2 } from './api/v2.0.0/messages.js'
import { configFields } from './config.js'
import { getPresetDefinitions } from './presets.js'



class WebsocketInstance extends InstanceBase {
	isInitialized = false

	async init(config) {
		this.config = config

		this.initWebSocket()
		this.isInitialized = true

		// api v1.0.0
		this.isMuted = false;
		this.inMeeting = false;
		this.isCameraOn = false;
		this.isHandRaised = false;
		this.isBackgroundBlurred = false;

		// Additional for api v2.0.0
		this.isVideoOn = false;
		this.isInMeeting = false;
		this.isRecordingOn = false;
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
		this.initPresets()
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
		this.initActions()
		this.initFeedbacks()
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
		if (this.config.apiVersion === '1.0.0') {
			initWebSocketHandleV1(this);
		} else if (this.config.apiVersion === '2.0.0') {
			initWebSocketHandleV2(this);
		} 
	}


	parseTeamsStatus(data) {
		if (this.config.apiVersion === '1.0.0') {
			parseStatusV1(this, data);
		} else if (this.config.apiVersion === '2.0.0') {
			parseStatusV2(this, data);
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
		if (this.config.apiVersion === '1.0.0') {
			setupFeedbacksV1(this);
		} else if (this.config.apiVersion === '2.0.0') {
			setupFeedbacksV2(this);
		}
	}

	initActions() {
		if (this.config.apiVersion === '1.0.0') {
			setupActionsV1(this);
		} else if (this.config.apiVersion === '2.0.0') {
			setupActionsV2(this);
		}
	}

	initPresets() {
		if (this.config.apiVersion === '2.0.0') {
			this.setPresetDefinitions(getPresetDefinitions(this))
		}
	}
}

runEntrypoint(WebsocketInstance, upgradeScripts);
