import {Token} from '../client/token';
const anchor = require("@project-serum/anchor");
const serumCmn = require("@project-serum/common");
const web3 = require("@project-serum/anchor").web3;
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
const decimals=6
const options = Provider.defaultOptions();
let tokenA=undefined
let vaultA=undefined
let tokenB=undefined
let vaultB=undefined
let marketMaker=undefined




export async function mintTokenAApi(selectedWallet , connection) {
 let provider= new Provider(connection, selectedWallet, options);
     [tokenA, vaultA ] = await createMintAndVault(
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
        TOKEN_PROGRAM_ID,
        selectedWallet // node only
      );

      console.log("mm pk => "+marketMaker.account.publicKey)
     const marketMakerTokenA = await mintAClient.createAccount(
        marketMaker.account.publicKey
      );
       let TOKEN_PROGRAM_ID1= new PublicKey(
        'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
       );

      console.log(JSON.stringify(marketMakerTokenA))
      let trans= await mintAClient.createAccount1(
        TOKEN_PROGRAM_ID1,
            vaultA,
            tokenA,
            marketMakerTokenA,
            selectedWallet,
            amount,
            decimals);
      /*console.log(JSON.stringify(marketMakerTokenA))
  
      await provider.send(
        (() => {
          tx = new Transaction();
          tx.add(
            Token.createTransferCheckedInstruction(
              TOKEN_PROGRAM_ID,
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
      return tx;*/
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

  export async function createMintAndVault(
    provider,
    amount,
    existingMint,
    owner,
    decimals
  ) {
    if (owner === undefined) {
      owner = provider.wallet.publicKey;
    }
    const mint = existingMint;
    const vault = new Account();
    const tx = new Transaction();
    tx.add(
      SystemProgram.createAccount({
        fromPubkey: provider.wallet.publicKey,
        newAccountPubkey: mint.publicKey,
        space: 82,
        lamports: await provider.connection.getMinimumBalanceForRentExemption(82),
        programId: TokenInstructions.TOKEN_PROGRAM_ID,
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
        programId: TokenInstructions.TOKEN_PROGRAM_ID,
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
  }