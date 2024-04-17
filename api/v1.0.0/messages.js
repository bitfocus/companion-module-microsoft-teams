import { InstanceStatus } from '@companion-module/base'
import WebSocket from 'ws'

export function parseStatus(instance, data) {
	instance.inMeeting = data.meetingUpdate.meetingState.isInMeeting;
	instance.isMuted = data.meetingUpdate.meetingState.isMuted;
	instance.isCameraOn = data.meetingUpdate.meetingState.isCameraOn;
	instance.isHandRaised = data.meetingUpdate.meetingState.isHandRaised;
	instance.isBackgroundBlurred = data.meetingUpdate.meetingState.isBackgroundBlurred;
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

	const url = "ws://" + instance.config.targetIp + ":8124?token=" + instance.config.apiToken + "&protocol-version=1.0.0&manufacturer=MuteDeck&device=MuteDeck&app=MuteDeck&app-version=1.4"
	if (!url || !instance.config.apiToken || !instance.config.targetIp) {
		instance.updateStatus(InstanceStatus.BadConfig, `API token is missing`)
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
		instance.ws.send('{"apiVersion":"1.0.0","service":"query-meeting-state","action":"query-meeting-state","manufacturer":"Elgato","device":"StreamDeck","timestamp":1675341655453}');
	})
	instance.ws.on('close', (code) => {
		if (code == 1006) {
			instance.updateStatus(InstanceStatus.Disconnected, `Invalid API token or Teams not running`)
		}
		else {
			instance.updateStatus(InstanceStatus.Disconnected, `Connection closed with code ${code}`)
		}
		instance.maybeReconnect()
	})

	instance.ws.on('message', instance.messageReceivedFromWebSocket.bind(instance))

	instance.ws.on('error', (data) => {
		if (data == "Error: Unexpected server response: 403") {
			instance.updateStatus(InstanceStatus.Disconnected, 'Invalid API token or Teams not running')
		}
		else {
			instance.log('error', `WebSocket error: ${data}`)
		}
	})
}