/// <reference types="web-bluetooth" />
import { ImprovCurrentState, ImprovErrorState, ImprovRPCCommand, ImprovRPCResult, Logger } from "./const";
export declare class ImprovBluetoothLE extends EventTarget {
    device: BluetoothDevice;
    logger: Logger;
    currentState?: ImprovCurrentState | undefined;
    errorState: ImprovErrorState;
    RPCResult?: ImprovRPCResult;
    capabilities: number;
    nextUrl: string | undefined;
    private _currentStateChar?;
    private _errorStateChar?;
    private _rpcCommandChar?;
    private _rpcResultChar?;
    private _rpcFeedback?;
    constructor(device: BluetoothDevice, logger: Logger);
    get name(): string | undefined;
    initialize(): Promise<void>;
    close(): void;
    identify(): void;
    provision(ssid: string, password: string): Promise<string | undefined>;
    sendRPCWithResponse(command: ImprovRPCCommand, data: Uint8Array): Promise<ImprovRPCResult>;
    sendRPC(command: ImprovRPCCommand, data: Uint8Array): void;
    private _handleImprovCurrentStateChange;
    private _handleImprovErrorStateChange;
    private _handleImprovRPCResultChange;
}
