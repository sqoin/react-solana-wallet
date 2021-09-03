
import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Wallet from '@project-serum/sol-wallet-adapter';
import { Connection, SystemProgram, Transaction, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { createTokenA, createNewAccountTokenA, mintTokenA, createTokenB, createNewAccountTokenB, mintTokenB, createPoolToken, createSwapNToken, createSwap, getTokenAccountsByOwnerSolet, getProgrammSwapOwner, getAccountSwapByMint } from "./cli/makesteps"

function toHex(buffer) {
  return Array.prototype.map
    .call(buffer, (x) => ('00' + x.toString(16)).slice(-2))
    .join('');
}

function SwapOriginal() {
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


  const [mintA, setMintA] = useState("")
  const [accountA, setAccountA] = useState("")
  const [mintB, setMintB] = useState("");
  const [accountB, setAccountB] = useState("")
  const [poolToken, setPoolToken] = useState("")
  const [accountPool, setAccountPool] = useState("")
  const [owner, setOwner] = useState("")
  const [autorithy, setAuthority] = useState("")
  const [tokenSwap, setTokenSwap] = useState("")
  const [feeAccount, setFeeAccount] = useState("")
  const [accountInfo, setAccountInfo] = useState()
  // const[authority,setAuthority]=useState()
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
        setAuthority(token[0].authority.publicKey)
        setMintA(token[0].mintA.publicKey.toBase58())
        setOwner(token[0].owner.publicKey.toBase58())

        console.log("token " + token[0].mintA.publicKey.toBase58())
        addLog("publickey tokenA   " + token[0].mintA.publicKey.toBase58() + " authorty = " + token[0].authority + " owner =" + token[0].owner.publicKey.toBase58())

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
        console.log(token.publicKey.toBase58())
        setMintB(token.publicKey.toBase58())
        addLog("publickey tokenB   " + token.publicKey.toBase58())
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
    try {
      createNewAccountTokenA(selectedWallet, connection)
        .then(account => {

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
    addLog("loading create account B ... ");
    try {
      createNewAccountTokenB(selectedWallet, connection)
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
    addLog("loading mint A... ");
    try {
      mintTokenA(selectedWallet, connection).then(token =>
        addLog(
          "amount " + token.amount + "addres " + token.address))
        .catch(
          err => addLog("" + err)
        )
    }
    catch (err) {
      addLog("" + err);
    }



  }

  async function mintTokenSwapB() {
    addLog("loading mint B... ");
    try {
      mintTokenB(selectedWallet, connection).then(token =>
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
    // try {
    createPoolToken(selectedWallet, connection, autorithy)
      .then(token => {
        console.log("createPool result " + JSON.stringify(token))
        // setAccountPool(token.accountPool)
        // setPoolToken(token.poolToken)
        // setFeeAccount(token.feeAccount)

        // addLog("accountPool" + token.accountPool + " tokenPool" + token.poolToken + "feeAccount" + token.feeAccount)
      })
    // .catch(
    //   err => addLog("" + err)
    // )
    // }catch (err) {
    //   addLog("" + err);
    // }
  }
  async function swapNToken() {
    addLog("loading swap token... ");
    try {
      createSwapNToken(selectedWallet, connection)
        .then(token => {
          setTokenSwap(token.tokenSwap)

          addLog(
            JSON.stringify(token.tokenSwap))
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
  async function swap() {
    addLog("loading swap ......");
    try {
      createSwap(selectedWallet, connection).then(
        token =>
          addLog(JSON.stringify(token)))

    }
    catch (err) {
      addLog("" + err)
    }


  }
  /////************ get Account Info */

  async function getTokenAccountsByOwner() {
    addLog("loading  token   account by owner");
    try {
      getTokenAccountsByOwnerSolet(selectedWallet, connection).then(
        accountInfo => {
          setAccountInfo(accountInfo.value)
          addLog("************" + accountInfo.value)
        }
      )
    }
    catch (err) {
      addLog(err)
    }

  }
  /**************** get programm owner */
  async function getProgrammOwner() {

    addLog("loading get Programm Owner")
    try {

      getProgrammSwapOwner(selectedWallet, connection).then(token =>
        addLog(token))




    }
    catch (err) {
      addLog("" + err)
    }
  }

  /************************get programma account by mint  */


  async function getProgrammaAccountByMint() {
    addLog("Loading get programm account by mint")


    try {
      getAccountSwapByMint(selectedWallet, connection).then(token => addLog(token))

    }
    catch (err) {
      addLog(err)
    }

  }
  function renderInfoAccounts() {


  }
  return (
    <div className="App">
      <h1>Nova Finance Test Interface</h1>
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
          <button onClick={() => setSelectedWallet(injectedWallet)}>Connect using sollet plugin</button>
        </div>
      )}
      <hr />
      <div className="logs">
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>


      <button onClick={() => createTokenASwap()}>

        createTokenA
      </button>
      <br></br>

      <input type="text" onChange={(e) => setMintA(e.target.value)} value={mintA} />
      <br></br>

      <button onClick={() => createAccountA()}>


        createAccountA
      </button>
      <br></br>

      <input type="text" onChange={(e) => setAccountA(e.target.value)} value={accountA} />

      <br></br>
      <button onClick={() => mintTokenSwapA()}>

        MintTokenA
      </button>
      <br></br><br></br><br></br>
      <button onClick={() => createTokenBSwap()}>
        createTokenB
      </button>
      <br></br>
      <input onChange={(e) => setMintB(e.target.value)} value={mintB}></input>
      <br></br>
      <button onClick={() => createAccountB()}>


        createAccountB
      </button>
      <br></br>
      <input onChange={(e) => setAccountB(e.target.value)} value={accountB}></input>
      <br></br>
      <button onClick={() => mintTokenSwapB()}>

        MintTokenB
      </button>
      <br></br><br></br><br></br>
      *********{autorithy}
      <input onChange={(e) => setAuthority(e.target.value)} value={autorithy}></input> <button onClick={() => createPool()}>

        createPool
      </button>
      <br></br>
      <button onClick={() => swapNToken()}>
        swap Token
      </button>
      <br></br>
      <button onClick={() => swap()}>Swap</button>
      <br></br>
      <hr />
      <button onClick={() => getTokenAccountsByOwner()}>get Token Accounts By Owner</button>
      <table >




        <tr>
          <th>publickey</th>
          <th>amount</th>
          <th>owner</th>
        </tr>


        {
          accountInfo && accountInfo.map(item =>
            <tr>

              <td >{item.pubkey.toBase58()}</td>
              <td >{item.account.lamports}</td>
              <td >{item.account.owner.publicKey}</td>
            </tr>
          )
        }




      </table>
      <button onClick={() => getProgrammOwner()} > get Programm owner</button>
      <button onClick={() => getProgrammaAccountByMint()}> get programm Account By Mint</button>
    </div>
  );



}

export default SwapOriginal;