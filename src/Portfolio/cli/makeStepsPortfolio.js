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


import {
  
    createPortfolioBeta

} from './portfolio-api-beta'

export async function createPortfolioApi(selectedWallet, connection, token, metaDataUrl, 
  asset1,amountAsset1,periodAsset1, asset2,amountAsset2,periodAsset2,asset3,amountAsset3,periodAsset3,
  asset4, amountAsset4,periodAsset4, asset5,amountAsset5,periodAsset5,asset6 ,amountAsset6,
  periodAsset6, asset7,amountAsset7,periodAsset7, asset8,amountAsset8,periodAsset8, asset9,amountAsset9,periodAsset9) {  
    return createPortfolio(selectedWallet, connection, token, metaDataUrl, 
      asset1,amountAsset1,periodAsset1, asset2,amountAsset2,periodAsset2,asset3,amountAsset3,periodAsset3,
      asset4, amountAsset4,periodAsset4, asset5,amountAsset5,periodAsset5,asset6 ,amountAsset6,
      periodAsset6, asset7,amountAsset7,periodAsset7, asset8,amountAsset8,periodAsset8, asset9,amountAsset9,periodAsset9);
  }
  
export async function createUserPortfolioApi(selectedWallet, connection,token,portfolioAddress,amountPortfolio) {  
    return createUserPortfolio(selectedWallet, connection,token,portfolioAddress,amountPortfolio);
  }

export async function depositInPortfolioApi(selectedWallet, connection,portfolioAccount,userPAccount) {  
    return runDepositPortfolio(selectedWallet, connection,portfolioAccount,userPAccount);
  }
  ////////// portfolio beta


  export async function createPortfolioBetaApi(selectedWallet,connection) {  
      return createPortfolioBeta(selectedWallet,connection);
    }