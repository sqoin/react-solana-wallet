import React, { useEffect, useMemo, useState } from 'react';


function SwapPortfolio() {


    return (
        <div className="App">
            <h1> Swap Portfolio : </h1>
            <br/>
            <br/>

            Numbre des Assets : <input type="number" min="1" max="10"></input><br/>
            <br/>
           Amount : <input type="number" ></input><br/>
           <br/>

           <button className="btn btn-primary">Swap </button>

        </div>

    )

}

export default SwapPortfolio;