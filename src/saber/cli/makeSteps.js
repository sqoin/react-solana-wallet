
 import {
    depositNewPool
  } from "./saber"
export async function depositTokenPool(selectedWallet , connection) {  
    return depositNewPool(selectedWallet , connection);
  }