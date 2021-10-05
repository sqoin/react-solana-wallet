import { PublicKey } from "@solana/web3.js";

import { QuarryMineJSON } from "./idls/quarry_mine";
import { QuarryMintWrapperJSON } from "./idls/quarry_mint_wrapper";
import type { MineProgram, MintWrapperProgram } from "./programs";
import type { RegistryProgram } from "./programs/registry";
import { QuarryRegistryJSON } from "./programs/registry";

export interface Programs {
  MintWrapper: MintWrapperProgram;
  Mine: MineProgram;
  Registry: RegistryProgram;
}

// See `Anchor.toml` for all addresses.
export const QUARRY_ADDRESSES = {
 MintWrapper: new PublicKey("29ZVNxZbUZVCEsLme6xJNrpmRsWNxdqNmHab38t5M7Dd"),//dev
 //MintWrapper: new PublicKey("55zRJtzxGNwD5uEv5PpWSbLn6m9hR5Zv4NJn1XDj7LXF"),//loc
  Mine: new PublicKey("4zUyFEkwfyyrLq2Z5mkrTNKgUjfHShA2QQK3NSeWGirB"),//dev
// Mine: new PublicKey("HmuXFgmm6z3tYDWQTiinHGt5kP2HnouGTEN5pqFQABGn"),//loc
  Registry: new PublicKey("Bddx7YVYwD1PMvuYPeaE73H3VH3rdPCSVw7Ap3NesKXF"),//dev
 //Registry: new PublicKey("8wvpEkXxX9ugxWyoVA6i6pLffN9AdVYaJAd1sFVeryPs")//loc
};

export const QUARRY_IDLS = {
  MintWrapper: QuarryMintWrapperJSON,
  Mine: QuarryMineJSON,
  Registry: QuarryRegistryJSON,
};

/**
 * Recipient of protocol fees.
 */
export const QUARRY_FEE_TO = new PublicKey(
  "4MMZH3ih1aSty2nx4MC3kSR94Zb55XsXnqb5jfEcyHWQ"
);

/**
 * Sets the protocol fees.
 */
export const QUARRY_FEE_SETTER = new PublicKey(
  "4MMZH3ih1aSty2nx4MC3kSR94Zb55XsXnqb5jfEcyHWQ"
);
