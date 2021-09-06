import { createMMApi, createTokenAApi, createTokenBApi, createVaultAApi, createVaultBApi, mintTokenAToVaultAApi, mintTokenBToVaultBApi, sendLamportToMMApi, sendTokenAToMMApi } from "./serum-api";

/*export async function mintTokenAStep(selectedWallet , connection) {  
    return mintTokenAApi(selectedWallet , connection);
}
export async function mintTokenBStep(selectedWallet , connection) {  
    return mintTokenBApi(selectedWallet , connection);
}*/
export async function createTokenAStep(selectedWallet , connection) {  
    return createTokenAApi(selectedWallet , connection);
}
export async function createVaultAStep(selectedWallet) {  
    return createVaultAApi(selectedWallet);
}
export async function mintTokenAToVaultAStep(selectedWallet) {  
    return mintTokenAToVaultAApi(selectedWallet );
}
export async function createTokenBStep(selectedWallet , connection) {  
    return createTokenBApi(selectedWallet , connection);
}
export async function createVaultBStep(selectedWallet,connection) {  
    return createVaultBApi(selectedWallet,connection);
}
export async function mintTokenBToVaultBStep(selectedWallet) {  
    return mintTokenBToVaultBApi(selectedWallet);
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
