// @flow


import {
  Account,
  Connection,
  PublicKey,
  clusterApiUrl,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

import {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  NATIVE_MINT,

} from '../client/token';
import {
  TokenSwap
} from '../swap/index'

import Wallet from '@project-serum/sol-wallet-adapter';

import { newAccountWithLamports, newAccountWithLamports1 } from '../client/util/new-account-with-lamports';

import { newAccountWithLamports3 } from '../swap/util/new-account-with-lamports';
import { sleep } from '../client/util/sleep';
import { Store } from './store';
const TOKEN_SWAP_PROGRAM_ID: PublicKey = new PublicKey(
  '5e2zZzHS8P1kkXQFVoBN6tVN15QBUHMDisy6mxVwVYSz',
);
const SWAP_PROGRAM_OWNER_FEE_ADDRESS = "HfoTxFR1Tm6kGmWgYWD6J7YHVy1UwqSULUGVLXkJqaKN";

// Loaded token program's program id
const programId = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const associatedProgramId = new PublicKey("Fxer83fa7cJF3CBS8EDtbKEbkM1gqnPqLZbRQZZae4Cf");
let wallet: Wallet;
let mintA: Token;
let mintB: Token;
let minntB: Token;
let curveParameters: Numberu64;
// Accounts setup in createMint and used by all subsequent tests
let testMintAuthority: Account;
let testTokenSwap: TokenSwap;
let testToken: Token;
let poolToken: Token;
let tokenAccountA: PublicKey;
let tokenAccountB: PublicKey;
let feeAccount: PublicKey;
let authority: PublicKey;
let accountPool: PublicKey;
let nonce: Number;
let payer: Account;
let testTokenDecimals: number = 2;
let createAccountProgramm :Account= new Account();;
let tokenMint : Token;


  // Pool fees
  const TRADING_FEE_NUMERATOR = 25;
  const TRADING_FEE_DENOMINATOR = 10000;
  const OWNER_TRADING_FEE_NUMERATOR = 5;
  const OWNER_TRADING_FEE_DENOMINATOR = 10000;
  const OWNER_WITHDRAW_FEE_NUMERATOR = SWAP_PROGRAM_OWNER_FEE_ADDRESS ? 0 : 1;
  const OWNER_WITHDRAW_FEE_DENOMINATOR = SWAP_PROGRAM_OWNER_FEE_ADDRESS ? 0 : 6;
  const HOST_FEE_NUMERATOR = 20;
  const HOST_FEE_DENOMINATOR = 100;
  // Initial amount in each swap token
  let currentSwapTokenA = 1000000;
  let currentSwapTokenB = 1000000;
// Accounts setup in createAccount and used by all subsequent tests
let testAccountOwner: Account;
let testAccount: PublicKey;
let owner: Account;
// let swapPayer:Account;
function assert(condition, message) {
  if (!condition) {
    console.log(Error().stack + ':token-test.js');
    throw message || 'Assertion failed';
  }
}


async function didThrow(obj, func, args): Promise<boolean> {
  try {
    await func.apply(testToken, args);
  } catch (e) {
    return true;
  }
  return false;
}



let connection;
async function getConnection(): Promise<Connection> {
  if (connection) return connection;
  const network = clusterApiUrl('devnet');
  connection = new Connection(network, 'recent');
  const version = await connection.getVersion();

  return connection;
}


async function GetPrograms(connection: Connection): Promise<void> {

  programId = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
  associatedProgramId = new PublicKey("Fxer83fa7cJF3CBS8EDtbKEbkM1gqnPqLZbRQZZae4Cf");
  let info;
  info = await connection.getAccountInfo(programId);
  assert(info != null);
  info = await connection.getAccountInfo(associatedProgramId);
  assert(info != null);

}

export async function loadTokenProgram(selectedWallet): Promise<void> {
  wallet = selectedWallet;
  const connection = await getConnection();
  await GetPrograms(connection);

  console.log('Token Program ID', programId.toString());
  console.log('Associated Token Program ID', associatedProgramId.toString());
}

export async function createMint(selectedWallet, connection): Promise<void> {

  //const payer =  wallet.publicKey; // await newAccountWithLamports(connection, 1000000000 /* wag */);
  testMintAuthority = new Account();
  programId = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
  associatedProgramId = new PublicKey("Fxer83fa7cJF3CBS8EDtbKEbkM1gqnPqLZbRQZZae4Cf");
  testToken = await Token.createMint(
    connection,
    selectedWallet,
    testMintAuthority.publicKey,
    testMintAuthority.publicKey,
    testTokenDecimals,
    programId,
  );
  // HACK: override hard-coded ASSOCIATED_TOKEN_PROGRAM_ID with corresponding
  // custom test fixture
  testToken.associatedProgramId = associatedProgramId;

  const mintInfo = await testToken.getMintInfo();
  if (mintInfo.mintAuthority !== null) {
    assert(mintInfo.mintAuthority.equals(testMintAuthority.publicKey));
  } else {
    assert(mintInfo.mintAuthority !== null);
  }
  assert(mintInfo.supply.toNumber() === 0);
  assert(mintInfo.decimals === testTokenDecimals);
  assert(mintInfo.isInitialized === true);
  if (mintInfo.freezeAuthority !== null) {
    assert(mintInfo.freezeAuthority.equals(testMintAuthority.publicKey));
  } else {
    assert(mintInfo.freezeAuthority !== null);
  }

  return mintInfo;
}
export async function swapToken(selectedWallet, connection,mintA,mintB,accountA,accountB,poolToken,feeAccount,accountPool,autorithy): Promise<void> {


  // [95,214,128,34,18,164,154,241,35,95,234,185,216,118,40,65,242,115,5,210,130,217,119,39,96,224,165,206,163,227,255,13,109,16,141,79,216,210,106,68,147,152,240,170,137,40,174,195,23,121,207,82,14,68,129,96,180,73,142,49,138,73,209,161]
  // let createAccountProgramm=new Account([86,  26, 243,  72,  46, 135, 186,  23,  31, 215, 229,43,  54,  89, 206, 222,  82,   6, 231, 212, 212, 226,184, 211, 107, 147, 180, 138,  57, 108, 182,  46, 185,33, 232, 144,  77,  70,  77, 145, 151, 152, 188,  19,78,  73,  32,  89, 236, 171,  90,  44, 120,  71, 202,142, 214, 179,  38,  85,  71, 103, 145, 193]);
  // swapPayer=new Account([])

  console.log("poolToken:"+poolToken,
    "mintA:"+mintA,
    "mintB"+mintB)
  testTokenSwap = await TokenSwap.createTokenSwap(
    connection,
    selectedWallet,
    createAccountProgramm,
    autorithy,
    accountA,
    accountB,
    poolToken,
    mintA,
    mintB,
    feeAccount,
    accountPool,
    TOKEN_SWAP_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    nonce,
    TRADING_FEE_NUMERATOR,
    TRADING_FEE_DENOMINATOR,
    OWNER_TRADING_FEE_NUMERATOR,
    OWNER_TRADING_FEE_DENOMINATOR,
    OWNER_WITHDRAW_FEE_NUMERATOR,
    OWNER_WITHDRAW_FEE_DENOMINATOR,
    HOST_FEE_NUMERATOR,
    HOST_FEE_DENOMINATOR,
    0,
    curveParameters,
  );
   console.log("token swap ="+testTokenSwap.tokenSwap)
     console.log('loading token swap');
  //   const fetchedTokenSwap = await TokenSwap.loadTokenSwap(
  //     connection,
  //     createAccountProgramm.publicKey,
  //     TOKEN_SWAP_PROGRAM_ID,
  //     swapPayer,
  //   );
  // console.log("**** begin **** info token swap ")
  // console.log("address tokenSwap ="+fetchedTokenSwap.tokenSwap+" authority +"+fetchedTokenSwap.authority
  // +"curveType ="+fetchedTokenSwap.curveType+" feeAccount ="+fetchedTokenSwap.feeAccount+" hostFeeDenominator ="+fetchedTokenSwap.hostFeeDenominator+" hostFeeNumerator ="+fetchedTokenSwap.hostFeeNumerator+" mintA ="+fetchedTokenSwap.mintA+"mintB ="+fetchedTokenSwap.mintB+" tokenAccountA ="+fetchedTokenSwap.tokenAccountA+" tokenAccountB ="+
  // fetchedTokenSwap.tokenAccountB+" poolToken "+fetchedTokenSwap.poolToken+" tokenProgrammId ="+fetchedTokenSwap.tokenProgramId+" tokenProgrammSwapId ="+fetchedTokenSwap.swapProgramId);
  // console.log("**** End *******")

  return testTokenSwap;


}
export async function createTokenSwapA(selectedWallet, connection): Promise<void> {
  // createAccountProgramm = new Account();
  [authority, nonce] = await PublicKey.findProgramAddress(
    [createAccountProgramm.publicKey.toBuffer()],
    TOKEN_SWAP_PROGRAM_ID,
  )

  let token = new Token(
    connection,
    selectedWallet.publicKey,
    TOKEN_PROGRAM_ID,
    selectedWallet)

  // let poolToken = await token.createMint(
  //   connection,
  //   selectedWallet,
  //   selectedWallet.publicKey,
  //   null,
  //   testTokenDecimals,
  //   TOKEN_PROGRAM_ID,
  // );
  // owner = await newAccountWithLamports1(connection, 1000000000);

  mintA = await token.createMint(
    connection,
    selectedWallet,
    selectedWallet.publicKey,
    null,
    testTokenDecimals,
    programId,
  );
  // let ret = [];
  let ret= { "mintA": mintA.publicKey, "authority": authority.toBase58(),"nonce":nonce};
  // ret.push({ "mintA": mintA, "authority": authority.toBase58(), "owner": owner })
  console.log("mintA" + mintA.publicKey.toBase58())
  // let info= await mintA.getAccountInfo()
  // const mintInfo = await mintA.getMintInfo();
  // console.log("mintA"+mintInfo.publicKey)
  console.log(ret)
  return ret;
}
export async function createTokenSwapB(selectedWallet, connection): Promise<void> {

 
  
  let token = new Token(
    connection,
    selectedWallet.publicKey,
    TOKEN_PROGRAM_ID,
    selectedWallet)


  mintB = await token.createMint(
    connection,
    selectedWallet,
    
    selectedWallet.publicKey,
    null,
    testTokenDecimals,
    programId,
  );
  // HACK: override hard-coded ASSOCIATED_TOKEN_PROGRAM_ID with corresponding
  // custom test fixture
  // mintB.associatedProgramId = associatedProgramId;
  // let info= await mintA.getAccountInfo()
  // console.log("test")
  //   const mintInfo = await mintB.getMintInfo();
  // console.log("mintB" + mintB.publicKey.toBase58())

  return mintB;
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
 


export async function createPoolTokenSwap(selectedWallet, connection): Promise<void> {

  const ownerKey = SWAP_PROGRAM_OWNER_FEE_ADDRESS || owner.publicKey.toString();
  // [authority, nonce] = await PublicKey.findProgramAddress(
  //   [createAccountProgramm.publicKey.toBuffer()],
  //   TOKEN_SWAP_PROGRAM_ID,
  // )

  let token = new Token(
    connection,
    selectedWallet.publicKey,
    TOKEN_PROGRAM_ID,
    selectedWallet)

   poolToken = await token.createMint(
    connection,
    selectedWallet,
    authority,
    null,
    testTokenDecimals,
    TOKEN_PROGRAM_ID,
  );
  console.log("poolToken: "+poolToken.publicKey.toBase58())


  // await timeout(10000);
  let  feeAccount = await poolToken.createAccount(new PublicKey(ownerKey));
  console.log("feeAccount: "+feeAccount.toBase58())
  
  
  
  // await timeout(10000);
  let  accountPool = await poolToken.createAccount(selectedWallet.publicKey);
 



  console.log("accountPool: "+accountPool.toBase58())

  let infoPool = { "poolToken": poolToken.publicKey, "accountPool": accountPool, "feeAccount": feeAccount }

  return infoPool;

}

export async function createAccountTokenSwapA(): Promise<void> {

  // createAccountProgramm=new Account([95,214,128,34,18,164,154,241,35,95,234,185,216,118,40,65,242,115,5,210,130,217,119,39,96,224,165,206,163,227,255,13,109,16,141,79,216,210,106,68,147,152,240,170,137,40,174,195,23,121,207,82,14,68,129,96,180,73,142,49,138,73,209,161]);

  // testAccountOwner = new Account();
  console.log("authority" + authority)

  tokenAccountA = await mintA.createAccount(authority);

  // const accountInfo = await mintA.getAccountInfo(tokenAccountA);


  /* // you can create as many accounts as with same owner
   const testAccount2 = await testToken.createAccount(
     testAccountOwner.publicKey,
   );
   assert(!testAccount2.equals(testAccount));*/
  console.log("accounta" + tokenAccountA)
  return tokenAccountA;

}



export async function createAccountTokenSwapB(): Promise<void> {

  tokenAccountB = await mintB.createAccount(authority);




  const accountInfo = await mintB.getAccountInfo(tokenAccountB);

  return tokenAccountB;
}
export async function createMintTokenA(selectedWallet,connection,mintAddress,accountAddress): Promise<void> {
  
 
    let testToken = new Token(
      connection,
      new PublicKey(mintAddress),
      new PublicKey( TOKEN_PROGRAM_ID),
      selectedWallet
  );
  
    // await testToken.mintTo(testAccount, testMintAuthority, [], 1000);
    await testToken.mintTo(accountAddress, selectedWallet, [], 1000);
    const mintInfo = await testToken.getAccountInfo(new PublicKey(accountAddress))
    console.log(mintInfo)
  
    return  mintInfo;
  
  // console.log("wallet"+selectedWallet.publicKey)
  // await mintA.mintTo(tokenAccountA, selectedWallet.publicKey, [], 1000);
  
  // // const mintInfo = await mintA.getMintInfo();

  // let accountInfo;
  // accountInfo = await mintA.getAccountInfo(tokenAccountA);
  // return accountInfo;
}
export async function createMintTokenB(selectedWallet,connection,mintAddress,accountAddress): Promise<void> {
   
  let testToken = new Token(
    connection,
    new PublicKey(mintAddress),
    new PublicKey( TOKEN_PROGRAM_ID),
    selectedWallet
);

  // await testToken.mintTo(testAccount, testMintAuthority, [], 1000);
  await testToken.mintTo(accountAddress, selectedWallet, [], 1000);
  const mintInfo = await testToken.getAccountInfo(new PublicKey(accountAddress))
  console.log(mintInfo)

  return  mintInfo;
  // let accountInfo;
  // accountInfo = await mintB.getAccountInfo(tokenAccountB);
  // console.log("****************** before MintB ***********************")
  // console.log("The address of this account " + accountInfo.address);
  // console.log("The mint associated with this account " + accountInfo.mint)
  // console.log("Owner of this account " + accountInfo.owner);
  // console.log("Amount of tokens this account holds " + accountInfo.amount);
  // console.log("The delegate for this account " + accountInfo.delegate)
  // console.log("The delegate for this account " + accountInfo.delegatedAmount)
  // console.log("****************** end before MintB ***********************")
  // await mintB.mintTo(tokenAccountB, owner, [], 1000);

  // const mintInfo = await mintB.getMintInfo();
  // assert(mintInfo.supply.toNumber() === 1000);

  // accountInfo = await mintB.getAccountInfo(tokenAccountB);
  // console.log("****************** afterMintB ***********************")
  // console.log("The address of this account " + accountInfo.address);
  // console.log("The mint associated with this account " + accountInfo.mint)
  // console.log("Owner of this account " + accountInfo.owner);
  // console.log("Amount of tokens this account holds " + accountInfo.amount);
  // console.log("The delegate for this account " + accountInfo.delegate)
  // console.log("The delegate for this account " + accountInfo.delegatedAmount)
  // console.log("****************** end afterMintB ***********************")
  // assert(accountInfo.amount.toNumber() === 1000);

  // return accountInfo;
}

export async function swap(selectedWallet,connection,feeAccount,tokenSwapPubkey) {
  let userAccountA = await mintA.createAccount(selectedWallet.publicKey)
  await mintA.mintTo(userAccountA, selectedWallet, [], 100000);
  /***GHOST */
  const userTransferAuthority = new Account([155, 200, 249, 167, 10, 23, 75, 131, 118, 125, 114, 216, 128, 104, 178, 124, 197, 52, 254, 20, 115, 17, 181, 113, 249, 97, 206, 128, 236, 197, 223, 136, 12, 128, 101, 121, 7, 177, 87, 233, 105, 253, 150, 154, 73, 9, 56, 54, 157, 240, 189, 68, 189, 52, 172, 228, 134, 89, 160, 189, 52, 26, 149, 130]);
  await mintA.approve(
    userAccountA,
    userTransferAuthority.publicKey,
    selectedWallet,
    [],
    100000,
  );
  let userAccountB = await mintB.createAccount(selectedWallet.publicKey)
  // await mintB.mintTo(userAccountB,owner,1000)
  // mintB.approve(userAccountB,userTransfertAuthority,owner,[],10)
  let poolAccount = SWAP_PROGRAM_OWNER_FEE_ADDRESS ? await poolToken.createAccount(selectedWallet.publicKey): null; //account pool

 // let  accountPool = await poolToken.createAccount(selectedWallet.publicKey);
  let programIdHello = new PublicKey("FRTtufPDTq76ZBTMif3uHpWPBiq7L7k592p7hJCscYVs")
  let [programAddress, nonce1] = await PublicKey.findProgramAddress(
    [userTransferAuthority.publicKey.toBuffer()],
    programIdHello,
  );
  //testTokenSwap.swap(userAccountA,tokenAccountA,tokenAccountB,userAccountB,poolAccount,userTransfertAuthority,10,0)
  const keys = [{ pubkey:tokenSwapPubkey, isSigner: false, isWritable: true },
  { pubkey: authority, isSigner: false, isWritable: true },  //authority 
  { pubkey: userTransferAuthority.publicKey, isSigner: true, isWritable: true },
  { pubkey: userAccountA, isSigner: false, isWritable: true },
  { pubkey: tokenAccountA, isSigner: false, isWritable: true },
  { pubkey: tokenAccountB, isSigner: false, isWritable: true },
  { pubkey: userAccountB, isSigner: false, isWritable: true },
  { pubkey: poolToken.publicKey, isSigner: false, isWritable: true },
  { pubkey: feeAccount, isSigner: false, isWritable: true },
  { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: true },
  { pubkey: poolAccount, isSigner: false, isWritable: true },
  { pubkey: programAddress, isSigner: false, isWritable: true },
  { pubkey: TOKEN_SWAP_PROGRAM_ID, isSigner: false, isWritable: true },
  { pubkey: userTransferAuthority.publicKey, isSigner: false, isWritable: false },
  ]

  const instruction = new TransactionInstruction({
    keys,
    programId:programIdHello,
    data: Buffer.from([nonce1]), // All instructions are hellos

  });
  const transaction = new Transaction().add(instruction);
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash()
  ).blockhash;

  transaction.feePayer =selectedWallet.publicKey;

  //transaction.setSigners(payer.publicKey, mintAccount.publicKey );
  const signers = [userTransferAuthority];
  transaction.partialSign(...signers);

  let signed = await selectedWallet.signTransaction(transaction);
  
 //   addLog('Got signature, submitting transaction');
    let signature = await connection.sendRawTransaction(signed.serialize());

    await connection.confirmTransaction(signature, 'max');
  
  /*await sendAndConfirmTransaction(
    connection,
   transaction,
    [payer, userTransferAuthority],

  );*/
}

function isAccount(accountOrPublicKey: any): boolean {
  return 'publicKey' in accountOrPublicKey;
}
///************** get token accounts by owner  */

export async function allTokenAccountsByOwner(
  selectedWallet, connection
) {
  var result = {};
  result = await connection.getTokenAccountsByOwner(new PublicKey("Cat1TQkytXTmxQL4uDGjL3FruyvwLNaiZuVPANQ9wpgz"),

    { "programId": new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }

  );
  // console.log(JSON.stringify(result))
  return result;

}
/***********get programm owner */

export async function allProgrammSwapOwner() {

}
/******* get prgramma account  bny mint */
export async function allAccountSwapByMint() {

}







/************************************************************************************************** */
export async function createAccount(): Promise<void> {
  testAccountOwner = new Account();

  testAccount = await testToken.createAccount(testAccountOwner.publicKey);
  const accountInfo = await testToken.getAccountInfo(testAccount);
  assert(accountInfo.mint.equals(testToken.publicKey));
  assert(accountInfo.owner.equals(testAccountOwner.publicKey));
  assert(accountInfo.amount.toNumber() === 0);
  assert(accountInfo.delegate === null);
  assert(accountInfo.delegatedAmount.toNumber() === 0);
  assert(accountInfo.isInitialized === true);
  assert(accountInfo.isFrozen === false);
  assert(accountInfo.isNative === false);
  assert(accountInfo.rentExemptReserve === null);
  assert(accountInfo.closeAuthority === null);

  /* // you can create as many accounts as with same owner
   const testAccount2 = await testToken.createAccount(
     testAccountOwner.publicKey,
   );
   assert(!testAccount2.equals(testAccount));*/

  return accountInfo;
}




export async function createAssociatedAccount(): Promise<void> {
  let info;
  const connection = await getConnection();

  const owner = new Account();
  const associatedAddress = await Token.getAssociatedTokenAddress(
    associatedProgramId,
    programId,
    testToken.publicKey,
    owner.publicKey,
  );

  // associated account shouldn't exist
  info = await connection.getAccountInfo(associatedAddress);
  assert(info == null);

  const createdAddress = await testToken.createAssociatedTokenAccount(
    owner.publicKey,
  );
  assert(createdAddress.equals(associatedAddress));

  // associated account should exist now
  info = await testToken.getAccountInfo(associatedAddress);
  assert(info != null);
  assert(info.mint.equals(testToken.publicKey));
  assert(info.owner.equals(owner.publicKey));
  assert(info.amount.toNumber() === 0);

  // creating again should cause TX error for the associated token account
  assert(
    await didThrow(testToken, testToken.createAssociatedTokenAccount, [
      owner.publicKey,
    ]),
  );
}

export async function mintTo(): Promise<void> {
  await testToken.mintTo(testAccount, testMintAuthority, [], 1000);

  const mintInfo = await testToken.getMintInfo();
  assert(mintInfo.supply.toNumber() === 1000);

  const accountInfo = await testToken.getAccountInfo(testAccount);
  assert(accountInfo.amount.toNumber() === 1000);

  return mintInfo;
}

export async function mintToChecked(): Promise<void> {
  assert(
    await didThrow(testToken, testToken.mintToChecked, [
      testAccount,
      testMintAuthority,
      [],
      1000,
      1,
    ]),
  );

  await testToken.mintToChecked(testAccount, testMintAuthority, [], 1000, 2);

  const mintInfo = await testToken.getMintInfo();
  assert(mintInfo.supply.toNumber() === 2000);

  const accountInfo = await testToken.getAccountInfo(testAccount);
  assert(accountInfo.amount.toNumber() === 2000);
}

export async function transfer(): Promise<void> {
  const destOwner = new Account();
  const dest = await testToken.createAccount(destOwner.publicKey);

  await testToken.transfer(testAccount, dest, testAccountOwner, [], 100);

  const mintInfo = await testToken.getMintInfo();
  assert(mintInfo.supply.toNumber() === 1000);

  let destAccountInfo = await testToken.getAccountInfo(dest);
  assert(destAccountInfo.amount.toNumber() === 100);

  let testAccountInfo = await testToken.getAccountInfo(testAccount);
  assert(testAccountInfo.amount.toNumber() === 900);

  return mintInfo;
}

export async function transferChecked(): Promise<void> {
  const destOwner = new Account();
  const dest = await testToken.createAccount(destOwner.publicKey);

  assert(
    await didThrow(testToken, testToken.transferChecked, [
      testAccount,
      dest,
      testAccountOwner,
      [],
      100,
      testTokenDecimals - 1,
    ]),
  );

  await testToken.transferChecked(
    testAccount,
    dest,
    testAccountOwner,
    [],
    100,
    testTokenDecimals,
  );

  const mintInfo = await testToken.getMintInfo();
  assert(mintInfo.supply.toNumber() === 2000);

  let destAccountInfo = await testToken.getAccountInfo(dest);
  assert(destAccountInfo.amount.toNumber() === 100);

  let testAccountInfo = await testToken.getAccountInfo(testAccount);
  assert(testAccountInfo.amount.toNumber() === 1800);
}

export async function transferCheckedAssociated(): Promise<void> {
  const dest = new Account().publicKey;
  let associatedAccount;

  associatedAccount = await testToken.getOrCreateAssociatedAccountInfo(dest);
  assert(associatedAccount.amount.toNumber() === 0);

  await testToken.transferChecked(
    testAccount,
    associatedAccount.address,
    testAccountOwner,
    [],
    123,
    testTokenDecimals,
  );

  associatedAccount = await testToken.getOrCreateAssociatedAccountInfo(dest);
  assert(associatedAccount.amount.toNumber() === 123);
}

export async function approveRevoke(): Promise<void> {
  const delegate = new Account().publicKey;

  await testToken.approve(testAccount, delegate, testAccountOwner, [], 42);

  let testAccountInfo = await testToken.getAccountInfo(testAccount);
  assert(testAccountInfo.delegatedAmount.toNumber() === 42);
  if (testAccountInfo.delegate === null) {
    throw new Error('delegate should not be null');
  } else {
    assert(testAccountInfo.delegate.equals(delegate));
  }

  await testToken.revoke(testAccount, testAccountOwner, []);

  testAccountInfo = await testToken.getAccountInfo(testAccount);
  assert(testAccountInfo.delegatedAmount.toNumber() === 0);
  if (testAccountInfo.delegate !== null) {
    throw new Error('delegate should be null');
  }
}

export async function failOnApproveOverspend(): Promise<void> {
  const owner = new Account();
  const account1 = await testToken.createAccount(owner.publicKey);
  const account2 = await testToken.createAccount(owner.publicKey);
  const delegate = new Account();

  await testToken.transfer(testAccount, account1, testAccountOwner, [], 10);

  await testToken.approve(account1, delegate.publicKey, owner, [], 2);

  let account1Info = await testToken.getAccountInfo(account1);
  assert(account1Info.amount.toNumber() == 10);
  assert(account1Info.delegatedAmount.toNumber() == 2);
  if (account1Info.delegate === null) {
    throw new Error('delegate should not be null');
  } else {
    assert(account1Info.delegate.equals(delegate.publicKey));
  }

  await testToken.transfer(account1, account2, delegate, [], 1);

  account1Info = await testToken.getAccountInfo(account1);
  assert(account1Info.amount.toNumber() == 9);
  assert(account1Info.delegatedAmount.toNumber() == 1);

  await testToken.transfer(account1, account2, delegate, [], 1);

  account1Info = await testToken.getAccountInfo(account1);
  assert(account1Info.amount.toNumber() == 8);
  assert(account1Info.delegate === null);
  assert(account1Info.delegatedAmount.toNumber() == 0);

  assert(
    await didThrow(testToken, testToken.transfer, [
      account1,
      account2,
      delegate,
      [],
      1,
    ]),
  );
}

export async function setAuthority(): Promise<void> {
  const newOwner = new Account();
  await testToken.setAuthority(
    testAccount,
    newOwner.publicKey,
    'AccountOwner',
    testAccountOwner,
    [],
  );
  assert(
    await didThrow(testToken, testToken.setAuthority, [
      testAccount,
      newOwner.publicKey,
      'AccountOwner',
      testAccountOwner,
      [],
    ]),
  );
  await testToken.setAuthority(
    testAccount,
    testAccountOwner.publicKey,
    'AccountOwner',
    newOwner,
    [],
  );
}

export async function burn(): Promise<void> {
  let accountInfo = await testToken.getAccountInfo(testAccount);
  const amount = accountInfo.amount.toNumber();

  await testToken.burn(testAccount, testAccountOwner, [], 1);

  accountInfo = await testToken.getAccountInfo(testAccount);
  assert(accountInfo.amount.toNumber() == amount - 1);
}

export async function burnChecked(): Promise<void> {
  let accountInfo = await testToken.getAccountInfo(testAccount);
  const amount = accountInfo.amount.toNumber();

  assert(
    await didThrow(testToken, testToken.burnChecked, [
      testAccount,
      testAccountOwner,
      [],
      1,
      1,
    ]),
  );

  await testToken.burnChecked(testAccount, testAccountOwner, [], 1, 2);

  accountInfo = await testToken.getAccountInfo(testAccount);
  assert(accountInfo.amount.toNumber() == amount - 1);
}

export async function freezeThawAccount(): Promise<void> {
  let accountInfo = await testToken.getAccountInfo(testAccount);
  const amount = accountInfo.amount.toNumber();

  await testToken.freezeAccount(testAccount, testMintAuthority, []);

  const destOwner = new Account();
  const dest = await testToken.createAccount(destOwner.publicKey);

  assert(
    await didThrow(testToken, testToken.transfer, [
      testAccount,
      dest,
      testAccountOwner,
      [],
      100,
    ]),
  );

  await testToken.thawAccount(testAccount, testMintAuthority, []);

  await testToken.transfer(testAccount, dest, testAccountOwner, [], 100);

  let testAccountInfo = await testToken.getAccountInfo(testAccount);
  assert(testAccountInfo.amount.toNumber() === amount - 100);
}

export async function closeAccount(): Promise<void> {
  const closeAuthority = new Account();

  await testToken.setAuthority(
    testAccount,
    closeAuthority.publicKey,
    'CloseAccount',
    testAccountOwner,
    [],
  );
  let accountInfo = await testToken.getAccountInfo(testAccount);
  if (accountInfo.closeAuthority === null) {
    assert(accountInfo.closeAuthority !== null);
  } else {
    assert(accountInfo.closeAuthority.equals(closeAuthority.publicKey));
  }

  const dest = await testToken.createAccount(new Account().publicKey);
  const remaining = accountInfo.amount.toNumber();

  // Check that accounts with non-zero token balance cannot be closed
  assert(
    await didThrow(testToken, testToken.closeAccount, [
      testAccount,
      dest,
      closeAuthority,
      [],
    ]),
  );

  const connection = await getConnection();
  let tokenRentExemptAmount;
  let info = await connection.getAccountInfo(testAccount);
  if (info != null) {
    tokenRentExemptAmount = info.lamports;
  } else {
    throw new Error('Account not found');
  }

  // Transfer away all tokens
  await testToken.transfer(testAccount, dest, testAccountOwner, [], remaining);

  // Close for real
  await testToken.closeAccount(testAccount, dest, closeAuthority, []);

  info = await connection.getAccountInfo(testAccount);
  assert(info === null);

  let destInfo = await connection.getAccountInfo(dest);
  if (destInfo !== null) {
    assert(destInfo.lamports === 2 * tokenRentExemptAmount);
  } else {
    throw new Error('Account not found');
  }

  let destAccountInfo = await testToken.getAccountInfo(dest);
  assert(destAccountInfo.amount.toNumber() === remaining);
}

export async function multisig(): Promise<void> {
  const m = 2;
  const n = 5;

  let signerAccounts = [];
  for (var i = 0; i < n; i++) {
    signerAccounts.push(new Account());
  }
  let signerPublicKeys = [];
  signerAccounts.forEach(account => signerPublicKeys.push(account.publicKey));
  const multisig = await testToken.createMultisig(m, signerPublicKeys);
  const multisigInfo = await testToken.getMultisigInfo(multisig);
  assert(multisigInfo.m === m);
  assert(multisigInfo.n === n);
  assert(multisigInfo.signer1.equals(signerPublicKeys[0]));
  assert(multisigInfo.signer2.equals(signerPublicKeys[1]));
  assert(multisigInfo.signer3.equals(signerPublicKeys[2]));
  assert(multisigInfo.signer4.equals(signerPublicKeys[3]));
  assert(multisigInfo.signer5.equals(signerPublicKeys[4]));

  const multisigOwnedAccount = await testToken.createAccount(multisig);
  const finalDest = await testToken.createAccount(multisig);

  await testToken.mintTo(multisigOwnedAccount, testMintAuthority, [], 1000);

  // Transfer via multisig
  await testToken.transfer(
    multisigOwnedAccount,
    finalDest,
    multisig,
    signerAccounts,
    1,
  );
  await sleep(500);
  let accountInfo = await testToken.getAccountInfo(finalDest);
  assert(accountInfo.amount.toNumber() == 1);

  // Approve via multisig
  {
    const delegate = new PublicKey(0);
    await testToken.approve(
      multisigOwnedAccount,
      delegate,
      multisig,
      signerAccounts,
      1,
    );
    const accountInfo = await testToken.getAccountInfo(multisigOwnedAccount);
    assert(accountInfo.delegate != null);
    if (accountInfo.delegate != null) {
      assert(accountInfo.delegate.equals(delegate));
      assert(accountInfo.delegatedAmount.toNumber() == 1);
    }
  }

  // SetAuthority of account via multisig
  {
    const newOwner = new PublicKey(0);
    await testToken.setAuthority(
      multisigOwnedAccount,
      newOwner,
      'AccountOwner',
      multisig,
      signerAccounts,
    );
    const accountInfo = await testToken.getAccountInfo(multisigOwnedAccount);
    assert(accountInfo.owner.equals(newOwner));
  }
}

export async function nativeToken(): Promise<void> {
  const connection = await getConnection();
  // this user both pays for the creation of the new token account
  // and provides the lamports to wrap
  payer = new Account([154, 155, 110, 10, 215, 247, 77, 101, 78, 22, 138, 92, 50, 193, 239, 103, 198, 82, 67, 161, 255, 3, 76, 5, 142, 6, 49, 166, 75, 110, 109, 247, 56, 64, 177, 222, 238, 169, 65, 249, 178, 65, 251, 34, 236, 93, 194, 184, 113, 65, 164, 76, 25, 238, 12, 188, 93, 192, 45, 7, 241, 146, 222, 241]);

  const lamportsToWrap = 1000000000;

  const token = new Token(connection, NATIVE_MINT, programId, payer);
  const owner = new Account();
  const native = await Token.createWrappedNativeAccount(
    connection,
    programId,
    owner.publicKey,
    payer,
    lamportsToWrap,
  );
  let accountInfo = await token.getAccountInfo(native);
  assert(accountInfo.isNative);

  // check that the new account has wrapped native tokens.
  assert(accountInfo.amount.toNumber() === lamportsToWrap);

  let balance;
  let info = await connection.getAccountInfo(native);
  if (info != null) {
    balance = info.lamports;
  } else {
    throw new Error('Account not found');
  }

  const balanceNeeded = await connection.getMinimumBalanceForRentExemption(0);
  const dest = await newAccountWithLamports(connection, balanceNeeded);
  await token.closeAccount(native, dest.publicKey, owner, []);
  info = await connection.getAccountInfo(native);
  if (info != null) {
    throw new Error('Account not burned');
  }
  info = await connection.getAccountInfo(dest.publicKey);
  if (info != null) {
    assert(info.lamports == balanceNeeded + balance);
  } else {
    throw new Error('Account not found');
  }
}




// create mint multisignature 

export async function createMintMulti(selectedWallet , connection): Promise<void> {

let multisigAccount = new PublicKey("7owzsQm3T8rirScNC8RDEd3qdJJTzGETKqte6eHL1XTG") ;
  owner = await newAccountWithLamports1(connection, 1000000000);
  let token = new Token(
    connection,
    selectedWallet.publicKey,
    TOKEN_PROGRAM_ID,
    selectedWallet)
  tokenMint = await token.createMintMult(
  connection,
  selectedWallet,
  multisigAccount,
 null,
  testTokenDecimals,
  programId,
);
console.log ("tokenMint : " +tokenMint.publicKey);
  
  return tokenMint.publicKey;
}


export async function mintMultisig(selectedWallet , connection , mintAccount): Promise<void> {

let multisigAccount = new PublicKey("7owzsQm3T8rirScNC8RDEd3qdJJTzGETKqte6eHL1XTG") ;
let bacem = new Account([199,65,249,220,57,154,21,249,242,73,177,149,213,25,3,168,104,183,74,253,81,70,92,47,192,62,6,141,52,101,24,21,169,20,74,222,240,77,149,169,87,66,86,103,206,65,12,49,58,163,18,5,206,125,132,230,175,225,43,88,168,53,252,130]);
let karima = new Account([167,50,120,172,248,193,71,240,199,250,89,145,194,18,3,25,151,29,8,80,146,252,36,77,250,33,211,238,11,23,82,230,54,202,38,6,10,56,138,236,27,68,24,143,81,245,200,105,170,29,114,192,69,102,192,39,139,16,127,222,37,48,241,213]);
let ameni = new Account([30,222,11,88,198,158,102,243,139,33,202,137,184,109,167,171,176,222,235,56,200,71,40,167,132,193,209,219,79,68,130,186,52,228,115,179,132,138,20,197,97,35,0,221,22,185,205,138,133,129,80,16,8,117,241,69,177,52,174,66,161,230,192,141]);
let spluMultisig = new PublicKey("5xdN1WLKNepbUjZKfs9Lc44qNqzv9FJ2ZoDhQjRcmMdG");
let token = new Token(
  connection,
  mintAccount,
  TOKEN_PROGRAM_ID,
  selectedWallet)

   let res = await token.mintToMultisig(
  connection,
  selectedWallet,
  spluMultisig,
  mintAccount,
  multisigAccount,
  [bacem , ameni ],
  10,
  programId,
);
//const mintInfo = await token.getAccountInfo(new PublicKey(spluMultisig))
//console.log(mintInfo)

return  res;
}


export async function mintMultisig2 (selectedWallet, connection ,mintAccount ,rawTransaction): Promise<void> {
  console.log ("second : transaction " , rawTransaction);

  let token = new Token(
    connection,
    mintAccount,
    TOKEN_PROGRAM_ID,
    selectedWallet)
  
     await token.mintToMultisig2(
    connection,
    selectedWallet,
    rawTransaction,
    programId,
  );

}









export async function createAccountMulti(selectedWallet , connection , mintPubKey): Promise<void> {
  
  // createAccountProgramm=new Account([95,214,128,34,18,164,154,241,35,95,234,185,216,118,40,65,242,115,5,210,130,217,119,39,96,224,165,206,163,227,255,13,109,16,141,79,216,210,106,68,147,152,240,170,137,40,174,195,23,121,207,82,14,68,129,96,180,73,142,49,138,73,209,161]);
  let Accountowner  = new Account([253, 105, 193, 173, 55, 108, 145, 101, 186, 22, 187, 172, 156, 119, 173, 35, 25, 99, 80, 68, 92, 204, 232, 243, 67, 169, 199, 7, 218, 94, 225, 17, 173, 31, 39, 116, 250, 166, 211, 3, 213, 13, 179, 50, 47, 240, 7, 164, 48, 110, 143, 141, 244, 242, 74, 210, 185, 203, 0, 4, 138, 99, 110, 251]);
  // testAccountOwner = new Account();
 // console.log("authority"+authority)

 let token = new Token(
  connection,
  mintPubKey,
  TOKEN_PROGRAM_ID,
  selectedWallet)


  tokenAccountA = await token.createAccount(Accountowner.publicKey );
 
  //const accountInfo = await mintA.getAccountInfo(tokenAccountA);


 /* // you can create as many accounts as with same owner
  const testAccount2 = await testToken.createAccount(
    testAccountOwner.publicKey,
  );
  assert(!testAccount2.equals(testAccount));*/
  console.log("accounta"+tokenAccountA);
  return tokenAccountA;
 
}

