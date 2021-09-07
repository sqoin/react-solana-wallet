import { createMMApi, createTokenApi, createVaultApi, mintTokenToVaultApi, sendTokenApi, sendLamportApi } from "./serum-api";

/*export async function mintTokenAStep(selectedWallet , connection) {  
    return mintTokenAApi(selectedWallet , connection);
}
export async function mintTokenBStep(selectedWallet , connection) {  
    return mintTokenBApi(selectedWallet , connection);
}*/
export async function createTokenStep(selectedWallet , connection) {  
    return createTokenApi(selectedWallet , connection);
}
export async function createVaultStep(selectedWallet,connection,tokenPk) {  
    return createVaultApi(selectedWallet,connection,tokenPk);
}
export async function mintTokenToVaultStep(selectedWallet, connection, vault, tokenPk) {  
    return mintTokenToVaultApi(selectedWallet, connection, vault, tokenPk );
}
export async function createMMStep() {  
    return createMMApi();
}
export async function sendLamportToMMStep(selectedWallet , connection, to) {  
    return sendLamportApi(selectedWallet , connection, to);
}
export async function sendTokenToMMStep(selectedWallet , connection, tokenPk, vault, to) {  
    return sendTokenApi(selectedWallet , connection, tokenPk, vault, to);
}
