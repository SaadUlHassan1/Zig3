import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import {Input, Modal } from "@stellar/design-system";
import { KeyType } from "types/types.d";
// import StellarSdk from "stellar-sdk";
import {
  Keypair, // Keypair represents public and secret keys.
  Networks, // Network provides helper methods to get the passphrase or id for different stellar networks.
  Operation, // Operation helps you represent/build operations in Stellar network.
  Server, // Server handles the network connections.
  TransactionBuilder // Helps you construct transactions.
} from 'stellar-sdk'
// import StellarBase from 'stellar-base'
import { useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
import { fetchAccountAction } from 'ducks/account';
import { fetchClaimableBalancesAction } from 'ducks/claimableBalances';
import { useRedux } from 'hooks/useRedux';
// import { ActionStatus, AuthType } from 'types/types';
import { updateSettingsAction } from 'ducks/settings';
import { storeKeyAction } from 'ducks/keyStore';
export const ActionStatus = {
  ERROR: "ERROR",
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  NEEDS_INPUT: "NEEDS_INPUT",
  CAN_PROCEED: "CAN_PROCEED",
}

export const AuthType = {
  ALBEDO: "ALBEDO",
  LEDGER: "LEDGER",
  FREIGHTER: "FREIGHTER",
  PRIVATE_KEY: "PRIVATE_KEY",
  TREZOR: "TREZOR",
}
export default function Signup() {

  const history = useNavigate();
  const { account } = useRedux('account')
  console.log('account Signup:', account)
  const { status, isAuthenticated, errorString, data } = account;
  const accountId = data?.id;
  const [secretKey, setSecretKey] = useState("");
  const [acceptedTermsAndConditions, setAcceptedTermsAndConditions] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch()
  const handleSignIn = async () => {
    setErrorMessage("");
    if (!secretKey) {
      setErrorMessage("Please enter your secret key");
      return;
    }
    console.log('Network - :', Networks)
    console.log('secretKey - :', secretKey)
    try {
      // Tell the Stellar SDK you are using the testnet
      // Networks.TESTNET
      // point to testnet host
      const stellarServer = new Server('https://horizon-testnet.stellar.org');
    
      // Never put values like the an account seed in code.
      const provisionerKeyPair = Keypair.fromSecret(secretKey)
      console.log('provisionerKeyPair -:', provisionerKeyPair.publicKey())
      // Load account from Stellar
      // const account= await StellarBase.Account(provisionerKeyPair.publicKey(),"2319149195853854");
      // console.log('account -:', account)
      const keys = {
        secretKey: secretKey,
        publicKey: provisionerKeyPair.publicKey()
      }
      dispatch(
        fetchAccountAction({
          publicKey: keys?.publicKey,
          secretKey: keys?.secretKey,
        }),
      );
      dispatch(fetchClaimableBalancesAction({ publicKey: keys.publicKey }));
      // history.push('/newwallet')
      localStorage.setItem('keys', JSON.stringify(keys));
      const provisioner = await stellarServer.loadAccount(provisionerKeyPair.publicKey()).then((res) => {
        console.log('res', res)
      })
    
      console.log('creating account in ledger', Keypair.publicKey())
      const transaction = new TransactionBuilder(provisioner, Networks.TESTNET)
            .addOperation(
              // Operation to create new accounts
              Operation.createAccount({
                destination: Keypair.publicKey(),
                startingBalance: '2'
              })
            ).build()
    
      // Sign the transaction above
      transaction.sign(provisionerKeyPair)
    
      // Submit transaction to the server
      const result = await stellarServer.submitTransaction(transaction);

      console.log('Account created: ', result)
    } catch (e) {
      console.log('Stellar account not created.', e)
    }
    // history.push('/newwallet')
  }
  useEffect(() => {
    if (status === ActionStatus.SUCCESS) {
      if (isAuthenticated && accountId) {
        // history.push('/newwallet')
        dispatch(updateSettingsAction({ authType: AuthType.PRIVATE_KEY }));
        dispatch(
          storeKeyAction({
            publicKey: accountId,
            privateKey: secretKey,
            keyType: KeyType.plaintextKey,
          }),
        );
      } else {
        setErrorMessage("Something went wrong, please try again.");
        console.log("login: saw connect with secret key error", {
          message: errorString,
        });
      }
    }
  }, [
    status,
    isAuthenticated,
    setErrorMessage,
    dispatch,
    accountId,
    secretKey,
    errorString,
  ]);


  return (
    <>
      <div className="container d-flex vh-100 justify-content-center">
        <div className="form-access my-auto">
          <div className='row'>
            <div className='card p-4 pt-0 shadow login-card'>
              <h1 className='font-weight-bolder mt-3'>Zig3</h1>
              <p className='mt-3 mb-4 font-weight-normal'>YOUR SECRET KEY WILL BE DELETED<br/> IMMEDIATELY FROM BROWSER CASH<br/> AFTER PRESSING LOG OUT OR CLOSING<br/> THE BROWSER . SO PLEASE MAKE SURE<br/> TO NOT FORGET TO PRESS ON LOG<br/> OUT ONCE YOU DONE .</p>
              <Modal.Body>
                <Input
                  className='w-100 secret-key-field'
                  id="secretKey"
                  label="secret key:*"
                  type='password'
                  onChange={(e) => setSecretKey(e.target.value)}
                  value={secretKey}
                  placeholder="Secret key (example: SBSMVCIWBL3HDB7N4EI3QKBKI4D5ZDSSDF7TMPB.....)"
                />
              </Modal.Body>
              <div className='text-danger mt-2'>{errorMessage}</div>
              <div className="form-check">
                <input className="form-check-input mt-1" type="checkbox" value={acceptedTermsAndConditions} onChange={() => setAcceptedTermsAndConditions(!acceptedTermsAndConditions)} id="flexCheckDefault"/>
                <label className="form-check-label mt-3" htmlFor="flexCheckDefault">
                  I agree on <Link to="/terms-and-conditions"> Terms & Conditions</Link>
                </label>
              </div>
              <div className="Layout__inline mt-3">
                <button className="login-button py-0" onClick={handleSignIn} disabled={!acceptedTermsAndConditions}
                >
                  log in
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
