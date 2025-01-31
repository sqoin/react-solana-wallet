import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Wallet from '@project-serum/sol-wallet-adapter';
import { Connection, SystemProgram, Transaction, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { createMintMultisigner , createAccountMultisigner,createTokenA , mintToMultisig , mintToSig2} from './cli/makesteps';





function toHex(buffer) {
    return Array.prototype.map
      .call(buffer, (x) => ('00' + x.toString(16)).slice(-2))
      .join('');
  }

function TransferMultisig() {

    const [logs, setLogs] = useState([]);
    const [accountDest, setAccountDest] = useState("");
    const [amount, setAmount] = useState("");
    const [accountA, setAccountA] = useState("");
    const [accountB, setAccountB] = useState("");
    const [rawTransaction, setRawTransaction] = useState({});
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

            return null;
        }
    }, [network]);
    const [selectedWallet, setSelectedWallet] = useState(undefined);
    const [portfolioAccount , setPortfolioAccount] = useState(undefined);
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

    async function createMint() {
        try {
            createMintMultisigner(selectedWallet, connection).then(token =>{
              console.log(token)
              
              addLog("token with vanity nova   "+token)
            }
           )
            .catch(
              err => addLog("" + err)
            )
        }
        catch (err) {
          addLog("" + err);
        }

    }
    async function createAccountA() {
        try {
          let mintPubKey = new PublicKey("Novax1pqBrhqJC9dHBNobrBai91x25gVnPrUvvvc7cn");
            createAccountMultisigner(selectedWallet, connection , mintPubKey).then(tokenAccount =>{
              console.log(tokenAccount)
              setAccountA(tokenAccount);
              addLog("publickey of account   "+tokenAccount)
            }
           )
            .catch(
              err => addLog("" + err)
            )
        }
        catch (err) {
          addLog("" + err);
        }

      

    }
  
    async function createAccountB() {
        try {
          let mintPubKey = new PublicKey("Novax1pqBrhqJC9dHBNobrBai91x25gVnPrUvvvc7cn");
            createAccountMultisigner(selectedWallet, connection , mintPubKey).then(tokenAccount =>{
              console.log(tokenAccount)
              setAccountB(tokenAccount);
              addLog("publickey of account "+tokenAccount)
            }
           )
            .catch(
              err => addLog("" + err)
            )
        }
        catch (err) {
          addLog("" + err);
        }

      

    }



    async function mintToMultisig1() {

      let mintAccount = new PublicKey("Novax1pqBrhqJC9dHBNobrBai91x25gVnPrUvvvc7cn");
      mintToMultisig(selectedWallet, connection, mintAccount )
      .then(transaction=>{
        console.log ("res",JSON.stringify(transaction));
       
          // .then(sig=>{
          //   console.log (sig);
            // console.log ("transaction sig :" , transaction);
          // })
        setRawTransaction(transaction);
        console.log ("res2",transaction);
      }) .catch(
        err => addLog("" + err)
      )

       /* try {
          let mintAccount = new PublicKey("Novax1pqBrhqJC9dHBNobrBai91x25gVnPrUvvvc7cn");
            mintToMultisig(selectedWallet, connection, mintAccount ).then(transaction =>{
              console.log("raw transaction" ,transaction);
              
              addLog(" raw transaction :   ",transaction);
            }
           )
            .catch(
              err => addLog("" + err)
            )
        }
        catch (err) {
          addLog("" + err);
        }

      */

    }

    async function secondSignature () {
      try{
        let mintAccount = new PublicKey("Novax1pqBrhqJC9dHBNobrBai91x25gVnPrUvvvc7cn");
        
        mintToSig2(injectedWallet, connection ,mintAccount ,rawTransaction);
      }
      catch(e){
        console.warn(e);
        addLog('Error: ' + e.message);
      }
  }


    async function createTokenASwap() {
        addLog("loading create Mint A... ");
        // try {
          createTokenA(selectedWallet, connection).then(token => {
            console.log("create mintA " + JSON.stringify(token))
      
    
            // console.log("token " + token[0].mintA.publicKey.toBase58())
             addLog("publickey tokenA   " + token.mintA + " authorty = " + token.authority )
    
          })
            // .catch(
            //   err => addLog("" + err)
            // )
    
        // }
        // catch (err) {
        //   addLog("" + err);
        // }
    
      }
    return (
        <div className="App">
            <h1>PORTFOLIO Adapter Demo</h1>
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

            <div>
          
                <div>

     <p>Mint Pubkey : Novax1pqBrhqJC9dHBNobrBai91x25gVnPrUvvvc7cn </p>
                  {/* <button onClick={() => createMint()}>Create mint</button>*/}
                </div>

                <div>
                     <button onClick={() => createAccountA()}>Create account A </button>
                </div>
                <div>
                     <button onClick={() => createAccountB()}>Create account B </button>
                </div>


               
                <div>
                    Account destination :{' '}
                    <input
                        type="text"
                        value={accountDest}
                        onChange={(e) => setAccountDest(e.target.value.trim())}
                    />

                    {' '} Amount : {' '}
                    <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value.trim())}
                    />
                </div>
                <div >
                <button onClick={() => mintToMultisig1()}>First signature</button>
                </div>

                <div>
                    Raw transaction:{' '}
                    <input
                        type="text"
                        value={rawTransaction}
                        onChange={(e) => setRawTransaction(e.target.value)}
                    />
                    <button onClick={() => secondSignature()}>second signature</button>
                 </div>

            </div>


        



           
        </div>
    );

}

export default TransferMultisig;