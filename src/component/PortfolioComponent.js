import React, { useState } from 'react';

import { getTokenAccountsByOwnerSolet } from "../cli/makesteps"
function PortfolioComponent(props) {
    const [logs, setLogs] = useState([]);
    function addLog(log) {
        setLogs((logs) => [...logs, log]);
    }
    const [accountInfo, setAccountInfo] = useState()
    const [portfolio, setPortfolio] = useState()
    const [userPAccount, setUserPAccount] = useState()
    const [depositAccounts, setDepositAccounts] = useState()


    async function getTokenAccountsByOwner() {
        addLog("loading  token   account by owner");

        setPortfolio(props.portfolio);
         
        setUserPAccount(props.userPAccount);
        setDepositAccounts(props.depositAccounts);

    }
    return (

        <div>  <button onClick={() => getTokenAccountsByOwner()}>refresh</button>
            {portfolio && <>
                <div>********************************************************************************************************</div>
                <div>************************************Info Portfolio Account *****************************"</div>
                <div>address of new portfolio :  {portfolio.portfolioAddress.toString()}
                    --- creator Portfolio : {portfolio.creatorPortfolio.toString()}
                    -- amount of Asset1  : {portfolio.amountAsset1.property}
                    -- address of Asset1 : {portfolio.addressAsset1.toString()}
                    -- period of Asset1 : {portfolio.periodAsset1.property}
                    -- assetToSoldIntoAsset1 : {portfolio.assetToSoldIntoAsset1.toString()}
                    --metadataUrl :  {portfolio.metadataUrl.toString()}
                    --metadataHash : {portfolio.metadataHash.property}</div>
                <div>   ************************************end info Portfolio Account ******************************</div>
                <div>  ********************************************************************************************************</div>
            </>}

            {userPAccount && <div>

                <div>********************************************************************************************************</div>
                <div>************************************ Info User Portfolio Account *****************************</div>
                <div>address of new user portfolio :   {userPAccount.user_portfolio_address.toString()}
                    --- portfolio_address : {userPAccount.portfolio_address.toString()}
                    -- owner  : {userPAccount.owner.toString()}
                 -- delegated amount : {userPAccount.delegatedAmount}
                    -- delegate : {userPAccount.delegate.toString()}
                </div>

                <div>   ************************************ end info User Portfolio Account ******************************</div>
                <div>  ********************************************************************************************************</div>

            </div>
            }

             {depositAccounts && <>
                <div>********************************************************************************************************</div>
                <div>********************************************Info SPLU PRIMARY BEFORE SWAP *********************************</div>
                <div>address of SPLU PRIMARY : {depositAccounts[0].address.toString()}
                    ----  amount OF SPLU PRIMARY :  {depositAccounts[0].amount.toString()}</div>


                <div>********************************************Info SPLU SECONDARY BEFORE SWAP  *********************************</div>
                <div>address of SPLU SECONDARY : {depositAccounts[1].address.toString()}
                    ---- amount of SPLU SECONDARY :  {depositAccounts[1].amount.toString()}</div>
                <div>********************************************************************************************************</div>


                <div>********************************************************************************************************</div>
                <div>********************************************Info SPLU PRIMARY AFTER SWAP *********************************</div>
                <div>address of SPLU PRIMARY : {depositAccounts[2].address.toString()}
                    ----  amount OF SPLU PRIMARY :  {depositAccounts[2].amount.toString()}</div>


                <div>********************************************Info SPLU SECONDARY AFTER SWAP  *********************************</div>
                <div>address of SPLU SECONDARY : {depositAccounts[3].address.toString()}
                    ---- amount of SPLU SECONDARY :  {depositAccounts[3].amount.toString()}</div>
                <div>********************************************************************************************************</div>

                <div>********************************************************************************************************</div>
                <div>******************************************** INFO PPU AFTER SWAP  *********************************</div>
                <div>user_portfolio_address : {depositAccounts[4].user_portfolio_address.toString()}
                    --- portfolio_address : {depositAccounts[4].portfolio_address.toString()}
                    -- owner  : {depositAccounts[4].owner.toString()}
                    -- delegated amount : {depositAccounts[4].delegatedAmount.toString()}
                    -- delegate : {depositAccounts[4].delegate.toString()}
                    -- splu_asset1 : {depositAccounts[4].splu_asset1.toString()}</div>

                <div>*********************************************end info Portfolio Account **************************</div>
                <div>********************************************************************************************************</div>


            </>
            } 
            {/*<table >

    <thead>
      <tr>
      <th>publickey</th>
        <th>amount</th>
      </tr>
  </thead>


  <tbody> 


      {
        accountInfo && accountInfo.map((item,index) =>
          <tr key={index}> 

            <td >{item.address}</td>
            <td >{item.amount}</td>
        
          </tr>
        )
      }

</tbody> 


    </table>*/}
        </div>
    )
}
export default PortfolioComponent