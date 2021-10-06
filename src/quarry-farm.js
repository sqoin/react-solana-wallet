
import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Wallet from '@project-serum/sol-wallet-adapter';
import { Connection, SystemProgram, Transaction, clusterApiUrl,PublicKey } from '@solana/web3.js';
import { createMMStep, sendLamportToMMStep, sendTokenToMMStep, createTokenStep, createVaultStep, mintTokenToVaultStep, createMarketStep, swapAtoBStep, placeOrderStep } from './cli/serum-steps';
import InfoAccount from './component/InfoAccount';
import "./Saber.css"
import { claimRewardStep, ComputeRewardStep, createMinerStep, createQuarryStep, createRewarderStep, createStakeTokenStep, createTokenWrapperStep, mintLpTokenStep, setQuarryRewardShareStep, stakeStep, syncRewarderStep, whiteListRewarderStep, withdrawStep } from './quarry-farm/quarry-steps';
function toHex(buffer) {
  return Array.prototype.map
    .call(buffer, (x) => ('00' + x.toString(16)).slice(-2))
    .join('');
}

function QuarryFarm() {
  const [logs, setLogs] = useState([]);
  function addLog(log) {
    setLogs((logs) => [...logs, log]);
  }
 // const network = "http://127.0.0.1:8899";
  const network = clusterApiUrl('devnet');
  const [providerUrl, setProviderUrl] = useState('https://www.sollet.io');
  const connection = useMemo(() => new Connection(network), [network]);
  const urlWallet = useMemo(() => new Wallet(providerUrl, network), [
    providerUrl,
    network,
  ]);
  const [tokenInfo, setTokenInfo] = useState("no Info");
const [stakeToken,setStakeToken]=useState("DEjsoW2aNiSqdw57828BukUkQemwsx483SX95xNX9hzW")
const [rewardToken,setRewardToken]=useState("FnHA1GbWfBHqZPPUSwhXuYwoL8h5Uks6vD6FmQdFehP3")
const [rewardWrapper,setRewardWrapper]=useState("CcykWMF8fyN555TBvoUKbmVXBudWbvE2Hst41Ff7aozV")
const [rewarder,setRewarder]=useState("AEfTEEGiAqEUTWCacTnw8dU9iYdz98hCrdPJJwX3xKfa")
const [quarry,setQuarry]=useState("")
const [miner,setMiner]=useState("")
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

 async function createStakedToken(){
  addLog("loading staked token ... ");
  try {
      //createTokenStep(selectedWallet, connection).then(result =>{
      createStakeTokenStep(selectedWallet, connection).then(result =>{
       setStakeToken(result)
       addLog("staked token successfully created")
       addLog("staked token pk => "+result)
      } )
      .catch(
        err => addLog("" + err)
      )
  }
  catch (err) {
    addLog("" + err);
  }
  }

  async function createRewardToken(){
    addLog("loading reward token wrapper ... ");
    try {
        createTokenWrapperStep(selectedWallet, connection).then(result =>{
         setRewardToken(result.rewardsMint)
         setRewardWrapper(result.wrapperKey)
         addLog("Reward token wrapper successfully created")
         addLog("Reward token pk => "+result.rewardsMint)
         addLog("Reward token wrapper pk => "+result.wrapperKey)
        } )
        .catch(
          err => {addLog("" + err)
          //throw(err)
        }
        )
    }
    catch (err) {
      addLog("" + err);
      //throw(err)
    }
    }
  
    async function createRewarder(){
      addLog("loading rewarder ... ");
      try {
          createRewarderStep(selectedWallet, connection, rewardWrapper).then(result =>{
           setRewarder(result)
           addLog("Rewarder successfully created")
           addLog("Rewarder pk => "+result)
          } )
          .catch(
            err => {addLog("" + err)
            //throw(err)
          }
          )
      }
      catch (err) {
        addLog("" + err);
        //throw(err)
      }
      }

      async function syncRewarder(){
        addLog("loading synchronize rewarder ... ");
        try {
          syncRewarderStep(selectedWallet, connection, rewarder).then(result =>{
             //setRewarder(result)
             addLog("Rewarder successfully synchronized")
            } )
            .catch(
              err => {addLog("" + err)
              //throw(err)
            }
            )
        }
        catch (err) {
          addLog("" + err);
          //throw(err)
        }
        }

        async function createQuarry(){
          addLog("loading create quarry ... ");
          try {
            createQuarryStep(selectedWallet, connection, rewarder, stakeToken).then(result =>{
               addLog("Quarry successfully created")
               addLog("Quarry pk => "+ result)
              } )
              .catch(
                err => {addLog("" + err)
                //throw(err)
              }
              )
          }
          catch (err) {
            addLog("" + err);
            //throw(err)
          }
          }

          async function createMiner(){
            addLog("loading create miner ... ");
            try {
              createMinerStep(selectedWallet, connection, rewarder, stakeToken).then(result =>{
                 addLog("Miner successfully created")
                 addLog("Miner PK => "+ result)
                } )
                .catch(
                  err => {addLog("" + err)
                  //throw(err)
                }
                )
            }
            catch (err) {
              addLog("" + err);
              //throw(err)
            }
            }

            async function mintLPToken(){
              addLog("loading mint LP token ... ");
              try {
                mintLpTokenStep(selectedWallet, connection, rewarder, stakeToken).then(result =>{
                   addLog("success")
                   addLog("vault PK => "+ result)
                  } )
                  .catch(
                    err => {addLog("" + err)
                    //throw(err)
                  }
                  )
              }
              catch (err) {
                addLog("" + err);
                //throw(err)
              }
              }

            async function stake(){
              addLog("loading stake into quarry ... ");
              try {
                stakeStep(selectedWallet, connection, rewarder, stakeToken).then(result =>{
                   addLog("success")
                  } )
                  .catch(
                    err => {addLog("" + err)
                    //throw(err)
                  }
                  )
              }
              catch (err) {
                addLog("" + err);
                //throw(err)
              }
              }

              async function claimReward(){
                addLog("loading claim reward ... ");
                try {
                  claimRewardStep(selectedWallet, connection,  rewarder, stakeToken, rewardToken).then(result =>{
                     addLog("success")
                    } )
                    .catch(
                      err => {addLog("" + err)
                      //throw(err)
                    }
                    )
                }
                catch (err) {
                  addLog("" + err);
                  //throw(err)
                }
                }

                async function setQuarryRewardShare(){
                  addLog("loading set quarry reward share ... ");
                  try {
                    setQuarryRewardShareStep(selectedWallet, connection,  rewarder, stakeToken).then(result =>{
                       addLog("success")
                      } )
                      .catch(
                        err => {addLog("" + err)
                        //throw(err)
                      }
                      )
                  }
                  catch (err) {
                    addLog("" + err);
                    //throw(err)
                  }
                  }

                  async function whiteListRewarder(){
                  addLog("loading white list rewarder ... ");
                  try {
                    whiteListRewarderStep(selectedWallet, connection,  rewarder, rewardWrapper).then(result =>{
                       addLog("success")
                      } )
                      .catch(
                        err => {addLog("" + err)
                        //throw(err)
                      }
                      )
                  }
                  catch (err) {
                    addLog("" + err);
                    //throw(err)
                  }
                  }

                  async function withdraw(){
                    addLog("loading withdraw from quarry ... ");
                    try {
                      withdrawStep(selectedWallet, connection, rewarder, stakeToken).then(result =>{
                         addLog("success")
                        } )
                        .catch(
                          err => {addLog("" + err)
                          //throw(err)
                        }
                        )
                    }
                    catch (err) {
                      addLog("" + err);
                      //throw(err)
                    }
                    }
                   
  return(
<div className="App">
<div id="sidebar"><InfoAccount selectedWallet={selectedWallet} connection={connection}></InfoAccount> </div>
<div id="content-wrap">
      <h1>Quarry Farm Demo</h1>
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
      <button onClick={ () => createStakedToken()}>
          create staked token
      </button>
      <br></br>
      <button onClick={ () => createRewardToken()}>
          create reward token
      </button>
      <br></br>
      <button onClick={ () => createRewarder()}>
          create rewarder
      </button>
      <br></br>
      <button onClick={ () => syncRewarder()}>
          synchronize rewarder
      </button>
      <br></br>
      <button onClick={ () => createQuarry()}>
          create Quarry
      </button>
      <br></br>
      <button onClick={ () => setQuarryRewardShare()}>
          set quarry reward share
      </button>
      <br></br>
      <button onClick={ () => createMiner()}>
          create Miner
      </button>
      <br></br>
      <button onClick={ () => mintLPToken()}>
          mint stake token
      </button>
      <br></br>
      <button onClick={ () => stake()}>
          Stake
      </button>
      <br></br>
      <button onClick={ () => whiteListRewarder()}>
          white list rewarder
      </button>
      <br></br>
      <button onClick={ () => claimReward()}>
          Claim reward
      </button>
      <br></br>
      <button onClick={ () => withdraw()}>
          withdraw from quarry
      </button>
      <br></br>

      </div>
    </div>
    
  );
}

export default QuarryFarm;
