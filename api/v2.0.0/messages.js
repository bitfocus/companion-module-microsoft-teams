import { InstanceStatus } from '@companion-module/base'
import WebSocket from 'ws'

export function parseStatus(instance, data) {
	if (data.meetingUpdate.meetingState != null) {
		instance.isMuted = data.meetingUpdate.meetingState.isMuted;
		instance.isVideoOn = data.meetingUpdate.meetingState.isVideoOn;
		instance.isHandRaised = data.meetingUpdate.meetingState.isHandRaised;
		instance.isInMeeting = data.meetingUpdate.meetingState.isInMeeting;
		instance.isRecordingOn = data.meetingUpdate.meetingState.isRecordingOn;
		instance.isBackgroundBlurred = data.meetingUpdate.meetingState.isBackgroundBlurred;
		instance.isSharing = data.meetingUpdate.meetingState.isSharing;
		instance.hasUnreadMessages = data.meetingUpdate.meetingState.hasUnreadMessages;
	}
	if (data.meetingUpdate.meetingPermissions != null) {
		instance.canToggleMute = data.meetingUpdate.meetingPermissions.canToggleMute;
		instance.canToggleVideo = data.meetingUpdate.meetingPermissions.canToggleVideo;
		instance.canToggleHand = data.meetingUpdate.meetingPermissions.canToggleHand;
		instance.canToggleBlur = data.meetingUpdate.meetingPermissions.canToggleBlur;
		instance.canLeave = data.meetingUpdate.meetingPermissions.canLeave;
		instance.canReact = data.meetingUpdate.meetingPermissions.canReact;
		instance.canToggleShareTray = data.meetingUpdate.meetingPermissions.canToggleShareTray;
		instance.canToggleChat = data.meetingUpdate.meetingPermissions.canToggleChat;
		instance.canStopSharing = data.meetingUpdate.meetingPermissions.canStopSharing;
		instance.canPair = data.meetingUpdate.meetingPermissions.canPair;
	}
}

export function messageReceived(instance, data) {
	let msgValue = null
	try {
		msgValue = JSON.parse(data)
	} catch (e) {
		msgValue = data
	}
	if (msgValue.tokenRefresh != null) {
		instance.config.apiToken = msgValue.tokenRefresh;
		instance.saveConfig(instance.config)
		instance.configUpdated(instance.config)
	}
	if (msgValue.meetingUpdate != null) {
		instance.parseTeamsStatus(msgValue);
	}
}

export function initWebSocketHandle(instance) {
	if (instance.reconnect_timer) {
		clearTimeout(instance.reconnect_timer)
		instance.reconnect_timer = null
	}

	const url = "ws://" + instance.config.targetIp + ":8124?token=" + instance.config.apiToken + "&protocol-version=2.0.0&manufacturer=Bitfocus&device=Companion&app=Companion-Microsoft%20Teams&app-version=1.0.2"
	if (!url || !instance.config.targetIp) {
		instance.updateStatus(InstanceStatus.BadConfig, `No Target IP defined`)
		return
	}

	instance.updateStatus(InstanceStatus.Connecting)


	if (instance.ws) {
		instance.ws.close(1000)
		delete instance.ws
	}
	instance.ws = new WebSocket(url)

	instance.ws.on('open', () => {
		instance.updateStatus(InstanceStatus.Ok);
		instance.ws.send('');
	})
	instance.ws.on('close', (code) => {
		if (code == 1006) {
			instance.updateStatus(InstanceStatus.Disconnected, `Teams not running`)
		}
		else {
			instance.updateStatus(InstanceStatus.Disconnected, `Connection closed with code ${code}`)
		}
		instance.maybeReconnect()
	})

	instance.ws.on('message', (data) => {
		instance.messageReceivedFromWebSocket(data);
	})

	instance.ws.on('error', (data) => {
		if (data == "Error: Unexpected server response: 403") {
			instance.updateStatus(InstanceStatus.Disconnected, 'Invalid API token or Teams not running')
		}
		else {
			instance.log('error', `WebSocket error: ${data}`)
		}
	})
}