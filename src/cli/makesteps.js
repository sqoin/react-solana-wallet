/**
 * Exercises the token program
 *
 * @flow
 */

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
}

export async function mintToken(selectedWallet , connection) {  
  return createMint(selectedWallet , connection);
}

export async function createNewAccount(selectedWallet , connection) {  
  return createAccount(selectedWallet , connection);
}

export async function createMintTo(selectedWallet , connection) {  
  return mintTo();
}

export async function createTransfer(selectedWallet , connection) {  
  return transfer();
}



