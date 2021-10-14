import {
  Token as SToken,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { expectTX } from "@saberhq/chai-solana";
import {
  createInitMintInstructions,
 TokenAmount,
  Token as sToken
} from "@saberhq/token-utils";
import { makeSDK } from "../quarry-farm/worspace"
import {
  Account,
  Connection,
  BpfLoader,
  PublicKey,
  BPF_LOADER_PROGRAM_ID,
  TransactionInstruction,
  Transaction,
  SYSVAR_CLOCK_PUBKEY,
  SystemProgram,
} from '@solana/web3.js';

import {
  Portfolio,
} from './utils/Portfolio';
import { Uint64Layout } from "./utils/layout";
import { NumberU64 } from "./utils/u64";
import * as BufferLayout from 'buffer-layout';
import {
  DEFAULT_FEE_DENOMINATOR,
  DEFAULT_FEE_NUMERATOR,
  Fees,
} from "./utils/fees";
import { Token } from '../client/token';
import { StableSwap } from "../saber/stable-swap";
import * as anchor from "@project-serum/anchor";
const { web3, BN } = anchor;
const DAILY_REWARDS_RATE = new BN(1_000000 * web3.LAMPORTS_PER_SOL);
const ANNUAL_REWARDS_RATE = DAILY_REWARDS_RATE.mul(new BN(365));
const rewardsShare = DAILY_REWARDS_RATE.div(new BN(10));
// Loaded token program's program id
let programId: PublicKey = new PublicKey("Bc2EsggSWKXnkzaA1dznwriYB3dA6f2sXivFSw64BgE9");
let associatedProgramId: PublicKey;
let portfolio: Portfolio;
let UserPortfolioAccount: Account;
let portfolioAddress: Account;
let ownerPortfolio: Account;
let splm1: Token;
const Provider = anchor.Provider;
const options = Provider.defaultOptions();
const userTransferAuthority = new Account([155, 200, 249, 167, 10, 23, 75, 131, 118, 125, 114, 216, 128, 104, 178, 124, 197, 52, 254, 20, 115, 17, 181, 113, 249, 97, 206, 128, 236, 197, 223, 136, 12, 128, 101, 121, 7, 177, 87, 233, 105, 253, 150, 154, 73, 9, 56, 54, 157, 240, 189, 68, 189, 52, 172, 228, 134, 89, 160, 189, 52, 26, 149, 130]);
const createAccountProgram = new Account([86, 26, 243, 72, 46, 135, 186, 23, 31, 215, 229, 43, 54, 89, 206, 222, 82, 6, 231, 212, 212, 226, 184, 211, 107, 147, 180, 138, 57, 108, 182, 46, 185, 33, 232, 144, 77, 70, 77, 145, 151, 152, 188, 19, 78, 73, 32, 89, 236, 171, 90, 44, 120, 71, 202, 142, 214, 179, 38, 85, 71, 103, 145, 193]);
//let programIdPortfolio = new PublicKey("Bc2EsggSWKXnkzaA1dznwriYB3dA6f2sXivFSw64BgE9")
const TOKEN_SWAP_PROGRAM_ID: PublicKey = new PublicKey(
  '5e2zZzHS8P1kkXQFVoBN6tVN15QBUHMDisy6mxVwVYSz',
);
export async function createPortfolioApi(myAccount, connection, splmAsset1str, amountAsset1, numberOfAsset, metaDataUrl, metaDataHashstr, periodAsset1): Promise<void> {
  console.log("start");

  portfolio = new Portfolio(
    connection,
    new PublicKey("6ykyxd7bZFnvEHq61vnd69BkU3gabiDmKGEQb4sGiPQG"), // devnet
    programId,
    myAccount
  );

  var metaDataHash = Buffer.from(metaDataHashstr);
  console.log("metaDataUrl  ", metaDataUrl);
  console.log("metaDataHash  ", metaDataHash);
  let splmAsset1 = new PublicKey(splmAsset1str)//
  console.log("period asset 1 ", periodAsset1);
  let assetToSoldIntoAsset1 = splmAsset1



  portfolioAddress = await portfolio.createPortfolio(myAccount, metaDataUrl, metaDataHash,
    numberOfAsset,
    amountAsset1, splmAsset1, periodAsset1, assetToSoldIntoAsset1 ,
  );

  console.log("************************************end info Portfolio Account ******************************")
  console.log("********************************************************************************************************");
  return portfolioAddress

}

export async function addAssetToPortfolioApi(myAccount, connection, splmAssetstr, amountAsset, portfolioAddressStr, assetToSoldIntoAssetstr, periodAsset): Promise<void> {
  console.log("start");

  //let amountAsset = 5;
  //local net 
  //let splmAsset1 = owner.publicKey;

  //let periodAsset = 973;
  portfolio = new Portfolio(
    connection,
    new PublicKey(portfolioAddressStr + ""), // devnet
    programId,
    myAccount
  );

  let assetToSoldIntoAsset = new PublicKey(assetToSoldIntoAssetstr);
  let splmAsset = new PublicKey(splmAssetstr)
  let portfolioAddress = new PublicKey(portfolioAddressStr + "")

  await portfolio.addAssetToPortfolio(portfolioAddressStr, myAccount, amountAsset,
    splmAsset, periodAsset, assetToSoldIntoAsset);
  return portfolioAddress

}

export async function createUserPortfolioApi(myAccount, connection, portfolioAddressStr): Promise<void> {
  console.log("start");

  let portfolio_address = new PublicKey(portfolioAddressStr);

  portfolio = new Portfolio(
    connection,
    new PublicKey(portfolioAddressStr), // devnet
    programId,
    myAccount
  );

  UserPortfolioAccount = await portfolio.createUserPortfolio(myAccount, portfolio_address);

  return UserPortfolioAccount

}


export async function depositPortfolioApi(myAccount, connection, portfolioAddress, UserPortfolioAccount,
  TOKEN_PROGRAM_ID, TOKEN_SWAP_PROGRAM_ID, amount, asset1, asset2, asset3) {
  let splmPRIMARY = new Token(
    connection,
    new PublicKey(asset1.minta),
    new PublicKey(TOKEN_PROGRAM_ID),
    myAccount)
  //await splmPRIMARY.mintTo(new PublicKey (asset1.spluPRIMARY), myAccount, [], 100000);



  let splmAsset1 = new Token(
    connection,
    new PublicKey(asset1.mintb),
    new PublicKey(TOKEN_PROGRAM_ID),
    myAccount)
  //await splmAsset1.mintTo(new PublicKey (asset1.managerAsset1), myAccount, [], 100000);

  let splmPRIMARY3 = new Token(
    connection,
    new PublicKey(asset3.minta),
    new PublicKey(TOKEN_PROGRAM_ID),
    myAccount)


  /* let splmAsset2= new Token(
     connection,
     new PublicKey(asset2.mintb),
     new PublicKey(ORIGINE_PROGRAMM_ID),
     myAccount)*/
  // await splmAsset2.mintTo(new PublicKey (asset2.managerAsset1), myAccount, [], 100000);

  /*  let managerPrimary2= new Token(
     connection,
     new PublicKey(asset2.minta),
     new PublicKey(ORIGINE_PROGRAMM_ID),
     myAccount)*/
  // await managerPrimary2.mintTo(new PublicKey (asset2.managerPRIMARY), myAccount, [], 100000);


  await splmPRIMARY.approve(
    new PublicKey(asset1.spluPRIMARY),
    userTransferAuthority.publicKey,
    myAccount,
    [],
    100000,
    connection
  );
  await splmPRIMARY3.approve(
    new PublicKey(asset3.spluPRIMARY),
    userTransferAuthority.publicKey,
    myAccount,
    [],
    100000,
    connection
  );

  /*await splmAsset1.approve(
    new PublicKey(asset3.spluAsset1),
    userTransferAuthority.publicKey,
    myAccount,
    [],
    100000,
    connection
  );*/


  let [programAddress, nonce] = await PublicKey.findProgramAddress(
    [createAccountProgram.publicKey.toBuffer()],
    programId,
  );



  const keys = [
    { pubkey: new PublicKey(portfolioAddress), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(UserPortfolioAccount), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(asset1.tokenSwap), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset1.autority), isSigner: false, isWritable: true },  //authority 
    { pubkey: userTransferAuthority.publicKey, isSigner: true, isWritable: true },
    { pubkey: new PublicKey(asset1.spluPRIMARY), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset1.managerPRIMARY), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset1.managerAsset1), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset1.spluAsset1), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset1.tokenPool), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset1.feeAccount), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(TOKEN_PROGRAM_ID), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(asset1.tokenAccountPool), isSigner: false, isWritable: true },
    { pubkey: programAddress, isSigner: false, isWritable: false },
    { pubkey: new PublicKey(TOKEN_SWAP_PROGRAM_ID), isSigner: false, isWritable: false },
    { pubkey: createAccountProgram.publicKey, isSigner: false, isWritable: false },
  ];

  const keys2 = [
    { pubkey: new PublicKey(portfolioAddress), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(UserPortfolioAccount), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(asset2.tokenSwap), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset2.autority), isSigner: false, isWritable: true },  //authority 
    { pubkey: userTransferAuthority.publicKey, isSigner: true, isWritable: true },
    { pubkey: new PublicKey(asset2.spluPRIMARY), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset2.managerPRIMARY), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset2.managerAsset1), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset2.spluAsset1), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset2.tokenPool), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset2.feeAccount), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(TOKEN_PROGRAM_ID), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(asset2.tokenAccountPool), isSigner: false, isWritable: true },
    { pubkey: programAddress, isSigner: false, isWritable: false },
    { pubkey: new PublicKey(TOKEN_SWAP_PROGRAM_ID), isSigner: false, isWritable: false },
    { pubkey: createAccountProgram.publicKey, isSigner: false, isWritable: false },
  ];

  const keys3 = [
    { pubkey: new PublicKey(portfolioAddress), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(UserPortfolioAccount), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(asset3.tokenSwap), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset3.autority), isSigner: false, isWritable: true },  //authority 
    { pubkey: userTransferAuthority.publicKey, isSigner: true, isWritable: true },
    { pubkey: new PublicKey(asset3.spluPRIMARY), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset3.managerPRIMARY), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset3.managerAsset1), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset3.spluAsset1), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset3.tokenPool), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset3.feeAccount), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(TOKEN_PROGRAM_ID), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(asset3.tokenAccountPool), isSigner: false, isWritable: true },
    { pubkey: programAddress, isSigner: false, isWritable: false },
    { pubkey: new PublicKey(TOKEN_SWAP_PROGRAM_ID), isSigner: false, isWritable: false },
    { pubkey: createAccountProgram.publicKey, isSigner: false, isWritable: false },
  ];

  const dataLayout = BufferLayout.struct([
    BufferLayout.u8('instruction'),
    BufferLayout.u8('amount_deposit'),
    BufferLayout.u8('nonce'),
  ]);

  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode({
    instruction: 17, // deposit instruction
    amount_deposit: amount,
    nonce
  },
    data,
  );


  const instruction = new TransactionInstruction({
    keys,
    programId: programId,
    data,

  });
  const instruction2 = new TransactionInstruction({
    keys: keys2,
    programId: programId,
    data,
  });

  const instruction3 = new TransactionInstruction({
    keys: keys3,
    programId: programId,
    data,
  });

  const instruction4 = Portfolio.addSpluToUserPortfolioInstruction(
    programId,
    myAccount.publicKey,
    new PublicKey(UserPortfolioAccount),
    new PublicKey(asset1.spluAsset1),
    new PublicKey(asset2.spluAsset1),
    new PublicKey(asset3.spluAsset1),
    new PublicKey("11111111111111111111111111111111"),
    new PublicKey("11111111111111111111111111111111"),
    new PublicKey("11111111111111111111111111111111"),
    new PublicKey("11111111111111111111111111111111"),
    new PublicKey("11111111111111111111111111111111"),
    new PublicKey("11111111111111111111111111111111"),
    new PublicKey("11111111111111111111111111111111"),
  )

  const transaction = new Transaction().add(instruction, instruction2);
  const transaction1 = new Transaction().add(instruction3, instruction4);
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash()
  ).blockhash;

  transaction1.recentBlockhash = (
    await connection.getRecentBlockhash()
  ).blockhash;

  transaction.feePayer = myAccount.publicKey;
  transaction1.feePayer = myAccount.publicKey;


  const signers = [userTransferAuthority];
  transaction.partialSign(...signers);
  transaction1.partialSign(...signers);

  let signed = await myAccount.signTransaction(transaction);
  let signed1 = await myAccount.signTransaction(transaction1);

  let signature = "";
  let signature1 = "";
  signature = await connection.sendRawTransaction(signed.serialize());
  signature1 = await connection.sendRawTransaction(signed1.serialize());

  if (signature != "" && signature1 != "") {
    let x = await connection.confirmTransaction(signature, 'max');
    let x1 = await connection.confirmTransaction(signature1, 'max');
    console.log("signature " + JSON.stringify(signature))
    console.log("signature " + JSON.stringify(signature1))
    console.log("resultConfirmTrx " + JSON.stringify(x))
    console.log("resultConfirmTrx1 " + JSON.stringify(x1))
  }
  else {
    console.log("there is some thing wrong !!")
  }
  console.log("************** Info Account A After swap *******************")


  return signature



}


export async function addSpluToUserPortfolio(myAccount, connection, portfolioAddressStr, userPortfolio, splu1, splu2): Promise<void> {

  portfolio = new Portfolio(
    connection,
    new PublicKey(portfolioAddressStr), // devnet
    programId,
    myAccount
  );

  UserPortfolioAccount = await portfolio.addSpluToUserPortfolio(
    myAccount,
    new PublicKey(userPortfolio),
    new PublicKey(splu1),
    new PublicKey(splu2),
    new PublicKey("1111111111111111111111111111111111111111111"),
    new PublicKey("1111111111111111111111111111111111111111111"),
    new PublicKey("1111111111111111111111111111111111111111111"),
    new PublicKey("1111111111111111111111111111111111111111111"),
    new PublicKey("1111111111111111111111111111111111111111111"),
    new PublicKey("1111111111111111111111111111111111111111111"),
    new PublicKey("1111111111111111111111111111111111111111111"),
  );

}


export async function withdrawPortfolioApi(myAccount, connection, portfolioAddress, UserPortfolioAccount,
  TOKEN_PROGRAM_ID, TOKEN_SWAP_PROGRAM_ID, amount, asset1, asset2, asset3) {
  /*let splmPRIMARY= new Token(
    connection,
    new PublicKey(asset1.minta),
    new PublicKey(TOKEN_PROGRAM_ID),
    myAccount)*/
  //await splmPRIMARY.mintTo(new PublicKey (asset1.spluPRIMARY), myAccount, [], 100000);



  let splmAsset1 = new Token(
    connection,
    new PublicKey(asset1.mintb),
    new PublicKey(TOKEN_PROGRAM_ID),
    myAccount)
  //await splmAsset1.mintTo(new PublicKey (asset1.managerAsset1), myAccount, [], 100000);

  let splmAsset2 = new Token(
    connection,
    new PublicKey(asset2.mintb),
    new PublicKey(TOKEN_PROGRAM_ID),
    myAccount)
  // await splmAsset2.mintTo(new PublicKey (asset2.managerAsset1), myAccount, [], 100000);

  /*  let managerPrimary2= new Token(
     connection,
     new PublicKey(asset2.minta),
     new PublicKey(ORIGINE_PROGRAMM_ID),
     myAccount)*/
  // await managerPrimary2.mintTo(new PublicKey (asset2.managerPRIMARY), myAccount, [], 100000);


  /*await splmPRIMARY.approve(
    new PublicKey(asset1.spluPRIMARY),
    userTransferAuthority.publicKey,
    myAccount,
    [],
    100000,
    connection
  );*/

  await splmAsset1.approve(
    new PublicKey(asset1.spluAsset1),
    userTransferAuthority.publicKey,
    myAccount,
    [],
    100000,
    connection
  );
  await splmAsset2.approve(
    new PublicKey(asset2.spluAsset1),
    userTransferAuthority.publicKey,
    myAccount,
    [],
    100000,
    connection
  );


  let [programAddress, nonce] = await PublicKey.findProgramAddress(
    [createAccountProgram.publicKey.toBuffer()],
    programId,
  );



  const keys = [
    { pubkey: new PublicKey(portfolioAddress), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(UserPortfolioAccount), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(asset1.tokenSwap), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset1.autority), isSigner: false, isWritable: true },  //authority 
    { pubkey: userTransferAuthority.publicKey, isSigner: true, isWritable: true },
    { pubkey: new PublicKey(asset1.spluAsset1), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset1.managerAsset1), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset1.managerPRIMARY), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset1.spluPRIMARY), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset1.tokenPool), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset1.feeAccount), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(TOKEN_PROGRAM_ID), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(asset1.tokenAccountPool), isSigner: false, isWritable: true },
    { pubkey: programAddress, isSigner: false, isWritable: false },
    { pubkey: new PublicKey(TOKEN_SWAP_PROGRAM_ID), isSigner: false, isWritable: false },
    { pubkey: createAccountProgram.publicKey, isSigner: false, isWritable: false },
  ];

  const keys2 = [
    { pubkey: new PublicKey(portfolioAddress), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(UserPortfolioAccount), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(asset2.tokenSwap), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset2.autority), isSigner: false, isWritable: true },  //authority 
    { pubkey: userTransferAuthority.publicKey, isSigner: true, isWritable: true },
    { pubkey: new PublicKey(asset2.spluPRIMARY), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset2.managerPRIMARY), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset2.managerAsset1), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset2.spluAsset1), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset2.tokenPool), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(asset2.feeAccount), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(TOKEN_PROGRAM_ID), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(asset2.tokenAccountPool), isSigner: false, isWritable: true },
    { pubkey: programAddress, isSigner: false, isWritable: false },
    { pubkey: new PublicKey(TOKEN_SWAP_PROGRAM_ID), isSigner: false, isWritable: false },
    { pubkey: createAccountProgram.publicKey, isSigner: false, isWritable: false },
  ];


  const dataLayout = BufferLayout.struct([
    BufferLayout.u8('instruction'),
    BufferLayout.u8('amount_withdraw'),
    BufferLayout.u8('nonce'),
  ]);

  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode({
    instruction: 18, // deposit instruction
    amount_withdraw: amount,
    nonce
  },
    data,
  );


  const instruction = new TransactionInstruction({
    keys,
    programId: programId,
    data,

  });
  const instruction2 = new TransactionInstruction({
    keys: keys2,
    programId: programId,
    data,
  });

  const transaction = new Transaction().add(instruction, instruction2);
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash()
  ).blockhash;

  transaction.feePayer = myAccount.publicKey;


  const signers = [userTransferAuthority];
  transaction.partialSign(...signers);

  let signed = await myAccount.signTransaction(transaction);

  let signature = await connection.sendRawTransaction(signed.serialize());

  let x = await connection.confirmTransaction(signature, 'max');
  console.log("signature " + JSON.stringify(signature))
  console.log("xxxx " + JSON.stringify(x))
  console.log("************** Info Account A After swap *******************")


  return signature
}

/************************************** saber ************************************************************ */

export async function depositIntoLPToken(wallet, connection, asset1, PstableSwap1, PlpToken1, PuserPoolToken1, PtokenAccountA1, PtokenAccountB1, Pauthority1, asset2, PstableSwap2, PlpToken2, PuserPoolToken2, PtokenAccountA2, PtokenAccountB2, Pauthority2) {
  const programId = new PublicKey("6HDDmMvR4LGyXke43as8FiPJW1hnWi4cCw98ShJWeuop")

  let createAccountProgramm = new Account([86, 26, 243, 72, 46, 135, 186, 23, 31, 215, 229, 43, 54, 89, 206, 222, 82, 6, 231, 212, 212, 226, 184, 211, 107, 147, 180, 138, 57, 108, 182, 46, 185, 33, 232, 144, 77, 70, 77, 145, 151, 152, 188, 19, 78, 73, 32, 89, 236, 171, 90, 44, 120, 71, 202, 142, 214, 179, 38, 85, 71, 103, 145, 193]);
  let [programAddress, nonce] = await PublicKey.findProgramAddress(
    [createAccountProgramm.publicKey.toBuffer()],
    programId,
  );
  // token asset 1
  let PubstableSwapAsset1 = new PublicKey(PstableSwap1);
  let authorityAsset1 = new PublicKey(Pauthority1);
  console.log("authority =", Pauthority1);
  let mintAAsset1 = new Token(
    connection,
    new PublicKey(asset1.minta),
    TOKEN_PROGRAM_ID,
    wallet
  );
  let mintBAsset1 = new Token(
    connection,
    new PublicKey(asset1.mintb),
    TOKEN_PROGRAM_ID,
    wallet
  );
  // account asset 1
  let tokenAccountA = new PublicKey(PtokenAccountA1);
  let userAccountA = new PublicKey(asset1.spluPRIMARY);
  let tokenAccountB = new PublicKey(PtokenAccountB1);
  let userAccountB = new PublicKey(asset1.spluAsset1);
  // lp token  and user account pool asset 1
  let tokenPool = new Token(
    connection,
    new PublicKey(PlpToken1),
    TOKEN_PROGRAM_ID,
    wallet);
  let userPoolAccount = new PublicKey(PuserPoolToken1)
  // program id saber 
  let stableSwapProgramId = new PublicKey("2J67FeJ4CGjtunyvh3BtBsgEbQwkdpYhSD3ALZPK8fUY");
  let tokenAmountA = 1000;
  let tokenAmountB = 1000;
  let minimumPoolTokenAmount = 0;

  let ret = {};
  //instruction mint to and approve asset 1
  let instruction1 = await mintAAsset1.mintToInstruction(userAccountA, wallet, [], 7000000000);
  let instruction2 = await mintBAsset1.mintToInstruction(userAccountB, wallet, [], 7000000000);
  let instruction3 = await mintAAsset1.approveInstruction(userAccountA, authorityAsset1, wallet, [], 1000, connection);
  let instruction4 = await mintBAsset1.approveInstruction(userAccountB, authorityAsset1, wallet, [], 1000, connection);
 // sign transaction mint to and approve asset 1
  const transaction0 = new Transaction();
  transaction0.add(instruction1, instruction2, instruction3, instruction4);
  transaction0.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
  transaction0.feePayer = wallet.publicKey;
  let signed0 = await wallet.signTransaction(transaction0);
  let signature0 = "";
  signature0 = await connection.sendRawTransaction(signed0.serialize());
  //confirm transaction mint to and approve for asset 1 
 await connection.confirmTransaction(signature0, 'max');
  /* infoBefore = await mintA.getAccountInfo(tokenAccountA);
  console.log("amount tokenAccountA : " + infoBefore.amount.toNumber()); */
  console.log("****************************************");
  const keys = [
    { pubkey: PubstableSwapAsset1, isSigner: false, isWritable: true },
    { pubkey: authorityAsset1, isSigner: false, isWritable: true },
    { pubkey: userAccountA, isSigner: false, isWritable: true },
    { pubkey: userAccountB, isSigner: false, isWritable: true },
    { pubkey: tokenAccountA, isSigner: false, isWritable: true },
    { pubkey: tokenAccountB, isSigner: false, isWritable: true },
    { pubkey: tokenPool.publicKey, isSigner: false, isWritable: true },
    { pubkey: userPoolAccount, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: programAddress, isSigner: false, isWritable: false },
    { pubkey: createAccountProgramm.publicKey, isSigner: false, isWritable: false },
    { pubkey: stableSwapProgramId, isSigner: false, isWritable: false },

  ];
 
  let data = Buffer.from([nonce, tokenAmountA, tokenAmountB, minimumPoolTokenAmount]);
  //instruction asset 1
  const instruction = new TransactionInstruction({
    keys,
    programId,
    data, 
  });
 
  // sign transaction deposit into pool asset 1
  const transaction = new Transaction();
  transaction.add(instruction);
  transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
  transaction.feePayer = wallet.publicKey;
  let signed = await wallet.signTransaction(transaction);
  let signature = "";
  signature = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction(signature, 'max');

/******************asset 2 ****************/

 //token asset2
 let PubstableSwapAsset2 = new PublicKey(PstableSwap2);
 let authorityAsset2 = new PublicKey(Pauthority2);
 console.log("authority2 =", Pauthority2);
 let mintAAsset2 = new Token(
   connection,
   new PublicKey(asset2.minta),
   TOKEN_PROGRAM_ID,
   wallet
 );
 let mintBAsset2 = new Token(
   connection,
   new PublicKey(asset2.mintb),
   TOKEN_PROGRAM_ID,
   wallet
 );
 // account asset 2
 let tokenAccountA2 = new PublicKey(PtokenAccountA2);
 let userAccountA2 = new PublicKey(asset2.spluPRIMARY);
 let tokenAccountB2 = new PublicKey(PtokenAccountB2);
 let userAccountB2 = new PublicKey(asset2.spluAsset1);
  // lp token  and user account pool asset 2
  let tokenPool2 = new Token(
    connection,
    new PublicKey(PlpToken2),
    TOKEN_PROGRAM_ID,
    wallet);
  let userPoolAccount2 = new PublicKey(PuserPoolToken2)
    //instruction mint to and approve asset 2
    let instruction12 = await mintAAsset2.mintToInstruction(userAccountA2, wallet, [], 7000000000);
    let instruction22 = await mintBAsset2.mintToInstruction(userAccountB2, wallet, [], 7000000000);
    let instruction32 = await mintAAsset2.approveInstruction(userAccountA2, authorityAsset2, wallet, [], 1000, connection);
    let instruction42 = await mintBAsset2.approveInstruction(userAccountB2, authorityAsset2, wallet, [], 1000, connection);
   // sign transaction mint to and approve asset 2
  const transaction02 = new Transaction();
  transaction02.add(instruction12, instruction22, instruction32, instruction42);
  transaction02.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
  transaction02.feePayer = wallet.publicKey;
  let signed02 = await wallet.signTransaction(transaction02);
  let signature02 = "";
  signature02 = await connection.sendRawTransaction(signed02.serialize());
  //confirm transaction mint to and approve for asset 2
  await connection.confirmTransaction(signature02, 'max');
   const keys2 = [
    { pubkey: PubstableSwapAsset2, isSigner: false, isWritable: true },
    { pubkey: authorityAsset2, isSigner: false, isWritable: true },
    { pubkey: userAccountA2, isSigner: false, isWritable: true },
    { pubkey: userAccountB2, isSigner: false, isWritable: true },
    { pubkey: tokenAccountA2, isSigner: false, isWritable: true },
    { pubkey: tokenAccountB2, isSigner: false, isWritable: true },
    { pubkey: tokenPool2.publicKey, isSigner: false, isWritable: true },
    { pubkey: userPoolAccount2, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: programAddress, isSigner: false, isWritable: false },
    { pubkey: createAccountProgramm.publicKey, isSigner: false, isWritable: false },
    { pubkey: stableSwapProgramId, isSigner: false, isWritable: false },

  ]; 
  let data2 = Buffer.from([nonce, tokenAmountA, tokenAmountB, minimumPoolTokenAmount]);
   //instruction asset2
  const instructionDepositLP2 = new TransactionInstruction({
    keys:keys2,
    programId,
    data:data2, 
  }); 
   // sign transaction deposit into pool asset 2
  const transaction2 = new Transaction();
  transaction2.add(instructionDepositLP2);
  transaction2.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
  transaction2.feePayer = wallet.publicKey;
  let signed2 = await wallet.signTransaction(transaction2);
  let signature2 = "";
  signature2 = await connection.sendRawTransaction(signed2.serialize());
  let res = { "signatureAsset1": signature, "signatureAsset2": signature2 } 
  console.log(res)
  return res;

}

export async function createLpToken(wallet, connection, asset1, asset2) {
  let stableSwapProgramId = new PublicKey("2J67FeJ4CGjtunyvh3BtBsgEbQwkdpYhSD3ALZPK8fUY");
  let createAccountProgramm = new Account();
  let [authority, nonce] = await PublicKey.findProgramAddress(
    [createAccountProgramm.publicKey.toBuffer()],
    stableSwapProgramId
  );
  let createAccountProgramm2 = new Account();
  let [authority2, nonce2] = await PublicKey.findProgramAddress(
    [createAccountProgramm2.publicKey.toBuffer()],
    stableSwapProgramId
  );
  // pool token asset 1
  let retInstruction = await Token.createMintReturnInstruction(
    connection,
    wallet,
    authority,
    null,
    2,
    TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID
  );
  // pool token asset 2
  let retInstructionAsset2 = await Token.createMintReturnInstruction(
    connection,
    wallet,
    authority2,
    null,
    2,
    TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID
  );
  // splm asset 1
  let mintA = new Token(
    connection,
    new PublicKey(asset1.minta),
    TOKEN_PROGRAM_ID,
    wallet
  );
  let mintB = new Token(
    connection,
    new PublicKey(asset1.mintb),
    TOKEN_PROGRAM_ID,
    wallet
  );
  // splm asset 2
  let mintA2 = new Token(
    connection,
    new PublicKey(asset2.minta),
    TOKEN_PROGRAM_ID,
    wallet
  );
  let mintB2 = new Token(
    connection,
    new PublicKey(asset2.mintb),
    TOKEN_PROGRAM_ID,
    wallet
  );
  //splu asset1
  let adminFeeAccountA = new PublicKey(asset1.spluPRIMARY);//userToken
  let adminFeeAccountB = new PublicKey(asset1.spluAsset1);
  //splu asset 2
  let adminFeeAccountA2 = new PublicKey(asset2.spluPRIMARY);//userToken
  let adminFeeAccountB2 = new PublicKey(asset2.spluAsset1);
  //gost asset 1= tokenAccountA,B
  let retInstructioCreateAccountA = await mintA.createAccountOfInsctruction(authority);
  let retInstructioCreateAccountB = await mintB.createAccountOfInsctruction(authority);
  //gost asset 2= tokenAccountA,B
  let retInstructioCreateAccountA2 = await mintA2.createAccountOfInsctruction(authority2);
  let retInstructioCreateAccountB2 = await mintB2.createAccountOfInsctruction(authority2);

  // sign transaction create mint pool and create account a et b of asset 1
  const transaction1 = new Transaction();

  transaction1.add(retInstructioCreateAccountA[1], retInstructioCreateAccountA[2], retInstructioCreateAccountB[1], retInstructioCreateAccountB[2]);
  transaction1.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
  transaction1.feePayer = wallet.publicKey;
  transaction1.partialSign(retInstructioCreateAccountA[0]);
  transaction1.partialSign(retInstructioCreateAccountB[0]);
  const signed1 = await wallet.signTransaction(transaction1);
  let signature1 = "";
  signature1 = await connection.sendRawTransaction(signed1.serialize());

  // sign transaction and create account a et b of asset 2
  const transaction12 = new Transaction();
  transaction12.add(retInstructioCreateAccountA2[1], retInstructioCreateAccountA2[2], retInstructioCreateAccountB2[1], retInstructioCreateAccountB2[2]);
  transaction12.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
  transaction12.feePayer = wallet.publicKey;
  transaction12.partialSign(retInstructioCreateAccountA2[0]);
  transaction12.partialSign(retInstructioCreateAccountB2[0]);
  const signed12 = await wallet.signTransaction(transaction12);
  let signature12 = "";
  signature12 = await connection.sendRawTransaction(signed12.serialize());
  // confirm transaction create ACCOUNT A B for asset 1 , asset 2
  if (signature1 != "" && signature12 != "") {
    await connection.confirmTransaction(signature1, 'max');
    await connection.confirmTransaction(signature12, 'max');
  }
  // instruction mint to asset 1 to tow gost
  let instruction1 = await mintA.mintToReturnInstruction(retInstructioCreateAccountA[0].publicKey, wallet, [], 10000000000);
  let instruction2 = await mintB.mintToReturnInstruction(retInstructioCreateAccountB[0].publicKey, wallet, [], 10000000000);
  // instruction mint to asset 2 to tow gost
  let instruction12 = await mintA2.mintToReturnInstruction(retInstructioCreateAccountA2[0].publicKey, wallet, [], 10000000000);
  let instruction22 = await mintB2.mintToReturnInstruction(retInstructioCreateAccountB2[0].publicKey, wallet, [], 10000000000);
  // sign transaction create mint pool and mint to  asset 1
  const transaction = new Transaction();
  let poolMint = retInstruction[1];
  transaction.add(retInstruction[2], retInstruction[3], instruction1, instruction2);
  transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
  transaction.feePayer = wallet.publicKey;
  transaction.partialSign(retInstruction[0]);
  let signed = await wallet.signTransaction(transaction);
  let signature = "";
  signature = await connection.sendRawTransaction(signed.serialize());
  // sign transaction create mint pool and mint to  asset 2
  const transaction01 = new Transaction();
  let poolMint2 = retInstructionAsset2[1];
  transaction01.add(retInstructionAsset2[2], retInstructionAsset2[3], instruction12, instruction22);
  transaction01.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
  transaction01.feePayer = wallet.publicKey;
  transaction01.partialSign(retInstructionAsset2[0]);
  let signed01 = await wallet.signTransaction(transaction01);
  let signature01 = "";
  signature01 = await connection.sendRawTransaction(signed01.serialize());
  // confirm transaction create mint pool and mint to for asset 1 , asset 2

  if (signature1 != "" && signature12 != "") {
    await connection.confirmTransaction(signature, 'max');
    await connection.confirmTransaction(signature01, 'max');
  }
  console.log(poolMint.publicKey.toBase58());
  // createuser pooltoken  for asset 1
  let poolTokenAccount = await poolMint.createAccount(wallet.publicKey);

  // createuser pooltoken  for asset 2
  let poolTokenAccount2 = await poolMint2.createAccount(wallet.publicKey);

  let adminAccount = new Account();
  let adminAccount2 = new Account();
  console.log("admin1 ", adminAccount.publicKey.toBase58());
  console.log("admin2 ", adminAccount2.publicKey.toBase58())
  // Pool configs
  const AMP_FACTOR = 100;
  const FEES: Fees = {
    adminTradeFeeNumerator: DEFAULT_FEE_NUMERATOR,
    adminTradeFeeDenominator: DEFAULT_FEE_DENOMINATOR,
    adminWithdrawFeeNumerator: DEFAULT_FEE_NUMERATOR,
    adminWithdrawFeeDenominator: DEFAULT_FEE_DENOMINATOR,
    tradeFeeNumerator: 1,
    tradeFeeDenominator: 4,
    withdrawFeeNumerator: DEFAULT_FEE_NUMERATOR,
    withdrawFeeDenominator: DEFAULT_FEE_DENOMINATOR,
  };
  // tow gost of asset 1
  let tokenAccountA = retInstructioCreateAccountA[0].publicKey;
  let tokenAccountB = retInstructioCreateAccountB[0].publicKey;
  // tow gost of asset 2
  let tokenAccountA2 = retInstructioCreateAccountA2[0].publicKey;
  let tokenAccountB2 = retInstructioCreateAccountB2[0].publicKey

  //create stable swap of asset 1
  let stableSwap = await StableSwap.createStableSwap(
    connection,
    wallet,
    createAccountProgramm,
    authority,
    adminAccount.publicKey,
    adminFeeAccountA,
    adminFeeAccountB,
    mintA.publicKey,
    tokenAccountA,
    mintB.publicKey,
    tokenAccountB,
    poolMint.publicKey,
    poolTokenAccount,
    mintA.publicKey,
    mintB.publicKey,
    stableSwapProgramId,
    TOKEN_PROGRAM_ID,
    nonce,
    AMP_FACTOR,
    FEES
  );

  //create stable swap of asset 2
  let stableSwap2 = await StableSwap.createStableSwap(
    connection,
    wallet,
    createAccountProgramm2,
    authority2,
    adminAccount2.publicKey,
    adminFeeAccountA2,
    adminFeeAccountB2,
    mintA2.publicKey,
    tokenAccountA2,
    mintB2.publicKey,
    tokenAccountB2,
    poolMint2.publicKey,
    poolTokenAccount2,
    mintA2.publicKey,
    mintB2.publicKey,
    stableSwapProgramId,
    TOKEN_PROGRAM_ID,
    nonce2,
    AMP_FACTOR,
    FEES
  );

  let ret = { "authority": authority.toBase58(), "nonce": nonce, "poolMint": poolMint.publicKey.toBase58(), "poolTokenAccount": poolTokenAccount.toBase58(), "tokenAccountA": tokenAccountA.toBase58(), "tokenAccountB": tokenAccountB.toBase58(), "stableSwap": stableSwap.stableSwap.toBase58(), "authority2": authority2.toBase58(), "nonce2": nonce2, "poolMint2": poolMint2.publicKey.toBase58(), "poolTokenAccount2": poolTokenAccount2.toBase58(), "tokenAccountA2": tokenAccountA2.toBase58(), "tokenAccountB2": tokenAccountB2.toBase58(), "stableSwap2": stableSwap2.stableSwap.toBase58() }


  console.log(ret);
  return ret;
}
/************************************** end saber ************************************************************ */

/************************************** farm ************************************************************ */

export async function stakeTokens(wallet, connection,lpToken){
  
  }

/************************************** end farm ************************************************************ */
