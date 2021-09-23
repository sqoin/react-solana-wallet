import "chai-as-promised";
import "chai-bn";

import type { Idl } from "@project-serum/anchor";
import * as anchor from "@project-serum/anchor";
import { chaiSolana } from "@saberhq/chai-solana";
import { SolanaProvider } from "@saberhq/solana-contrib";
import chai, { assert } from "chai";

import type { Programs } from "./utils";
import { QuarrySDK } from "./utils";

chai.use(chaiSolana);

export type Workspace = Programs;
const options = anchor.Provider.defaultOptions();
export const makeSDK = (connection:any, wallet:any): QuarrySDK => {
  const anchorProvider = new anchor.Provider(connection,wallet, options)
  anchor.setProvider(anchorProvider);

  const provider = SolanaProvider.load({
    connection: connection,
    sendConnection: connection,
    wallet: wallet,
    opts: options,
  });
  return QuarrySDK.load({
    provider,
  });
};

type IDLError = NonNullable<Idl["errors"]>[number];

export const assertError = (error: IDLError, other: IDLError): void => {
  assert.strictEqual(error.code, other.code);
  assert.strictEqual(error.msg, other.msg);
};
