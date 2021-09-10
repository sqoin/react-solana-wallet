import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Wallet from '@project-serum/sol-wallet-adapter';
import { Connection, SystemProgram, Transaction, clusterApiUrl,PublicKey } from '@solana/web3.js';
import { mintToken, createNewAccount , createMintTo , createTransfer} from './cli/makesteps';
import { depositTokenPool } from './saber/cli/makeSteps';
import InfoAccount from './component/InfoAccount';
import  "./Saber.css"
function toHex(buffer) {
  return Array.prototype.map
    .call(buffer, (x) => ('00' + x.toString(16)).slice(-2))
    .join('');
}

function Saber() {
  const [logs, setLogs] = useState([]);
  function addLog(log) {
    setLogs((logs) => [...logs, log]);
  }

  const network = clusterApiUrl('devnet');
  const [providerUrl, setProviderUrl] = useState('https://www.sollet.io');
  const connection = useMemo(() => new Connection(network), [network]);
  const urlWallet = useMemo(() => new Wallet(providerUrl, network), [
    providerUrl,
    network,
  ]);
  const [tokenInfo, setTokenInfo] = useState("no Info");
  const injectedWallet = useMemo(() => {
    try {
      return new Wallet(window.sollet, network);
    } catch (e) {
      console.log(`Could not create injected wallet: ${e}`);
      return null;
    }
  }, [network]);
  const [selectedWallet, setSelectedWallet] = useState(undefined);
  const [, setConnected] = useState(false);
  useEffect(() => {
    if (selectedWallet) {
      selectedWallet.on('connect', () => {
        setConnected(true);
        addLog('Connected to wallet ' + selectedWallet.publicKey.toBase58());
      });
      selectedWallet.on('disconnect', () => {
        setConnected(false);
        addLog('Disconnected from wallet');
      });
      selectedWallet.connect();
      return () => {
        selectedWallet.disconnect();
      };
    }
  }, [selectedWallet]);

  async function sendTransaction() {
    try {
      let transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: selectedWallet.publicKey,
          toPubkey: selectedWallet.publicKey,
          lamports: 100,
        })
      );
      addLog('Getting recent blockhash');
      transaction.recentBlockhash = (
        await connection.getRecentBlockhash()
      ).blockhash;
      addLog('Sending signature request to wallet');
      transaction.feePayer = selectedWallet.publicKey;
      let signed = await selectedWallet.signTransaction(transaction);
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



  function doCreateAccout() {
    addLog("loading ... ");

    createNewAccount(selectedWallet, connection)
      .then(account =>
        addLog(
          JSON.stringify(account)))
      .catch(
        err => addLog("" + err)
      )
  }


  async function signMessage() {
    try {
      const message = "Please sign this message for proof of address ownership.";
      addLog('Sending message signature request to wallet');
      const data = new TextEncoder().encode(message);
      const signed = await selectedWallet.sign(data, 'hex');
      addLog('Got signature: ' + toHex(signed.signature));
    } catch (e) {
      console.warn(e);
      addLog('Error: ' + e.message);
    }
  }
  async function depositPool(){
    addLog("loading ... ");

    depositTokenPool(selectedWallet, connection)
      .then(res =>{
        console.log(res);
        addLog("**************************** Info Before Deposit ************************************")
        addLog("Info TokenAccountA before deposit = mint: "+res[0].infoBeforeA.mint.toString()+" address Account : "+res[0].infoBeforeA.address.toString()+" amount : "+res[0].infoBeforeA.amount.toNumber());
        addLog("Info TokenAccountB before deposit = mint: "+res[1].infoBeforeB.mint.toString()+" address Account : "+res[1].infoBeforeB.address.toString()+" amount : "+res[1].infoBeforeB.amount.toNumber());
        addLog("Info TokenAccountPool before deposit = mint: "+res[2].infoPoolBefore.mint.toString()+" address Account : "+res[2].infoPoolBefore.address.toString()+" amount : "+res[2].infoPoolBefore.amount.toNumber());
        addLog("**************************** Info After Deposit ************************************")
        addLog("Info TokenAccountA after deposit = mint: "+res[3].infoAfterA.mint.toString()+" address Account : "+res[3].infoAfterA.address.toString()+" amount : "+res[3].infoAfterA.amount.toNumber());
        addLog("Info TokenAccountB after deposit = mint: "+res[4].infoAfterB.mint.toString()+" address Account : "+res[4].infoAfterB.address.toString()+" amount : "+res[4].infoAfterB.amount.toNumber());
        addLog("Info TokenAccountPool after deposit = mint: "+res[5].infoPoolAfter.mint.toString()+" address Account : "+res[5].infoPoolAfter.address.toString()+" amount : "+res[5].infoPoolAfter.amount.toNumber());
       } )
      .catch(
        err => addLog("" + err)
      
      )
  }


    return (
        <div className="App">
            <div id="sidebar"><InfoAccount selectedWallet={selectedWallet} connection={connection}></InfoAccount> </div>
            <div id="content-wrap">
            <h1>SABER Demo</h1>

            <div>Network: {network}</div>
            <div>
                Waller provider:{' '}
                <input
                    type="text"
                    value={providerUrl}
                    onChange={(e) => setProviderUrl(e.target.value.trim())}
                />
            </div>
            {selectedWallet && selectedWallet.connected ? (
                <div>
                    <div>Wallet address: {selectedWallet.publicKey.toBase58()}.</div>
                    <button onClick={sendTransaction}>Send Transaction</button>
                    <button onClick={signMessage}>Sign Message</button>
                    <button onClick={() => selectedWallet.disconnect()}>Disconnect</button>
                </div>
            ) : (
                <div>
                    <button onClick={() => setSelectedWallet(injectedWallet)}>Connect to Injected Wallet</button>
                </div>
            )}
            <hr />
            <br/>
            <br/> 
             <div className="logs">
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
            <br/>
            <div>
                    <button onClick={() => depositPool()}>Deposit tokens into the pool</button>
                </div>
                </div>
        </div>
    )


}
export default Saber;