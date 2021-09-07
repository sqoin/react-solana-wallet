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
let mintedAmount=1000
let sentAmount=10

export async function createTokenApi(selectedWallet, connection) {

 let token = new Token(
  connection,
  selectedWallet.publicKey,
  TOKEN_PROGRAM_ID1,
  selectedWallet)

let tokenA = await token.createMint(
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

export async function createVaultApi(selectedWallet, connection, tokenPk) {
  let testToken = new Token(
    connection,
    tokenPk,
    TOKEN_PROGRAM_ID1,
    selectedWallet
);
  let vaultA = await testToken.createAccount(selectedWallet.publicKey);
  const accountInfo = await testToken.getAccountInfo(vaultA);
  return vaultA
}

export async function mintTokenToVaultApi(selectedWallet, connection, vaultPk, tokenPk) {
  
  let testToken = new Token(
    connection,
    new PublicKey(tokenPk),
    new PublicKey( TOKEN_PROGRAM_ID1 ),
    selectedWallet
);
  console.log("token pk => "+ tokenPk)
  console.log("selected Wallet pk => "+ selectedWallet.publicKey)
  console.log("vault => "+ vaultPk)
  await testToken.mintTo(vaultPk, selectedWallet, [], mintedAmount);
  const mintInfo = await testToken.getAccountInfo(new PublicKey(vaultPk))
  return  mintInfo;
}

export async function createMMApi() {
    const MARKET_MAKER = new Account();
    return MARKET_MAKER.publicKey
}

export async function sendLamportApi(selectedWallet , connection, to) {
    let provider= new Provider(connection, selectedWallet, options);
    let tx=undefined;
    console.log("provider wallet => "+provider.wallet.publicKey)
    try{await provider.send(
        (() => {
          tx = new Transaction();
          tx.add(
            SystemProgram.transfer({
              fromPubkey: provider.wallet.publicKey,
              toPubkey: to,
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

export async function sendTokenApi(selectedWallet , connection, tokenPk, vault, to) {
    let provider= new Provider(connection, selectedWallet, options);
    let tx=undefined;
    console.log("provider wallet => "+provider.wallet.publicKey)
    const mintAClient = new Token(
        provider.connection,
        tokenPk,
        TOKEN_PROGRAM_ID1,
        selectedWallet // node only
      );

      console.log("mm pk => "+to)
      console.log("token pk => "+tokenPk)
     const marketMakerTokenA = await mintAClient.createAccount(
        to
      );
      console.log("vault pk => ")
      console.log(vault)

    /*  console.log(JSON.stringify(marketMakerTokenA))
      let trans= await mintAClient.createAccount1(
        TOKEN_PROGRAM_ID1,
            vaultA,
            tokenA,
            marketMakerTokenA,
            selectedWallet,
            amount,
            decimals);*/
      console.log("MM token => "+JSON.stringify(marketMakerTokenA))
  
      await provider.send(
        (() => {
          tx = new Transaction();
          tx.add(
            Token.createTransferCheckedInstruction(
              TOKEN_PROGRAM_ID1,
              new PublicKey(vault),
              new PublicKey(tokenPk),
              marketMakerTokenA.publicKey,
              selectedWallet,
              [],
              sentAmount,
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