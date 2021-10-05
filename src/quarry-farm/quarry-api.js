import { Keypair } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { expectTX } from "@saberhq/chai-solana";
import { Provider } from "@saberhq/solana-contrib";
import { SystemProgram } from "@solana/web3.js";
import { utils } from "@project-serum/anchor";
import { expect } from "chai";
import { u64 } from "@solana/spl-token";
import * as serumCmn from "@project-serum/common";
//import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  createInitMintInstructions,
  getATAAddress,
  getOrCreateATA,
  Token,
  TOKEN_PROGRAM_ID,
  TokenAmount,
} from "@saberhq/token-utils";
import {
  MinerData,
  MineWrapper,
  MintWrapper,
  QuarryData,
  QuarrySDK,
  QuarryWrapper,
  RewarderWrapper,
} from "./utils";
import {
  newUserStakeTokenAccount,
} from "./fcts";
import * as anchor from "@project-serum/anchor";
import { makeSDK } from "./worspace"
import { createMint, getTokenAccount } from "@project-serum/common";
import { TransactionEnvelope } from "@saberhq/solana-contrib";
const options = anchor.Provider.defaultOptions();
const { web3, BN } = anchor;
const DAILY_REWARDS_RATE = new BN(1_000000 * web3.LAMPORTS_PER_SOL);
const ANNUAL_REWARDS_RATE = DAILY_REWARDS_RATE.mul(new BN(365));
const rewardsShare = DAILY_REWARDS_RATE.div(new BN(10));
const mintWrapperId = new PublicKey("33v2cQJfPJN9P5TLuPD3Jnpu9iRnZr6t113QJSW75b7q")
const DEFAULT_DECIMALS = 6;
const DEFAULT_HARD_CAP = 1_000_000_000_000;
export const QUARRY_FEE_TO = new PublicKey(
  "4MMZH3ih1aSty2nx4MC3kSR94Zb55XsXnqb5jfEcyHWQ"
);

export async function createStakeTokenApi(selectedWallet, connection) {
  let provider = new anchor.Provider(connection, selectedWallet, options)
  let stakedMintAuthority = web3.Keypair.generate();
  let stakeTokenMint = await createMint(
    provider,
    provider.wallet.publicKey,
    //stakedMintAuthority.publicKey,
    DEFAULT_DECIMALS
  );
  return stakeTokenMint
}

export async function createTokenWrapperApi(selectedWallet, connection) {
  let sdk = makeSDK(connection, selectedWallet);
  let mintWrapper = sdk.mintWrapper;
  let provider = sdk.provider;
  //console.log("connection "+sdk.provider.connection)
  // console.log("walet "+sdk.provider.wallet.publicKey)
  const rewardsMintKP = Keypair.generate();
  let rewardsMint = rewardsMintKP.publicKey;
  console.log("reward token pk => " + rewardsMint)
  let token = new Token({
    // required
    address: rewardsMint.toString(),
    decimals: DEFAULT_DECIMALS,
    chainId: 103,
  });
  console.log("reward token => " + token)
  let hardCap = TokenAmount.parse(token, DEFAULT_HARD_CAP.toString());
  console.log("reward amount => " + hardCap)

  const res = await mintWrapper.newWrapper({
    //const {wrapperKey, tx  } = await newWrapper({
    hardcap: hardCap.toU64(),
    tokenMint: rewardsMint,
    //provider,
  });
  let wrapperKey = res.mintWrapper;
  let tx = res.tx;
  console.log("wrapperKey => " + wrapperKey)
  console.log("hardCap.toU64()" + hardCap.toU64())
  console.log("rewardsMint" + rewardsMint)
  console.log("yxn" + tx)

  await expectTX(
    await createInitMintInstructions({
      provider,
      mintKP: rewardsMintKP,
      decimals: DEFAULT_DECIMALS,
      mintAuthority: wrapperKey,
      freezeAuthority: wrapperKey,
    })
  ).to.be.fulfilled;
  console.log("wrapper key after init => " + wrapperKey)
  let mintWrapperKey = wrapperKey;
  await expectTX(tx, "Initialize mint").to.be.fulfilled;
  console.log("initialized")
  return {"rewardsMint":rewardsMint, "wrapperKey":wrapperKey}
}


export async function createRewarderApi(selectedWallet, connection, mintWrapperKey) {
  let sdk = makeSDK(connection, selectedWallet);
  let mine = sdk.mine;
  let provider = sdk.provider;
  const { tx, key: theRewarderKey } = await mine.createRewarder({
    mintWrapper: new PublicKey (mintWrapperKey),
    authority: provider.wallet.publicKey,
  });
  await expectTX(tx, "Create new rewarder").to.be.fulfilled;
  return theRewarderKey;
}

export async function syncRewarderApi(selectedWallet, connection, rewarderKey) {
  let sdk = makeSDK(connection, selectedWallet);
  let mine = sdk.mine;
  let rewarder = await mine.loadRewarderWrapper(rewarderKey);
  await expectTX(
    await rewarder.setAndSyncAnnualRewards(ANNUAL_REWARDS_RATE, [])
  ).to.be.fulfilled;
}

export async function createQuarryApi(selectedWallet, connection, rewarderKey, stakeTokenMint) {
  let sdk = makeSDK(connection, selectedWallet);
  let mine = sdk.mine;
  let rewarder = await mine.loadRewarderWrapper(new PublicKey(rewarderKey));
  let stakeToken = Token.fromMint(stakeTokenMint, DEFAULT_DECIMALS, {
    name: "stake token", chainId: 103
  });
  const { tx: quarryTx } = await rewarder.createQuarry({
    token: stakeToken,
  });
  await expectTX(quarryTx, "Create new quarry").to.be.fulfilled;

  return rewarder.getQuarryKey(stakeToken)
}

export async function createMinerApi(selectedWallet, connection, rewarderKey, stakeTokenMint) {
  let sdk = makeSDK(connection, selectedWallet);
  let mine = sdk.mine;
  let rewarder = await mine.loadRewarderWrapper(new PublicKey(rewarderKey));
  let stakeToken = Token.fromMint( new PublicKey(stakeTokenMint), DEFAULT_DECIMALS, {
    name: "stake token", chainId: 103
  });
  let quarry = await rewarder.getQuarry(stakeToken);
  // create the miner
  await expectTX((await quarry.createMiner()).tx, "create miner").to.be
    .fulfilled;
console.log("wallet"+ selectedWallet.publicKey)
let minerAddr=(await quarry.getMinerAddress(selectedWallet.publicKey)).toBase58()
console.log("miner"+ minerAddr)
    return minerAddr
}

export async function mintLpTokenAPI(selectedWallet, connection, rewarderKey, stakeTokenMint) {
  let sdk = makeSDK(connection, selectedWallet);
  let mine = sdk.mine;
  let provider=sdk.provider;
  let rewarder = await mine.loadRewarderWrapper(new PublicKey(rewarderKey));
  console.log("rewarder => "+JSON.stringify(rewarderKey))
  let stakeToken = Token.fromMint(stakeTokenMint, DEFAULT_DECIMALS, {
    name: "stake token", chainId: 103
  });
  console.log("stake token => "+JSON.stringify(stakeToken))
  let quarry = await rewarder.getQuarry(stakeToken);
  console.log("quarry => "+quarry)

  const amount = 1_000_000000;
  console.log("wallet => "+JSON.stringify(provider.wallet.publicKey))

  const userStakeTokenAccount = await newUserStakeTokenAccount(
    sdk,
    quarry,
    stakeToken,
    amount
  );

  return userStakeTokenAccount
}


export async function stakeApi(selectedWallet, connection, rewarderKey, stakeTokenMint) {
  let sdk = makeSDK(connection, selectedWallet);
  let mine = sdk.mine;
  let provider=sdk.provider;
  let rewarder = await mine.loadRewarderWrapper(new PublicKey(rewarderKey));//get 
  console.log("rewarder => "+JSON.stringify(rewarderKey))
  let stakeToken = Token.fromMint(stakeTokenMint, DEFAULT_DECIMALS, {
    name: "stake token", chainId: 103
  });//lp 
  console.log("stake token => "+JSON.stringify(stakeToken))
  let quarry = await rewarder.getQuarry(stakeToken);//get 
  console.log("quarry => "+quarry)

  const amount = 1_000;
  console.log("wallet => "+JSON.stringify(provider.wallet.publicKey))

      const minerActions = await quarry.getMinerActions(
        provider.wallet.publicKey
      );
      console.log("wallet => "+minerActions)
      await expectTX(
        minerActions.stake(new TokenAmount(stakeToken, amount)),
        "Stake into the quarry"
      ).to.be.fulfilled;

      console.log("ok")
      let miner = await quarry.getMiner(provider.wallet.publicKey);
    //  invariant(miner, "miner must exist");

      const minerBalance = await getTokenAccount(
        provider,
        miner.tokenVaultKey
      );
      console.log("miner address" +miner.tokenVaultKey)
      console.log("miner balance"+minerBalance.amount.toNumber)


     /* let minerVaultInfo = await getTokenAccount(
        provider,
        miner.tokenVaultKey
      );

      expect(minerVaultInfo.amount).to.bignumber.eq(new BN(amount));*/
      
}

export async function claimFeesApi(selectedWallet, connection,rewardsMint, rewarderKey) {
  let sdk = makeSDK(connection, selectedWallet);
  let mine = sdk.mine;
  let provider=sdk.provider;

  const claimFeeTokenAccount = await getATAAddress({
    mint: new PublicKey(rewardsMint),
    owner: new PublicKey(rewarderKey),
  });
  const ata = await getOrCreateATA({
   // owner: QUARRY_FEE_TO,
    owner: provider.wallet.publicKey,
    mint: new PublicKey(rewardsMint),
    provider,
  });

  /*await expectTX(new TransactionEnvelope(provider, [ata.instruction])).to
    .be.fulfilled;*/
  console.log("ata address "+ata.address)
  await expect(
    mine.program.rpc.extractFees({
      accounts: {
        rewarder: new PublicKey(rewarderKey),
        claimFeeTokenAccount,
        feeToTokenAccount: ata.address,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    })
  ).to.be.fulfilled;
}


export async function whiteListRewarderApi(selectedWallet, connection, rewarderKey, mintWrapperKey) {
  let sdk = makeSDK(connection, selectedWallet);
  let mintWrapper = sdk.mintWrapper;
 
  console.log("wrapper => "+mintWrapperKey)
  await expectTX(
    mintWrapper.newMinterWithAllowance(
      new PublicKey(mintWrapperKey),
      new PublicKey(rewarderKey),
      new u64(100_000_000_000000)
    ),
    "Minter add"
  ).to.be.fulfilled;

      console.log("ok")      
}


export async function claimRewardApi(selectedWallet, connection, rewarderKey, stakeTokenMint, rewardsMint) {
  let sdk = makeSDK(connection, selectedWallet);
  let mine = sdk.mine;
  let provider=sdk.provider;
  

  let stakeToken = Token.fromMint(new PublicKey (stakeTokenMint), DEFAULT_DECIMALS, {
    name: "stake token", chainId: 103
  });

  let rewarder = await mine.loadRewarderWrapper(new PublicKey(rewarderKey));

  let quarry = await rewarder.getQuarry(stakeToken);
  console.log("quarry => "+quarry.computeAnnualRewardsRate())

      const minerActions = await quarry.getMinerActions(
        provider.wallet.publicKey
      );

      const tx = await minerActions.claim();
      const claimSent = tx.send();
      //await expectTX(tx, "Claim").to.be.fulfilled;
      const receipt = await (await claimSent).wait();
      receipt.printLogs();
      console.log("ok")   
      
      
      /*const parser = new anchor.EventParser(
        sdk.programs.Mine.programId,
        sdk.programs.Mine.coder
      );

      const theParser = (logs) => {
        const events= [];
        parser.parseLogs(logs, (event) => {
          events.push(event);
        });
        return events;
      };

      const event = receipt.getEvents(theParser)[0];
      console.log("event ok")*/
  
      let miner = await quarry.getMiner(provider.wallet.publicKey);
      console.log("miner ok"+miner.tokenVaultKey)
      const amount = 1_000_000000;
      // Checks
      const wagesPerTokenPaid = miner.rewardsPerTokenPaid;
      console.log("wager "+wagesPerTokenPaid)
      //const payroll = quarry.payroll;
      /*const expectedWagesEarned = payroll.calculateRewardsEarned(
        event.data.timestamp,
        new BN(amount),
        wagesPerTokenPaid,
        new BN(0)
      );
  
      const fees = expectedWagesEarned.mul(new BN(1)).div(new BN(10_000));
      const rewardsAfterFees = expectedWagesEarned.sub(fees);
      console.log("expected reward amount "+rewardsAfterFees)
      /*expect(event.data.amount.isZero()).to.be.false;
      expect(event.data.amount).to.bignumber.eq(rewardsAfterFees);
      expect(event.data.fees).to.bignumber.eq(fees);
      expect(miner.rewardsEarned.toString()).to.equal(ZERO.toString());*/

      const rewardsTokenAccount = await getATAAddress({
        mint: new PublicKey (rewardsMint),
        owner: provider.wallet.publicKey,
      });

      const rewardsTokenAccountInfo = await serumCmn.getTokenAccount(
        anchor.getProvider(),
        rewardsTokenAccount
      );
      console.log("ata address "+ rewardsTokenAccount)
      console.log("ata account amount"+ rewardsTokenAccountInfo.amount.toString())
     // console.log("expected amount "+event.data.amount.toString())
}

export async function ComputeRewardApi(selectedWallet, connection, rewarderKey, stakeTokenMint) {
  let sdk = makeSDK(connection, selectedWallet);
  let mine = sdk.mine;
  let provider=sdk.provider;

  let stakeToken = Token.fromMint(new PublicKey (stakeTokenMint), DEFAULT_DECIMALS, {
    name: "stake token", chainId: 103
  });

  let rewarder = await mine.loadRewarderWrapper(new PublicKey(rewarderKey));

  let quarry = await rewarder.getQuarry(stakeToken);

  console.log("quarry => "+quarry.computeAnnualRewardsRate())

  let timestamp= new Date().getTime()
  console.log("timestamp "+timestamp)
  const amount = 1_000_000000;
  let miner = await quarry.getMiner(provider.wallet.publicKey);
      // Checks
      const wagesPerTokenPaid = miner.rewardsPerTokenPaid;
      console.log("wager "+wagesPerTokenPaid)

      // Checks
      const payroll = quarry.payroll;
      const expectedWagesEarned = payroll.calculateRewardsEarned(
        new BN(timestamp),
        new BN(amount),
        wagesPerTokenPaid,
        new BN(0)
      );
  
      const fees = expectedWagesEarned.mul(new BN(1)).div(new BN(10_000));
      const rewardsAfterFees = expectedWagesEarned.sub(fees);

      console.log(rewardsAfterFees.toString());
      return rewardsAfterFees.toString()

}

export async function setQuarryRewardShareApi(selectedWallet, connection, rewarderKey, stakeTokenMint) {
  let sdk = makeSDK(connection, selectedWallet);
  let mine = sdk.mine;
  let rewarder = await mine.loadRewarderWrapper(new PublicKey(rewarderKey));
  console.log("rewarder ok")
  let stakeToken = Token.fromMint( new PublicKey(stakeTokenMint), DEFAULT_DECIMALS, {
    name: "stake token", chainId: 103
  });
  console.log("stake token ok")
  let quarry = await rewarder.getQuarry(stakeToken);
  await expectTX(
    quarry.setRewardsShare(rewardsShare),
    "set rewards share"
  ).to.be.fulfilled;
  return "ok"
}

export async function withdrawApi(selectedWallet, connection, rewarderKey, stakeTokenMint) {
  let sdk = makeSDK(connection, selectedWallet);
  let mine = sdk.mine;
  let provider=sdk.provider;
  let rewarder = await mine.loadRewarderWrapper(new PublicKey(rewarderKey));
  console.log("rewarder => "+JSON.stringify(rewarderKey))
  let stakeToken = Token.fromMint(stakeTokenMint, DEFAULT_DECIMALS, {
    name: "stake token", chainId: 103
  });
  console.log("stake token => "+JSON.stringify(stakeToken))
  let quarry = await rewarder.getQuarry(stakeToken);
  console.log("quarry => "+quarry)

  const amount = 1_00;
  console.log("wallet => "+JSON.stringify(provider.wallet.publicKey))

      const minerActions = await quarry.getMinerActions(
        provider.wallet.publicKey
      );
      console.log("wallet => "+minerActions)
      await expectTX(
        minerActions.withdraw(new TokenAmount(stakeToken, amount)),
        "Withdraw from the quarry"
      ).to.be.fulfilled;

      console.log("ok")
      let miner = await quarry.getMiner(provider.wallet.publicKey);
    //  invariant(miner, "miner must exist");

      const minerBalance = await getTokenAccount(
        provider,
        miner.tokenVaultKey
      );
      console.log("miner address" +miner.tokenVaultKey)
      console.log("miner balance"+minerBalance.amount.toNumber)

      }

