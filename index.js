import { InstanceBase, runEntrypoint } from '@companion-module/base'
import { upgradeScripts } from './upgrade.js'
import { configFields } from './config.js'
import { getPresetDefinitions } from './presets.js'

class WebsocketInstance extends InstanceBase {
	isInitialized = false

	// let's actually handle the API a little more nicely...
	// import API modules dynamically
	async loadApiVersionModules(apiVersion) {
		if (apiVersion === '1.0.0') {
			const actions = await import('./api/v1.0.0/actions.js');
			const feedbacks = await import('./api/v1.0.0/feedbacks.js');
			const messages = await import('./api/v1.0.0/messages.js');
			const variables = await import('./api/v1.0.0/variables.js');
			return {
				setupActions: actions.setupActions,
				setupFeedbacks: feedbacks.setupFeedbacks,
				parseStatus: messages.parseStatus,
				initWebSocketHandle: messages.initWebSocketHandle,
				setupVariables: variables.setupVariables,
				updateVariables: variables.updateVariables,
			};
		} else if (apiVersion === '2.0.0') {
			const actions = await import('./api/v2.0.0/actions.js');
			const feedbacks = await import('./api/v2.0.0/feedbacks.js');
			const messages = await import('./api/v2.0.0/messages.js');
			const variables = await import('./api/v2.0.0/variables.js');
			return {
				setupActions: actions.setupActions,
				setupFeedbacks: feedbacks.setupFeedbacks,
				parseStatus: messages.parseStatus,
				initWebSocketHandle: messages.initWebSocketHandle,
				setupVariables: variables.setupVariables,
				updateVariables: variables.updateVariables,
			};
		}
		throw new Error(`Unsupported API version: ${apiVersion}`);
	} catch (err) {
		this.log(`Error loading API version modules: ${err.message}`);
		throw err;
	}


	async init(config) {
		this.config = config;
		this.isInitialized = true

		this.apiModules = await this.loadApiVersionModules(this.config.apiVersion);
		this.apiModules.setupVariables(this);

		this.initWebSocket();
		
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
		this.apiModules = await this.loadApiVersionModules(this.config.apiVersion);
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
		this.apiModules.initWebSocketHandle(this);
	}

	parseTeamsStatus(data) {
		this.apiModules.parseStatus(this, data);
		this.apiModules.updateVariables(this);
		this.checkFeedbacks();
	}

	messageReceivedFromWebSocket(data) {
		this.log('debug', "Received data from websock");
		let msgValue = null
		try {
			msgValue = JSON.parse(data)
		} catch (e) {
			msgValue = data
		}
		this.log('debug', JSON.stringify(msgValue));
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
		this.apiModules.setupFeedbacks(this);
	}

	initActions() {
		this.apiModules.setupActions(this);
	}

	initVariables() {
		this.apiModules.setupActions(this);
	}
	initPresets() {
		if (this.config.apiVersion === '2.0.0') {
			this.setPresetDefinitions(getPresetDefinitions(this))
		}
	}
}

runEntrypoint(WebsocketInstance, upgradeScripts);
