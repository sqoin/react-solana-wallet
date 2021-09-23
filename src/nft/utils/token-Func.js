import {
    PublicKey,
    Transaction,
    TransactionInstruction,
    
  } from '@solana/web3.js';

  import {
    
    META_WRITER_PROGRAM_ID,
  } from './pogramAdresses'
export async function createWithSeed( base, seed, programId ) {
    return PublicKey.createWithSeed(base.publicKey, seed, programId)
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
    
      return txid;
  }
  export async function findProgramAddress( seeds, programId ) {
    const [ PK, nonce ] = await PublicKey.findProgramAddress( seeds, programId )
    const newSeeds = seeds.concat(Buffer.from([nonce]))
    return { PK, seeds: newSeeds }
  }