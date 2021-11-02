// @flow

import {
    Account,
    PublicKey
} from '@solana/web3.js';
import {
    PortfolioAsset,
} from '../client/PortfolioAsset';

let programId: PublicKey;
let portfolio: PortfolioAsset;
let UserPortfolioAccount: Account;
let portfolioAddress: Account;

export async function createPortfolio(selectedWallet, connection, token, metaDataUrl,
    asset1, amountAsset1, periodAsset1, asset2, amountAsset2, periodAsset2, asset3, amountAsset3, periodAsset3,
    asset4, amountAsset4, periodAsset4, asset5, amountAsset5, periodAsset5, asset6, amountAsset6,
    periodAsset6, asset7, amountAsset7, periodAsset7, asset8, amountAsset8, periodAsset8, asset9, amountAsset9, periodAsset9): Promise<void> {
   // programId = new PublicKey("AX9kkGLpKn9H2bcHgP4YDi2QQCeQEfWjpi5W7EvM5doJ");
    programId = new PublicKey("DkkfzUvBVdYztDynBcXJoCA1ajANDfjENgE37hSpoakw");
    portfolio = new PortfolioAsset(
        connection,
        new PublicKey(token),
        programId,
        selectedWallet.publicKey
    );
    let metaDataUrl1 = metaDataUrl;
    var metaDataHash = new Uint16Array([789]);

    let sentinelAccountAddress = new PublicKey("4A3a33ozsqA6ihMXRAzYeNwZv4df9RfJoLPh6ycZJVhE")

    asset1 = asset1 ? new PublicKey(asset1) : sentinelAccountAddress;
    let assetToSoldInto1 = assetToSoldInto1 ? new PublicKey(assetToSoldInto1) : sentinelAccountAddress;

    asset2 = asset2 ? new PublicKey(asset2) : sentinelAccountAddress;
    let assetToSoldInto2 = assetToSoldInto2 ? new PublicKey(assetToSoldInto2) : sentinelAccountAddress;

    asset3 = asset3 ? new PublicKey(asset3) : sentinelAccountAddress;
    let assetToSoldInto3 = assetToSoldInto3 ? new PublicKey(assetToSoldInto3) : sentinelAccountAddress;

    asset4 = asset4 ? new PublicKey(asset4) : sentinelAccountAddress;
    let assetToSoldInto4 = assetToSoldInto4 ? new PublicKey(assetToSoldInto4) : sentinelAccountAddress;

    asset5 = asset5 ? new PublicKey(asset5) : sentinelAccountAddress;
    let assetToSoldInto5 = assetToSoldInto5 ? new PublicKey(assetToSoldInto5) : sentinelAccountAddress;

    asset6 = asset6 ? new PublicKey(asset6) : sentinelAccountAddress;
    let assetToSoldInto6 = assetToSoldInto6 ? new PublicKey(assetToSoldInto6) : sentinelAccountAddress;

    asset7 = asset7 ? new PublicKey(asset7) : sentinelAccountAddress;
    let assetToSoldInto7 = assetToSoldInto7 ? new PublicKey(assetToSoldInto7) : sentinelAccountAddress;

    asset8 = asset8 ? new PublicKey(asset8) : sentinelAccountAddress;
    let assetToSoldInto8 = assetToSoldInto8 ? new PublicKey(assetToSoldInto8) : sentinelAccountAddress;


    asset9 = asset9 ? new PublicKey(asset9) : sentinelAccountAddress;
    let assetToSoldInto9 = assetToSoldInto9 ? new PublicKey(assetToSoldInto9) : sentinelAccountAddress;

    portfolioAddress = await portfolio.createPortfolio(connection, programId, selectedWallet, metaDataUrl1, metaDataHash /*, creatorAccount*/,
        amountAsset1, asset1, periodAsset1, assetToSoldInto1,
        amountAsset2, asset2, periodAsset2, assetToSoldInto2,
        amountAsset3, asset3, periodAsset3, assetToSoldInto3,
        amountAsset4, asset4, periodAsset4, assetToSoldInto4,
        amountAsset5, asset5, periodAsset5, assetToSoldInto5,
        amountAsset6, asset6, periodAsset6, assetToSoldInto6,
        amountAsset7, asset7, periodAsset7, assetToSoldInto7,
        amountAsset8, asset8, periodAsset8, assetToSoldInto8,
        amountAsset9, asset9, periodAsset9, assetToSoldInto9
    );
    let accountInfo = await portfolio.getPortfolioInfo(portfolioAddress.publicKey);
    let ret = { "portfolioAddress": portfolioAddress, "accountInfo": accountInfo };
    return ret;
}

export async function createUserPortfolio(selectedWallet, connection, token, portfolioAddress, amountPortfolio): Promise<void> {

    //let programId = new PublicKey("AX9kkGLpKn9H2bcHgP4YDi2QQCeQEfWjpi5W7EvM5doJ");
    let programId = new PublicKey("DkkfzUvBVdYztDynBcXJoCA1ajANDfjENgE37hSpoakw");
    let ownerPortfolio = selectedWallet;
    let portfolio_address = new PublicKey(portfolioAddress);
    portfolio = new PortfolioAsset(
        connection,
        new PublicKey(token),
        programId,
        selectedWallet.publicKey
    );
    let delegate = programId;
    let delegated_amount = amountPortfolio;
    UserPortfolioAccount = await portfolio.createUserPortfolio(connection, programId, ownerPortfolio, portfolio_address, delegate, delegated_amount,
    );
    let accountUserInfo = await portfolio.getAccountUserPortfolioInfo(UserPortfolioAccount.publicKey);
    let ret = { "UserPortfolioAccount": UserPortfolioAccount, "accountUserInfo": accountUserInfo }
    return ret;
}

export async function runDepositPortfolio(selectedWallet, connection, portfolioAccount, userPAccount, amountDeposit): Promise<void> {
    console.log("start Deposit in portfolio");
    let programId = new PublicKey("AX9kkGLpKn9H2bcHgP4YDi2QQCeQEfWjpi5W7EvM5doJ");//static
    let TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');//static
    let TOKEN_SWAP_PROGRAM_ID = new PublicKey('5e2zZzHS8P1kkXQFVoBN6tVN15QBUHMDisy6mxVwVYSz');//static
    //GOST
    let userTransferAuthority = new Account([155, 200, 249, 167, 10, 23, 75, 131, 118, 125, 114, 216, 128, 104, 178, 124, 197, 52, 254, 20, 115, 17, 181, 113, 249, 97, 206, 128, 236, 197, 223, 136, 12, 128, 101, 121, 7, 177, 87, 233, 105, 253, 150, 154, 73, 9, 56, 54, 157, 240, 189, 68, 189, 52, 172, 228, 134, 89, 160, 189, 52, 26, 149, 130]);//static
    let spluPRIMARY = new PublicKey("GLmeujjxYahQv8wuXfZCGHy3ewdMzYPSUfswETRELPhM");//userSource wbtc dynamique createMint
    let managerPRIMARY = new PublicKey("95o4RBDUFFCPUMRq9YZkVJWkVKoTK9JviBwdbXLx8jWo");//poolSource createAccount
    let tokenSwap = new PublicKey("DTgQwyJ1qPSmgi4mFisZorqynErAzXTGYkmGW2iheT7N");
    let authority = new PublicKey("3KoXCpKYWfqkpsxiSmg2gae5rHeaFJdNVQYBpPEeuuvg");
    let manager_asset1 = new PublicKey("sWwgNAHXezA4LdVBXoowmzrbWwBqbMP59YtJCADZAeq");// poolDestination
    let splu_asset1 = new PublicKey("HFtdH3zviWQKmgMrN4kqwULQCVrhVtQZwAkCFvxC2ceE");//userDestination
    let tokenPool = new PublicKey("4LSqN7n1rAod1tQaJL1QVeL1y94NswQi8CGp4ubK4vur");
    let feeAccount = new PublicKey("4cFWJ9RK3jnWRKGVupCZx9DdqNSb9pDSQDdmFDNxYs6z");
    let tokenAccountPool = new PublicKey("Ea9QR6wdTALykEFEJmBQwVg97enmDgMvS8dAEdYXaSoR")//hostFeeAccount
    let owner = new Account([97, 30, 31, 33, 13, 91, 4, 73, 57, 214, 172, 115, 44, 20, 255, 207, 156, 101, 25, 224, 7, 2, 170, 146, 20, 213, 165, 241, 211, 14, 76, 95, 123, 128, 140, 138, 192, 242, 113, 62, 119, 27, 79, 105, 116, 153, 140, 191, 215, 220, 88, 150, 210, 137, 231, 88, 23, 142, 210, 51, 240, 144, 106, 241]);
    let payer = new Account([154, 155, 110, 10, 215, 247, 77, 101, 78, 22, 138, 92, 50, 193, 239, 103, 198, 82, 67, 161, 255, 3, 76, 5, 142, 6, 49, 166, 75, 110, 109, 247, 56, 64, 177, 222, 238, 169, 65, 249, 178, 65, 251, 34, 236, 93, 194, 184, 113, 65, 164, 76, 25, 238, 12, 188, 93, 192, 45, 7, 241, 146, 222, 241]);
    //static
    let createAccountProgram = new Account([86, 26, 243, 72, 46, 135, 186, 23, 31, 215, 229, 43, 54, 89, 206, 222, 82, 6, 231, 212, 212, 226, 184, 211, 107, 147, 180, 138, 57, 108, 182, 46, 185, 33, 232, 144, 77, 70, 77, 145, 151, 152, 188, 19, 78, 73, 32, 89, 236, 171, 90, 44, 120, 71, 202, 142, 214, 179, 38, 85, 71, 103, 145, 193]);
    let [programAddress, nonce] = await PublicKey.findProgramAddress(
        [createAccountProgram.publicKey.toBuffer()],
        programId,
    );
    let splmPRIMARY = new PortfolioAsset(
        connection,
        new PublicKey("6nQ394bEX7XqLQUf4tbkTBeJ4kPfEgCSVdVTcePAj3yZ"),
        TOKEN_PROGRAM_ID,
        selectedWallet);

    let splmAsset1 = new PortfolioAsset(
        connection,
        new PublicKey("CfLPTRPcwbsfiMZmxGzk4Cy7GBHRSi8rwo5wFBkXiSWi"),
        TOKEN_PROGRAM_ID,
        selectedWallet);
    await splmPRIMARY.mintTo(programId, selectedWallet, connection, splmPRIMARY.publicKey, spluPRIMARY, owner, [], 100000);
    console.log("test")
    await splmPRIMARY.approve(
        programId,
        selectedWallet,
        connection,
        spluPRIMARY,
        userTransferAuthority.publicKey,
        owner,
        [],
        100,
    );

    let amount_deposit = amountDeposit;
    let accountInfoSourceBefore = await splmPRIMARY.getAccountInfoNew(spluPRIMARY);
    let accountInfoDestBefore = await splmAsset1.getAccountInfoNew(splu_asset1);
    await portfolio.depositPortfolio(programId, selectedWallet, connection, portfolioAccount, userPAccount, tokenSwap, authority,
        userTransferAuthority, spluPRIMARY, managerPRIMARY, manager_asset1, splu_asset1, tokenPool, feeAccount,
        TOKEN_PROGRAM_ID, tokenAccountPool, programAddress, TOKEN_SWAP_PROGRAM_ID, createAccountProgram,
        selectedWallet, amount_deposit, nonce
    );
    let PortfolioInfo = await portfolio.getAccountUserPortfolioInfo(UserPortfolioAccount.publicKey);
    let accountInfoSource = await splmPRIMARY.getAccountInfoNew(spluPRIMARY);
    let accountInfoDest = await splmAsset1.getAccountInfoNew(splu_asset1);
    return [accountInfoSourceBefore, accountInfoDestBefore, accountInfoSource, accountInfoDest, PortfolioInfo]
}

////////////// portfolio beta

export async function createPortfolioBeta(connection, selectedWallet): Promise<void> {
    console.log("start");
    //const connection = await getConnection();
    let payer = new Account([40, 227, 237, 55, 202, 84, 44, 53, 137, 143, 142, 227, 133, 195, 168, 114, 201, 92, 206, 98, 236, 61, 253, 11, 111, 175, 207, 84, 255, 210, 249, 31, 196, 98, 228, 60, 15, 225, 60, 60, 177, 145, 101, 115, 186, 27, 167, 171, 114, 43, 155, 249, 27, 146, 4, 136, 26, 0, 52, 184, 181, 63, 16, 213]);
    //const payer = await newAccountWithLamports(connection, 1000000000  );

    portfolio = new PortfolioAsset(
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

    let metaDataUrl = Buffer.from("aabbcc-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------", "ascii");
    var metaDataHash = new Uint16Array([789]);
    console.log("metaDataUrl  ", metaDataUrl);
    console.log("metaDataHash  ", metaDataHash);

    let numberOfAsset = 1;

    let amountAsset1 = 2;
    //devnet
    // let splmAsset1 = await (await splm1.createAccountReturnAccount(owner.publicKey)).publicKey;
    //local net 
    let splmAsset1 = selectedWallet.publicKey;
    console.log("splmAsset1", splmAsset1);
    console.log("splmasset1 : ", splmAsset1.toString());
    let periodAsset1 = 123;
    console.log("period asset 1 ", periodAsset1);
    let assetToSoldIntoAsset1 = splmAsset1



    portfolioAddress = await portfolio.createPortfolio(selectedWallet, metaDataUrl, metaDataHash,
        numberOfAsset,
        amountAsset1, splmAsset1, periodAsset1, assetToSoldIntoAsset1 ,
    );

    let accountInfo = await portfolio.getPortfolioInfo(portfolioAddress.publicKey);
    let addressAsset = [];
    let assetToSoldIntoAsset = [];
    let addressAssetSecond = [];
    let assetToSoldIntoAssetSecond = [];
    for (let i = 1; i < 33; i++) {
        addressAsset.push(accountInfo.asset_data[i]);
    }
    let addressAssetPubKey = new PublicKey(addressAsset);

    if (numberOfAsset > 1)

        for (let i = 67; i < 99; i++) {
            addressAssetSecond.push(accountInfo.asset_data[i]);
        }
    let addressAssetPubKey2 = new PublicKey(addressAssetSecond);

    console.log("addressAssetPubKey ", addressAssetPubKey.toBase58());
    for (let j = 34; j < 66; j++) {
        assetToSoldIntoAsset.push(accountInfo.asset_data[j]);
    }

    let assetToSoldIntoAssetPubKey = new PublicKey(assetToSoldIntoAsset);

    if (numberOfAsset > 1)

        for (let j = 100; j < 132; j++) {
            assetToSoldIntoAssetSecond.push(accountInfo.asset_data[j]);
        }

    let assetToSoldIntoAssetPubKey2 = new PublicKey(assetToSoldIntoAssetSecond);


    console.log("********************************************************************************************************");
    console.log("************************************Info Portfolio Account *****************************");
    console.log("portfolioAddress : " + accountInfo.portfolioAddress +
        "--- creatorPortfolio : " + accountInfo.creatorPortfolio +
        " -- asset data  :" + accountInfo.asset_data[0, 10] +
        " -- is_initialize :" + accountInfo.is_initialize +
        " -- asset_data_len :" + accountInfo.asset_data_len +
        " --metadataUrl : " + accountInfo.metadataUrl +
        " --metadataHash : " + accountInfo.metadataHash +
        " -- asset data amount  :" + accountInfo.asset_data[0] +
        " -- asset data addressAsset  :" + addressAssetPubKey.toBase58() +
        " -- asset data periodAsset  :" + accountInfo.asset_data[33] +
        " -- asset data assetToSoldIntoAsset  :" + assetToSoldIntoAssetPubKey.toBase58()
        +
        " -- asset data amount2  :" + accountInfo.asset_data[66] +
        " -- asset data addressAsset2  :" + addressAssetPubKey2.toBase58() +
        " -- asset data periodAsset 2 :" + accountInfo.asset_data[99] +
        " -- asset data assetToSoldIntoAsset 2  :" + assetToSoldIntoAssetPubKey2.toBase58()
    );

    console.log("************************************end info Portfolio Account ******************************")
    console.log("********************************************************************************************************");




}





