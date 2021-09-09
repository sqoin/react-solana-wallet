

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
    createPortfolio,
    createUserPortfolio,
    runDepositPortfolio
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
    await createPortfolio();
  
    console.log("Run test: createUserPortfolio");
    await createUserPortfolio();
  
    console.log("Run test: deposit portfolio");
    await runDepositPortfolio();
 
    console.log(" *************** Finish *************** ");

  }


  
export async function createNewPortfolio(selectedWallet , connection) {  
    return createPortfolio(selectedWallet , connection);
  }
  
export async function createNewUserPortfolio(selectedWallet , connection) {  
    return createUserPortfolio(selectedWallet , connection);
  }

export async function depositInPortfolio(selectedWallet , connection) {  
  console.log ("in deposit")
    return runDepositPortfolio(selectedWallet , connection);
  }