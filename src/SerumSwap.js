
import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Wallet from '@project-serum/sol-wallet-adapter';
import { Connection, SystemProgram, Transaction, clusterApiUrl,PublicKey } from '@solana/web3.js';
import { createMMStep, sendLamportToMMStep, sendTokenToMMStep, createTokenStep, createVaultStep, mintTokenToVaultStep, createMarketStep, swapAtoBStep } from './cli/serum-steps';

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
const [tokenAPk,setTokenAPk]=useState("")
const [tokenBPk,setTokenBPk]=useState("")
const [vaultA,setVaultA]=useState("")
const [vaultB,setVaultB]=useState("")
const [MM,setMM]=useState("")
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
      createTokenStep(selectedWallet, connection).then(result =>{
       setTokenAPk(result.publicKey)
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
    addLog("loading create vault A ... ");
    try {
        createVaultStep(selectedWallet, connection, tokenAPk).then(result =>{
          setVaultA(result)
         addLog("vault A successfully created")
         addLog("vault A pk => "+result)
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
        mintTokenToVaultStep(selectedWallet, connection, vaultA, tokenAPk).then(result =>{
           addLog("token A successfully minted")
           //addLog("mint info => "+JSON.stringify(result))
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
            createTokenStep(selectedWallet, connection).then(result =>{
             setTokenBPk(result.publicKey)
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
              createVaultStep(selectedWallet,connection, tokenBPk).then(result =>{
               setVaultB(result)
               addLog("vault B successfully created")
               addLog("vault B pk => "+result)
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
              mintTokenToVaultStep(selectedWallet, connection, vaultB, tokenBPk).then(result =>{
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
            setMM(result)
           addLog("Market maker successfully created =>"+result)
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
          sendLamportToMMStep(selectedWallet, connection, MM).then(result =>{
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
            sendTokenToMMStep(selectedWallet, connection, tokenAPk,vaultA, MM).then(result =>{
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

          async function sendTokenBToMM(){
            addLog("loading send token B to Market maker ... ");
            try {
              sendTokenToMMStep(selectedWallet, connection, tokenBPk,vaultB, MM).then(result =>{
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

            async function createMarket(){
              addLog("loading create market ... ");
              try {
                createMarketStep(selectedWallet, connection, tokenAPk,tokenBPk,100000,100,0).then(result =>{
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

              async function swapAtoB(){
                let market1="2D5miXKig4GVnyyBUcHUxcxxgscdT7yMi3L72huyU619"
                let tokenPk1="DCYcuWGgNJ6DxD1qCwKNpMErUEsP3RCHHfEfSQFXh3cw"
                let vault1="GDVsybnAob7B8Y3zyHWbPthdHBbUTC4TpQFoq5nZXxv4"
                let tokenPk2="FJXXae55SGkMrodYCNcCVLMZu8wM3vn6exHQvraBpQRX"
                let vault2="Fc5nUr2do5vRanheAyZR4vY5Fq7gnWWH48z4ayRynZkx"
                addLog("loading swap A to B... ");
                try {
                  swapAtoBStep(selectedWallet, connection, market1, tokenPk1,tokenPk2,vault1,vault2).then(result =>{
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
          create token A
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
          create token B
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
      <button onClick={ () => sendTokenBToMM()}>
          send 10 of token B to market maker
      </button>
      <br></br>
      <button onClick={ () => createMarket()}>
          create serum dex Market for tokenA/tokenB pool
      </button>
      <br></br>
      <button onClick={ () => swapAtoB()}>
          swap A to B
      </button>
      <br></br>
    </div>
    
  );
}

export default SerumSwap;
