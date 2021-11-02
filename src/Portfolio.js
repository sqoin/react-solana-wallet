import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import './PortfolioPage.css'
import Wallet from '@project-serum/sol-wallet-adapter';
import { Connection, SystemProgram, Transaction, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { createPortfolioApi, createUserPortfolioApi, depositInPortfolioApi } from './Portfolio/cli/makeStepsPortfolio';
import PortfolioComponent from "./component/PortfolioComponent";
import { addAssetToPortfolioStep, createPortfolioStep, createUserPortfolioStep, depositPortfolioStep, depositIntoLPAPI, withdrawPortfolioStep ,createLpTokenAPI, stakeTokensAPI,withdrawFormQuarryAPI,claimRewardsAPI,withdrawFormSaberAPI} from './new-portfolio/portfolio-steps';
import { depositInPortfolio } from "./cli/makestepsPortfolioSwap"

import InfoAccount from './component/InfoAccount';
import { avalanch, raydium, usdc, usdcRaydiumPortfolio, usdt } from './new-portfolio/utils/stableCoins';
import { claimRewardsCPI } from './quarry-farm/cpi-quarry-api';

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
  const [idTransaction, setIdTransaction] = useState()
  const [metaDataUrl, setMetaDataUrl] = useState("aabbcc");
  const [metaDataHash, setMetaDataHash] = useState("12345678");
  const [numberOfAsset, setNumberOfAsset] = useState(2);
  const [amount, setAmount] = useState(10)
  const [amountWithdraw, setAmountWithdraw] = useState(100)
  const [amountAsset1, setAmountAsset1] = useState(2);
  const [pourcentAsset1, setPourcentAsset1] = useState(5);
  const [periodAsset1, setPeriodAsset1] = useState(123);
  const [assetToSellInto1, setAssetToSellInto1] = useState("3hVBPDeLwJyEVY5swGKd1giWCgjKJtgoz35Ash9jKsoZ");
  const [asset1, setAsset1] = useState("D1FAA8qeo17WYgze53U3VEAVknVASCbVGBMszQ76fdK8");
  const [amountAsset2, setAmountAsset2] = useState(3);
  const [pourcentAsset2, setPourcentAsset2] = useState(7);
  const [periodAsset2, setPeriodAsset2] = useState(4);
  const [assetToSellInto2, setAssetToSellInto2] = useState("3U4sUoPi7LzMPDxGcxQX4e1C5BZMg94peHBo6xASQbv7");
  const [asset2, setAsset2] = useState("HFdGgdFaRJEj8BLpyjZmzDexkaQhFqrLt2bFyMxvMDw9")
  const [asset1Obj, setAsset1Obj] = useState({
    createAccountProgramm : "8RfDxCrS4yCpHwuj131AJbYTL4QquzCB6TXrs3Hj7vun",
     minta :avalanch,
     mintb :usdc,
     managerPRIMARY :"HwsA9mBjnZEaNjM2edvoAsCYfd3LFT7fMcWehZNqwfvv",//tokenAccountA
      managerAsset1 :"DexCKvu85btXYWJVuvvNb1y9WnE4gZgkRLKrjswzT4Kz",//tokenAccountB
      tokenPool :"FfVcqbB9UDdJfeTrrPcArNwxQRkUd1hCod3r1E4HLWFW",
      feeAccount :"EzbYEZe1d8iT5T6wkAF126aDwcprkSwBfMaAVtHwo2mv",
      tokenAccountPool :"FFKo6NYVzbv43fKHrQ1RY7UejLLbfRGF8pZDXnKZvgEh",
    autority :"Cpm8hUiqMJ5PfFphQEhBr4EQYDaVA83KjPoY4tbLaLoY",
    tokenSwap : "8RfDxCrS4yCpHwuj131AJbYTL4QquzCB6TXrs3Hj7vun",
    spluPRIMARY  : "Dkqz2HsXovLDuPrbz1wffNLJnnemEnq3c8adTEniCnPT",//userAccountA
    spluAsset1 : "CEnv2giFo1B9mDzWLsByvLujVWKXZox4dfdtBvjSqAJf",//userAccountB
})
const [asset2Obj, setAsset2Obj] = useState({
    createAccountProgramm : "65HtXX63thUK1tptxaneP9ffHCLhizfttbwFze8Z8x8F",
    minta :avalanch,
    mintb :"5gAMUf7tSNZFoKmNDy5HLRD6PYPx52iFVgHvg1cxaqEL",
    managerPRIMARY :"7ij39XNnC5JqGcVhYCLDF7mNVHJQz9VQXqMudR5AhgQv",
    managerAsset1 :"Go4vPYzgQ6DJFGJ9B9mzom83D5t14rjP5ncM739WjjYi",
    tokenPool :"DQmBvE1yjnDDAsnP8iCxBEqwKq4yLEU9qQWtX5b72FpZ",
    feeAccount :"ETc6XeaQFRwPw8boD8ccbpkfHjpwEA2hxsN2f6uKsNL1",
    tokenAccountPool :"EcehTfLyp3QPhiseqycPXLsKTSYrmZneVZxoSLX37EMo",
    autority :"AZtg93rgxJwc4oPjX9MhKxioc9tuLkePdcjtEeLDFu9r",
    tokenSwap : "2LzAQ8jJ8KfS9wWQnuhtXwd1ETArbBFtoM2YXSCwmzdN",
    spluPRIMARY  : "Dkqz2HsXovLDuPrbz1wffNLJnnemEnq3c8adTEniCnPT",
    spluAsset1 : "6QmWpTsm5ds3bQfp9kKMtPtFHuWNNjz6sD1TX22V952D",
})
const [asset3Obj, setAsset3Obj] = useState({
  createAccountProgramm : "65HtXX63thUK1tptxaneP9ffHCLhizfttbwFze8Z8x8F",
  minta :usdc,
  mintb :usdt,
  managerPRIMARY :"BZqsuZoavyG5D3S4i5695Yc8jHTFKEDNZUrPWbLLcd8K",
  managerAsset1 :"GMFp4Uu6ZYfjdNRQhEJ65b3KZ1v7A5ehPtkBTeDaNz4v",
  tokenPool :"GvJD8yVhyHRkYVFVdCqe3w57jb6AcJ2ps7iapx5sbWoz",
  feeAccount :"GdkPaF5KGZujxR1NN6oVcV2GQap6pfYVbMretJhg6KEd",
  tokenAccountPool :"82EqqKWoBzFeeZ6LtMNYp57wSBKikh4XeTmjsXBKDXf5",
  autority :"2LusKX2UydWPfeaxPmjFwpuUYCwnd54L7zTCURLA7tU5",
  tokenSwap : "D1yBQe3L16SRDVEFJX2pYdfMp4LKjtRMsFCbCQVbqote",
  spluPRIMARY  : "CEnv2giFo1B9mDzWLsByvLujVWKXZox4dfdtBvjSqAJf",
  spluAsset1 : "8fosPW2dgZBUGoLH8KpYZupd6L13BnZcLX73RB5zp4Mq",
})



const [spluPrimary, setSpluPrimary] = useState("Dkqz2HsXovLDuPrbz1wffNLJnnemEnq3c8adTEniCnPT");
const [splmPrimary, setSplmPrimary] = useState(avalanch);
  const [portfolioAddress, setPortfolioAddress] = useState(usdcRaydiumPortfolio)
  const [amountPortfolio, setAmountPortfolio] = useState(5)
  const [userPortfolioAccount, setUserPortfolioAccount] = useState("w6pkG4GVvZFqZ2wWZNiF2zQ8CDFoDrmjrYLjyNbs8LQ")
  const [amountDeposit, setAmountDeposit] = useState(10)
  const [infoUserPortfolioAccount, setInfoUserPortfolioAccount] = useState("")
  const [lpTokenAsset1, setLpTokenAsset1] = useState("2FiWLuYx8tFSFq55z5RfFrT4Qj3Vw47fQ2hwTQNWoQAw");
  const [tokenAccountAAsset1, setTokenAccountAAsset1] = useState("Dgy43DxZ3MT8FX3XcZGSaGo3R4LW9gUVTYjorbuQ9ajV"); 
  const [tokenAccountBAsset1, setTokenAccountBAsset1] = useState("8UZxzspNarB2ybLvwSXQQ6fVttxvLVxrJqYnk7ZfDrSo"); 
  const [stableSwapAsset1, setStableSwapAsset1] = useState("Dx6dfo9scbEftEaEGSVDFWq95JL7gwTUgwE3aruVdZa3");
  const [authorityAsset1, setAuthorityAsset1] = useState("J1S4HcAH1YuFuWhhrwyT3AgdBBXpKNwA32uNfph6euEv"); 
  const [userPoolTokenAsset1, setUserPoolTokenAsset1] = useState("C1N1DrrAYiqjsXanriYAMdSRpuNmnNm3JNqwX9kFWbRB"); 
  const [rewarderKeyAsset1, setRewarderKeyAsset1] = useState(""); 
  const [enableTransaction,setEnableTransaction]=useState(false);
const [signatureAsset1, setSignatureAsset1] = useState("");
const [signatureAsset2, setSignatureAsset2] = useState("");
  const [infoPortfolio, setInfoPortfolio] = useState("");

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
        setPortfolioAddress(portfolio.publicKey+"");
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
        setUserPortfolioAccount(userPortfolio.publicKey+"");
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
  function createDynamicURL() {
    window.open(`https://explorer.solana.com/tx/${idTransaction}?cluster=devnet`, '_blank', 'resizable=yes')

}

async function depositPortfolio() {
  addLog("loading deposit... ");
  try {

      let TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
      let TOKEN_SWAP_PROGRAM_ID = '5e2zZzHS8P1kkXQFVoBN6tVN15QBUHMDisy6mxVwVYSz';

      //let portfolioAddress = "4t54Gy7cgRkr36vQFumRFRgEF1SmwsWYntqVgYEUeR85";


      //let UserPortfolioAccount=  "GgzBnJAVb4vLHrQUV1JAJjJz73ZM987JsPe7wCpSbu6T";


      depositPortfolioStep(selectedWallet, connection,   portfolioAddress,userPortfolioAccount,
        TOKEN_PROGRAM_ID  , TOKEN_SWAP_PROGRAM_ID  ,amount ,asset1Obj,asset2Obj,asset3Obj ).then(
          token => {
              setIdTransaction(token)
              addLog(JSON.stringify(token))

          })
          .catch(
              
              err => {addLog("" + err);
              throw(err);
          }
          )
  }
  catch (err) {
      addLog("error : " + err);
      throw(err);
  }

}

async function withdrawPortfolio() {
  addLog("loading deposit... ");
  try {

      let TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
      let TOKEN_SWAP_PROGRAM_ID = '5e2zZzHS8P1kkXQFVoBN6tVN15QBUHMDisy6mxVwVYSz';


      withdrawPortfolioStep(selectedWallet, connection,   portfolioAddress,userPortfolioAccount,
        TOKEN_PROGRAM_ID  , TOKEN_SWAP_PROGRAM_ID  ,amountWithdraw ,asset1Obj,asset2Obj,asset3Obj ).then(
          token => {
              setIdTransaction(token)
              addLog(JSON.stringify(token))

          })
          .catch(
              
              err => {addLog("" + err);
              throw(err);
          }
          )
  }
  catch (err) {
      addLog("error : " + err);
      throw(err);
  }

}
async function  createLpToken() {
  addLog("... loading create saberSwap ... ");
  
  try {
    createLpTokenAPI(selectedWallet, connection,asset1Obj,asset2Obj).then(
        res => {
            addLog("res ",res);

            setLpTokenAsset1(res.poolMint);
        setUserPoolTokenAsset1(res.poolTokenAccount)
    setAuthorityAsset1(res.authority);
    setTokenAccountAAsset1(res.tokenAccountA);
    setTokenAccountBAsset1(res.tokenAccountB);
    setStableSwapAsset1(res.stableSwap)

        

        })
        .catch(
            
            err => {addLog("" + err);
            throw(err);
        }
        )
}
catch (err) {
    addLog("error : " + err);
    throw(err);
}
}
async function depositIntoLP() {
  addLog("... loading saber ... ");
  try {
    depositIntoLPAPI(selectedWallet,connection,asset1Obj,stableSwapAsset1,lpTokenAsset1,userPoolTokenAsset1,tokenAccountAAsset1,tokenAccountBAsset1,authorityAsset1,asset2Obj).then(
        res => {
            addLog("res ",res);
            if (res){
              setEnableTransaction(true);
              setSignatureAsset1(res.signatureAsset1);

            }

        })
        .catch(
            
            err => {addLog("" + err);
            throw(err);
        }
        )
}
catch (err) {
    addLog("error : " + err);
    throw(err);
}
}
async function stakeTokens(){
  addLog("... loading stake token ... ");
   
  try {
    stakeTokensAPI(selectedWallet, connection,lpTokenAsset1).then(
        res => {
            addLog("res ",res[0].signature);
            setRewarderKeyAsset1(res[0].rewarderKey)
            console.log(res);
        }
    )
    .catch(
            
      err => {addLog("" + err);
      throw(err);
  }
  )
}
catch (err) {
    addLog("error : " + err);
    throw(err);
}
}

async function withdrawFormQuarry(){
  addLog("... loading withdraw Form Quarry ... ");
   
  try {
    withdrawFormQuarryAPI(selectedWallet, connection,lpTokenAsset1,userPoolTokenAsset1,rewarderKeyAsset1).then(
        res => {
            addLog("res ",res);
            console.log(res);
        }
    )
    .catch(
            
      err => {addLog("" + err);
      throw(err);
  }
  )
}
catch (err) {
    addLog("error : " + err);
    throw(err);
}
}
async function claimRewards(){
  addLog("... loading withdraw Form Quarry ... ");
   
  try {
    claimRewardsAPI(selectedWallet, connection,lpTokenAsset1,userPoolTokenAsset1,rewarderKeyAsset1).then(
        res => {
            addLog("res ",res);
            console.log(res);
        }
    )
    .catch(
            
      err => {addLog("" + err);
      throw(err);
  }
  )
}
catch (err) {
    addLog("error : " + err);
    throw(err);
}
}

async function withdrawFormSaber(){
  addLog("... loading withdraw Form saber ... ");
   
  try {
 
  withdrawFormSaberAPI(selectedWallet, connection,asset1Obj,lpTokenAsset1,userPoolTokenAsset1,tokenAccountAAsset1,tokenAccountBAsset1,authorityAsset1,stableSwapAsset1,asset2Obj).then(
        res => {
            addLog("tx saber  ",res);
            console.log(res);
        }
    )
    .catch(
            
      err => {addLog("" + err);
      throw(err);
  }
  )
}
catch (err) {
    addLog("error : " + err);
    throw(err);
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
        <span> pourcent asset </span>  <input type="number" onChange={(e) => setPourcentAsset1(e.target.value)} value={pourcentAsset1} />
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
        <span> pourcent asset </span>  <input type="number" onChange={(e) => setPourcentAsset2(e.target.value)} value={pourcentAsset2} />
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
        <br></br>
                

                <br></br> *********************************************************************************************<br></br><div className=" col-12">
                    <span>   Splm Primary:   </span>   <input type="text" onChange={(e) => setSplmPrimary(e.target.value)} value={splmPrimary} /> 
                    <br></br>
                    <br></br>
                    <span>   Splu primary:   </span>   <input type="text" onChange={(e) => setSpluPrimary(e.target.value)} value={spluPrimary} />                  
                </div>
                <br></br>
                <br></br>
                <label>user portfolio address  :  </label>

                <input type="text" onChange={(e) => setUserPortfolioAccount(e.target.value)} value={userPortfolioAccount} /> 
                <br></br>
                <br></br>
                <span> Asset 1 token:  </span> <input  value={asset1Obj.mintb}></input> 
                <span> Asset 1 manager account:  </span> <input value={asset1Obj.managerAsset1}></input>
                <span> Asset 1 user account:  </span> <input value={asset1Obj.spluAsset1}></input>
                <span> Asset 1 pool token:  </span> <input value={asset1Obj.tokenPool}></input>
                <span> Asset 1 fee account:  </span> <input value={asset1Obj.feeAccount}></input>
                <span> Asset 1 pool account:  </span> <input value={asset1Obj.tokenAccountPool}></input>
                <br></br>
                <br></br>
                <br></br>
                <span> Asset 2 token:  </span> <input  value={asset2Obj.mintb}></input> 
                <span> Asset 2 manager account:  </span> <input value={asset2Obj.managerAsset1}></input>
                <span> Asset 2 user account:  </span> <input value={asset2Obj.spluAsset1}></input>
                <span> Asset 2 pool token:  </span> <input value={asset2Obj.tokenPool}></input>
                <span> Asset 2 fee account:  </span> <input value={asset2Obj.feeAccount}></input>
                <span> Asset 2 pool account:  </span> <input value={asset2Obj.tokenAccountPool}></input>
                <br></br>
                <br></br>
                <br></br>
                <span> Amount:  </span> 
                <input onChange={(e) => setAmount(e.target.value)} value={amount}></input> 
                 <button onClick={() => depositPortfolio()} className="btn btn-primary">
                    Deposit in portfolio
                </button>
                <br />
                <br />
                {
                    idTransaction && <a onClick={createDynamicURL} >transaction swap explora </a>}
                <br></br>
                <br></br> *********************************************************************************************<br></br><br></br>
               
               {/*  <button onClick={() => createStableSwap()} className="btn btn-primary">
                create Stable Swap
                </button>   */} <br></br>
                <span>LP Token :</span><p>{lpTokenAsset1}</p><br/>
                <br></br>
                {enableTransaction ? (<><span>Signature  :</span><p>{signatureAsset1}</p><br/></>) : (<p>{null}</p>)}
                 <button onClick={() => createLpToken()} className="btn btn-primary">
                 create Lp Token
                </button>
                <br/>
                <br></br>
                <button onClick={() => depositIntoLP()} className="btn btn-primary">
                 Deposit into Lp Pool
                </button>
                <br></br>
                <br></br>
                 **************************** Farm ****************************<br></br>
                 <br></br>
                 <br></br>
                <button onClick={() => stakeTokens()} className="btn btn-primary">
                 Stake tokens
                </button>
                <br></br><br/>
                <button onClick={() => claimRewards()} className="btn btn-primary">
                Claim Rewards 
                </button><br/><br/>
                <button onClick={() => withdrawFormQuarry()} className="btn btn-primary">
                withdraw Form Quarry
                </button><br/><br/>
                <button onClick={() => withdrawFormSaber()} className="btn btn-primary">
                withdraw Form Saber
                </button>
                <br></br>
                <br></br>
                 *********************************************************************************************<br></br>
                <span> Amount:  </span> <input onChange={(e) => setAmountWithdraw(e.target.value)} value={amountWithdraw}></input> <button onClick={() => withdrawPortfolio()} className="btn btn-primary">
                    withdraw from portfolio
                </button>
                <br></br>
                <br></br>
      </div>
    </div>
  );

}

export default Portfolio;