import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import './PortfolioPage.css'
import Wallet from '@project-serum/sol-wallet-adapter';
import { Connection, SystemProgram, Transaction, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { createPortfolioApi , createUserPortfolioApi, depositInPortfolioApi} from './Portfolio/cli/makeStepsPortfolio';
import PortfolioComponent from "./component/PortfolioComponent";

import InfoAccount from "./component/InfoAccount"



function toHex(buffer) {
    return Array.prototype.map
      .call(buffer, (x) => ('00' + x.toString(16)).slice(-2))
      .join('');
  }

function PortfolioPage() {

    const [logs, setLogs] = useState([]);
    function addLog(log) {
      setLogs((logs) => [...logs, log]);
    }



////// input

const [token, setToken] = useState("6ykyxd7bZFnvEHq61vnd69BkU3gabiDmKGEQb4sGiPQG");
const [USDCToken, setUSDC] = useState("4A3a33ozsqA6ihMXRAzYeNwZv4df9RfJoLPh6ycZJVhE");
const [metaDataUrl,setMetaDataUrl]=useState("aabbcc");
const [amountAsset1,setAmountAsset1]=useState(2);
const [periodAsset1,setPeriodAsset1]=useState(123);
const [assetToSold1,setAssetToSold1]=useState("FAxFrLbWabNWgL1A9sLokNQbaBSq33iQHA2Y3zKk1g8x");
const [amountAsset2,setAmountAsset2]=useState(3);
const [periodAsset2,setPeriodAsset2]=useState(4);
const [assetToSold2,setAssetToSold2]=useState("FAxFrLbWabNWgL1A9sLokNQbaBSq33iQHA2Y3zKk1g8x")
const [amountAsset3,setAmountAsset3]=useState(3);
const [periodAsset3,setPeriodAsset3]=useState(4);
const [assetToSold3,setAssetToSold3]=useState("FAxFrLbWabNWgL1A9sLokNQbaBSq33iQHA2Y3zKk1g8x")
const [amountAsset4,setAmountAsset4]=useState(3);
const [periodAsset4,setPeriodAsset4]=useState(4);
const [assetToSold4,setAssetToSold4]=useState("FAxFrLbWabNWgL1A9sLokNQbaBSq33iQHA2Y3zKk1g8x")
const [amountAsset5,setAmountAsset5]=useState(3);
const [periodAsset5,setPeriodAsset5]=useState(4);
const [assetToSold5,setAssetToSold5]=useState("FAxFrLbWabNWgL1A9sLokNQbaBSq33iQHA2Y3zKk1g8x")
const [amountAsset6,setAmountAsset6]=useState(3);
const [periodAsset6,setPeriodAsset6]=useState(4);
const [assetToSold6,setAssetToSold6]=useState("FAxFrLbWabNWgL1A9sLokNQbaBSq33iQHA2Y3zKk1g8x")
const [amountAsset7,setAmountAsset7]=useState(3);
const [periodAsset7,setPeriodAsset7]=useState(4);
const [assetToSold7,setAssetToSold7]=useState("FAxFrLbWabNWgL1A9sLokNQbaBSq33iQHA2Y3zKk1g8x")
const [amountAsset8,setAmountAsset8]=useState(3);
const [periodAsset8,setPeriodAsset8]=useState(4);
const [assetToSold8,setAssetToSold8]=useState("FAxFrLbWabNWgL1A9sLokNQbaBSq33iQHA2Y3zKk1g8x")
const [amountAsset9,setAmountAsset9]=useState(3);
const [periodAsset9,setPeriodAsset9]=useState(4);
const [assetToSold9,setAssetToSold9]=useState("FAxFrLbWabNWgL1A9sLokNQbaBSq33iQHA2Y3zKk1g8x")
const [portfolioAddress,setPortfolioAddress]=useState("8EdcbESWUDqgxUeq9ykcax5hQQhSF9cinWk8yiVFFs9B")
const [amountPortfolio,setAmountPortfolio]=useState(5)
const [userPortfolioAccount,setUserPortfolioAccount]=useState("BqZom3cQevaDpBxmBQKeE9d5ny5v27qnUtUv67roKAgh")
const [amountDeposit,setAmountDeposit]=useState(10)
const [infoUserPortfolioAccount,setInfoUserPortfolioAccount]=useState("")
const[infoPortfolio,setInfoPortfolio]=useState("")
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


  async function createPortfolioFunction() {
    addLog("loading create portfolio ... ");

    createPortfolioApi(selectedWallet, connection,token,USDCToken,metaDataUrl,amountAsset1,amountAsset2,amountAsset3,amountAsset4,amountAsset5,amountAsset6,amountAsset7,amountAsset8,amountAsset9,
    periodAsset1,periodAsset2,periodAsset3,periodAsset4,periodAsset5,periodAsset6,periodAsset7,periodAsset8,periodAsset9,
    assetToSold1,assetToSold2,assetToSold3,assetToSold4,assetToSold5,assetToSold6,assetToSold7,assetToSold8,assetToSold9)
      .then(portfolio =>{
        addLog ("********************************************************************************************************");
        addLog("************************************Info Portfolio Account *****************************");
        addLog("address of new portfolio :  "+ portfolio.portfolioAddress.publicKey);
        addLog("************************************end info Portfolio Account ******************************")
        addLog("********************************************************************************************************");
       setPortfolioAddress(portfolio.portfolioAddress.publicKey)
        setPortfolioAccount(portfolio.portfolioAddress)
        setInfoPortfolio(portfolio.accountInfo)
        
        })
      
  }

  async function createUserPortfolioFunction () {
    addLog("loading create user portfolio ... ");

    try {createUserPortfolioApi(selectedWallet, connection,token,portfolioAddress,amountPortfolio)
      .then(usePortfolio =>{

        /*addLog("********************************************************************************************************");
        addLog("********************************************Info User Portfolio Account *********************************");
        addLog("address of new user portfolio : : " + usePortfolio.user_portfolio_address.toString() +
        "--- portfolio_address : "+usePortfolio.portfolio_address.toString()+ 
        " -- owner  :" + usePortfolio.owner.toString() +
        " -- delegated amount :" + usePortfolio.delegatedAmount +
        " -- delegate :" + usePortfolio.delegate.toString() 
       );
            addLog("*********************************************end info User Portfolio Account **************************");
            addLog ("********************************************************************************************************");

      */
        setUserPAccount(usePortfolio.UserPortfolioAccount);
        setUserPortfolioAccount(usePortfolio.UserPortfolioAccount.publicKey)
        setInfoUserPortfolioAccount(usePortfolio.accountUserInfo)
        addLog("address of new user portfolio :  "+ usePortfolio.UserPortfolioAccount.publicKey);
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

    try {depositInPortfolioApi(selectedWallet, connection,portfolioAccount,userPAccount,amountDeposit)
      .then(accounts =>{
          setDepositAccounts(accounts);
       // accountInfoSourceBefore ,accountInfoDestBefore , accountInfoSource ,accountInfoDest
         addLog("success");
          console.log (JSON.stringify(accounts));

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



      <div id="sidebar">   <div id ="sidebaraccount"><InfoAccount selectedWallet={selectedWallet} connection={connection}></InfoAccount> </div>  <div id="secondDiv"><PortfolioComponent selectedWallet={selectedWallet} connection={connection} portfolio={infoPortfolio}
      userPAccount = {infoUserPortfolioAccount} depositAccounts={depositAccounts}></PortfolioComponent> </div> </div>

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
            Create token :
            <br></br>
            <br></br>
            
            <br/>

token <input type="text" onChange={(e) => setToken(e.target.value)} value ={token}/> 

Usdc<input type="text" onChange={(e) => setUSDC(e.target.value)} value ={USDCToken}/> 
metadataurl<input type ="text" onChange={(e)=> setMetaDataUrl(e.target.value)} value={metaDataUrl}/>
<br/><br/><br/>


            <br></br>*********************************************  <br></br>
            <br></br>
            Create portfolio account :
            <br></br>
            <br></br>
            
            <br/>

Asset 1
<br/>
 amount asset <input type="number" onChange={(e) => setAmountAsset1(e.target.value)} value ={amountAsset1}/> 

period asset<input type="number" onChange={(e) => setPeriodAsset1(e.target.value)} value ={periodAsset1}/> 
sold to asset <input type="text" onChange={(e) => setAssetToSold1(e.target.value)} value ={assetToSold1}/> 
<br/>
Asset 2
<br/>
 amount asset <input type="number" onChange={(e) => setAmountAsset2(e.target.value)} value ={amountAsset2}/> 

period asset<input type="number" onChange={(e) => setPeriodAsset2(e.target.value)} value ={periodAsset2}/> 
sold to asset <input type="text" onChange={(e) => setAssetToSold2(e.target.value)} value ={assetToSold2}/> 
<br/>
Asset 3
<br/>
 amount asset <input type="number" onChange={(e) => setAmountAsset3(e.target.value)} value ={amountAsset3}/> 

period asset<input type="number" onChange={(e) => setPeriodAsset3(e.target.value)} value ={periodAsset3}/> 
sold to asset <input type="text" onChange={(e) => setAssetToSold3(e.target.value)} value ={assetToSold3}/> 
<br/>
Asset 4
<br/>
 amount asset <input type="number" onChange={(e) => setAmountAsset4(e.target.value)} value ={amountAsset4}/> 

period asset<input type="number" onChange={(e) => setPeriodAsset4(e.target.value)} value ={periodAsset4}/> 
sold to asset <input type="text" onChange={(e) => setAssetToSold4(e.target.value)} value ={assetToSold4}/> 
<br/>
Asset 5
<br/>
 amount asset <input type="number" onChange={(e) => setAmountAsset5(e.target.value)} value ={amountAsset5}/> 

period asset<input type="number" onChange={(e) => setPeriodAsset5(e.target.value)} value ={periodAsset5}/> 
sold to asset <input type="text" onChange={(e) => setAssetToSold5(e.target.value)} value ={assetToSold5}/> 
<br/>
Asset 6
<br/>
 amount asset <input type="number" onChange={(e) => setAmountAsset6(e.target.value)} value ={amountAsset6}/> 

period asset<input type="number" onChange={(e) => setPeriodAsset6(e.target.value)} value ={periodAsset6}/> 
sold to asset <input type="text" onChange={(e) => setAssetToSold6(e.target.value)} value ={assetToSold6}/> 
<br/>
Asset 7
<br/>
 amount asset <input type="number" onChange={(e) => setAmountAsset7(e.target.value)} value ={amountAsset7}/> 

period asset<input type="number" onChange={(e) => setPeriodAsset7(e.target.value)} value ={periodAsset7}/> 
sold to asset <input type="text" onChange={(e) => setAssetToSold7(e.target.value)} value ={assetToSold7}/> 
<br/>
Asset 8
<br/>
 amount asset <input type="number" onChange={(e) => setAmountAsset8(e.target.value)} value ={amountAsset8}/> 

period asset<input type="number" onChange={(e) => setPeriodAsset8(e.target.value)} value ={periodAsset8}/> 
sold to asset <input type="text" onChange={(e) => setAssetToSold8(e.target.value)} value ={assetToSold8}/> 
<br/>
Asset 9
<br/>
 amount asset <input type="number" onChange={(e) => setAmountAsset9(e.target.value)} value ={amountAsset9}/> 

period asset<input type="number" onChange={(e) => setPeriodAsset9(e.target.value)} value ={periodAsset9}/> 
sold to asset <input type="text" onChange={(e) => setAssetToSold9(e.target.value)} value ={assetToSold9}/> 
<br/>
<br/>
<br/>
            <button onClick={() => createPortfolioFunction()}>Create portfolio account</button> 
     
            <br></br>
            <br></br>
            <br></br>*********************************************  <br></br>
            <br></br>
            Create user portfolio account :
            <br></br>
            <br></br>
            
            <br/>

          token  <input type ="text" onChange={(e)=>setToken(e.target.value)} value ={token}/>
           portfolio address <input type ="text" onChange={(e)=>setPortfolioAddress(e.target.value)} value ={portfolioAddress}/>

            amount <input type ="text" onChange={(e)=>setAmountPortfolio(e.target.value)} value ={amountPortfolio}/>
            <br/>
            <br/>
            <br></br>
            <button onClick={() => createUserPortfolioFunction()}>Create user portfolio account</button> 
  
           

            <br></br>
            <br></br>
            <br></br>*********************************************  <br></br>
            <br></br>
            deposit to an existing user account :
            <br></br>
            <br></br>
            
            <br/>
            <input type="text"  value ={portfolioAddress}/>
            <input type="text"  value={userPortfolioAccount}/>
            <input type="text" onChange={(e)=> setAmountDeposit(e.target.value)} value={amountDeposit}/>
            <button onClick={() => deposit()}>deposit to an existing user account</button> 



          </div> 
        </div>
    );

}

export default PortfolioPage;