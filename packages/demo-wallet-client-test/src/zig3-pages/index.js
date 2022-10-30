import React from "react";
import Layout from "../components/Layout";
import { Routes, Route } from "react-router-dom";
import Exchange from "./exchange";
import Markets from "./markets";
import Profile from "./profile";
import Wallet from "./wallet";
import Settings from "./settings";
import Login from "./login";
import Reset from "./reset";
import OtpVerify from "./otp-verify";
import OtpNumber from "./otp-number";
import Lock from "./lock";
import TermsAndConditions from "./terms-and-conditions";
import NewsDetails from "./news-details";
import Signup from "./signup";
import Notfound from "./notfound";
import DxExchange from "./dx-exchange";
import StellarMarkets from "./stellar-markets";
import NewWallet from "./NewWallet";
import { ScrollToTop } from "App";
export default function index() {
  return (
    <>
      <Layout>
        <Routes>
          <Route exact path="/" element={<Exchange />} />
          <Route path="/dx-exchange" element={<DxExchange />} />
          <Route path="/stellar-markets" element={<StellarMarkets />} />
          <Route path="/markets" element={<Markets />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset" element={<Reset />} />
          <Route path="/otp-verify" element={<OtpVerify />} />
          <Route path="/otp-number" element={<OtpNumber />} />
          <Route path="/lock" element={<Lock />} />
          <Route
            path="/terms-and-conditions"
            element={<TermsAndConditions />}
          />
          <Route path="/news-details" element={<NewsDetails />} />
          <Route path="/newwallet" element={<NewWallet />} />
          <Route path="/notfound" element={<Notfound />} />
          <Route element={<ScrollToTop />} />
        </Routes>
      </Layout>
    </>
  );
}
