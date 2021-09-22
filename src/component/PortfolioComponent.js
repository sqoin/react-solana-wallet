import React, { useState } from 'react';
import "./PortfolioComponent.css"
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
               
                <div>************************************Info Portfolio Account *****************************"</div>
                <table >

<thead>
  <tr>
  <th>address of new portfolio</th>
    <th>creator Portfolio</th>
    <th>amount</th>
  </tr>
</thead>


<tbody> 



      <tr > 

        <td >{portfolio.portfolioAddress.toString()}</td>
        <td >{portfolio.creatorPortfolio.toString()}</td>
        <td>{portfolio.amountAsset1.property}</td>
    
      </tr>
   

</tbody> 


</table>
                {/* <div>address of new portfolio :  {portfolio.portfolioAddress.toString()}</div>
                <div>--- creator Portfolio : {portfolio.creatorPortfolio.toString()}</div>
                <div>  -- amount of Asset1  : {portfolio.amountAsset1.property}</div>
                <div>  -- address of Asset1 : {portfolio.addressAsset1.toString()}</div>
                <div> -- period of Asset1 : {portfolio.periodAsset1.property}</div>
                <div> -- assetToSoldIntoAsset1 : {portfolio.assetToSoldIntoAsset1.toString()}</div>
                <div> --metadataUrl :  {portfolio.metadataUrl.toString()}</div>
                <div>  --metadataHash : {portfolio.metadataHash.property}</div> */}
              
               
            </>}

            {userPAccount && 
            <div>

               
                <div>************************************ Info User Portfolio Account *****************************</div>
                <table >

<thead>
  <tr>
  <th>address of new user portfolio</th>
    <th>portfolio_address</th>
    <th>amount</th>
  </tr>
</thead>


<tbody> 



      <tr > 

        <td >{userPAccount.user_portfolio_address.toString()}</td>
        <td >{userPAccount.portfolio_address.toString()}</td>
        <td> {userPAccount.delegatedAmount}</td>
    
      </tr>
   

</tbody> 


</table>
                
                {/* <div>address of new user portfolio :   {userPAccount.user_portfolio_address.toString()}
                    --- portfolio_address : {userPAccount.portfolio_address.toString()}
                    -- owner  : {userPAccount.owner.toString()}
                 -- delegated amount : {userPAccount.delegatedAmount}
                    -- delegate : {userPAccount.delegate.toString()}
                </div>

                <div>   ************************************ end info User Portfolio Account ******************************</div>
                <div>  ********************************************************************************************************</div> */}

            </div>
            }

             {depositAccounts && <>
               
                <div>********************************************Info SPLU PRIMARY BEFORE SWAP *********************************</div>
                {/* <div>address of SPLU PRIMARY : {depositAccounts[0].address.toString()}
                    ----  amount OF SPLU PRIMARY :  {depositAccounts[0].amount.toString()}</div> */}
             <table >

<thead>
  <tr>
  <th>address of SPLU PRIMARY </th>
    <th>amount OF SPLU PRIMARY </th>
  
  </tr>
</thead>


<tbody> 



      <tr > 

        <td >{depositAccounts[0].address.toString()}</td>
        <td >{depositAccounts[0].amount.toString()}</td>
     
    
      </tr>
   

</tbody> 


</table>

                <div>********************************************Info SPLU SECONDARY BEFORE SWAP  *********************************</div>
                <table >

<thead>
  <tr>
  <th>address of SPLU SECONDARY</th>
    <th>amount of SPLU SECONDARY  </th>
  
  </tr>
</thead>


<tbody> 



      <tr > 

        <td >{depositAccounts[1].address.toString()}</td>
        <td >{depositAccounts[1].amount.toString()}</td>
     
    
      </tr>
   

</tbody> 


</table>
                
                {/* <div>address of SPLU SECONDARY : {depositAccounts[1].address.toString()}
                    ---- amount of SPLU SECONDARY :  {depositAccounts[1].amount.toString()}</div> */}
              
                <div>********************************************Info SPLU PRIMARY AFTER SWAP *********************************</div>
                {/* <div>address of SPLU PRIMARY : {depositAccounts[2].address.toString()}
                    ----  amount OF SPLU PRIMARY :  {depositAccounts[2].amount.toString()}</div> */}
<table >

<thead>
  <tr>
  <th>address of SPLU SECONDARY</th>
    <th>amount of SPLU SECONDARY  </th>
  
  </tr>
</thead>


<tbody> 



      <tr > 

        <td >{depositAccounts[2].address.toString()}</td>
        <td >{depositAccounts[2].amount.toString()}</td>
     
    
      </tr>
   

</tbody> 


</table>

                <div>********************************************Info SPLU SECONDARY AFTER SWAP  *********************************</div>
                {/* <div>address of SPLU SECONDARY : {depositAccounts[3].address.toString()}
                    ---- amount of SPLU SECONDARY :  {depositAccounts[3].amount.toString()}</div> */}


<table >

<thead>
  <tr>
  <th>address of SPLU SECONDARY</th>
    <th>amount of SPLU SECONDARY  </th>
  
  </tr>
</thead>


<tbody> 



      <tr > 

        <td >{depositAccounts[3].address.toString()}</td>
        <td >{depositAccounts[3].amount.toString()}</td>
     
    
      </tr>
   

</tbody> 


</table>
              
                <div>******************************************** INFO PPU AFTER SWAP  *********************************</div>
                <table >

<thead>
  <tr>
  <th>user_portfolio_address :</th>
    <th>portfolio_address : </th>
    <th>delegated amount:  </th>
  </tr>
</thead>


<tbody> 



      <tr > 

        <td >{depositAccounts[4].user_portfolio_address.toString()}</td>
        <td >{depositAccounts[4].portfolio_address.toString()}</td>
        <td >{depositAccounts[4].delegatedAmount.toString()}</td>
    
      </tr>
   

</tbody> 


</table>      
  <br/>        
  <br/>     
  <br/>          
               
               
               
                {/* <div>user_portfolio_address : {depositAccounts[4].user_portfolio_address.toString()}
                    --- portfolio_address : {depositAccounts[4].portfolio_address.toString()}
                    -- owner  : {depositAccounts[4].owner.toString()}
                    -- delegated amount : {depositAccounts[4].delegatedAmount.toString()}
                    -- delegate : {depositAccounts[4].delegate.toString()}
                    -- splu_asset1 : {depositAccounts[4].splu_asset1.toString()}</div> */}

               


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