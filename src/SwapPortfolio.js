import React, { useEffect, useMemo, useState } from 'react';


function SwapPortfolio() {
    const [values, setValues] = useState();

    function createInputs(n) {
        let ret=[];
        console.log("createInput nb =",n);
        for (var i = 1; i <= n; i++) {
           ret.push(
               <>
            <div key={i}>
                <input type="text" />
                <input type='button' value={`create Asset${i}`} />
                
            </div>
            <br/>
            </>
            )
        };
        return ret;

    }
    useEffect(() => {
        createInputs(values)
    }, [values]);
    
  
    function addInputs(event) {
        let val = event.target.value;
        console.log("nb asset ",val);
        setValues(val);
      //  createInputs(val);
    }

    return (
        <div className="App">
            <h1> Swap Portfolio : </h1>
            <br />
            <br />

            Numbre des Assets : <input type="number" min="1" max="10" value={values} onChange={addInputs}></input><br />
            <br />
            {createInputs(values)}
            Amount : <input type="number" ></input><br />
            <br />

            <button className="btn btn-primary">Swap </button>
            <br />

           
        </div>

    )

}

export default SwapPortfolio;