import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Token as SToken } from "../../client/token"
import {
  Account,
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  Transaction, TransactionInstruction
} from "@solana/web3.js";
import { StableSwap } from "../stable-swap";

import {
  DEFAULT_FEE_DENOMINATOR,
  DEFAULT_FEE_NUMERATOR,
  Fees,
} from "../fees";
// Fee payer 


export async function depositNewPool(wallet, connection, PstableSwap, PlpToken, PmintA, PmintB, PuserPoolToken, PuserAccountA, PuserAccountB, PtokenAccountA, PtokenAccountB, Pauthority) {
  const programId = new PublicKey("6HDDmMvR4LGyXke43as8FiPJW1hnWi4cCw98ShJWeuop")

  let createAccountProgramm = new Account([86, 26, 243, 72, 46, 135, 186, 23, 31, 215, 229, 43, 54, 89, 206, 222, 82, 6, 231, 212, 212, 226, 184, 211, 107, 147, 180, 138, 57, 108, 182, 46, 185, 33, 232, 144, 77, 70, 77, 145, 151, 152, 188, 19, 78, 73, 32, 89, 236, 171, 90, 44, 120, 71, 202, 142, 214, 179, 38, 85, 71, 103, 145, 193]);
  let [programAddress, nonce] = await PublicKey.findProgramAddress(
    [createAccountProgramm.publicKey.toBuffer()],
    programId,
  );
  let owner = new Account([97, 30, 31, 33, 13, 91, 4, 73, 57, 214, 172, 115, 44, 20, 255, 207, 156, 101, 25, 224, 7, 2, 170, 146, 20, 213, 165, 241, 211, 14, 76, 95, 123, 128, 140, 138, 192, 242, 113, 62, 119, 27, 79, 105, 116, 153, 140, 191, 215, 220, 88, 150, 210, 137, 231, 88, 23, 142, 210, 51, 240, 144, 106, 241]);
  // let  payer = new Account([97, 30, 31, 33, 13, 91, 4, 73, 57, 214, 172, 115, 44, 20, 255, 207, 156, 101, 25, 224, 7, 2, 170, 146, 20, 213, 165, 241, 211, 14, 76, 95, 123, 128, 140, 138, 192, 242, 113, 62, 119, 27, 79, 105, 116, 153, 140, 191, 215, 220, 88, 150, 210, 137, 231, 88, 23, 142, 210, 51, 240, 144, 106, 241]);
  let PubstableSwap = new PublicKey(PstableSwap);
  let authority = new PublicKey(Pauthority);
  console.log("authority =", Pauthority);
  let mintA = new SToken(
    connection,
    new PublicKey(PmintA),
    TOKEN_PROGRAM_ID,
    wallet
  );
  let mintB = new SToken(
    connection,
    new PublicKey(PmintB),
    TOKEN_PROGRAM_ID,
    wallet
  );
  let tokenAccountA = new PublicKey(PtokenAccountA);
  let userAccountA = new PublicKey(PuserAccountA);
  const mintAInfo = await mintA.getAccountInfo(userAccountA);
  console.log("mintAInfo =", mintAInfo.owner.toBase58());

  let tokenAccountB = new PublicKey(PtokenAccountB);
  let userAccountB = new PublicKey(PuserAccountB);
  const mintBInfo = await mintB.getAccountInfo(userAccountB);
  console.log("mintBInfo =", mintBInfo.owner.toBase58());
  let tokenPool = new SToken(
    connection,
    new PublicKey(PlpToken),
    TOKEN_PROGRAM_ID,
    wallet);
  let userPoolAccount = new PublicKey(PuserPoolToken)
  let stableSwapProgramId = new PublicKey("2J67FeJ4CGjtunyvh3BtBsgEbQwkdpYhSD3ALZPK8fUY");

  let tokenAmountA = 1000;
  let tokenAmountB = 1000;
  let minimumPoolTokenAmount = 0;

  let infoBefore;
  let ret = [];
  let instruction1=await mintA.mintToInstruction(userAccountA, wallet, [], 7000000000);
  let instruction2=await mintB.mintToInstruction(userAccountB, wallet, [], 7000000000);
  let instruction3= await mintA.approveInstruction(userAccountA, authority, wallet, [], 1000, connection);
  let instruction4=await mintB.approveInstruction(userAccountB, authority, wallet, [], 1000, connection);
 const transaction0=new Transaction();
 transaction0.add(instruction1,instruction2,instruction3,instruction4);
 transaction0.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
transaction0.feePayer = wallet.publicKey;
let signed0=await wallet.signTransaction(transaction0);
console.log("*******signed: "+JSON.stringify(signed0))
let signature0 = await connection.sendRawTransaction(signed0.serialize());
await connection.confirmTransaction(signature0, 'max'); 
  infoBefore = await mintA.getAccountInfo(tokenAccountA);
  console.log("amount tokenAccountA : " + infoBefore.amount.toNumber())
   
 infoBefore = await mintA.getAccountInfo(userAccountA);
  ret.push({ "infoBeforeA": infoBefore })
  console.log("info of userAccount A before deposit ");
  console.log("mint A : ", infoBefore.mint.toString(), " address account : ", infoBefore.address.toString(), " amount mint A :", infoBefore.amount.toNumber())
  console.log("****************************************")
   infoBefore = await mintB.getAccountInfo(userAccountB);
  ret.push({ "infoBeforeB": infoBefore })
  console.log("info of userAccount B before deposit ");
  console.log("mint B : ", infoBefore.mint.toString(), " address account : ", infoBefore.address.toString(), " amount mint B :", infoBefore.amount.toNumber())
  console.log("****************************************")

  infoBefore = await tokenPool.getAccountInfo(userPoolAccount);
  ret.push({ "infoPoolBefore": infoBefore })
  console.log("info of userAccount Pool before deposit ");
  console.log("mint Pool : ", infoBefore.mint.toString(), " address account : ", infoBefore.address.toString(), " amount mint Pool :", infoBefore.amount.toNumber())
  console.log("****************************************");
  const keys = [
    { pubkey: PubstableSwap, isSigner: false, isWritable: true },
    { pubkey: authority, isSigner: false, isWritable: true },
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
  const instruction = new TransactionInstruction({
    keys,
    programId,
    data, // All instructions are hellos
  });
  const transaction = new Transaction();
  transaction.add(instruction);
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash()
  ).blockhash;

  transaction.feePayer = wallet.publicKey;



  let signed = await wallet.signTransaction(transaction);

  let signature = await connection.sendRawTransaction(signed.serialize());

  let x = await connection.confirmTransaction(signature, 'max');

  infoBefore = await mintA.getAccountInfo(userAccountA);
  ret.push({ "infoAfterA": infoBefore })
  console.log("info of userAccount A After deposit ");
  console.log("mint A : ", infoBefore.mint.toString(), " address account : ", infoBefore.address.toString(), " amount mint A :", infoBefore.amount.toNumber())
  console.log("****************************************")

  infoBefore = await mintB.getAccountInfo(userAccountB);
  ret.push({ "infoAfterB": infoBefore })
  console.log("info of userAccount B After deposit ");
  console.log("mint B : ", infoBefore.mint.toString(), " address account : ", infoBefore.address.toString(), " amount mint B :", infoBefore.amount.toNumber())
  console.log("****************************************")

  infoBefore = await tokenPool.getAccountInfo(userPoolAccount);
  ret.push({ "infoPoolAfter": infoBefore })
  console.log("info of userAccount Pool After deposit ");
  console.log("mint Pool : ", infoBefore.mint.toString(), " address account : ", infoBefore.address.toString(), " amount mint Pool :", infoBefore.amount.toNumber())
  console.log("****************************************");

  console.log("signature " + JSON.stringify(signature))

  // await sendAndConfirmTransaction("deposit", connection, deposit, wallet);

  return ret;
}

export async function createPoolMint(wallet, connection) {
  let stableSwapProgramId = new PublicKey("2J67FeJ4CGjtunyvh3BtBsgEbQwkdpYhSD3ALZPK8fUY");
  let createAccountProgramm = new Account();
  let [authority, nonce] = await PublicKey.findProgramAddress(
    [createAccountProgramm.publicKey.toBuffer()],
    stableSwapProgramId
  );
  let retInstruction = await SToken.createMintReturnInstruction(
    connection,
    wallet,
    authority,
    null,
    6,
    TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID
  );

  console.log(retInstruction);


  let mintA = new SToken(
    connection,
    new PublicKey("AyPBEFkW4v6NRrefxuf1qq7TVfQDEXuYaT4TaKy269Z2"),
    TOKEN_PROGRAM_ID,
    wallet
  );
  let mintB = new SToken(
    connection,
    new PublicKey("GpowYpE5M89JhykzKvfBYto4DJBAQJPZu8oLcu5zphtK"),
    TOKEN_PROGRAM_ID,
    wallet
  )
  let userAccountA = new PublicKey("3Z8Nk1JDghDe547KCAGqyrkG5zp1niJsg4n4YJs7HWT5");
  let userAccountB = new PublicKey("AZTPakCXcHPJhCGAP3CZNoL8Qm5G5AreL2RZUVBaH3zn");

  let retInstructioCreateAccountA = await mintA.createAccountOfInsctruction(authority);
  let retInstructioCreateAccountB = await mintB.createAccountOfInsctruction(authority);
  const transaction1 = new Transaction();

  transaction1.add(retInstructioCreateAccountA[1], retInstructioCreateAccountA[2],retInstructioCreateAccountB[1], retInstructioCreateAccountB[2]);

  //transaction1.add(retInstructionpoolTokenAccount[1],retInstructionpoolTokenAccount[2]);
  transaction1.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
  transaction1.feePayer = wallet.publicKey;

  transaction1.partialSign(retInstructioCreateAccountA[0]);
  transaction1.partialSign(retInstructioCreateAccountB[0]);
  //transaction1.partialSign(retInstructionpoolTokenAccount[0]);
  const signed1 = await wallet.signTransaction(transaction1);
  const signature1 = await connection.sendRawTransaction(signed1.serialize());
  await connection.confirmTransaction(signature1, 'max');
  
  let instruction1 = await mintA.mintToReturnInstruction(retInstructioCreateAccountA[0].publicKey, wallet, [], 10000000000);
  let instruction2 = await mintB.mintToReturnInstruction(retInstructioCreateAccountB[0].publicKey, wallet, [], 10000000000);
  const transaction = new Transaction();
  let poolMint = retInstruction[1];

  transaction.add(retInstruction[2], retInstruction[3], instruction1,instruction2);
  
  transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
  transaction.feePayer = wallet.publicKey;

  transaction.partialSign(retInstruction[0]);
  let signed = await wallet.signTransaction(transaction);
  console.log(signed);;
  let signature = await connection.sendRawTransaction(signed.serialize());

  await connection.confirmTransaction(signature, 'max');
  console.log(poolMint.publicKey.toBase58());
 
  /* 
 
   */
  let poolTokenAccount = await poolMint.createAccount(wallet.publicKey);
  
  

 
  let adminAccount = new Account();
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
  let tokenAccountA=retInstructioCreateAccountA[0].publicKey;
  let tokenAccountB=retInstructioCreateAccountB[0].publicKey
  let stableSwap = await StableSwap.createStableSwap(
    connection,
    wallet,
    createAccountProgramm,
    authority,
    adminAccount.publicKey,
    userAccountA,
    userAccountB,
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

  let ret = { "authority": authority.toBase58(), "nonce": nonce, "poolMint": poolMint.publicKey.toBase58(), "poolTokenAccount": poolTokenAccount.toBase58(), "tokenAccountA": tokenAccountA.toBase58(), "tokenAccountB": tokenAccountB.toBase58(), "stableSwap": stableSwap.stableSwap.toBase58() }
  console.log(ret);
  return ret;

}