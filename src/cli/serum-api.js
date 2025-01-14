import {Token} from '../client/token';
import { newAccountWithLamports1 } from '../client/util/new-account-with-lamports';
const anchor = require("@project-serum/anchor");
const serumCmn = require("@project-serum/common");
const anchorWeb3 = require("@project-serum/anchor").web3;
const web3 = require("@solana/web3.js");

const USDC_PK="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"

const TOKEN_PROGRAM_ID = require("@solana/spl-token").TOKEN_PROGRAM_ID;
const TokenInstructions = require("@project-serum/serum").TokenInstructions;
const Market = require("@project-serum/serum").Market;
const DexInstructions = require("@project-serum/serum").DexInstructions;
const Connection = web3.Connection;
const BN = require("@project-serum/anchor").BN;
const Account = web3.Account;
const Transaction = web3.Transaction;
const PublicKey = web3.PublicKey;
const SystemProgram = web3.SystemProgram;
const Provider = anchor.Provider
const DEX_PID = new PublicKey("DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY");
const decimals=2
const options = Provider.defaultOptions();
let TOKEN_PROGRAM_ID1= new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
let mintedAmount=100000
let sentAmount=1000
let dexProgramId= new PublicKey("DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY");
//FgFxp8voPtbFqCgqSgGDwUDz7CWpHKZbE6w7WudXDxz
const OpenOrders = require("@project-serum/serum").OpenOrders;
const Side = {
  Bid: { bid: {} },
  Ask: { ask: {} },
};
let marketA;

const asks = [
  [6.041, 7.8],
  [6.051, 72.3],
  [6.055, 5.4],
  [6.067, 15.7],
  [6.077, 390.0],
  [6.09, 24.0],
  [6.11, 36.3],
  [6.133, 300.0],
  [6.167, 687.8],
];
const bids = [
  [6.004, 8.5],
  [5.995, 12.9],
  [5.987, 6.2],
  [5.978, 15.3],
  [5.965, 82.8],
  [5.961, 25.4],
];

let marketMaker1=null
//JSON.parse({"_keypair":{"publicKey":{"0":142,"1":94,"2":174,"3":123,"4":251,"5":136,"6":225,"7":212,"8":196,"9":196,"10":171,"11":202,"12":237,"13":147,"14":206,"15":181,"16":159,"17":236,"18":6,"19":175,"20":98,"21":18,"22":138,"23":51,"24":85,"25":142,"26":70,"27":57,"28":207,"29":27,"30":71,"31":86},"secretKey":{"0":16,"1":168,"2":117,"3":228,"4":189,"5":52,"6":182,"7":22,"8":162,"9":178,"10":13,"11":236,"12":92,"13":227,"14":206,"15":15,"16":91,"17":89,"18":170,"19":141,"20":154,"21":62,"22":167,"23":112,"24":193,"25":180,"26":109,"27":12,"28":17,"29":31,"30":123,"31":161,"32":142,"33":94,"34":174,"35":123,"36":251,"37":136,"38":225,"39":212,"40":196,"41":196,"42":171,"43":202,"44":237,"45":147,"46":206,"47":181,"48":159,"49":236,"50":6,"51":175,"52":98,"53":18,"54":138,"55":51,"56":85,"57":142,"58":70,"59":57,"60":207,"61":27,"62":71,"63":86}}});


export async function createTokenApi(selectedWallet, connection) {

 let token = new Token(
  connection,
  selectedWallet.publicKey,
  TOKEN_PROGRAM_ID1,
  selectedWallet)

let tokenA = await token.createMint(
  connection,
  selectedWallet, 
  selectedWallet.publicKey,
  null,
  decimals,
  TOKEN_PROGRAM_ID1
);  
  console.log("mintA =>"+tokenA.publicKey.toBase58())
  return tokenA;
}

export async function createVaultApi(selectedWallet, connection, tokenPk) {
  let testToken = new Token(
    connection,
    tokenPk,
    TOKEN_PROGRAM_ID1,
    selectedWallet
);
  let vaultA = await testToken.createAccount(selectedWallet.publicKey);
  const accountInfo = await testToken.getAccountInfo(vaultA);
  return vaultA
}

export async function mintTokenToVaultApi(selectedWallet, connection, vaultPk, tokenPk) {
  
  let testToken = new Token(
    connection,
    new PublicKey(tokenPk),
    new PublicKey( TOKEN_PROGRAM_ID1 ),
    selectedWallet
);
  console.log("token pk => "+ tokenPk)
  console.log("selected Wallet pk => "+ selectedWallet.publicKey)
  console.log("vault => "+ vaultPk)
  await testToken.mintTo(vaultPk, selectedWallet, [], mintedAmount);
  const mintInfo = await testToken.getAccountInfo(new PublicKey(vaultPk))
  return  mintInfo;
}

export async function createMMApi() {
    const MARKET_MAKER = new Account();
    console.log("marker maker: "+JSON.stringify(MARKET_MAKER))
    marketMaker1=MARKET_MAKER
    return MARKET_MAKER.publicKey
}

export async function sendLamportApi(selectedWallet , connection, to) {
    let provider= new Provider(connection, selectedWallet, options);
    let tx=undefined;
    console.log("provider wallet => "+provider.wallet.publicKey)
    try{await provider.send(
        (() => {
          tx = new Transaction();
          tx.add(
            SystemProgram.transfer({
              fromPubkey: provider.wallet.publicKey,
              toPubkey: to,
              lamports: 100000000,
            })
          );
          return tx;
        })()
      );} catch(error){
        console.log("error")
      }
      return tx;
}

export async function sendTokenApi(selectedWallet , connection, tokenPk, vault, to) {
    let provider= new Provider(connection, selectedWallet, options);
    console.log("mm pk => "+to)
    console.log("token pk => "+tokenPk)
    console.log("vault pk => "+vault)

    let tx=undefined;
    console.log("provider wallet => "+provider.wallet.publicKey)
    const mintAClient = new Token(
        provider.connection,
        new PublicKey(tokenPk),
        new PublicKey(TOKEN_PROGRAM_ID1),
        selectedWallet // node only
      );

     const marketMakerTokenA = await mintAClient.createAccount(
        to
      );
      console.log("MM token => "+marketMakerTokenA)
  
      await provider.send(
        (() => {
          tx = new Transaction();
          tx.add(
            Token.createTransferCheckedInstruction(
              new PublicKey(TOKEN_PROGRAM_ID1),
              new PublicKey(vault),
              new PublicKey(tokenPk),
              new PublicKey(marketMakerTokenA),
              new PublicKey(selectedWallet.publicKey),
              [],
              sentAmount,
              decimals
            )
          );
          return tx;
        })()
        );
      return marketMakerTokenA;
}

export async function createMarketApi(
  selectedWallet,
  connection,
  tokenAPk,
  tokenBPk,
  baseLotSize,
  quoteLotSize,
  feeRateBps,
) {
  let provider= new Provider(connection, selectedWallet, options);
  const market = new Account();
  const requestQueue = new Account();
  const eventQueue = new Account();
  const bids = new Account();
  const asks = new Account();
  const quoteDustThreshold = new BN(100);

  const [vaultOwner, vaultSignerNonce] = await getVaultOwnerAndNonce(
    market.publicKey,
    dexProgramId
  );

  const tokenA = new Token(
    provider.connection,
    new PublicKey(tokenAPk),
    new PublicKey(TOKEN_PROGRAM_ID1),
    selectedWallet // node only
  );
  const tokenB = new Token(
    provider.connection,
    new PublicKey(tokenBPk),
    new PublicKey(TOKEN_PROGRAM_ID1),
    selectedWallet // node only
  );

 const baseVault = await tokenA.createAccount(
  vaultOwner
  );
  const quoteVault = await tokenB.createAccount(
    vaultOwner
  );

  console.log("base vault => "+baseVault)
  console.log("quote vault => "+quoteVault)

  const tx2 = new Transaction();
  tx2.add(
    SystemProgram.createAccount({
      fromPubkey: selectedWallet.publicKey,
      newAccountPubkey: market.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(
        Market.getLayout(dexProgramId).span
      ),
      space: Market.getLayout(dexProgramId).span,
      programId: dexProgramId,
    }),
    SystemProgram.createAccount({
      fromPubkey: selectedWallet.publicKey,
      newAccountPubkey: requestQueue.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(5120 + 12),
      space: 5120 + 12,
      programId: dexProgramId,
    }),
    SystemProgram.createAccount({
      fromPubkey: selectedWallet.publicKey,
      newAccountPubkey: eventQueue.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(262144 + 12),
      space: 262144 + 12,
      programId: dexProgramId,
    }),
    SystemProgram.createAccount({
      fromPubkey: selectedWallet.publicKey,
      newAccountPubkey: bids.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(65536 + 12),
      space: 65536 + 12,
      programId: dexProgramId,
    }),
    SystemProgram.createAccount({
      fromPubkey: selectedWallet.publicKey,
      newAccountPubkey: asks.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(65536 + 12),
      space: 65536 + 12,
      programId: dexProgramId,
    }),
    DexInstructions.initializeMarket({
      market: market.publicKey,
      requestQueue: requestQueue.publicKey,
      eventQueue: eventQueue.publicKey,
      bids: bids.publicKey,
      asks: asks.publicKey,
      baseVault: new PublicKey(baseVault),
      quoteVault: new PublicKey(quoteVault),
      baseMint: new PublicKey(tokenAPk),
      quoteMint: new PublicKey(tokenBPk),
      baseLotSize: new BN(baseLotSize),
      quoteLotSize: new BN(quoteLotSize),
      feeRateBps,
      vaultSignerNonce,
      quoteDustThreshold,
      programId: dexProgramId,
    })
  );

  const signedTransactions = await signTransactions({
    transactionsAndSigners: [
      //{ transaction: tx1, signers: [baseVault, quoteVault] },
      {
        transaction: tx2,
        signers: [market, requestQueue, eventQueue, bids, asks],
      },
    ],
    wallet: selectedWallet,
    connection,
  });
  for (let signedTransaction of signedTransactions) {
    await sendAndConfirmRawTransaction(
      connection,
      signedTransaction.serialize()
    );
  }
  console.log("market pk => "+ market.publicKey)
  const acc = await connection.getAccountInfo(new PublicKey(market.publicKey));
  console.log("market info => "+ market.publicKey)
  return market.publicKey;
}

async function getVaultOwnerAndNonce(marketPublicKey, dexProgramId = DEX_PID) {
  const nonce = new BN(0);
  while (nonce.toNumber() < 255) {
    try {
      const vaultOwner = await PublicKey.createProgramAddress(
        [marketPublicKey.toBuffer(), nonce.toArrayLike(Buffer, "le", 8)],
        dexProgramId
      );
      return [vaultOwner, nonce];
    } catch (e) {
      nonce.iaddn(1);
    }
  }
  throw new Error("Unable to find nonce");
}

async function signTransactions({
  transactionsAndSigners,
  wallet,
  connection,
}) {
  const blockhash = (await connection.getRecentBlockhash("max")).blockhash;
  transactionsAndSigners.forEach(({ transaction, signers = [] }) => {
    transaction.recentBlockhash = blockhash;
    transaction.setSigners(
      wallet.publicKey,
      ...signers.map((s) => s.publicKey)
    );
    if (signers?.length > 0) {
      transaction.partialSign(...signers);
    }
  });
  return await wallet.signAllTransactions(
    transactionsAndSigners.map(({ transaction }) => transaction)
  );
}

async function sendAndConfirmRawTransaction(
  connection,
  raw,
  commitment = "recent"
) {
  let tx = await connection.sendRawTransaction(raw, {
    skipPreflight: true,
  });
  return await connection.confirmTransaction(tx, commitment);
}

export async function placeOrder(selectedWallet, connection, marketPk, marketMaker, mmToken, side){
  let provider= new Provider(connection, selectedWallet, options);
  const market = await Market.load(
    connection,
    new PublicKey(marketPk),
    { commitment: "recent" },
    dexProgramId
  );
  console.log("loaded "+market._decoded.baseLotSize)
  console.log(JSON.stringify(marketMaker1))
  console.log(marketMaker1.publicKey)
  console.log(side)
  const {
    transaction,
    signers,
  } = await market.makePlaceOrderTransaction(connection, {
      owner: marketMaker1.publicKey,
      payer: new PublicKey(mmToken),
      side: side,
      price: 1,
      size: 10,
      orderType: "postOnly",
      clientId: undefined,
      openOrdersAddressKey: undefined,
      openOrdersAccount: undefined,
      feeDiscountPubkey: null,
      selfTradeBehavior: "abortTransaction",
    });
    await provider.send(transaction, signers.concat(marketMaker1));
  /* const {
      transaction2,
      signers2,
    } = await market.makePlaceOrderTransaction(provider.connection, {
      owner: marketMaker1.publicKey,
      payer: new PublicKey(mmQuoteToken),
      side: "buy",
      price: 1,
      size: 10,
      orderType: "postOnly",
      clientId: undefined,
      openOrdersAddressKey: undefined,
      openOrdersAccount: undefined,
      feeDiscountPubkey: null,
      selfTradeBehavior: "abortTransaction",
    });

    await provider.send(transaction2, signers2.concat(marketMaker1));*/
    return "order placed"
}

export async function swapAtoBApi(selectedWallet, connection,  marketPk, tokenAPk, tokenBPk, vaultA, vaultB) {
  console.log("sw "+selectedWallet.publicKey)
  console.log("market "+marketPk)

  let connection1= new Connection("https://api.devnet.solana.com")
  let provider= new Provider(connection1, selectedWallet, options);
  anchor.setProvider(provider);
  console.log(provider.connection)
  //const idl = JSON.parse(require('fs').readFile('./serumSwap.json', 'utf8'));
  const idl=require('./serumSwap')
  console.log(idl)
  //const programId = new anchor.web3.PublicKey('64VhHFWyFgXxUaHi9tg4DWLd1xqdYNdTdsNSG3DWhRE3');
  const programId = new anchor.web3.PublicKey('J4jvVPcuEh1RBqPARriV7imYLSCCXYmGYQNHSqqzFcYC');
  const program = new anchor.Program(idl, programId);
  console.log(program)
  console.log("market => "+ marketPk)
  const marketA = await Market.load(
    connection1,
    new PublicKey(marketPk),
    { commitment: "recent" },
    dexProgramId
  );

  console.log("market loaded")
  const [vaultSignerA] = await getVaultOwnerAndNonce(
    marketA._decoded.ownAddress
  );
  let marketAVaultSigner = vaultSignerA;
  const openOrdersA = new anchor.web3.Account();
  console.log("vault signer"+ marketAVaultSigner) 
  let  SWAP_ACCOUNTS = {
      market: {
        market: marketA._decoded.ownAddress,
        requestQueue: marketA._decoded.requestQueue,
        eventQueue: marketA._decoded.eventQueue,
        bids: marketA._decoded.bids,
        asks: marketA._decoded.asks,
        coinVault: marketA._decoded.baseVault,
        pcVault: marketA._decoded.quoteVault,
        vaultSigner: marketAVaultSigner,
        // User params.
        openOrders: openOrdersA.publicKey,
        orderPayerTokenAccount: new PublicKey(vaultB),
        coinWallet: new PublicKey(vaultA),
      },
      pcWallet: new PublicKey(vaultB),
      authority: selectedWallet.publicKey,
      dexProgram: dexProgramId,
      tokenProgram: TOKEN_PROGRAM_ID1,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    };
  

    console.log("swap accounts => "+ JSON.stringify(SWAP_ACCOUNTS))
    // Swap exactly enough USDC to get 1.2 A tokens (best offer price is 6.041 USDC).
    let TAKER_FEE=0.0022
    const expectedResultantAmount = 6.041;
    const bestOfferPrice = 6.041;
    const amountToSpend = expectedResultantAmount * bestOfferPrice;
    const swapAmount = new BN((10 / (1 - TAKER_FEE)) * 10 ** 2);
    console.log("swap amount "+swapAmount)
    //const [tokenAChange, usdcChange] = await withBalanceChange(
    // const tx = new Transaction();
     /* tx.add(
        await OpenOrders.makeCreateAccountTransaction(
          connection,
          marketA._decoded.ownAddress,
          selectedWallet.publicKey,
          openOrdersA.publicKey,
          dexProgramId
        )
      );
      await program.provider.send(tx, [openOrdersA]);*/
      await program.rpc.swap(
        Side.Bid,
        swapAmount,
        { rate: new BN(1.0), fromDecimals: 2, toDecimals: 2, strict: false },
        {
          accounts: SWAP_ACCOUNTS,
          instructions: [
            // First order to this market so one must create the open orders account.
          await OpenOrders.makeCreateAccountTransaction(
          connection,
          marketA._decoded.ownAddress,
          selectedWallet.publicKey,
          openOrdersA.publicKey,
          dexProgramId
            ),
          ],
          signers: [openOrdersA],
        }
      );
        return "ok"
}