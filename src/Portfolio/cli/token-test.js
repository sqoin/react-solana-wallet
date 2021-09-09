// @flow

//import fs from 'mz/fs';
import {
    Account,
    Connection,
    BpfLoader,
    PublicKey,
    BPF_LOADER_PROGRAM_ID,
    clusterApiUrl
} from '@solana/web3.js';
import {
    Portfolio,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    NATIVE_MINT,
} from '../client/Portfolio';
//import { url } from '../url';
import { newAccountWithLamports } from '../client/util/new-account-with-lamports';
import { sleep } from '../client/util/sleep';
import { Store } from './store';
// Loaded token program's program id
let programId: PublicKey;
let associatedProgramId: PublicKey;

// Accounts setup in createMint and used by all subsequent tests
let testMintAuthority: Account;
let testToken: Portfolio;
let testTokenDecimals: number = 2;

let asset: Portfolio;
let USDC: Portfolio;
let managerPortfolioWBTC: Account;
let managerPortfolioUSDC: Account;
let creatorPublicAddress: Account;
let UserPortfolioAccount : Account;
let portfolioAddress : Account;


// Accounts setup in createAccount and used by all subsequent tests
let testAccountOwner: Account;
let testAccount: PublicKey;
let assetAccount: PublicKey;
let usdcAccount: PublicKey;
let accountKey: PublicKey;
let UserAccountAsset: Account;
let UserAccountUsdc: Account;
let ownerPortfolio : Account;

function assert(condition, message) {
    if (!condition) {
        console.log(Error().stack + ':token-test.js');
        throw message || 'Assertion failed';
    }
}

async function didThrow(obj, func, args): Promise < boolean > {
    try {
        await func.apply(testToken, args);
    } catch (e) {
        return true;
    }
    return false;
}

let connection;
async function getConnection(): Promise < Connection > {
    if (connection) return connection;
    const network = clusterApiUrl('devnet');
    connection = new Connection(network, 'recent');
    const version = await connection.getVersion();
  
    return connection;
}

/*
async function loadProgram(
    connection: Connection,
    path: string,
): Promise < PublicKey > {
    const NUM_RETRIES = 500; /* allow some number of retries */
   /* const data = await fs.readFile(path);
    const { feeCalculator } = await connection.getRecentBlockhash();
    const balanceNeeded =
        feeCalculator.lamportsPerSignature *
        (BpfLoader.getMinNumSignatures(data.length) + NUM_RETRIES) +
        (await connection.getMinimumBalanceForRentExemption(data.length));

    const from = await newAccountWithLamports(connection, balanceNeeded);
    const program_account = new Account();
    console.log('Loading program:', path);
    await BpfLoader.load(
        connection,
        from,
        program_account,
        data,
        BPF_LOADER_PROGRAM_ID,
    );
    return program_account.publicKey;
}*/

async function GetPrograms(connection: Connection): Promise < void > {

    programId = new PublicKey("AX9kkGLpKn9H2bcHgP4YDi2QQCeQEfWjpi5W7EvM5doJ");
    associatedProgramId = new PublicKey("AX9kkGLpKn9H2bcHgP4YDi2QQCeQEfWjpi5W7EvM5doJ");
    let info;
    info = await connection.getAccountInfo(programId);
    assert(info != null);
    info = await connection.getAccountInfo(associatedProgramId);
    assert(info != null);

    /*
    const programVersion = process.env.PROGRAM_VERSION;
    if (programVersion) {
        switch (programVersion) {
            case '2.0.4':
                programId = TOKEN_PROGRAM_ID;
                associatedProgramId = ASSOCIATED_TOKEN_PROGRAM_ID;
                return;
            default:
                throw new Error('Unknown program version');
        }
    }

    const store = new Store();
    try {
        const config = await store.load('config.json');
        console.log('Using pre-loaded Portfolio programs');
        console.log(
            `  Note: To reload program remove ${Store.getFilename('config.json')}`,
        );
        programId = new PublicKey(config.tokenProgramId);
        associatedProgramId = new PublicKey(config.associatedTokenProgramId);
        let info;
        info = await connection.getAccountInfo(programId);
        assert(info != null);
        info = await connection.getAccountInfo(associatedProgramId);
        assert(info != null);
    } catch (err) {
        console.log(
            'Checking pre-loaded Portfolio programs failed, will load new programs:',
        );
        console.log({ err });

        programId = await loadProgram(
            connection,
            '../program/target/bpfel-unknown-unknown/release/spl_token.so',
        );
        associatedProgramId = programId;
        await store.save('config.json', {
            tokenProgramId: programId.toString(),
            associatedTokenProgramId: associatedProgramId.toString(),
        });
    }

    */
}

export async function loadTokenProgram(): Promise < void > {
    const connection = await getConnection();
    await GetPrograms(connection);

    console.log('Portfolio Program ID', programId.toString());
    console.log('Associated Portfolio Program ID', associatedProgramId.toString());
}


export async function createMint(): Promise < void > {
    const connection = await getConnection();
    const payer = await newAccountWithLamports(connection, 1000000000 /* wag */ );
    testMintAuthority = new Account();
    //nWBTC
    testToken = await Portfolio.createMint(
        connection,
        payer,
        testMintAuthority.publicKey,
        testMintAuthority.publicKey,
        testTokenDecimals,
        programId,
        new PublicKey("9ZFJWoBMQuYiBvbGpExs3smE59kQZbPnVmJp7F8iUsDG"),
        new PublicKey("4A3a33ozsqA6ihMXRAzYeNwZv4df9RfJoLPh6ycZJVhE")
    );
    testToken = new Portfolio(
        connection,
        //new PublicKey("887xCkc7KNUTQTJLHrrPAqHvcBCdbaBWFDqzXkXNjxkS"),
        new PublicKey("6ykyxd7bZFnvEHq61vnd69BkU3gabiDmKGEQb4sGiPQG"),
        programId,
        payer
    );

    console.log("createMint publickey asset -- " + testToken.publicKey)
    asset = new Portfolio(
        connection,
        new PublicKey("9ZFJWoBMQuYiBvbGpExs3smE59kQZbPnVmJp7F8iUsDG"),
        TOKEN_PROGRAM_ID,
        payer
    );
    USDC = new Portfolio(
        connection,
        new PublicKey("4A3a33ozsqA6ihMXRAzYeNwZv4df9RfJoLPh6ycZJVhE"),
        TOKEN_PROGRAM_ID,
        payer
    );

    // HACK: override hard-coded ASSOCIATED_TOKEN_PROGRAM_ID with corresponding
    // custom test fixture
    testToken.associatedProgramId = associatedProgramId;

}

export async function runApprove(): Promise < void > {
    // testAccount ==>  nTokeen // 
    let testAccountInfo;

    managerPortfolioWBTC = await asset.createAccountNew(testToken.publicKey);
    managerPortfolioUSDC = await USDC.createAccountNew(testToken.publicKey);

    console.log(" publickey mangerPortfolio -- " + managerPortfolioWBTC.publicKey);

    testAccountInfo = await asset.getAccountInfoNew(assetAccount);
    console.log("before approve info managerPortfolio mint --" + testAccountInfo.mint + " --owner --" + testAccountInfo.owner + " -amount --" + testAccountInfo.amount + "-- allownace --" + testAccountInfo.delegatedAmount.toNumber())

    console.log(" assetaccount is : " + assetAccount + " -- testAccount owner --" + testAccountOwner.publicKey);

    await asset.approveChecked(assetAccount, managerPortfolioWBTC.publicKey, testAccountOwner, [], 2000000000, 9);

    testAccountInfo = await asset.getAccountInfoNew(assetAccount);
    console.log("after approve info managerPortfolio mint --" + testAccountInfo.mint + " --owner --" + testAccountInfo.owner + " -amount --" + testAccountInfo.amount + "-- allownace --" + testAccountInfo.delegatedAmount.toNumber())

}
export async function runApproveChecked(): Promise < void > {
    const delegate = new Account().publicKey;
    await testToken.approveChecked(testAccount, delegate, testAccountOwner, [], 9, 2);
    let testAccountInfo = await testToken.getAccountInfo(testAccount);
    let allowance = testAccountInfo.delegatedAmount.toNumber()
    console.log("allowance : " + allowance)

}

export async function runDeposit(): Promise < void > {
    console.log("run test deposit");

    const connection = await getConnection();
    const payer = await newAccountWithLamports(connection, 10000000000 /* wag */ );

    let infoMangerPortfolio;
    infoMangerPortfolio = await asset.getAccountInfoNew(managerPortfolioWBTC.publicKey);
    console.log(assetAccount + "before transferFrom infoMangerPortfolio mint --" + infoMangerPortfolio.mint + " --owner --" + infoMangerPortfolio.owner + " -amount --" + infoMangerPortfolio.amount + "-- allownace --" + infoMangerPortfolio.delegatedAmount)
    infoMangerPortfolio = await asset.getAccountInfoNew(assetAccount);
    console.log("before transferFrom infoassetAccount mint --" + infoMangerPortfolio.mint + " --owner --" + infoMangerPortfolio.owner + " -amount --" + infoMangerPortfolio.amount + "-- allownace --" + infoMangerPortfolio.delegatedAmount)

    await asset.transfer(assetAccount, managerPortfolioWBTC.publicKey, managerPortfolioWBTC, [], 5000000);

    infoMangerPortfolio = await asset.getAccountInfoNew(assetAccount);
    console.log("after transferFrom infoassetAccount mint --" + infoMangerPortfolio.mint + " --owner --" + infoMangerPortfolio.owner + " -amount --" + infoMangerPortfolio.amount + "-- allownace --" + infoMangerPortfolio.delegatedAmount)


    infoMangerPortfolio = await asset.getAccountInfoNew(managerPortfolioWBTC.publicKey);

    console.log("after transferFrom infoMangerPortfolio mint --" + infoMangerPortfolio.mint + " --owner --" + infoMangerPortfolio.owner + " -amount --" + infoMangerPortfolio.amount + "-- allownace --" + infoMangerPortfolio.delegatedAmount)

    let accountManagerPortfolioWBTC = await asset.createAccountNew(managerPortfolioWBTC.publicKey);

    const source = await newAccountWithLamports(connection, 10000000000 /* wag */ );

    let testAccount2 = await testToken.createAccount(source.publicKey);
    console.log("owner testAccount -- " + source.publicKey)
    console.log("created testaccount is : " + testAccount.toBase58());

    let accountInfo;
    accountInfo = await testToken.getAccountInfo(testAccount);

    console.log("**********Info Portfolio Account **************");
    console.log("mint nWBTC -- " + accountInfo.mint + " -- owner UserA --" + accountInfo.owner + " -- amount --" + accountInfo.amount + " -- amount wbtc --" + accountInfo.asset + " amount usdc --" + accountInfo.usdc)
    console.log("***end info Portfolio Account ******")



    await testToken.createDeposit(managerPortfolioWBTC, managerPortfolioUSDC, payer, 1000, 10);
    //await testToken.createDeposit(accountManagerPortfolioWBTC,managerPortfolioUSDC,payer, 1000 , 10);

    //await transferAfterDeposit(accountKey,payer);
}

export async function withDraw(): Promise < void > {
    console.log("run test withdraw");
   // const connection = await getConnection();
    const payer = await newAccountWithLamports(connection, 1000000000 /* wag */ );
    accountKey = await testToken.createAccount(payer.publicKey);
    //runGetFullBalance(accountKey)
    await testToken.createWithDraw(accountKey, 10, payer);
    //
    runGetFullBalance(testAccount);
}


export async function createPortfolio(selectedWallet , connection) : Promise<void> {

   
        console.log ("start");
        programId = new PublicKey("AX9kkGLpKn9H2bcHgP4YDi2QQCeQEfWjpi5W7EvM5doJ");
     //   let owner = new Account([253, 105, 193, 173, 55, 108, 145, 101, 186, 22, 187, 172, 156, 119, 173, 35, 25, 99, 80, 68, 92, 204, 232, 243, 67, 169, 199, 7, 218, 94, 225, 17, 173, 31, 39, 116, 250, 166, 211, 3, 213, 13, 179, 50, 47, 240, 7, 164, 48, 110, 143, 141, 244, 242, 74, 210, 185, 203, 0, 4, 138, 99, 110, 251]);
      //  const ownerSource  = await newAccountWithLamports(connection, 10000000000 /* wag */);
        
        //const creatorSource  = await newAccountWithLamports(connection, 10000000000 /* wag */);

       // const payer = await newAccountWithLamports(connection, 1000000000 /* wag */ );
        asset = new Portfolio(
            connection,
            new PublicKey("9ZFJWoBMQuYiBvbGpExs3smE59kQZbPnVmJp7F8iUsDG"),
            TOKEN_PROGRAM_ID,
            selectedWallet.publicKey
        );

        testToken = new Portfolio(
            connection,
            new PublicKey("6ykyxd7bZFnvEHq61vnd69BkU3gabiDmKGEQb4sGiPQG"),
            programId,
            selectedWallet.publicKey
        ); 

  
        USDC = new PublicKey("4A3a33ozsqA6ihMXRAzYeNwZv4df9RfJoLPh6ycZJVhE");
           
       

        let metaDataUrl = "aabbcc";
        var metaDataHash = new Uint16Array([789]);
        console.log ("metaDataHash  ",metaDataHash );
       

        let amountAsset1 = 2;
        let splmAsset1 = USDC;
        console.log ("splmasset1 : " ,splmAsset1.toString());
        let periodAsset1 = 123;
        console.log ("period asset 1 ",periodAsset1 );
        let assetToSoldIntoAsset1 = new PublicKey("FAxFrLbWabNWgL1A9sLokNQbaBSq33iQHA2Y3zKk1g8x");
  
      
        let amountAsset2=3 ;
       // let addressAsset2  = await (await asset.createAccountNew(testToken.publicKey)).publicKey;
        let splmAsset2  = splmAsset1;
        let periodAsset2 = 4;
        let assetToSoldIntoAsset2  = new PublicKey("FAxFrLbWabNWgL1A9sLokNQbaBSq33iQHA2Y3zKk1g8x");
      
        let amountAsset3=3 ;
        let splmAsset3  = splmAsset1;
        let periodAsset3 =3;
        let assetToSoldIntoAsset3  = splmAsset1;
      
        let amountAsset4 =3;
        let splmAsset4 = splmAsset1;
        let periodAsset4 = 3;
        let assetToSoldIntoAsset4  = splmAsset1;
      
        let amountAsset5 =3;
        let splmAsset5  = splmAsset1;
        let periodAsset5=3;
        let assetToSoldIntoAsset5  =splmAsset1;
      
        let amountAsset6 =3;
        let splmAsset6  = splmAsset1;
        let periodAsset6=3;
        let assetToSoldIntoAsset6  = splmAsset1;
      
        let amountAsset7=3 ;
        let splmAsset7  = splmAsset1;
        let periodAsset7=3;
        let assetToSoldIntoAsset7  = splmAsset1;
      
        let amountAsset8 =3;
        let splmAsset8  = splmAsset1;
        let periodAsset8=3;
        let assetToSoldIntoAsset8  = splmAsset1;
      
        let amountAsset9 =3;
        let splmAsset9  = splmAsset1;
        let periodAsset9 =3;
        let assetToSoldIntoAsset9  = splmAsset1;
      
      
         portfolioAddress = await testToken.createPortfolio(connection, programId,selectedWallet , metaDataUrl , metaDataHash /*, creatorAccount*/ ,
           amountAsset1 , splmAsset1 , periodAsset1 , assetToSoldIntoAsset1 ,
           amountAsset2 , splmAsset2 , periodAsset2 , assetToSoldIntoAsset2 ,
           amountAsset3 , splmAsset3 , periodAsset3 , assetToSoldIntoAsset3 ,
           amountAsset4 , splmAsset4 , periodAsset4 , assetToSoldIntoAsset4 ,
           amountAsset5 , splmAsset5 , periodAsset5 , assetToSoldIntoAsset5 ,
           amountAsset6 , splmAsset6 , periodAsset6 , assetToSoldIntoAsset6 ,
           amountAsset7 , splmAsset7 , periodAsset7 , assetToSoldIntoAsset7 ,
           amountAsset8 , splmAsset8 , periodAsset8 , assetToSoldIntoAsset8 ,
           amountAsset9 , splmAsset9 , periodAsset9 , assetToSoldIntoAsset9
        
           );
      
      
          let accountInfo= await testToken.getPortfolioInfo(portfolioAddress.publicKey);
          console.log ("********************************************************************************************************");
          console.log("************************************Info Portfolio Account *****************************");
          console.log("portfolioAddress : " + accountInfo.portfolioAddress +
           "--- creatorPortfolio : "+accountInfo.creatorPortfolio+
           " -- amountAsset1  :" + accountInfo.amountAsset1 +
           " -- addressAsset1 :" + accountInfo.addressAsset1 +
           " -- periodAsset1 :" + accountInfo.periodAsset1 + 
           " -- assetToSoldIntoAsset1 :" + accountInfo.assetToSoldIntoAsset1+" --metadataUrl : " + accountInfo.metadataUrl)
          console.log("************************************end info Portfolio Account ******************************")
          console.log ("********************************************************************************************************");
      
           return accountInfo;
      
      
      }

export async function createUserPortfolio(selectedWallet , connection): Promise < void > {
  
     let programId = new PublicKey("AX9kkGLpKn9H2bcHgP4YDi2QQCeQEfWjpi5W7EvM5doJ");
     let ownerPortfolio = selectedWallet;
     let portfolio_address = portfolioAddress.publicKey;
     testToken = new Portfolio(
        connection,
        new PublicKey("6ykyxd7bZFnvEHq61vnd69BkU3gabiDmKGEQb4sGiPQG"),
        programId,
        selectedWallet.publicKey
    ); 
     
      let delegate = programId ;
      let delegated_amount = 5;

        
          UserPortfolioAccount = await testToken.createUserPortfolio(connection, programId ,ownerPortfolio,portfolio_address,delegate , delegated_amount,
      );
    
    
           let accountUserInfo = await testToken.getAccountUserPortfolioInfo(UserPortfolioAccount.publicKey);
           console.log ("********************************************************************************************************");
           console.log("********************************************Info User Portfolio Account *********************************");
           console.log("user_portfolio_address : " + accountUserInfo.user_portfolio_address +"--- portfolio_address : "+accountUserInfo.portfolio_address+ " -- owner  :" + accountUserInfo.owner +
            " -- delegated amount :" + accountUserInfo.delegatedAmount +
            " -- delegate :" + accountUserInfo.delegate + " -- splu_asset1 :" + accountUserInfo.splu_asset1+" --splu_asset2 : " + accountUserInfo.splu_asset2)
           console.log("*********************************************end info User Portfolio Account **************************")
           console.log ("********************************************************************************************************");
    
    
    return accountUserInfo;
    
        }
    


        export async function runDepositPortfolio(selectedWallet , connection): Promise < void > {
            console.log("start Deposit in portfolio");
            let programId = new PublicKey("AX9kkGLpKn9H2bcHgP4YDi2QQCeQEfWjpi5W7EvM5doJ");
         
        
            let TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
            let TOKEN_SWAP_PROGRAM_ID = new PublicKey('5e2zZzHS8P1kkXQFVoBN6tVN15QBUHMDisy6mxVwVYSz');
            let userTransferAuthority = new Account([155,200,249,167,10,23,75,131,118,125,114,216,128,104,178,124,197,52,254,20,115,17,181,113,249,97,206,128,236,197,223,136,12,128,101,121,7,177,87,233,105,253,150,154,73,9,56,54,157,240,189,68,189,52,172,228,134,89,160,189,52,26,149,130]);
            let spluPRIMARY=new PublicKey("GLmeujjxYahQv8wuXfZCGHy3ewdMzYPSUfswETRELPhM");//userSource
            let managerPRIMARY=new PublicKey("95o4RBDUFFCPUMRq9YZkVJWkVKoTK9JviBwdbXLx8jWo");//poolSource
        
            let tokenSwap =new PublicKey("DTgQwyJ1qPSmgi4mFisZorqynErAzXTGYkmGW2iheT7N");
            let authority=new PublicKey("3KoXCpKYWfqkpsxiSmg2gae5rHeaFJdNVQYBpPEeuuvg");
            let manager_asset1=new PublicKey("sWwgNAHXezA4LdVBXoowmzrbWwBqbMP59YtJCADZAeq");// poolDestination
            let splu_asset1=new PublicKey("HFtdH3zviWQKmgMrN4kqwULQCVrhVtQZwAkCFvxC2ceE");//userDestination
            let tokenPool=new PublicKey("4LSqN7n1rAod1tQaJL1QVeL1y94NswQi8CGp4ubK4vur");
            let feeAccount=new PublicKey("4cFWJ9RK3jnWRKGVupCZx9DdqNSb9pDSQDdmFDNxYs6z");
            let tokenAccountPool=new PublicKey("Ea9QR6wdTALykEFEJmBQwVg97enmDgMvS8dAEdYXaSoR")//hostFeeAccount
            let owner =new Account([97,30,31,33,13,91,4,73,57,214,172,115,44,20,255,207,156,101,25,224,7,2,170,146,20,213,165,241,211,14,76,95,123,128,140,138,192,242,113,62,119,27,79,105,116,153,140,191,215,220,88,150,210,137,231,88,23,142,210,51,240,144,106,241]);
            let payer=new Account([154,155,110,10,215,247,77,101,78,22,138,92,50,193,239,103,198,82,67,161,255,3,76,5,142,6,49,166,75,110,109,247,56,64,177,222,238,169,65,249,178,65,251,34,236,93,194,184,113,65,164,76,25,238,12,188,93,192,45,7,241,146,222,241]);
        
            let createAccountProgram=new Account([86,  26, 243,  72,  46, 135, 186,  23,  31, 215, 229,43,  54,  89, 206, 222,  82,   6, 231, 212, 212, 226,184, 211, 107, 147, 180, 138,  57, 108, 182,  46, 185,33, 232, 144,  77,  70,  77, 145, 151, 152, 188,  19,78,  73,  32,  89, 236, 171,  90,  44, 120,  71, 202,142, 214, 179,  38,  85,  71, 103, 145, 193]);
            
            let [programAddress, nonce] = await PublicKey.findProgramAddress(
              [createAccountProgram.publicKey.toBuffer()],
              programId,
             );
        
        
            let splmPRIMARY=new Portfolio(
                connection,
                new PublicKey("6nQ394bEX7XqLQUf4tbkTBeJ4kPfEgCSVdVTcePAj3yZ") ,
                TOKEN_PROGRAM_ID,
                selectedWallet);
        
            let splmAsset1=new Portfolio(
                connection,
                new PublicKey("CfLPTRPcwbsfiMZmxGzk4Cy7GBHRSi8rwo5wFBkXiSWi") ,
                TOKEN_PROGRAM_ID,
                selectedWallet);
            await splmPRIMARY.mintTo(programId ,selectedWallet,connection, splmPRIMARY.publicKey,spluPRIMARY, owner, [], 100000);
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
        
        let amount_deposit = 10 ;
    
        
        let accountInfoSourceBefore = await splmPRIMARY.getAccountInfoNew(spluPRIMARY);
        let accountInfoDestBefore = await splmAsset1.getAccountInfoNew(splu_asset1);
        
        console.log ("********************************************************************************************************");
        console.log("********************************************primary account before swap  *********************************");
        console.log("accountInfoDest : " + accountInfoSourceBefore.address + "---- accountInfoDest amount"+accountInfoSourceBefore.amount);
        console.log ("********************************************************************************************************");
        
        console.log("********************************************destination account before swap  *********************************");
        console.log("accountInfoDest : " + accountInfoDestBefore.address + "---- accountInfoDest amount"+accountInfoDestBefore.amount);
        console.log ("********************************************************************************************************");
        
        // let portfolioAddress= new PublicKey("Mbg2TZtj2iA3nsYQ7kJvCSFnhQdMuAkssuFgXi72wUe");
        // let UserPortfolioAccount= new PublicKey("3fGrHusBViqcQvfisaoRzN4vyoGUQj3hgNBG42ptMFxZ");
        
             await testToken.depositPortfolio(programId , selectedWallet,connection , portfolioAddress,UserPortfolioAccount,tokenSwap,authority ,
                  userTransferAuthority, spluPRIMARY , managerPRIMARY ,manager_asset1 , splu_asset1 , tokenPool , feeAccount , 
                TOKEN_PROGRAM_ID,tokenAccountPool , programAddress , TOKEN_SWAP_PROGRAM_ID ,createAccountProgram ,
                 selectedWallet, amount_deposit , nonce
             );
        
        
        
             /******** ******/
        
             let PortfolioInfo = await testToken.getAccountUserPortfolioInfo(UserPortfolioAccount.publicKey);
               console.log ("********************************************************************************************************");
               console.log("********************************************Info Portfolio Account After swap  *********************************");
               console.log("user_portfolio_address : " + PortfolioInfo.user_portfolio_address +"--- portfolio_address : "+PortfolioInfo.portfolio_address+ " -- owner  :" + PortfolioInfo.owner +
                " -- delegated amount :" + PortfolioInfo.delegatedAmount +
                " -- delegate :" + PortfolioInfo.delegate + " -- splu_asset1 :" + PortfolioInfo.splu_asset1+" --splu_asset2 : " + PortfolioInfo.splu_asset2)
               console.log("*********************************************end info Portfolio Account **************************")
               console.log ("********************************************************************************************************");
        
        
        
              
               let accountInfoSource = await splmPRIMARY.getAccountInfoNew(spluPRIMARY);
                let accountInfoDest = await splmAsset1.getAccountInfoNew(splu_asset1);
               
               
               console.log("********************************************primary account after swap  *********************************");
               console.log("accountInfoDest : " + accountInfoSource.address + "---- accountInfoDest amount"+accountInfoSource.amount);
               console.log ("********************************************************************************************************");
               
               console.log("********************************************destination account after swap  *********************************");
               console.log("accountInfoDest : " + accountInfoDest.address + "---- accountInfoDest amount"+accountInfoDest.amount);
               console.log ("********************************************************************************************************");
               console.log ("********************************************************************************************************");
               console.log ("********************************************************************************************************");
          return [accountInfoSourceBefore ,accountInfoDestBefore , accountInfoSource ,accountInfoDest , PortfolioInfo ]
            }

/*

export async function infoAccountByPublicKey(): Promise < void > {
    const connection = await getConnection();
    let account = new PublicKey("6QJJ6VA4wm2bKXRGSJQPFStCas7mNreiHgbNUogKHAgJ");
    connection.getAccountInfo(account, 'confirmed')
    .then(
        account => {
            console.log("info" + account)
            if ((account) && (account.owner)) {

                const data = Buffer.from(account.data);
                const accountInfo = /*.decode(data);
                if (accountInfo.owner) {
                    console.log("Owner  => " + new PublicKey(accountInfo.owner).toBase58());
                    console.log("Amount  => " + new PublicKey(accountInfo.amount).toBase58());
                    console.log("USDC  => " + new PublicKey(accountInfo.usdc).toBase58());
                    console.log("ASSET  => " + new PublicKey(accountInfo.asset).toBase58());
                }
            }
        }
    ).catch(a => { console.log("error info account") })
}
*/

export async function createAccount(): Promise < void > {
    testAccountOwner = new Account([253, 105, 193, 173, 55, 108, 145, 101, 186, 22, 187, 172, 156, 119, 173, 35, 25, 99, 80, 68, 92, 204, 232, 243, 67, 169, 199, 7, 218, 94, 225, 17, 173, 31, 39, 116, 250, 166, 211, 3, 213, 13, 179, 50, 47, 240, 7, 164, 48, 110, 143, 141, 244, 242, 74, 210, 185, 203, 0, 4, 138, 99, 110, 251]);


    //Portfolio Account nWBTC: 

    testAccount = await testToken.createAccount(testAccountOwner.publicKey);
    // testAccount=new PublicKey("6wyLxVejQGiUSzdNS7VvUM4ETBkpXYtSRgTqDtTVoXsX");

    console.log("owner testAccount -- " + testAccountOwner.publicKey)
    console.log("created testaccount is : " + testAccount.toBase58());

    let accountInfo;
    accountInfo = await testToken.getAccountInfo(testAccount);

    console.log("**********Info Portfolio Account **************");
    console.log("mint nWBTC -- " + accountInfo.mint + " -- owner UserA --" + accountInfo.owner + " -- amount --" + accountInfo.amount + " -- amount wbtc --" + accountInfo.asset + " amount usdc --" + accountInfo.usdc)
    console.log("***end info Portfolio Account ******")

    //Token Account WBTC:

    //assetAccount=await asset.createAccountNew(testAccountOwner.publicKey);
    assetAccount = new PublicKey("HhXqr6VokjdSZT1BJj7zn5fafJBvSbkrxVYkJX11UmAy");
    console.log("created assetaccount is : " + assetAccount.toBase58());
    // await asset.mintTo(assetAccount.publicKey,testAccountOwner,[],2000000000)

    let accountInfoAsset = await asset.getAccountInfoNew(assetAccount);
    console.log("**********Info Token Account wbtc**************");
    console.log("mint WBTC -- " + accountInfoAsset.mint + " -- owner UserA --" + accountInfoAsset.owner + " -- amount --" + accountInfoAsset.amount)
    console.log("***end info Token Account wbtc******")

    //Token Account USDC:
    // usdcAccount=await USDC.createAccountNew(testAccountOwner.publicKey);
    usdcAccount = new PublicKey("FY7nxSgM1HyAz9aiLbPkMnzgEqhmgN49VZn15SXJngnD")
    console.log("created usdcaccount is : " + usdcAccount.toBase58());

    let accountInfoUSDC = await USDC.getAccountInfoNew(usdcAccount);
    console.log("**********Info Token Account usdc **************");
    console.log("mint usdc -- " + accountInfoUSDC.mint + " -- owner UserA --" + accountInfoUSDC.owner + " -- amount --" + accountInfoUSDC.amount)
    console.log("***end info Token Account usdc ******")



    assert(accountInfo.mint.equals(testToken.publicKey));
    assert(accountInfo.owner.equals(testAccountOwner.publicKey));
    assert(accountInfo.amount.toNumber() === 0);
    assert(accountInfo.delegate === null);
    assert(accountInfo.delegatedAmount.toNumber() === 0);
    assert(accountInfo.isInitialized === true);
    assert(accountInfo.isFrozen === false);
    assert(accountInfo.isNative === false);
    assert(accountInfo.rentExemptReserve === null);
    assert(accountInfo.closeAuthority === null);

    // you can create as many accounts as with same owner
    const testAccount2 = await testToken.createAccount(
        testAccountOwner.publicKey,
    );
    assert(!testAccount2.equals(testAccount));
}

export async function createAssociatedAccount(): Promise < void > {
    let info;
    const connection = await getConnection();

    const owner = new Account();
    const associatedAddress = await Portfolio.getAssociatedTokenAddress(
        associatedProgramId,
        programId,
        testToken.publicKey,
        owner.publicKey,
    );

    // associated account shouldn't exist
    info = await connection.getAccountInfo(associatedAddress);
    assert(info == null);

    const createdAddress = await testToken.createAssociatedTokenAccount(
        owner.publicKey,
    );
    assert(createdAddress.equals(associatedAddress));

    // associated account should exist now
    info = await testToken.getAccountInfo(associatedAddress);
    assert(info != null);
    assert(info.mint.equals(testToken.publicKey));
    assert(info.owner.equals(owner.publicKey));
    assert(info.amount.toNumber() === 0);

    // creating again should cause TX error for the associated token account
    assert(
        await didThrow(testToken, testToken.createAssociatedTokenAccount, [
            owner.publicKey,
        ]),
    );
}

export async function mintTo(): Promise < void > {
    await testToken.mintTo(testAccount, testMintAuthority, [], 1000);
    let mintAuthorityAsset = new Account([253, 105, 193, 173, 55, 108, 145, 101, 186, 22, 187, 172, 156, 119, 173, 35, 25, 99, 80, 68, 92, 204, 232, 243, 67, 169, 199, 7, 218, 94, 225, 17, 173, 31, 39, 116, 250, 166, 211, 3, 213, 13, 179, 50, 47, 240, 7, 164, 48, 110, 143, 141, 244, 242, 74, 210, 185, 203, 0, 4, 138, 99, 110, 251])

    await asset.mintTo(assetAccount, UserAccountAsset, [], 10000);
    const assetInfo = await asset.getAccountInfo(assetAccount);
    console.log("mintTo : min asset --" + assetInfo.mint + " -- owner --" + assetInfo.owner + " -- address Account --" + assetInfo.address + "-- amount before mintTo --" + assetInfo.amount)

    const mintInfo = await testToken.getMintInfo();
    assert(mintInfo.supply.toNumber() === 1000);

    const accountInfo = await testToken.getAccountInfo(testAccount);
    assert(accountInfo.amount.toNumber() === 1000);
    console.log(" usdc = " + accountInfo.usdc.toNumber());
    console.log(" asset = " + accountInfo.asset.toNumber());
}

export async function runGetFullBalance(account = testAccount): Promise < void > {
    console.log("run get full balance");
    const accountInfo = await testToken.getAccountInfo(account);
    console.log("amount:" + accountInfo.amount.toNumber(), "usdc:" + accountInfo.usdc.toNumber(), "asset:" + accountInfo.asset.toNumber())
    return ({ "amount": accountInfo.amount.toNumber(), "usdc": accountInfo.usdc.toNumber(), "asset": accountInfo.asset.toNumber() })
}

export async function mintToChecked(): Promise < void > {
    assert(
        await didThrow(testToken, testToken.mintToChecked, [
            testAccount,
            testMintAuthority, [],
            1000,
            1,
        ]),
    );

    await testToken.mintToChecked(testAccount, testMintAuthority, [], 1000, 2);

    const mintInfo = await testToken.getMintInfo();
    assert(mintInfo.supply.toNumber() === 2000);

    const accountInfo = await testToken.getAccountInfo(testAccount);
    assert(accountInfo.amount.toNumber() === 2000);
}

export async function transfer(): Promise < void > {
    const destOwner = new Account();
    const dest = await testToken.createAccount(destOwner.publicKey);


    let accountInfo = await testToken.getAccountInfo(testAccount);
    console.log(" source amount befor transfer = " + accountInfo.amount);
    console.log(" dest is " + testAccountOwner.publicKey);
    await testToken.transfer(testAccount, dest, testAccountOwner, [], 100);

    const mintInfo = await testToken.getAccountInfo(testAccount);
    assert(mintInfo.amount.toNumber() === 900);
    console.log("Full balance of sender after transfer : ")
    console.log(" amount = " + mintInfo.amount.toNumber());
    console.log(" usdc = " + mintInfo.usdc.toNumber());
    console.log(" asset = " + mintInfo.asset.toNumber());


    let destAccountInfo = await testToken.getAccountInfo(dest);
    assert(destAccountInfo.amount.toNumber() === 100);
    console.log("Full balance of receipt after transfer : ")
    console.log(" amount = " + destAccountInfo.amount.toNumber());
    console.log(" usdc = " + destAccountInfo.usdc.toNumber());
    console.log(" asset = " + destAccountInfo.asset.toNumber());

}



export async function transferAfterDeposit(accountSource, accountSourceOwner): Promise < void > {
    const destOwner = new Account();
    const dest = await testToken.createAccount(destOwner.publicKey);


    let accountInfo = await testToken.getAccountInfo(accountSource);
    console.log(" source amount befor transfer = " + accountInfo.amount);
    console.log(" accountSourceOwner is " + accountSourceOwner.publicKey);
    await testToken.transfer(accountSource, dest, accountSourceOwner, [], 100);

    const mintInfo = await testToken.getAccountInfo(accountSource);
    assert(mintInfo.amount.toNumber() === 900);
    console.log("Full balance of sender after transfer : ")
    console.log(" amount = " + mintInfo.amount.toNumber());
    console.log(" usdc = " + mintInfo.usdc.toNumber());
    console.log(" asset = " + mintInfo.asset.toNumber());


    let destAccountInfo = await testToken.getAccountInfo(dest);
    assert(destAccountInfo.amount.toNumber() === 100);
    console.log("Full balance of receipt after transfer : ")
    console.log(" amount = " + destAccountInfo.amount.toNumber());
    console.log(" usdc = " + destAccountInfo.usdc.toNumber());
    console.log(" asset = " + destAccountInfo.asset.toNumber());

}





export async function transferChecked(): Promise < void > {
    const destOwner = new Account();
    const dest = await testToken.createAccount(destOwner.publicKey);

    assert(
        await didThrow(testToken, testToken.transferChecked, [
            testAccount,
            dest,
            testAccountOwner, [],
            100,
            testTokenDecimals - 1,
        ]),
    );

    await testToken.transferChecked(
        testAccount,
        dest,
        testAccountOwner, [],
        100,
        testTokenDecimals,
    );

    const mintInfo = await testToken.getMintInfo();
    assert(mintInfo.supply.toNumber() === 2000);

    let destAccountInfo = await testToken.getAccountInfo(dest);
    assert(destAccountInfo.amount.toNumber() === 100);

    let testAccountInfo = await testToken.getAccountInfo(testAccount);
    assert(testAccountInfo.amount.toNumber() === 1800);
}

export async function transferCheckedAssociated(): Promise < void > {
    const dest = new Account().publicKey;
    let associatedAccount;

    associatedAccount = await testToken.getOrCreateAssociatedAccountInfo(dest);
    assert(associatedAccount.amount.toNumber() === 0);

    await testToken.transferChecked(
        testAccount,
        associatedAccount.address,
        testAccountOwner, [],
        123,
        testTokenDecimals,
    );

    associatedAccount = await testToken.getOrCreateAssociatedAccountInfo(dest);
    assert(associatedAccount.amount.toNumber() === 123);
}

export async function approveRevoke(): Promise < void > {
    const delegate = new Account().publicKey;

    await testToken.approve(testAccount, delegate, testAccountOwner, [], 42);

    let testAccountInfo = await testToken.getAccountInfo(testAccount);
    assert(testAccountInfo.delegatedAmount.toNumber() === 42);
    if (testAccountInfo.delegate === null) {
        throw new Error('delegate should not be null');
    } else {
        assert(testAccountInfo.delegate.equals(delegate));
    }

    await testToken.revoke(testAccount, testAccountOwner, []);

    testAccountInfo = await testToken.getAccountInfo(testAccount);
    assert(testAccountInfo.delegatedAmount.toNumber() === 0);
    if (testAccountInfo.delegate !== null) {
        throw new Error('delegate should be null');
    }
}

export async function failOnApproveOverspend(): Promise < void > {
    const owner = new Account();
    const account1 = await testToken.createAccount(owner.publicKey);
    const account2 = await testToken.createAccount(owner.publicKey);
    const delegate = new Account();

    await testToken.transfer(testAccount, account1, testAccountOwner, [], 10);

    await testToken.approve(account1, delegate.publicKey, owner, [], 2);

    let account1Info = await testToken.getAccountInfo(account1);
    assert(account1Info.amount.toNumber() == 10);
    assert(account1Info.delegatedAmount.toNumber() == 2);
    if (account1Info.delegate === null) {
        throw new Error('delegate should not be null');
    } else {
        assert(account1Info.delegate.equals(delegate.publicKey));
    }

    await testToken.transfer(account1, account2, delegate, [], 1);

    account1Info = await testToken.getAccountInfo(account1);
    assert(account1Info.amount.toNumber() == 9);
    assert(account1Info.delegatedAmount.toNumber() == 1);

    await testToken.transfer(account1, account2, delegate, [], 1);

    account1Info = await testToken.getAccountInfo(account1);
    assert(account1Info.amount.toNumber() == 8);
    assert(account1Info.delegate === null);
    assert(account1Info.delegatedAmount.toNumber() == 0);

    assert(
        await didThrow(testToken, testToken.transfer, [
            account1,
            account2,
            delegate, [],
            1,
        ]),
    );
}

export async function setAuthority(): Promise < void > {
    const newOwner = new Account();
    await testToken.setAuthority(
        testAccount,
        newOwner.publicKey,
        'AccountOwner',
        testAccountOwner, [],
    );
    assert(
        await didThrow(testToken, testToken.setAuthority, [
            testAccount,
            newOwner.publicKey,
            'AccountOwner',
            testAccountOwner, [],
        ]),
    );
    await testToken.setAuthority(
        testAccount,
        testAccountOwner.publicKey,
        'AccountOwner',
        newOwner, [],
    );
}

export async function burn(): Promise < void > {
    let accountInfo = await testToken.getAccountInfo(testAccount);
    const amount = accountInfo.amount.toNumber();

    await testToken.burn(testAccount, testAccountOwner, [], 1);

    accountInfo = await testToken.getAccountInfo(testAccount);
    assert(accountInfo.amount.toNumber() == amount - 1);
}

export async function burnChecked(): Promise < void > {
    let accountInfo = await testToken.getAccountInfo(testAccount);
    const amount = accountInfo.amount.toNumber();

    assert(
        await didThrow(testToken, testToken.burnChecked, [
            testAccount,
            testAccountOwner, [],
            1,
            1,
        ]),
    );

    await testToken.burnChecked(testAccount, testAccountOwner, [], 1, 2);

    accountInfo = await testToken.getAccountInfo(testAccount);
    assert(accountInfo.amount.toNumber() == amount - 1);
}

export async function freezeThawAccount(): Promise < void > {
    let accountInfo = await testToken.getAccountInfo(testAccount);
    const amount = accountInfo.amount.toNumber();

    await testToken.freezeAccount(testAccount, testMintAuthority, []);

    const destOwner = new Account();
    const dest = await testToken.createAccount(destOwner.publicKey);

    assert(
        await didThrow(testToken, testToken.transfer, [
            testAccount,
            dest,
            testAccountOwner, [],
            100,
        ]),
    );

    await testToken.thawAccount(testAccount, testMintAuthority, []);

    await testToken.transfer(testAccount, dest, testAccountOwner, [], 100);

    let testAccountInfo = await testToken.getAccountInfo(testAccount);
    assert(testAccountInfo.amount.toNumber() === amount - 100);
}

export async function closeAccount(): Promise < void > {
    const closeAuthority = new Account();

    await testToken.setAuthority(
        testAccount,
        closeAuthority.publicKey,
        'CloseAccount',
        testAccountOwner, [],
    );
    let accountInfo = await testToken.getAccountInfo(testAccount);
    if (accountInfo.closeAuthority === null) {
        assert(accountInfo.closeAuthority !== null);
    } else {
        assert(accountInfo.closeAuthority.equals(closeAuthority.publicKey));
    }

    const dest = await testToken.createAccount(new Account().publicKey);
    const remaining = accountInfo.amount.toNumber();

    // Check that accounts with non-zero token balance cannot be closed
    assert(
        await didThrow(testToken, testToken.closeAccount, [
            testAccount,
            dest,
            closeAuthority, [],
        ]),
    );

    const connection = await getConnection();
    let tokenRentExemptAmount;
    let info = await connection.getAccountInfo(testAccount);
    if (info != null) {
        tokenRentExemptAmount = info.lamports;
    } else {
        throw new Error('Account not found');
    }

    // Transfer away all tokens
    await testToken.transfer(testAccount, dest, testAccountOwner, [], remaining);

    // Close for real
    await testToken.closeAccount(testAccount, dest, closeAuthority, []);

    info = await connection.getAccountInfo(testAccount);
    assert(info === null);

    let destInfo = await connection.getAccountInfo(dest);
    if (destInfo !== null) {
        assert(destInfo.lamports === 2 * tokenRentExemptAmount);
    } else {
        throw new Error('Account not found');
    }

    let destAccountInfo = await testToken.getAccountInfo(dest);
    assert(destAccountInfo.amount.toNumber() === remaining);
}

export async function multisig(): Promise < void > {
    const m = 2;
    const n = 5;

    let signerAccounts = [];
    for (var i = 0; i < n; i++) {
        signerAccounts.push(new Account());
    }
    let signerPublicKeys = [];
    signerAccounts.forEach(account => signerPublicKeys.push(account.publicKey));
    const multisig = await testToken.createMultisig(m, signerPublicKeys);
    const multisigInfo = await testToken.getMultisigInfo(multisig);
    assert(multisigInfo.m === m);
    assert(multisigInfo.n === n);
    assert(multisigInfo.signer1.equals(signerPublicKeys[0]));
    assert(multisigInfo.signer2.equals(signerPublicKeys[1]));
    assert(multisigInfo.signer3.equals(signerPublicKeys[2]));
    assert(multisigInfo.signer4.equals(signerPublicKeys[3]));
    assert(multisigInfo.signer5.equals(signerPublicKeys[4]));

    const multisigOwnedAccount = await testToken.createAccount(multisig);
    const finalDest = await testToken.createAccount(multisig);

    await testToken.mintTo(multisigOwnedAccount, testMintAuthority, [], 1000);

    // Transfer via multisig
    await testToken.transfer(
        multisigOwnedAccount,
        finalDest,
        multisig,
        signerAccounts,
        1,
    );
    await sleep(500);
    let accountInfo = await testToken.getAccountInfo(finalDest);
    assert(accountInfo.amount.toNumber() == 1);

    // Approve via multisig
    {
        const delegate = new PublicKey(0);
        await testToken.approve(
            multisigOwnedAccount,
            delegate,
            multisig,
            signerAccounts,
            1,
        );
        const accountInfo = await testToken.getAccountInfo(multisigOwnedAccount);
        assert(accountInfo.delegate != null);
        if (accountInfo.delegate != null) {
            assert(accountInfo.delegate.equals(delegate));
            assert(accountInfo.delegatedAmount.toNumber() == 1);
        }
    }

    // SetAuthority of account via multisig
    {
        const newOwner = new PublicKey(0);
        await testToken.setAuthority(
            multisigOwnedAccount,
            newOwner,
            'AccountOwner',
            multisig,
            signerAccounts,
        );
        const accountInfo = await testToken.getAccountInfo(multisigOwnedAccount);
        assert(accountInfo.owner.equals(newOwner));
    }
}

export async function nativeToken(): Promise < void > {
    const connection = await getConnection();
    // this user both pays for the creation of the new token account
    // and provides the lamports to wrap
    const payer = await newAccountWithLamports(connection, 2000000000 /* wag */ );
    const lamportsToWrap = 1000000000;

    const token = new Portfolio(connection, NATIVE_MINT, programId, payer);
    const owner = new Account();
    const native = await Portfolio.createWrappedNativeAccount(
        connection,
        programId,
        owner.publicKey,
        payer,
        lamportsToWrap,
    );
    let accountInfo = await token.getAccountInfo(native);
    assert(accountInfo.isNative);

    // check that the new account has wrapped native tokens.
    assert(accountInfo.amount.toNumber() === lamportsToWrap);

    let balance;
    let info = await connection.getAccountInfo(native);
    if (info != null) {
        balance = info.lamports;
    } else {
        throw new Error('Account not found');
    }

    const balanceNeeded = await connection.getMinimumBalanceForRentExemption(0);
    const dest = await newAccountWithLamports(connection, balanceNeeded);
    await token.closeAccount(native, dest.publicKey, owner, []);
    info = await connection.getAccountInfo(native);
    if (info != null) {
        throw new Error('Account not burned');
    }
    info = await connection.getAccountInfo(dest.publicKey);
    if (info != null) {
        assert(info.lamports == balanceNeeded + balance);
    } else {
        throw new Error('Account not found');
    }
}