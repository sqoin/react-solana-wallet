import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { u64, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SystemProgram, SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js";

const Provider = anchor.Provider;
const options = Provider.defaultOptions();
const { web3, BN } = anchor;

export async function stakeCPI(userWallet, connection) {
    let provider = new Provider(connection, userWallet, options);
    anchor.setProvider(provider);

    const idl = require('./test1.json')
     // Address of the deployed program.
  const programId = new anchor.web3.PublicKey('CDVL2p7dSY5svymGPudk1rphSB2VFyQAQymWQZmW9XPm');
  // Generate the program client from IDL.
    const program = new anchor.Program(idl, programId);
    let createAccountProgram = new web3.Account([112, 152, 22, 24, 214, 173, 250, 98, 192, 214, 50, 104, 196, 104, 105, 184, 87, 99, 220, 223, 116, 66, 3, 19, 167, 5, 102, 11, 232, 199, 11, 166, 87, 188, 108, 80, 242, 45, 37, 163, 74, 88, 103, 23, 49, 219, 164, 70, 19, 227, 104, 61, 89, 136, 150, 158, 145, 111, 179, 89, 53, 73, 6, 20]);
    let [programAddress, nonce] = await PublicKey.findProgramAddress(
        [createAccountProgram.publicKey.toBuffer()],
        programId,
    );
    //let authorityAccount =userWallet; 
    //let authorityAccount = provider.wallet;
    //let authority = userWallet.publicKey;
    let authorityAccount1 = new anchor.web3.Account([97, 235, 148, 58, 212, 114, 223, 11, 54, 74, 119, 187, 200, 29, 207, 43, 90, 241, 20, 122, 65, 142, 183, 77, 213, 219, 49, 4, 133, 168, 202, 148, 197, 48, 213, 179, 89, 143, 143, 96, 149, 188, 109, 170, 238, 110, 185, 150, 46, 58, 85, 4, 151, 22, 242, 152, 101, 254, 100, 193, 229, 78, 111, 158]);
   let authority1 = authorityAccount1.publicKey;
   let authorityAccount=userWallet;
   let authority=userWallet.publicKey;
   let miner = new anchor.web3.PublicKey("C1ce7rdTviL15XyyaLs6Y6W1RVPwkuY1rrRuBLQWNKHt");
   let quarry = new anchor.web3.PublicKey("J1MHP3RCidhUNb2g4YfFKh3xMDrp8n3W1i4J4EcpSCA4");
   let minerVault = new anchor.web3.PublicKey("AWWvNsrsaShkFeueyBDAg71eMxWYrnUkuZDjteQm2wAp");
   let tokenAccount = new anchor.web3.PublicKey("DxkwfGuRuSchGLPoEcrmfQr9WL39ub8LK2TytumPetUR");
   let rewarder = new anchor.web3.PublicKey("GYP8ee914pmPsFJFeD1uQVrfdZs5dQNRsSuf1hhPrq4R");
   let quarry_program_id = new anchor.web3.PublicKey("HZnsMua7bPbrKuopD8v7Rn4DNKgaKk62zgWAjwxUJY2j");
  
  let amount = 100;//u64
  let tx=await program.rpc.stake(new anchor.BN(amount), new anchor.BN(nonce), {
    accounts: {
      authority,
      miner,
      quarry,
      minerVault,
      tokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      rewarder,
      unusedClock: SystemProgram.programId,
       quarryProgram: quarry_program_id,
     
     
    }
  });  
  console.log('Success Stake');

    return tx;

}

export async function claimRewardsCPI(userWallet, connection) { 

    let provider = new Provider(connection, userWallet, options);
    anchor.setProvider(provider);

    const idl = require('./test1.json')
     // Address of the deployed program.
  const programId = new anchor.web3.PublicKey('CDVL2p7dSY5svymGPudk1rphSB2VFyQAQymWQZmW9XPm');

    // Generate the program client from IDL.
    const program = new anchor.Program(idl, programId);
    let mintWrapper=new anchor.web3.PublicKey("LtF91ftr9HAMnb9UbAHBpR9LTeGBWykcmpHkXWj32cG");
    let mintWrapperProgram=new anchor.web3.PublicKey("CsJYUa6sucvv5eEfN21TxgLpxm8DuFPDMcHoUFhgChtt")
    let minter=new anchor.web3.PublicKey("4EqNJZuG9mGy9LzL1JW9J1wmrXw6L7fA6azYfKqHND2n")
    let rewardsTokenMint=new anchor.web3.PublicKey("6Lpcjq4QhwVcZaZq6FMaPdDo8zJJ3QbdNmz5RVqaXvLE");
   let rewardsTokenAccount=new anchor.web3.PublicKey("E78PSR2ujyFuV158ZKcjD525CkxreMA9MoLdWRtGGvq6");
  let claimFeeTokenAccount=new anchor.web3.PublicKey("3LstAULH57C7ofez2Ax18pCdnehRmos45XDSfCGtTbDo");
  
let authority=userWallet.publicKey;
let miner = new anchor.web3.PublicKey("C1ce7rdTviL15XyyaLs6Y6W1RVPwkuY1rrRuBLQWNKHt");
  let quarry = new anchor.web3.PublicKey("J1MHP3RCidhUNb2g4YfFKh3xMDrp8n3W1i4J4EcpSCA4");
  let minerVault = new anchor.web3.PublicKey("AWWvNsrsaShkFeueyBDAg71eMxWYrnUkuZDjteQm2wAp");
  let tokenAccount = new anchor.web3.PublicKey("DxkwfGuRuSchGLPoEcrmfQr9WL39ub8LK2TytumPetUR");
  let rewarder = new anchor.web3.PublicKey("GYP8ee914pmPsFJFeD1uQVrfdZs5dQNRsSuf1hhPrq4R");
  let quarry_program_id = new anchor.web3.PublicKey("HZnsMua7bPbrKuopD8v7Rn4DNKgaKk62zgWAjwxUJY2j");
 
 let tx= await program.rpc.claim({
     accounts: {
       mintWrapper,
      mintWrapperProgram,
      minter,
      rewardsTokenMint, 
       rewardsTokenAccount,
      claimFeeTokenAccount,
      authority,
      miner,
      quarry,
      unusedMinerVault :minerVault,
      unusedTokenAccount:tokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      rewarder,
      unusedClock: SystemProgram.programId,
      quarryProgram: quarry_program_id 
     
    }}); 
    console.log('Success claim rewards');
    return tx;
}

export async function withdrowCPI(userWallet, connection) { 

    let provider = new Provider(connection, userWallet, options);
    anchor.setProvider(provider);

    const idl = require('./test1.json')
     // Address of the deployed program.
  const programId = new anchor.web3.PublicKey('CDVL2p7dSY5svymGPudk1rphSB2VFyQAQymWQZmW9XPm');

    // Generate the program client from IDL.
    const program = new anchor.Program(idl, programId);
     let authority=userWallet.publicKey;
     let miner = new anchor.web3.PublicKey("C1ce7rdTviL15XyyaLs6Y6W1RVPwkuY1rrRuBLQWNKHt");
     let quarry = new anchor.web3.PublicKey("J1MHP3RCidhUNb2g4YfFKh3xMDrp8n3W1i4J4EcpSCA4");
     let minerVault = new anchor.web3.PublicKey("AWWvNsrsaShkFeueyBDAg71eMxWYrnUkuZDjteQm2wAp");
     let tokenAccount = new anchor.web3.PublicKey("DxkwfGuRuSchGLPoEcrmfQr9WL39ub8LK2TytumPetUR");
     let rewarder = new anchor.web3.PublicKey("GYP8ee914pmPsFJFeD1uQVrfdZs5dQNRsSuf1hhPrq4R");
     let quarry_program_id = new anchor.web3.PublicKey("HZnsMua7bPbrKuopD8v7Rn4DNKgaKk62zgWAjwxUJY2j");
    
    
    let amount = 100;//u64

  let tx=await program.rpc.withdrow(new anchor.BN(amount), {
    accounts: {
      authority,
      miner,
      quarry,
      minerVault,
      tokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      rewarder,
      unusedClock: SystemProgram.programId,
       quarryProgram: quarry_program_id,
    }
  }); 
  console.log('Success withdrow');
  return tx;

}