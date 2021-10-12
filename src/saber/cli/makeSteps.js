
 import {
    depositNewPool,
    createPoolMint
  } from "./saber"
export async function depositTokenPool(selectedWallet , connection,stableSwap,lpToken,mintA,mintB,userPoolToken,userAccountA,userAccountB,tokenAccountA,tokenAccountB,authority) {  
    return depositNewPool(selectedWallet , connection,stableSwap,lpToken,mintA,mintB,userPoolToken,userAccountA,userAccountB,tokenAccountA,tokenAccountB,authority);
  }

  export async function createPoolToken(selectedWallet , connection) {  
    return createPoolMint(selectedWallet , connection);
  }