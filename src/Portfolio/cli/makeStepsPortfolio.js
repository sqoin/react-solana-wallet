

/**
 * Exercises the token program
 *
 * @flow
 */

 import {
    loadTokenProgram,
    createMint,
    createAccount,

    runDeposit,

    runApprove,
 
    createUserPortfolio,
    runDepositPortfolio,
    createPortfolios,createNewTestToken
    
  } from './token-test';


export async function makeStepsPortfolio(selectedWallet) {
    console.log("********** NoVa FINaNCe PorTFolIo PROJECT **********");
    console.log('Run test: loadTokenProgram');
    await loadTokenProgram();
    console.log('Run test: createMint');
    await createMint();
    console.log("Run test: createAccount");
    await createAccount();
    console.log("Run test : runApprove")
    await runApprove();
    console.log("Run test: runDeposit");
    await runDeposit();
    console.log("Run test: createPortfolio");
    await createPortfolios();
  
    console.log("Run test: createUserPortfolio");
    await createUserPortfolio();
  
    console.log("Run test: deposit portfolio");
    await runDepositPortfolio();
 
    console.log(" *************** Finish *************** ");

  }


  
export async function createNewPortfolio(selectedWallet, connection,token,USDCToken,metaDataUrl,amountAsset1,amountAsset2,amountAsset3,periodAsset1,periodAsset2,periodAsset3,assetToSold1,assetToSold2,assetToSold3) {  
    return createPortfolios(selectedWallet, connection,token,USDCToken,metaDataUrl,amountAsset1,amountAsset2,amountAsset3,periodAsset1,periodAsset2,periodAsset3,assetToSold1,assetToSold2,assetToSold3);
  }
  
export async function createNewUserPortfolio(selectedWallet , connection) {  
    return createUserPortfolio(selectedWallet , connection);
  }

export async function depositInPortfolio(selectedWallet , connection) {  
  console.log ("in deposit")
    return runDepositPortfolio(selectedWallet , connection);
  }
  export async function createTestToken(selectedWallet,connection){
    return createNewTestToken(selectedWallet,connection)
  }