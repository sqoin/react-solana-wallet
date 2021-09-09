import { Token } from "@solana/spl-token";
import {Token as SToken} from "../../client/token"
import {
    Account,
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
} from "@solana/web3.js";

import { StableSwap } from "../index";
import { DEFAULT_TOKEN_DECIMALS, TOKEN_PROGRAM_ID } from "../constants";
import {
    DEFAULT_FEE_DENOMINATOR,
    DEFAULT_FEE_NUMERATOR,
    Fees,
} from "../fees";
import { sendAndConfirmTransaction } from "../util/send-and-confirm-transaction";
import { getDeploymentInfo, newAccountWithLamports, sleep } from "./helpers";
import { publicKey } from "../../client/layout";

// Cluster configs
const CLUSTER_URL = "http://api.devnet.solana.com";
const BOOTSTRAP_TIMEOUT = 300000;
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
// Initial amount in each swap token
const INITIAL_TOKEN_A_AMOUNT = LAMPORTS_PER_SOL;
const INITIAL_TOKEN_B_AMOUNT = LAMPORTS_PER_SOL;
// Cluster connection
let connection: Connection;
// Fee payer
let payer: Account;
// authority of the token and accounts
let authority: PublicKey;
// nonce used to generate the authority public key
let nonce: number;
// owner of the user accounts
let owner: Account;
// Token pool
let tokenPool: Token;
let userPoolAccount: PublicKey;
// Tokens swapped
let mintA: SToken;
let mintB: SToken;
let tokenAccountA: PublicKey;
let tokenAccountB: PublicKey;
// Admin fee accounts
let adminFeeAccountA: PublicKey;
let adminFeeAccountB: PublicKey;
// Stable swap
let stableSwap: StableSwap;
let stableSwapAccount: Account;
let stableSwapProgramId: PublicKey;
export async function depositNewPool(wallet, connection) {
   // connection = new Connection(CLUSTER_URL, "single");
    /*  payer = await newAccountWithLamports(connection, LAMPORTS_PER_SOL);
     owner = await newAccountWithLamports(connection, LAMPORTS_PER_SOL); */
    owner = new Account([97, 30, 31, 33, 13, 91, 4, 73, 57, 214, 172, 115, 44, 20, 255, 207, 156, 101, 25, 224, 7, 2, 170, 146, 20, 213, 165, 241, 211, 14, 76, 95, 123, 128, 140, 138, 192, 242, 113, 62, 119, 27, 79, 105, 116, 153, 140, 191, 215, 220, 88, 150, 210, 137, 231, 88, 23, 142, 210, 51, 240, 144, 106, 241]);
    payer = new Account([97, 30, 31, 33, 13, 91, 4, 73, 57, 214, 172, 115, 44, 20, 255, 207, 156, 101, 25, 224, 7, 2, 170, 146, 20, 213, 165, 241, 211, 14, 76, 95, 123, 128, 140, 138, 192, 242, 113, 62, 119, 27, 79, 105, 116, 153, 140, 191, 215, 220, 88, 150, 210, 137, 231, 88, 23, 142, 210, 51, 240, 144, 106, 241]);
    let PubstableSwap = new PublicKey("AS3bUoPQJ8jUDRdjTL4Q4JYkkWtnAqvsRGzCwuYyrBgG");
    let authority = new PublicKey("5VfW5qTVB6nLPJNFfowSQAMsSHTfb8m7o4R3wXsugCGa");
    let nonce = 255;

    let adminFeeAccountA = new PublicKey("83TMtwgZTueCQ5Hn4V533VDnSUAo7iCgao87CYGqFiuy");
    let adminFeeAccountB = new PublicKey("4PgEJ83Jm7Cpnji8LTLTecAYV9a1or5PenDmfUnYVeCE");

    let mintA = new SToken(
        connection,
        new PublicKey("yJnXn9pGCUFvkDXgKN77NX3JDUypa46utgKimV5N3qh"),
        TOKEN_PROGRAM_ID,
        payer);
    let tokenAccountA = new PublicKey("DgW56xkCTTrdKJCU2tuNcWqUauEfkhp9fHSzoZEVagtj");
    let userAccountA = new PublicKey("9AqQ7dxj17CLmiXm7Ze7ZNPQ1G11hTxg5tkozBzXCi5S");

    let mintB = new SToken(
        connection,
        new PublicKey("4iefEHxfd55hoqHFnp9bf7bA36iFh9pZ9y37med9BJRC"),
        TOKEN_PROGRAM_ID,
        payer);
    let tokenAccountB = new PublicKey("Bd7xHfFAcDZoLCA3o4dDTnAp6Uyqg9icRik4XHkRobsL");
    let userAccountB = new PublicKey("DLPH55MUW9mqeQ681c3MtY8tbezxRpWwK4hDeiZehf4r");

    let tokenPool = new SToken(
        connection,
        new PublicKey("4NTUQ9N7wg2eBPH14AvkXLLhiAeKNAbipULEcHfsw9v1"),
        TOKEN_PROGRAM_ID,
        payer);
    let userPoolAccount = new PublicKey("96NTpYSrEtGyCSTWuVxmeak6hPTbcyptf1GZEcHtsefU")
    let swapProgramId = new PublicKey("4LuNy5KrqDkGNZygxUhJSmhcd97Fpqp6StXDnGfXtYg3");
    let tokenProgramId = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

    let AMP_FACTOR = 1000;

    let tokenAmountA = 1000;
    let tokenAmountB = 1000;
    let minimumPoolTokenAmount = 0;
    let stableSwapAccount = new Account([24, 140, 79, 106, 148, 74, 143, 61, 122, 204, 9, 55, 154, 251, 12, 174, 8, 71, 171, 18, 56, 149, 82, 95, 75, 60, 211, 31, 129, 86, 134, 128, 140, 35, 162, 218, 43, 221, 32, 224, 46, 49, 26, 167, 3, 47, 178, 162, 25, 140, 219, 189, 43, 58, 112, 73, 96, 139, 7, 78, 221, 98, 180, 213])
    let stableSwap = new StableSwap(
        connection,
        PubstableSwap,
        swapProgramId,
        tokenProgramId,
        tokenPool.publicKey,
        authority,
        owner.publicKey,
        adminFeeAccountA,
        adminFeeAccountB,
        tokenAccountA,
        tokenAccountB, mintA.publicKey,
        mintB.publicKey,
        AMP_FACTOR, 10, 150, 150000, FEES);
        console.log("stableSwap :", stableSwap.stableSwap.toString())
    stableSwapProgramId = getDeploymentInfo().stableSwapProgramId;
    let infoBefore;
    let ret=[];
    //await mintA.mintToStable(tokenAccountA, wallet, [], 7000000000);
    infoBefore = await mintA.getAccountInfo(tokenAccountA);
    console.log("amount tokenAccountA : "+infoBefore.amount.toNumber())
    await mintA.approve(userAccountA, authority, wallet, [], 10000);
    infoBefore = await mintA.getAccountInfo(userAccountA);
    ret.push({"infoBeforeA":infoBefore})
     console.log("info of userAccount A before deposit ");
     console.log("mint A : ",infoBefore.mint.toString()," address account : ",infoBefore.address.toString(), " amount mint A :",infoBefore.amount.toNumber())
     console.log("****************************************")
   // await mintB.mintToStable(tokenAccountB, wallet, [], 7000000000);
    await mintB.approve(userAccountB, authority, wallet, [], 10000);
    infoBefore = await mintB.getAccountInfo(userAccountB);
    ret.push({"infoBeforeB":infoBefore})
    console.log("info of userAccount B before deposit ");
    console.log("mint B : ",infoBefore.mint.toString()," address account : ",infoBefore.address.toString(), " amount mint B :",infoBefore.amount.toNumber())
    console.log("****************************************")

    infoBefore = await tokenPool.getAccountInfo(userPoolAccount);
    ret.push({"infoPoolBefore":infoBefore})
    console.log("info of userAccount Pool before deposit ");
    console.log("mint Pool : ",infoBefore.mint.toString()," address account : ",infoBefore.address.toString(), " amount mint Pool :",infoBefore.amount.toNumber())
    console.log("****************************************");

    let transaction=stableSwap.deposit(userAccountA,userAccountB,userPoolAccount,tokenAmountA,tokenAmountB,minimumPoolTokenAmount);

    transaction.recentBlockhash = (
        await connection.getRecentBlockhash()
      ).blockhash;
      transaction.feePayer = wallet.publicKey;
      //transaction.setSigners(payer.publicKey, mintAccount.publicKey );
     // transaction.partialSign(newAccountPortfolio);
  
      let signed = await wallet.signTransaction(transaction);
      
     //   addLog('Got signature, submitting transaction');
        let signature = await connection.sendRawTransaction(signed.serialize());
  
      let x=  await connection.confirmTransaction(signature, 'max');
     
      infoBefore = await mintA.getAccountInfo(userAccountA);
    ret.push({"infoAfterA":infoBefore})
     console.log("info of userAccount A After deposit ");
     console.log("mint A : ",infoBefore.mint.toString()," address account : ",infoBefore.address.toString(), " amount mint A :",infoBefore.amount.toNumber())
     console.log("****************************************")

     infoBefore = await mintB.getAccountInfo(userAccountB);
    ret.push({"infoAfterB":infoBefore})
    console.log("info of userAccount B After deposit ");
    console.log("mint B : ",infoBefore.mint.toString()," address account : ",infoBefore.address.toString(), " amount mint B :",infoBefore.amount.toNumber())
    console.log("****************************************")

    infoBefore = await tokenPool.getAccountInfo(userPoolAccount);
    ret.push({"infoPoolAfter":infoBefore})
    console.log("info of userAccount Pool After deposit ");
    console.log("mint Pool : ",infoBefore.mint.toString()," address account : ",infoBefore.address.toString(), " amount mint Pool :",infoBefore.amount.toNumber())
    console.log("****************************************");

      console.log("signature "+JSON.stringify(signature)) 
     
   // await sendAndConfirmTransaction("deposit", connection, deposit, wallet);
   
    return ret;
}
