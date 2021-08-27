// @flow

import {Account, Connection} from '@solana/web3.js';

import {sleep} from './sleep';

export async function newAccountWithLamports(
  connection: Connection,
  lamports: number = 1000000,
): Promise<Account> {
  const account = new Account();

  let retries = 30;
  await connection.requestAirdrop(account.publicKey, lamports);
  for (;;) {
    await sleep(500);
    if (lamports == (await connection.getBalance(account.publicKey))) {
      return account;
    }
    if (--retries <= 0) {
      break;
    }
  }
  throw new Error(`Airdrop of ${lamports} failed`);
}

export async function newAccountWithLamports1(
  connection: Connection,
  lamports: number = 1000000,
): Promise<Account> {
  const account = new Account([97,30,31,33,13,91,4,73,57,214,172,115,44,20,255,207,156,101,25,224,7,2,170,146,20,213,165,241,211,14,76,95,123,128,140,138,192,242,113,62,119,27,79,105,116,153,140,191,215,220,88,150,210,137,231,88,23,142,210,51,240,144,106,241]);
//9K6qVzdfFZL6jkwsyHBG3q1C82PqRtLTwtbZJiDc86Cx
/*   let retries = 30;
  await connection.requestAirdrop(account.publicKey, lamports);
  for (;;) {
    await sleep(500);
    if (lamports == (await connection.getBalance(account.publicKey))) { */
      return account;
   /*  }
    if (--retries <= 0) {
      break;
    }
  }
  throw new Error(`Airdrop of ${lamports} failed`); */
}