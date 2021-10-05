import {
  Account,
  PublicKey,
  TransactionInstruction,
  Transaction,

} from '@solana/web3.js';


import {
  Token,
  ORIGINE_PROGRAMM_ID,
} from "../client/token";
import {
  TokenSwap
} from '../swap/index'

const TOKEN_SWAP_PROGRAM_ID: PublicKey = new PublicKey(
  '5e2zZzHS8P1kkXQFVoBN6tVN15QBUHMDisy6mxVwVYSz',
);

const SWAP_PROGRAM_OWNER_FEE_ADDRESS = "HfoTxFR1Tm6kGmWgYWD6J7YHVy1UwqSULUGVLXkJqaKN";

// Loaded token program's program id
const programId = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const associatedProgramId = new PublicKey("Fxer83fa7cJF3CBS8EDtbKEbkM1gqnPqLZbRQZZae4Cf");
let mintA: Token;
let curveParameters: Numberu64;
let testTokenSwap: TokenSwap;
let tokenAccountB: PublicKey;
let authority: PublicKey;
let nonce: Number;
let testTokenDecimals: number = 2;
let createAccountProgramm: Account = new Account();

// Pool fees
const TRADING_FEE_NUMERATOR = 25;
const TRADING_FEE_DENOMINATOR = 10000;
const OWNER_TRADING_FEE_NUMERATOR = 5;
const OWNER_TRADING_FEE_DENOMINATOR = 10000;
const OWNER_WITHDRAW_FEE_NUMERATOR = SWAP_PROGRAM_OWNER_FEE_ADDRESS ? 0 : 1;
const OWNER_WITHDRAW_FEE_DENOMINATOR = SWAP_PROGRAM_OWNER_FEE_ADDRESS ? 0 : 6;
const HOST_FEE_NUMERATOR = 20;
const HOST_FEE_DENOMINATOR = 100;
let owner: Account;


export async function createToken(selectedWallet, connection): Promise<void> {
  // createAccountProgramm = new Account();
  [authority, nonce] = await PublicKey.findProgramAddress(
    [createAccountProgramm.publicKey.toBuffer()],
    TOKEN_SWAP_PROGRAM_ID,
  )

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

  let ret = { "mintA": mintA.publicKey, "authority": authority.toBase58(), "nonce": nonce };

  return ret;
}

export async function createVault(selectedWallet, connection, mint, autority): Promise<void> {
  let token = new Token(
    connection,
    mint,
    new PublicKey(ORIGINE_PROGRAMM_ID),
    selectedWallet)
  tokenAccountB = await token.createAccount(autority);
  return tokenAccountB;
}


export async function mintToken(selectedWallet, connection, mintAddress, accountAddress): Promise<void> {
  let testToken = new Token(
    connection,
    new PublicKey(mintAddress),
    new PublicKey(ORIGINE_PROGRAMM_ID),
    selectedWallet
  );
  console.log("testToken" + testToken)
  await testToken.mintTo(accountAddress, selectedWallet, [], 1000);
  const mintInfo = await testToken.getAccountInfo(new PublicKey(accountAddress))
  console.log("mintInfo" + mintInfo)

  return mintInfo;
}

export async function createpoolsApi(selectedWallet, connection, accounts) {
  let pools = [];
  for (let i = 0; i < accounts.length; i++) {
    const ownerKey = SWAP_PROGRAM_OWNER_FEE_ADDRESS || owner.publicKey.toString();

    let poolToken = await Token.createMint(
      connection,
      selectedWallet,
      new PublicKey(accounts[i].asset.authority),
      null,
      testTokenDecimals,
      programId,
      programId,
      programId
    );

    let feeAccount = await poolToken.createAccount(new PublicKey(ownerKey));
    let accountPool = await poolToken.createAccount(selectedWallet.publicKey);
    console.log(i + " account " + accounts[i].account, "poolToken " + poolToken.publicKey, "accountPool " + accountPool, "feeAccount " + feeAccount)
    let infoPool = { "account": accounts[i], "poolToken": poolToken.publicKey, "accountPool": accountPool, "feeAccount": feeAccount }
    pools.push(infoPool);
  }
  return pools
}

export async function createSwapTokensApi(selectedWallet, connection, userToken, userVault, pools): Promise<void> {
  let swapTokens = []
  for (let i = 0; i < pools.length; i++) {
    let pool = pools[i];
    let accountb = pool.account.account;
    let mintb = pool.account.asset.token
    let pooltoken = pool.poolToken
    let feeaccount = pool.feeAccount
    let accountpool = pool.accountPool
    let autority = pool.account.asset.authority
    let Nonce = pool.account.asset.nonce
    let minta = userToken
    let accounta = userVault
    console.log("createAccountProgramm ", createAccountProgramm.publicKey.toBase58(), " minta " + minta + " mintB " + mintb + " accounta " + accounta + " accountb " + accountb + " pooltoken " + pooltoken + " feeacoount " + feeaccount + " accountpool " + accountpool + " autority " + autority + " nonce " + Nonce)
    let tokenSwap = new TokenSwap(connection, null, null, null, new PublicKey(pooltoken), new PublicKey(feeaccount), new PublicKey(autority), new PublicKey(accounta), new PublicKey(accountb), new PublicKey(minta), new PublicKey(mintb), null, null, null, null, null, null, null, null, null, selectedWallet)
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
    console.log("token swap => " + testTokenSwap.tokenSwap)
    pool.swapToken = testTokenSwap.tokenSwap
    swapTokens.push(pool);
  }
  return swapTokens;
}

export async function swapApi(selectedWallet, connection, minta, accounta, swapTokens, authority, amount) {
  for (let i = 0; i < swapTokens.length; i++) {
    let swapToken=swapTokens[i];
    let tokenSwapPubkey=swapToken.swapToken
    let mintb=swapToken.account.asset.token
    let accountb=swapToken.account.account
    let pooltoken=swapToken.poolToken
    let feeaccount=swapToken.feeAccount
    let accountpool=swapToken.accountPool
    console.log( " minta " + minta + " mintB " + mintb + " accounta " + accounta + " accountb " + accountb + " pooltoken " + pooltoken + " feeacoount " + feeaccount + " accountpool " + accountpool + " autority " + authority)
    let token1 = new Token(
      connection,
      minta,
      ORIGINE_PROGRAMM_ID,
      selectedWallet)
    let userAccountA = await token1.createAccount(selectedWallet.publicKey)
    await token1.mintTo(userAccountA, selectedWallet, [], 100000);
    /***GHOST */
    const userTransferAuthority = new Account([155, 200, 249, 167, 10, 23, 75, 131, 118, 125, 114, 216, 128, 104, 178, 124, 197, 52, 254, 20, 115, 17, 181, 113, 249, 97, 206, 128, 236, 197, 223, 136, 12, 128, 101, 121, 7, 177, 87, 233, 105, 253, 150, 154, 73, 9, 56, 54, 157, 240, 189, 68, 189, 52, 172, 228, 134, 89, 160, 189, 52, 26, 149, 130]);
    await token1.approve(
      userAccountA,
      userTransferAuthority.publicKey,
      selectedWallet,
      [],
      100000,
    );
    let tokenB = new Token(
      connection,
      mintb,
      ORIGINE_PROGRAMM_ID,
      selectedWallet)
    let userAccountB = await tokenB.createAccount(selectedWallet.publicKey)

    let poolToken = new Token(
      connection,
      new PublicKey(pooltoken),
      ORIGINE_PROGRAMM_ID,
      selectedWallet)
    let poolAccount = SWAP_PROGRAM_OWNER_FEE_ADDRESS ? await poolToken.createAccount(selectedWallet.publicKey) : null; //account pool
    let info;

    let programIdHello = new PublicKey("FRTtufPDTq76ZBTMif3uHpWPBiq7L7k592p7hJCscYVs")
    let [programAddress, nonce1] = await PublicKey.findProgramAddress(
      [userTransferAuthority.publicKey.toBuffer()],
      programIdHello,
    );

    const keys = [{ pubkey: tokenSwapPubkey, isSigner: false, isWritable: true },
    { pubkey: new PublicKey(authority), isSigner: false, isWritable: true },  //authority 
    { pubkey: userTransferAuthority.publicKey, isSigner: true, isWritable: true },
    { pubkey: userAccountA, isSigner: false, isWritable: true },
    { pubkey: new PublicKey(accounta), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(accountb), isSigner: false, isWritable: true },
    { pubkey: userAccountB, isSigner: false, isWritable: true },
    { pubkey: poolToken.publicKey, isSigner: false, isWritable: true },
    { pubkey: new PublicKey(feeaccount), isSigner: false, isWritable: true },
    { pubkey: ORIGINE_PROGRAMM_ID, isSigner: false, isWritable: true },
    { pubkey: poolAccount, isSigner: false, isWritable: true },
    { pubkey: programAddress, isSigner: false, isWritable: true },
    { pubkey: TOKEN_SWAP_PROGRAM_ID, isSigner: false, isWritable: true },
    { pubkey: userTransferAuthority.publicKey, isSigner: false, isWritable: false },
    ]

    const instruction = new TransactionInstruction({
      keys,
      programId: programIdHello,
      data: Buffer.from([nonce1]),

    });
    const transaction = new Transaction().add(instruction);
    transaction.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;

    transaction.feePayer = selectedWallet.publicKey;


    const signers = [userTransferAuthority];
    transaction.partialSign(...signers);

    let signed = await selectedWallet.signTransaction(transaction);

    let signature = await connection.sendRawTransaction(signed.serialize());

    let x = await connection.confirmTransaction(signature, 'max');
    console.log("signature " + JSON.stringify(signature))
    console.log("xxxx " + JSON.stringify(x))
    console.log("************** Info Account A After swap *******************")
  }
  return "ok"
}
