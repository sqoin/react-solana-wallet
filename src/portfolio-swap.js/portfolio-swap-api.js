import { createTokenSwapA } from "../cli/token-test";

import {
    Account,
  
    PublicKey,
  
    TransactionInstruction,
    Transaction,
  
  } from '@solana/web3.js';

  
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
        console.log(i+" account "+accounts[i].account,"poolToken " +poolToken.publicKey, "accountPool "+accountPool, "feeAccount "+feeAccount) 
        let infoPool = { "account":accounts[i],"poolToken": poolToken.publicKey, "accountPool": accountPool, "feeAccount": feeAccount }
        pools.push(infoPool);
    }
    return pools
}

export async function createSwapTokensApi(selectedWallet, connection,userToken,userVault, pools): Promise<void> {

    for (let i=0;i<pools.length;i++){
    let accountb=pools[i].account.account;
    let mintb=pools[i].account.asset.token
    let pooltoken=pools[i].poolToken
    let feeaccount=pools[i].feeAccount
    let accountpool=pools[i].accountPool
    let autority=pools[i].account.asset.authority
    let nonce=pools[i].account.asset.nonce
    console.log("createAccountProgramm ",createAccountProgramm.publicKey.toBase58()," minta "+userToken+" mintB "+mintb+" accounta "+userVault+" accountb "+accountb+" pooltoken "+pooltoken+" feeacoount "+feeaccount+" accountpool "+accountpool+" autority "+autority+" nonce "+nonce)
      let tokenSwap=new TokenSwap(connection,null,null,null,new PublicKey(pooltoken),new PublicKey(feeaccount),new PublicKey(autority),new PublicKey(userVault),new PublicKey(accountb), new PublicKey(userToken),new PublicKey(mintb),null,null,null,null,null,null,null,null,null,selectedWallet)
      testTokenSwap = await tokenSwap.createTokenSwap(
        connection,
        selectedWallet,
        createAccountProgramm,
        new PublicKey(autority),
        new PublicKey(userVault),
        new PublicKey(accountb),
        new PublicKey(pooltoken),
        new PublicKey(userToken),
        new PublicKey(mintb),
        new PublicKey(feeaccount),
        new PublicKey(accountpool),
        TOKEN_SWAP_PROGRAM_ID,
        new PublicKey(ORIGINE_PROGRAMM_ID),
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
        }
      
      return testTokenSwap;
        
    }
