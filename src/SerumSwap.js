
import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import './SerumSwap.css';
import Wallet from '@project-serum/sol-wallet-adapter';
import { Connection, SystemProgram, Transaction, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { createMMStep, sendLamportToMMStep, sendTokenToMMStep, createTokenStep, createVaultStep, mintTokenToVaultStep, createMarketStep, swapAtoBStep, placeOrderStep } from './cli/serum-steps';
import InfoAccount from './component/InfoAccount';
import "./Saber.css"
function toHex(buffer) {
  return Array.prototype.map
    .call(buffer, (x) => ('00' + x.toString(16)).slice(-2))
    .join('');
}

function SerumSwap() {
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
  const [tokenAPk, setTokenAPk] = useState("5GXovGM3K9aGWrHmPmrckVA982oyUGJm7PKgBxLC1DiE")

  const [tokenBPk, setTokenBPk] = useState("47KPT4TiEsQHLESCR4QgJ64CqUD1Tp1eZZrBcmHdFDRt")
  const [vaultA, setVaultA] = useState("CmZTSNtXcB2Zd4kdaRQ9hHqHL72PM5vq22dWi9ZCXoRZ")
  const [vaultB, setVaultB] = useState("AHs1kfbKbKBmyxGtBmY8yB9nqRttEcqSTSaBvKwRyohj")
  const [MM, setMM] = useState("7JEgyXdQuzxbx9zzPwnu4oE6usz5Y9csVH6Xma4zf9i1")
  const [mmTokenAPk, setMmTokenAPk] = useState("5fqQXQxqsuC8Jvczb15THzfNw55wYX2CD2gV9uRjivBT")
  const [mmTokenBPk, setMmTokenBPk] = useState("6DR7EBRJkGsudLqVPqQ6yoCy25piBCxo9N9qv1J1bQKU")
  const [market, setMarket] = useState("9tACHMVaFrFskMgsQXoWdX78Cqvw3sKxpX6p1v7JZotk")
  const [mintA, setMintA] = useState("")
  const [accountA, setAccountA] = useState("")






  const injectedWallet = useMemo(() => {
    try {
      return new Wallet(window.sollet, network);
    } catch (e) {

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

  async function createTokenA() {
    addLog("loading create token A ... ");
    try {
      createTokenStep(selectedWallet, connection).then(result => {
        setTokenAPk(result.publicKey)
        addLog("token A successfully created")
        addLog("token A pk => " + result.publicKey)
      })
        .catch(
          err => addLog("" + err)
        )
    }
    catch (err) {
      addLog("" + err);
    }
  }

  async function createVaultA() {
    let tokenA = tokenAPk
    addLog("loading create vault A ... ");
    try {
      createVaultStep(selectedWallet, connection, tokenA).then(result => {
        setVaultA(result)
        addLog("vault A successfully created")
        addLog("vault A pk => " + result)
      })
        .catch(
          err => addLog("" + err)
        )
    }
    catch (err) {
      addLog("" + err);
    }
  }

  async function mintTokenAToVaultA() {
    let tokenA = tokenAPk;
    let vault_A=vaultA;
    addLog("loading mint token A to vault A ... ");
    try {
      mintTokenToVaultStep(selectedWallet, connection, vault_A, tokenA).then(result => {
        addLog("token A successfully minted")
        //addLog("mint info => "+JSON.stringify(result))
      })
        .catch(
          err => addLog("" + err)
        )
    }
    catch (err) {
      addLog("" + err);
    }
  }

  async function createTokenB() {
    addLog("loading create token B ... ");
    try {
      createTokenStep(selectedWallet, connection).then(result => {
        setTokenBPk(result.publicKey)
        addLog("token B successfully created")
        addLog("token B pk => " + result.publicKey)
      })
        .catch(
          err => addLog("" + err)
        )
    }
    catch (err) {
      addLog("" + err);
    }
  }

  async function createVaultB() {
    let tokenBpk = tokenBPk
    addLog("loading create vault B ... ");
    try {
      createVaultStep(selectedWallet, connection, tokenBpk).then(result => {
        setVaultB(result)
        addLog("vault B successfully created")
        addLog("vault B pk => " + result)
      })
        .catch(
          err => addLog("" + err)
        )
    }
    catch (err) {
      addLog("" + err);
    }
  }

  async function mintTokenBToVaultB() {
    let tokenBpk = tokenBPk;
    let vault_B=vaultB;
    addLog("loading mint token B to vault B ... ");
    try {
      mintTokenToVaultStep(selectedWallet, connection, vault_B, tokenBpk).then(result => {
        addLog("token B successfully minted")
        //addLog("mint info => "+JSON.stringify(result))
      })
        .catch(
          err => addLog("" + err)
        )
    }
    catch (err) {
      addLog("" + err);
    }
  }


  async function createMM() {
    addLog("loading create Market maker ... ");
    try {
      createMMStep(selectedWallet, connection).then(result => {
        setMM(result)
        addLog("Market maker successfully created =>" + result)
      })
        .catch(
          err => addLog("" + err)
        )
    }
    catch (err) {
      addLog("" + err);
    }
  }

  async function sendLamportToMM() {
    
    addLog("loading send lamport to Market maker ... ");
    try {
      sendLamportToMMStep(selectedWallet, connection, MM).then(result => {
        addLog("Success")
      })
        .catch(
          err => addLog("" + err)
        )
    }
    catch (err) {
      addLog("" + err);
    }
  }

  async function sendTokenAToMM() {
    addLog("loading send token A to Market maker ... ");
    try {
      sendTokenToMMStep(selectedWallet, connection, tokenAPk, vaultA, MM).then(result => {
        setMmTokenAPk(result)
        addLog("MM vault A => " + result)
      })
        .catch(
          err => addLog("" + err)
        )
    }
    catch (err) {
      addLog("" + err);
    }
  }

  async function sendTokenBToMM() {
    addLog("loading send token B to Market maker ... ");
    try {
      sendTokenToMMStep(selectedWallet, connection, tokenBPk, vaultB, MM).then(result => {
        setMmTokenBPk(result)
        addLog("MM vault B => " + result)
      })
        .catch(
          err => addLog("" + err)
        )
    }
    catch (err) {
      addLog("" + err);
    }
  }

  async function createMarket() {
    addLog("loading create market ... ");
    let tokenBpk = tokenBPk;
    let tokenApk = tokenAPk;
    // let token1="ADAe3czP7GFMz7rESQXNxi95y48gwW7Ce1SEaW7dPqLV"
    // let token2="9uXCxpq3gD1uqXbwxtNmq24Wk8LXmG68LXHfnWsCUopP"
    try {
      createMarketStep(selectedWallet, connection, tokenApk, tokenBpk, 100, 100, 0).then(result => {
        setMarket(result)
        addLog("Success => " + result)
      })
        .catch(
          err => addLog("" + err)
        )
    }
    catch (err) {
      addLog("" + err);
    }
  }

  async function placeOrderSell() {
  console.log(market)
  console.log(MM)

  console.log(mmTokenAPk)

    let side = "sell"
    addLog("loading place order ... ");
    try {
      placeOrderStep(selectedWallet, connection, market, MM, mmTokenAPk, side).then(result => {

        addLog("Success =>" + JSON.stringify(result))
      })
        .catch(
          err => {
            addLog("" + err)
            //throw(err)
          }
        )
    }
    catch (err) {
      addLog("" + err);
      //throw(err)
    }
  }

  async function placeOrderBuy() {
    // let market1="Br7nqKhynZqJwHv2jGjLG454RGt3f14KJeJQmrt6aMMS"
    let side = "buy"
    addLog("loading place order ... ");
    try {
      placeOrderStep(selectedWallet, connection, market, MM, mmTokenBPk, side).then(result => {
        // placeOrderStep(selectedWallet, connection, market, MM, tokenAPk,tokenBPk).then(result =>{
        // setMarket(result) 
        addLog("Success =>" + JSON.stringify(result))
      })
        .catch(
          err => {
            addLog("" + err)
            //throw(err)
          }
        )
    }
    catch (err) {
      addLog("" + err);
      //throw(err)
    }
  }

  async function swapAtoB() {

    addLog("loading swap B to A... ");
    try {
      console.log("maarket" + market)
      swapAtoBStep(selectedWallet, connection, market, tokenAPk, tokenBPk, vaultA, vaultB).then(result => {
        addLog("Success =>" + result)
      })
        .catch(
          err => addLog("" + err)
        )
    }
    catch (err) {
      addLog("" + err);
    }
  }


  return (
    <div className="App">
      <div id="sidebar"><InfoAccount selectedWallet={selectedWallet} connection={connection}></InfoAccount> </div>
      <div id="content-wrap">
        <h1>Serum Demo</h1>
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
   
   
      
        <br></br>
        <input  className="textType"  type="text" onChange={(e) => setTokenAPk(e.target.value)} value={tokenAPk}  /> 
        <button onClick={() => createTokenA()}>
          create token A
        </button>
        <br></br>


        <input  className="textType"  type="text" onChange={(e) => setVaultA(e.target.value)} value={vaultA}  /> 


        
        <button onClick={() => createVaultA()}>
          create vault A
        </button>
        <br></br>


        <button onClick={() => mintTokenAToVaultA()}>
          mint token A to vault A
        </button>
        <br></br>
        <input  className="textType"  type="text" onChange={(e) => setTokenBPk(e.target.value)} value={tokenBPk}  /> 

        <button onClick={() => createTokenB()}>
          create token B
        </button>
        <br></br>
        <input  className="textType"  type="text" onChange={(e) => setVaultB(e.target.value)} value={vaultB}  /> 

        <button onClick={() => createVaultB()}>
          create vault B
        </button>
        <br></br>
        <button onClick={() => mintTokenBToVaultB()}>
          mint token B to vault B
        </button>
        <br></br>




        <input   className="textType"   type="text" onChange={(e) => setMarket(e.target.value)} value={market}  />   
        <button onClick={() => createMarket()}>
          create serum dex Market for tokenA/tokenB pool
        </button>
        <br></br>
        <input    className="textType"  type="text" onChange={(e) => setMM(e.target.value)} value={MM}  /> 
        <button onClick={() => createMM()}>
          create market maker
        </button>
        <br></br>
        <button onClick={() => sendLamportToMM()}>
          send lamport to market maker
        </button>
        <br></br>
        <input  className="textType"   className="textType"  type="text" onChange={(e) => setMmTokenAPk(e.target.value)} value={mmTokenAPk}  /> 

        <button onClick={() => sendTokenAToMM()}>
          send 10 of token A to market maker
        </button>
        <br></br>
        <input   className="textType"  type="text" onChange={(e) => setMmTokenBPk(e.target.value)} value={mmTokenBPk}  /> 

        <button onClick={() => sendTokenBToMM()}>
          send 10 of token B to market maker
        </button>
        <br></br>
        <button onClick={() => placeOrderSell()}>
          place order to sell token A
        </button>
        <br></br>
        <button onClick={() => placeOrderBuy()}>
          place orders to buy token B
        </button>
        <br></br>
        <button onClick={() => swapAtoB()}>
          swap B to A
        </button>
        <br></br>
      </div>
    </div>

  );
}

export default SerumSwap;
