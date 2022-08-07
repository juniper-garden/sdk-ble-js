import { LitElement, PropertyValues, TemplateResult } from "lit";
import "./components/ib-dialog";
import "./components/ib-textfield";
import "./components/ib-button";
import "./components/ib-circular-progress";
import { ImprovState } from "./const";
import { ImprovBluetoothLE } from "./ble";
declare class ProvisionDialog extends LitElement {
    client: ImprovBluetoothLE;
    stateUpdateCallback: (state: ImprovState) => void;
    private _state;
    private _improvCurrentState?;
    private _improvErrorState;
    private _improvCapabilities;
    private _busy;
    private _error?;
    private _inputSSID;
    private _inputPassword;
    protected render(): TemplateResult<1>;
    _renderProgress(label: string): TemplateResult<1>;
    _renderMessage(icon: string, label: string, showClose: boolean): TemplateResult<1>;
    private _renderImprovAuthorized;
    private _renderImprovProvisioned;
    protected firstUpdated(changedProps: PropertyValues): void;
    private _connect;
    private _provision;
    private _identify;
    protected updated(changedProps: PropertyValues): void;
    private _handleClose;
    static styles: import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        "improv-wifi-provision-dialog": ProvisionDialog;
    }
}
export {};
