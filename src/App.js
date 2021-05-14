import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Wallet from '@project-serum/sol-wallet-adapter';
import { Connection, SystemProgram, Transaction, clusterApiUrl,PublicKey } from '@solana/web3.js';
import { mintToken, createNewAccount , createMintTo , createTransfer} from './cli/makesteps';

function toHex(buffer) {
  return Array.prototype.map
    .call(buffer, (x) => ('00' + x.toString(16)).slice(-2))
    .join('');
}

function App() {
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

  function doMintToken() {
    addLog("loading ... ");
    try {
      mintToken(selectedWallet, connection).then(token =>
        addLog(
          JSON.stringify(token)))
        .catch(
          err => addLog("" + err)
        )
    }
    catch (err) {
      addLog("" + err);
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

  function doMintTo() {
    addLog("loading ... ");

    createMintTo(selectedWallet, connection)
      .then(account =>
        addLog(
          JSON.stringify(account)))
      .catch(
        err => addLog("" + err)
      )
  }

  function doTransfer() {
    addLog("loading ... ");

    createTransfer(selectedWallet, connection)
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

  async function dogetTokensAccount() {
    let accounts = await connection
          .getParsedTokenAccountsByOwner(
            selectedWallet.publicKey,
            {
              programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
            },
            'confirmed'
          );

      addLog(JSON.stringify(accounts));
  }

  return (
    <div className="App">
      <h1>Wallet Adapter Demo</h1>
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
      <div className="logs">
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>

      <button onClick={ () => dogetTokensAccount()}>

          getTokensProgramId
      </button>
      <button onClick={() => doMintToken()}>
        Mint token
      </button>
     <br></br>
      <button onClick={() => doCreateAccout()}>
        Create Account
      </button>
      <br></br>
      <button onClick={() => doMintTo()}>
        Minto Account
      </button>
      <br></br>
      <button onClick={() => doTransfer()}>
        Transfer
      </button>

    </div>
  );
}

export default App;

