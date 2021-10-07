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
 import {
     blob,
     u
 } from 'buffer-layout'
 import type {
     Connection,
     Commitment,
     TransactionSignature,
 } from '@solana/web3.js';
 import { newAccountWithLamports } from '../../client/util/new-account-with-lamports';
 import {Token , AccountLayout} from '../../client/token';
 import * as Layout from './layout';
 import { sendAndConfirmTransaction } from '../../client/util//send-and-confirm-transaction';
 
 export const TOKEN_PROGRAM_ID: PublicKey = new PublicKey(
     'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
 );
 
 export const ASSOCIATED_TOKEN_PROGRAM_ID: PublicKey = new PublicKey(
     'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
 );
 const MAX_ASSET_PER_PORTFOLIO = 10;
 
 const FAILED_TO_FIND_ACCOUNT = 'Failed to find account';
 const INVALID_ACCOUNT_OWNER = 'Invalid account owner';
 const pubkey_swap = "SwaPpA9LAaLfeLi3a68M4DjnLqgtticKg6CnyNwgAC8";
 /**
  * Unfortunately, BufferLayout.encode uses an `instanceof` check for `Buffer`
  * which fails when using `publicKey.toBuffer()` directly because the bundled `Buffer`
  * class in `@solana/web3.js` is different from the bundled `Buffer` class in this package
  */

/* function pubkeyToBuffer(publicKey: PublicKey): typeof Buffer {
     return Buffer.from(publicKey.toBuffer());
 }*/
 
 /**
  * 64-bit value
  */
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
 
 function isAccount(accountOrPublicKey: any): boolean {
     return 'publicKey' in accountOrPublicKey;
 }
 

 
 type Asset = {
    /**
          * The amount of  asset
          */
         amountAsset : null | u8,
         /**
          * The address of first asset
          */
         addressAsset : null | PublicKey,
         /**
          * The period of first asset
          */
         periodAsset : null | u8,
         /**
          * The asset solde of first asset
          */
         assetToSoldIntoAsset : null | PublicKey,
    
     }

 

 
 
 /**
  * Information about an account
  */

 

 type PortfolioInfo = {

      /**
      * type of account
      */
       type_account :u8,

       /**
      * the address of the creator
      */
     creatorPortfolio : PublicKey,
        /**
      * metadata url
      */
     metadataUrl: [u8],
 
     /**
      * metadata hash
      */
     metadataHash : [u8],
   
     /**
      * initialized account 
      */
      is_initialize :null | u8,

     
      /**
       * Length of assets by portfolio
       */
       asset_data_len : u8,
     /**
      * assets informations
      */
      asset_data : [Asset],
 };
 
 /**
  * @private
  */
 export const PortfolioLayout: typeof BufferLayout.Structure = BufferLayout.struct(
     [
         BufferLayout.u8('type_account'), //8
         Layout.publicKey('creatorPortfolio'), //32
         BufferLayout.blob(128,'metadataUrl'), //128
         BufferLayout.blob(16,'metadataHash'), //16
         BufferLayout.u8('is_initialize'), //8
         BufferLayout.u8('asset_data_len'), //8
         BufferLayout.blob(660,'asset_data'),
     ],
 );
 
 /**
  * Information about an user portfolio
  */
 type UserPortfolioInfo = {

      /**
         * type of account
         */
       type_account :u8,
        
         /**
          * Owner of this account
          */
         owner: PublicKey,
 
         /**
          * Owner of this account
          */
         portfolio_address: PublicKey,

       
 
         /**
          * list address of splu after swap
          */
          splu_list: null | [PublicKey],

     }
     /**
      * @private
      */
 export const UserPortfolioLayout: typeof BufferLayout.Structure = BufferLayout.struct(
     [
         BufferLayout.u8('type_account'),//8
         Layout.publicKey('owner'), //32
         Layout.publicKey('portfolio_address'), //32
         BufferLayout.blob(320,'splu_list'), //32*10
     ],
 );
 
 
 /**
  * An ERC20-like Portfolio
  */
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
 
     /**
      * Create a Portfolio object attached to the specific mint
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
 /*
     /**
      * Get the minimum balance for the mint to be rent exempt
      *
      * @return Number of lamports required
      */
     /*
     static async getMinBalanceRentForExemptMint(
         connection: Connection,
     ): Promise < number > {
         return await connection.getMinimumBalanceForRentExemption(MintLayout.span);
     }
     */
 
     /**
      * Get the minimum balance for the account to be rent exempt
      *
      * @return Number of lamports required
      */
     static async getMinBalanceRentForExemptAccount(
         connection: Connection,
     ): Promise < number > {
         return await connection.getMinimumBalanceForRentExemption(
            PortfolioLayout.span,
         );
     }
 
  
     /**
      * Get the minimum balance for the account to be rent exempt
      *
      * @return Number of lamports required
      */
     static async getMinBalanceRentForExemptUserPortfolio(
         connection: Connection,
     ): Promise < number > {
         return await connection.getMinimumBalanceForRentExemption(
            UserPortfolioLayout.span,
         );
     }
 
  
 
 
 
 
 
         /********************Deposit portfolio**************/
     /**
      * Create Deposit Portfolio.
      *
      * @param userSource Source account
      * @param userDestination Destination account
      * @param userAuthority Owner of the source account
      * @param amountAsset1   Number of tokens to deposit
      * @param addressAsset1   address of tokens to deposit
 
      * @return Portfolio object for the newly minted token
      */
     async depositPortfolio(
        portfolioAddress : Account,
        userPortfolioAccount : Account,
        tokenSwap : PublicKey,
        authority : PublicKey ,
        userTransferAuthority : Account,
        spluPRIMARY : PublicKey,
        managerPRIMARY: PublicKey ,
        manager_asset1 : PublicKey , 
        splu_asset1 : PublicKey , 
        tokenPool:PublicKey , 
        feeAccount: PublicKey , 
        TOKEN_PROGRAM_ID: PublicKey,
        tokenAccountPool:PublicKey ,
        programAddress:PublicKey , 
        TOKEN_SWAP_PROGRAM_ID: PublicKey,
        createAccountProgram: Account , 
        payer: Account,
        amount_deposit: Number,
        nonce:Number

         ): Promise < Portfolio > {
 
 
 
 
             const transaction = new Transaction();
 
             console.log("payer in createDeposit  " + this.payer.publicKey)
 
             transaction.add(
                 Portfolio.createDepositInstruction(
                     this.programId,
                     portfolioAddress,
                     userPortfolioAccount,
                     tokenSwap,
                     authority ,
                     userTransferAuthority,
                     spluPRIMARY ,
                     managerPRIMARY ,
                     manager_asset1 , 
                     splu_asset1 , 
                     tokenPool , 
                     feeAccount , 
                     TOKEN_PROGRAM_ID,
                     tokenAccountPool , 
                     programAddress , 
                     TOKEN_SWAP_PROGRAM_ID ,
                     createAccountProgram , 
                     amount_deposit,
                     nonce
                 ),
             );
      
             // Send the two instructions
             await sendAndConfirmTransaction(
                 'createAccount and InitializeMint',
                 this.connection,
                 transaction,
                 payer,
                 userTransferAuthority
 
             );
 
 
         }
 
 

         /********************withdraw portfolio**************/
     /**
      * Create withdraw Portfolio.
      *
      * @param userSource Source account
      * @param userDestination Destination account
      * @param userAuthority Owner of the source account
      * @param amountAsset1   Number of tokens to deposit
      * @param addressAsset1   address of tokens to deposit
 
      * @return Portfolio object for the newly minted token
      */
     async withdrawPortfolio(
        portfolioAddress : Account,
        userPortfolioAccount : Account,
        tokenSwap : PublicKey,
        authority : PublicKey ,
        userTransferAuthority : Account,
        spluPRIMARY : PublicKey,
        managerPRIMARY: PublicKey ,
        manager_asset1 : PublicKey , 
        splu_asset1 : PublicKey , 
        tokenPool:PublicKey , 
        feeAccount: PublicKey , 
        TOKEN_PROGRAM_ID: PublicKey,
        tokenAccountPool:PublicKey ,
        programAddress:PublicKey , 
        TOKEN_SWAP_PROGRAM_ID: PublicKey,
        createAccountProgram: Account , 
        payer: Account,
        amount_deposit: Number,
        nonce:Number

         ): Promise < Portfolio > {
 
 
 
     
 
             const transaction = new Transaction();
 
             console.log("payer in createDeposit  " + this.payer.publicKey)
 
             transaction.add(
                 Portfolio.createWithdrawInstruction(
                     this.programId,
                     portfolioAddress,
                     userPortfolioAccount,
                     tokenSwap,
                     authority ,
                     userTransferAuthority,
                     spluPRIMARY ,
                     managerPRIMARY ,
                     manager_asset1 , 
                     splu_asset1 , 
                     tokenPool , 
                     feeAccount , 
                     TOKEN_PROGRAM_ID,
                     tokenAccountPool , 
                     programAddress , 
                     TOKEN_SWAP_PROGRAM_ID ,
                     createAccountProgram , 
                     amount_deposit,
                     nonce
                 ),
             );
      
             // Send the two instructions
             await sendAndConfirmTransaction(
                 'createAccount and InitializeMint',
                 this.connection,
                 transaction,
                 payer,
                 userTransferAuthority
 
             );
 
 
         }
 
 
 
     /**
      * Create and initialize a new portfolio.
      *
      * This portfolio may then be used as a `transfer()` or `approve()` destination
      *
      * @param owner User account that will own the new portfolio
      * @return Public key of the new empty portfolio
      */
      async createPortfolio(
       creator: Account,
       metaDataUrl : any,
       metaDataHash : any ,
       numberOfAsset:u8,
       //creatorAccount : Account,
       amountAsset1 : number ,
       addressAsset1 : Publickey| null ,
       periodAsset1 : number ,
       assetToSoldIntoAsset1 : Publickey| null,
       ): Promise<Account> {
       // Allocate memory for the account
       const balanceNeeded = await Portfolio.getMinBalanceRentForExemptAccount(
         this.connection,
       );
 console.log ("balanceNeeded : ", balanceNeeded ); 
       const newAccountPortfolio = new Account();
       
       console.log ("Account Portfolio : ",newAccountPortfolio.publicKey.toString());
      
       const transaction = new Transaction();
       transaction.add(
           SystemProgram.createAccount({
               fromPubkey: creator.publicKey,
               newAccountPubkey: newAccountPortfolio.publicKey,
               lamports: balanceNeeded,
               space: PortfolioLayout.span,
               programId: this.programId,
           }),
       );
 
 
         transaction.add(
             Portfolio.createInitPortfolioInstruction(
                 this.programId,
                 creator.publicKey,
                 metaDataUrl,
                 metaDataHash,
                 numberOfAsset,
                 newAccountPortfolio.publicKey,
                 amountAsset1,
                 addressAsset1,
                 periodAsset1,
                 assetToSoldIntoAsset1,
             ),
         );
                 console.log("creator : ", creator.publicKey.toString());
 
         //Send the two instructions

         /*await sendAndConfirmTransaction(
             'createPortfolio and InitializePortfolio',
             this.connection,
             transaction,
             creator,
             newAccountPortfolio
             
 
         )*/
         transaction.recentBlockhash = (
            await this.connection.getRecentBlockhash()
        ).blockhash;
        transaction.feePayer = creator.publicKey;
         transaction.partialSign(newAccountPortfolio);
        let signed = await creator.signTransaction(transaction);
        //   addLog('Got signature, submitting transaction');
        let signature = await this.connection.sendRawTransaction(signed.serialize());
        await this.connection.confirmTransaction(signature, 'max');
 
         return newAccountPortfolio;
     }
 
 
 
 
     /**
      * addAssetToPortfolio.
      *
      * This account may then be used as a `transfer()` or `approve()` destination
      *
      * @param owner owner account that will own the new account*
      * @param portfolioAddress prtfolioAddress
      * @param amount amount of asset 
      * @return portfolio with new asset
      */
      async addAssetToPortfolio(
   
       portfolio_address: Account,
       creator:Account,
       amountAsset : number ,
       addressAsset : Publickey| null ,
       periodAsset : number ,
       assetToSoldIntoAsset : Publickey| null,
    
   ): Promise < Account > {
       // Allocate memory for the account
       const balanceNeeded = await Portfolio.getMinBalanceRentForExemptAccount(
           this.connection,
       );

       const transaction = new Transaction();

       transaction.add(
        Portfolio.addAssetToPortfolioInstruction(
            this.programId,
            creator.publicKey,
            portfolio_address,
            amountAsset,
            addressAsset,
            periodAsset,
            assetToSoldIntoAsset,
           
        ),
    );

       

    //Send the two instructions
    /*await sendAndConfirmTransaction(
        'add asset to existing portfolio',
        this.connection,
        transaction,
        creator,
        portfolio_address
        

    )*/
    transaction.recentBlockhash = (
        await this.connection.getRecentBlockhash()
    ).blockhash;
    transaction.feePayer = creator.publicKey;
    let signed = await creator.signTransaction(transaction);
    let signature = await this.connection.sendRawTransaction(signed.serialize());
    await this.connection.confirmTransaction(signature, 'max');


    return portfolio_address;
}

       
     /**
      * Create and initialize a new User Portfolio.
      *
      * This account may then be used as a `transfer()` or `approve()` destination
      *
      * @param owner User account that will own the new account*
      * @param portfolioAddress prtfolioAddress
      * @param spluAsset1 adddress of asset 1..10
      * @return UserPortfolio of the new empty account
      */
      async createUserPortfolio(
       owner:Account,
       portfolio_address: PublicKey,
     
     
    
   ): Promise < Account > {
       // Allocate memory for the account
       const balanceNeeded = await Portfolio.getMinBalanceRentForExemptUserPortfolio(
           this.connection,
       );
 
      //  const user_Portfolio = await newAccountWithLamports(this.connection, balanceNeeded);
       const user_Portfolio = new Account();
      
        
     
       
       console.log ("user portfolio account : ",user_Portfolio.publicKey.toString() )
       console.log ("owner of user portfolio account : ",owner.publicKey.toString() )
       const transaction = new Transaction();
       transaction.add(
           SystemProgram.createAccount({
               fromPubkey: owner.publicKey,
               newAccountPubkey: user_Portfolio.publicKey,
               lamports: balanceNeeded,
               space: UserPortfolioLayout.span,
               programId: this.programId,
           }),
       );


       transaction.add(
           Portfolio.createInitUserPortfolioInstruction(
               this.programId,
               user_Portfolio.publicKey,
               owner.publicKey,
               portfolio_address,
             
          
           ),
    );
 
       // Send the two instructions
       /*await sendAndConfirmTransaction(
           'createAccount and InitializeAccount',
           this.connection,
           transaction,
           owner,
           user_Portfolio,
 
       );*/

       transaction.recentBlockhash = (
        await this.connection.getRecentBlockhash()
    ).blockhash;
    transaction.feePayer = owner.publicKey;
    transaction.partialSign(user_Portfolio);
    let signed = await owner.signTransaction(transaction);
    let signature = await this.connection.sendRawTransaction(signed.serialize());
    await this.connection.confirmTransaction(signature, 'max');
 
       return user_Portfolio;
   }
 
 
 
     /**
      * addSpluToUserPortfolio.
      *
      * 
      *
      * @param owner owner account that will own the new account*
      * @param portfolioAddress prtfolioAddress
      * @param amount amount of asset 
      * @return portfolio with new asset
      */
      async addSpluToUserPortfolio(
   
        ownerPortfolio: Account,
        userPortfolioAccountExist:Account,
        splu1 : PublicKey ,
        splu2 : PublicKey ,
        splu3 : PublicKey ,
        splu4 : PublicKey ,
        splu5 : PublicKey ,
        splu6 : PublicKey ,
        splu7 : PublicKey ,
        splu8 : PublicKey ,
        splu9 : PublicKey ,
        splu10 : PublicKey 
      
     
    ): Promise < Account > {
        // Allocate memory for the account
        const balanceNeeded = await Portfolio.getMinBalanceRentForExemptAccount(
            this.connection,
        );
 
        const transaction = new Transaction();
 
        transaction.add(
         Portfolio.addSpluToUserPortfolioInstruction(
             this.programId,
             ownerPortfolio.publicKey,
             userPortfolioAccountExist.publicKey,
             splu1,
             splu2, 
             splu3, 
             splu4, 
             splu5, 
             splu6, 
             splu7, 
             splu8, 
             splu9, 
             splu10
         ),
     );
 
        
 
     //Send the two instructions
     /*await sendAndConfirmTransaction(
         'add asset to existing portfolio',
         this.connection,
         transaction,
         ownerPortfolio,
         userPortfolioAccountExist
         
 
     )*/

     transaction.recentBlockhash = (
        await this.connection.getRecentBlockhash()
    ).blockhash;
    transaction.feePayer = ownerPortfolio.publicKey;
    let signed = await ownerPortfolio.signTransaction(transaction);
    let signature = await this.connection.sendRawTransaction(signed.serialize());
    await this.connection.confirmTransaction(signature, 'max');
 
     return userPortfolioAccountExist;
 }
 
 
 
 
 
     /**
      * Create and initialize a new account.
      *
      * This account may then be used as a `transfer()` or `approve()` destination
      *
      * @param owner User account that will own the new account
      * @return Public key of the new empty account
      */
     async  createAccount   
     (owner: PublicKey): Promise < PublicKey > {
         // Allocate memory for the account
         const balanceNeeded = await Portfolio.getMinBalanceRentForExemptAccount(
             this.connection,
         );
 
         const newAccount = new Account();
         const transaction = new Transaction();
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
             Portfolio.createInitAccountInstruction(
                 this.programId,
                 mintPublicKey,
                 newAccount.publicKey,
                 owner,
             ),
         );
 
         // Send the two instructions
         await sendAndConfirmTransaction(
             'createAccount and InitializeAccount',
             this.connection,
             transaction,
             this.payer,
             newAccount,
         );
 
         return newAccount.publicKey;
     }
 
   
 
 
 
  
     /**
      * Retrieve account information
      *
      * @param account Public key of the account
      */
     async getAccountUserPortfolioInfo(
         account: PublicKey,
         commitment ? : Commitment,
     ): Promise < UserPortfolioInfo > {
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

       // console.log ("accountInfo : ", JSON.stringify(accountInfo));
         accountInfo.user_portfolio_address = new PublicKey( accountInfo.user_portfolio_address);
         accountInfo.portfolio_address = new PublicKey(accountInfo.portfolio_address);
         accountInfo.owner = new PublicKey(accountInfo.owner);
         accountInfo.delegate = new PublicKey(accountInfo.delegate);
         accountInfo.delegatedAmount = u64.fromBuffer(accountInfo.delegatedAmount);
         let splu_list ,splu1, splu2 ,splu3 , splu4 , splu5 , splu6 , splu7 , splu8 , splu9 ,splu10;
         splu_list= [];
          splu1= [];
          splu2 =[];
          splu3 = [];
          splu4 = [];
          splu5 = [];
          splu6 = [];
          splu7 = [];
          splu8 = [];
          splu9 = [];
          splu10=[];
         for (let i =0 ; i<320 ; i++)
         splu_list.push(accountInfo.splu_list[i]);
         for (let i =0 ; i<32 ; i++)
         splu1.push(accountInfo.splu_list[i]);
         for (let i =32 ; i<64 ; i++)
         splu2.push(accountInfo.splu_list[i]);
         for (let i =64 ; i<96 ; i++)
         splu3.push(accountInfo.splu_list[i]);
         for (let i =96 ; i<128 ; i++)
         splu4.push(accountInfo.splu_list[i]);
         for (let i =128 ; i<160 ; i++)
         splu5.push(accountInfo.splu_list[i]);
         for (let i =160 ; i<192 ; i++)
         splu6.push(accountInfo.splu_list[i]);
         for (let i =192 ; i<224 ; i++)
         splu7.push(accountInfo.splu_list[i]);
         for (let i =224 ; i<256 ; i++)
         splu8.push(accountInfo.splu_list[i]);
         for (let i =256 ; i<288 ; i++)
         splu9.push(accountInfo.splu_list[i]);
         for (let i =288 ; i<320 ; i++)
         splu10.push(accountInfo.splu_list[i]);
         accountInfo.splu_list = splu_list;
         accountInfo.splu1 = splu1;
         accountInfo.splu2= splu2;
         accountInfo.splu3 = splu3;
         accountInfo.splu4 = splu4;
         accountInfo.splu5 = splu5;
         accountInfo.splu6 = splu6;
         accountInfo.splu7 = splu7;
         accountInfo.splu8 = splu8;
         accountInfo.splu9 = splu9;
         accountInfo.splu10 = splu10;
 
         return accountInfo;
     }
 
 
          /**
      * Retrieve portfolio information
      *
      * @param account Public key of the account
      */
           async getPortfolioInfo(
            account: PublicKey,
            commitment ? : Commitment,
        ): Promise <PortfolioInfo> {
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
        
            //console.log ("accountInfo : ", JSON.stringify(accountInfo));
           accountInfo.portfolioAddress  = new PublicKey(accountInfo.portfolioAddress);
            accountInfo.creatorPortfolio = new PublicKey( accountInfo.creatorPortfolio);
           // accountInfo.owner  = new PublicKey(accountInfo.owner);

          //  accountInfo.metadataUrl = Buffer.alloc(128, metadataUrl, "ascii");
          //  accountInfo.metadataHash =  BufferLayout.u16(accountInfo.metadataHash);
           // accountInfo.is_initialize =  BufferLayout.u8(accountInfo.is_initialize);
         //   accountInfo.asset_data_len =  BufferLayout.u8(accountInfo.asset_data_len);
           // accountInfo.asset_data =  BufferLayout.u8(accountInfo.asset_data);



            return accountInfo;
        }
    
     /*/**
      * Retrieve account information
      *
      * @param account Public key of the account
      */
     /*
     async getAccountInfo(
         account: PublicKey,
         commitment ? : Commitment,
     ): Promise < AccountInfo > {
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
 
 */
 

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
         multiSigners: Array < Account > ,
         amount: number | u64,
     ): Promise < void > {
         let ownerPublicKey;
         let signers;
         if (isAccount(owner)) {
             console.log( "it's account");
             ownerPublicKey = owner.publicKey;
             signers = [owner];
         } else {
             ownerPublicKey = owner;
             signers = multiSigners;
         }
         await sendAndConfirmTransaction(
             'Approve',
             this.connection,
             new Transaction().add(
                 Portfolio.createApproveInstruction(
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
         );
     }
 
   /*  /**
      * Grant a third-party permission to transfer up the specified number of tokens from an account
      *
      * @param account Public key of the account
      * @param delegate Account authorized to perform a transfer tokens from the source account
      * @param owner Owner of the source account
      * @param multiSigners Signing accounts if `owner` is a multiSig
      * @param amount Maximum number of tokens the delegate may transfer
      */
    /* async approveUserPortfolio(
         account: PublicKey,
         delegate: PublicKey,
         owner: any,
         multiSigners: Array < Account > ,
         amount: number | u64,
     ): Promise < void > {
         let ownerPublicKey;
         let signers;
         if (isAccount(owner)) {
             console.log( "it's account");
             ownerPublicKey = owner.publicKey;
             signers = [owner];
         } else {
             ownerPublicKey = owner;
             signers = multiSigners;
         }
         await sendAndConfirmTransaction(
             'approveUserPortfolio',
             this.connection,
             new Transaction().add(
                 Portfolio.createApproveUserPortfolioInstruction(
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
         );
     }*/
 
    
 
     
 
 
 
 
     /**
      * Construct an InitializePortfolio instruction
      *
      * @param programId SPL Token program account
      * @param mint Token mint account
      * @param portfolio New account
      * @param creator Creator of the new portfolio
      */
     static createInitPortfolioInstruction(
         programId: PublicKey,
         creator: PublicKey,
         metaDataUrl: any,
         metaDataHash: any,
         numberOfAsset:number,
         PortfolioAccount: PublicKey,
         amountAsset1: number,
         addressAsset1: PublicKey| null,
         periodAsset1: number,
         assetToSoldIntoAsset1: PublicKey| null,
     ): TransactionInstruction {
 
       console.log ("creatorAccount : ",creator.toString() , "addressAsset1 : ",addressAsset1,"assetToSoldIntoAsset1 : ",assetToSoldIntoAsset1);
         const keys = [
           
             { pubkey: PortfolioAccount, isSigner: true, isWritable: false },
             { pubkey: creator, isSigner: true, isWritable: false },
             { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
         ];
 
         const conv = num => {
           let b = new ArrayBuffer(4);
           new DataView(b).setUint32(0, num);
           return Array.from(new Uint8Array(b));
         }
         
         const dataLayout = BufferLayout.struct([
             BufferLayout.u8('instruction'),
             BufferLayout.blob(128,'metaDataUrl'),
             BufferLayout.blob(16,'metaDataHash'),
             BufferLayout.u8('asset_data_len'),
             BufferLayout.blob(numberOfAsset*66,'asset_data'),
         ]);
 
         console.log(JSON.stringify(metaDataUrl));
         const data = Buffer.alloc(dataLayout.span);
         /*    let metaBuffer = Buffer.alloc()
             metaBuffer.write(metaDataUrl, 0 , metaDataUrl.length , "ascii");*/
         console.log('====================================');
         console.log(metaDataHash, typeof metaDataHash );
         console.log('====================================');
         let assetData = [];
         
         assetData.push(Buffer.from([amountAsset1]));
         assetData.push(addressAsset1.toBuffer());
         assetData.push(Buffer.from([periodAsset1]));
         assetData.push(assetToSoldIntoAsset1.toBuffer());

         console.log("assetData is ",assetData);



         dataLayout.encode({
                 instruction: 19, // InitializeAccount portfolio
                 metaDataUrl: Buffer.alloc(128, metaDataUrl, "ascii"),
                 metaDataHash :Buffer.alloc(16, metaDataHash, "ascii"),

                 asset_data_len:numberOfAsset ,
                 asset_data :  Buffer.concat( assetData),

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
      * Construct an add Asset To Portfolio Instruction
      *
      * @param programId SPL Token program account
      * @param portfolio portfolio
      * @param creator Creator of the  portfolio
      */
     static addAssetToPortfolioInstruction(
         programId: PublicKey,
         creator: PublicKey,
         PortfolioAccount: PublicKey,
         amountAsset: number,
         addressAsset: PublicKey| null,
         periodAsset: number,
         assetToSoldIntoAsset: PublicKey| null,
        
 
     ): TransactionInstruction {
 
       console.log ("creatorAccount : ",creator.toString() , "addressAsset1 : ",addressAsset,"assetToSoldIntoAsset1 : ",assetToSoldIntoAsset);
         const keys = [
             { pubkey: PortfolioAccount, isSigner: false, isWritable: true },
             { pubkey: creator, isSigner: true, isWritable: false },
             { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
         ];
 
         
         const dataLayout = BufferLayout.struct([
             BufferLayout.u8('instruction'),  
             BufferLayout.blob(66,'asset_data'),
         ]);

         const data = Buffer.alloc(dataLayout.span);

         let assetData = [];
         
         assetData.push(Buffer.from([amountAsset]));
         assetData.push(addressAsset.toBuffer());
         assetData.push(Buffer.from([periodAsset]));
         assetData.push(assetToSoldIntoAsset.toBuffer());

         console.log("assetData is ",assetData);



         dataLayout.encode({
                 instruction: 22, // add asset to existing portfolio
                 asset_data :  Buffer.concat( assetData),
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
      * Construct an add Asset To Portfolio Instruction
      *
      * @param programId SPL Token program account
      * @param userportfolio user portfolio
      * @param creator Creator of the  portfolio
      */
     static addSpluToUserPortfolioInstruction(
         programId: PublicKey,
         ownerPortfolio: PublicKey,
         userPortfolioAccountExist: PublicKey,
         splu1 : PublicKey ,
         splu2 : PublicKey ,
         splu3 : PublicKey ,
         splu4 : PublicKey ,
         splu5 : PublicKey ,
         splu6 : PublicKey ,
         splu7 : PublicKey ,
         splu8 : PublicKey ,
         splu9 : PublicKey ,
         splu10 : PublicKey 
    
        
 
     ): TransactionInstruction {
 
       console.log ("ownerPortfolio : ",ownerPortfolio.toString() );
         const keys = [
             { pubkey: ownerPortfolio, isSigner: true, isWritable: false },
             { pubkey: userPortfolioAccountExist, isSigner: false, isWritable: true },
             { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
         ];
 
         const dataLayout = BufferLayout.struct([
             BufferLayout.u8('instruction'),  
             BufferLayout.blob(320,'splu_list'),
         ]);

         const data = Buffer.alloc(dataLayout.span);

         let spluList = [];
        
         spluList.push(splu1.toBuffer());
         spluList.push(splu2.toBuffer());
         spluList.push(splu3.toBuffer());
         spluList.push(splu4.toBuffer());
         spluList.push(splu5.toBuffer());
         spluList.push(splu6.toBuffer());
         spluList.push(splu7.toBuffer());
         spluList.push(splu8.toBuffer());
         spluList.push(splu9.toBuffer());
         spluList.push(splu10.toBuffer());
          
/*
for (let i =32 ; i<320 ; i++){
    spluList.push(Buffer.from([1]));
  }*/
console.log("spluList : ",Buffer.concat(spluList) );
         dataLayout.encode({
                 instruction: 23, // add splu to existing user portfolio
                 splu_list :  Buffer.concat(spluList),
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
      * Construct an InitializeUserPortfolio instruction
      *
      * @param programId SPL Token program account
      * @param UserPortfolioAccount New account
      * @param owner owner  
      * @param portfolio_address: PublicKey,
      * @param delegate: delegated address,
      * @param delegated_amount:delegated amount,
      * @param splu: list of splu after swap,

      */
 
     static createInitUserPortfolioInstruction(
         programId: PublicKey,
         user_portfolio_account: PublicKey,
         owner: PublicKey,
         portfolio_address: PublicKey,
       
        // spluList: [PublicKey] | null,
     ): TransactionInstruction {
       //  console.log ("splu_asset1 : in portfolio js :" , splu_asset1.toString());
 
         const keys = [
             { pubkey: user_portfolio_account, isSigner: false, isWritable: true },
             { pubkey: portfolio_address, isSigner: false, isWritable: false },
             { pubkey: owner, isSigner: true, isWritable: false },
         ];
         let splu_list = [];
         for (let i =0 ; i<320 ; i++){
           splu_list.push(Buffer.from([1]));
         }
 
         const dataLayout = BufferLayout.struct([
             BufferLayout.u8('instruction'),
             BufferLayout.blob(320,'splu_list'),
         ]);
 
 
         const data = Buffer.alloc(dataLayout.span);
 
         dataLayout.encode({
                 instruction: 20, // Initialize Account user Portfolio
                 splu_list:Buffer.concat(splu_list),
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
       * Construct a Deposit instruction version bacem
       *
       * @param programId SPL Token program account
       * @param account Account 
       //* @ param payer Owner of the source account //jawaher
       * @param owner Owner of the source account //becem
       * @param amount Number of tokens to transfer
       * @param volatility 90/10 or 50/50 underlying asset percentage / usdc. Please refer to github.com/NovaFi for more details 
       * @param nonce once used to create valid program address 
       */
 
     static createDepositInstruction(
        programId,
        portfolioAddress,
        userPortfolioAccount,
        tokenSwap,
        authority ,
        userTransferAuthority,
        spluPRIMARY ,
        managerPRIMARY ,
        manager_asset1 , 
        splu_asset1 , 
        tokenPool , 
        feeAccount , 
        TOKEN_PROGRAM_ID,
        tokenAccountPool , 
        programAddress , 
        TOKEN_SWAP_PROGRAM_ID ,
        createAccountProgram , 
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
 
 
         const keys=[
            {pubkey: portfolioAddress.publicKey, isSigner: false, isWritable: false},
            {pubkey: userPortfolioAccount.publicKey, isSigner: false, isWritable: false},         
            {pubkey: tokenSwap, isSigner: false, isWritable: true},
            {pubkey: authority, isSigner: false, isWritable: true},  //authority 
            {pubkey: userTransferAuthority.publicKey, isSigner: true, isWritable: true},
            {pubkey: spluPRIMARY, isSigner: false, isWritable: true},
            {pubkey: managerPRIMARY, isSigner: false, isWritable: true},
            {pubkey: manager_asset1, isSigner: false, isWritable: true},
            {pubkey: splu_asset1, isSigner: false, isWritable: true},
            {pubkey: tokenPool, isSigner: false, isWritable: true},
            {pubkey: feeAccount, isSigner: false, isWritable: true},
            {pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false},
            {pubkey: tokenAccountPool, isSigner: false, isWritable: true},
            {pubkey: programAddress, isSigner: false, isWritable: false},
            {pubkey: TOKEN_SWAP_PROGRAM_ID, isSigner: false, isWritable: false},
            {pubkey: createAccountProgram.publicKey,isSigner:false,isWritable:false},
          ]
       
 
         return new TransactionInstruction({
             keys,
             programId: programId,
             data,
         });
     }
 



     /**
       * Construct a Withdraw instruction version bacem
       *
       * @param programId SPL Token program account
       * @param account Account 
       //* @ param payer Owner of the source account //jawaher
       * @param owner Owner of the source account //becem
       * @param amount Number of tokens to transfer
       * @param volatility 90/10 or 50/50 underlying asset percentage / usdc. Please refer to github.com/NovaFi for more details 
       * @param nonce once used to create valid program address 
       */
 
       static createWithdrawInstruction(
        programId,
        portfolioAddress,
        userPortfolioAccount,
        tokenSwap,
        authority ,
        userTransferAuthority,
        spluPRIMARY ,
        managerPRIMARY ,
        manager_asset1 , 
        splu_asset1 , 
        tokenPool , 
        feeAccount , 
        TOKEN_PROGRAM_ID,
        tokenAccountPool , 
        programAddress , 
        TOKEN_SWAP_PROGRAM_ID ,
        createAccountProgram , 
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
                 instruction: 18, // deposit instruction
                 amount_deposit,
                 nonce
             },
             data,
         );
 
 
         const keys=[
            {pubkey: portfolioAddress.publicKey, isSigner: false, isWritable: false},
            {pubkey: userPortfolioAccount.publicKey, isSigner: false, isWritable: false},         
            {pubkey: tokenSwap, isSigner: false, isWritable: true},
            {pubkey: authority, isSigner: false, isWritable: true},  //authority 
            {pubkey: userTransferAuthority.publicKey, isSigner: true, isWritable: true},
            {pubkey: spluPRIMARY, isSigner: false, isWritable: true},
            {pubkey: managerPRIMARY, isSigner: false, isWritable: true},
            {pubkey: manager_asset1, isSigner: false, isWritable: true},
            {pubkey: splu_asset1, isSigner: false, isWritable: true},
            {pubkey: tokenPool, isSigner: false, isWritable: true},
            {pubkey: feeAccount, isSigner: false, isWritable: true},
            {pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false},
            {pubkey: tokenAccountPool, isSigner: false, isWritable: true},
            {pubkey: programAddress, isSigner: false, isWritable: false},
            {pubkey: TOKEN_SWAP_PROGRAM_ID, isSigner: false, isWritable: false},
            {pubkey: createAccountProgram.publicKey,isSigner:false,isWritable:false},
          ]
       
 
         return new TransactionInstruction({
             keys,
             programId: programId,
             data,
         });
     }
 
 
  /**
      * Create and initialize a new account.
      *
      * This account may then be used as a `transfer()` or `approve()` destination
      *
      * @param owner User account that will own the new account
      * @return the new empty account
      */
      async createAccountReturnAccount(owner: PublicKey): Promise < Account > {
        // Allocate memory for the account
        const balanceNeeded = await Token.getMinBalanceRentForExemptAccount(
            this.connection,
        );

        const newAccount = new Account();

        const transaction = new Transaction();
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

        // Send the two instructions
        await sendAndConfirmTransaction(
            'createAccount and InitializeAccount',
            this.connection,
            transaction,
            this.payer,
            newAccount,
        )

        return newAccount;
    }

 
 /*
 
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
   /*  static createApproveUserPortfolioInstruction(
         programId: PublicKey,
         account: PublicKey,
         delegate: PublicKey,
         owner: PublicKey,
         multiSigners: Array < Account > ,
         amount: number | u64,
     ): TransactionInstruction {
         const dataLayout = BufferLayout.struct([
             BufferLayout.u8('instruction'),
             Layout.uint64('amount'),
         ]);
 
         const data = Buffer.alloc(dataLayout.span);
         dataLayout.encode({
                 instruction: 21, // Approve instruction
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
     }*/
 
     
    }