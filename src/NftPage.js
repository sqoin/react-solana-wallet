import React, { useEffect, useMemo, useState } from 'react';

import Wallet from '@project-serum/sol-wallet-adapter';
import { Account, Connection, SystemProgram, Transaction} from '@solana/web3.js';

    import {createWithSeed ,metaUpdTitle,findProgramAddress,createAndInitializeMintWithMeta} from "./nft/utils/token-Func";
import {META_WRITER_PROGRAM_ID,TOKEN_PROGRAM_ID,ATACC_PROGRAM_ID} from "./nft/utils/pogramAdresses";


function NftPage() {
  const [logs, setLogs] = useState([]);
  function addLog(log) {
    setLogs((logs) => [...logs, log]);
  }
  const network = "https://api.devnet.solana.com";
  const [providerUrl, setProviderUrl] = useState('https://www.sollet.io');
  const connection = useMemo(() => new Connection(network), [network]);
const[title,setTitle]=useState("");
const[url,setUrl]=useState("");
const[data,setData]=useState("");
// const[mint,setMint]=useState("");
const mint=new Account();
  const amount = 1;
  const decimals = 0;
  const injectedWallet = useMemo(() => {
    try {
      console.log(network)
      //@ts-ignore
      return new Wallet(window.sollet, network);
    } catch (e) {
      console.log(`Could not create injected wallet: ${e}`);
      return null;
    }
  }, [network]);
  const [wallet, setSelectedWallet] = useState(undefined);
  const [, setConnected] = useState(false);
  useEffect(() => {
    if (wallet) {
      wallet.on('connect', () => {
        setConnected(true);
        addLog('Connected to wallet ' + wallet.publicKey.toBase58());
      });
      wallet.on('disconnect', () => {
        setConnected(false);
        addLog('Disconnected from wallet');
      });
      wallet.connect();
      return () => {
        wallet.disconnect();
      };
    }
  }, [wallet]);
  function toHex(buffer) {
    return Array.prototype.map
      .call(buffer, (x) => ('00' + x.toString(16)).slice(-2))
      .join('');
  }
  async function sendTransaction() {
    try {
      let transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: wallet.publicKey,
          lamports: 100,
        })
      );
      addLog('Getting recent blockhash');
      transaction.recentBlockhash = (
        await connection.getRecentBlockhash()
      ).blockhash;
      addLog('Sending signature request to wallet');
      transaction.feePayer = wallet.publicKey;
      let signed = await wallet.signTransaction(transaction);
      addLog('Got signature, submitting transaction');
      let signature = await connection.sendRawTransaction(signed.serialize());
      addLog('Submitted transaction ' + signature + ', awaiting confirmation');
      await connection.confirmTransaction(signature, 'singleGossip');
      addLog('Transaction ' + signature + ' confirmed');
    } catch (e) {
      console.warn(e);
      addLog('Error: ' + e.message);
    }
  }
  async function signMessage() {
    try {
      const message = "Please sign this message for proof of address ownership.";
      addLog('Sending message signature request to wallet');
      const data = new TextEncoder().encode(message);
      const signed = await wallet.sign(data, 'hex');
      addLog('Got signature: ' + toHex(signed.signature));
    } catch (e) {
      console.warn(e);
      addLog('Error: ' + e.message);
    }
  }
///////////////// FUNCTION
function toBytes(str) {
  const utf8 = unescape(encodeURIComponent(str));
  let arr = [];
  for (var i = 0; i < utf8.length; i++) {
    arr.push(utf8.charCodeAt(i));
  }
  return arr
}

async function InitializaInstruction(wallet,
  connection,
  mint,
  amount,
  decimals,
  meta){


  let txid = await createAndInitializeMintWithMeta({
    wallet,
    connection,
    mint,
    amount,
    decimals,
    meta,
  })
  console.log(txid)
}


async function setTitleFunction(){
  let txid;
  
  let meta = {}
 
  const authorPubkey = await createWithSeed(mint, 'nft_meta_author', META_WRITER_PROGRAM_ID)
  console.log("MetaAuthorAccount will be: "+authorPubkey.toString());

  // meta data - title - max 100 char UTF-8 plain text describing item

  const titlePubkey = await createWithSeed(mint, 'nft_meta_title', META_WRITER_PROGRAM_ID)
  console.log("MetaTitleAccount is: "+titlePubkey.toString());

  const titleBytes = toBytes(title)
  const uriPubkey = await createWithSeed(mint, 'nft_meta_uri', META_WRITER_PROGRAM_ID)
  const uriBytes = toBytes(url)
  const dataPubkey = await createWithSeed(mint, 'nft_meta_data', META_WRITER_PROGRAM_ID)
  console.log("MetaDataAccount will be: "+dataPubkey.toString());
  const dataBytes = toBytes(data)
  meta.authorPubkey = authorPubkey
  meta.titlePubkey = titlePubkey
  meta.titleBytes = titleBytes
   meta.uriPubkey = uriPubkey
   meta.uriBytes = uriBytes

  meta.dataPubkey = dataPubkey 
  meta.dataBytes = dataBytes



  const tpa = await findProgramAddress( [ wallet.publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.publicKey.toBuffer() ], ATACC_PROGRAM_ID)
  const taccPK = tpa.PK; 
  const taccSeeds = tpa.seeds; 

  

let tx=InitializaInstruction( wallet,
  connection,
  mint,
  amount,
  decimals,
  meta)

 
console.log("metaauthor",meta.authorPubkey.toBase58())
    //try {
      txid = await metaUpdTitle({
        wallet,
        connection,
        mint,
        meta,
      })
    // } catch (error) {
    //   //playVideo(false)
    //   console.log("REJECTED - was not submitted (probably because transaction simulation failed; funds? recentblockhash?)")
    //   console.log(error)
    //   //document.getElementById('status')!.innerHTML = "Title update transaction rejected: "+error.toString()
    //   return
    // } 

    console.log("Title set tx:"+txid)

    // wait for transaction to be mined

  let  tStatus = await connection.confirmTransaction(txid)

    if (tStatus.value.err) {
     // playVideo(false)
      console.log("FAILED - by node (node ran program but program failed)")
      console.log(tStatus.value.err)
      //document.getElementById('status')!.innerHTML = "Title update transaction "+txid+" failed: "+tStatus.value.err
      return
    }

    console.log("Title set done")



}
async function setUrlFunction(){
  const mint=new Account();
  const uriPubkey = await createWithSeed(mint, url, META_WRITER_PROGRAM_ID)
  console.log("MetaURIAccount will be: "+uriPubkey.toString());
  addLog("MetaURIAccount will be: "+uriPubkey.toString())

}

async function setDataFunction(){
  const dataPubkey = await createWithSeed(mint, data, META_WRITER_PROGRAM_ID)
  console.log("MetaDataAccount will be: "+dataPubkey.toString());

  addLog("MetaDataAccount will be: : "+dataPubkey.toString())
}

async function mintNftFunction(){

}
async function transfertNftFunction(){
  const chunkSize = 957 
  const numChunks = Math.ceil(data.length / chunkSize)


  for(let chunk=0; chunk<numChunks; chunk++) {

    console.log("Write chunk "+ (chunk+1) +" of "+numChunks)

    let processed = false;

    while( !processed ) {

  
          txid = await metaUpdData({
            wallet,
            connection,
            mint,
            meta,
            chunkSize,
            chunk
          })
       

        console.log("Data set tx:"+txid)

        // wait for transaction to be mined

  
          tStatus = await connection.confirmTransaction(txid)
      

            // wasn't found after 30 seconds, probably got dropped
            // need to make new transaction and submit it
            // does not happen often....

            console.log("Transaction not found in ledger after 30 seconds, try with new transaction")
            continue
        }

        processed = true

        if (tStatus.value.err) {
            playVideo(false)
            console.log("FAILED - by node (node ran program but program failed)")
            console.log(tStatus.value.err)
           
            return
        }
    }

    console.log("Data set done "+ (chunk+1) +" of "+numChunks);
}


 

  return (
    <div className="App" id="main-wrap" >

      <h1>NftTest Interface</h1>
        <div>Network: {network}</div>
        <div>
          Waller provider:{' '}
          <input
            type="text"
            value={providerUrl}
            onChange={(e) => setProviderUrl(e.target.value.trim())}
          />
        </div>
        <br></br>
        {wallet && wallet.connected ? (
          <div>
            <div>Wallet address: {wallet.publicKey.toBase58()}.</div>
            <button onClick={sendTransaction}>Send Transaction</button>
            <button onClick={signMessage}>Sign Message</button>
            <button onClick={() => wallet.disconnect()}>Disconnect</button>
          </div>
        ) : (

          <div>
            <button onClick={() => setSelectedWallet(injectedWallet)} className="btn btn-primary"> Connect using sollet plugin</button>
          </div>
        )}
        <hr />
        <div className="logs">
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>

<br></br>
title <input onChange={(e)=> setTitle(e.target.value)} value={title}/>
<button onClick={() => setTitleFunction()} className="btn btn-primary" > set title</button>
<br></br>
<br></br>
<br></br>
<br></br>
 url <input onChange={(e)=> setUrl( e.target.value)} value={url}/>
<button onClick={() => setUrlFunction()} className="btn btn-primary" > set url</button>
<br></br>
<br></br>
<br></br>
<br></br>
 data <textarea onChange={(e)=> setData( e.target.value)} value={data}/>
<button onClick={() => setDataFunction()} className="btn btn-primary" > set  data</button>
<br></br>
<br></br>
<br></br>
<br></br>
{/* mint <input onChange={(e)=> setMint( e.target.value)} value={mint}/> */}
<button onClick={() => mintNftFunction()} className="btn btn-primary" > mint Nft</button>
<br></br>
<br></br>
<br></br>
<br></br>
<button onClick={() => transfertNftFunction()} className="btn btn-primary" > transfert Nft</button>
 
    </div>
  );



}

export default NftPage;