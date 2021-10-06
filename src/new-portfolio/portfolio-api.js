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
} from '@solana/web3.js';
import {
    Portfolio,
} from './utils/Portfolio';


import { Token } from './utils/token';

// Loaded token program's program id
let programId: PublicKey=new PublicKey("GzFZzA5Hq4S1RuTCqSUPTpu57nU9JmTfSjFNNmGr8N83");
let associatedProgramId: PublicKey;
let portfolio: Portfolio;
let UserPortfolioAccount: Account;
let portfolioAddress: Account;
let ownerPortfolio: Account;
let splm1: Token;


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
        new PublicKey(portfolioAddressStr), // devnet
        programId,
        myAccount
    );

    let assetToSoldIntoAsset = new PublicKey(assetToSoldIntoAssetstr);
    let splmAsset = new PublicKey(splmAssetstr)
    let portfolioAddress=new PublicKey(portfolioAddressStr)

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