/**
 * Exercises the token program
 *
 * @flow
 */

import {
  loadTokenProgram,
  createMint,
  createAccount,
  transfer,
  mintTo,
  runDeposit,
  withDraw,
  runGetFullBalance,
  runApproveChecked,
  infoAccountByPublicKey,
  runApprove,
  createPortfolio,
  createUserPortfolio,
  runDepositPortfolio
} from './token-test';

async function main() {

  console.log("********** NoVa FINaNCe NTOKEN PROJECT **********");
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

  /*  console.log("Run test: createAccount");
   await createAccount();
   console.log('Run test: mintTo');
   await mintTo();
    console.log("Run test: approveChecked");
   await runApproveChecked();
   console.log("Run test: runDeposit");
  // await runDeposit();
  // console.log('Run test: transfer');
   // await transfer();*/
  //console.log('Run test: withDraw');
  //await withDraw(); 
  console.log(" *************** Finish *************** ");


  console.log("get info account ")

  await infoAccountByPublicKey();


}

main()
  .catch(err => {
    console.error(err);
    process.exit(-1);
  })
  .then(() => process.exit());