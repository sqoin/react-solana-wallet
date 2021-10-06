import { addAssetToPortfolioApi, createPortfolioApi, createUserPortfolioApi } from "./portfolio-api";

export async function createPortfolioStep(myAccount, connection, splmAsset1,amountAsset1,numberOfAsset,metaDataUrl,metaDataHash,periodAsset1){
    return createPortfolioApi(myAccount, connection, splmAsset1,amountAsset1,numberOfAsset,metaDataUrl,metaDataHash,periodAsset1)
}

export async function addAssetToPortfolioStep(myAccount, connection,splmAssetstr,amountAsset,portfolioAddressStr,assetToSoldIntoAssetstr,periodAsset){
    return addAssetToPortfolioApi(myAccount, connection,splmAssetstr,amountAsset,portfolioAddressStr,assetToSoldIntoAssetstr,periodAsset)
}

export async function createUserPortfolioStep(myAccount, connection,portfolioAddressStr){
    return createUserPortfolioApi(myAccount, connection,portfolioAddressStr)
}