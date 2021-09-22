/**
 * @flow
 */

import { Buffer } from 'buffer';
import assert from 'assert';
import BN from 'bn.js';
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
} from '@solana/web3.js';

import * as Layout from './layout';

export const TOKEN_PROGRAM_ID: PublicKey = new PublicKey(
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);
export const ASSOCIATED_TOKEN_PROGRAM_ID: PublicKey = new PublicKey(
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);
const FAILED_TO_FIND_ACCOUNT = 'Failed to find account';
const INVALID_ACCOUNT_OWNER = 'Invalid account owner';
export class u64 extends BN {
    /**
     * Convert to Buffer representation
     */
    toBuffer(): typeof Buffer {
        const a = super.toArray().reverse();
        const b = Buffer.from(a);
        if (b.length === 8) {
            return b;
        }
        assert(b.length < 8, 'u64 too large');

        const zeroPad = Buffer.alloc(8);
        b.copy(zeroPad);
        return zeroPad;
    }

    /**
     * Construct a u64 from Buffer representation
     */
    static fromBuffer(buffer: typeof Buffer): u64 {
        assert(buffer.length === 8, `Invalid buffer length: ${buffer.length}`);
        return new u64(
            [...buffer]
                .reverse()
                .map(i => `00${i.toString(16)}`.slice(-2))
                .join(''),
            16,
        );
    }
}

// The address of the special mint for wrapped native token.
export const NATIVE_MINT: PublicKey = new PublicKey(
    'So11111111111111111111111111111111111111112',
);

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

    /**
     * Amount usdc of tokens this account holds
     */
    usdc: u64,

    /**
     * Amount asset of tokens this account holds
     */
    asset: u64,


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
        Layout.publicKey('delegate'), // 36
        BufferLayout.u8('state'), // 1
        BufferLayout.u32('isNativeOption'),
        Layout.uint64('isNative'), //12
        Layout.uint64('delegatedAmount'), // 8
        BufferLayout.u32('closeAuthorityOption'),
        Layout.publicKey('closeAuthority'), //36
        Layout.uint64('usdc'), // 8
        Layout.uint64('asset'), // 8
    ],
);

/**
 * @private
 */
export const AccountLayoutNew: typeof BufferLayout.Structure = BufferLayout.struct(
    [
        Layout.publicKey('mint'), //  32
        Layout.publicKey('owner'), //32
        Layout.uint64('amount'), // 8
        BufferLayout.u32('delegateOption'),
        Layout.publicKey('delegate'), // 36
        BufferLayout.u8('state'), // 1
        BufferLayout.u32('isNativeOption'),
        Layout.uint64('isNative'), //12
        Layout.uint64('delegatedAmount'), // 8
        BufferLayout.u32('closeAuthorityOption'),
        Layout.publicKey('closeAuthority'), //36

    ],
);

/**
 * Information about an account
 */
type PortfolioInfo = {

    /**
     * The address of this account
     */
    portfolioAddress: PublicKey,
    /**
   * the address of the creator
   */
    creatorPortfolio: publicKey,
    /**
     * Owner of this account
     */
    owner: PublicKey,

    /**
  * metadata url
  */
    metadataUrl: BufferLayout.blob,

    /**
     * metadata hash
     */
    metadataHash: u32,

    /**
     * initialized account 
     */
    is_initialize: null | u64,
    /**
     * The amount of first asset
     */
    amountAsset1: null | u8,
    /**
     * The address of first asset
     */
    addressAsset1: null | PublicKey,
    /**
     * The period of first asset
     */
    periodAsset1: null | u8,
    /**
     * The asset solde of first asset
     */
    assetToSoldIntoAsset1: null | PublicKey,
    /**
     * The amount of asset
     */
    amountAsset2: null | u8,
    /**
     * The address of  asset
     */
    addressAsset2: null | PublicKey,
    /**
     * The period of  asset
     */
    periodAsset2: null | u8,
    /**
     * The asset solde of asset
     */
    assetToSoldIntoAsset2: null | PublicKey,

    /**
     * The amount of asset
     */
    amountAsset3: null | u8,
    /**
     * The address of  asset
     */
    addressAsset3: null | PublicKey,
    /**
     * The period of  asset
     */
    periodAsset3: null | u8,
    /**
     * The asset solde of asset
     */
    assetToSoldIntoAsset3: null | PublicKey,
    /**
     * The amount of asset
     */
    amountAsset4: null | u8,
    /**
     * The address of  asset
     */
    addressAsset4: null | PublicKey,
    /**
     * The period of  asset
     */
    periodAsset4: null | u8,
    /**
     * The asset solde of asset
     */
    assetToSoldIntoAsset4: null | PublicKey,
    /**
     * The amount of asset
     */
    amountAsset5: null | u8,
    /**
     * The address of  asset
     */
    addressAsset5: null | PublicKey,
    /**
     * The period of  asset
     */
    periodAsset5: null | u8,
    /**
     * The asset solde of asset
     */
    assetToSoldIntoAsset5: null | PublicKey,

    /**
     * The amount of first asset
     */
    amountAsset6: null | u8,
    /**
     * The address of first asset
     */
    addressAsset6: null | PublicKey,
    /**
     * The period of first asset
     */
    periodAsset6: null | u8,
    /**
     * The asset solde of first asset
     */
    assetToSoldIntoAsset6: null | PublicKey,
    /**
     * The amount of asset
     */
    amountAsset7: null | u8,
    /**
     * The address of  asset
     */
    addressAsset7: null | PublicKey,
    /**
     * The period of  asset
     */
    periodAsset7: null | u8,
    /**
     * The asset solde of asset
     */
    assetToSoldIntoAsset7: null | PublicKey,

    /**
     * The amount of asset
     */
    amountAsset8: null | u8,
    /**
     * The address of  asset
     */
    addressAsset8: null | PublicKey,
    /**
     * The period of  asset
     */
    periodAsset8: null | u8,
    /**
     * The asset solde of asset
     */
    assetToSoldIntoAsset8: null | PublicKey,
    /**
     * The amount of asset
     */
    amountAsset9: null | u8,
    /**
     * The address of  asset
     */
    addressAsset9: null | PublicKey,
    /**
     * The period of  asset
     */
    periodAsset9: null | u8,
    /**
     * The asset solde of asset
     */
    assetToSoldIntoAsset9: null | PublicKey,
    /**
     * The amount of asset
 //   amountAsset10: null | u64,
    /**
     * The address of  asset
     */
    // addressAsset10: null | PublicKey,
    /**
     * The period of  asset
     */
    //  periodAsset10: null | u64,
    /**
     * The asset solde of asset
     */
    // assetToSoldIntoAsset10: null | PublicKey
};

/**
 * @private
 */
export const PortfolioLayout: typeof BufferLayout.Structure = BufferLayout.struct(
    [

        Layout.publicKey('portfolioAddress'), //32
        Layout.publicKey('creatorPortfolio'), //32
        BufferLayout.blob(128, 'metadataUrl'), //128
        BufferLayout.u16('metadataHash'), //16
        BufferLayout.u8('is_initialize'), //8

        BufferLayout.u8('amountAsset1'), //8
        Layout.publicKey('addressAsset1'), //32
        BufferLayout.u8('periodAsset1'), //8
        Layout.publicKey('assetToSoldIntoAsset1'), //32


        BufferLayout.u8('amountAsset2'), //1
        Layout.publicKey('addressAsset2'), //32
        BufferLayout.u8('periodAsset2'), //8
        Layout.publicKey('assetToSoldIntoAsset2'), //32

        BufferLayout.u8('amountAsset3'), //1
        Layout.publicKey('addressAsset3'), //32
        BufferLayout.u8('periodAsset3'), //8
        Layout.publicKey('assetToSoldIntoAsset3'), //32

        BufferLayout.u8('amountAsset4'), //1
        Layout.publicKey('addressAsset4'), //32
        BufferLayout.u8('periodAsset4'), //8
        Layout.publicKey('assetToSoldIntoAsset4'), //32

        BufferLayout.u8('amountAsset5'), //1
        Layout.publicKey('addressAsset5'), //32
        BufferLayout.u8('periodAsset5'), //8
        Layout.publicKey('assetToSoldIntoAsset5'), //32

        BufferLayout.u8('amountAsset6'), //1
        Layout.publicKey('addressAsset6'), //32
        BufferLayout.u8('periodAsset6'), //1
        Layout.publicKey('assetToSoldIntoAsset6'), //32

        BufferLayout.u8('amountAsset7'), //1
        Layout.publicKey('addressAsset7'), //32
        BufferLayout.u8('periodAsset7'), //1
        Layout.publicKey('assetToSoldIntoAsset7'), //32

        BufferLayout.u8('amountAsset8'), //1
        Layout.publicKey('addressAsset8'), //32
        BufferLayout.u8('periodAsset8'), //1
        Layout.publicKey('assetToSoldIntoAsset8'), //32

        BufferLayout.u8('amountAsset9'), //1
        Layout.publicKey('addressAsset9'), //32
        BufferLayout.u8('periodAsset9'), //1
        Layout.publicKey('assetToSoldIntoAsset9'), //32

        /*  Layout.u8('amountAsset10'), //1
          Layout.publicKey('addressAsset10'), //32
          Layout.u32('periodAsset10'), //1
          Layout.publicKey('assetToSoldIntoAsset10'), //32*/
    ],
);

/**
 * Information about an user portfolio
 */
type UserPortfolioInfo = {
    /**
     * The address of this account
     */
    user_portfolio_address: PublicKey,
    /**
     * Owner of this account
     */
    owner: PublicKey,

    /**
     * Owner of this account
     */
    portfolio_address: PublicKey,

    /**
    * The delegate for this account
     */
    delegate: null | PublicKey,

    /**
    * The amount of tokens the delegate authorized to the delegate
    */
    delegatedAmount: u64,
    /**
     * publickey of this assets
     */
    splu_asset1: null | PublicKey,
    /**
     * publickey of this assets
     */
    splu_asset2: null | PublicKey,
    /**
     * publickey of this assets
     */
    splu_asset3: null | PublicKey,
    /**
     * publickey of this assets
     */
    splu_asset4: null | PublicKey,
    /**
     * publickey of this assets
     */
    splu_asset5: null | PublicKey,
    /**
     * publickey of this assets
     */
    splu_asset6: null | PublicKey,
    /**
     * publickey of this assets
     */
    splu_asset7: null | PublicKey,
    /**
     * publickey of this assets
     */
    splu_asset8: null | PublicKey,
    /**
     * publickey of this assets
     */
    splu_asset9: null | PublicKey,
}
/**
 * @private
 */
export const UserPortfolioLayout: typeof BufferLayout.Structure = BufferLayout.struct(
    [
        Layout.publicKey('user_portfolio_address'), //32
        Layout.publicKey('owner'), //32
        Layout.publicKey('portfolio_address'), //32
        Layout.publicKey('delegate'), // 36
        Layout.uint64('delegatedAmount'), //5
        Layout.publicKey('splu_asset1'), //32
        Layout.publicKey('splu_asset2'), //32
        Layout.publicKey('splu_asset3'), //32
        Layout.publicKey('splu_asset4'), //32
        Layout.publicKey('splu_asset5'), //32
        Layout.publicKey('splu_asset6'), //32
        Layout.publicKey('splu_asset7'), //32
        Layout.publicKey('splu_asset8'), //32
        Layout.publicKey('splu_asset9'), //32


    ],
);

export class Portfolio {
    /**
     * @private
     */
    connection: Connection;

    /**
     * The public key identifying this mint
     */
    publicKey: PublicKey;

    /**
     * Program Identifier for the Portfolio program
     */
    programId: PublicKey;

    /**
     * Program Identifier for the Associated Portfolio program
     */
    associatedProgramId: PublicKey;

    /**
     * Fee payer
     */
    payer: Account;

    accountTest: Account;


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


    static async getMinBalanceRentForExemptAccount(
        connection: Connection,
    ): Promise<number> {
        return await connection.getMinimumBalanceForRentExemption(
            AccountLayout.span,
        );
    }
    /********************Deposit portfolio**************/

    async depositPortfolio(
        programId: PublicKey,
        selectedWallet: Account,
        connection: Connection,
        portfolioAddress: Account,
        userPortfolioAccount: Account,
        tokenSwap: PublicKey,
        authority: PublicKey,
        userTransferAuthority: Account,
        spluPRIMARY: PublicKey,
        managerPRIMARY: PublicKey,
        manager_asset1: PublicKey,
        splu_asset1: PublicKey,
        tokenPool: PublicKey,
        feeAccount: PublicKey,
        TOKEN_PROGRAM_ID: PublicKey,
        tokenAccountPool: PublicKey,
        programAddress: PublicKey,
        TOKEN_SWAP_PROGRAM_ID: PublicKey,
        createAccountProgram: Account,
        payer: Account,
        amount_deposit: Number,
        nonce: Number
    ): Promise<Portfolio> {
        // Allocate memory for the account
        const balanceNeeded = await Portfolio.getMinBalanceRentForExemptAccount(
            connection,
        );
        const transaction = new Transaction();
        console.log("payer in createDeposit  " + selectedWallet.publicKey)
        transaction.add(
            Portfolio.createDepositInstruction(
                programId,
                portfolioAddress,
                userPortfolioAccount,
                tokenSwap,
                authority,
                userTransferAuthority,
                spluPRIMARY,
                managerPRIMARY,
                manager_asset1,
                splu_asset1,
                tokenPool,
                feeAccount,
                TOKEN_PROGRAM_ID,
                tokenAccountPool,
                programAddress,
                TOKEN_SWAP_PROGRAM_ID,
                createAccountProgram,
                amount_deposit,
                nonce
            ),
        );
        transaction.recentBlockhash = (
            await connection.getRecentBlockhash()
        ).blockhash;
        transaction.feePayer = selectedWallet.publicKey;
        //transaction.setSigners(payer.publicKey, mintAccount.publicKey );
        transaction.partialSign(userTransferAuthority);
        let signed = await selectedWallet.signTransaction(transaction);
        //   addLog('Got signature, submitting transaction');
        let signature = await connection.sendRawTransaction(signed.serialize());
        await connection.confirmTransaction(signature, 'max');
    }

    async createPortfolio(
        connection: Connection,
        programId: PublicKey,
        creator: Account,
        metaDataUrl: any,
        metaDataHash: u16,
        //creatorAccount : Account,
        amountAsset1: any,
        addressAsset1: Publickey | null,
        periodAsset1: any,
        assetToSoldIntoAsset1: Publickey | null,
        amountAsset2: any,
        addressAsset2: Publickey | null,
        periodAsset2: any,
        assetToSoldIntoAsset2: PublicKey | null,
        amountAsset3: any,
        addressAsset3: Publickey | null,
        periodAsset3: any,
        assetToSoldIntoAsset3: PublicKey | null,
        amountAsset4: number,
        addressAsset4: Publickey | null,
        periodAsset4: number,
        assetToSoldIntoAsset4: PublicKey | null,
        amountAsset5: number,
        addressAsset5: Publickey | null,
        periodAsset5: number,
        assetToSoldIntoAsset5: PublicKey | null,
        amountAsset6: number,
        addressAsset6: Publickey | null,
        periodAsset6: number,
        assetToSoldIntoAsset6: PublicKey | null,
        amountAsset7: number,
        addressAsset7: Publickey | null,
        periodAsset7: number,
        assetToSoldIntoAsset7: PublicKey | null,
        amountAsset8: number,
        addressAsset8: Publickey | null,
        periodAsset8: number,
        assetToSoldIntoAsset8: PublicKey | null,
        amountAsset9: number,
        addressAsset9: Publickey | null,
        periodAsset9: number,
        assetToSoldIntoAsset9: PublicKey | null,

        // amountAsset10 : number ,
        // addressAsset10 : Publickey | null,
        // periodAsset10 : number ,
        // assetToSoldIntoAsset10 : PublicKey| null,
    ): Promise<Account> {
        // Allocate memory for the account
        const balanceNeeded = await Portfolio.getMinBalanceRentForExemptAccount(
            connection,
        );
        const newAccountPortfolio = new Account();
        console.log(newAccountPortfolio)
        console.log("publickey : ", creator.publicKey.toString());
        console.log("Account Portfolio : ", newAccountPortfolio.publicKey.toString());
        const transaction = new Transaction();
        transaction.add(
            SystemProgram.createAccount({
                fromPubkey: creator.publicKey,
                newAccountPubkey: newAccountPortfolio.publicKey,
                lamports: balanceNeeded,
                space: PortfolioLayout.span,
                programId: programId,
            }),
        );
        //const mintPublicKey = this.publicKey;
        transaction.add(
            Portfolio.createInitPortfolioInstruction(
                programId,
                // mintPublicKey,
                creator.publicKey,
                metaDataUrl,
                metaDataHash,
                newAccountPortfolio.publicKey,
                amountAsset1,
                addressAsset1,
                periodAsset1,
                assetToSoldIntoAsset1,
                amountAsset2,
                addressAsset2,
                periodAsset2,
                assetToSoldIntoAsset2,
                amountAsset3,
                addressAsset3,
                periodAsset3,
                assetToSoldIntoAsset3,
                amountAsset4,
                addressAsset4,
                periodAsset4,
                assetToSoldIntoAsset4,
                amountAsset5,
                addressAsset5,
                periodAsset5,
                assetToSoldIntoAsset5,
                amountAsset6,
                addressAsset6,
                periodAsset6,
                assetToSoldIntoAsset6,
                amountAsset7,
                addressAsset7,
                periodAsset7,
                assetToSoldIntoAsset7,
                amountAsset8,
                addressAsset8,
                periodAsset8,
                assetToSoldIntoAsset8,
                amountAsset9,
                addressAsset9,
                periodAsset9,
                assetToSoldIntoAsset9,

                // amountAsset10,
                // addressAsset10,
                // periodAsset10,
                // assetToSoldIntoAsset10
            ),
        );
        console.log("creator : ", creator.publicKey.toString());
        transaction.recentBlockhash = (
            await connection.getRecentBlockhash()
        ).blockhash;
        transaction.feePayer = creator.publicKey;
        //transaction.setSigners(payer.publicKey, mintAccount.publicKey );
        transaction.partialSign(newAccountPortfolio);
        let signed = await creator.signTransaction(transaction);
        //   addLog('Got signature, submitting transaction');
        let signature = await connection.sendRawTransaction(signed.serialize());
        await connection.confirmTransaction(signature, 'max');
        return newAccountPortfolio;
    }

    async createUserPortfolio(
        connection: Connection,
        programId: PublicKey,
        owner: Account,
        portfolio_address: PublicKey,
        delegate: PublicKey | null,
        delegated_amount: number | null,
    ): Promise<Account> {
        // Allocate memory for the account
        const balanceNeeded = await Portfolio.getMinBalanceRentForExemptAccount(
            connection,
        );
        const userPortfolioAccount = new Account();
        console.log("user portfolio account : ", userPortfolioAccount.publicKey.toString())
        const transaction = new Transaction();
        transaction.add(
            SystemProgram.createAccount({
                fromPubkey: owner.publicKey,
                newAccountPubkey: userPortfolioAccount.publicKey,
                lamports: balanceNeeded,
                space: UserPortfolioLayout.span,
                programId: programId,
            }),
        );
        transaction.add(
            Portfolio.createInitUserPortfolioInstruction(
                programId,
                userPortfolioAccount.publicKey,
                owner.publicKey,
                portfolio_address,
                delegate,
                delegated_amount,
            ),
        );
        transaction.recentBlockhash = (
            await connection.getRecentBlockhash()
        ).blockhash;
        transaction.feePayer = owner.publicKey;
        //transaction.setSigners(payer.publicKey, mintAccount.publicKey );
        transaction.partialSign(userPortfolioAccount);
        let signed = await owner.signTransaction(transaction);
        //   addLog('Got signature, submitting transaction');
        let signature = await connection.sendRawTransaction(signed.serialize());
        await connection.confirmTransaction(signature, 'max');
        return userPortfolioAccount;
    }

    async getAccountInfo(
        account: PublicKey,
        commitment?: Commitment,
    ): Promise<AccountInfo> {
        const info = await this.connection.getAccountInfo(account, commitment);
        if (info === null) {
            throw new Error(FAILED_TO_FIND_ACCOUNT);
        }
        if (!info.owner.equals(this.programId)) {
            throw new Error(INVALID_ACCOUNT_OWNER);
        }
        if (info.data.length != AccountLayout.span) {
            throw new Error(`Invalid account size`);
        }
        const data = Buffer.from(info.data);
        const accountInfo = AccountLayout.decode(data);
        accountInfo.address = account;
        accountInfo.mint = new PublicKey(accountInfo.mint);
        accountInfo.owner = new PublicKey(accountInfo.owner);
        accountInfo.amount = u64.fromBuffer(accountInfo.amount);
        accountInfo.usdc = u64.fromBuffer(accountInfo.usdc);
        accountInfo.asset = u64.fromBuffer(accountInfo.asset);
        if (accountInfo.delegateOption === 0) {
            accountInfo.delegate = null;
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


    async getAccountUserPortfolioInfo(
        account: PublicKey,
        commitment?: Commitment,
    ): Promise<UserPortfolioInfo> {
        const info = await this.connection.getAccountInfo(account, commitment);
        if (info === null) {
            throw new Error(FAILED_TO_FIND_ACCOUNT);
        }
        if (!info.owner.equals(this.programId)) {
            throw new Error(INVALID_ACCOUNT_OWNER);
        }
        if (info.data.length != UserPortfolioLayout.span) {
            throw new Error(`Invalid account size`);
        }
        const data = Buffer.from(info.data);
        const accountInfo = UserPortfolioLayout.decode(data);
        accountInfo.user_portfolio_address = new PublicKey(accountInfo.user_portfolio_address);
        accountInfo.portfolio_address = new PublicKey(accountInfo.portfolio_address);
        accountInfo.owner = new PublicKey(accountInfo.owner);
        accountInfo.delegate = new PublicKey(accountInfo.delegate);
        accountInfo.delegatedAmount = u64.fromBuffer(accountInfo.delegatedAmount).toString();
        accountInfo.splu_asset1 = new PublicKey(accountInfo.splu_asset1);
        accountInfo.splu_asset2 = new PublicKey(accountInfo.splu_asset2);
        accountInfo.splu_asset3 = new PublicKey(accountInfo.splu_asset3);
        accountInfo.splu_asset4 = new PublicKey(accountInfo.splu_asset4);
        accountInfo.splu_asset5 = new PublicKey(accountInfo.splu_asset5);
        accountInfo.splu_asset6 = new PublicKey(accountInfo.splu_asset6);
        accountInfo.splu_asset7 = new PublicKey(accountInfo.splu_asset7);
        accountInfo.splu_asset8 = new PublicKey(accountInfo.splu_asset8);
        accountInfo.splu_asset9 = new PublicKey(accountInfo.splu_asset9);
        return accountInfo;
    }

    async getPortfolioInfo(
        account: PublicKey,
        commitment?: Commitment,
    ): Promise<PortfolioInfo> {
        const info = await this.connection.getAccountInfo(account, commitment);
        if (info === null) {
            throw new Error(FAILED_TO_FIND_ACCOUNT);
        }
        if (!info.owner.equals(this.programId)) {
            throw new Error(INVALID_ACCOUNT_OWNER);
        }
        if (info.data.length != PortfolioLayout.span) {
            throw new Error(`Invalid account size`);
        }
        const data = Buffer.from(info.data);
        const accountInfo = PortfolioLayout.decode(data);
        accountInfo.portfolioAddress = new PublicKey(accountInfo.portfolioAddress);
        accountInfo.creatorPortfolio = new PublicKey(accountInfo.creatorPortfolio);
        accountInfo.metadataHash = BufferLayout.u8(accountInfo.metadataHash);
        accountInfo.amountAsset1 = BufferLayout.u8(accountInfo.amountAsset1);
        accountInfo.addressAsset1 = new PublicKey(accountInfo.addressAsset1);
        accountInfo.periodAsset1 = BufferLayout.u8(accountInfo.periodAsset1);// u8.fromBuffer(accountInfo.periodAsset1);
        accountInfo.assetToSoldIntoAsset1 = new PublicKey(accountInfo.assetToSoldIntoAsset1);

        accountInfo.amountAsset2 = BufferLayout.u8(accountInfo.amountAsset2);
        accountInfo.addressAsset2 = new PublicKey(accountInfo.addressAsset2);
        accountInfo.periodAsset2 = BufferLayout.u8(accountInfo.periodAsset2);// u8.fromBuffer(accountInfo.periodAsset1);
        accountInfo.assetToSoldIntoAsset2 = new PublicKey(accountInfo.assetToSoldIntoAsset2);

        accountInfo.amountAsset3 = BufferLayout.u8(accountInfo.amountAsset3);
        accountInfo.addressAsset3 = new PublicKey(accountInfo.addressAsset3);
        accountInfo.periodAsset3 = BufferLayout.u8(accountInfo.periodAsset3);// u8.fromBuffer(accountInfo.periodAsset1);
        accountInfo.assetToSoldIntoAsset3 = new PublicKey(accountInfo.assetToSoldIntoAsset3);

        accountInfo.amountAsset4 = BufferLayout.u8(accountInfo.amountAsset4);
        accountInfo.addressAsset4 = new PublicKey(accountInfo.addressAsset4);
        accountInfo.periodAsset4 = BufferLayout.u8(accountInfo.periodAsset4);// u8.fromBuffer(accountInfo.periodAsset1);
        accountInfo.assetToSoldIntoAsset4 = new PublicKey(accountInfo.assetToSoldIntoAsset4);

        accountInfo.amountAsset5 = BufferLayout.u8(accountInfo.amountAsset5);
        accountInfo.addressAsset5 = new PublicKey(accountInfo.addressAsset5);
        accountInfo.periodAsset5 = BufferLayout.u8(accountInfo.periodAsset5);// u8.fromBuffer(accountInfo.periodAsset1);
        accountInfo.assetToSoldIntoAsset5 = new PublicKey(accountInfo.assetToSoldIntoAsset5);

        accountInfo.amountAsset6 = BufferLayout.u8(accountInfo.amountAsset6);
        accountInfo.addressAsset6 = new PublicKey(accountInfo.addressAsset6);
        accountInfo.periodAsset6 = BufferLayout.u8(accountInfo.periodAsset6);// u8.fromBuffer(accountInfo.periodAsset1);
        accountInfo.assetToSoldIntoAsset6 = new PublicKey(accountInfo.assetToSoldIntoAsset6);

        accountInfo.amountAsset7 = BufferLayout.u8(accountInfo.amountAsset7);
        accountInfo.addressAsset7 = new PublicKey(accountInfo.addressAsset7);
        accountInfo.periodAsset7 = BufferLayout.u8(accountInfo.periodAsset7);// u8.fromBuffer(accountInfo.periodAsset1);
        accountInfo.assetToSoldIntoAsset7 = new PublicKey(accountInfo.assetToSoldIntoAsset7);

        accountInfo.amountAsset8 = BufferLayout.u8(accountInfo.amountAsset8);
        accountInfo.addressAsset8 = new PublicKey(accountInfo.addressAsset8);
        accountInfo.periodAsset8 = BufferLayout.u8(accountInfo.periodAsset8);// u8.fromBuffer(accountInfo.periodAsset1);
        accountInfo.assetToSoldIntoAsset8 = new PublicKey(accountInfo.assetToSoldIntoAsset8);

        accountInfo.amountAsset9 = BufferLayout.u8(accountInfo.amountAsset9);
        accountInfo.addressAsset9 = new PublicKey(accountInfo.addressAsset9);
        accountInfo.periodAsset9 = BufferLayout.u8(accountInfo.periodAsset9);// u8.fromBuffer(accountInfo.periodAsset1);
        accountInfo.assetToSoldIntoAsset9 = new PublicKey(accountInfo.assetToSoldIntoAsset9);
        return accountInfo;
    }

    async getAccountInfoNew(
        account: PublicKey,
        commitment?: Commitment,
    ): Promise<AccountInfo> {
        const info = await this.connection.getAccountInfo(account, commitment);
        if (info === null) {
            throw new Error(FAILED_TO_FIND_ACCOUNT);
        }
        if (!info.owner.equals(this.programId)) {
            throw new Error(INVALID_ACCOUNT_OWNER);
        }
        if (info.data.length != AccountLayoutNew.span) {
            throw new Error(`Invalid account size`);
        }
        const data = Buffer.from(info.data);
        const accountInfo = AccountLayoutNew.decode(data);
        accountInfo.address = account;
        accountInfo.mint = new PublicKey(accountInfo.mint);
        accountInfo.owner = new PublicKey(accountInfo.owner);
        accountInfo.amount = u64.fromBuffer(accountInfo.amount);
        if (accountInfo.delegateOption === 0) {
            accountInfo.delegate = null;
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

    async getAccountInfo(
        account: PublicKey,
        commitment?: Commitment,
    ): Promise<AccountInfo> {
        const info = await this.connection.getAccountInfo(account, commitment);
        if (info === null) {
            throw new Error(FAILED_TO_FIND_ACCOUNT);
        }
        if (!info.owner.equals(this.programId)) {
            throw new Error(INVALID_ACCOUNT_OWNER);
        }
        if (info.data.length != AccountLayout.span) {
            throw new Error(`Invalid account size`);
        }

        const data = Buffer.from(info.data);
        const accountInfo = AccountLayout.decode(data);
        accountInfo.address = account;
        accountInfo.mint = new PublicKey(accountInfo.mint);
        accountInfo.owner = new PublicKey(accountInfo.owner);
        accountInfo.amount = u64.fromBuffer(accountInfo.amount);
        accountInfo.usdc = u64.fromBuffer(accountInfo.usdc);
        accountInfo.asset = u64.fromBuffer(accountInfo.asset);
        if (accountInfo.delegateOption === 0) {
            accountInfo.delegate = null;
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

    static createInitPortfolioInstruction(
        programId: PublicKey,
        //mint: PublicKey,
        creator: PublicKey,
        metaDataUrl: any,
        metaDataHash: number,
        PortfolioAccount: PublicKey | null,
        amountAsset1: number,
        addressAsset1: PublicKey | null,
        periodAsset1: number,
        assetToSoldIntoAsset1: PublicKey | null,
        amountAsset2: number | null,
        addressAsset2: PublicKey | null,
        periodAsset2: number | null,
        assetToSoldIntoAsset2: PublicKey | null,
        amountAsset3: number | null,
        addressAsset3: PublicKey | null,
        periodAsset3: number | null,
        assetToSoldIntoAsset3: PublicKey | null,
        amountAsset4: number | null,
        addressAsset4: PublicKey | null,
        periodAsset4: number | null,
        assetToSoldIntoAsset4: PublicKey | null,
        amountAsset5: number | null,
        addressAsset5: PublicKey | null,
        periodAsset5: number | null,
        assetToSoldIntoAsset5: PublicKey | null,
        amountAsset6: number | null,
        addressAsset6: PublicKey | null,
        periodAsset6: number | null,
        assetToSoldIntoAsset6: PublicKey | null,
        amountAsset7: number | null,
        addressAsset7: PublicKey | null,
        periodAsset7: number | null,
        assetToSoldIntoAsset7: PublicKey | null,
        amountAsset8: number | null,
        addressAsset8: PublicKey | null,
        periodAsset8: number | null,
        assetToSoldIntoAsset8: PublicKey | null,
        amountAsset9: number | null,
        addressAsset9: PublicKey | null,
        periodAsset9: number | null,
        assetToSoldIntoAsset9: PublicKey | null
        //,
        // amountAsset10: number | null,
        // addressAsset10: PublicKey | null,
        // periodAsset10: number | null,
        // assetToSoldIntoAsset10: PublicKey | null

    ): TransactionInstruction {

        console.log("creatorAccount : ", creator.toString(), "addressAsset1 : ", addressAsset1, "assetToSoldIntoAsset1 : ", assetToSoldIntoAsset1);
        const keys = [
            { pubkey: PortfolioAccount, isSigner: false, isWritable: true },
            { pubkey: creator, isSigner: true, isWritable: false },
            { pubkey: addressAsset1, isSigner: false, isWritable: false },
            { pubkey: assetToSoldIntoAsset1, isSigner: false, isWritable: false },
            { pubkey: addressAsset2, isSigner: false, isWritable: false },
            { pubkey: assetToSoldIntoAsset2, isSigner: false, isWritable: false },
            { pubkey: addressAsset3, isSigner: false, isWritable: false },
            { pubkey: assetToSoldIntoAsset3, isSigner: false, isWritable: false },
            { pubkey: addressAsset4, isSigner: false, isWritable: false },
            { pubkey: assetToSoldIntoAsset4, isSigner: false, isWritable: false },
            { pubkey: addressAsset5, isSigner: false, isWritable: false },
            { pubkey: assetToSoldIntoAsset5, isSigner: false, isWritable: false },
            { pubkey: addressAsset6, isSigner: false, isWritable: false },
            { pubkey: assetToSoldIntoAsset6, isSigner: false, isWritable: false },
            { pubkey: addressAsset7, isSigner: false, isWritable: false },
            { pubkey: assetToSoldIntoAsset7, isSigner: false, isWritable: false },
            { pubkey: addressAsset8, isSigner: false, isWritable: false },
            { pubkey: assetToSoldIntoAsset8, isSigner: false, isWritable: false },
            { pubkey: addressAsset9, isSigner: false, isWritable: false },
            { pubkey: assetToSoldIntoAsset9, isSigner: false, isWritable: false },
            // { pubkey: addressAsset10, isSigner: false, isWritable: false },
            // { pubkey: assetToSoldIntoAsset10, isSigner: false, isWritable: false },

            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        ];

        const dataLayout = BufferLayout.struct([
            BufferLayout.u8('instruction'),
            BufferLayout.blob(128, 'metaDataUrl'),
            BufferLayout.u16('metaDataHash'),
            BufferLayout.u8('amountAsset1'),
            BufferLayout.u8('periodAsset1'),
            BufferLayout.u8('amountAsset2'),
            BufferLayout.u8('periodAsset2'),
            BufferLayout.u8('amountAsset3'),
            BufferLayout.u8('periodAsset3'),
            BufferLayout.u8('amountAsset4'),
            BufferLayout.u8('periodAsset4'),
            BufferLayout.u8('amountAsset5'),
            BufferLayout.u8('periodAsset5'),
            BufferLayout.u8('amountAsset6'),
            BufferLayout.u8('periodAsset6'),
            BufferLayout.u8('amountAsset7'),
            BufferLayout.u8('periodAsset7'),
            BufferLayout.u8('amountAsset8'),
            BufferLayout.u8('periodAsset8'),
            BufferLayout.u8('amountAsset9'),
            BufferLayout.u8('periodAsset9'),
            // BufferLayout.u8('amountAsset10'),
            // BufferLayout.u8('periodAsset10'),
        ]);

        console.log(JSON.stringify(metaDataUrl));
        const data = Buffer.alloc(dataLayout.span);
        /*    let metaBuffer = Buffer.alloc()
            metaBuffer.write(metaDataUrl, 0 , metaDataUrl.length , "ascii");*/
        console.log('====================================');
        console.log(metaDataHash, typeof metaDataHash);
        console.log('====================================');
        dataLayout.encode({
            instruction: 19, // InitializeAccount portfolio
            metaDataUrl: Buffer.alloc(128, metaDataUrl, "ascii"),
            metaDataHash: metaDataHash,
            amountAsset1,
            /*amountAsset1: new u16(amountAsset1).toBuffer(),*/
            periodAsset1,
            // periodAsset1 : Buffer.from(periodAsset1),
            amountAsset2,
            periodAsset2,
            amountAsset3,
            periodAsset3,
            amountAsset4,
            periodAsset4,
            amountAsset5,
            periodAsset5,
            amountAsset6,
            periodAsset6,
            amountAsset7,
            periodAsset7,
            amountAsset8,
            periodAsset8,
            amountAsset9,
            periodAsset9,
            // amountAsset10,
            // periodAsset10,
            // periodAsset10: new u64(periodAsset10).toBuffer(),
        },
            data,
        );
        return new TransactionInstruction({
            keys,
            programId,
            data,
        });
    }

    static createInitUserPortfolioInstruction(
        programId: PublicKey,
        user_portfolio_account: PublicKey,
        owner: PublicKey,
        portfolio_address: PublicKey,

        delegate: PublicKey | null,
        delegated_amount: number | null,
        /*splu_asset1: PublicKey,
        splu_asset2: PublicKey | null,
        splu_asset3: PublicKey | null,
        splu_asset4: PublicKey | null,
        splu_asset5: PublicKey | null,
        splu_asset6: PublicKey | null,
        splu_asset7: PublicKey | null,
        splu_asset8: PublicKey | null,
        splu_asset9: PublicKey | null,*/
    ): TransactionInstruction {
        //  console.log ("splu_asset1 : in portfolio js :" , splu_asset1.toString());
        const keys = [
            { pubkey: user_portfolio_account, isSigner: false, isWritable: true },
            { pubkey: portfolio_address, isSigner: false, isWritable: false },
            { pubkey: owner, isSigner: true, isWritable: false },
            { pubkey: delegate, isSigner: false, isWritable: false },
            /* { pubkey: splu_asset1, isSigner: false, isWritable: false },
             { pubkey: splu_asset2, isSigner: false, isWritable: false },
             { pubkey: splu_asset3, isSigner: false, isWritable: false },
             { pubkey: splu_asset4, isSigner: false, isWritable: false },
             { pubkey: splu_asset5, isSigner: false, isWritable: false },
             { pubkey: splu_asset6, isSigner: false, isWritable: false },
             { pubkey: splu_asset7, isSigner: false, isWritable: false },
             { pubkey: splu_asset8, isSigner: false, isWritable: false },
             { pubkey: splu_asset9, isSigner: false, isWritable: false },*/
        ];

        const dataLayout = BufferLayout.struct([
            BufferLayout.u8('instruction'),
            Layout.uint64('delegated_amount'),
        ]);
        const data = Buffer.alloc(dataLayout.span);
        dataLayout.encode({
            instruction: 20, // Initialize Account user Portfolio

            delegated_amount: new u64(delegated_amount).toBuffer(),
        },
            data,
        );
        return new TransactionInstruction({
            keys,
            programId,
            data,
        });
    }

    static createDepositInstruction(
        programId,
        portfolioAddress,
        userPortfolioAccount,
        tokenSwap,
        authority,
        userTransferAuthority,
        spluPRIMARY,
        managerPRIMARY,
        manager_asset1,
        splu_asset1,
        tokenPool,
        feeAccount,
        TOKEN_PROGRAM_ID,
        tokenAccountPool,
        programAddress,
        TOKEN_SWAP_PROGRAM_ID,
        createAccountProgram,
        amount_deposit,
        nonce
    ): TransactionInstruction {
        const dataLayout = BufferLayout.struct([
            BufferLayout.u8('instruction'),
            BufferLayout.u8('amount_deposit'),
            BufferLayout.u8('nonce'),
        ]);

        const data = Buffer.alloc(dataLayout.span);
        dataLayout.encode({
            instruction: 17, // deposit instruction
            amount_deposit,
            nonce
        },
            data,
        );

        const keys = [
            { pubkey: portfolioAddress.publicKey, isSigner: false, isWritable: false },
            { pubkey: userPortfolioAccount.publicKey, isSigner: false, isWritable: true },
            { pubkey: tokenSwap, isSigner: false, isWritable: true },
            { pubkey: authority, isSigner: false, isWritable: true },  //authority 
            { pubkey: userTransferAuthority.publicKey, isSigner: true, isWritable: true },
            { pubkey: spluPRIMARY, isSigner: false, isWritable: true },
            { pubkey: managerPRIMARY, isSigner: false, isWritable: true },
            { pubkey: manager_asset1, isSigner: false, isWritable: true },
            { pubkey: splu_asset1, isSigner: false, isWritable: true },
            { pubkey: tokenPool, isSigner: false, isWritable: true },
            { pubkey: feeAccount, isSigner: false, isWritable: true },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: true },
            { pubkey: tokenAccountPool, isSigner: false, isWritable: true },
            { pubkey: programAddress, isSigner: false, isWritable: true },
            { pubkey: TOKEN_SWAP_PROGRAM_ID, isSigner: false, isWritable: true },
            { pubkey: createAccountProgram.publicKey, isSigner: false, isWritable: false },
        ]
        return new TransactionInstruction({
            keys,
            programId: programId,
            data,
        });
    }

}