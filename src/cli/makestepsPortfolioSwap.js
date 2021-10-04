


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
} from './apisPortfolioSwap';



/********************************swapPage*******************************************/
export async function createTokenA(selectedWallet , connection) {  
  return createTokenSwapA(selectedWallet , connection);
}
export async function createTokenB(selectedWallet , connection) {  
  return createTokenSwapB(selectedWallet , connection);
}
export async function createNewAccountTokenA(selectedWallet, connection,mint,autority) {  
  return createAccountTokenSwapA(selectedWallet, connection,mint,autority);
}
export async function createNewAccountTokenB(selectedWallet, connection,mint,autority) {  
  return createAccountTokenSwapB(selectedWallet, connection,mint,autority);
}
export async function mintTokenA(selectedWallet , connection,mintAddress, accountAddress) {  
  return createMintTokenA(selectedWallet , connection,mintAddress,accountAddress);
}
export async function mintTokenB(selectedWallet , connection,mintAddress, accountAddress) {  
  return createMintTokenB(selectedWallet , connection,mintAddress, accountAddress);
}
export async function createPoolToken(selectedWallet, connection, autority) {  
  return createPoolTokenSwap(selectedWallet, connection, autority);
}
export async function createSwapTokens(selectedWallet, connection,minta,mintb,accounta,accountb,pooltoken,feeaccount,accountpool,autority,Nonce) {  
  return swapToken(selectedWallet, connection,minta,mintb,accounta,accountb,pooltoken,feeaccount,accountpool,autority,Nonce);
}

export async function createSwap(selectedWallet, connection,tokenSwapPubkey,minta,mintb,accounta,accountb,pooltoken,feeaccount,accountpool,autority){

  return swap(selectedWallet, connection,tokenSwapPubkey,minta,mintb,accounta,accountb,pooltoken,feeaccount,accountpool,autority)
}
export async function getTokenAccountsByOwnerSolet (selectedWallet,connection){
  return allTokenAccountsByOwner(selectedWallet,connection)
}


/**************************************INITIATION PAGE********************************************************** */
export async function createMintTo(selectedWallet , connection) {  
  return mintTo();
}
export async function createNewAccount(selectedWallet , connection) {  
  return createAccount(selectedWallet , connection);
}
export async function createTransfer(selectedWallet , connection) {  
  return transfer();
}

export async function mintToken(selectedWallet , connection) {  
  return createMint(selectedWallet , connection);
}

/***********************transfer multisigner ******************/

export async function createMintMultisigner(selectedWallet , connection) {  
  return createMintMulti(selectedWallet , connection);
}
export async function createAccountMultisigner(selectedWallet , connection , mintPubKey) {  
  return createAccountMulti(selectedWallet , connection , mintPubKey);
}
export async function mintToMultisig(selectedWallet , connection , mintAccount) {  
  return mintMultisig(selectedWallet , connection , mintAccount);
}
export async function mintToSig2(selectedWallet , connection , mintAccount ,rawTransaction) {  
  console.log ("first : transaction " , rawTransaction);
  return mintMultisig2(selectedWallet , connection , mintAccount ,rawTransaction);
}


