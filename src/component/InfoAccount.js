import React, {useState } from 'react';

import { getTokenAccountsByOwnerSolet} from "../cli/makesteps"
function InfoAccount(props) {
    const [logs, setLogs] = useState([]);
    function addLog(log) {
        setLogs((logs) => [...logs, log]);
      }
    const [accountInfo, setAccountInfo] = useState()
    async function getTokenAccountsByOwner() {
        addLog("loading  token   account by owner");
        try {
          getTokenAccountsByOwnerSolet(props.selectedWallet, props.connection).then(
            accountsInfo => {
              setAccountInfo(accountsInfo)
              
            }
          )
        }
        catch (err) {
          addLog(err)
        }
    
      }
return(
   
    <div>  <button onClick={() => getTokenAccountsByOwner()}>refresh</button>
    <table >

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


    </table></div>
)
}
export default InfoAccount