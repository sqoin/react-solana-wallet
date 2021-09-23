import { claimRewardApi, ComputeRewardApi, createMinerApi, createQuarryApi, createRewarderApi, createStakeTokenApi, createTokenWrapperApi, mintLpTokenAPI, setQuarryRewardShareApi, stakeApi, syncRewarderApi, whiteListRewarderApi, withdrawApi } from "./quarry-api";

export async function createStakeTokenStep(selectedWallet, connection) {
    return createStakeTokenApi(selectedWallet, connection) 
}

export async function createTokenWrapperStep(selectedWallet , connection, market, marketMaker, tokenPk,side) {  
    return createTokenWrapperApi(selectedWallet , connection, market, marketMaker, tokenPk,side);
}

export async function createRewarderStep(selectedWallet, connection,mintWrapperKey){
    return  createRewarderApi(selectedWallet, connection,mintWrapperKey)
}

export async function syncRewarderStep(selectedWallet, connection,rewarderKey) {
    return syncRewarderApi(selectedWallet, connection,rewarderKey)
}

export async function createQuarryStep(selectedWallet, connection, rewarderKey, stakeTokenMint) {
    return createQuarryApi(selectedWallet, connection, rewarderKey, stakeTokenMint)
}

export async function createMinerStep(selectedWallet, connection, rewarderKey, stakeTokenMint){
    return createMinerApi(selectedWallet, connection, rewarderKey, stakeTokenMint)
}

export async function stakeStep(selectedWallet, connection, rewarderKey, stakeTokenMint) {
    return stakeApi(selectedWallet, connection, rewarderKey, stakeTokenMint)
}

export async function mintLpTokenStep(selectedWallet, connection, rewarderKey, stakeTokenMint) {
    return mintLpTokenAPI(selectedWallet, connection, rewarderKey, stakeTokenMint)
}

export async function claimRewardStep(selectedWallet, connection, rewarderKey, stakeTokenMint, mintWrapperKey) {
    return claimRewardApi(selectedWallet, connection, rewarderKey, stakeTokenMint,mintWrapperKey)
}

export async function whiteListRewarderStep(selectedWallet, connection, rewarderKey, mintWrapperKey) {
    return whiteListRewarderApi(selectedWallet, connection, rewarderKey, mintWrapperKey)
}

export async function setQuarryRewardShareStep(selectedWallet, connection, rewarderKey, stakeTokenMint) {
    return setQuarryRewardShareApi(selectedWallet, connection, rewarderKey, stakeTokenMint)
}

export async function withdrawStep(selectedWallet, connection, rewarderKey, stakeTokenMint){
    return withdrawApi(selectedWallet, connection, rewarderKey, stakeTokenMint)
}

export async function ComputeRewardStep(selectedWallet, connection, rewarderKey, stakeTokenMint){
    return ComputeRewardApi(selectedWallet, connection, rewarderKey, stakeTokenMint)
}