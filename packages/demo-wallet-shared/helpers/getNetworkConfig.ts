import StellarSdk from "stellar-sdk";

export const getNetworkConfig = (pubnet?: boolean) => ({
  network: pubnet ? StellarSdk.Networks.PUBLIC : 
    process?.env?.REACT_APP_HORIZON_PASSPHRASE || StellarSdk.Networks.TESTNET,
  url:
    pubnet ? 'https://horizon.stellar.org' : process?.env?.REACT_APP_HORIZON_URL ||
    "https://horizon-testnet.stellar.org",
});
