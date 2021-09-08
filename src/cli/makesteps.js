/**
 * Exercises the token program
 *
 * @flow
 */

import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import {
  loadTokenProgram,
  createMint,
  createAccount,
  createAssociatedAccount,
  transfer,
  transferChecked,
  transferCheckedAssociated,
  approveRevoke,
  failOnApproveOverspend,
  setAuthority,
  mintTo,
  mintToChecked,
  multisig,
  burn,
  burnChecked,
  freezeThawAccount,
  closeAccount,
  nativeToken,
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
  allTokenAccountsByOwner
  ,allProgrammSwapOwner,
  allAccountSwapByMint,
  mintMultisig,
  mintMultisig2

} from './token-test';

export async function makeSteps(selectedWallet) {
  console.log('Run test: loadTokenProgram');
  await loadTokenProgram(selectedWallet);
  console.log('Run test: createMint');
 
  console.log('Run test: createAccount');
  await createAccount();
  console.log('Run test: createAssociatedAccount');
  await createAssociatedAccount();
  console.log('Run test: mintTo');
  await mintTo();
  console.log('Run test: mintToChecked');
  await mintToChecked();
  console.log('Run test: transfer');
  await transfer();
  console.log('Run test: transferChecked');
  await transferChecked();
  console.log('Run test: transferCheckedAssociated');
  await transferCheckedAssociated();
  console.log('Run test: approveRevoke');
  await approveRevoke();
  console.log('Run test: failOnApproveOverspend');
  await failOnApproveOverspend();
  console.log('Run test: setAuthority');
  await setAuthority();
  console.log('Run test: burn');
  await burn();
  console.log('Run test: burnChecked');
  await burnChecked();
  console.log('Run test: freezeThawAccount');
  await freezeThawAccount();
  console.log('Run test: closeAccount');
  await closeAccount();
  console.log('Run test: multisig');
  await multisig();
  console.log('Run test: nativeToken');
  await nativeToken();
  console.log('Success\n');
  await createTokenA();
  console.log("suc")
  await createNewAccountTokenA()
}




export async function createTokenA(selectedWallet , connection) {  
  return createTokenSwapA(selectedWallet , connection);
}




export async function createTokenB(selectedWallet , connection) {  
  return createTokenSwapB(selectedWallet , connection);
}

export async function createNewAccountTokenA(selectedWallet , connection) {  
  return createAccountTokenSwapA(selectedWallet , connection);
}
export async function createNewAccountTokenB(selectedWallet , connection) {  
  return createAccountTokenSwapB(selectedWallet , connection);
}
export async function mintTokenA(selectedWallet , connection,mintAddress, accountAddress) {  
  return createMintTokenA(selectedWallet , connection,mintAddress,accountAddress);
}
export async function mintTokenB(selectedWallet , connection,mintAddress, accountAddress) {  
  return createMintTokenB(selectedWallet , connection,mintAddress, accountAddress);
}

export async function createPoolToken(selectedWallet , connection,autorithy) {  
  return createPoolTokenSwap(selectedWallet , connection,autorithy);
}
export async function createSwapTokens(selectedWallet, connection,mintA,mintB,accountA,accountB,poolToken,feeAccount,accountPool,autorithy) {  
  return swapToken(selectedWallet, connection,mintA,mintB,accountA,accountB,poolToken,feeAccount,accountPool,autorithy);
}

export async function createSwap(selectedWallet,connection){

  return swap(selectedWallet,connection)
}
export async function getTokenAccountsByOwnerSolet (selectedWallet,connection){
  return allTokenAccountsByOwner(selectedWallet,connection)
}
export async function getProgrammSwapOwner(selectedWallet,connection){
  return allProgrammSwapOwner(selectedWallet,connection)
}
export async function getAccountSwapByMint (selectedWallet,connection){
  return allAccountSwapByMint(selectedWallet,connection)
}
/************************************************************************************************ */
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


