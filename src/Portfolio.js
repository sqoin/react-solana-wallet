import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import './Portfolio.css'
import Wallet from '@project-serum/sol-wallet-adapter';
import { Connection, SystemProgram, Transaction, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { createNewPortfolio , createNewUserPortfolio , depositInPortfolio} from './Portfolio/cli/makeStepsPortfolio';
import { AccountsCoder } from '@project-serum/anchor';
import PortfolioComponent from "./component/PortfolioComponent";




function toHex(buffer) {
    return Array.prototype.map
      .call(buffer, (x) => ('00' + x.toString(16)).slice(-2))
      .join('');
  }

function Portfolio() {

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

            return null;
        }
    }, [network]);
    const [selectedWallet, setSelectedWallet] = useState(undefined);
    const [portfolioAccount , setPortfolioAccount] = useState(undefined);
    const [userPAccount , setUserPAccount] = useState(undefined);
    const [depositAccounts , setDepositAccounts] = useState(undefined);
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


  async function createPortfolio () {
    addLog("loading create portfolio ... ");

    try {createNewPortfolio(selectedWallet, connection)
      .then(portfolio =>{
        addLog ("********************************************************************************************************");
        addLog("************************************Info Portfolio Account *****************************");
        addLog("address of new portfolio :  "+ portfolio.portfolioAddress.toString()+
           "--- creator Portfolio : "+portfolio.creatorPortfolio.toString()+
           " -- amount of Asset1  :" + portfolio.amountAsset1.property +
           " -- address of Asset1 :" + portfolio.addressAsset1.toString() +
           " -- period of Asset1 :" + portfolio.periodAsset1.property + 
           " -- assetToSoldIntoAsset1 :" + portfolio.assetToSoldIntoAsset1.toString()+
           " --metadataUrl : " + portfolio.metadataUrl.toString()+
           " --metadataHash : " + portfolio.metadataHash.property);
        addLog("************************************end info Portfolio Account ******************************")
        addLog("********************************************************************************************************");
       
        setPortfolioAccount(portfolio)
        console.log("address of new portfolio :  ", portfolio.portfolioAddress.toString());
        })
      .catch(
        err => addLog("" + err)
      )
           
    }
    catch (err) {
      addLog("" + err);
    }
  }

  async function createUserPortfolio () {
    addLog("loading create user portfolio ... ");

    try {createNewUserPortfolio(selectedWallet, connection)
      .then(usePortfolio =>{

        addLog("********************************************************************************************************");
        addLog("********************************************Info User Portfolio Account *********************************");
        addLog("address of new user portfolio : : " + usePortfolio.user_portfolio_address.toString() +
        "--- portfolio_address : "+usePortfolio.portfolio_address.toString()+ 
        " -- owner  :" + usePortfolio.owner.toString() +
        " -- delegated amount :" + usePortfolio.delegatedAmount +
        " -- delegate :" + usePortfolio.delegate.toString() 
       );
            addLog("*********************************************end info User Portfolio Account **************************");
            addLog ("********************************************************************************************************");

      
        setUserPAccount(usePortfolio);
        console.log("address of new user portfolio :  ", usePortfolio.user_portfolio_address.toString());
        })
      .catch(
        err => addLog("" + err)
      )
           
    }
    catch (err) {
      addLog("" + err);
    }
  }


  async function deposit () {
    addLog("loading deposit ... ");

    try {depositInPortfolio(selectedWallet, connection)
      .then(accounts =>{
          setDepositAccounts(accounts);
       // accountInfoSourceBefore ,accountInfoDestBefore , accountInfoSource ,accountInfoDest
          console.log ("success");
          console.log (JSON.stringify(accounts));

        addLog("********************************************************************************************************");
        addLog("********************************************Info SPLU PRIMARY BEFORE SWAP *********************************");
        addLog("address of SPLU PRIMARY : : " + accounts[0].address.toString() + 
        "----  amount OF SPLU PRIMARY :  "+accounts[0].amount)
        //addLog ("********************************************************************************************************");
        
        addLog("********************************************Info SPLU SECONDARY BEFORE SWAP  *********************************");
        addLog("address of SPLU SECONDARY : " + accounts[1].address.toString() + 
        "---- amount of SPLU SECONDARY :  "+accounts[1].amount);
        addLog ("********************************************************************************************************");
        

        addLog("********************************************************************************************************");
        addLog("********************************************Info SPLU PRIMARY AFTER SWAP *********************************");
        addLog("address of SPLU PRIMARY : : " + accounts[2].address.toString() + 
        "----  amount OF SPLU PRIMARY :  "+accounts[2].amount)
        //addLog ("********************************************************************************************************");
        
        addLog("********************************************Info SPLU SECONDARY AFTER SWAP  *********************************");
        addLog("address of SPLU SECONDARY : " + accounts[3].address.toString()
         + "---- amount of SPLU SECONDARY :  "+accounts[3].amount);
        addLog ("********************************************************************************************************");
        
        addLog("********************************************************************************************************");
        addLog("******************************************** INFO PPU AFTER SWAP  *********************************");
        addLog("user_portfolio_address : " + accounts[4].user_portfolio_address.toString() +
        "--- portfolio_address : "+accounts[4].portfolio_address.toString()+ 
        " -- owner  :" + accounts[4].owner.toString() +
         " -- delegated amount :" + accounts[4].delegatedAmount +
         " -- delegate : " + accounts[4].delegate.toString() +
          " -- splu_asset1 : " + accounts[4].splu_asset1.toString()+
          " --splu_asset2 : " + accounts[4].splu_asset2.toString())
        addLog("*********************************************end info Portfolio Account **************************")
        addLog ("********************************************************************************************************");
 
    
     
        })
      .catch(
        err => addLog("" + err)
      )
           
    }
    catch (err) {
      addLog("" + err);
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


    return (
        <div className="App" id="main-wrap" >



      <div id="sidebar"><PortfolioComponent selectedWallet={selectedWallet} connection={connection} portfolio={portfolioAccount}
      userPAccount = {userPAccount} depositAccounts={depositAccounts}></PortfolioComponent> </div>

        <div id="content-wrap">
            <h1>PORTFOLIO Demo</h1>
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


          
            <br></br>
            <br></br>
            Create portfolio account :
            <br></br>
            <button onClick={() => createPortfolio()}>Create portfolio account</button> 
     
            <br></br>
            <br></br>
            Create user portfolio account :
            <br></br>
            <button onClick={() => createUserPortfolio()}>Create user portfolio account</button> 
  
            <br></br>
            <br></br>
            deposit to an existing user account :
            <br></br>
            <button onClick={() => deposit()}>deposit to an existing user account</button> 



          </div> 
        </div>
    );

}

export default Portfolio;