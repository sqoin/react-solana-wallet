
import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Wallet from '@project-serum/sol-wallet-adapter';
import { Connection, SystemProgram, Transaction, clusterApiUrl,PublicKey } from '@solana/web3.js';
import { mintTokenAStep, mintTokenBStep, createMMStep, sendLamportToMMStep, sendTokenAToMMStep } from './cli/serum-steps';
import { sendTokenAToMMApi, sendTokenToMMApi } from './cli/serum-api';

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
  
  
const [mintA,setMintA]=useState("")
const [accountA,setAccountA]=useState("")
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

 async function mintTokenA(){
  addLog("loading create and initialize token A ... ");
  addLog("loading create and initialize vault A account ... ");
  addLog("loading mint 100 token A into vault A account ... ");
  try {
      mintTokenAStep(selectedWallet, connection).then(result =>{
       addLog("token A successfully minted")
       addLog("token A pk"+JSON.stringify(result.tokenA))
       addLog("vault A pk"+JSON.stringify(result.vaultA))
      } )
      .catch(
        err => addLog("" + err)
      )
     
  }
  catch (err) {
    addLog("" + err);
  }
  }

  async function mintTokenB(){
    addLog("loading create and initialize token B ... ");
    addLog("loading create and initialize vault B account ... ");
    addLog("loading mint 100 token B into vault B account ... ");
    try {
        mintTokenBStep(selectedWallet, connection).then(result =>{
         addLog("token B successfully minted")
         addLog("token B pk"+JSON.stringify(result.tokenB))
         addLog("vault B pk"+JSON.stringify(result.vaultB))
        } )
        .catch(
          err => addLog("" + err)
        )
       
    }
    catch (err) {
      addLog("" + err);
    }
    }

    async function createMM(){
      addLog("loading create Market maker ... ");
      try {
          createMMStep(selectedWallet, connection).then(result =>{
           addLog("Market maker successfully created =>"+JSON.stringify(result))
          } )
          .catch(
            err => addLog("" + err)
          )
         
      }
      catch (err) {
        addLog("" + err);
      }
      }

      async function sendLamportToMM(){
        addLog("loading send lamport to Market maker ... ");
        try {
          sendLamportToMMStep(selectedWallet, connection).then(result =>{
             addLog("Success =>"+JSON.stringify(result))
            } )
            .catch(
              err => addLog("" + err)
            )
           
        }
        catch (err) {
          addLog("" + err);
        }
        }

        async function sendTokenAToMM(){
          addLog("loading send token A to Market maker ... ");
          try {
            sendTokenAToMMStep(selectedWallet, connection).then(result =>{
               addLog("Success =>"+JSON.stringify(result))
              } )
              .catch(
                err => addLog("" + err)
              )
             
          }
          catch (err) {
            addLog("" + err);
          }
          }


  return(
<div className="App">
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
      <button onClick={ () => mintTokenA()}>
          mint token A
      </button>
      <br></br>
      <button onClick={ () => mintTokenB()}>
          mint token B
      </button>
      <br></br>
      <button onClick={ () => createMM()}>
          create market maker
      </button>
      <br></br>
      <button onClick={ () => sendLamportToMM()}>
          send lamport to market maker
      </button>
      <br></br>
      <button onClick={ () => sendTokenAToMM()}>
          send 10 of token A to market maker
      </button>
      <br></br>
    </div>
    
  );
}

export default SerumSwap;
