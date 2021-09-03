import React from "react";
import SerumSwap from "./SerumSwap";
import SwapOriginal from "./SwapOriginal";
import Portfolio from "./Portfolio";
import TransferMultisig from "./TransferMultisig";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

export default function App() {
  return (
    <Router>
    <div>
    
      <Switch>
        <Route exact path="/SerumSwap">
          <SerumSwapLink />
        </Route>
        <Route exact path="/SwapOriginal">
          <SwapOriginalLink />
        </Route>
        <Route exact path="/Portfolio">
          <PortfolioLink />
        </Route>
        <Route exact path="/TransferMultisig">
          <TransferMultisigLink />
        </Route>

      </Switch>
    </div>
  </Router>



  );
}
function SerumSwapLink() {
  return (
   <SerumSwap/>
  );
}
function SwapOriginalLink() {
  return (
   <SwapOriginal/>
  );
}
function PortfolioLink() {
  return (
   <Portfolio/>
  );
}
function TransferMultisigLink() {
  return (
   <TransferMultisig/>
  );
}

