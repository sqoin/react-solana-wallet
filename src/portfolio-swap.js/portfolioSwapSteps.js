


import { createTokenApi, createVaultApi, mintTokenToVaultApi } from '../cli/serum-api';
import {
    createMint,
    createAccount,
    transfer,
    mintTo,
    createTokenSwapA,
    createAccountTokenSwapA,
    createMintTokenA,
    createTokenSwapB,
    createAccountTokenSwapB,
    createMintTokenB,
    createPoolTokenSwap,
    swapToken,
    swap,
    createMintMulti,
    createAccountMulti,
    allTokenAccountsByOwner,
    mintMultisig,
    mintMultisig2
  } from '../cli/token-test';
import { createpoolsApi, createSwapTokensApi, createToken, createVault, mintToken, swapApi } from './portfolio-swap-api';
  
 
  export async function createUserTokenStep(selectedWallet , connection) {  
    return createTokenApi(selectedWallet , connection);
  }

  export async function createUserAccountStep(selectedWallet , connection, tokenPK) {  
    return createVaultApi(selectedWallet , connection, tokenPK);
  }

  export async function mintUserTokenStep(selectedWallet , connection, vaultPk, tokenPK) {  
    return mintTokenToVaultApi(selectedWallet , connection, vaultPk, tokenPK);
  }

  export async function createTokenStep(selectedWallet , connection) {  
    return createToken(selectedWallet , connection);
  }

  export async function createNewAccountStep(selectedWallet, connection,mint,autority) {  
    return createVault(selectedWallet, connection,mint,autority);
  }
  
  export async function mintTokenStep(selectedWallet , connection,mintAddress, accountAddress) {  
    return mintToken(selectedWallet , connection,mintAddress,accountAddress);
  }

  export async function createPoolStep(selectedWallet, connection, accounts) {  
    return createpoolsApi(selectedWallet, connection, accounts);
  }
  export async function createSwapTokensStep(selectedWallet, connection,userToken, userVault, pools) {  
    return createSwapTokensApi(selectedWallet, connection,userToken, userVault, pools);
  }
  
  export async function swapStep(selectedWallet, connection,tokenSwapPubkey,minta,mintb,accounta,accountb,pooltoken,feeaccount,accountpool,autority){
    return swapApi(selectedWallet, connection,tokenSwapPubkey,minta,mintb,accounta,accountb,pooltoken,feeaccount,accountpool,autority)
  }
  
  