
import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Wallet from '@project-serum/sol-wallet-adapter';
import { Connection, SystemProgram, Transaction, PublicKey } from '@solana/web3.js';
import { createTokenA, createNewAccountTokenA, mintTokenA, createTokenB, createNewAccountTokenB, mintTokenB, createPoolToken, createSwapTokens, createSwap  , depositInPortfolio } from "./cli/makestepsPortfolioSwap"
import "./PortfolioSwap.css"
import InfoAccount from "./component/InfoAccount"

function PortfolioSwap() {
    const [logs, setLogs] = useState([]);
    function addLog(log) {
        setLogs((logs) => [...logs, log]);
    }
    const network = "https://psytrbhymqlkfrhudd.dev.genesysgo.net:8899"
    const [providerUrl, setProviderUrl] = useState('https://www.sollet.io');
    const connection = useMemo(() => new Connection(network), [network]);
    const [mintA, setMintA] = useState("5BGi9aydFLs335WuaYJTABqLbXCKdxVdpfrB2R1QtFFc")
    const [mintB, setMintB] = useState("HsfuMAHUBkij97qv7VxjmfJJBVEaSSy8mHm3YBtcrh2P");
    const [accountA, setAccountA] = useState("Dkqz2HsXovLDuPrbz1wffNLJnnemEnq3c8adTEniCnPT")
    const [accountB, setAccountB] = useState("87cTTQ3bsiFqrHwwuxK2kUh8iZjQ14T9KV1c4YQ24JcL")
    const [poolToken, setPoolToken] = useState("7Wdmn7qAiq6XKQWcwVAg62qKyuRrQposgfesJgV2Yngi")
    const [accountPool, setAccountPool] = useState("HhCHdqp7xagbSm3S36Fzip9hNmfg3ikJjpgzQDML1CLs")
    const [autorithy, setAuthority] = useState("6bp6FKx6R47oosSX47i6Ux2S5KRcJsvFgXsA3ZetSaL4")
    const [tokenSwap, setTokenSwap] = useState("Af2btwAACYUsjzcGfDLDncRehPz2YT11DqEfhMaWXhrZ")
    const [feeAccount, setFeeAccount] = useState("3KQNZ5E9Yvi25myqJf4n7tEQA8LY99pJWTSLb2jBM2uB")
    const [nonce, setNonce] = useState(255)
    const [idTransaction, setIdTransaction] = useState()
    const [selectedPortfolio, setSelectedPortfolio] = useState("3KQNZ5E9Yvi25myqJf4n7tEQA8LY99pJWTSLb2jBM2uB")
    const [amount, setAmount] = useState()
    const [primqrySpl, setPrimqrySPL] = useState("DJmqhE59DfjcaQQZDnXfwMgr5tFuhr9kLZ6DrDVMkhCK")

    const [asset1, setAsset1] = useState({
        createAccountProgramm : "8RfDxCrS4yCpHwuj131AJbYTL4QquzCB6TXrs3Hj7vun",
         minta :"5BGi9aydFLs335WuaYJTABqLbXCKdxVdpfrB2R1QtFFc",
         mintb :"D1FAA8qeo17WYgze53U3VEAVknVASCbVGBMszQ76fdK8",
         accounta :"HwsA9mBjnZEaNjM2edvoAsCYfd3LFT7fMcWehZNqwfvv",
          accountb :"DexCKvu85btXYWJVuvvNb1y9WnE4gZgkRLKrjswzT4Kz",
          pooltoken :"FfVcqbB9UDdJfeTrrPcArNwxQRkUd1hCod3r1E4HLWFW",
          feeacoount :"EzbYEZe1d8iT5T6wkAF126aDwcprkSwBfMaAVtHwo2mv",
          accountpool :"FFKo6NYVzbv43fKHrQ1RY7UejLLbfRGF8pZDXnKZvgEh",
        autority :"Cpm8hUiqMJ5PfFphQEhBr4EQYDaVA83KjPoY4tbLaLoY",
        tokenswap : "8RfDxCrS4yCpHwuj131AJbYTL4QquzCB6TXrs3Hj7vun",
        userAccountA  : "Dkqz2HsXovLDuPrbz1wffNLJnnemEnq3c8adTEniCnPT",
        userAccountB : "CEnv2giFo1B9mDzWLsByvLujVWKXZox4dfdtBvjSqAJf",
    })
    const [asset2, setAsset6] = useState({
        createAccountProgramm : "65HtXX63thUK1tptxaneP9ffHCLhizfttbwFze8Z8x8F",
        minta :"5BGi9aydFLs335WuaYJTABqLbXCKdxVdpfrB2R1QtFFc",
        mintb :"HFdGgdFaRJEj8BLpyjZmzDexkaQhFqrLt2bFyMxvMDw9",
        accounta :"2RwSdPn6buiyq7QEvUBen3kychLcWzWXgGWoXzaAEUbb",
        accountb :"HKaKzf1VCNBBivheFQABGLFbzVthCS5qD2ho5dPy8Zjv",
        pooltoken :"94tkdNZnetJkyUbYziBsCzRUqkMpMVAcAKvHkS6hztFm",
        feeacoount :"2wrmL8Q6KAHbXMbVY8j4uzyH8QsdzzTnaD9q3Dh4YzHa",
        accountpool :"2m2SgJ821gtos4oMfKXPFdYFG3SWy1ka4Ltt5yxm9xWJ",
        autority :"DPJJRVfywAD7xBgQAjgukko9UcwZb35gKjirTDetU53Q",
        tokenswap : "65HtXX63thUK1tptxaneP9ffHCLhizfttbwFze8Z8x8F",
        userAccountA  : "J6qsWE5a67QY2332Xv5WtCqiy1Hqfe7EPAzjQmVWFrKY",
        userAccountB : "Gf4Johh55ngCafXPR95sGSgwEtPHCXpebzeWFs7PeEGc",
    })
    const [portfolios, setPortfolios] = useState([
        "3KQNZ5E9Yvi25myqJf4n7tEQA8LY99pJWTSLb2jBM2uB"
    ]);


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

    let MakeItem = function (X) {
        return <option>{X}</option>;
    };

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
                    addLog("account   " + account);
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
            mintA,
            accountA
        ).then((account) => addLog(
            "amount" + account.amount + "  addres" + account.address));


    }

    async function depositPortfolio() {
        addLog("loading deposit... ");
        try {

            let TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
            let TOKEN_SWAP_PROGRAM_ID = '5e2zZzHS8P1kkXQFVoBN6tVN15QBUHMDisy6mxVwVYSz';
           // let userTransferAuthority = new Account([155,200,249,167,10,23,75,131,118,125,114,216,128,104,178,124,197,52,254,20,115,17,181,113,249,97,206,128,236,197,223,136,12,128,101,121,7,177,87,233,105,253,150,154,73,9,56,54,157,240,189,68,189,52,172,228,134,89,160,189,52,26,149,130]);
            let createAccountProgramm = asset1.createAccountProgramm;
            let minta = asset1.minta;
            let mintb = asset1.mintb;
            let spluPRIMARY = asset1.userAccountA;
            let manager_asset1 = asset1.accountb;
            let tokenPool = asset1.pooltoken;
            let feeAccount = asset1.feeacoount;
            let tokenAccountPool = asset1.accountpool;
            let autority = asset1.autority;
            let tokenSwap = asset1.tokenswap;

            let managerPRIMARY  = asset1.accounta;
            let splu_asset1 = asset1.userAccountB; 

            let portfolioAddress = "4t54Gy7cgRkr36vQFumRFRgEF1SmwsWYntqVgYEUeR85";
      

            let UserPortfolioAccount=  "GgzBnJAVb4vLHrQUV1JAJjJz73ZM987JsPe7wCpSbu6T";


            depositInPortfolio(selectedWallet, connection,   portfolioAddress,UserPortfolioAccount,tokenSwap,autority ,
                /*userTransferAuthority,*/ spluPRIMARY , managerPRIMARY ,manager_asset1 , splu_asset1 , tokenPool , feeAccount , 
              TOKEN_PROGRAM_ID,tokenAccountPool  , TOKEN_SWAP_PROGRAM_ID  ,
              amount , minta , mintb).then(
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
        //try {
        let minta = mintA
        let mintb = mintB
        let accounta = accountA
        let accountb = accountB
        let pooltoken = poolToken
        let feeaccount = feeAccount
        let accountpool = accountPool
        let autority = autorithy
        let tokenSwapPubkey = tokenSwap
        createSwap(selectedWallet, connection, tokenSwapPubkey, minta, mintb, accounta, accountb, pooltoken, feeaccount, accountpool, autority).then(
            token => {
                setIdTransaction(token)
                addLog(JSON.stringify(token))

            }
        )

        // }
        // catch (err) {
        //   addLog("" + err)
        // }


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

                <h1>Primary SPL</h1>

                <br></br>
                <div className=" col-12">
                    <span>   Mint A:   </span>   <input type="text" onChange={(e) => setMintA(e.target.value)} value={mintA} /> 
                </div>

                <br></br> *********************************************************************************************<br></br>
                <h1>Portfolio</h1>
                <label>Select a portfolio  :  </label>
                <select onChange={(e) => setSelectedPortfolio(e.target.value)}>{portfolios.map(MakeItem)}</select>
                <br></br>
                <br></br>
                <span> Asset 1 token:  </span> <input  value={asset1.mintb}></input> 
                <span> Asset 1 manager account:  </span> <input value={asset1.accountb}></input>
                <span> Asset 1 user account:  </span> <input value={asset1.userAccountB}></input>
                <span> Asset 1 pool token:  </span> <input value={asset1.pooltoken}></input>
                <span> Asset 1 fee account:  </span> <input value={asset1.feeacoount}></input>
                <span> Asset 1 pool account:  </span> <input value={asset1.accountpool}></input>
                <br></br>
                <br></br>
                <br></br>
                <span> Asset 2 token:  </span> <input  value={asset2.mintb}></input> 
                <span> Asset 2 manager account:  </span> <input value={asset2.accountb}></input>
                <span> Asset 2 user account:  </span> <input value={asset2.userAccountB}></input>
                <span> Asset 2 pool token:  </span> <input value={asset2.pooltoken}></input>
                <span> Asset 2 fee account:  </span> <input value={asset2.feeacoount}></input>
                <span> Asset 2 pool account:  </span> <input value={asset2.accountpool}></input>
                <br></br>
                <br></br>
                <br></br>
                <span> Amount:  </span> <input onChange={(e) => setAmount(e.target.value)} value={amount}></input>  <button onClick={() => depositPortfolio()} className="btn btn-primary">
                    Deposit in portfolio
                </button>
                <br></br>
                <br></br>



            </div>
        </div>
    );



}

export default PortfolioSwap;