import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Modal,
} from "@stellar/design-system";
import {
  Keypair, // Keypair represents public and secret keys.
  Networks, // Network provides helper methods to get the passphrase or id for different stellar networks.
  Operation, // Operation helps you represent/build operations in Stellar network.
  Server, // Server handles the network connections.
  TransactionBuilder // Helps you construct transactions.
} from 'stellar-sdk'

import { WalletModalContent } from "../WalletModalContent";
import { ErrorMessage } from "../ErrorMessage";
import { useErrorMessage } from "../../hooks/useErrorMessage";
import Autocomplete from "../AutoComplete/AutoComplete";
import { createRandomAccount, fetchAccountAction } from "ducks/account";
import { useDispatch } from "react-redux";
import { fetchClaimableBalancesAction } from "ducks/claimableBalances";
// import { SearchParams } from "types/types";

export const SignInFingerFaceForm = ({ onClose, termhandler, renderModalContent, userName, setUserName, encryptedData, setLoginData, loginData, cId }) => {
  const history = useNavigate();
  const dispatch = useDispatch();
  const { errorMessage, setErrorMessage } = useErrorMessage({
    initialMessage: "",
  });

  const fetchAlbedoLogin = () => {
    setErrorMessage("");
    termhandler('NEW_KEY_PAIR')
    renderModalContent()
  };


    const handleSignIn = async () => {
      setErrorMessage("");
      if (!loginData.secretKey) {
        setErrorMessage("Please enter your secret key");
        return;
      }
      console.log('Network - :', Networks)
      console.log('secretKey - :', loginData.secretKey)
      try {
        // Tell the Stellar SDK you are using the testnet
        // Networks.TESTNET
        // point to testnet host
        const stellarServer = new Server('https://horizon-testnet.stellar.org');
      
        // Never put values like the an account seed in code.
        const provisionerKeyPair = Keypair.fromSecret(loginData.secretKey)
        console.log('provisionerKeyPair -:', provisionerKeyPair.publicKey())
        // Load account from Stellar
        // const account= await StellarBase.Account(provisionerKeyPair.publicKey(),"2319149195853854");
        // console.log('account -:', account)
        const keys = {
          secretKey: loginData.secretKey,
          publicKey: provisionerKeyPair.publicKey()
        }
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
      // history.push('/wallet')
    }


    async function login() {
      handleSignIn()
      try {
        const publicKeyCredentialRequestOptions = {
          challenge: Uint8Array.from(
            "xxxxxx", c => c.charCodeAt(0)),
          allowCredentials: [{
            id: cId ? cId : new Uint8Array(loginData?.credentialId?.data),
            type: 'public-key',
            transports: ['internal'],
          }],
          timeout: 60000,
        }
        const assertion = await navigator.credentials.get({
          publicKey: publicKeyCredentialRequestOptions
        });
        console.log(assertion);
  
        if(assertion?.id === loginData?.publicKeyId) {
          console.log('loginData secretee key:', loginData)
          // dispatch(createRandomAccount());
          dispatch(
            fetchAccountAction({
              publicKey: loginData?.publicKey,
              secretKey: loginData?.secretKey,
            }),
          );
          dispatch(fetchClaimableBalancesAction({ publicKey: loginData?.publicKeyId }));
          // history.push('/newwallet')
          // history.push(searchParams.update(SearchParams.SECRET_KEY, secretKey));
        }
      } catch (error) {
        console.log('error:', error)
        if(loginData && loginData.userPin) {
          termhandler('SIGNIN_PIN_CODE')
        }
      }
    }

    const isRegistrationAllowed = () => {
      if(!userName || (encryptedData?.map(item => item?.name) || []).includes(userName)) {
        return true
      } else {
        return false
      }
    }

    const isLoginAllowed = () => {
      if(!userName || !((encryptedData?.map(item => item?.name) || []).includes(userName))) {
        return true
      } else {
        return false
      }
    }

  return (
    <WalletModalContent
      type="fingerFace"
      buttonFooter={
        <>
            <Button onClick={fetchAlbedoLogin} disabled={isRegistrationAllowed()}>Create Account</Button>
          <Button onClick={login} disabled={isLoginAllowed()}>Login</Button>
          <Button onClick={onClose} variant={Button.variant.secondary}>
            Cancel
          </Button>
        </>
      }
    >
      <div className="form-access my-auto">
      <Modal.Body>
        <Autocomplete suggestions={(encryptedData || [])} onChange={(name) => setUserName(name)} setLoginData={setLoginData}/>
      </Modal.Body>
      </div>

      <ErrorMessage message={errorMessage} textAlign="center" />
    </WalletModalContent>
  );
};
