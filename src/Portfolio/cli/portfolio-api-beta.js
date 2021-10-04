
     ////////////// portfolio beta

// @flow

import {
    Account,
    PublicKey
} from '@solana/web3.js';
import {
    Portfolio,
} from '../client/Portfolio';

let portfolio: Portfolio;
let portfolioAddress: Account;

const programId = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
     




export async function createPortfolioBeta(selectedWallet,connection) : Promise<void> {
        console.log ("start");
        //const connection = await getConnection();
        let payer = new Account([40,227,237,55,202,84,44,53,137,143,142,227,133,195,168,114,201,92,206,98,236,61,253,11,111,175,207,84,255,210,249,31,196,98,228,60,15,225,60,60,177,145,101,115,186,27,167,171,114,43,155,249,27,146,4,136,26,0,52,184,181,63,16,213]);
      //const payer = await newAccountWithLamports(connection, 1000000000  );
      
      portfolio = new Portfolio(
          connection,
        
         new PublicKey("GgtgE5HdAgmzioePYFsvTEGvdzPocjkT48MHkAeEixji"),
          programId,
          payer
      );
      
    //   let splm1  = new Token(
    //       connection,
    //       //new PublicKey("9ZFJWoBMQuYiBvbGpExs3smE59kQZbPnVmJp7F8iUsDG"),//devnet
    //       new PublicKey("9V6cJyRQaaadTBw6JgnMx1CR7air9m8AipuXK73w9msz"),
    //       TOKEN_PROGRAM_ID,
    //       payer
    //   );
      
          // devenet
        //let owner = new Account([253, 105, 193, 173, 55, 108, 145, 101, 186, 22, 187, 172, 156, 119, 173, 35, 25, 99, 80, 68, 92, 204, 232, 243, 67, 169, 199, 7, 218, 94, 225, 17, 173, 31, 39, 116, 250, 166, 211, 3, 213, 13, 179, 50, 47, 240, 7, 164, 48, 110, 143, 141, 244, 242, 74, 210, 185, 203, 0, 4, 138, 99, 110, 251]);
          //localnet npm 
          //5XwsdfW9gXB6LJu3d9QgXqiBc3qzUckqttwWUriVSYdp
          //let owner = new Account([30,95,50,226,80,133,228,187,235,122,156,209,22,130,91,82,53,113,38,80,129,4,64,122,222,209,91,245,231,178,134,231,31,215,120,37,86,187,187,233,49,156,163,254,122,61,97,74,61,170,156,52,242,229,91,13,156,60,30,33,18,42,45,129]);
       
         let metaDataUrl =  Buffer.from("aabbcc-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------" , "ascii");
        var metaDataHash = new Uint16Array([789]);
        console.log ("metaDataUrl  ",metaDataUrl );
        console.log ("metaDataHash  ",metaDataHash );
        
          let numberOfAsset = 1;
       
        let amountAsset1 = 2;
       //devnet
       // let splmAsset1 = await (await splm1.createAccountReturnAccount(owner.publicKey)).publicKey;
       //local net 
       let splmAsset1 = selectedWallet.publicKey; 
    console.log(selectedWallet.publicKey)
       
        let periodAsset1 = 123;
        console.log ("period asset 1 ",periodAsset1 );
        let assetToSoldIntoAsset1 =splmAsset1
      
      
      
         portfolioAddress = await portfolio.createPortfolio(selectedWallet , metaDataUrl , metaDataHash  ,
          numberOfAsset, amountAsset1 , splmAsset1 , periodAsset1 , assetToSoldIntoAsset1 ,
           );
           
          let accountInfo= await portfolio.getPortfolioInfo(portfolioAddress.publicKey);
          let addressAsset = [];
          let assetToSoldIntoAsset= [];
          let addressAssetSecond = [];
          let assetToSoldIntoAssetSecond= [];
          for (let i=1; i<33; i++){
              addressAsset.push(accountInfo.asset_data[i]);
          }
          let addressAssetPubKey = new PublicKey(addressAsset);
      
          if (numberOfAsset >1)
          
          for (let i=67; i<99; i++){
              addressAssetSecond.push(accountInfo.asset_data[i]);
          }
          let addressAssetPubKey2 = new PublicKey(addressAssetSecond);
      
          console.log("addressAssetPubKey ",addressAssetPubKey.toBase58());
          for (let j=34; j<66; j++){
              assetToSoldIntoAsset.push(accountInfo.asset_data[j]);
          }
      
          let assetToSoldIntoAssetPubKey = new PublicKey(assetToSoldIntoAsset);
      
          if (numberOfAsset >1)
          
          for (let j=100; j<132; j++){
              assetToSoldIntoAssetSecond.push(accountInfo.asset_data[j]);
          }
      
          let assetToSoldIntoAssetPubKey2 = new PublicKey(assetToSoldIntoAssetSecond);
          
      
          console.log ("********************************************************************************************************");
          console.log("************************************Info Portfolio Account *****************************");
          console.log("portfolioAddress : " + accountInfo.portfolioAddress +
           "--- creatorPortfolio : "+accountInfo.creatorPortfolio+
           " -- asset data  :" + accountInfo.asset_data[0,10]+
           " -- is_initialize :" + accountInfo.is_initialize +
           " -- asset_data_len :" + accountInfo.asset_data_len + 
           " --metadataUrl : " + accountInfo.metadataUrl+
           " --metadataHash : " + accountInfo.metadataHash+
           " -- asset data amount  :" + accountInfo.asset_data[0]+
           " -- asset data addressAsset  :" +addressAssetPubKey.toBase58()+
           " -- asset data periodAsset  :" + accountInfo.asset_data[33]+
           " -- asset data assetToSoldIntoAsset  :" + assetToSoldIntoAssetPubKey.toBase58()
           +
           " -- asset data amount2  :" + accountInfo.asset_data[66]+
           " -- asset data addressAsset2  :" +addressAssetPubKey2.toBase58()+
           " -- asset data periodAsset 2 :" + accountInfo.asset_data[99]+
           " -- asset data assetToSoldIntoAsset 2  :" + assetToSoldIntoAssetPubKey2.toBase58()
           );
          
          console.log("************************************end info Portfolio Account ******************************")
          console.log ("********************************************************************************************************");
      
           
      
      
      }


