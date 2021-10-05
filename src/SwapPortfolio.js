import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Wallet from '@project-serum/sol-wallet-adapter';
import { Connection, SystemProgram, Transaction, PublicKey } from '@solana/web3.js';
import InfoAccount from "./component/InfoAccount"
import { createNewAccountStep, createPoolStep, createSwapTokensStep, createTokenStep, createUserAccountStep, createUserTokenStep, mintTokenStep, mintUserTokenStep, swapStep } from './portfolio-swap.js/portfolioSwapSteps';


function SwapPortfolio() {
    const [logs, setLogs] = useState([]);
    const [swapTokens, setSwapTokens] = useState([]);
    const [authority, setAuthority] = useState("");
    const [assets, setAssets] = useState([
        {token:"zA18GJkmtRz7HZ7SwwytwmE9fxKTZX2icD4da4oDBxu", authority:"Dv6gTCbWZAo4onW4mFdcSZ2f3K5Zqa6vLQR1cMwsbdxi", nonce:253},
        {token:"53VmLJDCRDsen9SxiV7xk9eTqNCFeYF8EGseoDfpkiCY", authority:"Dv6gTCbWZAo4onW4mFdcSZ2f3K5Zqa6vLQR1cMwsbdxi", nonce:253}
    ]);
    const [accounts, setAccounts] = useState([
        {asset:{token:"zA18GJkmtRz7HZ7SwwytwmE9fxKTZX2icD4da4oDBxu", authority:"Dv6gTCbWZAo4onW4mFdcSZ2f3K5Zqa6vLQR1cMwsbdxi", nonce:253},account:"GquLrEL5R4gKNKk5iqpYNyswLcB8e9soWAxyiNRjH7M4"},
        {asset:{token:"53VmLJDCRDsen9SxiV7xk9eTqNCFeYF8EGseoDfpkiCY", authority:"Dv6gTCbWZAo4onW4mFdcSZ2f3K5Zqa6vLQR1cMwsbdxi", nonce:253},account:"9hEMQpcBs9VBFCSJnmd7o2bSh16FcibFB5t5eUtQMs2Q"},
    ]);
    const [userToken, setUserToken] = useState("5aZJMp4w1Rs7hQNrxwvV8cVjeCXPotADXttFQ8B1cga8");
    const [userVault, setUserVault] = useState("4qKkqLwCUtq6bVg1wVKNfq8AhiqU2jTiyJVsjNr17agc");
    const [pools, setPools] = useState([
        {account:accounts[0],poolToken:"52qUadP541ZPXcAW6LVB21ovkzMwkWY72sP3tD4eLxxd", accountPool:"E7GwzQMiwZzjxQ3mx8sAcdsitefLR2dKYP4hNacSayk5", feeAccount:"Hbxb6Qxw2n3zGkBr16YzSy6sJkunG8CqkTUvqp7UdCNb"},
        {account:accounts[1],poolToken:"32Eu5dWsZtXEj7DmnRwKYbTrkfwCowChDRPcZgBg7mvT", accountPool:"J5hqzoWZbCG3waG6E9qFfqPMD3YtWA2wmsCCRCg5JGPS", feeAccount:"J5QrfPB9fRNQBRGvpdye47rKHpR46Kj88SaMycm5WuMR"},
    ]);

    function addLog(log) {
        setLogs((logs) => [...logs, log]);
    }
    function addAssets(asset) {
        setAssets((assets) => [...assets, asset]);
    }
    function addAccounts(account) {
        setAccounts((accounts) => [...accounts, account]);
    }
    const network = "https://api.devnet.solana.com";
    const [providerUrl, setProviderUrl] = useState('https://www.sollet.io');
    const connection = useMemo(() => new Connection(network), [network]);
    const [values, setValues] = useState();
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
    function createInputs(n) {
        let ret = [];
        console.log("createInput nb =", n);
        for (var i = 1; i <= n; i++) {
            ret.push(
                <>
                    <div key={i}>
                        <input type="text" />

                    </div>
                    <br />
                </>
            )
        };
        return ret;

    }
    useEffect(() => {
        createInputs(values)
    }, [values]);


    function addInputs(event) {
        let val = event.target.value;
        console.log("nb asset ", val);
        setValues(val);
        //  createInputs(val);
    }

    async function createUserToken() {
        addLog("loading create user token ... ");
        try {
          createTokenStep(selectedWallet, connection).then(token => {
            setUserToken(token.mintA)
            setAuthority(token.authority)
            addLog("user Token public key => " + token.mintA+ " authority => "+ token.authority)
          })
            .catch(
              err => addLog("" + err)
            )
        }
        catch (err) {
          addLog("" + err);
        }
      }
    
      async function createUserVault() {
        addLog("loading create user vault ... ");
        try {
          createNewAccountStep(selectedWallet, connection, userToken,authority).then(result => {
            setUserVault(result)
            addLog("vault pk => " + result)
          })
            .catch(
              err => addLog("" + err)
            )
        }
        catch (err) {
          addLog("" + err);
        }
      }
    
      async function mintUserToken() {
        addLog("loading mint user token ... ");
        try {
            mintTokenStep(selectedWallet, connection, userToken,userVault).then(result => {
            addLog("user token successfully minted")
          })
            .catch(
              err => addLog("" + err)
            )
        }
        catch (err) {
          addLog("" + err);
        }
      }

    async function createTokens(values) {
        setAssets([])
        addLog("loading create Mints ... ");
        try {
            for (let i = 0; i < values; i++) {
                createTokenStep(selectedWallet, connection).then(token => {
                    addAssets({ "token": token.mintA, "authority": token.authority, "nonce":token.nonce})
                    addLog("publickey asset " + token.mintA+ " authority = " + token.authority+ " nonce= "+token.nonce)
                })
                .catch(
                    err => addLog("" + err)
                )
            }
        }
        catch (err) {
            addLog("" + err);
        }
    }

    async function createAccounts() {
        addLog("loading create accounts ... ");
        try {
            setAccounts([])
            assets.forEach(asset => {
                createNewAccountStep(selectedWallet, connection, asset.token, asset.authority).then(account => {
                    addLog("mint   " + asset.token + "account   " + account);
                    addAccounts({ "asset": asset, "account": account })
                })
                .catch(
                    err => {addLog("" + err) 
                    throw(err)}
                )
            })
        }
        catch (err) {
            {addLog("" + err) 
                    throw(err)}
        }
    }

    async function mintTokens() {
        try {
            accounts.forEach(account => {
                console.log("toooooooooooooookens :"+account.asset.token+"--"+ account.account)
                mintTokenStep(selectedWallet, connection, account.asset.token, account.account).then(result => {
                })
                .catch(
                    err => {addLog("" + err) 
                    throw(err)}
                )
            })
            addLog("assets minted successfully");
        }
        catch (err) {
            addLog("" + err) 
            throw(err)}
    }

    async function createPools() {
        addLog("loading create pools ... ");
        try {
                createPoolStep(selectedWallet, connection, accounts).then(pools => {
                    setPools(pools)
                    console.log("pools => "+pools)
                    addLog("success");
                })
                .catch(
                    err => {addLog("" + err) 
                    throw(err)}
                )

        }
        catch (err) {addLog("" + err) 
        throw(err)}
    }

    async function createSwapTokens() {
        addLog("loading create swap tokens ... ");
        try {
                createSwapTokensStep(selectedWallet, connection, userToken, userVault, pools).then(swapTokens => {
                    setSwapTokens(swapTokens)
                    addLog("swap tokens ok");
                })
                .catch(
                    err => {addLog("" + err) 
                    throw(err)}
                )
        }
        catch (err) {addLog("" + err) 
        throw(err)}
    }

    async function Swap() {
        addLog("loading swap ... ");
        try {
                swapStep(selectedWallet, connection, userToken, userVault, swapTokens, authority).then(result => {
                    addLog("swap ok");
                })
                .catch(
                    err => {addLog("" + err) 
                    throw(err)}
                )
        }
        catch (err) {addLog("" + err) 
        throw(err)}
    }


    return (
        <div className="App">
            <div id="sidebar">
                <div id="sidebaraccount">
                    <InfoAccount selectedWallet={selectedWallet} connection={connection}></InfoAccount>
                </div>
            </div>
            <div id="content-wrap">
                <h1> Swap Portfolio : </h1>
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
                        <button onClick={() => selectedWallet.disconnect()}>Disconnect</button>
                    </div>
                ) : (

                    <div>
                        <button onClick={() => setSelectedWallet(injectedWallet)} className="btn btn-primary"> Connect using sollet plugin</button>
                    </div>
                )}
                <hr />
                <br />
                <button onClick={() => createUserToken(values)} className="btn btn-primary"> create user token </button>
                <br />
                <br />
                <button onClick={() => createUserVault(values)} className="btn btn-primary"> create user vault </button>
                <br />
                <br />
                <button onClick={() => mintUserToken(values)} className="btn btn-primary"> mint user token </button>
                <br />
                <br />
                Portfolio's assets number : <input type="number" min="1" max="10" value={values} onChange={addInputs}></input><br />
                <br />
                Amount : <input type="number" ></input><br />
                <br />
                <br />
                <button onClick={() => createTokens(values)} className="btn btn-primary"> create portfolio's tokens</button>
                <br />
                <br />
                <button onClick={() => createAccounts()} className="btn btn-primary"> create portfolio's vaults </button>
                <br />
                <br />
                <button onClick={() => mintTokens()} className="btn btn-primary"> mint portfolio's tokens </button>
                <br />
                <br />
                <button onClick={() => createPools()} className="btn btn-primary"> create pools </button>
                <br />
                <br />
                <button onClick={() => createSwapTokens()} className="btn btn-primary"> create swap tokens </button>
                <br />
                <br />
                <button onClick={() => Swap()} className="btn btn-primary">Swap </button>
                <br />
                <br />
                <div className="logs">
                    {logs.map((log, i) => (
                        <div key={i}>{log}</div>
                    ))}
                </div>

            </div>
        </div>

    )

}

export default SwapPortfolio;