/**
 * @flow
 */

import { Buffer } from 'buffer';
import assert from 'assert';
import BN from 'bn.js';
//@ts-ignore
import * as BufferLayout from 'buffer-layout';
import {
  Account,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import type {
  Connection,
  Commitment,
  TransactionSignature,
} from '@solana/web3.js';

import * as Layout from './layout';
import { sendAndConfirmTransaction } from './util/send-and-confirm-transaction';

import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { CurveType, TokenSwap } from '../swap/index';

const FAILED_TO_FIND_ACCOUNT = 'Failed to find account';
const INVALID_ACCOUNT_OWNER = 'Invalid account owner';
const ASSOCIATED_TOKEN_PROGRAM_ID="ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
export const ORIGINE_PROGRAMM_ID="TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
/**
 * Unfortunately, BufferLayout.encode uses an `instanceof` check for `Buffer`
 * which fails when using `publicKey.toBuffer()` directly because the bundled `Buffer`
 * class in `@solana/web3.js` is different from the bundled `Buffer` class in this package
 */
function pubkeyToBuffer(publicKey: PublicKey): typeof Buffer {
  //@ts-ignore
  return Buffer.from(publicKey.toBuffer());
}

/**
 * 64-bit value
 */
export class u64 extends BN {
  /**
   * Convert to Buffer representation
   */
  //@ts-ignore
  toBuffer(): typeof Buffer {
    const a = super.toArray().reverse();
    const b = Buffer.from(a);
    if (b.length === 8) {
      //@ts-ignore
      return b;
    }
    assert(b.length < 8, 'u64 too large');

    const zeroPad = Buffer.alloc(8);
    b.copy(zeroPad);
    //@ts-ignore
    return zeroPad;
  }

  /**
   * Construct a u64 from Buffer representation
   */
  static fromBuffer(buffer: typeof Buffer): u64 {
    assert(buffer.length === 8, `Invalid buffer length: ${buffer.length}`);
    return new u64(
      //@ts-ignore
      [...buffer]
        .reverse()
        .map(i => `00${i.toString(16)}`.slice(-2))
        .join(''),
      16,
    );
  }
}

function isAccount(accountOrPublicKey: any): boolean {
  return 'publicKey' in accountOrPublicKey;
}

type AuthorityType =
  | 'MintTokens'
  | 'FreezeAccount'
  | 'AccountOwner'
  | 'CloseAccount';

const AuthorityTypeCodes = {
  MintTokens: 0,
  FreezeAccount: 1,
  AccountOwner: 2,
  CloseAccount: 3,
};

// The address of the special mint for wrapped native Token.
export const NATIVE_MINT: PublicKey = new PublicKey(
  'So11111111111111111111111111111111111111112',
);

/**
 * Information about the mint
 */
export type MintInfo = {
  /**
   * Optional authority used to mint new tokens. The mint authority may only be provided during
   * mint creation. If no mint authority is present then the mint has a fixed supply and no
   * further tokens may be minted.
   */
  mintAuthority: null | PublicKey,

  /**
   * Total supply of tokens
   */
  supply: u64,

  /**
   * Number of base 10 digits to the right of the decimal place
   */
  decimals: number,

  /**
   * Is this mint initialized
   */
  isInitialized: boolean,

  /**
   * Optional authority to freeze token accounts
   */
  freezeAuthority: null | PublicKey,
};

export const MintLayout: typeof BufferLayout.Structure = BufferLayout.struct([
  BufferLayout.u32('mintAuthorityOption'),
  Layout.publicKey('mintAuthority'),
  Layout.uint64('supply'),
  BufferLayout.u8('decimals'),
  BufferLayout.u8('isInitialized'),
  BufferLayout.u32('freezeAuthorityOption'),
  Layout.publicKey('freezeAuthority'),

]);
/**
 * Information about an account
 */
type AccountInfo = {
  /**
   * The address of this account
   */
  address: PublicKey,

  /**
   * The mint associated with this account
   */
  mint: PublicKey,

  /**
   * Owner of this account
   */
  owner: PublicKey,

  /**
   * Amount of tokens this account holds
   */
  amount: u64,

  /**
   * The delegate for this account
   */
  delegate: null | PublicKey,

  /**
   * The amount of tokens the delegate authorized to the delegate
   */
  delegatedAmount: u64,

  /**
   * Is this account initialized
   */
  isInitialized: boolean,

  /**
   * Is this account frozen
   */
  isFrozen: boolean,

  /**
   * Is this a native token account
   */
  isNative: boolean,

  /**
   * If this account is a native token, it must be rent-exempt. This
   * value logs the rent-exempt reserve which must remain in the balance
   * until the account is closed.
   */
  rentExemptReserve: null | u64,

  /**
   * Optional authority to close the account
   */
  closeAuthority: null | PublicKey,
};

/**
 * @private
 */
export const AccountLayout: typeof BufferLayout.Structure = BufferLayout.struct(
  [
    Layout.publicKey('mint'), //  32
    Layout.publicKey('owner'), //32
    Layout.uint64('amount'), // 8
    BufferLayout.u32('delegateOption'),
    Layout.publicKey('delegate'),// 36
    BufferLayout.u8('state'), // 1
    BufferLayout.u32('isNativeOption'),
    Layout.uint64('isNative'), //12
    Layout.uint64('delegatedAmount'),// 8
    BufferLayout.u32('closeAuthorityOption'),
    Layout.publicKey('closeAuthority'),//36
  ],
);



export const AccountOrigineLayout: typeof BufferLayout.Structure = BufferLayout.struct(
  [
    Layout.publicKey('mint'),
    Layout.publicKey('owner'),
    Layout.uint64('amount'),
    BufferLayout.u32('delegateOption'),
    Layout.publicKey('delegate'),
    BufferLayout.u8('state'),
    BufferLayout.u32('isNativeOption'),
    Layout.uint64('isNative'),
    Layout.uint64('delegatedAmount'),
    BufferLayout.u32('closeAuthorityOption'),
    Layout.publicKey('closeAuthority'),
  ],
);
/**
 * Information about an multisig
 */
type MultisigInfo = {
  /**
   * The number of signers required
   */
  m: number,

  /**
   * Number of possible signers, corresponds to the
   * number of `signers` that are valid.
   */
  n: number,

  /**
   * Is this mint initialized
   */
  initialized: boolean,

  /**
   * The signers
   */
  signer1: PublicKey,
  signer2: PublicKey,
  signer3: PublicKey,
  signer4: PublicKey,
  signer5: PublicKey,
  signer6: PublicKey,
  signer7: PublicKey,
  signer8: PublicKey,
  signer9: PublicKey,
  signer10: PublicKey,
  signer11: PublicKey,
};

/**
 * @private
 */
const MultisigLayout = BufferLayout.struct([
  BufferLayout.u8('m'),
  BufferLayout.u8('n'),
  BufferLayout.u8('is_initialized'),
  Layout.publicKey('signer1'),
  Layout.publicKey('signer2'),
  Layout.publicKey('signer3'),
  Layout.publicKey('signer4'),
  Layout.publicKey('signer5'),
  Layout.publicKey('signer6'),
  Layout.publicKey('signer7'),
  Layout.publicKey('signer8'),
  Layout.publicKey('signer9'),
  Layout.publicKey('signer10'),
  Layout.publicKey('signer11'),
]);

/**
 * An ERC20-like Token
 */
export class Token {
  /**
   * @private
   */
  //@ts-ignore
  connection: Connection;

  /**
   * The public key identifying this mint
   */
  //@ts-ignore
  publicKey: PublicKey;

  /**
   * Program Identifier for the Token program
   */
  //@ts-ignore
  programId: PublicKey;

  /**
   * Program Identifier for the Associated Token program
   */
  //@ts-ignore
  associatedProgramId: PublicKey;

  /**
   * Fee payer
   */
  //@ts-ignore
  payer: any;

  /**
   * Create a Token object attached to the specific mint
   *
   * @param connection The connection to use
   * @param token Public key of the mint
   * @param programId token programId
   * @param payer Payer of fees
   */
  constructor(
    connection: Connection,
    publicKey: PublicKey,
    programId: PublicKey,
    payer: Account,
  ) {
    Object.assign(this, {
      connection,
      publicKey,
      programId,
      payer,
      // Hard code is ok; Overriding is needed only for tests
      associatedProgramId: ASSOCIATED_TOKEN_PROGRAM_ID,
    });
  }

  /**
   * Get the minimum balance for the mint to be rent exempt
   *
   * @return Number of lamports required
   */
  static async getMinBalanceRentForExemptMint(
    connection: Connection,
  ): Promise<number> {
    return await connection.getMinimumBalanceForRentExemption(MintLayout.span);
  }

  /**
   * Get the minimum balance for the account to be rent exempt
   *
   * @return Number of lamports required
   */
  static async getMinBalanceRentForExemptAccount(
    connection: Connection,
  ): Promise<number> {
    return await connection.getMinimumBalanceForRentExemption(
      AccountLayout.span,
    );
  }

  /**
   * Get the minimum balance for the multsig to be rent exempt
   *
   * @return Number of lamports required
   */
  static async getMinBalanceRentForExemptMultisig(
    connection: Connection,
  ): Promise<number> {
    return await connection.getMinimumBalanceForRentExemption(
      MultisigLayout.span,
    );
  }

  /**
   * Create and initialize a Token.
   *
   * @param connection The connection to use
   * @param payer Fee payer for transaction
   * @param mintAuthority Account or multisig that will control minting
   * @param freezeAuthority Optional account or multisig that can freeze token accounts
   * @param decimals Location of the decimal place
   * @param programId Optional token programId, uses the system programId by default
   * @return Token object for the newly minted token
   */
  static async createMint(
    connection: Connection,
    //@ts-ignore
    payer,
    mintAuthority: PublicKey,
    freezeAuthority: PublicKey | null,
    decimals: number,
    programId: PublicKey,
    programIdAsset: PublicKey | null,
    programIdSwap: PublicKey | null
  ): Promise<any> {
    const mintAccount = new Account();
    const token = new Token(
      connection,
      mintAccount.publicKey,
      programId,
      payer,
    );
    // Allocate memory for the account
    const balanceNeeded = await Token.getMinBalanceRentForExemptMint(
      connection,
    );

    const transaction = new Transaction();
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mintAccount.publicKey,
        lamports: balanceNeeded,
        space: MintLayout.span,
        programId,
      }),
    );

    transaction.add(
      Token.createInitMintInstruction(
        programId,
        mintAccount.publicKey,
        decimals,
        mintAuthority,
        freezeAuthority,
        programIdAsset,
        programIdSwap
      ),
    );

    transaction.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;
    transaction.feePayer = payer.publicKey;
    transaction.partialSign(mintAccount);

    let signed = await payer.signTransaction(transaction);

    let signature = await connection.sendRawTransaction(signed.serialize());

    let result= await connection.confirmTransaction(signature, 'max');
    console.log("mintAccount: "+mintAccount.publicKey)
 
let ret=[];
    return token;
  }
/**
   * Create and initialize a Token return instruction 
   *
   * @param connection The connection to use
   * @param payer Fee payer for transaction
   * @param mintAuthority Account or multisig that will control minting
   * @param freezeAuthority Optional account or multisig that can freeze token accounts
   * @param decimals Location of the decimal place
   * @param programId Optional token programId, uses the system programId by default
   * @return Token object for the newly minted token
   */
 static async createMintReturnInstruction(
  connection: Connection,
  //@ts-ignore
  payer,
  mintAuthority: PublicKey,
  freezeAuthority: PublicKey | null,
  decimals: number,
  programId: PublicKey,
  programIdAsset: PublicKey | null,
  programIdSwap: PublicKey | null
): Promise<any> {
  const mintAccount = new Account();
  const token = new Token(
    connection,
    mintAccount.publicKey,
    programId,
    payer,
  );
  // Allocate memory for the account
  const balanceNeeded = await Token.getMinBalanceRentForExemptMint(
    connection,
  );

  const transaction = new Transaction();
  let instruction1=SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: mintAccount.publicKey,
    lamports: balanceNeeded,
    space: MintLayout.span,
    programId,
  });
  let instruction2=Token.createInitMintInstruction(
    programId,
    mintAccount.publicKey,
    decimals,
    mintAuthority,
    freezeAuthority,
    programIdAsset,
    programIdSwap
  );
 
  /* transaction.add(
    instruction1,instruction2
  );

  transaction.recentBlockhash = (
    await connection.getRecentBlockhash()
  ).blockhash;
  transaction.feePayer = payer.publicKey;
  transaction.partialSign(mintAccount);

  let signed = await payer.signTransaction(transaction);

  let signature = await connection.sendRawTransaction(signed.serialize());

  let result= await connection.confirmTransaction(signature, 'max'); */
  console.log("mintAccount: "+mintAccount.publicKey)

let ret=[mintAccount,token,instruction1,instruction2];
console.log(ret);
  return ret;
}

  /**
   * Create and initialize a new account.
   *
   * This account may then be used as a `transfer()` or `approve()` destination
   *
   * @param owner User account that will own the new account
   * @return Public key of the new empty account
   */
   async createAccount(owner: PublicKey): Promise<PublicKey> {

    const balanceNeeded = await Token.getMinBalanceRentForExemptAccount(
      this.connection,
    );
    const newAccount = new Account();
    const transaction = new Transaction();
    console.log("newAccount.publicKey "+newAccount.publicKey)
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: this.payer.publicKey,
        newAccountPubkey: newAccount.publicKey,
        lamports: balanceNeeded,
        space: AccountLayout.span,
        programId: this.programId,
      }),
    );

    const mintPublicKey = this.publicKey;
    transaction.add(
      Token.createInitAccountInstruction(
        this.programId,
        mintPublicKey,
        newAccount.publicKey,
        owner,
      ),
    );

    transaction.recentBlockhash = (
      await this.connection.getRecentBlockhash()
    ).blockhash;
    transaction.feePayer = this.payer.publicKey;
    transaction.partialSign(newAccount);
    let signed = await this.payer.signTransaction(transaction);
    console.log("transaction signed: "+JSON.stringify(signed))
    console.log(signed.serialize())
    let signature = await this.connection.sendRawTransaction(signed.serialize());
    console.log("signature: "+JSON.stringify(signature))
    await this.connection.confirmTransaction(signature, 'max');
    console.log("max: "+newAccount.publicKey)
    return newAccount.publicKey;
  }



  /**
   * Create and initialize a new account.
   *
   * This account may then be used as a `transfer()` or `approve()` destination
   *
   * @param owner User account that will own the new account
   * @return Public key of the new empty account
   */
   async createAccountOfInsctruction(owner: PublicKey): Promise<any> {

    const balanceNeeded = await Token.getMinBalanceRentForExemptAccount(
      this.connection,
    );
    const newAccount = new Account();
    const transaction = new Transaction();
    console.log("newAccount.publicKey "+newAccount.publicKey)
    let instruction1= SystemProgram.createAccount({
      fromPubkey: this.payer.publicKey,
      newAccountPubkey: newAccount.publicKey,
      lamports: balanceNeeded,
      space: AccountLayout.span,
      programId: this.programId,
    });
    const mintPublicKey = this.publicKey;
    let instruction2=Token.createInitAccountInstruction(
      this.programId,
      mintPublicKey,
      newAccount.publicKey,
      owner,
    );
   /*  transaction.add(
     instruction1,instruction2
    );

  
    
    transaction.recentBlockhash = (
      await this.connection.getRecentBlockhash()
    ).blockhash;
    transaction.feePayer = this.payer.publicKey;
    transaction.partialSign(newAccount);
    let signed = await this.payer.signTransaction(transaction);
    console.log("transaction signed: "+JSON.stringify(signed))
    console.log(signed.serialize())
    let signature = await this.connection.sendRawTransaction(signed.serialize());
    console.log("signature: "+JSON.stringify(signature))
    await this.connection.confirmTransaction(signature, 'max');
    console.log("max: "+newAccount.publicKey) */
    let ret=[newAccount,instruction1,instruction2];
    return ret;
  }

  /**
   * Create and initialize the associated account.
   *
   * This account may then be used as a `transfer()` or `approve()` destination
   *
   * @param owner User account that will own the new account
   * @return Public key of the new associated account
   */
  async createAssociatedTokenAccount(owner: PublicKey): Promise<PublicKey> {
    const associatedAddress = await Token.getAssociatedTokenAddress(
      this.associatedProgramId,
      this.programId,
      this.publicKey,
      owner,
    );

    return this.createAssociatedTokenAccountInternal(owner, associatedAddress);
  }

  async createAssociatedTokenAccountInternal(
    owner: PublicKey,
    associatedAddress: PublicKey,
  ): Promise<PublicKey> {
    await sendAndConfirmTransaction(
      'CreateAssociatedTokenAccount',
      this.connection,
      new Transaction().add(
        Token.createAssociatedTokenAccountInstruction(
          this.associatedProgramId,
          this.programId,
          this.publicKey,
          associatedAddress,
          owner,
          this.payer.publicKey,
        ),
      ),
      this.payer,
    );

    return associatedAddress;
  }

  /**
   * Retrieve the associated account or create one if not found.
   *
   * This account may then be used as a `transfer()` or `approve()` destination
   *
   * @param owner User account that will own the new account
   * @return The new associated account
   */
  async getOrCreateAssociatedAccountInfo(
    owner: PublicKey,
  ): Promise<AccountInfo> {
    const associatedAddress = await Token.getAssociatedTokenAddress(
      this.associatedProgramId,
      this.programId,
      this.publicKey,
      owner,
    );

    // This is the optimum logic, considering TX fee, client-side computation,
    // RPC roundtrips and guaranteed idempotent.
    // Sadly we can't do this atomically;
    try {
      return await this.getAccountInfo(associatedAddress);
    } catch (err) {
      // INVALID_ACCOUNT_OWNER can be possible if the associatedAddress has
      // already been received some lamports (= became system accounts).
      // Assuming program derived addressing is safe, this is the only case
      // for the INVALID_ACCOUNT_OWNER in this code-path
      if (
        err.message === FAILED_TO_FIND_ACCOUNT ||
        err.message === INVALID_ACCOUNT_OWNER
      ) {
        // as this isn't atomic, it's possible others can create associated
        // accounts meanwhile
        try {
          await this.createAssociatedTokenAccountInternal(
            owner,
            associatedAddress,
          );
        } catch (err) {
          // ignore all errors; for now there is no API compatible way to
          // selectively ignore the expected instruction error if the
          // associated account is existing already.
        }

        // Now this should always succeed
        return await this.getAccountInfo(associatedAddress);
      } else {
        throw err;
      }
    }
  }

  /**
   * Create and initialize a new account on the special native token mint.
   *
   * In order to be wrapped, the account must have a balance of native tokens
   * when it is initialized with the token program.
   *
   * This function sends lamports to the new account before initializing it.
   *
   * @param connection A solana web3 connection
   * @param programId The token program ID
   * @param owner The owner of the new token account
   * @param payer The source of the lamports to initialize, and payer of the initialization fees.
   * @param amount The amount of lamports to wrap
   * @return {Promise<PublicKey>} The new token account
   */
  static async createWrappedNativeAccount(
    connection: Connection,
    programId: PublicKey,
    owner: PublicKey,
    payer: Account,
    amount: number,
  ): Promise<PublicKey> {
    // Allocate memory for the account
    const balanceNeeded = await Token.getMinBalanceRentForExemptAccount(
      connection,
    );

    // Create a new account
    const newAccount = new Account();
    const transaction = new Transaction();
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: newAccount.publicKey,
        lamports: balanceNeeded,
        space: AccountLayout.span,
        programId,
      }),
    );

    // Send lamports to it (these will be wrapped into native tokens by the token program)
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: newAccount.publicKey,
        lamports: amount,
      }),
    );

    // Assign the new account to the native token mint.
    // the account will be initialized with a balance equal to the native token balance.
    // (i.e. amount)
    transaction.add(
      Token.createInitAccountInstruction(
        programId,
        NATIVE_MINT,
        newAccount.publicKey,
        owner,
      ),
    );

    // Send the three instructions
    await sendAndConfirmTransaction(
      'createAccount, transfer, and initializeAccount',
      connection,
      transaction,
      payer,
      newAccount,
    );

    return newAccount.publicKey;
  }

  /**
   * Create and initialize a new multisig.
   *
   * This account may then be used for multisignature verification
   *
   * @param m Number of required signatures
   * @param signers Full set of signers
   * @return Public key of the new multisig account
   */
  async createMultisig(
    m: number,
    signers: Array<PublicKey>,
  ): Promise<PublicKey> {
    const multisigAccount = new Account();

    // Allocate memory for the account
    const balanceNeeded = await Token.getMinBalanceRentForExemptMultisig(
      this.connection,
    );
    const transaction = new Transaction();
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: this.payer.publicKey,
        newAccountPubkey: multisigAccount.publicKey,
        lamports: balanceNeeded,
        space: MultisigLayout.span,
        programId: this.programId,
      }),
    );

    // create the new account
    let keys = [
      { pubkey: multisigAccount.publicKey, isSigner: false, isWritable: true },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ];
    signers.forEach(signer =>
      keys.push({ pubkey: signer, isSigner: false, isWritable: false }),
    );
    const dataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.u8('m'),
    ]);
    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 2, // InitializeMultisig instruction
        m,
      },
      data,
    );
    transaction.add({
      keys,
      programId: this.programId,
      data,
    });

    // Send the two instructions
    await sendAndConfirmTransaction(
      'createAccount and InitializeMultisig',
      this.connection,
      transaction,
      this.payer,
      multisigAccount,
    );

    return multisigAccount.publicKey;
  }

  /**
   * Retrieve mint information
   */
  async getMintInfo(): Promise<MintInfo> {
    const info = await this.connection.getAccountInfo(this.publicKey);
    if (info === null) {
      throw new Error('Failed to find mint account');
    }
    if (!info.owner.equals(this.programId)) {
      throw new Error(`Invalid mint owner: ${JSON.stringify(info.owner)}`);
    }
    if (info.data.length != MintLayout.span) {
      throw new Error(`Invalid mint size`);
    }

    const data = Buffer.from(info.data);
    const mintInfo = MintLayout.decode(data);

    if (mintInfo.mintAuthorityOption === 0) {
      mintInfo.mintAuthority = null;
    } else {
      mintInfo.mintAuthority = new PublicKey(mintInfo.mintAuthority);
    }

    mintInfo.supply = u64.fromBuffer(mintInfo.supply);
    mintInfo.isInitialized = mintInfo.isInitialized != 0;

    if (mintInfo.freezeAuthorityOption === 0) {
      mintInfo.freezeAuthority = null;
    } else {
      mintInfo.freezeAuthority = new PublicKey(mintInfo.freezeAuthority);
    }
    return mintInfo;
  }

  /**
   * Retrieve account information
   *
   * @param account Public key of the account
   */
  async getAccountInfo(
    account: PublicKey,
    commitment?: Commitment,
  ): Promise<any> {
    const info = await this.connection.getAccountInfo(account, commitment);
    // if (info === null) {
    //   throw new Error(FAILED_TO_FIND_ACCOUNT);
    // }
    // if (!info.owner.equals(this.programId)) {
    //   throw new Error(INVALID_ACCOUNT_OWNER);
    // }
    // if (info.data.length != AccountLayout.span) {
    //   throw new Error(`Invalid account size`);
    // }

   if(info){
    //@ts-ignore
    const data = Buffer.from(info.data);
    const accountInfo = AccountLayout.decode(data);
    accountInfo.address = account;
    accountInfo.mint = new PublicKey(accountInfo.mint);
    accountInfo.owner = new PublicKey(accountInfo.owner);
    accountInfo.amount = u64.fromBuffer(accountInfo.amount);

    if (accountInfo.delegateOption === 0) {
      accountInfo.delegate = null;
      //@ts-ignore
      accountInfo.delegatedAmount = new u64();
    } else {
      accountInfo.delegate = new PublicKey(accountInfo.delegate);
      accountInfo.delegatedAmount = u64.fromBuffer(accountInfo.delegatedAmount);
    }

    accountInfo.isInitialized = accountInfo.state !== 0;
    accountInfo.isFrozen = accountInfo.state === 2;

    if (accountInfo.isNativeOption === 1) {
      accountInfo.rentExemptReserve = u64.fromBuffer(accountInfo.isNative);
      accountInfo.isNative = true;
    } else {
      accountInfo.rentExemptReserve = null;
      accountInfo.isNative = false;
    }

    if (accountInfo.closeAuthorityOption === 0) {
      accountInfo.closeAuthority = null;
    } else {
      accountInfo.closeAuthority = new PublicKey(accountInfo.closeAuthority);
    }

    if (!accountInfo.mint.equals(this.publicKey)) {
      throw new Error(
        `Invalid account mint: ${JSON.stringify(
          accountInfo.mint,
        )} !== ${JSON.stringify(this.publicKey)}`,
      );
    }
    return accountInfo;
  }
  else{
    return null;
  }
  }

  /**
   * Retrieve Multisig information
   *
   * @param multisig Public key of the account
   */
  async getMultisigInfo(multisig: PublicKey): Promise<MultisigInfo> {
    const info = await this.connection.getAccountInfo(multisig);
    if (info === null) {
      throw new Error('Failed to find multisig');
    }
    if (!info.owner.equals(this.programId)) {
      throw new Error(`Invalid multisig owner`);
    }
    if (info.data.length != MultisigLayout.span) {
      throw new Error(`Invalid multisig size`);
    }

    const data = Buffer.from(info.data);
    const multisigInfo = MultisigLayout.decode(data);
    multisigInfo.signer1 = new PublicKey(multisigInfo.signer1);
    multisigInfo.signer2 = new PublicKey(multisigInfo.signer2);
    multisigInfo.signer3 = new PublicKey(multisigInfo.signer3);
    multisigInfo.signer4 = new PublicKey(multisigInfo.signer4);
    multisigInfo.signer5 = new PublicKey(multisigInfo.signer5);
    multisigInfo.signer6 = new PublicKey(multisigInfo.signer6);
    multisigInfo.signer7 = new PublicKey(multisigInfo.signer7);
    multisigInfo.signer8 = new PublicKey(multisigInfo.signer8);
    multisigInfo.signer9 = new PublicKey(multisigInfo.signer9);
    multisigInfo.signer10 = new PublicKey(multisigInfo.signer10);
    multisigInfo.signer11 = new PublicKey(multisigInfo.signer11);

    return multisigInfo;
  }

  /**
   * Transfer tokens to another account
   *
   * @param source Source account
   * @param destination Destination account
   * @param owner Owner of the source account
   * @param multiSigners Signing accounts if `owner` is a multiSig
   * @param amount Number of tokens to transfer
   */
  async transfer(
    source: PublicKey,
    destination: PublicKey,
    owner: any,
    multiSigners: Array<Account>,
    amount: number | u64,
    //@ts-ignore
  ): Promise<TransactionSignature> {
    let ownerPublicKey;
    let signers;
    if (isAccount(owner)) {
      ownerPublicKey = owner.publicKey;
      signers = [owner];
    } else {
      ownerPublicKey = owner;
      signers = multiSigners;
    }

    let transaction = new Transaction().add(
      Token.createTransferInstruction(
        this.programId,
        source,
        destination,
        ownerPublicKey,
        multiSigners,
        amount,
      ),
    );

    transaction.recentBlockhash = (
      await this.connection.getRecentBlockhash()
    ).blockhash;
    transaction.feePayer = this.payer.publicKey;
    //transaction.setSigners(payer.publicKey, mintAccount.publicKey );
    transaction.partialSign(...signers);

    let signed = await this.payer.signTransaction(transaction);

    //   addLog('Got signature, submitting transaction');
    let signature = await this.connection.sendRawTransaction(signed.serialize());

    await this.connection.confirmTransaction(signature, 'max');


  }

  /**
   * Grant a third-party permission to transfer up the specified number of tokens from an account
   *
   * @param account Public key of the account
   * @param delegate Account authorized to perform a transfer tokens from the source account
   * @param owner Owner of the source account
   * @param multiSigners Signing accounts if `owner` is a multiSig
   * @param amount Maximum number of tokens the delegate may transfer
   */
  async approve(
    account: PublicKey,
    delegate: PublicKey,
    owner: any,
    multiSigners: Array<Account>,
    amount: number | u64,
    connection:any
  ): Promise<void> {
    let ownerPublicKey;
    let signers;
    if (isAccount(owner)) {
      ownerPublicKey = owner.publicKey;
      signers = [owner];
    } else {
      ownerPublicKey = owner;
      signers = multiSigners;
    }
    let transaction = new Transaction().add(
      Token.createApproveInstruction(
        this.programId,
        account,
        delegate,
        ownerPublicKey,
        multiSigners,
        amount,
      ),
    );

    transaction.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;
    transaction.feePayer = owner.publicKey;
    let signed=await owner.signTransaction(transaction);
    console.log("*******signed: "+JSON.stringify(signed))
    let signature = await connection.sendRawTransaction(signed.serialize());

    await connection.confirmTransaction(signature, 'max');
  /*  await sendAndConfirmTransaction(
      'Approve',
      this.connection,
      new Transaction().add(
        Token.createApproveInstruction(
          this.programId,
          account,
          delegate,
          ownerPublicKey,
          multiSigners,
          amount,
        ),
      ),
      this.payer,
      ...signers,
    );*/
  }


  
  /** 
   * return instruction 
   * Grant a third-party permission to transfer up the specified number of tokens from an account
   *
   * @param account Public key of the account
   * @param delegate Account authorized to perform a transfer tokens from the source account
   * @param owner Owner of the source account
   * @param multiSigners Signing accounts if `owner` is a multiSig
   * @param amount Maximum number of tokens the delegate may transfer
   */
   async approveInstruction(
    account: PublicKey,
    delegate: PublicKey,
    owner: any,
    multiSigners: Array<Account>,
    amount: number | u64,
    connection:any
  ): Promise<any> {
    let ownerPublicKey;
    let signers;
    if (isAccount(owner)) {
      ownerPublicKey = owner.publicKey;
      signers = [owner];
    } else {
      ownerPublicKey = owner;
      signers = multiSigners;
    }
    let instruction=Token.createApproveInstruction(
      this.programId,
      account,
      delegate,
      ownerPublicKey,
      multiSigners,
      amount,
    );
   /*  let transaction = new Transaction().add(
      instruction
    );

    transaction.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;
    transaction.feePayer = owner.publicKey;
    let signed=await owner.signTransaction(transaction);
    console.log("*******signed: "+JSON.stringify(signed))
    let signature = await connection.sendRawTransaction(signed.serialize());

    await connection.confirmTransaction(signature, 'max'); */
    return instruction;
  /*  await sendAndConfirmTransaction(
      'Approve',
      this.connection,
      new Transaction().add(
        Token.createApproveInstruction(
          this.programId,
          account,
          delegate,
          ownerPublicKey,
          multiSigners,
          amount,
        ),
      ),
      this.payer,
      ...signers,
    );*/
  }
  /**
   * Remove approval for the transfer of any remaining tokens
   *
   * @param account Public key of the account
   * @param owner Owner of the source account
   * @param multiSigners Signing accounts if `owner` is a multiSig
   */
  async revoke(
    account: PublicKey,
    owner: any,
    multiSigners: Array<Account>,
  ): Promise<void> {
    let ownerPublicKey;
    let signers;
    if (isAccount(owner)) {
      ownerPublicKey = owner.publicKey;
      signers = [owner];
    } else {
      ownerPublicKey = owner;
      signers = multiSigners;
    }
    await sendAndConfirmTransaction(
      'Revoke',
      this.connection,
      new Transaction().add(
        Token.createRevokeInstruction(
          this.programId,
          account,
          ownerPublicKey,
          multiSigners,
        ),
      ),
      this.payer,
      ...signers,
    );
  }

  /**
   * Assign a new authority to the account
   *
   * @param account Public key of the account
   * @param newAuthority New authority of the account
   * @param authorityType Type of authority to set
   * @param currentAuthority Current authority of the account
   * @param multiSigners Signing accounts if `currentAuthority` is a multiSig
   */
  async setAuthority(
    account: PublicKey,
    newAuthority: PublicKey | null,
    authorityType: AuthorityType,
    currentAuthority: any,
    multiSigners: Array<Account>,
  ): Promise<void> {
    let currentAuthorityPublicKey: PublicKey;
    let signers;
    if (isAccount(currentAuthority)) {
      currentAuthorityPublicKey = currentAuthority.publicKey;
      signers = [currentAuthority];
    } else {
      currentAuthorityPublicKey = currentAuthority;
      signers = multiSigners;
    }
    await sendAndConfirmTransaction(
      'SetAuthority',
      this.connection,
      new Transaction().add(
        Token.createSetAuthorityInstruction(
          this.programId,
          account,
          newAuthority,
          authorityType,
          currentAuthorityPublicKey,
          multiSigners,
        ),
      ),
      this.payer,
      ...signers,
    );
  }

  /**
   * Mint new tokens
   *
   * @param dest Public key of the account to mint to
   * @param authority Minting authority
   * @param multiSigners Signing accounts if `authority` is a multiSig
   * @param amount Amount to mint
   */
  async mintTo(
    dest: any,
    authority: any,
    multiSigners: Array<Account>,
    amount: number | u64,
  ): Promise<void> {
    let ownerPublicKey;
    let signers;
    if (isAccount(authority)) {
      ownerPublicKey = authority.publicKey;
      signers = [authority];
    } else {
      ownerPublicKey = authority;
      signers = multiSigners;
    }
    const transaction = new Transaction();
    transaction.add(
      Token.createMintToInstruction(
        this.programId,
        this.publicKey,
        dest,
        ownerPublicKey,
        multiSigners,
        amount,
      ),
    );

    transaction.recentBlockhash = (
      await this.connection.getRecentBlockhash()
    ).blockhash;
    transaction.feePayer = authority.publicKey;
    //transaction.setSigners(payer.publicKey, mintAccount.publicKey );

    let signed = await authority.signTransaction(transaction);

    //   addLog('Got signature, submitting transaction');
    let signature = await this.connection.sendRawTransaction(signed.serialize());

    await this.connection.confirmTransaction(signature, 'max');
  }

  /**
   * Mint new tokens return instraction
   *
   * @param dest Public key of the account to mint to
   * @param authority Minting authority
   * @param multiSigners Signing accounts if `authority` is a multiSig
   * @param amount Amount to mint
   */
   async mintToInstruction(
    dest: any,
    authority: any,
    multiSigners: Array<Account>,
    amount: number | u64,
  ): Promise<any> {
    let ownerPublicKey;
    let signers;
    if (isAccount(authority)) {
      ownerPublicKey = authority.publicKey;
      signers = [authority];
    } else {
      ownerPublicKey = authority;
      signers = multiSigners;
    }
    const transaction = new Transaction();
    let instruction= Token.createMintToInstruction(
      this.programId,
      this.publicKey,
      dest,
      ownerPublicKey,
      multiSigners,
      amount,
    );
    transaction.add(
     instruction
    );

    /* transaction.recentBlockhash = (
      await this.connection.getRecentBlockhash()
    ).blockhash;
    transaction.feePayer = authority.publicKey;
    //transaction.setSigners(payer.publicKey, mintAccount.publicKey );

    let signed = await authority.signTransaction(transaction);

    //   addLog('Got signature, submitting transaction');
    let signature = await this.connection.sendRawTransaction(signed.serialize());

    await this.connection.confirmTransaction(signature, 'max'); */
    return instruction;
  }

   /**
   * Mint new tokens return instruction
   *
   * @param dest Public key of the account to mint to
   * @param authority Minting authority
   * @param multiSigners Signing accounts if `authority` is a multiSig
   * @param amount Amount to mint
   */
    async mintToReturnInstruction(
      dest: any,
      authority: any,
      multiSigners: Array<Account>,
      amount: number | u64,
    ){
      let ownerPublicKey;
      let signers;
      if (isAccount(authority)) {
        ownerPublicKey = authority.publicKey;
        signers = [authority];
      } else {
        ownerPublicKey = authority;
        signers = multiSigners;
      }
      const transaction = new Transaction();
      
      let instruction= Token.createMintToInstruction(
        this.programId,
        this.publicKey,
        dest,
        ownerPublicKey,
        multiSigners,
        amount,
      );
     /*  transaction.add(
       instruction
      );
  
      transaction.recentBlockhash = (
        await this.connection.getRecentBlockhash()
      ).blockhash;
      transaction.feePayer = authority.publicKey;
      //transaction.setSigners(payer.publicKey, mintAccount.publicKey );
  
      let signed = await authority.signTransaction(transaction);
  
      //   addLog('Got signature, submitting transaction');
      let signature = await this.connection.sendRawTransaction(signed.serialize());
  
      await this.connection.confirmTransaction(signature, 'max'); */
      return instruction;
    }
  
  /**
   * Burn tokens
   *
   * @param account Account to burn tokens from
   * @param owner Account owner
   * @param multiSigners Signing accounts if `owner` is a multiSig
   * @param amount Amount to burn
   */
  async burn(
    account: PublicKey,
    owner: any,
    multiSigners: Array<Account>,
    amount: number | u64,
  ): Promise<void> {
    let ownerPublicKey;
    let signers;
    if (isAccount(owner)) {
      ownerPublicKey = owner.publicKey;
      signers = [owner];
    } else {
      ownerPublicKey = owner;
      signers = multiSigners;
    }
    await sendAndConfirmTransaction(
      'Burn',
      this.connection,
      new Transaction().add(
        Token.createBurnInstruction(
          this.programId,
          this.publicKey,
          account,
          ownerPublicKey,
          multiSigners,
          amount,
        ),
      ),
      this.payer,
      ...signers,
    );
  }

  /**
   * Close account
   *
   * @param account Account to close
   * @param dest Account to receive the remaining balance of the closed account
   * @param authority Authority which is allowed to close the account
   * @param multiSigners Signing accounts if `authority` is a multiSig
   */
  async closeAccount(
    account: PublicKey,
    dest: PublicKey,
    authority: any,
    multiSigners: Array<Account>,
  ): Promise<void> {
    let authorityPublicKey;
    let signers;
    if (isAccount(authority)) {
      authorityPublicKey = authority.publicKey;
      signers = [authority];
    } else {
      authorityPublicKey = authority;
      signers = multiSigners;
    }
    await sendAndConfirmTransaction(
      'CloseAccount',
      this.connection,
      new Transaction().add(
        Token.createCloseAccountInstruction(
          this.programId,
          account,
          dest,
          authorityPublicKey,
          multiSigners,
        ),
      ),
      this.payer,
      ...signers,
    );
  }

  /**
   * Freeze account
   *
   * @param account Account to freeze
   * @param authority The mint freeze authority
   * @param multiSigners Signing accounts if `authority` is a multiSig
   */
  async freezeAccount(
    account: PublicKey,
    authority: any,
    multiSigners: Array<Account>,
  ): Promise<void> {
    let authorityPublicKey;
    let signers;
    if (isAccount(authority)) {
      authorityPublicKey = authority.publicKey;
      signers = [authority];
    } else {
      authorityPublicKey = authority;
      signers = multiSigners;
    }
    await sendAndConfirmTransaction(
      'FreezeAccount',
      this.connection,
      new Transaction().add(
        Token.createFreezeAccountInstruction(
          this.programId,
          account,
          this.publicKey,
          authorityPublicKey,
          multiSigners,
        ),
      ),
      this.payer,
      ...signers,
    );
  }

  /**
   * Thaw account
   *
   * @param account Account to thaw
   * @param authority The mint freeze authority
   * @param multiSigners Signing accounts if `authority` is a multiSig
   */
  async thawAccount(
    account: PublicKey,
    authority: any,
    multiSigners: Array<Account>,
  ): Promise<void> {
    let authorityPublicKey;
    let signers;
    if (isAccount(authority)) {
      authorityPublicKey = authority.publicKey;
      signers = [authority];
    } else {
      authorityPublicKey = authority;
      signers = multiSigners;
    }
    await sendAndConfirmTransaction(
      'ThawAccount',
      this.connection,
      new Transaction().add(
        Token.createThawAccountInstruction(
          this.programId,
          account,
          this.publicKey,
          authorityPublicKey,
          multiSigners,
        ),
      ),
      this.payer,
      ...signers,
    );
  }

  /**
   * Transfer tokens to another account, asserting the token mint and decimals
   *
   * @param source Source account
   * @param destination Destination account
   * @param owner Owner of the source account
   * @param multiSigners Signing accounts if `owner` is a multiSig
   * @param amount Number of tokens to transfer
   * @param decimals Number of decimals in transfer amount
   */
  async transferChecked(
    source: PublicKey,
    destination: PublicKey,
    owner: any,
    multiSigners: Array<Account>,
    amount: number | u64,
    decimals: number,
  ): Promise<TransactionSignature> {
    let ownerPublicKey;
    let signers;
    if (isAccount(owner)) {
      ownerPublicKey = owner.publicKey;
      signers = [owner];
    } else {
      ownerPublicKey = owner;
      signers = multiSigners;
    }
    return await sendAndConfirmTransaction(
      'TransferChecked',
      this.connection,
      new Transaction().add(
        Token.createTransferCheckedInstruction(
          this.programId,
          source,
          this.publicKey,
          destination,
          ownerPublicKey,
          multiSigners,
          amount,
          decimals,
        ),
      ),
      this.payer,
      ...signers,
    );
  }

  /**
   * Grant a third-party permission to transfer up the specified number of tokens from an account,
   * asserting the token mint and decimals
   *
   * @param account Public key of the account
   * @param delegate Account authorized to perform a transfer tokens from the source account
   * @param owner Owner of the source account
   * @param multiSigners Signing accounts if `owner` is a multiSig
   * @param amount Maximum number of tokens the delegate may transfer
   * @param decimals Number of decimals in approve amount
   */
  async approveChecked(
    account: PublicKey,
    delegate: PublicKey,
    owner: any,
    multiSigners: Array<Account>,
    amount: number | u64,
    decimals: number,
  ): Promise<void> {
    let ownerPublicKey;
    let signers;
    if (isAccount(owner)) {
      ownerPublicKey = owner.publicKey;
      signers = [owner];
    } else {
      ownerPublicKey = owner;
      signers = multiSigners;
    }
    await sendAndConfirmTransaction(
      'ApproveChecked',
      this.connection,
      new Transaction().add(
        Token.createApproveCheckedInstruction(
          this.programId,
          account,
          this.publicKey,
          delegate,
          ownerPublicKey,
          multiSigners,
          amount,
          decimals,
        ),
      ),
      this.payer,
      ...signers,
    );
  }

  /**
   * Mint new tokens, asserting the token mint and decimals
   *
   * @param dest Public key of the account to mint to
   * @param authority Minting authority
   * @param multiSigners Signing accounts if `authority` is a multiSig
   * @param amount Amount to mint
   * @param decimals Number of decimals in amount to mint
   */
  async mintToChecked(
    dest: PublicKey,
    authority: any,
    multiSigners: Array<Account>,
    amount: number | u64,
    decimals: number,
  ): Promise<void> {
    let ownerPublicKey;
    let signers;
    if (isAccount(authority)) {
      ownerPublicKey = authority.publicKey;
      signers = [authority];
    } else {
      ownerPublicKey = authority;
      signers = multiSigners;
    }
    await sendAndConfirmTransaction(
      'MintToChecked',
      this.connection,
      new Transaction().add(
        Token.createMintToCheckedInstruction(
          this.programId,
          this.publicKey,
          dest,
          ownerPublicKey,
          multiSigners,
          amount,
          decimals,
        ),
      ),
      this.payer,
      ...signers,
    );
  }

  /**
   * Burn tokens, asserting the token mint and decimals
   *
   * @param account Account to burn tokens from
   * @param owner Account owner
   * @param multiSigners Signing accounts if `owner` is a multiSig
   * @param amount Amount to burn
   * @param decimals Number of decimals in amount to burn
   */
  async burnChecked(
    account: PublicKey,
    owner: any,
    multiSigners: Array<Account>,
    amount: number | u64,
    decimals: number,
  ): Promise<void> {
    let ownerPublicKey;
    let signers;
    if (isAccount(owner)) {
      ownerPublicKey = owner.publicKey;
      signers = [owner];
    } else {
      ownerPublicKey = owner;
      signers = multiSigners;
    }
    await sendAndConfirmTransaction(
      'BurnChecked',
      this.connection,
      new Transaction().add(
        Token.createBurnCheckedInstruction(
          this.programId,
          this.publicKey,
          account,
          ownerPublicKey,
          multiSigners,
          amount,
          decimals,
        ),
      ),
      this.payer,
      ...signers,
    );
  }



  /**
   * Construct an InitializeAccount instruction
   *
   * @param programId SPL Token program account
   * @param mint Token mint account
   * @param account New account
   * @param owner Owner of the new account
   */
  static createInitAccountInstruction(
    programId: PublicKey,
    mint: PublicKey,
    account: PublicKey,
    owner: PublicKey,
  ): TransactionInstruction {
    const keys = [
      { pubkey: account, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: owner, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ];
    const dataLayout = BufferLayout.struct([BufferLayout.u8('instruction')]);
    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 1, // InitializeAccount instruction
      },
      data,
    );

    return new TransactionInstruction({
      keys,
      programId,
      data,
    });
  }

  /**
   * Construct a Transfer instruction
   *
   * @param programId SPL Token program account
   * @param source Source account
   * @param destination Destination account
   * @param owner Owner of the source account
   * @param multiSigners Signing accounts if `authority` is a multiSig
   * @param amount Number of tokens to transfer
   */
  static createTransferInstruction(
    programId: PublicKey,
    source: PublicKey,
    destination: PublicKey,
    owner: PublicKey,
    multiSigners: Array<Account>,
    amount: number | u64,
  ): TransactionInstruction {
    const dataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      Layout.uint64('amount'),
    ]);

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 3, // Transfer instruction
        //@ts-ignore
        amount: new u64(amount).toBuffer(),
      },
      data,
    );

    let keys = [
      { pubkey: source, isSigner: false, isWritable: true },
      { pubkey: destination, isSigner: false, isWritable: true },
    ];
    if (multiSigners.length === 0) {
      keys.push({
        pubkey: owner,
        isSigner: true,
        isWritable: false,
      });
    } else {
      keys.push({ pubkey: owner, isSigner: false, isWritable: false });
      multiSigners.forEach(signer =>
        keys.push({
          pubkey: signer.publicKey,
          isSigner: true,
          isWritable: false,
        }),
      );
    }
    return new TransactionInstruction({
      keys,
      programId: programId,
      data,
    });
  }

  /**
   * Construct an Approve instruction
   *
   * @param programId SPL Token program account
   * @param account Public key of the account
   * @param delegate Account authorized to perform a transfer of tokens from the source account
   * @param owner Owner of the source account
   * @param multiSigners Signing accounts if `owner` is a multiSig
   * @param amount Maximum number of tokens the delegate may transfer
   */
  static createApproveInstruction(
    programId: PublicKey,
    account: PublicKey,
    delegate: PublicKey,
    owner: PublicKey,
    multiSigners: Array<Account>,
    amount: number | u64,
  ): TransactionInstruction {
    const dataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      Layout.uint64('amount'),
    ]);

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 4, // Approve instruction
        //@ts-ignore
        amount: new u64(amount).toBuffer(),
      },
      data,
    );

    let keys = [
      { pubkey: account, isSigner: false, isWritable: true },
      { pubkey: delegate, isSigner: false, isWritable: false },
    ];
    if (multiSigners.length === 0) {
      keys.push({ pubkey: owner, isSigner: true, isWritable: false });
    } else {
      keys.push({ pubkey: owner, isSigner: false, isWritable: false });
      multiSigners.forEach(signer =>
        keys.push({
          pubkey: signer.publicKey,
          isSigner: true,
          isWritable: false,
        }),
      );
    }

    return new TransactionInstruction({
      keys,
      programId: programId,
      data,
    });
  }

  /**
   * Construct a Revoke instruction
   *
   * @param programId SPL Token program account
   * @param account Public key of the account
   * @param owner Owner of the source account
   * @param multiSigners Signing accounts if `owner` is a multiSig
   */
  static createRevokeInstruction(
    programId: PublicKey,
    account: PublicKey,
    owner: PublicKey,
    multiSigners: Array<Account>,
  ): TransactionInstruction {
    const dataLayout = BufferLayout.struct([BufferLayout.u8('instruction')]);

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 5, // Approve instruction
      },
      data,
    );

    let keys = [{ pubkey: account, isSigner: false, isWritable: true }];
    if (multiSigners.length === 0) {
      keys.push({ pubkey: owner, isSigner: true, isWritable: false });
    } else {
      keys.push({ pubkey: owner, isSigner: false, isWritable: false });
      multiSigners.forEach(signer =>
        keys.push({
          pubkey: signer.publicKey,
          isSigner: true,
          isWritable: false,
        }),
      );
    }

    return new TransactionInstruction({
      keys,
      programId: programId,
      data,
    });
  }

  /**
   * Construct a SetAuthority instruction
   *
   * @param programId SPL Token program account
   * @param account Public key of the account
   * @param newAuthority New authority of the account
   * @param authorityType Type of authority to set
   * @param currentAuthority Current authority of the specified type
   * @param multiSigners Signing accounts if `currentAuthority` is a multiSig
   */
  static createSetAuthorityInstruction(
    programId: PublicKey,
    account: PublicKey,
    newAuthority: PublicKey | null,
    authorityType: AuthorityType,
    currentAuthority: PublicKey,
    multiSigners: Array<Account>,
  ): TransactionInstruction {
    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.u8('authorityType'),
      BufferLayout.u8('option'),
      Layout.publicKey('newAuthority'),
    ]);

    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: 6, // SetAuthority instruction
          authorityType: AuthorityTypeCodes[authorityType],
          option: newAuthority === null ? 0 : 1,
          newAuthority: pubkeyToBuffer(newAuthority || new PublicKey(0)),
        },
        data,
      );
      data = data.slice(0, encodeLength);
    }

    let keys = [{ pubkey: account, isSigner: false, isWritable: true }];
    if (multiSigners.length === 0) {
      keys.push({ pubkey: currentAuthority, isSigner: true, isWritable: false });
    } else {
      keys.push({ pubkey: currentAuthority, isSigner: false, isWritable: false });
      multiSigners.forEach(signer =>
        keys.push({
          pubkey: signer.publicKey,
          isSigner: true,
          isWritable: false,
        }),
      );
    }

    return new TransactionInstruction({
      keys,
      programId: programId,
      data,
    });
  }

  /**
   * Construct a MintTo instruction
   *
   * @param programId SPL Token program account
   * @param mint Public key of the mint
   * @param dest Public key of the account to mint to
   * @param authority The mint authority
   * @param multiSigners Signing accounts if `authority` is a multiSig
   * @param amount Amount to mint
   */
  static createMintToInstruction(
    programId: PublicKey,
    mint: PublicKey,
    dest: PublicKey,
    authority: PublicKey,
    multiSigners: Array<Account>,
    amount: number | u64,
  ): TransactionInstruction {
    const dataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      Layout.uint64('amount'),
    ]);

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 7, // MintTo instruction
        //@ts-ignore
        amount: new u64(amount).toBuffer(),
      },
      data,
    );

    let keys = [
      { pubkey: mint, isSigner: false, isWritable: true },
      { pubkey: dest, isSigner: false, isWritable: true },
    ];
    if (multiSigners.length === 0) {
      keys.push({
        pubkey: authority,
        isSigner: true,
        isWritable: false,
      });
    } else {
      keys.push({ pubkey: authority, isSigner: false, isWritable: false });
      multiSigners.forEach(signer =>
        keys.push({
          pubkey: signer.publicKey,
          isSigner: true,
          isWritable: false,
        }),
      );
    }

    return new TransactionInstruction({
      keys,
      programId: programId,
      data,
    });
  }

  /**
   * Construct a Burn instruction
   *
   * @param programId SPL Token program account
   * @param mint Mint for the account
   * @param account Account to burn tokens from
   * @param owner Owner of the account
   * @param multiSigners Signing accounts if `authority` is a multiSig
   * @param amount amount to burn
   */
  static createBurnInstruction(
    programId: PublicKey,
    mint: PublicKey,
    account: PublicKey,
    owner: PublicKey,
    multiSigners: Array<Account>,
    amount: number | u64,
  ): TransactionInstruction {
    const dataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      Layout.uint64('amount'),
    ]);

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 8, // Burn instruction
        //@ts-ignore
        amount: new u64(amount).toBuffer(),
      },
      data,
    );

    let keys = [
      { pubkey: account, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: true },
    ];
    if (multiSigners.length === 0) {
      keys.push({
        pubkey: owner,
        isSigner: true,
        isWritable: false,
      });
    } else {
      keys.push({ pubkey: owner, isSigner: false, isWritable: false });
      multiSigners.forEach(signer =>
        keys.push({
          pubkey: signer.publicKey,
          isSigner: true,
          isWritable: false,
        }),
      );
    }

    return new TransactionInstruction({
      keys,
      programId: programId,
      data,
    });
  }

  /**
   * Construct a Close instruction
   *
   * @param programId SPL Token program account
   * @param account Account to close
   * @param dest Account to receive the remaining balance of the closed account
   * @param authority Account Close authority
   * @param multiSigners Signing accounts if `owner` is a multiSig
   */
  static createCloseAccountInstruction(
    programId: PublicKey,
    account: PublicKey,
    dest: PublicKey,
    owner: PublicKey,
    multiSigners: Array<Account>,
  ): TransactionInstruction {
    const dataLayout = BufferLayout.struct([BufferLayout.u8('instruction')]);
    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 9, // CloseAccount instruction
      },
      data,
    );

    let keys = [
      { pubkey: account, isSigner: false, isWritable: true },
      { pubkey: dest, isSigner: false, isWritable: true },
    ];
    if (multiSigners.length === 0) {
      keys.push({ pubkey: owner, isSigner: true, isWritable: false });
    } else {
      keys.push({ pubkey: owner, isSigner: false, isWritable: false });
      multiSigners.forEach(signer =>
        keys.push({
          pubkey: signer.publicKey,
          isSigner: true,
          isWritable: false,
        }),
      );
    }

    return new TransactionInstruction({
      keys,
      programId: programId,
      data,
    });
  }

  /**
   * Construct a Freeze instruction
   *
   * @param programId SPL Token program account
   * @param account Account to freeze
   * @param mint Mint account
   * @param authority Mint freeze authority
   * @param multiSigners Signing accounts if `owner` is a multiSig
   */
  static createFreezeAccountInstruction(
    programId: PublicKey,
    account: PublicKey,
    mint: PublicKey,
    authority: PublicKey,
    multiSigners: Array<Account>,
  ): TransactionInstruction {
    const dataLayout = BufferLayout.struct([BufferLayout.u8('instruction')]);
    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 10, // FreezeAccount instruction
      },
      data,
    );

    let keys = [
      { pubkey: account, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
    ];
    if (multiSigners.length === 0) {
      keys.push({ pubkey: authority, isSigner: true, isWritable: false });
    } else {
      keys.push({ pubkey: authority, isSigner: false, isWritable: false });
      multiSigners.forEach(signer =>
        keys.push({
          pubkey: signer.publicKey,
          isSigner: true,
          isWritable: false,
        }),
      );
    }

    return new TransactionInstruction({
      keys,
      programId: programId,
      data,
    });
  }

  /**
   * Construct a Thaw instruction
   *
   * @param programId SPL Token program account
   * @param account Account to thaw
   * @param mint Mint account
   * @param authority Mint freeze authority
   * @param multiSigners Signing accounts if `owner` is a multiSig
   */
  static createThawAccountInstruction(
    programId: PublicKey,
    account: PublicKey,
    mint: PublicKey,
    authority: PublicKey,
    multiSigners: Array<Account>,
  ): TransactionInstruction {
    const dataLayout = BufferLayout.struct([BufferLayout.u8('instruction')]);
    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 11, // ThawAccount instruction
      },
      data,
    );

    let keys = [
      { pubkey: account, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
    ];
    if (multiSigners.length === 0) {
      keys.push({ pubkey: authority, isSigner: true, isWritable: false });
    } else {
      keys.push({ pubkey: authority, isSigner: false, isWritable: false });
      multiSigners.forEach(signer =>
        keys.push({
          pubkey: signer.publicKey,
          isSigner: true,
          isWritable: false,
        }),
      );
    }

    return new TransactionInstruction({
      keys,
      programId: programId,
      data,
    });
  }

  /**
   * Construct a TransferChecked instruction
   *
   * @param programId SPL Token program account
   * @param source Source account
   * @param mint Mint account
   * @param destination Destination account
   * @param owner Owner of the source account
   * @param multiSigners Signing accounts if `authority` is a multiSig
   * @param amount Number of tokens to transfer
   * @param decimals Number of decimals in transfer amount
   */
  static createTransferCheckedInstruction(
    programId: PublicKey,
    source: PublicKey,
    mint: PublicKey,
    destination: PublicKey,
    owner: PublicKey,
    multiSigners: Array<Account>,
    amount: number | u64,
    decimals: number,
  ): TransactionInstruction {
    const dataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      Layout.uint64('amount'),
      BufferLayout.u8('decimals'),
    ]);

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 12, // TransferChecked instruction
        //@ts-ignore
        amount: new u64(amount).toBuffer(),
        decimals,
      },
      data,
    );

    let keys = [
      { pubkey: source, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: destination, isSigner: false, isWritable: true },
    ];
    if (multiSigners.length === 0) {
      keys.push({
        pubkey: owner,
        isSigner: true,
        isWritable: false,
      });
    } else {
      keys.push({ pubkey: owner, isSigner: false, isWritable: false });
      multiSigners.forEach(signer =>
        keys.push({
          pubkey: signer.publicKey,
          isSigner: true,
          isWritable: false,
        }),
      );
    }
    return new TransactionInstruction({
      keys,
      programId: programId,
      data,
    });
  }

  /**
   * Construct an ApproveChecked instruction
   *
   * @param programId SPL Token program account
   * @param account Public key of the account
   * @param mint Mint account
   * @param delegate Account authorized to perform a transfer of tokens from the source account
   * @param owner Owner of the source account
   * @param multiSigners Signing accounts if `owner` is a multiSig
   * @param amount Maximum number of tokens the delegate may transfer
   * @param decimals Number of decimals in approve amount
   */
  static createApproveCheckedInstruction(
    programId: PublicKey,
    account: PublicKey,
    mint: PublicKey,
    delegate: PublicKey,
    owner: PublicKey,
    multiSigners: Array<Account>,
    amount: number | u64,
    decimals: number,
  ): TransactionInstruction {
    const dataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      Layout.uint64('amount'),
      BufferLayout.u8('decimals'),
    ]);

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 13, // ApproveChecked instruction
        //@ts-ignore
        amount: new u64(amount).toBuffer(),
        decimals,
      },
      data,
    );

    let keys = [
      { pubkey: account, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: delegate, isSigner: false, isWritable: false },
    ];
    if (multiSigners.length === 0) {
      keys.push({ pubkey: owner, isSigner: true, isWritable: false });
    } else {
      keys.push({ pubkey: owner, isSigner: false, isWritable: false });
      multiSigners.forEach(signer =>
        keys.push({
          pubkey: signer.publicKey,
          isSigner: true,
          isWritable: false,
        }),
      );
    }

    return new TransactionInstruction({
      keys,
      programId: programId,
      data,
    });
  }

  /**
   * Construct a MintToChecked instruction
   *
   * @param programId SPL Token program account
   * @param mint Public key of the mint
   * @param dest Public key of the account to mint to
   * @param authority The mint authority
   * @param multiSigners Signing accounts if `authority` is a multiSig
   * @param amount Amount to mint
   * @param decimals Number of decimals in amount to mint
   */
  static createMintToCheckedInstruction(
    programId: PublicKey,
    mint: PublicKey,
    dest: PublicKey,
    authority: PublicKey,
    multiSigners: Array<Account>,
    amount: number | u64,
    decimals: number,
  ): TransactionInstruction {
    const dataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      Layout.uint64('amount'),
      BufferLayout.u8('decimals'),
    ]);

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 14, // MintToChecked instruction
        //@ts-ignore
        amount: new u64(amount).toBuffer(),
        decimals,
      },
      data,
    );

    let keys = [
      { pubkey: mint, isSigner: false, isWritable: true },
      { pubkey: dest, isSigner: false, isWritable: true },
    ];
    if (multiSigners.length === 0) {
      keys.push({
        pubkey: authority,
        isSigner: true,
        isWritable: false,
      });
    } else {
      keys.push({ pubkey: authority, isSigner: false, isWritable: false });
      multiSigners.forEach(signer =>
        keys.push({
          pubkey: signer.publicKey,
          isSigner: true,
          isWritable: false,
        }),
      );
    }

    return new TransactionInstruction({
      keys,
      programId: programId,
      data,
    });
  }

  /**
   * Construct a BurnChecked instruction
   *
   * @param programId SPL Token program account
   * @param mint Mint for the account
   * @param account Account to burn tokens from
   * @param owner Owner of the account
   * @param multiSigners Signing accounts if `authority` is a multiSig
   * @param amount amount to burn
   */
  static createBurnCheckedInstruction(
    programId: PublicKey,
    mint: PublicKey,
    account: PublicKey,
    owner: PublicKey,
    multiSigners: Array<Account>,
    amount: number | u64,
    decimals: number,
  ): TransactionInstruction {
    const dataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      Layout.uint64('amount'),
      BufferLayout.u8('decimals'),
    ]);

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 15, // BurnChecked instruction
        //@ts-ignore
        amount: new u64(amount).toBuffer(),
        decimals,
      },
      data,
    );

    let keys = [
      { pubkey: account, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: true },
    ];
    if (multiSigners.length === 0) {
      keys.push({
        pubkey: owner,
        isSigner: true,
        isWritable: false,
      });
    } else {
      keys.push({ pubkey: owner, isSigner: false, isWritable: false });
      multiSigners.forEach(signer =>
        keys.push({
          pubkey: signer.publicKey,
          isSigner: true,
          isWritable: false,
        }),
      );
    }

    return new TransactionInstruction({
      keys,
      programId: programId,
      data,
    });
  }

  /**
   * Get the address for the associated token account
   *
   * @param associatedProgramId SPL Associated Token program account
   * @param programId SPL Token program account
   * @param mint Token mint account
   * @param owner Owner of the new account
   * @return Public key of the associated token account
   */
  static async getAssociatedTokenAddress(
    associatedProgramId: PublicKey,
    programId: PublicKey,
    mint: PublicKey,
    owner: PublicKey,
  ): Promise<PublicKey> {
    return (
      await PublicKey.findProgramAddress(
        [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
        associatedProgramId,
      )
    )[0];
  }

  /**
   * Construct the AssociatedTokenProgram instruction to create the associated
   * token account
   *
   * @param associatedProgramId SPL Associated Token program account
   * @param programId SPL Token program account
   * @param mint Token mint account
   * @param associatedAccount New associated account
   * @param owner Owner of the new account
   * @param payer Payer of fees
   */
  static createAssociatedTokenAccountInstruction(
    associatedProgramId: PublicKey,
    programId: PublicKey,
    mint: PublicKey,
    associatedAccount: PublicKey,
    owner: PublicKey,
    payer: PublicKey,
  ): TransactionInstruction {
    const data = Buffer.alloc(0);

    let keys = [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: associatedAccount, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: false, isWritable: false },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ];

    return new TransactionInstruction({
      keys,
      programId: associatedProgramId,
      data,
    });
  }






  /**
   * WithDraw tokens
   *
   * @param account Account to WithDraw tokens from
   * @param owner Account owner
   * @param multiSigners Signing accounts if `owner` is a multiSig
   * @param amount Amount to createWithDraw
   */


  async createWithDraw(
    connection: Connection,
    account: PublicKey,
    amount: number | u64,
    payer: Account,
  ): Promise<void> {

    // Allocate memory for the account
    const balanceNeeded = await Token.getMinBalanceRentForExemptMint(
      connection,
    );


    const transaction = new Transaction();

    transaction.add(
      Token.createWithdrawInstruction(
        this.programId,
        account,
        payer,
        amount
      ),
    );

    transaction.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;
    transaction.feePayer = payer.publicKey;
    //transaction.setSigners(payer.publicKey, mintAccount.publicKey );

    //@ts-ignore
    let signed = await payer.signTransaction(transaction);

    //   addLog('Got signature, submitting transaction');
    let signature = await connection.sendRawTransaction(signed.serialize());

    await connection.confirmTransaction(signature, 'max');

  }

  /**
    * Construct a  Withdraw instruction
    *
    * @param programId SPL Token program account
    * @param account Account
    * @param payer Owner of the source account
    * @param amount Number of tokens to transfer
    */

  static createWithdrawInstruction(
    //@ts-ignore
    programId,
    //@ts-ignore
    account,
    //@ts-ignore
    payer,
    //@ts-ignore
    amount,
  ): TransactionInstruction {
    const dataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      Layout.uint64('amount'),
    ]);

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 18, // deposit instruction
        amount: new u64(amount).toBuffer(),
      },
      data,
    );

    const keys = [
      { pubkey: account, isSigner: false, isWritable: true },
      { pubkey: payer.publicKey, isSigner: true, isWritable: false },
    ];

    return new TransactionInstruction({
      keys,
      programId: programId,
      data,
    });
  }




  /**
     * Construct an InitializeMint instruction
     *
     * @param programId SPL Token program account
     * @param mint Token mint account
     * @param decimals Number of decimals in token account amounts
     * @param mintAuthority Minting authority
     * @param freezeAuthority Optional authority that can freeze token accounts
     */
  static createInitMintInstruction(
    programId: PublicKey,
    mint: PublicKey,
    decimals: number,
    mintAuthority: PublicKey,
    freezeAuthority: PublicKey | null,
    programIdAsset: PublicKey | null,
    programIdSwap: PublicKey | null,

  ): TransactionInstruction {


    let keys = [
      { pubkey: mint, isSigner: false, isWritable: true },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      { pubkey: programIdAsset, isSigner: false, isWritable: false },
    ];
    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.u8('decimals'),
      Layout.publicKey('mintAuthority'),
      BufferLayout.u8('option'),
      Layout.publicKey('freezeAuthority'),

    ]);
    let data = Buffer.alloc(2048);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: 0, // InitializeMint instruction
          decimals,
          mintAuthority: pubkeyToBuffer(mintAuthority),
          option: freezeAuthority === null ? 0 : 1,
          freezeAuthority: pubkeyToBuffer(freezeAuthority || new PublicKey(0)),

        },
        data,
      );
      data = data.slice(0, encodeLength);
      console.log("###### sending data : " + encodeLength)
    }

    return new TransactionInstruction({
      //@ts-ignore
      keys,
      programId,
      data,
    });
  }

  /************** */
  createDepositInstruction(
    programId: any,
    account: any,
    payer: any,
    amount: any,
    volatility: any,
    // programAddress: any
  ): TransactionInstruction {
    const dataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      Layout.uint64('amount'),
      Layout.uint64('volatility'),
    ]);

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 17, // deposit instruction
        amount: new u64(amount).toBuffer(),
        volatility: new u64(volatility).toBuffer(),
      },
      data,
    );
    const keys = [
      { pubkey: account, isSigner: false, isWritable: true },
      { pubkey: payer, isSigner: false, isWritable: false },
    ];
    return new TransactionInstruction({
      keys,
      programId: programId,
      data,
    });
  }


  /******************** createDeposit****/
  async createDeposit(
    connection: Connection,
    account: PublicKey,
    amount: number | u64,
    payer: Account,
    volatility: any,
    mintAddress: any
  ) {
    console.log("createDeposit")

    const transaction = new Transaction();
    let testToken = new Token(
      connection,
      new PublicKey(mintAddress),
      new PublicKey(ORIGINE_PROGRAMM_ID),
      payer
    );
    // let programAddress = await PublicKey.createProgramAddress(
    //   [Buffer.from("Albert Einstein"), Buffer.from("Silvester Stalone")],
    //   new PublicKey(ADAPTABALE_PROGRAMM_ID)
    // );
    transaction.add(
      testToken.createDepositInstruction(
        new PublicKey(ORIGINE_PROGRAMM_ID),
        account,
        payer.publicKey,
        amount,
        volatility,
        // programAddress
      ),
    );

    transaction.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;
    //@ts-ignore
    transaction.feePayer = payer.publicKey;
    //@ts-ignore
    let signed = await payer.signTransaction(transaction);
    let signature = await connection.sendRawTransaction(signed.serialize());
    console.log("signature: " + signature)
    let res = await connection.confirmTransaction(signature, 'max');
    console.log("res: " + JSON.stringify(res))
  }







  /******create token swap */
  async createTokenSwap(connection: any, selectedWallet: any): Promise<void> {

    // Hard-coded fee address, for testing production mode
    const TOKEN_SWAP_PROGRAM_ID: PublicKey = new PublicKey(
      'SwaPpA9LAaLfeLi3a68M4DjnLqgtticKg6CnyNwgAC8',
    );
    const SWAP_PROGRAM_OWNER_FEE_ADDRESS =
      process.env.SWAP_PROGRAM_OWNER_FEE_ADDRESS;

    // Pool fees
    const TRADING_FEE_NUMERATOR = 25;
    const TRADING_FEE_DENOMINATOR = 10000;
    const OWNER_TRADING_FEE_NUMERATOR = 5;
    const OWNER_TRADING_FEE_DENOMINATOR = 10000;
    const OWNER_WITHDRAW_FEE_NUMERATOR = SWAP_PROGRAM_OWNER_FEE_ADDRESS ? 0 : 1;
    const OWNER_WITHDRAW_FEE_DENOMINATOR = SWAP_PROGRAM_OWNER_FEE_ADDRESS ? 0 : 6;
    const HOST_FEE_NUMERATOR = 20;
    const HOST_FEE_DENOMINATOR = 100;

    // curve type used to calculate swaps and deposits
    const CURVE_TYPE = CurveType.ConstantProduct;
    const payer = selectedWallet;
    console.log("payer publicKey -- " + payer.publicKey + " --")
    const owner = new Account([222, 81, 173, 154, 237, 211, 245, 63, 46, 254, 242, 23, 39, 249, 201, 213, 131, 98, 69, 80, 203, 91, 157, 182, 31, 239, 177, 97, 254, 192, 76, 114, 58, 163, 72, 217, 86, 52, 243, 133, 238, 130, 77, 241, 86, 129, 7, 222, 123, 233, 30, 192, 77, 114, 249, 18, 59, 84, 145, 87, 39, 41, 190, 35]);
    console.log("owner publicKey -- " + owner.publicKey + " --")
  //  const tokenSwapAccount = new Account([213, 92, 95, 30, 183, 94, 255, 53, 238, 181, 251, 106, 217, 117, 87, 161, 161, 47, 143, 10, 123, 223, 81, 123, 125, 80, 76, 110, 25, 245, 175, 147, 136, 172, 139, 177, 103, 223, 45, 173, 84, 25, 118, 238, 129, 77, 48, 49, 2, 224, 217, 128, 49, 19, 72, 244, 29, 112, 18, 184, 187, 37, 199, 42]);
    const tokenSwapAccount = new Account(); 
    let infoToken;
    /* [authority, nonce] = await PublicKey.findProgramAddress(
       [tokenSwapAccount.publicKey.toBuffer()],
       TOKEN_SWAP_PROGRAM_ID,
     ); */
    console.log([tokenSwapAccount.publicKey.toBase58()])
    let authority = new PublicKey("9Wcsb1nnvFDHbxm8d66uK5TFvVXuthioygho1PuQVCVG");
    let nonce = 253;
    console.log("authority :- " + authority + " - nonce :- " + nonce + " -")

    console.log('creating pool mint');
    /*tokenPool = await Token.createMint(
        connection,
        payer,
        authority,
        null,
        2,
        TOKEN_PROGRAM_ID,
      );  
       */
    const tokenPool = new Token(
      connection,
      new PublicKey("FdhdPJrHH18QK3mG7UVtZkXq25S4LeKXLoQybMJ5HYEk"),
      TOKEN_PROGRAM_ID,
      payer
    )

    console.log("tokenPool Address - " + tokenPool.publicKey + " -")
    console.log('creating pool account');
    // tokenAccountPool = await tokenPool.createAccount(owner.publicKey);
    const tokenAccountPool = new PublicKey("98UipRj47BpLzxQMfsqaovoit2jKCKJvhCxrnRRGH6rt")
    console.log("tokenAccountPool - " + tokenAccountPool)
    console.log("info Account Pool before swap ")
    // infoToken = await tokenPool.getAccountInfo(tokenAccountPool);
    // console.log("mint - " + infoToken.mint + " - owner - " + infoToken.owner + " - amount - " + infoToken.amount)
    // Hard-coded fee address, for testing production mode
    const ownerKey = SWAP_PROGRAM_OWNER_FEE_ADDRESS || owner.publicKey.toString();
    //feeAccount = await tokenPool.createAccount(new PublicKey(ownerKey));
    const feeAccount = new PublicKey("9CwSqPJtvyoUBH3vx2eNSQezdySCEYsvvrzbwQyD1s7D")
    console.log("ownerkey - " + ownerKey + " -")
    console.log("feeAccount - " + feeAccount + " -");

    console.log('creating token A');
    /*  mintA = await Token.createMint(
       connection,
       payer,
       owner.publicKey,
       null,
       2,
       TOKEN_PROGRAM_ID,
     );  */
    let mintA = new Token(
      connection,
      new PublicKey("8A1o5SLfS3cDNqjQ1bkxzRFXq16A9MPwdixLX3cVaRMx"),
      new PublicKey(ORIGINE_PROGRAMM_ID),
      selectedWallet
    )
    console.log("Address mintA - " + mintA.publicKey + " -")
    console.log('creating token A account');
    //tokenAccountA = await mintA.createAccount(authority);
    let tokenAccountA = new PublicKey("8hHhFH6gzWJCfu5UA1zBNrrTdWwpBRLqtfU4DXxXjYQ4");
    console.log("tokenAccountA - " + tokenAccountA + " - authoruty - " + authority)
    console.log('minting token A to swap');
    let currentSwapTokenA = 1000;

    // await mintA.mintTo(tokenAccountA, owner, [], currentSwapTokenA);
    await mintA.mintTo(tokenAccountA, selectedWallet, [], 1000);
    //infoToken = await mintA.getAccountInfo(tokenAccountA,"finalized")
    console.log("info Account Token A before swap ")
    //console.log("mint token A - " + infoToken.mint + " - owner Token A- " + infoToken.owner + " - amount token A - " + infoToken.amount)

    console.log('creating token B');
    /* mintB = await Token.createMint(
       connection,
       payer,
       owner.publicKey,
       null,
       2,
       TOKEN_PROGRAM_ID,
     );   */
    let mintB = new Token(
      connection,
      new PublicKey("3hCRvKLoVRVrCCcMinsvtAkV8Dvb8J6BiiwFB35zWKta"),
      new PublicKey(ORIGINE_PROGRAMM_ID),
      selectedWallet
    )
    console.log("Address mintB - " + mintB.publicKey + " -")
    console.log('creating token B account');
    //tokenAccountB = await mintB.createAccount(authority);

    let tokenAccountB = new PublicKey("ESfV9JN3CEz5MMPeeGxm2XoStNWJH9H7mj1SBGfBxeFG")
    console.log("tokenAccountB - " + tokenAccountB + " - authoruty - " + authority)
    console.log('minting token B to swap');
    let currentSwapTokenB = 1000;
    // await mintB.mintTo(tokenAccountB, owner, [], currentSwapTokenB);
    //infoToken = await mintB.getAccountInfo(tokenAccountB)
    console.log("info Account Token B before swap ");
    // console.log("mint token b - " + infoToken.mint + " - owner Token b- " + infoToken.owner + " - amount token b - " + infoToken.amount)

    console.log('creating token swap');
    const swapPayer = new Account([126, 33, 60, 171, 190, 57, 96, 98, 207, 11, 22, 149, 251, 129, 175, 119, 98, 182, 200, 0, 239, 229, 90, 31, 70, 60, 71, 131, 211, 36, 225, 44, 6, 171, 60, 193, 112, 106, 41, 243, 217, 179, 82, 171, 226, 149, 26, 52, 12, 255, 115, 85, 20, 241, 202, 76, 96, 242, 68, 102, 25, 234, 108, 199]);

    console.log("publickey SwapPayer - " + swapPayer.publicKey)
    let tokenSwap1 = await TokenSwap.createTokenSwap(
      connection,
      selectedWallet,
      tokenSwapAccount,
      authority,
      tokenAccountA,
      tokenAccountB,
      tokenPool.publicKey,
      mintA.publicKey,
      mintB.publicKey,
      feeAccount,
      tokenAccountPool,
      TOKEN_SWAP_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      nonce,

      TRADING_FEE_NUMERATOR,
      TRADING_FEE_DENOMINATOR,
      OWNER_TRADING_FEE_NUMERATOR,
      OWNER_TRADING_FEE_DENOMINATOR,
      OWNER_WITHDRAW_FEE_NUMERATOR,
      OWNER_WITHDRAW_FEE_DENOMINATOR,
      HOST_FEE_NUMERATOR,
      HOST_FEE_DENOMINATOR,
      CURVE_TYPE,
    );
    //@ts-ignore
    console.log("token swap publickey - " + tokenSwap1.tokenSwap)

    // Pool fees
    // const TRADING_FEE_NUMERATOR: any = 25;
    // const TRADING_FEE_DENOMINATOR: any = 10000;
    // const OWNER_TRADING_FEE_NUMERATOR: any = 5;
    // const OWNER_TRADING_FEE_DENOMINATOR: any = 10000;
    // const OWNER_WITHDRAW_FEE_NUMERATOR: any = SWAP_PROGRAM_OWNER_FEE_ADDRESS ? 0 : 1;
    // const OWNER_WITHDRAW_FEE_DENOMINATOR: any = SWAP_PROGRAM_OWNER_FEE_ADDRESS ? 0 : 6;
    // const HOST_FEE_NUMERATOR: any = 20;
    // const HOST_FEE_DENOMINATOR: any = 100;
    // const CURVE_TYPE = CurveType.ConstantProduct;
    // let TOKEN_SWAP_PROGRAM_ID = new PublicKey('SwaPpA9LAaLfeLi3a68M4DjnLqgtticKg6CnyNwgAC8')
    // let tokenSwap = new TokenSwap(
    //   connection,
    //   new PublicKey("ACX3jfdGN598DPRHQfcpC57ECAf22uhmAh3uCRaLWciV"),
    //   TOKEN_SWAP_PROGRAM_ID,
    //   TOKEN_PROGRAM_ID,
    //   tokenPool.publicKey,
    //   feeAccount,
    //   authority,
    //   tokenAccountA,
    //   tokenAccountB,
    //   mintA.publicKey,
    //   mintB.publicKey,
    //   TRADING_FEE_NUMERATOR,
    //   TRADING_FEE_DENOMINATOR,
    //   OWNER_TRADING_FEE_NUMERATOR,
    //   OWNER_TRADING_FEE_DENOMINATOR,
    //   OWNER_WITHDRAW_FEE_NUMERATOR,
    //   OWNER_WITHDRAW_FEE_DENOMINATOR,
    //   HOST_FEE_NUMERATOR,
    //   HOST_FEE_DENOMINATOR,
    //   CURVE_TYPE,
    //   payer
    // )

    // console.log('loading token swap');
    // const fetchedTokenSwap = await TokenSwap.loadTokenSwap(
    //   connection,
    //   tokenSwapAccount.publicKey,
    //   TOKEN_SWAP_PROGRAM_ID,
    //   swapPayer,
    // );
    // console.log("mint token swap -" + fetchedTokenSwap.tokenSwap + " -owner - " + tokenSwap.authority)
    // /*
    /* assert(fetchedTokenSwap.tokenProgramId.equals(TOKEN_PROGRAM_ID));
     assert(fetchedTokenSwap.tokenAccountA.equals(tokenAccountA));
     assert(fetchedTokenSwap.tokenAccountB.equals(tokenAccountB));
     assert(fetchedTokenSwap.mintA.equals(mintA.publicKey));
     assert(fetchedTokenSwap.mintB.equals(mintB.publicKey));
     assert(fetchedTokenSwap.poolToken.equals(tokenPool.publicKey));
     assert(fetchedTokenSwap.feeAccount.equals(feeAccount));
     assert(
       TRADING_FEE_NUMERATOR == fetchedTokenSwap.tradeFeeNumerator.toNumber(),
     );
     assert(
       TRADING_FEE_DENOMINATOR == fetchedTokenSwap.tradeFeeDenominator.toNumber(),
     );
     assert(
       OWNER_TRADING_FEE_NUMERATOR ==
         fetchedTokenSwap.ownerTradeFeeNumerator.toNumber(),
     );
     assert(
       OWNER_TRADING_FEE_DENOMINATOR ==
         fetchedTokenSwap.ownerTradeFeeDenominator.toNumber(),
     );
     assert(
       OWNER_WITHDRAW_FEE_NUMERATOR ==
         fetchedTokenSwap.ownerWithdrawFeeNumerator.toNumber(),
     );
     assert(
       OWNER_WITHDRAW_FEE_DENOMINATOR ==
         fetchedTokenSwap.ownerWithdrawFeeDenominator.toNumber(),
     );
     assert(HOST_FEE_NUMERATOR == fetchedTokenSwap.hostFeeNumerator.toNumber());
     assert(
       HOST_FEE_DENOMINATOR == fetchedTokenSwap.hostFeeDenominator.toNumber(),
     );
     assert(CURVE_TYPE == fetchedTokenSwap.curveType);*/
  }


}
