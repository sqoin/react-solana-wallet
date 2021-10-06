import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import './PortfolioPage.css'
import Wallet from '@project-serum/sol-wallet-adapter';
import { Connection, SystemProgram, Transaction, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { createPortfolioApi, createUserPortfolioApi, depositInPortfolioApi } from './Portfolio/cli/makeStepsPortfolio';
import PortfolioComponent from "./component/PortfolioComponent";
import { addAssetToPortfolioStep, createPortfolioStep, createUserPortfolioStep } from './new-portfolio/portfolio-steps';

import InfoAccount from './component/InfoAccount';

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



  ////// input

  const [token, setToken] = useState("6ykyxd7bZFnvEHq61vnd69BkU3gabiDmKGEQb4sGiPQG");

  const [metaDataUrl, setMetaDataUrl] = useState("aabbcc");
  const [metaDataHash, setMetaDataHash] = useState("12345678");
  const [numberOfAsset, setNumberOfAsset] = useState(2);

  const [amountAsset1, setAmountAsset1] = useState(2);
  const [periodAsset1, setPeriodAsset1] = useState(123);
  const [assetToSellInto1, setAssetToSellInto1] = useState("3hVBPDeLwJyEVY5swGKd1giWCgjKJtgoz35Ash9jKsoZ");
  const [asset1, setAsset1] = useState("9ZFJWoBMQuYiBvbGpExs3smE59kQZbPnVmJp7F8iUsDG");
  const [amountAsset2, setAmountAsset2] = useState(3);
  const [periodAsset2, setPeriodAsset2] = useState(4);
  const [assetToSellInto2, setAssetToSellInto2] = useState("3U4sUoPi7LzMPDxGcxQX4e1C5BZMg94peHBo6xASQbv7");
  const [asset2, setAsset2] = useState("4A3a33ozsqA6ihMXRAzYeNwZv4df9RfJoLPh6ycZJVhE")
  const [amountAsset3, setAmountAsset3] = useState(3);
  const [periodAsset3, setPeriodAsset3] = useState(7);
  const [asset3, setAsset3] = useState("4A3a33ozsqA6ihMXRAzYeNwZv4df9RfJoLPh6ycZJVhE")
  const [amountAsset4, setAmountAsset4] = useState(3);
  const [periodAsset4, setPeriodAsset4] = useState(8);
  const [asset4, setAsset4] = useState("4A3a33ozsqA6ihMXRAzYeNwZv4df9RfJoLPh6ycZJVhE")
  const [amountAsset5, setAmountAsset5] = useState(3);
  const [periodAsset5, setPeriodAsset5] = useState(5);
  const [asset5, setAsset5] = useState("4A3a33ozsqA6ihMXRAzYeNwZv4df9RfJoLPh6ycZJVhE")
  const [amountAsset6, setAmountAsset6] = useState(3);
  const [periodAsset6, setPeriodAsset6] = useState(4);
  const [asset6, setAsset6] = useState("4A3a33ozsqA6ihMXRAzYeNwZv4df9RfJoLPh6ycZJVhE")
  const [amountAsset7, setAmountAsset7] = useState(3);
  const [periodAsset7, setPeriodAsset7] = useState(4);
  const [asset7, setAsset7] = useState("4A3a33ozsqA6ihMXRAzYeNwZv4df9RfJoLPh6ycZJVhE")
  const [amountAsset8, setAmountAsset8] = useState(3);
  const [periodAsset8, setPeriodAsset8] = useState(4);
  const [asset8, setAsset8] = useState("4A3a33ozsqA6ihMXRAzYeNwZv4df9RfJoLPh6ycZJVhE")
  const [amountAsset9, setAmountAsset9] = useState(3);
  const [periodAsset9, setPeriodAsset9] = useState(4);
  const [asset9, setAsset9] = useState("4A3a33ozsqA6ihMXRAzYeNwZv4df9RfJoLPh6ycZJVhE")
  const [portfolioAddress, setPortfolioAddress] = useState("6Uh23UynK2KTqVPSpChHhebr4WtjzoM5hmDTrcrnuyU5")
  const [amountPortfolio, setAmountPortfolio] = useState(5)
  const [userPortfolioAccount, setUserPortfolioAccount] = useState("BqZom3cQevaDpBxmBQKeE9d5ny5v27qnUtUv67roKAgh")
  const [amountDeposit, setAmountDeposit] = useState(10)
  const [infoUserPortfolioAccount, setInfoUserPortfolioAccount] = useState("")
  const [infoPortfolio, setInfoPortfolio] = useState("")
  const network = "https://psytrbhymqlkfrhudd.dev.genesysgo.net:8899"
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
  const [portfolioAccount, setPortfolioAccount] = useState(undefined);
  const [userPAccount, setUserPAccount] = useState(undefined);
  const [depositAccounts, setDepositAccounts] = useState(undefined);
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


  async function createPortfolioFunction() {
    addLog("loading create portfolio ... ");

    createPortfolioStep(selectedWallet, connection,asset1,amountAsset1,1,metaDataUrl,metaDataHash,periodAsset1)
      .then(portfolio => {
        addLog("address of new portfolio :  "+portfolio.publicKey);
        setPortfolioAddress(portfolio.publicKey)
      })
  }

  async function AddAssetToPortfolioFunction() {
    addLog("loading add asset to portfolio ... ");

    addAssetToPortfolioStep(selectedWallet, connection,asset2,amountAsset2,portfolioAddress,assetToSellInto2,periodAsset2)
      .then(portfolio => {
        addLog("success ");
      })
  }

  async function createUserPortfolioFunction() {
    addLog("loading create user portfolio ... ");

    try {
      createUserPortfolioStep(selectedWallet, connection, token, portfolioAddress, amountPortfolio)
      .then(userPortfolio => {
        addLog("success ");
        setUserPAccount(userPortfolio.publicKey);
        addLog("address of new user portfolio :  " + userPortfolio.publicKey);
      })
      .catch(
        err => {addLog("" + err)
      throw(err)}
      )

    }
    catch (err) {
      addLog("" + err);
      throw(err)
    }
  }


  async function deposit() {
    addLog("loading deposit ... ");

    try {
      depositInPortfolioApi(selectedWallet, connection, portfolioAccount, userPAccount, amountDeposit)
      .then(accounts => {
        setDepositAccounts(accounts);
        // accountInfoSourceBefore ,accountInfoDestBefore , accountInfoSource ,accountInfoDest
        addLog("success");
        console.log(JSON.stringify(accounts));
        addLog("success ");
        /*addLog("********************************************************************************************************");
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
 */


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

<div id="sidebar"> <div id="sidebaraccount"><InfoAccount selectedWallet={selectedWallet} connection={connection}></InfoAccount> </div>  </div>


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


        <br></br>*********************************************  <br></br>
        <br></br>
        Create portfolio :
        <br></br>
        <br></br>
        Asset 1
        <br />
        <br />
        <span> asset address </span> <input type="text" onChange={(e) => setAsset1(e.target.value)} value={asset1} />
        <br />
        <br />
        <span> amount asset </span>  <input type="number" onChange={(e) => setAmountAsset1(e.target.value)} value={amountAsset1} />
        <br />
        <br />
        <span> period asset </span>  <input type="number" onChange={(e) => setPeriodAsset1(e.target.value)} value={periodAsset1} />
        <br />
        <br />
        <span> asset to sell into </span>  <input type="text" onChange={(e) => setAssetToSellInto1(e.target.value)} value={assetToSellInto1} />
        <br />
        <br />
        <span> metadata hash </span>  <input type="text" onChange={(e) => setMetaDataHash(e.target.value)} value={metaDataHash} />
        <br />
        <br />
        <span> metadata url </span> <input type="text" onChange={(e) => setMetaDataUrl(e.target.value)} value={metaDataUrl} />
        <br />
        <br />
        <button onClick={() => createPortfolioFunction()}>Create portfolio account</button>

        <br></br>
        <br></br>
        <br></br>*********************************************  <br></br>
        <br></br>
        Add asset to portfolio :
        <br></br>
        <br></br>
        <span> portfolio address </span> <input type="text" onChange={(e) => setPortfolioAddress(e.target.value)} value={portfolioAddress} />
        <br />
        <br />
        Asset 2
        <br />
        <br />
        <span> asset address </span> <input type="text" onChange={(e) => setAsset1(e.target.value)} value={asset2} />
        <br />
        <br />
        <span> amount asset </span>  <input type="number" onChange={(e) => setAmountAsset1(e.target.value)} value={amountAsset2} />
        <br />
        <br />
        <span> period asset </span>  <input type="number" onChange={(e) => setPeriodAsset1(e.target.value)} value={periodAsset2} />
        <br />
        <br />
        <span> asset to sell into </span>  <input type="text" onChange={(e) => setAssetToSellInto2(e.target.value)} value={assetToSellInto2} />
        <br />
        <br />
        <button onClick={() => AddAssetToPortfolioFunction()}>Add asset to portfolio</button>

        <br></br>
        <br></br>
        <br></br>*********************************************  <br></br>
        <br></br>
        Create user portfolio account :
        <br></br>
        <br></br>

        <br />

        portfolio address <input type="text" onChange={(e) => setPortfolioAddress(e.target.value)} value={portfolioAddress} />

        <br />
        <br />
        <br></br>
        <button onClick={() => createUserPortfolioFunction()}>Create user portfolio account</button>
        <br />
        <br />
        <br></br>


      </div>
    </div>
  );

}

export default Portfolio;