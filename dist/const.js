export const IMPROV_BLE_SERVICE = "00467768-6228-2272-4663-277478268000";
export const IMPROV_BLE_CURRENT_STATE_CHARACTERISTIC = "00467768-6228-2272-4663-277478268001";
export const IMPROV_BLE_ERROR_STATE_CHARACTERISTIC = "00467768-6228-2272-4663-277478268002";
export const IMPROV_BLE_RPC_COMMAND_CHARACTERISTIC = "00467768-6228-2272-4663-277478268003";
// <command ID><total length><length of string 1><string 1>[<string 2 length≥, <string 2>]<CS>
export const IMPROV_BLE_RPC_RESULT_CHARACTERISTIC = "00467768-6228-2272-4663-277478268004";
export const IMPROV_BLE_CAPABILITIES_CHARACTERISTIC = "00467768-6228-2272-4663-277478268005";
export var ImprovCurrentState;
(function (ImprovCurrentState) {
    ImprovCurrentState[ImprovCurrentState["AUTHORIZATION_REQUIRED"] = 1] = "AUTHORIZATION_REQUIRED";
    ImprovCurrentState[ImprovCurrentState["AUTHORIZED"] = 2] = "AUTHORIZED";
    ImprovCurrentState[ImprovCurrentState["PROVISIONING"] = 3] = "PROVISIONING";
    ImprovCurrentState[ImprovCurrentState["PROVISIONED"] = 4] = "PROVISIONED";
})(ImprovCurrentState || (ImprovCurrentState = {}));
export const hasIdentifyCapability = (capabilities) => (capabilities & 1) === 1;
