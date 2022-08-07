export interface Logger {
    log(msg: string, ...args: any[]): void;
    error(msg: string, ...args: any[]): void;
    debug(msg: string, ...args: any[]): void;
}
export declare const IMPROV_BLE_SERVICE = "00467768-6228-2272-4663-277478268000";
export declare const IMPROV_BLE_CURRENT_STATE_CHARACTERISTIC = "00467768-6228-2272-4663-277478268001";
export declare const IMPROV_BLE_ERROR_STATE_CHARACTERISTIC = "00467768-6228-2272-4663-277478268002";
export declare const IMPROV_BLE_RPC_COMMAND_CHARACTERISTIC = "00467768-6228-2272-4663-277478268003";
export declare const IMPROV_BLE_RPC_RESULT_CHARACTERISTIC = "00467768-6228-2272-4663-277478268004";
export declare const IMPROV_BLE_CAPABILITIES_CHARACTERISTIC = "00467768-6228-2272-4663-277478268005";
export declare type State = "CONNECTING" | "IMPROV-STATE" | "ERROR";
export interface ImprovState {
    state: Omit<State, "IMPROV-STATE"> | keyof typeof ImprovCurrentState | "UNKNOWN";
}
export declare enum ImprovCurrentState {
    AUTHORIZATION_REQUIRED = 1,
    AUTHORIZED = 2,
    PROVISIONING = 3,
    PROVISIONED = 4
}
export declare const enum ImprovErrorState {
    NO_ERROR = 0,
    INVALID_RPC_PACKET = 1,
    UNKNOWN_RPC_COMMAND = 2,
    UNABLE_TO_CONNECT = 3,
    NOT_AUTHORIZED = 4,
    UNKNOWN_ERROR = 255
}
export declare const enum ImprovRPCCommand {
    SEND_WIFI_SETTINGS = 1,
    IDENTIFY = 2
}
export interface ImprovRPCResult {
    command: ImprovRPCCommand;
    values: string[];
}
export declare const hasIdentifyCapability: (capabilities: number) => boolean;
declare global {
    interface HTMLElementEventMap {
        "state-changed": CustomEvent<ImprovState>;
    }
}
