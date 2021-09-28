import {
    PublicKey,
    Transaction,
    TransactionInstruction,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    
  } from '@solana/web3.js';

  import {
    
    META_WRITER_PROGRAM_ID,
    TOKEN_PROGRAM_ID,ATACC_PROGRAM_ID
  } from './pogramAdresses'

import {
  MINT_LAYOUT
} from './tokenLayout'

import {
  initializeMint,mintTo
}
from "./tokenInstruction"

export async function createWithSeed( base, seed, programId ) {
    return PublicKey.createWithSeed(base.publicKey, seed, programId)
  }

  function toBytesBE( x ){
    var bytes = [];
    var i = 4;
    do {
    bytes[--i] = x & (255);
    x = x>>8;
    } while ( i )
    return bytes;
}
  export async function createAndInitializeMintWithMeta({
    wallet,
    connection,
    mint,             // Account to hold token information
    amount,           // Number of tokens to issue
    decimals,
    meta,             // metadata
  }) {
    let transaction = new Transaction();
  
    /***************************
     * Create and initialize the mint
     */
  
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mint.publicKey,
        lamports: await connection.getMinimumBalanceForRentExemption(
          MINT_LAYOUT.span,
        ),
        space: MINT_LAYOUT.span,
        programId: TOKEN_PROGRAM_ID,
      }),
    );
    transaction.add(
      initializeMint({
        mint: mint.publicKey,
        decimals,
        mintAuthority: wallet.publicKey,
      }),
    );
  
    /************************************************
     * create and initialize metadata accounts
     */
  
    if (meta) {
  
      // create and initialize the author meta account
  
      const SYSTEM_PROGRAM_ID = SystemProgram.programId;
  
      let instruction_data = new Uint8Array(7)
     
      // first byte: 1 = initialization
   
      instruction_data[0] = 1;
  
      // second byte: number of bytes in title (max 100) 
   
      instruction_data[1] = meta.titleBytes.length;
  
      // third byte: number of bytes in URI (max 100) 
   
      instruction_data[2] = meta.uriBytes.length;
  
      // 4,5,6,7 bytes: number of bytes in data (big endian) (max 10000) 
   
      const dataBytesBE = toBytesBE(meta.dataBytes.length)
      instruction_data[3] = dataBytesBE[0]
      instruction_data[4] = dataBytesBE[1]
      instruction_data[5] = dataBytesBE[2]
      instruction_data[6] = dataBytesBE[3]
  
      console.log("Invoking contract: "+META_WRITER_PROGRAM_ID)
  
      const metaInitInstruction = new TransactionInstruction({
        keys: [
                 {pubkey: wallet.publicKey, isSigner: true, isWritable: false}, 
                 {pubkey: mint.publicKey, isSigner: true, isWritable: false},         
                 {pubkey: meta.authorPubkey, isSigner: false, isWritable: true},         
                 {pubkey: meta.titlePubkey, isSigner: false, isWritable: true},         
                 {pubkey: meta.uriPubkey, isSigner: false, isWritable: true},         
                 {pubkey: meta.dataPubkey, isSigner: false, isWritable: true},         
                 {pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false}, 
                 {pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
              ],
        programId: META_WRITER_PROGRAM_ID,
        data: instruction_data,
      })
  
      transaction.add( metaInitInstruction )
    }
  
  
    /***********************************
     * create and initialize a token account
     * for the users wallet
     */
  
    const pa = await findProgramAddress( [ wallet.publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.publicKey.toBuffer() ], ATACC_PROGRAM_ID);
    const taccPK = pa.PK;
    const taccSeeds = pa.seeds;
  
    if (amount > 0) {
  
      const SYSTEM_PROGRAM_ID = SystemProgram.programId;
      transaction.add({
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: taccPK, isSigner: false, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: false, isWritable: false },
          { pubkey: mint.publicKey, isSigner: false, isWritable: false },
          { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        ],
        data: Buffer.alloc(0), 
        programId: ATACC_PROGRAM_ID,
      })
  
  
      /****************************
      * mint 1 token to the tacc
      */
   
      transaction.add(
        mintTo({
          mint: mint.publicKey,
          destination: taccPK,
          amount,
          mintAuthority: wallet.publicKey,
        }),
      );
    }
  
    /*********************
    * sign and send
    */
  
    const { blockhash, feeCalculator } = await connection.getRecentBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = wallet.publicKey;
    console.log("mint"+mint)
    transaction.partialSign(...[mint]);
    let signed = await wallet.signTransaction(transaction);
  
    let txid =  await connection.sendRawTransaction(signed.serialize(), {
      preflightCommitment: 'single',
    });
    
    let tStatus = await connection.confirmTransaction(txid)
    return txid;
  }


  export async function metaUpdTitle({
    wallet,
    connection,
    mint,           
    meta,    
  }) {
      let transaction = new Transaction();
  
      let instruction_data = [2].concat(meta.titleBytes)
     
      console.log("Invoking contract for title update: "+META_WRITER_PROGRAM_ID)
      console.log("meta.authorPubkey "+meta.authorPubkey)
      const metaUpdTitleInstruction = new TransactionInstruction({
        keys: [
                 {pubkey: wallet.publicKey, isSigner: true, isWritable: false}, 
                 {pubkey: mint.publicKey, isSigner: false, isWritable: false},         
                 {pubkey: meta.authorPubkey, isSigner: false, isWritable: false},         
                 {pubkey: meta.titlePubkey, isSigner: false, isWritable: true},         
              ],
        programId: META_WRITER_PROGRAM_ID,
        data: instruction_data,
      })
  
      transaction.add( metaUpdTitleInstruction )
  
      const { blockhash, feeCalculator } = await connection.getRecentBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = wallet.publicKey;
      console.log("wallet"+wallet.publicKey)
      let signed = await wallet.signTransaction(transaction);
      console.log("connection"+wallet.publicKey)
      let txid =  await connection.sendRawTransaction(signed.serialize(), {
        preflightCommitment: 'single',
      });
    let tStatus = await connection.confirmTransaction(txid)
      return txid;
  }
  export async function findProgramAddress( seeds, programId ) {
    const [ PK, nonce ] = await PublicKey.findProgramAddress( seeds, programId )
    const newSeeds = seeds.concat(Buffer.from([nonce]))
    return { PK, seeds: newSeeds }
  }
  export async function metaUpdURI({
    wallet,
    connection,
    mint,           
    meta,    
  }) {
      let transaction = new Transaction();
  
      let instruction_data = [3].concat(meta.uriBytes)
     
      console.log("Invoking contract for uri update: "+META_WRITER_PROGRAM_ID)
  
      const metaUpdURIInstruction = new TransactionInstruction({
        keys: [
                 {pubkey: wallet.publicKey, isSigner: true, isWritable: false}, 
                 {pubkey: mint.publicKey, isSigner: false, isWritable: false},         
                 {pubkey: meta.authorPubkey, isSigner: false, isWritable: false},         
                 {pubkey: meta.uriPubkey, isSigner: false, isWritable: true},         
              ],
        programId: META_WRITER_PROGRAM_ID,
        data: instruction_data,
      })
  
      transaction.add( metaUpdURIInstruction )
  
      const { blockhash, feeCalculator } = await connection.getRecentBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = wallet.publicKey;
      let signed = await wallet.signTransaction(transaction);
  
      let txid =  await connection.sendRawTransaction(signed.serialize(), {
        preflightCommitment: 'single',
      });
    
      return txid;
  }

  export async function metaUpdData({
    wallet,
    connection,
    mint,           
    meta,    
    chunkSize,
    chunk,
  }) {
      let transaction = new Transaction()
  
      const startPosition = chunk * chunkSize
  
      const endPosition = Math.min(startPosition+chunkSize, meta.dataBytes.length)
  
      const chunkBytes = meta.dataBytes.slice(startPosition, endPosition)
  
      let instruction_data = [4].concat(toBytesBE(startPosition)).concat(chunkBytes)
     
      console.log("Invoking contract for data update: "+META_WRITER_PROGRAM_ID+" start: "+startPosition+" end: "+endPosition)
  
      const metaUpdDataInstruction = new TransactionInstruction({
        keys: [
                 {pubkey: wallet.publicKey, isSigner: true, isWritable: false}, 
                 {pubkey: mint.publicKey, isSigner: false, isWritable: false},         
                 {pubkey: meta.authorPubkey, isSigner: false, isWritable: false},         
                 {pubkey: meta.dataPubkey, isSigner: false, isWritable: true},         
              ],
        programId: META_WRITER_PROGRAM_ID,
        data: instruction_data,
      })
  
      transaction.add( metaUpdDataInstruction )
  
      const { blockhash, feeCalculator } = await connection.getRecentBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = wallet.publicKey;
      let signed = await wallet.signTransaction(transaction);
  
      let txid =  await connection.sendRawTransaction(signed.serialize(), {
        preflightCommitment: 'single', skipPreflight: true,
      });
    
      return txid;
  }