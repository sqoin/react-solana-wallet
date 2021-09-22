/**
 * Exercises the token program
 *
 * @flow
 */

 import {
    createUserPortfolio,
    runDepositPortfolio,
    createPortfolio
    
  } from './portfolio-api';

export async function createPortfolioApi(selectedWallet, connection,token,USDCToken,metaDataUrl,amountAsset1,amountAsset2,amountAsset3,amountAsset4,amountAsset5,amountAsset6,amountAsset7,amountAsset8,amountAsset9,
  periodAsset1,periodAsset2,periodAsset3,periodAsset4,periodAsset5,periodAsset6,periodAsset7,periodAsset8,periodAsset9,
  assetToSold1,assetToSold2,assetToSold3,assetToSold4,assetToSold5,assetToSold6,assetToSold7,assetToSold8,assetToSold9) {  
    return createPortfolio(selectedWallet, connection,token,USDCToken,metaDataUrl,amountAsset1,amountAsset2,amountAsset3,amountAsset4,amountAsset5,amountAsset6,amountAsset7,amountAsset8,amountAsset9,
      periodAsset1,periodAsset2,periodAsset3,periodAsset4,periodAsset5,periodAsset6,periodAsset7,periodAsset8,periodAsset9,
      assetToSold1,assetToSold2,assetToSold3,assetToSold4,assetToSold5,assetToSold6,assetToSold7,assetToSold8,assetToSold9);
  }
  
export async function createUserPortfolioApi(selectedWallet, connection,token,portfolioAddress,amountPortfolio) {  
    return createUserPortfolio(selectedWallet, connection,token,portfolioAddress,amountPortfolio);
  }

export async function depositInPortfolioApi(selectedWallet, connection,portfolioAccount,userPAccount) {  
    return runDepositPortfolio(selectedWallet, connection,portfolioAccount,userPAccount);
  }
 