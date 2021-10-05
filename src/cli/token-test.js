// @flow

import {
  Account,

  PublicKey,

  TransactionInstruction,
  Transaction,

} from '@solana/web3.js';
import * as BufferLayout from 'buffer-layout';
import * as Layout from './layout';

import {
  Token,
  ORIGINE_PROGRAMM_ID,
  

  u64
} from "../client/token";
import {
  TokenSwap
} from '../swap/index'



import {newAccountWithLamports1 } from '../client/util/new-account-with-lamports';



const TOKEN_SWAP_PROGRAM_ID: PublicKey = new PublicKey(
  '5e2zZzHS8P1kkXQFVoBN6tVN15QBUHMDisy6mxVwVYSz',
);
const SWAP_PROGRAM_OWNER_FEE_ADDRESS = "HfoTxFR1Tm6kGmWgYWD6J7YHVy1UwqSULUGVLXkJqaKN";

// Loaded token program's program id
const programId = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const associatedProgramId = new PublicKey("Fxer83fa7cJF3CBS8EDtbKEbkM1gqnPqLZbRQZZae4Cf");
;
let mintA: Token;
let mintB: Token;

let curveParameters: Numberu64;

let testMintAuthority: Account;
let testTokenSwap: TokenSwap;
let testToken: Token;
let poolToken: Token;
let tokenAccountA: PublicKey;
let tokenAccountB: PublicKey;

let authority: PublicKey;

let nonce: Number;

let testTokenDecimals: number = 2;
let createAccountProgramm :Account= new Account();
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

let testAccountOwner: Account;
let testAccount: PublicKey;
let owner: Account;

function assert(condition, message) {
  if (!condition) {
    console.log(Error().stack + ':token-test.js');
    throw message || 'Assertion failed';
  }
}
/****************************SWAP*******************************/


export async function createTokenSwapA(selectedWallet, connection): Promise<void> {
  // createAccountProgramm = new Account();
  [authority, nonce] = await PublicKey.findProgramAddress(
    [createAccountProgramm.publicKey.toBuffer()],
    TOKEN_SWAP_PROGRAM_ID,
  )

  // let token = new Token(
  //   connection,
  //   selectedWallet.publicKey,
  //   ORIGINE_PROGRAMM_ID,
  //   selectedWallet)


  mintA = await Token.createMint(
    connection,
    selectedWallet,
    selectedWallet.publicKey,
    null,
    testTokenDecimals,
    programId,
    programId,
    programId
  );

  let ret= { "mintA": mintA.publicKey, "authority": authority.toBase58(),"nonce":nonce};
 
  // console.log("mintA" + mintA.publicKey.toBase58())
  
  return ret;
}
export async function createTokenSwapB(selectedWallet, connection): Promise<void> {

  [authority, nonce] = await PublicKey.findProgramAddress(
    [createAccountProgramm.publicKey.toBuffer()],
    TOKEN_SWAP_PROGRAM_ID,
  )

  
  // let token = new Token(
  //   connection,
  //   selectedWallet.publicKey,
  //   ORIGINE_PROGRAMM_ID,
  //   selectedWallet)
  

  
  mintB = await Token.createMint(
    connection,
    selectedWallet,
    selectedWallet.publicKey,
    null,
    testTokenDecimals,
    programId,
    programId,
    programId
  );


  let ret= { "mintB": mintB.publicKey, "authority": authority.toBase58(),"nonce":nonce};
  return ret;
}
export async function createAccountTokenSwapA(selectedWallet, connection,mint,autority): Promise<void> {
  console.log("authority" + autority)
  let token = new Token(
    connection,
   mint,
   new PublicKey( ORIGINE_PROGRAMM_ID),
    selectedWallet)

  tokenAccountA = await token.createAccount(autority);
  console.log("accounta" + tokenAccountA)
  return tokenAccountA;

}
export async function createAccountTokenSwapB(selectedWallet, connection,mint,autority): Promise<void> {
  let token = new Token(
    connection,
   mint,
    new PublicKey(ORIGINE_PROGRAMM_ID),
    selectedWallet)
  tokenAccountB = await token.createAccount(autority);
  return tokenAccountB;
}


export async function createMintTokenA(selectedWallet,connection,mintAddress,accountAddress): Promise<void> {
  console.log("mintadress"+mintAddress)
  let testToken = new Token(
    connection,
    mintAddress,
    new PublicKey(ORIGINE_PROGRAMM_ID),
    selectedWallet
);
console.log("testToken"+testToken)
  await testToken.mintTo(accountAddress, selectedWallet, [], 1000);
  const mintInfo = await testToken.getAccountInfo(accountAddress)
  console.log("mintInfo"+mintInfo)

  return  mintInfo;
}
export async function createMintTokenB(selectedWallet,connection,mintAddress,accountAddress): Promise<void> {
 
let testToken = new Token(
  connection,
  mintAddress,
  new PublicKey(ORIGINE_PROGRAMM_ID),
  selectedWallet
);
await testToken.mintTo(accountAddress, selectedWallet, [], 1000);
const mintInfo = await testToken.getAccountInfo(accountAddress)
console.log(mintInfo)

return  mintInfo;

}


export async function createPoolTokenSwap(selectedWallet, connection, autority): Promise<void> {

  const ownerKey = SWAP_PROGRAM_OWNER_FEE_ADDRESS || owner.publicKey.toString();

  // let token = new Token(
  //   connection,
  //   selectedWallet.publicKey,
  //   new PublicKey(ORIGINE_PROGRAMM_ID),
  //   selectedWallet)

  poolToken = await Token.createMint(
    connection,
    selectedWallet,
   new PublicKey(autority),
    null,
    testTokenDecimals,
    programId,
    programId,
    programId
  );
  

let  feeAccount = await poolToken.createAccount(new PublicKey(ownerKey));
let  accountPool = await poolToken.createAccount(selectedWallet.publicKey);
let infoPool = { "poolToken": poolToken.publicKey, "accountPool": accountPool, "feeAccount": feeAccount }
 return infoPool;
}

export async function swapToken(selectedWallet, connection,minta,mintb,accounta,accountb,pooltoken,feeaccount,accountpool,autority,Nonce): Promise<void> {


  console.log("createAccountProgramm ",createAccountProgramm.publicKey.toBase58()," minta "+minta+" mintB "+mintb+" accounta "+accounta+" accountb "+accountb+" pooltoken "+pooltoken+" feeacoount "+feeaccount+" accountpool "+accountpool+" autority "+autority+" nonce "+Nonce)
    let tokenSwap=new TokenSwap(connection,null,null,null,pooltoken,feeaccount,autority,accounta,accountb, minta,mintb,null,null,null,null,null,null,null,null,null,selectedWallet)
    testTokenSwap = await tokenSwap.createTokenSwap(
      connection,
      selectedWallet,
      createAccountProgramm,
      autority,
     accounta,
   accountb,
     pooltoken,
      minta,
      mintb,
      feeaccount,
   accountpool,
      TOKEN_SWAP_PROGRAM_ID,
      new PublicKey(ORIGINE_PROGRAMM_ID),
      Nonce,
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
    
    return testTokenSwap;
  
  
  }

export async function swap(selectedWallet, connection,tokenSwapPubkey,minta,mintb,accounta,accountb,pooltoken,feeaccount,accountpool,autority) {
  console.log("createAccountProgramm ",createAccountProgramm.publicKey.toBase58()," minta "+minta+" mintB "+mintb+" accounta "+accounta+" accountb "+accountb+" pooltoken "+pooltoken+" feeacoount "+feeaccount+" accountpool "+accountpool+" autority "+autority)
  let token1= new Token(
    connection,
    minta,
    new PublicKey(ORIGINE_PROGRAMM_ID),
    selectedWallet)

    let userAccountA = await token1.createAccount(selectedWallet.publicKey);

  await token1.mintTo(userAccountA, selectedWallet, [], 100000);
 
  const userTransferAuthority = new Account([155, 200, 249, 167, 10, 23, 75, 131, 118, 125, 114, 216, 128, 104, 178, 124, 197, 52, 254, 20, 115, 17, 181, 113, 249, 97, 206, 128, 236, 197, 223, 136, 12, 128, 101, 121, 7, 177, 87, 233, 105, 253, 150, 154, 73, 9, 56, 54, 157, 240, 189, 68, 189, 52, 172, 228, 134, 89, 160, 189, 52, 26, 149, 130]);
  await token1.approve(
    userAccountA,
    userTransferAuthority.publicKey,
    selectedWallet,
    [],
    100000,
    connection
  );
  let tokenB = new Token(
    connection,
    mintb,
    new PublicKey(ORIGINE_PROGRAMM_ID),
    selectedWallet)
  let userAccountB = await tokenB.createAccount(selectedWallet.publicKey)
  
  let poolToken = new Token(
    connection,
 pooltoken,
 new PublicKey(ORIGINE_PROGRAMM_ID),
    selectedWallet)
  let poolAccount = SWAP_PROGRAM_OWNER_FEE_ADDRESS ? await poolToken.createAccount(selectedWallet.publicKey): null; //account pool
  let info;

  let programIdHello = new PublicKey("7TCZZ6GY1cvoMbmqEw1gDQH69ne5NFFmhQrq2eCbycet")
  let [programAddress, nonce1] = await PublicKey.findProgramAddress(
    [userTransferAuthority.publicKey.toBuffer()],
    programIdHello,
  );

  console.log("userAccountA" , userAccountA.toBase58());
  console.log("userAccountB" , userAccountB.toBase58());

  // const keys = [{ pubkey:tokenSwapPubkey, isSigner: false, isWritable: true },
  // { pubkey: new PublicKey(autority), isSigner: false, isWritable: true },  //authority 
  // { pubkey: userTransferAuthority.publicKey, isSigner: true, isWritable: true },
  // { pubkey: userAccountA, isSigner: false, isWritable: true },
  // { pubkey: accounta, isSigner: false, isWritable: true },
  // { pubkey: accountb, isSigner: false, isWritable: true },
  // { pubkey: userAccountB, isSigner: false, isWritable: true },
  // { pubkey: poolToken.publicKey, isSigner: false, isWritable: true },
  // { pubkey: feeaccount, isSigner: false, isWritable: true },
  // { pubkey: new PublicKey(ORIGINE_PROGRAMM_ID), isSigner: false, isWritable: true },
  // { pubkey: poolAccount, isSigner: false, isWritable: true },
  // { pubkey: programAddress, isSigner: false, isWritable: true },
  // { pubkey: TOKEN_SWAP_PROGRAM_ID, isSigner: false, isWritable: true },
  // { pubkey: userTransferAuthority.publicKey, isSigner: false, isWritable: false },
  // ]
console.log(accounta+"accounta")
  // let accountA=new PublicKey(accounta)
  // let accountB=new PublicKey(accountb)
  // let feeAccount=new PublicKey(feeaccount)

  const keys = [{ pubkey:tokenSwapPubkey, isSigner: false, isWritable: true },
    { pubkey: new PublicKey(autority), isSigner: false, isWritable: true },  //authority 
    { pubkey: userTransferAuthority.publicKey, isSigner: true, isWritable: true },
    { pubkey: userAccountA, isSigner: false, isWritable: true },
    { pubkey: accounta, isSigner: false, isWritable: true },
    { pubkey: accountb, isSigner: false, isWritable: true },
    { pubkey: userAccountB, isSigner: false, isWritable: true },
    { pubkey: poolToken.publicKey, isSigner: false, isWritable: true },
    { pubkey: feeaccount, isSigner: false, isWritable: true },
    { pubkey: programId , isSigner: false, isWritable: false},
    { pubkey: poolAccount, isSigner: false, isWritable: true },
    { pubkey: programAddress, isSigner: false, isWritable: false },
    { pubkey: TOKEN_SWAP_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: userTransferAuthority.publicKey, isSigner: false, isWritable: false },
    ]

  const instruction = new TransactionInstruction({
    keys,
    programId:programIdHello,
    data: Buffer.from([nonce1]), 

  });
  const transaction = new Transaction().add(instruction);
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash()
  ).blockhash;

  transaction.feePayer =selectedWallet.publicKey;


  const signers = [userTransferAuthority];
  transaction.partialSign(...signers);

  let signed = await selectedWallet.signTransaction(transaction);

    let signature = await connection.sendRawTransaction(signed.serialize());

    let x=await connection.confirmTransaction(signature, 'max');
    console.log("signature "+JSON.stringify(signature))
  console.log("xxxx "+JSON.stringify(x))
  console.log("************** Info Account A After swap *******************")


  return signature
}


///************** get token accounts by owner  */
//@ts-ignore
export const AccountOrigineLayout = BufferLayout.struct(
  [
    
    Layout.publicKey('mint'),
    Layout.publicKey('owner'),
    Layout.uint64('amount'),
    BufferLayout.u32('delegateOption'),
    Layout.publicKey('delegate'),
    BufferLayout.u8('state'),
    BufferLayout.u32('isNativeOption'),
    Layout.uint64('isNative'),
    Layout.uint64('delegatedAmount'),
    BufferLayout.u32('closeAuthorityOption'),
    Layout.publicKey('closeAuthority'),

    
  ],
);
function decodeOringineReponse(accountsInfo) {
   

  let list=[]

  accountsInfo.forEach((info) => {
      const data = Buffer.from(info.account.data);
      const accountInfo = AccountOrigineLayout.decode(data);
      
      accountInfo.address = new PublicKey(info.pubkey._bn).toBase58();
      console.log("adress"+new PublicKey(info.pubkey._bn).toBase58())
      
      accountInfo.amount = u64.fromBuffer(accountInfo.amount).toString();
      list.push(accountInfo)
    
  });
  return list;
}
export async function allTokenAccountsByOwner(
  selectedWallet, connection
) {
  var result = {};
  console.log("selectedWallet.publicKey"+selectedWallet.publicKey)
  result = await connection.getTokenAccountsByOwner(new PublicKey(selectedWallet.publicKey),

    { "programId": new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") },
    {
      "encoding": "jsonParsed"
    }

  );

  var accounts=decodeOringineReponse(result.value)
  return accounts;

}





/**************************************ENDSWAP************************************************************ */






/**************************************INITIATION PAGE********************************************************** */


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


  return accountInfo;
}

export async function mintTo(): Promise<void> {
  await testToken.mintTo(testAccount, testMintAuthority, [], 1000);

  const mintInfo = await testToken.getMintInfo();
  assert(mintInfo.supply.toNumber() === 1000);

  const accountInfo = await testToken.getAccountInfo(testAccount);
  assert(accountInfo.amount.toNumber() === 1000);

  return mintInfo;
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
// create mint multisignature 

export async function createMintMulti(selectedWallet , connection): Promise<void> {

let multisigAccount = new PublicKey("7owzsQm3T8rirScNC8RDEd3qdJJTzGETKqte6eHL1XTG") ;
  owner = await newAccountWithLamports1(connection, 1000000000);
  let token = new Token(
    connection,
    selectedWallet.publicKey,
    ORIGINE_PROGRAMM_ID,
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
  ORIGINE_PROGRAMM_ID,
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


return  res;
}

export async function mintMultisig2 (selectedWallet, connection ,mintAccount ,rawTransaction): Promise<void> {
  console.log ("second : transaction " , rawTransaction);

  let token = new Token(
    connection,
    mintAccount,
    ORIGINE_PROGRAMM_ID,
    selectedWallet)
  
     await token.mintToMultisig2(
    connection,
    selectedWallet,
    rawTransaction,
    programId,
  );

}

export async function createAccountMulti(selectedWallet , connection , mintPubKey): Promise<void> {
  
  
  let Accountowner  = new Account([253, 105, 193, 173, 55, 108, 145, 101, 186, 22, 187, 172, 156, 119, 173, 35, 25, 99, 80, 68, 92, 204, 232, 243, 67, 169, 199, 7, 218, 94, 225, 17, 173, 31, 39, 116, 250, 166, 211, 3, 213, 13, 179, 50, 47, 240, 7, 164, 48, 110, 143, 141, 244, 242, 74, 210, 185, 203, 0, 4, 138, 99, 110, 251]);


 let token = new Token(
  connection,
  mintPubKey,
  ORIGINE_PROGRAMM_ID,
  selectedWallet)


  tokenAccountA = await token.createAccount(Accountowner.publicKey );
 

  console.log("accounta"+tokenAccountA);
  return tokenAccountA;
 
}

export async function createMint(selectedWallet, connection): Promise<void> {
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