import {
    Token as SToken,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import {
    Account,
    Connection,
    BpfLoader,
    PublicKey,
    BPF_LOADER_PROGRAM_ID,
    TransactionInstruction,
    Transaction,
} from '@solana/web3.js';
import {
    Portfolio,
} from './utils/Portfolio';
import * as BufferLayout from 'buffer-layout';

import { Token } from '../client/token';

// Loaded token program's program id
let programId: PublicKey=new PublicKey("Bc2EsggSWKXnkzaA1dznwriYB3dA6f2sXivFSw64BgE9");
let associatedProgramId: PublicKey;
let portfolio: Portfolio;
let UserPortfolioAccount: Account;
let portfolioAddress: Account;
let ownerPortfolio: Account;
let splm1: Token;
const userTransferAuthority = new Account([155, 200, 249, 167, 10, 23, 75, 131, 118, 125, 114, 216, 128, 104, 178, 124, 197, 52, 254, 20, 115, 17, 181, 113, 249, 97, 206, 128, 236, 197, 223, 136, 12, 128, 101, 121, 7, 177, 87, 233, 105, 253, 150, 154, 73, 9, 56, 54, 157, 240, 189, 68, 189, 52, 172, 228, 134, 89, 160, 189, 52, 26, 149, 130]);
const createAccountProgram=new Account([86,  26, 243,  72,  46, 135, 186,  23,  31, 215, 229,43,  54,  89, 206, 222,  82,   6, 231, 212, 212, 226,184, 211, 107, 147, 180, 138,  57, 108, 182,  46, 185,33, 232, 144,  77,  70,  77, 145, 151, 152, 188,  19,78,  73,  32,  89, 236, 171,  90,  44, 120,  71, 202,142, 214, 179,  38,  85,  71, 103, 145, 193]);
//let programIdPortfolio = new PublicKey("Bc2EsggSWKXnkzaA1dznwriYB3dA6f2sXivFSw64BgE9")

export async function createPortfolioApi(myAccount, connection,splmAsset1str,amountAsset1,numberOfAsset,metaDataUrl,metaDataHashstr,periodAsset1): Promise<void> {
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

export async function addAssetToPortfolioApi(myAccount, connection,splmAssetstr,amountAsset,portfolioAddressStr,assetToSoldIntoAssetstr,periodAsset): Promise<void> {
    console.log("start");

    //let amountAsset = 5;
    //local net 
    //let splmAsset1 = owner.publicKey;

    //let periodAsset = 973;
    portfolio = new Portfolio(
        connection,
        new PublicKey(portfolioAddressStr+""), // devnet
        programId,
        myAccount
    );

    let assetToSoldIntoAsset = new PublicKey(assetToSoldIntoAssetstr);
    let splmAsset = new PublicKey(splmAssetstr)
    let portfolioAddress=new PublicKey(portfolioAddressStr+"")

    await portfolio.addAssetToPortfolio(portfolioAddressStr, myAccount, amountAsset,
        splmAsset, periodAsset, assetToSoldIntoAsset);
    return portfolioAddress

}

export async function createUserPortfolioApi(myAccount, connection,portfolioAddressStr): Promise<void> {
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


export async function depositPortfolioApi (myAccount, connection,   portfolioAddress,UserPortfolioAccount,
    TOKEN_PROGRAM_ID  , TOKEN_SWAP_PROGRAM_ID  ,amount ,asset1,asset2,asset3 ){    
      let splmPRIMARY= new Token(
        connection,
        new PublicKey(asset1.minta),
        new PublicKey(TOKEN_PROGRAM_ID),
        myAccount)
      //await splmPRIMARY.mintTo(new PublicKey (asset1.spluPRIMARY), myAccount, [], 100000);
     

            
      let splmAsset1= new Token(
        connection,
        new PublicKey(asset1.mintb),
        new PublicKey(TOKEN_PROGRAM_ID),
        myAccount)
        //await splmAsset1.mintTo(new PublicKey (asset1.managerAsset1), myAccount, [], 100000);

        let splmPRIMARY3= new Token(
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
    

  
      const keys=[
        {pubkey: new PublicKey(portfolioAddress), isSigner: false, isWritable: false},
        {pubkey: new PublicKey(UserPortfolioAccount), isSigner: false, isWritable: false},         
        {pubkey: new PublicKey(asset1.tokenSwap), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset1.autority), isSigner: false, isWritable: true},  //authority 
        {pubkey: userTransferAuthority.publicKey, isSigner: true, isWritable: true},
        {pubkey: new PublicKey(asset1.spluPRIMARY), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset1.managerPRIMARY), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset1.managerAsset1), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset1.spluAsset1), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset1.tokenPool), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset1.feeAccount), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(TOKEN_PROGRAM_ID), isSigner: false, isWritable: false},
        {pubkey: new PublicKey(asset1.tokenAccountPool), isSigner: false, isWritable: true},
        {pubkey: programAddress, isSigner: false, isWritable: false},
        {pubkey: new PublicKey(TOKEN_SWAP_PROGRAM_ID), isSigner: false, isWritable: false},
        {pubkey: createAccountProgram.publicKey,isSigner:false,isWritable:false},
      ];

      const keys2=[
        {pubkey: new PublicKey(portfolioAddress), isSigner: false, isWritable: false},
        {pubkey: new PublicKey(UserPortfolioAccount), isSigner: false, isWritable: false},         
        {pubkey: new PublicKey(asset2.tokenSwap), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset2.autority), isSigner: false, isWritable: true},  //authority 
        {pubkey: userTransferAuthority.publicKey, isSigner: true, isWritable: true},
        {pubkey: new PublicKey(asset2.spluPRIMARY), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset2.managerPRIMARY), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset2.managerAsset1), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset2.spluAsset1), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset2.tokenPool), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset2.feeAccount), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(TOKEN_PROGRAM_ID), isSigner: false, isWritable: false},
        {pubkey: new PublicKey(asset2.tokenAccountPool), isSigner: false, isWritable: true},
        {pubkey: programAddress, isSigner: false, isWritable: false},
        {pubkey: new PublicKey(TOKEN_SWAP_PROGRAM_ID), isSigner: false, isWritable: false},
        {pubkey: createAccountProgram.publicKey,isSigner:false,isWritable:false},
      ];

      const keys3=[
        {pubkey: new PublicKey(portfolioAddress), isSigner: false, isWritable: false},
        {pubkey: new PublicKey(UserPortfolioAccount), isSigner: false, isWritable: false},         
        {pubkey: new PublicKey(asset3.tokenSwap), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset3.autority), isSigner: false, isWritable: true},  //authority 
        {pubkey: userTransferAuthority.publicKey, isSigner: true, isWritable: true},
        {pubkey: new PublicKey(asset3.spluPRIMARY), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset3.managerPRIMARY), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset3.managerAsset1), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset3.spluAsset1), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset3.tokenPool), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset3.feeAccount), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(TOKEN_PROGRAM_ID), isSigner: false, isWritable: false},
        {pubkey: new PublicKey(asset3.tokenAccountPool), isSigner: false, isWritable: true},
        {pubkey: programAddress, isSigner: false, isWritable: false},
        {pubkey: new PublicKey(TOKEN_SWAP_PROGRAM_ID), isSigner: false, isWritable: false},
        {pubkey: createAccountProgram.publicKey,isSigner:false,isWritable:false},
      ];

      const dataLayout = BufferLayout.struct([
        BufferLayout.u8('instruction'),
        BufferLayout.u8('amount_deposit'),
        BufferLayout.u8('nonce'),
    ]);

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode({
            instruction: 17, // deposit instruction
            amount_deposit:amount,
            nonce
        },
        data,
    );


  const instruction = new TransactionInstruction({
    keys,
    programId:programId,
    data, 

  });
  const instruction2 = new TransactionInstruction({
    keys:keys2,
    programId:programId,
    data, 
  });

  const instruction3 = new TransactionInstruction({
    keys:keys3,
    programId:programId,
    data, 
  });

  const instruction4= Portfolio.addSpluToUserPortfolioInstruction(
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

  const transaction = new Transaction().add(instruction,instruction2 );
  const transaction1 = new Transaction().add(instruction3 , instruction4);
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash()
  ).blockhash;

  transaction1.recentBlockhash = (
    await connection.getRecentBlockhash()
  ).blockhash;

  transaction.feePayer =myAccount.publicKey;
  transaction1.feePayer =myAccount.publicKey;


  const signers = [userTransferAuthority];
  transaction.partialSign(...signers);
  transaction1.partialSign(...signers);

  let signed = await myAccount.signTransaction(transaction);
  let signed1 = await myAccount.signTransaction(transaction1);

  let signature  = "";
  let signature1  = "";
      signature = await connection.sendRawTransaction(signed.serialize());
      signature1 = await connection.sendRawTransaction(signed1.serialize());

    if(signature!=""&&signature1!="")
    {
    let x=await connection.confirmTransaction(signature, 'max');
    let x1=await connection.confirmTransaction(signature1, 'max');
    console.log("signature "+JSON.stringify(signature))
    console.log("signature "+JSON.stringify(signature1))
  console.log("resultConfirmTrx "+JSON.stringify(x))
  console.log("resultConfirmTrx1 "+JSON.stringify(x1))
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


export async function withdrawPortfolioApi (myAccount, connection,   portfolioAddress,UserPortfolioAccount,
    TOKEN_PROGRAM_ID  , TOKEN_SWAP_PROGRAM_ID  ,amount ,asset1,asset2,asset3 ){    
      /*let splmPRIMARY= new Token(
        connection,
        new PublicKey(asset1.minta),
        new PublicKey(TOKEN_PROGRAM_ID),
        myAccount)*/
      //await splmPRIMARY.mintTo(new PublicKey (asset1.spluPRIMARY), myAccount, [], 100000);
     

            
      let splmAsset1= new Token(
        connection,
        new PublicKey(asset1.mintb),
        new PublicKey(TOKEN_PROGRAM_ID),
        myAccount)
        //await splmAsset1.mintTo(new PublicKey (asset1.managerAsset1), myAccount, [], 100000);

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


      let [programAddress, nonce] = await PublicKey.findProgramAddress(
        [createAccountProgram.publicKey.toBuffer()],
        programId,
      );
    

  
      const keys=[
        {pubkey: new PublicKey(portfolioAddress), isSigner: false, isWritable: false},
        {pubkey: new PublicKey(UserPortfolioAccount), isSigner: false, isWritable: false},         
        {pubkey: new PublicKey(asset1.tokenSwap), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset1.autority), isSigner: false, isWritable: true},  //authority 
        {pubkey: userTransferAuthority.publicKey, isSigner: true, isWritable: true},
        {pubkey: new PublicKey(asset1.spluAsset1), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset1.managerAsset1), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset1.managerPRIMARY), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset1.spluPRIMARY ), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset1.tokenPool), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset1.feeAccount), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(TOKEN_PROGRAM_ID), isSigner: false, isWritable: false},
        {pubkey: new PublicKey(asset1.tokenAccountPool), isSigner: false, isWritable: true},
        {pubkey: programAddress, isSigner: false, isWritable: false},
        {pubkey: new PublicKey(TOKEN_SWAP_PROGRAM_ID), isSigner: false, isWritable: false},
        {pubkey: createAccountProgram.publicKey,isSigner:false,isWritable:false},
      ];

      const keys2=[
        {pubkey: new PublicKey(portfolioAddress), isSigner: false, isWritable: false},
        {pubkey: new PublicKey(UserPortfolioAccount), isSigner: false, isWritable: false},         
        {pubkey: new PublicKey(asset2.tokenSwap), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset2.autority), isSigner: false, isWritable: true},  //authority 
        {pubkey: userTransferAuthority.publicKey, isSigner: true, isWritable: true},
        {pubkey: new PublicKey(asset2.spluPRIMARY), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset2.managerPRIMARY), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset2.managerAsset1), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset2.spluAsset1), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset2.tokenPool), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(asset2.feeAccount), isSigner: false, isWritable: true},
        {pubkey: new PublicKey(TOKEN_PROGRAM_ID), isSigner: false, isWritable: false},
        {pubkey: new PublicKey(asset2.tokenAccountPool), isSigner: false, isWritable: true},
        {pubkey: programAddress, isSigner: false, isWritable: false},
        {pubkey: new PublicKey(TOKEN_SWAP_PROGRAM_ID), isSigner: false, isWritable: false},
        {pubkey: createAccountProgram.publicKey,isSigner:false,isWritable:false},
      ];


      const dataLayout = BufferLayout.struct([
        BufferLayout.u8('instruction'),
        BufferLayout.u8('amount_withdraw'),
        BufferLayout.u8('nonce'),
    ]);

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode({
            instruction: 18, // deposit instruction
            amount_withdraw:amount,
            nonce
        },
        data,
    );


  const instruction = new TransactionInstruction({
    keys,
    programId:programId,
    data, 

  });
  /*const instruction2 = new TransactionInstruction({
    keys:keys2,
    programId:programId,
    data, 
  });*/

  const transaction = new Transaction().add(instruction);
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash()
  ).blockhash;

  transaction.feePayer =myAccount.publicKey;


  const signers = [userTransferAuthority];
  transaction.partialSign(...signers);

  let signed = await myAccount.signTransaction(transaction);

    let signature = await connection.sendRawTransaction(signed.serialize());

    let x=await connection.confirmTransaction(signature, 'max');
    console.log("signature "+JSON.stringify(signature))
  console.log("xxxx "+JSON.stringify(x))
  console.log("************** Info Account A After swap *******************")


  return signature
}