
import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Wallet from '@project-serum/sol-wallet-adapter';
import { Connection, SystemProgram, Transaction, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { createMMStep, sendLamportToMMStep, sendTokenToMMStep, createTokenStep, createVaultStep, mintTokenToVaultStep, createMarketStep, swapAtoBStep, placeOrderStep } from './cli/serum-steps';
import InfoAccount from './component/InfoAccount';
import "./Saber.css"
import {  stake,claimRewards,withdrow} from './quarry-farm/quarry-steps';
import { claimRewardsCPI } from './quarry-farm/cpi-quarry-api';
function toHex(buffer) {
  return Array.prototype.map
    .call(buffer, (x) => ('00' + x.toString(16)).slice(-2))
    .join('');
}

function CPIQuarryFarm() {
  const [logs, setLogs] = useState([]);
  function addLog(log) {
    setLogs((logs) => [...logs, log]);
  }
  // const network = "http://127.0.0.1:8899";
  const network = clusterApiUrl('devnet');
  const [providerUrl, setProviderUrl] = useState('https://www.sollet.io');
  const connection = useMemo(() => new Connection(network), [network]);
  const urlWallet = useMemo(() => new Wallet(providerUrl, network), [
    providerUrl,
    network,
  ]);
  const [idTransactionStake,setIdTransaction]=useState();
  const [idTransactionClaim,setIdTransactionClaim]=useState();
  const [idTransactionWithdrow,setIdTransactionWithdrow]=useState();
  const injectedWallet = useMemo(() => {
    try {
      return new Wallet(window.sollet, network);
    } catch (e) {

      return null;
    }
  }, [network]);
  const [selectedWallet, setUserWallet] = useState(undefined);
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



  async function stakeCPI() {
    addLog("stake into quarry ... ");
    try {
      //createTokenStep(selectedWallet, connection).then(result =>{
      stake(selectedWallet, connection).then(result =>{
        setIdTransaction(result);
       addLog("staked token successfully")
      
      } )
      .catch(
        err => addLog("" + err)
      )
  }
  catch (err) {
    addLog("" + err);
  }

  }

  async function claimReward() {
    addLog("loading claim reward ... ");
    try {
      //createTokenStep(selectedWallet, connection).then(result =>{
        claimRewards(selectedWallet, connection).then(result =>{
       
       addLog("claim reward successfully")
       setIdTransactionClaim(result);
      } )
      .catch(
        err => addLog("" + err)
      )
  }
  catch (err) {
    addLog("" + err);
  }
  }




  async function withdrawCPI() {
    addLog("loading withdraw from quarry ... ");
    try {
      //createTokenStep(selectedWallet, connection).then(result =>{
        withdrow(selectedWallet, connection).then(result =>{
       
       addLog("wothdrow successfully");
      
       setIdTransactionWithdrow(result);
      } )
      .catch(
        err => addLog("" + err)
      )
  }
  catch (err) {
    addLog("" + err);
  }
  }
  function createDynamicURLS() {
    window.open(`https://explorer.solana.com/tx/${idTransactionStake}?cluster=devnet`, '_blank', 'resizable=yes')

  }
  function createDynamicURLC() {
    window.open(`https://explorer.solana.com/tx/${idTransactionClaim}?cluster=devnet`, '_blank', 'resizable=yes')

  }
  function createDynamicURLW() {
    window.open(`https://explorer.solana.com/tx/${idTransactionWithdrow}?cluster=devnet`, '_blank', 'resizable=yes')

  }
  return (
    <div className="App">
      <div id="sidebar"><InfoAccount selectedWallet={selectedWallet} connection={connection}></InfoAccount> </div>
      <div id="content-wrap">
        <h1>cross program invocation : Quarry Farm Demo</h1>
        <div>Network: {network}</div>
        <div>
          Waller provider:{' '}
          <input
            type="text"
            value={providerUrl}
            onChange={(e) => setProviderUrl(e.target.value.trim())}
          />
        </div>
        {selectedWallet&& selectedWallet.connected ? (
          <div>
            <div>Wallet address: {selectedWallet.publicKey.toBase58()}.</div>
          </div>
        ) : (
          <div>
            <button onClick={() => setUserWallet(injectedWallet)}>Connect to Injected Wallet</button>
          </div>
        )}
        <hr />
       
        <p>Token Account :  EdzJ26wBCnybeoCLutKdBj1q9uwhtd3a9vrUEvTL2J4N</p>
        <p>Lp Token : 8W3TeEaBhZJPQsDVzd24zocJEuZdbviXRyjDb6PPM72N</p> 
        <br></br>
        <div className="logs">
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      {idTransactionStake&& <a onClick={createDynamicURLS} >Transaction in Explora Solana</a>}  
        <br></br>
        <button onClick={() => stakeCPI()}>
          Stake
        </button>
        <br></br>
        <br></br>
        {idTransactionClaim&& <a onClick={createDynamicURLC} >Transaction in Explora Solana</a>}  
        <br></br>
        <button onClick={() => claimReward()}>
          Claim reward
        </button>
        <br></br>
        <br></br>
        {idTransactionWithdrow&& <a onClick={createDynamicURLW} >Transaction in Explora Solana</a>}  
        <br></br>
        <button onClick={() => withdrawCPI()}>
          withdraw from quarry
        </button>
        <br></br>

      </div>
    </div>

  );
}

export default CPIQuarryFarm;
