
import * as BufferLayout from 'buffer-layout';

import {


  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
  PublicKey
  
} from '@solana/web3.js';

import {
  TOKEN_PROGRAM_ID
} from "./pogramAdresses"


const LAYOUT = BufferLayout.union(BufferLayout.u8('instruction'));
LAYOUT.addVariant(
  0,
  BufferLayout.struct([
    BufferLayout.u8('decimals'),
    BufferLayout.blob(32, 'mintAuthority'),
    BufferLayout.u8('freezeAuthorityOption'),
    BufferLayout.blob(32, 'freezeAuthority'),
  ]),
  'initializeMint',
);
LAYOUT.addVariant(1, BufferLayout.struct([]), 'initializeAccount');
LAYOUT.addVariant(
  3,
  BufferLayout.struct([BufferLayout.nu64('amount')]),
  'transfer',
);
// SMITH
LAYOUT.addVariant(
  6,
  BufferLayout.struct([
    BufferLayout.u8('authorityType'),
    BufferLayout.u8('newAuthorityOption'),
    BufferLayout.blob(32, 'newAuthority'),
  ]),
  'setAuthority',
);
LAYOUT.addVariant(
  7,
  BufferLayout.struct([BufferLayout.nu64('amount')]),
  'mintTo',
);
LAYOUT.addVariant(
  8,
  BufferLayout.struct([BufferLayout.nu64('amount')]),
  'burn',
);
LAYOUT.addVariant(9, BufferLayout.struct([]), 'closeAccount');

const instructionMaxSpan = Math.max(
  ...Object.values(LAYOUT.registry).map((r) => r.span),
);

export function initializeMint({
    mint,
    decimals,
    mintAuthority,
    freezeAuthority,
  }) {
    let keys = [
      { pubkey: mint, isSigner: false, isWritable: true },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ];
  console.log("freezeAuthoritykkkkkkkk")
  console.log("freezeAuthority", new PublicKey().toBase58())
    return new TransactionInstruction({

      keys,
      data: encodeTokenInstructionData({
        initializeMint: {
          decimals,
          mintAuthority: mintAuthority.toBuffer(),
          freezeAuthorityOption: !!freezeAuthority,
          freezeAuthority: (freezeAuthority || new PublicKey()).toBuffer(),
        },
      }),
      programId: TOKEN_PROGRAM_ID,
    });
  }
  export function mintTo({ mint, destination, amount, mintAuthority }) {
    let keys = [
      { pubkey: mint, isSigner: false, isWritable: true },
      { pubkey: destination, isSigner: false, isWritable: true },
      { pubkey: mintAuthority, isSigner: true, isWritable: false },
    ];
    return new TransactionInstruction({
      keys,
      data: encodeTokenInstructionData({
        mintTo: {
          amount,
        },
      }),
      programId: TOKEN_PROGRAM_ID,
    });
  }
  function encodeTokenInstructionData(instruction) {
    let b = Buffer.alloc(instructionMaxSpan);
    let span = LAYOUT.encode(instruction, b);
    return b.slice(0, span);
  }