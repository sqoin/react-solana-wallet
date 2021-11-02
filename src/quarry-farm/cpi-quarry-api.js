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
  const programId = new anchor.web3.PublicKey('2hjEh1nJ95V6Z4B568P13YuuKXZoB3AaMtqWnh9KMwKg');
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
  let authorityAccount = userWallet;
  let authority = userWallet.publicKey;
  let miner = new anchor.web3.PublicKey("J85SaFpDs98w3EjsxLeAfnUrYAz83tsNRPqQSrprnxn6");
  let quarry = new anchor.web3.PublicKey("ExkBFfuQZoWw9e3Du9HTwcTDfuL5vtaN6vtzWZ4GwrL6");
  let minerVault = new anchor.web3.PublicKey("AwAoPjwFAfNej9Vj6gXjkFBwqvTYJyb7Cwa5t1utw1hK");
  let tokenAccount = new anchor.web3.PublicKey("EdzJ26wBCnybeoCLutKdBj1q9uwhtd3a9vrUEvTL2J4N");
  let rewarder = new anchor.web3.PublicKey("6yanXmZJs5WdFFHLmCBAj8PLGZV1xeqisTBDX4eMxkUj");
  let quarry_program_id = new anchor.web3.PublicKey("QMNeHCGYnLVDn1icRAfQZpjPLBNkfGbSKRB83G5d8KB");
  let amount = 100;//u64
  let tx = await program.rpc.stake(new anchor.BN(amount), new anchor.BN(nonce), {
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
  const programId = new anchor.web3.PublicKey('2hjEh1nJ95V6Z4B568P13YuuKXZoB3AaMtqWnh9KMwKg');

  // Generate the program client from IDL.
  const program = new anchor.Program(idl, programId);
  let mintWrapper = new anchor.web3.PublicKey("Hpu3zNF9wdNxkpsbBX3vXYqi8JaM1cdXQjhFisTVrpRd");
  let mintWrapperProgram = new anchor.web3.PublicKey("QMWoBmAyJLAsA1Lh9ugMTw2gciTihncciphzdNzdZYV")
  let minter = new anchor.web3.PublicKey("7AKoRgVX7jiA3Jq2BsAbxqKgUBbWTdPBmFuxLpVMdLcw")
  let rewardsTokenMint = new anchor.web3.PublicKey("415G9N5ucDhfvnnjApuJeCC6XPc5pdgn9BVyRRBW1duR");
  let rewardsTokenAccount = new anchor.web3.PublicKey("6ToobQ8NdnSNSzu342ALAJymRE9Yqa6hJzD9M8DWgjdA");
  let claimFeeTokenAccount = new anchor.web3.PublicKey("BwmD4jfo62AZ1V5MhzhAE8yJjhSzYZp3C3prfPMV1K9E");

  let authority = userWallet.publicKey;
  let miner = new anchor.web3.PublicKey("J85SaFpDs98w3EjsxLeAfnUrYAz83tsNRPqQSrprnxn6");
  let quarry = new anchor.web3.PublicKey("ExkBFfuQZoWw9e3Du9HTwcTDfuL5vtaN6vtzWZ4GwrL6");
  let minerVault = new anchor.web3.PublicKey("AwAoPjwFAfNej9Vj6gXjkFBwqvTYJyb7Cwa5t1utw1hK");
  let tokenAccount = new anchor.web3.PublicKey("EdzJ26wBCnybeoCLutKdBj1q9uwhtd3a9vrUEvTL2J4N");
  let rewarder = new anchor.web3.PublicKey("6yanXmZJs5WdFFHLmCBAj8PLGZV1xeqisTBDX4eMxkUj");
  let quarry_program_id = new anchor.web3.PublicKey("QMNeHCGYnLVDn1icRAfQZpjPLBNkfGbSKRB83G5d8KB");

  let tx = await program.rpc.claim({
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
      unusedMinerVault: minerVault,
      unusedTokenAccount: tokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      rewarder,
      unusedClock: SystemProgram.programId,
      quarryProgram: quarry_program_id

    }
  });
  console.log('Success claim rewards');
  return tx;
}

export async function withdrowCPI(userWallet, connection) {

  let provider = new Provider(connection, userWallet, options);
  anchor.setProvider(provider);

  const idl = require('./test1.json')
  // Address of the deployed program.
  const programId = new anchor.web3.PublicKey('2hjEh1nJ95V6Z4B568P13YuuKXZoB3AaMtqWnh9KMwKg');

  // Generate the program client from IDL.
  const program = new anchor.Program(idl, programId);
  let authority = userWallet.publicKey;
  
  let miner = new anchor.web3.PublicKey("J85SaFpDs98w3EjsxLeAfnUrYAz83tsNRPqQSrprnxn6");
  let quarry = new anchor.web3.PublicKey("ExkBFfuQZoWw9e3Du9HTwcTDfuL5vtaN6vtzWZ4GwrL6");
  let minerVault = new anchor.web3.PublicKey("AwAoPjwFAfNej9Vj6gXjkFBwqvTYJyb7Cwa5t1utw1hK");
  let tokenAccount = new anchor.web3.PublicKey("EdzJ26wBCnybeoCLutKdBj1q9uwhtd3a9vrUEvTL2J4N");
  let rewarder = new anchor.web3.PublicKey("6yanXmZJs5WdFFHLmCBAj8PLGZV1xeqisTBDX4eMxkUj");
  let quarry_program_id = new anchor.web3.PublicKey("QMNeHCGYnLVDn1icRAfQZpjPLBNkfGbSKRB83G5d8KB");


  let amount = 100;//u64

  let tx = await program.rpc.withdrow(new anchor.BN(amount), {
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