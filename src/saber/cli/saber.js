import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {Token as SToken} from "../../client/token"
import {
    Account,
    PublicKey,
    SYSVAR_CLOCK_PUBKEY,
    Transaction,TransactionInstruction
} from "@solana/web3.js";


// Fee payer


export async function depositNewPool(wallet, connection) {
    const programId=new PublicKey("6HDDmMvR4LGyXke43as8FiPJW1hnWi4cCw98ShJWeuop")

    let createAccountProgramm=new Account([86,  26, 243,  72,  46, 135, 186,  23,  31, 215, 229,43,  54,  89, 206, 222,  82,   6, 231, 212, 212, 226,184, 211, 107, 147, 180, 138,  57, 108, 182,  46, 185,33, 232, 144,  77,  70,  77, 145, 151, 152, 188,  19,78,  73,  32,  89, 236, 171,  90,  44, 120,  71, 202,142, 214, 179,  38,  85,  71, 103, 145, 193]);
    let [programAddress, nonce] = await PublicKey.findProgramAddress(
      [createAccountProgramm.publicKey.toBuffer()],
      programId,
     ); 
  let owner = new Account([97, 30, 31, 33, 13, 91, 4, 73, 57, 214, 172, 115, 44, 20, 255, 207, 156, 101, 25, 224, 7, 2, 170, 146, 20, 213, 165, 241, 211, 14, 76, 95, 123, 128, 140, 138, 192, 242, 113, 62, 119, 27, 79, 105, 116, 153, 140, 191, 215, 220, 88, 150, 210, 137, 231, 88, 23, 142, 210, 51, 240, 144, 106, 241]);
  // let  payer = new Account([97, 30, 31, 33, 13, 91, 4, 73, 57, 214, 172, 115, 44, 20, 255, 207, 156, 101, 25, 224, 7, 2, 170, 146, 20, 213, 165, 241, 211, 14, 76, 95, 123, 128, 140, 138, 192, 242, 113, 62, 119, 27, 79, 105, 116, 153, 140, 191, 215, 220, 88, 150, 210, 137, 231, 88, 23, 142, 210, 51, 240, 144, 106, 241]);
    let PubstableSwap = new PublicKey("68zM78i1wcLwuLHhrbohhCTrKHQoNutXA2GE6zgB9Awp");
    let authority = new PublicKey("AVzeFZfHvNEECBkC2yYx2MF1ygPqZLuA8Ah4rjiuQjqK");
 
    let mintA=new SToken(
        connection,
        new PublicKey("8pCUffRGL85UVwgeCDxRxNEcmrYxk5NNU6YC2q7N5gUf"),
        TOKEN_PROGRAM_ID,
        wallet
      );
      let mintB=new SToken(
        connection,
        new PublicKey("8FReymwGe4TDD6dtFXQaLS91jzu7r7NppRSQRquNyG1k"),
        TOKEN_PROGRAM_ID,
        wallet
      );
      let tokenAccountA = new PublicKey("5iBVsTVQPJddN1buoe1H9a8FrjjhT4xr9tGmhj3nc2kH");
      let userAccountA = new PublicKey("FbTKne3ckqiyWyVPuCPjGnDJ4RGQLhvXrxZrh8NmbcUg");
   
     
      let tokenAccountB = new PublicKey("CjeKi3dMU3bSQmXyiLRx2ZHGfvCUKLpe9ov1eYGwpC8m");
      let userAccountB = new PublicKey("CJ2CZ1ofTYLX19gzzPkq42vw1z8HBNwqB6pbyWTme3Rz");
  
      let tokenPool = new SToken(
        connection,
        new PublicKey("FVoFxQgGohwpUawFfdEUkUqeLkHUQbantMZuhBVDCTcs"),
        TOKEN_PROGRAM_ID,
        wallet);
    let userPoolAccount = new PublicKey("8bt21zybbFFBgwwapyY8uREtquHvAVt8ZuDyEiNwUdfS")
    let stableSwapProgramId = new PublicKey("2J67FeJ4CGjtunyvh3BtBsgEbQwkdpYhSD3ALZPK8fUY");
   
    let tokenAmountA = 1000;
    let tokenAmountB = 1000;
    let minimumPoolTokenAmount = 0;
    
         let infoBefore;
    let ret=[];
    //await mintA.mintToStable(tokenAccountA, wallet, [], 7000000000);
    infoBefore = await mintA.getAccountInfo(tokenAccountA);
    console.log("amount tokenAccountA : "+infoBefore.amount.toNumber())
    //await mintA.approve(userAccountA, authority, owner, [], 1000,connection);
    infoBefore = await mintA.getAccountInfo(userAccountA);
    ret.push({"infoBeforeA":infoBefore})
     console.log("info of userAccount A before deposit ");
     console.log("mint A : ",infoBefore.mint.toString()," address account : ",infoBefore.address.toString(), " amount mint A :",infoBefore.amount.toNumber())
     console.log("****************************************")
   // await mintB.mintToStable(tokenAccountB, wallet, [], 7000000000);
  // await mintB.approve(userAccountB, authority, owner, [], 1000,connection);
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
        { pubkey:stableSwapProgramId, isSigner: false, isWritable: false },
  
      ];
      let data=Buffer.from([nonce,tokenAmountA,tokenAmountB,minimumPoolTokenAmount]);
      const instruction = new TransactionInstruction({
        keys,
        programId,
        data, // All instructions are hellos
      });
      const transaction=new Transaction();
      transaction.add(instruction);
      transaction.recentBlockhash = (
        await connection.getRecentBlockhash()
      ).blockhash;
    
      transaction.feePayer =wallet.publicKey;
    
    
    
      let signed = await wallet.signTransaction(transaction);
    
        let signature = await connection.sendRawTransaction(signed.serialize());
    
        let x=await connection.confirmTransaction(signature, 'max');
     
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
