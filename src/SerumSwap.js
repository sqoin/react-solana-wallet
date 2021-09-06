
import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Wallet from '@project-serum/sol-wallet-adapter';
import { Connection, SystemProgram, Transaction, clusterApiUrl,PublicKey } from '@solana/web3.js';
import { mintTokenAStep, mintTokenBStep, createMMStep, sendLamportToMMStep, sendTokenAToMMStep, createTokenAStep, createTokenBStep, createVaultAStep, createVaultBStep, mintTokenBToVaultBStep, mintTokenAToVaultAStep } from './cli/serum-steps';
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

 async function createTokenA(){
  addLog("loading create and initialize token A ... "+selectedWallet.publicKey.toBase58());
  try {
      createTokenAStep(selectedWallet, connection).then(result =>{
       addLog("token A successfully created")
       addLog("token A pk => "+result.publicKey)
      } )
      .catch(
        err => addLog("" + err)
      )
  }
  catch (err) {
    addLog("" + err);
  }
  }

  async function createVaultA(){
    addLog("loading create and vault A ... ");
    try {
        createVaultAStep(selectedWallet).then(result =>{
         addLog("vault A successfully created")
         addLog("vault A pk => "+result.publicKey)
        } )
        .catch(
          err => addLog("" + err)
        )
    }
    catch (err) {
      addLog("" + err);
    }
    }

    async function mintTokenAToVaultA(){
      addLog("loading mint token A to vault A ... ");
      try {
        mintTokenAToVaultAStep(selectedWallet).then(result =>{
           addLog("token A successfully minted")
           addLog("mint info => "+JSON.stringify(result))
          } )
          .catch(
            err => addLog("" + err)
          )
      }
      catch (err) {
        addLog("" + err);
      }
      }

      async function createTokenB(){
        addLog("loading create and initialize token B ... ");
        try {
            createTokenBStep(selectedWallet, connection).then(result =>{
             addLog("token B successfully created")
             addLog("token B pk => "+result.publicKey)
            } )
            .catch(
              err => addLog("" + err)
            )
        }
        catch (err) {
          addLog("" + err);
        }
        }
      
        async function createVaultB(){
          addLog("loading create and vault B ... ");
          try {
              createVaultBStep(selectedWallet,connection).then(result =>{
               addLog("vault B successfully created")
               addLog("vault B pk => "+result.publicKey)
              } )
              .catch(
                err => addLog("" + err)
              )
          }
          catch (err) {
            addLog("" + err);
          }
          }
      
          async function mintTokenBToVaultB(){
            addLog("loading mint token B to vault B ... ");
            try {
              mintTokenBToVaultBStep(selectedWallet).then(result =>{
                 addLog("token B successfully minted")
                 addLog("mint info => "+JSON.stringify(result))
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
      <button onClick={ () => createTokenA()}>
          mint token A
      </button>
      <br></br>
      <button onClick={ () => createVaultA()}>
          create vault A
      </button>
      <br></br>
      <button onClick={ () => mintTokenAToVaultA()}>
          mint token A to vault A
      </button>
      <br></br>
      <button onClick={ () => createTokenB()}>
          mint token B
      </button>
      <br></br>
      <button onClick={ () => createVaultB()}>
          create vault B
      </button>
      <br></br>
      <button onClick={ () => mintTokenBToVaultB()}>
          mint token B to vault B
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
