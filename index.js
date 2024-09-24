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
			const { variables } = await import('./api/v1.0.0/variables.js');
			return {
				setupActions: actions.setupActions,
				setupFeedbacks: feedbacks.setupFeedbacks,
				parseStatus: messages.parseStatus,
				initWebSocketHandle: messages.initWebSocketHandle,
				variables: variables,
			};
		} else if (apiVersion === '2.0.0') {
			const actions = await import('./api/v2.0.0/actions.js');
			const feedbacks = await import('./api/v2.0.0/feedbacks.js');
			const messages = await import('./api/v2.0.0/messages.js');
			const { variables } = await import('./api/v2.0.0/variables.js');
			return {
				setupActions: actions.setupActions,
				setupFeedbacks: feedbacks.setupFeedbacks,
				parseStatus: messages.parseStatus,
				initWebSocketHandle: messages.initWebSocketHandle,
				variables: variables,
			};
		}
		throw new Error(`Unsupported API version: ${apiVersion}`);
	} catch (err) {
		this.log("error",`Error loading API version modules: ${err.message}`);
		throw err;
	}


	async init(config) {
		this.isInitialized = true;
		this.configUpdated(config);
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
		this.log('debug', `API loaded ${this.config.apiVersion}`);
		this.initActions()
		this.initFeedbacks()
		this.initVariables()
		this.initPresets()
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
		this.updateVariables(this);
		this.checkFeedbacks();
	}

	messageReceivedFromWebSocket(data) {
		let msgValue = null
		try {
			msgValue = JSON.parse(data);
			this.log('debug', `Received websock data:\n${JSON.stringify(msgValue)}`);
		} catch (e) {
			msgValue = data;
			this.log('debug', `Received websock data:\n${msgValue}`);
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
		this.apiModules.setupFeedbacks(this);
	}

	initActions() {
		this.apiModules.setupActions(this);
	}

	initVariables() {
		this.setVariableDefinitions(this.apiModules.variables);
		const variableValues = {};
		this.apiModules.variables.forEach((variable) => {
			this[variable.variableId] = false;
			variableValues[variable.variableId] = false;
		});
		this.setVariableValues(variableValues);
	}

	updateVariables() {
		const variableValues = {};
		this.apiModules.variables.forEach((variable) => {
			variableValues[variable.variableId] = this[variable.variableId];
		});
		this.setVariableValues(variableValues);
	}

	initPresets() {
		if (this.config.apiVersion === '2.0.0') {
			this.setPresetDefinitions(getPresetDefinitions(this))
		}
	}
}

runEntrypoint(WebsocketInstance, upgradeScripts);
