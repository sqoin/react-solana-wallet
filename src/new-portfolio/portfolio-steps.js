import {
    addAssetToPortfolioApi,
    createPortfolioApi,
    createUserPortfolioApi,
    depositPortfolioApi,
    withdrawPortfolioApi,
    depositIntoLPToken,
    createLpToken,
    stakeTokens,
    withdrawFormQuarry,
    claimRewards,
    withdrawFormSaber
} from "./portfolio-api";

export async function createPortfolioStep(myAccount, connection, splmAsset1, amountAsset1, numberOfAsset, metaDataUrl, metaDataHash, periodAsset1) {
    return createPortfolioApi(myAccount, connection, splmAsset1, amountAsset1, numberOfAsset, metaDataUrl, metaDataHash, periodAsset1)
}

export async function addAssetToPortfolioStep(myAccount, connection, splmAssetstr, amountAsset, portfolioAddressStr, assetToSoldIntoAssetstr, periodAsset) {
    return addAssetToPortfolioApi(myAccount, connection, splmAssetstr, amountAsset, portfolioAddressStr, assetToSoldIntoAssetstr, periodAsset)
}

export async function createUserPortfolioStep(myAccount, connection, portfolioAddressStr) {
    return createUserPortfolioApi(myAccount, connection, portfolioAddressStr)
}

export async function depositPortfolioStep(myAccount, connection, portfolioAddress, UserPortfolioAccount, TOKEN_PROGRAM_ID, TOKEN_SWAP_PROGRAM_ID, amount, asset1, asset2, asset3) {
    return depositPortfolioApi(myAccount, connection, portfolioAddress, UserPortfolioAccount, TOKEN_PROGRAM_ID, TOKEN_SWAP_PROGRAM_ID, amount, asset1, asset2, asset3)
}
export async function withdrawPortfolioStep(myAccount, connection, portfolioAddress, UserPortfolioAccount, TOKEN_PROGRAM_ID, TOKEN_SWAP_PROGRAM_ID, amount, asset1, asset2, asset3) {
    return withdrawPortfolioApi(myAccount, connection, portfolioAddress, UserPortfolioAccount, TOKEN_PROGRAM_ID, TOKEN_SWAP_PROGRAM_ID, amount, asset1, asset2, asset3)
}


/*********************************** saber****************************************/
export async function createLpTokenAPI(selectedWallet, connection, asset1, asset2) {

    return createLpToken(selectedWallet, connection, asset1, asset2);
}

export async function depositIntoLPAPI(selectedWallet, connection, asset1, stableSwap1, lpToken1, userPoolToken1, tokenAccountA1, tokenAccountB1, authority1, asset2) {

    return depositIntoLPToken(selectedWallet, connection, asset1, stableSwap1, lpToken1, userPoolToken1, tokenAccountA1, tokenAccountB1, authority1, asset2);
}

/*********************************** farm ****************************************/

export async function stakeTokensAPI(selectedWallet, connection,lpTokenAsset1) {

    return stakeTokens(selectedWallet, connection,lpTokenAsset1);
}


export async function withdrawFormQuarryAPI(selectedWallet, connection,lpTokenAsset1,userPoolTokenAsset1,rewarderKeyAsset1) {

    return withdrawFormQuarry(selectedWallet, connection,lpTokenAsset1,userPoolTokenAsset1,rewarderKeyAsset1);
}

export async function claimRewardsAPI(selectedWallet, connection,lpTokenAsset1,userPoolTokenAsset1,rewarderKeyAsset1) {

    return claimRewards(selectedWallet, connection,lpTokenAsset1,userPoolTokenAsset1,rewarderKeyAsset1);
}

export async function withdrawFormSaberAPI(selectedWallet, connection,asset1,lpTokenAsset1,userPoolTokenAsset1,tokenAccountAAsset1,tokenAccountBAsset1,authorityAsset1,stableSwapAsset1,asset2) {

    return withdrawFormSaber(selectedWallet, connection,asset1,lpTokenAsset1,userPoolTokenAsset1,tokenAccountAAsset1,tokenAccountBAsset1,authorityAsset1,stableSwapAsset1,asset2);
}
