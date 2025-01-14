import fs from "fs";
import { Account, PublicKey } from "@solana/web3.js";
import type { Connection } from "@solana/web3.js";

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function newAccountWithLamports(
  connection: Connection,
  lamports: number = 1000000
): Promise<Account> {
  const account = new Account();

  let retries = 60;
  try {
    await connection.requestAirdrop(account.publicKey, lamports);
  } catch (e) {
    // tslint:disable:no-console
    console.error(e);
  }
  for (;;) {
    await sleep(1000);
    if (lamports === (await connection.getBalance(account.publicKey))) {
      return account;
    }
    if (--retries <= 0) {
      break;
    }
  }
  throw new Error(`Airdrop of ${lamports} failed`);
}

export const getDeploymentInfo = () => {
 
  return {
    clusterUrl: "https://api.devnet.solana.com",
    stableSwapProgramId: new PublicKey("4LuNy5KrqDkGNZygxUhJSmhcd97Fpqp6StXDnGfXtYg3"),
  };
};
