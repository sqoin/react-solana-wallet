import React from "react";
import SerumSwap from "./SerumSwap";
import SwapOriginal from "./SwapPage.js";
import PortfolioPage from "./PortfolioPage";
import TransferMultisig from "./TransferMultisig";
import HomePage from "./HomePage";
import Saber from "./Saber";
import NftPage from "./NftPage"
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import QuarryFarm from "./quarry-farm";

export default function App() {
  return (
    <Router>
    <div>
    
      <Switch>
        <Route exact path="/">
          <HomeLink />
        </Route>
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
        <Route exact path="/Saber">
          <SaberLink />
        </Route>
        <Route exact path="/QuarryFarm">
          <QuarryLink />
        </Route>
        <Route exact path="/Nft">
          <NftLink />
        </Route>
      </Switch>
    </div>
  </Router>



  );
}
function HomeLink() {
  return (
   <HomePage/>
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
   <PortfolioPage/>
  );
}
function TransferMultisigLink() {
  return (
   <TransferMultisig/>
  );
}
function SaberLink() {
  return (
   <Saber/>
  );
}
function QuarryLink() {
  return (
   <QuarryFarm/>
  );
}

function NftLink() {
  return (
   <NftPage/>
  );
}

