import {
  Token as SToken,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { expectTX } from "@saberhq/chai-solana";
import {
  createInitMintInstructions,
  TokenAmount,
  Token as sToken,
  getOrCreateATA
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
  newUserStakeTokenAccount,
} from "../quarry-farm/fcts";
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
import { findMinterAddress } from "../quarry-farm/utils";
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
    keys: keys2,
    programId,
    data: data2,
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

export async function stakeTokens(wallet, connection, lpTokenAsset1) {
  //lp token 
  let stakeTokenMint = new PublicKey(lpTokenAsset1);
  //sdk 
  let sdk = makeSDK(connection, wallet);
  let mintWrapper = sdk.mintWrapper;
  let provider = sdk.provider;
  //****************** create rewaod token *******************
  console.log("create reward token ");
     //const rewardsMintKP = new Account();
    //let rewardsMint = rewardsMintKP.publicKey;
   
    let rewardsMint=new PublicKey("4FkPSyJLWdngzeyiMPTJh77BXbYPocf1bU6u8yoCDy33");
    console.log("reward token pk => " + rewardsMint);
    let token = new sToken({
      // required
      address: rewardsMint.toString(),
      decimals: 2,
      chainId: 103,
    });
    console.log("reward token => " + token)
   /*  const DEFAULT_HARD_CAP = 1_000_000_000_000;
    let hardCap = TokenAmount.parse(token, DEFAULT_HARD_CAP.toString());
    console.log("reward amount => " + hardCap)
   
    const res = await mintWrapper.newWrapper({
      //const {wrapperKey, tx  } = await newWrapper({
      hardcap: hardCap.toU64(),
      tokenMint: rewardsMint,
      //provider,
    }); 
    let wrapperKey = res.mintWrapper;
    let tx = res.tx;
    console.log("wrapperKey => " + wrapperKey);
    console.log("rewardsMint " + rewardsMint)
    console.log("hardCap.toU64()" + hardCap.toU64())
  
    console.log("yxn" + tx)
  
    await expectTX(
      await createInitMintInstructions({
        provider,
        mintKP: rewardsMintKP,
        decimals: 2,
        mintAuthority: wrapperKey,
        freezeAuthority: wrapperKey,
      })
    ).to.be.fulfilled;
    
    console.log("wrapper key after init => " + wrapperKey)
    let mintWrapperKey = wrapperKey;
    await expectTX(tx, "Initialize mint").to.be.fulfilled;*/
    
 
  let wrapperKey = new PublicKey("8acHVXo4vVYZrbHf3Eo7LTUPf1HvD1Vf7PscP4mhzLh5");
  
  console.log("wrapperKey => " + wrapperKey);
  console.log("rewardsMint" + rewardsMint);

  //***************** create rewards *******************
  console.log("create rewards");
  let mine = sdk.mine;
   
/*   // let mine = sdk.mine;
   const { tx: tx1, key: theRewarderKey } = await mine.createRewarder({
     mintWrapper:wrapperKey,
     authority: provider.wallet.publicKey,
   });
   await expectTX(tx1, "Create new rewarder").to.be.fulfilled;   */
  
  /***************** sync reward *******************/
 
  console.log("sync reward ");
  const theRewarderKey = new PublicKey("4cVS9W7ABJGN1ZaZAhqmCvuQCkEXxQqbmt7HpTzH9csU");
  console.log(theRewarderKey.toBase58());
  
   /*  let rewarder = await mine.loadRewarderWrapper(theRewarderKey);
   await expectTX(
      await rewarder.setAndSyncAnnualRewards(ANNUAL_REWARDS_RATE, [])
    ).to.be.fulfilled;  */

  /***************** create Quarry  *******************/
  console.log("create Quarry ");

  let stakeToken = sToken.fromMint(stakeTokenMint, 2, {
    name: "stake token", chainId: 103
  });
  let rewarder = await mine.loadRewarderWrapper(theRewarderKey);
  /*  const { tx: quarryTx } = await rewarder.createQuarry({
   token: stakeToken,
  });
  await expectTX(quarryTx, "Create new quarry").to.be.fulfilled;  */
   rewarder.getQuarryKey(stakeToken).then(
    (res) => {
      console.log("quarry");
      console.log(res.toBase58());
      console.log("quarry");
    }
  ) 
  //lp => tokenMint
  let quarryPK = new PublicKey("Ew5ADLFA8ehm2Y6tHZDN3KSf2sCGcCMmg6ZWHwprUnLB");
  let quarry = await rewarder.getQuarry(stakeToken);
  console.log("quarry");
  console.log(quarry.key.toBase58());
  console.log("token info token lp ");
  console.log(quarry.token.info.address);
  console.log("token info mintAccount ");
  console.log(quarry.token.mintAccount.toBase58());
  console.log("quarry data rewarderKey ");
  console.log(quarry.quarryData.rewarderKey.toBase58());
  console.log("quarry data tokenMintKey ");
  console.log(quarry.quarryData.tokenMintKey.toBase58());
  console.log("rewarderData base ");
  console.log(quarry.rewarderData.base.toBase58());
  console.log("rewarderData  authority ");
  console.log(quarry.rewarderData.authority.toBase58());

  // create the miner
  console.log("************** Create Miner *******************")
  // await expectTX((await quarry.createMiner()).tx, "create miner").to.be.fulfilled;
  let minerAddr = (await quarry.getMinerAddress(wallet.publicKey)).toBase58()
  console.log("miner " + minerAddr)


  const minerActions = await quarry.getMinerActions(
    provider.wallet.publicKey
  );
  console.log(minerActions)
  console.log("*** Miner wrapper ***");
  console.log("authority : ", minerActions.authority.toBase58());
  console.log("miner key : ", minerActions.minerKey.toBase58());
  console.log("quarry key : ", minerActions.quarry.key.toBase58());
  console.log("stakedTokenATA : ", minerActions.stakedTokenATA.toBase58());
  console.log("tokenVault key : ", minerActions.tokenVaultKey.toBase58());
  console.log("userStake Accounts");
  console.log(minerActions.userStakeAccounts);
  console.log("authority : ", minerActions.userStakeAccounts.authority.toBase58());
  console.log("miner : ", minerActions.userStakeAccounts.miner.toBase58());
  console.log("minerVault : ", minerActions.userStakeAccounts.minerVault.toBase58());
  console.log("quarry  : ", minerActions.userStakeAccounts.quarry.toBase58());
  console.log("rewarder : ", minerActions.userStakeAccounts.rewarder.toBase58());
  console.log("tokenAccount  : ", minerActions.userStakeAccounts.tokenAccount.toBase58());
  console.log("tokenProgram  : ", minerActions.userStakeAccounts.tokenProgram.toBase58());
  console.log("userStake Accounts");


  const userStakeTokenAccount = new PublicKey("8tFe5nh6i1bu7gVQR7eAZxniXqZHAmcVctdguRfwoPXC")
  console.log(userStakeTokenAccount.toBase58()); 
  /******************** Stake Tokens ********************/
  console.log("************** Stake Token ***********")
  const idl = require('./utils/test1.json')
  // Address of the deployed program.
  const programId = new anchor.web3.PublicKey('CDVL2p7dSY5svymGPudk1rphSB2VFyQAQymWQZmW9XPm');
  const program = new anchor.Program(idl, programId);
  let createAccountProgram = new web3.Account([112, 152, 22, 24, 214, 173, 250, 98, 192, 214, 50, 104, 196, 104, 105, 184, 87, 99, 220, 223, 116, 66, 3, 19, 167, 5, 102, 11, 232, 199, 11, 166, 87, 188, 108, 80, 242, 45, 37, 163, 74, 88, 103, 23, 49, 219, 164, 70, 19, 227, 104, 61, 89, 136, 150, 158, 145, 111, 179, 89, 53, 73, 6, 20]);
  let [programAddress, nonce] = await PublicKey.findProgramAddress(
    [createAccountProgram.publicKey.toBuffer()],
    programId,
  );
  let amountstake = 100;//u64
  let quarry_program_id = new anchor.web3.PublicKey("HZnsMua7bPbrKuopD8v7Rn4DNKgaKk62zgWAjwxUJY2j");
  let tx = await program.rpc.stake(new anchor.BN(amountstake), new anchor.BN(nonce), {
    accounts: {
      authority: minerActions.userStakeAccounts.authority,
      miner: minerActions.userStakeAccounts.miner,
      quarry: minerActions.userStakeAccounts.quarry,
      minerVault: minerActions.userStakeAccounts.minerVault,
      tokenAccount: userStakeTokenAccount,
      tokenProgram: minerActions.userStakeAccounts.tokenProgram,
      rewarder: minerActions.userStakeAccounts.rewarder,
      unusedClock: SystemProgram.programId,
      quarryProgram: quarry_program_id,
    }
  });
  console.log('Success Stake');
  let ret = [];
  ret.push({ "signature": tx, "rewarderKey": theRewarderKey.toBase58() })
  return ret; 
}


export async function withdrawFormQuarry(wallet, connection, lpTokenAsset1, userLpTokenAsset1, rewarderKeyAsset1) {
  let sdk = makeSDK(connection, wallet);
  let provider = sdk.provider;
  let mine = sdk.mine;

  //lp token 
  const stakeTokenMint = new PublicKey(lpTokenAsset1);
  const userStakeTokenAccount = new PublicKey(userLpTokenAsset1)
  const theRewarderKey = new PublicKey(rewarderKeyAsset1);

  console.log("************** withdraw Form Quarry ***********")
  const idl = require('./utils/test1.json')
  // Address of the deployed program.
  const programId = new anchor.web3.PublicKey('CDVL2p7dSY5svymGPudk1rphSB2VFyQAQymWQZmW9XPm');
  const program = new anchor.Program(idl, programId);
  let quarry_program_id = new anchor.web3.PublicKey("HZnsMua7bPbrKuopD8v7Rn4DNKgaKk62zgWAjwxUJY2j");

  let stakeToken = sToken.fromMint(stakeTokenMint, 2, {
    name: "stake token", chainId: 103
  });

  let rewarder = await mine.loadRewarderWrapper(theRewarderKey);
  let quarry = await rewarder.getQuarry(stakeToken);
  const minerActions = await quarry.getMinerActions(
    provider.wallet.publicKey
  );
  let authority = wallet.publicKey;
  let miner = minerActions.userStakeAccounts.miner;
  let Pquarry = minerActions.userStakeAccounts.quarry;
  let minerVault = minerActions.userStakeAccounts.minerVault;
  let tokenAccount = userStakeTokenAccount;
  let tokenProgram = minerActions.userStakeAccounts.tokenProgram;
  let Prewarder = minerActions.userStakeAccounts.rewarder;

  let amount = 100;//u64

  let tx = await program.rpc.withdrow(new anchor.BN(amount), {
    accounts: {
      authority,
      miner,
      quarry: Pquarry,
      minerVault,
      tokenAccount,
      tokenProgram,
      rewarder: Prewarder,
      unusedClock: SystemProgram.programId,
      quarryProgram: quarry_program_id,
    }
  });
  console.log('Success withdrow');

  return tx;

}


export async function claimRewards(wallet, connection, lpTokenAsset1, userLpTokenAsset1, rewarderKeyAsset1) {
  let sdk = makeSDK(connection, wallet);
  let provider = sdk.provider;
  let mine = sdk.mine;

  //lp token 
  const stakeTokenMint = new PublicKey(lpTokenAsset1);
  const userStakeTokenAccount = new PublicKey(userLpTokenAsset1)
  const theRewarderKey = new PublicKey(rewarderKeyAsset1);

  console.log("**************claimRewards ***********")
  const idl = require('./utils/test1.json')
  // Address of the deployed program.
  const programId = new anchor.web3.PublicKey('CDVL2p7dSY5svymGPudk1rphSB2VFyQAQymWQZmW9XPm');
  const program = new anchor.Program(idl, programId);
  //let quarry_program_id = new anchor.web3.PublicKey("HZnsMua7bPbrKuopD8v7Rn4DNKgaKk62zgWAjwxUJY2j");
  
  let stakeToken = sToken.fromMint(stakeTokenMint, 2, {
    name: "stake token", chainId: 103
  });

  let rewarder = await mine.loadRewarderWrapper(theRewarderKey);
  let quarry = await rewarder.getQuarry(stakeToken);
  const minerActions = await quarry.getMinerActions(
    provider.wallet.publicKey
  );
  console.log(rewarder);
 console.log(quarry);
 console.log(minerActions);
 console.log("mintWrapper",quarry.rewarderData.mintWrapper.toBase58());
  //let mintWrapper=new anchor.web3.PublicKey("LtF91ftr9HAMnb9UbAHBpR9LTeGBWykcmpHkXWj32cG");
 // let mintWrapperProgram=new anchor.web3.PublicKey("CsJYUa6sucvv5eEfN21TxgLpxm8DuFPDMcHoUFhgChtt")
  //let minter=new anchor.web3.PublicKey("4EqNJZuG9mGy9LzL1JW9J1wmrXw6L7fA6azYfKqHND2n")
 // let rewardsTokenMint=new anchor.web3.PublicKey("6Lpcjq4QhwVcZaZq6FMaPdDo8zJJ3QbdNmz5RVqaXvLE");
 //let rewardsTokenAccount=new anchor.web3.PublicKey("E78PSR2ujyFuV158ZKcjD525CkxreMA9MoLdWRtGGvq6");
//let claimFeeTokenAccount=new anchor.web3.PublicKey("3LstAULH57C7ofez2Ax18pCdnehRmos45XDSfCGtTbDo");

let authority=wallet.publicKey;
let miner = new anchor.web3.PublicKey("2exaUE85QnPzAj9sy3L3kjqxbXCbUpVWqTUB5gwXksJy");
let quarryP = new anchor.web3.PublicKey("Ew5ADLFA8ehm2Y6tHZDN3KSf2sCGcCMmg6ZWHwprUnLB");
let minerVault = new anchor.web3.PublicKey("BG3okY9dnNC5B3f49VeqXcjaWDAeZuHKqT7AvPPta4JT");
let tokenAccount = new anchor.web3.PublicKey("E2m2AyB1W24s24gvmRrMXVz2godf5PJLr7k7cTjCJ5X3");
let rewarderP = new anchor.web3.PublicKey("GYP8ee914pmPsFJFeD1uQVrfdZs5dQNRsSuf1hhPrq4R");
let quarry_program_id = new anchor.web3.PublicKey("HZnsMua7bPbrKuopD8v7Rn4DNKgaKk62zgWAjwxUJY2j");

 console.log('Success claim rewards');
 let mintWrapper=new PublicKey("8acHVXo4vVYZrbHf3Eo7LTUPf1HvD1Vf7PscP4mhzLh5");//sa7i7a let wrapperKey = new PublicKey("DWxVW3NdnGhy9uFcx56zUad6o3xrqBP5KsRB1zH1e4a8");
 let mintWrapperProgram = new anchor.web3.PublicKey("EydLzhz3f1FcFLceETt2SZSCqK7dUVn6ZZB6ynZDwk67");//sa7i7a
 const [minter] = await findMinterAddress(
  quarry.rewarderData.mintWrapper,
  quarry.quarryData.rewarderKey,
  sdk.mintWrapper.program.programId
);
let rewardTokenMint = new PublicKey("CnESRL8hdAw9jkg15ZhfXo2AeYsSMeKFrnnYZjuFywRV");
 
console.log("minter",minter.toBase58());

 const { address: rewardsTokenAccount, instruction: ataInstruction } =
    await getOrCreateATA({
      provider: provider,
      mint: rewardTokenMint,
      owner: wallet.publicKey,
    });
    console.log("rewardsTokenAccount ",rewardsTokenAccount.toBase58());
    let claimFeeTokenAccount=quarry.rewarderData.claimFeeTokenAccount;
    console.log("claimFeeTokenAccount ", claimFeeTokenAccount.toBase58());

    let tx= await program.rpc.claim({
      accounts: {
        mintWrapper,
       mintWrapperProgram,
       minter,
       rewardsTokenMint:rewardTokenMint, 
        rewardsTokenAccount,
       claimFeeTokenAccount,
       authority,
       miner,
       quarry:quarryP,
       unusedMinerVault :minerVault,
       unusedTokenAccount:tokenAccount,
       tokenProgram:TOKEN_PROGRAM_ID,
       rewarder:rewarderP,
       unusedClock: SystemProgram.programId,
       quarryProgram: quarry_program_id 
      
     }}); 
     console.log('Success claim rewards');
  /* 
    let authority=wallet.publicKey;
    let miner= minerActions.userStakeAccounts.miner;
    let Pquarry=minerActions.userStakeAccounts.quarry;
    let minerVault=minerActions.userStakeAccounts.minerVault;
    let tokenAccount=userStakeTokenAccount;
    let tokenProgram= minerActions.userStakeAccounts.tokenProgram;
    let Prewarder= minerActions.userStakeAccounts.rewarder;
    let rewardWrapper = new PublicKey("DWxVW3NdnGhy9uFcx56zUad6o3xrqBP5KsRB1zH1e4a8");//wrapperkey
    
    let mintWrapper=quarry.rewarderData.mintWrapper;
    // let minter=new anchor.web3.PublicKey("4EqNJZuG9mGy9LzL1JW9J1wmrXw6L7fA6azYfKqHND2n")
    let rewardsTokenMint=quarry.rewarderData.rewardsTokenMint;//rewardToken
   //let rewardsTokenAccount=new anchor.web3.PublicKey("E78PSR2ujyFuV158ZKcjD525CkxreMA9MoLdWRtGGvq6");
  let claimFeeTokenAccount=quarry.rewarderData.claimFeeTokenAccount;
  
  let rewardToken = new PublicKey("CnESRL8hdAw9jkg15ZhfXo2AeYsSMeKFrnnYZjuFywRV");
   
    let token = new sToken({
      // required
      address: rewardToken.toString(),
      decimals: 2,
      chainId: 103,
    });
    const [minter] = await findMinterAddress(
      quarry.rewarderData.mintWrapper,
      quarry.quarryData.rewarderKey,
      sdk.mintWrapper.program.programId
    );
    console.log("minter",minter.toBase58());
    const { address: rewardsTokenAccount, instruction: ataInstruction } =
    await getOrCreateATA({
      provider: provider,
      mint: rewardToken,
      owner: authority,
    });
    console.log("rewardsTokenAccount ",rewardsTokenAccount.toBase58());
    console.log(rewarder);
    console.log(quarry);
    console.log(minerActions);
    let tx= await program.rpc.claim({
      accounts: {
        mintWrapper,
       mintWrapperProgram,
       minter,
       rewardsTokenMint, 
        rewardsTokenAccount,
       claimFeeTokenAccount,
       authority,
       miner,
       quarry:Pquarry,
       unusedMinerVault :minerVault,
       unusedTokenAccount:tokenAccount,
       tokenProgram,
       rewarder:Prewarder,
       unusedClock: SystemProgram.programId,
       quarryProgram: quarry_program_id 
      
     }}); 
     console.log('Success claim rewards');
     return tx; */

}
/************************************** end farm ************************************************************ */
/* mintWrapper.ts: 52 adminEnHBYsRckMqtAkpfXhhRTpCo3XF5CFgywXyktqMYoJcV
mintWrapper.ts: 53 base pk DZg4DXTCoQ2Vpyh7TdCpRAzVEgfvEKrPbgYmejBSwVoT */
