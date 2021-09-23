
import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Wallet from '@project-serum/sol-wallet-adapter';
import { Connection, SystemProgram, Transaction, PublicKey } from '@solana/web3.js';
import { createTokenA, createNewAccountTokenA, mintTokenA, createTokenB, createNewAccountTokenB, mintTokenB, createPoolToken, createSwapTokens, createSwap } from "./cli/makesteps"
import "./swapPage.css"
import InfoAccount from "./component/InfoAccount"

function SwapPage() {
  const [logs, setLogs] = useState([]);
  function addLog(log) {
    setLogs((logs) => [...logs, log]);
  }
  const network = "https://api.devnet.solana.com";
  const [providerUrl, setProviderUrl] = useState('https://www.sollet.io');
  const connection = useMemo(() => new Connection(network), [network]);
  const [mintA, setMintA] = useState("8TjfZNAg3KBpW8eAbD9kBkwa4QyYS1LNARLWYrmHn2AY")
  const [mintB, setMintB] = useState("HsfuMAHUBkij97qv7VxjmfJJBVEaSSy8mHm3YBtcrh2P");
  const [accountA, setAccountA] = useState("HhHmLqT63mt5KNr2qpZytmmDn4Q9TqyrXdcSZijVZVVz")
  const [accountB, setAccountB] = useState("87cTTQ3bsiFqrHwwuxK2kUh8iZjQ14T9KV1c4YQ24JcL")
  const [poolToken, setPoolToken] = useState("7Wdmn7qAiq6XKQWcwVAg62qKyuRrQposgfesJgV2Yngi")
  const [accountPool, setAccountPool] = useState("HhCHdqp7xagbSm3S36Fzip9hNmfg3ikJjpgzQDML1CLs")
  const [autorithy, setAuthority] = useState("6bp6FKx6R47oosSX47i6Ux2S5KRcJsvFgXsA3ZetSaL4")
  const [tokenSwap, setTokenSwap] = useState("Af2btwAACYUsjzcGfDLDncRehPz2YT11DqEfhMaWXhrZ")
  const [feeAccount, setFeeAccount] = useState("3KQNZ5E9Yvi25myqJf4n7tEQA8LY99pJWTSLb2jBM2uB")
  const [nonce, setNonce] = useState(255)
  const [idTransaction, setIdTransaction] = useState()
  const injectedWallet = useMemo(() => {
    try {
      console.log(network)
      //@ts-ignore
      return new Wallet(window.sollet, network);
    } catch (e) {
      console.log(`Could not create injected wallet: ${e}`);
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
  function toHex(buffer) {
    return Array.prototype.map
      .call(buffer, (x) => ('00' + x.toString(16)).slice(-2))
      .join('');
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
  //create token A
  async function createTokenASwap() {
    addLog("loading create Mint A... ");
    try {
      createTokenA(selectedWallet, connection).then(token => {
        setMintA(token.mintA)
        setAuthority(token.authority)
        setNonce(token.nonce)
        addLog("publickey tokenA   " + token.mintA + " authorty = " + token.authority)
      })
        .catch(
          err => addLog("" + err)
        )

    }
    catch (err) {
      addLog("" + err);
    }

  }
  //create token B
  async function createTokenBSwap() {
    addLog("loading create mint B ... ");
    try {
      createTokenB(selectedWallet, connection).then(token => {

        setMintB(token.mintB)

        setAuthority(token.authority)
        setNonce(token.nonce)
        addLog("publickey tokenB   " + token.mintB + "authority" + token.authority)
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
  // create Account A 
  function createAccountA() {
    addLog("loading create account A... ");
    let mint = mintA
    let autority = autorithy
    try {
      createNewAccountTokenA(selectedWallet, connection, mint, autority)
        .then(account => {
          addLog("account   " +account);
          setAccountA(account)
        })
        .catch(
          err => addLog("" + err)
        )
    } catch (err) {
      addLog("" + err);
    }
  }
  // create Account B
  async function createAccountB() {
    let mint = mintB
    let autority = autorithy
    addLog("loading create account B ... ");
    try {
      createNewAccountTokenB(selectedWallet, connection, mint, autority)
        .then(account => {
          setAccountB(account)
        })
        .catch(
          err => addLog("" + err)
        )
    } catch (err) {
      addLog("" + err);
    }

  }
  async function mintTokenSwapA() {

    addLog("loading ... ");
    let MINT_ADDRESS = mintA
    let ACCOUNT_ADDRESS = accountA
    mintTokenA(
      selectedWallet,
      connection,
      MINT_ADDRESS,
      ACCOUNT_ADDRESS
    ).then((account) => addLog(
      "amount" + account.amount + "  addres" + account.address));


  }

  async function mintTokenSwapB() {
    let MINT_ADDRESS = mintB
    let ACCOUNT_ADDRESS = accountB
    addLog("loading mint B... ");
    try {
      mintTokenB(selectedWallet, connection, MINT_ADDRESS,
        ACCOUNT_ADDRESS).then(token =>
          addLog(
            "amount" + token.amount + "  addres" + token.address))
        .catch(
          err => addLog("" + err)
        )
    }
    catch (err) {
      addLog("" + err);
    }

  }

  async function createPool() {
    addLog("loading create pool... ");
    let autority = autorithy
    try {
      createPoolToken(selectedWallet, connection, autority)
        .then(token => {
          console.log("createPool result " + token)
          setAccountPool(token.accountPool)
          setPoolToken(token.poolToken)
          setFeeAccount(token.feeAccount)

          addLog("accountPool" + token.accountPool + " tokenPool" + token.poolToken + "feeAccount" + token.feeAccount)
        })
        .catch(
          err => addLog("" + err)
        )
    } catch (err) {
      addLog("" + err);
    }
  }
  async function swapTokens() {
    addLog("loading swap token... ");
    let minta = mintA
    let mintb = mintB
    let accounta = accountA
    let accountb = accountB
    let pooltoken = poolToken
    let feeaccount = feeAccount
    let accountpool = accountPool
    let autority = autorithy
    let Nonce = nonce
    //try {
      createSwapTokens(selectedWallet, connection, minta, mintb, accounta, accountb, pooltoken, feeaccount, accountpool, autority, Nonce)
        .then(token => {
          setTokenSwap(token.tokenSwap)

          addLog(
            JSON.stringify(token.tokenSwap))
        }
        )
    //     .catch(
    //       err => addLog("" + err)
    //     )
    // }
    // catch (err) {
    //   addLog("" + err);
    // }

  }
  async function swap() {
    addLog("loading swap ......");
    try {
      let minta = mintA
      let mintb = mintB
      let accounta = accountA
      let accountb = accountB
      let pooltoken = poolToken
      let feeaccount = feeAccount
      let accountpool = accountPool
      let autority = autorithy
      let tokenSwapPubkey = new PublicKey(tokenSwap)
      createSwap(selectedWallet, connection, tokenSwapPubkey, new PublicKey(minta), mintb, accounta, accountb, pooltoken, feeaccount, accountpool, autority).then(
        token => {
          setIdTransaction(token)
          addLog(JSON.stringify(token))

        }
      )

    }
    catch (err) {
      addLog("" + err)
    }


  }

  function createDynamicURL() {
    window.open(`https://explorer.solana.com/tx/${idTransaction}?cluster=devnet`, '_blank', 'resizable=yes')

  }

  return (
    <div className="App" id="main-wrap" >
      <div id="sidebar"> <div id="sidebaraccount"><InfoAccount selectedWallet={selectedWallet} connection={connection}></InfoAccount> </div>  </div>
      <div id="content-wrap"> <h1>Nova Finance Test Interface</h1>
        <div>Network: {network}</div>
        <div>
          Waller provider:{' '}
          <input
            type="text"
            value={providerUrl}
            onChange={(e) => setProviderUrl(e.target.value.trim())}
          />
        </div>
        <br></br>
        {selectedWallet && selectedWallet.connected ? (
          <div>
            <div>Wallet address: {selectedWallet.publicKey.toBase58()}.</div>
            <button onClick={sendTransaction}>Send Transaction</button>
            <button onClick={signMessage}>Sign Message</button>
            <button onClick={() => selectedWallet.disconnect()}>Disconnect</button>
          </div>
        ) : (

          <div>
            <button onClick={() => setSelectedWallet(injectedWallet)} className="btn btn-primary"> Connect using sollet plugin</button>
          </div>
        )}
        <hr />
        <div className="logs">
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>


        <button onClick={() => createTokenASwap()} className="btn btn-primary">

          createTokenA
        </button>
        <br></br>

        <br></br>
        <div className=" col-12">
          <span>   Mint A:   </span>   <input type="text" onChange={(e) => setMintA(e.target.value)} value={mintA} />  <span> Authority: </span><input type="text" onChange={(e) => setAuthority(e.target.value)} value={autorithy} /> <button onClick={() => createAccountA()} className="btn btn-primary">

            CreateAccountA
          </button>
        </div>
        <br></br>

        <br></br>
        <div className=" col-12">
          <span>    Mint A:  </span><input type="text" onChange={(e) => setMintA(e.target.value)} value={mintA} />  <span>Account A: </span><input type="text" onChange={(e) => setAccountA(e.target.value)} value={accountA} />  <button onClick={() => mintTokenSwapA()} className="btn btn-primary">
            MintTokenA
          </button>
        </div>
        <br></br> <br></br>*********************************************************************************************<br></br>
        <button onClick={() => createTokenBSwap()} className="btn btn-primary">
          CreateTokenB
        </button>
        <br></br>

        <br></br>
        <span> MintB:  </span> <input onChange={(e) => setMintB(e.target.value)} value={mintB}></input>  <span>  Authority:</span><input type="text" onChange={(e) => setAuthority(e.target.value)} value={autorithy} />  <button onClick={() => createAccountB()} className="btn btn-primary">


          CreateAccountB
        </button>
        <br></br>

        <br></br>
        <span> MintB: </span> <input onChange={(e) => setMintB(e.target.value)} value={mintB}></input> <span> Account B:</span> <input onChange={(e) => setAccountB(e.target.value)} value={accountB}></input> <button onClick={() => mintTokenSwapB()} className="btn btn-primary">

          MintTokenB
        </button>
        <br></br> <br></br>*********************************************************************************************<br></br>

        <span>  Authority:</span><input onChange={(e) => setAuthority(e.target.value)} value={autorithy}></input> <button onClick={() => createPool()} className="btn btn-primary">

          createPool
        </button>
        <br></br> <br></br>*********************************************************************************************<br></br>
        <span>    mintA :</span><input onChange={(e) => setMintA(e.target.value)} value={mintA} />

        <span>   AccountA  </span> <input type="text" onChange={(e) => setAccountA(e.target.value)} value={accountA} /> <br /><br /> <span> mintB </span><input onChange={(e) => setMintB(e.target.value)} value={mintB} /> <span>accountB </span> <input onChange={(e) => setAccountB(e.target.value)} value={accountB} /> <br />
        <br /><br /> <span>Authority </span><input type="text" onChange={(e) => setAuthority(e.target.value)} value={autorithy} /> <span>nonce </span><input type="text" onChange={(e) => setNonce(e.target.value)} value={nonce} /><br /> <br /><span>poolToken </span> <input type="text" onChange={(e) => setPoolToken(e.target.value)} value={poolToken} /> <span>feeAccount </span><input type="text" onChange={(e) => setFeeAccount(e.target.value)} value={feeAccount} />  <span>AccountPool: </span><input type="text" onChange={(e) => setAccountPool(e.target.value)} value={accountPool} />
        <br /> <br /> <br /><button onClick={() => swapTokens()} className="btn btn-primary" >
          swap Token
        </button>

        <br></br> <br></br>*********************************************************************************************<br></br>
        <span>  mintA : </span><input onChange={(e) => setMintA(e.target.value)} value={mintA} />

        <span>   AccountA  </span><input type="text" onChange={(e) => setAccountA(e.target.value)} value={accountA} />
        <br /> <br /> <span>mintB </span><input onChange={(e) => setMintB(e.target.value)} value={mintB} /> <span>accountB </span> <input onChange={(e) => setAccountB(e.target.value)} value={accountB} /> <br />  <br /><br /> <span>Authority </span><input type="text" onChange={(e) => setAuthority(e.target.value)} value={autorithy} /> <span>token Swap </span><input type="text" onChange={(e) => setTokenSwap(e.target.value)} value={tokenSwap} /> <br /> <br /> <span>poolToken </span><input type="text" onChange={(e) => setPoolToken(e.target.value)} value={poolToken} /> <span>feeAccount </span><input type="text" onChange={(e) => setFeeAccount(e.target.value)} value={feeAccount} />  <span>AccountPool: </span><input type="text" onChange={(e) => setAccountPool(e.target.value)} value={accountPool} />
        <br /> <br /> <br /><button onClick={() => swap()} className="btn btn-primary"> Swap</button>
        <br></br>
        <br />
        <br />
        {
          idTransaction && <a onClick={createDynamicURL} >transaction swap explora </a>}


      </div>
    </div>
  );



}

export default SwapPage;