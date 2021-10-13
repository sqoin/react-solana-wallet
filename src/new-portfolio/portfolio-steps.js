import { addAssetToPortfolioApi, createPortfolioApi, createUserPortfolioApi, depositPortfolioApi, withdrawPortfolioApi,depositIntoLPToken,createLpToken } from "./portfolio-api";

export async function createPortfolioStep(myAccount, connection, splmAsset1,amountAsset1,numberOfAsset,metaDataUrl,metaDataHash,periodAsset1){
    return createPortfolioApi(myAccount, connection, splmAsset1,amountAsset1,numberOfAsset,metaDataUrl,metaDataHash,periodAsset1)
}

export async function addAssetToPortfolioStep(myAccount, connection,splmAssetstr,amountAsset,portfolioAddressStr,assetToSoldIntoAssetstr,periodAsset){
    return addAssetToPortfolioApi(myAccount, connection,splmAssetstr,amountAsset,portfolioAddressStr,assetToSoldIntoAssetstr,periodAsset)
}

export async function createUserPortfolioStep(myAccount, connection,portfolioAddressStr){
    return createUserPortfolioApi(myAccount, connection,portfolioAddressStr)
}

export async function depositPortfolioStep (myAccount, connection,   portfolioAddress,UserPortfolioAccount, TOKEN_PROGRAM_ID  , TOKEN_SWAP_PROGRAM_ID  ,amount ,asset1,asset2, asset3 ){
        return depositPortfolioApi (myAccount, connection,   portfolioAddress,UserPortfolioAccount,  TOKEN_PROGRAM_ID  , TOKEN_SWAP_PROGRAM_ID  ,amount ,asset1,asset2,asset3 )
    }
export async function withdrawPortfolioStep (myAccount, connection,   portfolioAddress,UserPortfolioAccount, TOKEN_PROGRAM_ID  , TOKEN_SWAP_PROGRAM_ID  ,amount ,asset1,asset2, asset3 ){
        return withdrawPortfolioApi (myAccount, connection,   portfolioAddress,UserPortfolioAccount,  TOKEN_PROGRAM_ID  , TOKEN_SWAP_PROGRAM_ID  ,amount ,asset1,asset2,asset3 )
    }
    

    /*********************************** saber****************************************/
    export async function createLpTokenAPI(selectedWallet, connection,asset1 ) {  

        return createLpToken(selectedWallet, connection, asset1 );
      }

    export async function depositIntoLPAPI(selectedWallet, connection, asset1,stableSwap,lpToken,userPoolToken,tokenAccountA,tokenAccountB,authority ) {  

    return depositIntoLPToken(selectedWallet, connection,asset1,stableSwap,lpToken,userPoolToken,tokenAccountA,tokenAccountB,authority );
  }