import { createMMApi, mintTokenAApi,mintTokenBApi, sendLamportToMMApi, sendTokenAToMMApi } from "./serum-api";

export async function mintTokenAStep(selectedWallet , connection) {  
    return mintTokenAApi(selectedWallet , connection);
}
export async function mintTokenBStep(selectedWallet , connection) {  
    return mintTokenBApi(selectedWallet , connection);
}
export async function createMMStep() {  
    return createMMApi();
}
export async function sendLamportToMMStep(selectedWallet , connection) {  
    return sendLamportToMMApi(selectedWallet , connection);
}
export async function sendTokenAToMMStep(selectedWallet , connection) {  
    return sendTokenAToMMApi(selectedWallet , connection);
}
