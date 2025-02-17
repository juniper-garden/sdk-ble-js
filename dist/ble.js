import { ImprovCurrentState, IMPROV_BLE_CURRENT_STATE_CHARACTERISTIC, IMPROV_BLE_ERROR_STATE_CHARACTERISTIC, IMPROV_BLE_RPC_COMMAND_CHARACTERISTIC, IMPROV_BLE_RPC_RESULT_CHARACTERISTIC, IMPROV_BLE_SERVICE, IMPROV_BLE_CAPABILITIES_CHARACTERISTIC, } from "./const";
export class ImprovBluetoothLE extends EventTarget {
    constructor(device, logger) {
        super();
        this.device = device;
        this.logger = logger;
        this.errorState = 0 /* ImprovErrorState.NO_ERROR */;
        this.capabilities = 0;
    }
    get name() {
        return this.device.name;
    }
    async initialize() {
        this.logger.log("Trying to connect to Improv BLE service");
        this.device.addEventListener("gattserverdisconnected", () => {
            // If we're provisioned, we expect to be disconnected.
            if (this.currentState === ImprovCurrentState.PROVISIONED) {
                return;
            }
            this.dispatchEvent(new CustomEvent("disconnect"));
        });
        // Do everything in sequence as some OSes do not support parallel GATT commands
        // https://github.com/WebBluetoothCG/web-bluetooth/issues/188#issuecomment-255121220
        await this.device.gatt.connect();
        const service = await this.device.gatt.getPrimaryService(IMPROV_BLE_SERVICE);
        this._currentStateChar = await service.getCharacteristic(IMPROV_BLE_CURRENT_STATE_CHARACTERISTIC);
        this._errorStateChar = await service.getCharacteristic(IMPROV_BLE_ERROR_STATE_CHARACTERISTIC);
        this._rpcCommandChar = await service.getCharacteristic(IMPROV_BLE_RPC_COMMAND_CHARACTERISTIC);
        this._rpcResultChar = await service.getCharacteristic(IMPROV_BLE_RPC_RESULT_CHARACTERISTIC);
        try {
            const capabilitiesChar = await service.getCharacteristic(IMPROV_BLE_CAPABILITIES_CHARACTERISTIC);
            const capabilitiesValue = await capabilitiesChar.readValue();
            this.capabilities = capabilitiesValue.getUint8(0);
        }
        catch (err) {
            console.warn("Firmware not according to spec, missing capability support.");
        }
        this._currentStateChar.addEventListener("characteristicvaluechanged", (ev) => this._handleImprovCurrentStateChange(ev.target.value));
        await this._currentStateChar.startNotifications();
        this._errorStateChar.addEventListener("characteristicvaluechanged", (ev) => this._handleImprovErrorStateChange(ev.target.value));
        await this._errorStateChar.startNotifications();
        this._rpcResultChar.addEventListener("characteristicvaluechanged", (ev) => this._handleImprovRPCResultChange(ev.target.value));
        await this._rpcResultChar.startNotifications();
        const curState = await this._currentStateChar.readValue();
        const errorState = await this._errorStateChar.readValue();
        this._handleImprovCurrentStateChange(curState);
        this._handleImprovErrorStateChange(errorState);
    }
    close() {
        if (this.device.gatt.connected) {
            this.logger.debug("Disconnecting gatt");
            this.device.gatt.disconnect();
        }
    }
    identify() {
        this.sendRPC(2 /* ImprovRPCCommand.IDENTIFY */, new Uint8Array());
    }
    async provision(ssid, password) {
        const encoder = new TextEncoder();
        const ssidEncoded = encoder.encode(ssid);
        const pwEncoded = encoder.encode(password);
        const data = new Uint8Array([
            ssidEncoded.length,
            ...ssidEncoded,
            pwEncoded.length,
            ...pwEncoded,
        ]);
        try {
            const rpcResult = await this.sendRPCWithResponse(1 /* ImprovRPCCommand.SEND_WIFI_SETTINGS */, data);
            this.logger.debug("Provisioned! Disconnecting gatt");
            // We're going to set this result manually in case we get RPC result first
            // that way it's safe to disconnect.
            this.currentState = ImprovCurrentState.PROVISIONED;
            this.dispatchEvent(new CustomEvent("state-changed"));
            this.device.gatt.disconnect();
            this.dispatchEvent(new CustomEvent("disconnect"));
            this.nextUrl =
                rpcResult.values.length > 0 ? rpcResult.values[0] : undefined;
            return this.nextUrl;
        }
        catch (err) {
            // Do nothing. Error code will handle itself.
            return undefined;
        }
    }
    async sendRPCWithResponse(command, data) {
        // Commands that receive feedback will finish when either
        // the state changes or the error code becomes not 0.
        if (this._rpcFeedback) {
            throw new Error("Only 1 RPC command that requires feedback can be active");
        }
        return await new Promise((resolve, reject) => {
            this._rpcFeedback = { command, resolve, reject };
            this.sendRPC(command, data);
        });
    }
    sendRPC(command, data) {
        this.logger.debug("RPC COMMAND", command, data);
        const payload = new Uint8Array([command, data.length, ...data, 0]);
        payload[payload.length - 1] = payload.reduce((sum, cur) => sum + cur, 0);
        this.RPCResult = undefined;
        this._rpcCommandChar.writeValue(payload);
    }
    _handleImprovCurrentStateChange(encodedState) {
        const state = encodedState.getUint8(0);
        this.logger.debug("improv current state", state);
        this.currentState = state;
        if (state === 4) {
            this.logger.debug('state is successfully provisioned');
            if (this._rpcFeedback) {
                this.logger.debug('rpc feedback is not null');
                const result = {
                    command: this._rpcFeedback.command,
                    values: [],
                };
                this._rpcFeedback.resolve(result);
                this._rpcFeedback = undefined;
            }
        }
        this.dispatchEvent(new CustomEvent("state-change"));
    }
    _handleImprovErrorStateChange(encodedState) {
        const state = encodedState.getUint8(0);
        this.logger.debug("improv error state", state);
        this.errorState = state;
        // Sending an RPC command sets error to no error.
        // If we get a real error it means the RPC command is done.
        if (state !== 0 /* ImprovErrorState.NO_ERROR */) {
            if (this._rpcFeedback) {
                this._rpcFeedback.reject(state);
                this._rpcFeedback = undefined;
            }
        }
    }
    _handleImprovRPCResultChange(encodedResult) {
        this.logger.debug("improv RPC result", encodedResult);
        const command = encodedResult.getUint8(0);
        const result = {
            command,
            values: [],
        };
        const dataLength = encodedResult.getUint8(1);
        const baseOffset = 2;
        const decoder = new TextDecoder();
        for (let start = 0; start < dataLength;) {
            const valueLength = encodedResult.getUint8(baseOffset + start);
            const valueBytes = new Uint8Array(valueLength);
            const valueOffset = baseOffset + start + 1;
            for (let i = 0; i < valueLength; i++) {
                valueBytes[i] = encodedResult.getUint8(valueOffset + i);
            }
            result.values.push(decoder.decode(valueBytes));
            start += valueLength + 1; // +1 for length byte
        }
        this.RPCResult = result;
        if (this._rpcFeedback) {
            if (this._rpcFeedback.command !== command) {
                this.logger.error("Received ");
            }
            this._rpcFeedback.resolve(result);
            this._rpcFeedback = undefined;
        }
    }
}
