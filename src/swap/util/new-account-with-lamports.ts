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

export async function newAccountWithLamports2(
  connection: Connection,
  lamports: number = 1000000,
): Promise<Account> {
  const account = new Account([184,216,149,41,40,171,12,157,72,45,255,50,155,65,112,12,131,202,150,158,21,252,181,58,243,189,233,75,20,96,12,10,12,76,242,225,68,38,51,86,230,115,188,117,204,183,83,62,151,157,143,116,0,221,59,254,16,131,227,95,152,250,103,201]);
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

export async function newAccountWithLamports3(
  connection: Connection,
  lamports: number = 1000000,
): Promise<Account> {
  const account = new Account([43,36,17,7,198,168,160,139,206,184,37,183,223,92,69,107,32,164,242,119,80,108,223,36,105,237,154,114,171,215,84,240,14,247,195,169,109,123,81,138,18,34,141,131,27,77,96,160,118,253,0,146,250,65,115,141,175,182,19,106,55,45,228,125]);
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
