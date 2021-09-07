import {Token} from '../client/token';
import { newAccountWithLamports1 } from '../client/util/new-account-with-lamports';
const anchor = require("@project-serum/anchor");
const serumCmn = require("@project-serum/common");
const anchorWeb3 = require("@project-serum/anchor").web3;
const web3 = require("@solana/web3.js");

const USDC_PK="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"

const TOKEN_PROGRAM_ID = require("@solana/spl-token").TOKEN_PROGRAM_ID;
const TokenInstructions = require("@project-serum/serum").TokenInstructions;
const Market = require("@project-serum/serum").Market;
const DexInstructions = require("@project-serum/serum").DexInstructions;
const Connection = web3.Connection;
const BN = require("@project-serum/anchor").BN;
const Account = web3.Account;
const Transaction = web3.Transaction;
const PublicKey = web3.PublicKey;
const SystemProgram = web3.SystemProgram;
const Provider = anchor.Provider
const DEX_PID = new PublicKey("9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin");
const decimals=2
const options = Provider.defaultOptions();
let TOKEN_PROGRAM_ID1= new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
let tokenA:Token;
let vaultA=undefined
let tokenB=undefined
let vaultB=undefined
let marketMaker=undefined
let mintedAmount=100
let sentAmount=10
let owner



/*export async function mintTokenAApi(selectedWallet , connection) {
 let provider= new Provider(connection, selectedWallet, options);
     [tokenA, vaultA ] = await serumCmn.createMintAndVault(
        provider,
        new BN(100),
        undefined,
        decimals
      );
      console.log("token A => "+JSON.stringify(tokenA))
      console.log("vault A => "+JSON.stringify(vaultA))
      return {"tokenA":tokenA,"vaultA":vaultA}
}

export async function mintTokenBApi(selectedWallet , connection) {
    let provider= new Provider(connection, selectedWallet, options);
        [tokenB, vaultB ] = await serumCmn.createMintAndVault(
           provider,
           new BN(100),
           undefined,
           decimals
         );
         console.log("token B => "+JSON.stringify(tokenB))
         console.log("vault B => "+JSON.stringify(vaultB))
         return {"tokenB":tokenB,"vaultB":vaultB}
}*/
export async function createTokenAApi(selectedWallet, connection) {

 let token = new Token(
  connection,
  selectedWallet.publicKey,
  TOKEN_PROGRAM_ID1,
  selectedWallet)

tokenA = await token.createMint(
  connection,
  selectedWallet, 
  selectedWallet.publicKey,
  null,
  decimals,
  TOKEN_PROGRAM_ID1
);  
  console.log("mintA =>"+tokenA.publicKey.toBase58())
  return tokenA;
}

export async function createVaultAApi(selectedWallet, connection, tokenPk) {
  let testToken = new Token(
    connection,
    tokenPk,
    TOKEN_PROGRAM_ID1,
    selectedWallet
);
  vaultA = await testToken.createAccount(selectedWallet.publicKey);
  const accountInfo = await testToken.getAccountInfo(vaultA);
  return vaultA
}

export async function mintTokenAToVaultAApi(selectedWallet, connection, vault, tokenPk) {
  let testToken = new Token(
    connection,
    tokenPk,
    TOKEN_PROGRAM_ID1,
    selectedWallet
);

  // await testToken.mintTo(testAccount, testMintAuthority, [], 1000);
  console.log("token pk => "+ tokenPk)
  console.log("selected Wallet pk => "+ selectedWallet.publicKey)
  console.log("vault => "+ vault.publicKey)
  await testToken.mintTo(vault, selectedWallet, [], mintedAmount);
  const mintInfo = await testToken.getAccountInfo(tokenPk)
  return  mintInfo;
/*  await tokenA.mintTo(vaultA, selectedWallet.publicKey, [], mintedAmount); 
  const mintInfo = await tokenA.getMintInfo();*/
}

export async function createTokenBApi(selectedWallet, connection) {
  let owner = await newAccountWithLamports1(connection, 1000000000);
  tokenB = await Token.createMint(
    connection,
    selectedWallet,
    owner.publicKey,
    null,
    decimals,
    TOKEN_PROGRAM_ID1,
  );
  return tokenB;
}

export async function createVaultBApi(selectedWallet) {
  vaultB = await tokenB.createAccount(selectedWallet.publicKey);
  const accountInfo = await tokenB.getAccountInfo(vaultA);
  return vaultB
}

export async function mintTokenBToVaultBApi(selectedWallet) {
  await tokenB.mintTo(vaultB, selectedWallet.publicKey, [], mintedAmount); 
  const mintInfo = await tokenB.getMintInfo();
}


export async function createMMApi() {
    const MARKET_MAKER = new Account();
     marketMaker = {
      tokens: {},
      account: MARKET_MAKER,
    };
    return marketMaker
}

export async function sendLamportToMMApi(selectedWallet , connection) {
    let provider= new Provider(connection, selectedWallet, options);
    let tx=undefined;
    console.log("provider wallet => "+provider.wallet.publicKey)
    try{await provider.send(
        (() => {
          tx = new Transaction();
          tx.add(
            SystemProgram.transfer({
              fromPubkey: provider.wallet.publicKey,
              toPubkey: marketMaker.account.publicKey,
              lamports: 10000000,
            })
          );
          return tx;
        })()
      );} catch(error){
        console.log("error")
      }
      return tx;
}

export async function sendTokenAToMMApi(selectedWallet , connection) {
    let provider= new Provider(connection, selectedWallet, options);
    let tx=undefined;
    let amount=10
    console.log("provider wallet => "+provider.wallet.publicKey)
    
   
    const mintAClient = new Token(
        provider.connection,
        tokenA,
        TOKEN_PROGRAM_ID1,
        selectedWallet // node only
      );

      console.log("mm pk => "+marketMaker.account.publicKey)
      console.log("mm token pk => "+mintAClient.publicKey)
     const marketMakerTokenA = await mintAClient.createAccount(
        marketMaker.account.publicKey
      );
      console.log("mint pk => ")
      console.log(vaultA.publicKey)

    /*  console.log(JSON.stringify(marketMakerTokenA))
      let trans= await mintAClient.createAccount1(
        TOKEN_PROGRAM_ID1,
            vaultA,
            tokenA,
            marketMakerTokenA,
            selectedWallet,
            amount,
            decimals);
      console.log(JSON.stringify(marketMakerTokenA))*/
  
      await provider.send(
        (() => {
          tx = new Transaction();
          tx.add(
            Token.createTransferCheckedInstruction(
              TOKEN_PROGRAM_ID1,
              vaultA,
              tokenA,
              marketMakerTokenA,
              selectedWallet,
              [],
              amount,
              decimals
            )
          );
          return tx;
        })()
        );
      return tx;
}

 /* export async function mintTokenUSDCApi(selectedWallet , connection) {  
    const [USDC, vaultUSDC] = await createMintAndVaultFromExistingMint(
        provider,
        new BN(100),
        USDC_PK,
        undefined,
        decimals
      );
      console.log("token USDC => "+JSON.stringify(USDC))
      console.log("vault USDC => "+JSON.stringify(vaultUSDC))
  }*/

  /*export async function createMintAndVault(
    provider,
    amount,
    owner,
    decimals
  ) {
    if (owner === undefined) {
      owner = provider.wallet.publicKey;
    }
    const mint = new Account();
    const vault = new Account();
    const tx = new Transaction();
    tx.add(
      SystemProgram.createAccount({
        fromPubkey: provider.wallet.publicKey,
        newAccountPubkey: mint.publicKey,
        space: 82,
        lamports: await provider.connection.getMinimumBalanceForRentExemption(82),
        programId: TOKEN_PROGRAM_ID1,
      }),
      TokenInstructions.initializeMint({
        mint: mint.publicKey,
        decimals: decimals ?? 0,
        mintAuthority: provider.wallet.publicKey,
      }),
      SystemProgram.createAccount({
        fromPubkey: provider.wallet.publicKey,
        newAccountPubkey: vault.publicKey,
        space: 165,
        lamports: await provider.connection.getMinimumBalanceForRentExemption(
          165,
        ),
        programId: TOKEN_PROGRAM_ID1,
      }),
      TokenInstructions.initializeAccount({
        account: vault.publicKey,
        mint: mint.publicKey,
        owner,
      }),
      TokenInstructions.mintTo({
        mint: mint.publicKey,
        destination: vault.publicKey,
        amount,
        mintAuthority: provider.wallet.publicKey,
      }),
    );
    await provider.send(tx, [mint, vault]);
    return [mint.publicKey, vault.publicKey];
  }*/