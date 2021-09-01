import React from "react";
import SerumSwap from "./SerumSwap";
import SwapOriginl from "./SwapOriginal";

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
        <Route exact path="/SwapOriginl">
          <SwapOriginlLink />
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
function SwapOriginlLink() {
  return (
   <SwapOriginl/>
  );
}

