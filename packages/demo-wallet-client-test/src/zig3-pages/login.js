import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import sjcl from "@tinyanvil/sjcl";
import { get, set, getAllKeys } from "../Services/storage";
import * as CBOR from "cbor-web";
import { Heading1, TextLink, Modal, Layout } from "@stellar/design-system";
import { wallets } from "constants/wallets";
import { WalletButton } from "components/WalletButton";
import { NewKeyPairForm } from "../components/NewKeyPairForm";
import { SignInAlbedoForm } from "components/SignIn/SignInAlbedoForm";
import { SignInLedgerForm } from "components/SignIn/SignInLedgerForm";
import { SignInFreighterForm } from "components/SignIn/SignInFreighterForm";
import { SignInRabetForm } from "components/SignIn/SignInRabetForm";
import { SignInFingerFaceForm } from "../components/SignIn/SignInFingerFaceForm";
import { SignInTrezorForm } from "components/SignIn/SignInTrezorForm";
import { PinCodeModal } from "../components/PinCode/PinCode";
import { useDispatch } from "react-redux";
import { fetchAccountAction } from "ducks/account";
import { fetchClaimableBalancesAction } from "ducks/claimableBalances";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userName, setUserName] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [activeModal1, setActiveModal1] = useState(null);
  const [valueType, setValueType] = useState("");
  const [data, setData] = useState({});
  const [loginData, setLoginData] = useState({});
  const [registerData, setRegisterData] = useState({});
  const [encryptedData, setEncryptedData] = useState([]);
  const [cId, setCId] = useState("");
  const [acceptedTermsAndConditions, setAcceptedTermsAndConditions] =
    useState(false);
  const [userPin, setUserPin] = useState(null);

  const createAccount = async (payload) => {
    setRegisterData(payload)
    let webAutnData = await registerWebAuthn(payload);
    if(webAutnData) {
    let account = {
      publicKey: payload.publicKey,
      keyStore: sjcl.encrypt(userName, payload.secretKey, {
        adata: JSON.stringify({
          id: payload.id,
          name: payload.name,
          publicKey: payload.publicKey,
          ...webAutnData,
        }),
      }),
    };
    setData({
      ...data,
      [payload.id]: { ...payload, ...webAutnData },
    });
    setUserName("");
    await set(`keyStore-${payload.name}`, btoa(account.keyStore));
    closeModal();
    await getData();
    }
  };

  const createAccountViaPin = async () => {
    if(registerData && userPin) {
      let account = {
        publicKey: registerData.publicKey,
        keyStore: sjcl.encrypt(userName, registerData.secretKey, {
          adata: JSON.stringify({
            id: registerData.id,
            name: registerData.name,
            publicKey: registerData.publicKey,
            userPin: userPin,
          }),
        }),
      };
      setData({
        ...data,
        [registerData.id]: { ...registerData, userPin: userPin },
      });
      setUserName("");
      await set(`keyStore-${registerData.name}`, btoa(account.keyStore));
      setRegisterData({})
      setUserPin(null)
      closeModal();
      await getData();
    }
  }
  const getData = async () => {
    let allKeys = await getAllKeys();
    let allStorage = [];
    for (let i = 0; i < allKeys.length; i++) {
      let keystore = await get(allKeys[i]);
      if (keystore) {
        let data = JSON.parse(atob(JSON.parse(atob(keystore)).adata));
        let payload = {
          ...data,
          secretKey: sjcl.decrypt(data.name, atob(keystore)),
        };
        allStorage[i] = payload;
      }
    }
    setEncryptedData(allStorage);
  };

  useEffect(() => {
    console.log("encryptedData:", encryptedData);
  }, [encryptedData]);
 /* eslint-disable */
  useEffect(async () => {
    detectWebAuthnSupport();
    await getData();
  }, []);

  const openModal = (type) => {

    if (type === "SIGNIN_SECRET_KEY") {
      navigate("/signup");
      return;
    }
    setValueType(type);
    openModal1(type);
    // setActiveModal(type);
  };

  const closeModal = (path) => {
    setActiveModal(null);
    if (path) {
      navigate(path);
    }
    // resetWalletState(activeModal);
  };

  const openModal1 = (type) => {
    setActiveModal1(type);
  };

  const closeModal1 = (path) => {
    setActiveModal1(null);

    // resetWalletState(activeModal);
  };

  const handleLoginViaPin = () => {
    if(loginData.userPin === userPin) {
      setUserPin('')
      // navigate.push('/newwallet')
      dispatch(
        fetchAccountAction({
          publicKey: loginData?.publicKey,
          secretKey: loginData?.secretKey,
        }),
      );
      dispatch(fetchClaimableBalancesAction({ publicKey: loginData?.publicKey }));
    }
  }
  const renderModalContent = (ModalType) => {
    switch (activeModal) {
      case "SIGNIN_FINGER_FACE":
        return (
          <SignInFingerFaceForm
            onClose={closeModal}
            termhandler={termhandler}
            renderModalContent={renderModalContent}
            setUserName={setUserName}
            userName={userName}
            encryptedData={encryptedData}
            setLoginData={setLoginData}
            loginData={loginData}
            cId={cId}
            userPin={userPin}
          />
        );
      case "SIGNIN_RABET":
        return <SignInRabetForm onClose={closeModal} />;
      case "SIGNIN_TREZOR":
        return <SignInTrezorForm onClose={closeModal} />;
      case "SIGNIN_LEDGER":
        return <SignInLedgerForm onClose={closeModal} />;
      case "SIGNIN_FREIGHTER":
        return <SignInFreighterForm onClose={closeModal} />;
      case "SIGNIN_ALBEDO":
        return <SignInAlbedoForm onClose={closeModal} />;
      case "NEW_KEY_PAIR":
        return (
          <NewKeyPairForm
            onClose={closeModal}
            createAccount={createAccount}
            userName={userName}
            closeModal1={closeModal1}
          />
        );
      case "PIN_CODE":
        return <PinCodeModal onClose={closeModal} setUserPin={setUserPin} userPin={userPin} handleConfirm={createAccountViaPin} component={'Register'}/>
      case "SIGNIN_PIN_CODE":
        return <PinCodeModal onClose={closeModal} setUserPin={setUserPin} userPin={userPin} handleConfirm={handleLoginViaPin} component={'Login'} loginData={loginData}/>
      default:
        return null;
    }
  };

  const termhandler = (value) => {
    setAcceptedTermsAndConditions(false);
    closeModal1();
    setActiveModal(value);
  };
  function detectWebAuthnSupport() {
    if (
      window.PublicKeyCredential === undefined ||
      typeof window.PublicKeyCredential !== "function"
    ) {
      alert("Oh no! This browser doesn't currently support WebAuthn.");
      if (
        window.location.protocol === "http:" &&
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1"
      ) {
        alert(
          'WebAuthn only supports secure connections. For testing over HTTP, you can use the origin "localhost".'
        );
      }
      return;
    }
  }

  async function registerWebAuthn(payload) {
    try {
      const publicKeyCredentialCreationOptions = {
        challenge: Uint8Array.from("xxxxxxxxxxxxxx", (c) => c.charCodeAt(0)),
        rp: {
          name: "localhost",
          id: "localhost",
        },
        user: {
          id: Uint8Array.from("UZSL85T9AFC", (c) => c.charCodeAt(0)),
          name: payload.name,
          displayName: payload.name,
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          requireResidentKey: false,
          userVerification: "discouraged",
        },
        timeout: 60000,
        attestation: "none",
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      });
      const decodedAttestationObj = CBOR.decode(
        credential.response.attestationObject
      );

      const { authData } = decodedAttestationObj;

      // get the length of the credential ID
      const dataView = new DataView(new ArrayBuffer(2));
      const idLenBytes = authData.slice(53, 55);
      idLenBytes.forEach((value, index) => dataView.setUint8(index, value));
      const credentialIdLength = dataView.getUint16();

      // get the credential ID
      const credentialId = authData.slice(55, 55 + credentialIdLength);

      // get the public key object
      const publicKeyBytes = authData.slice(55 + credentialIdLength);

      // the publicKeyBytes are encoded again as CBOR
      const publicKeyObject = CBOR.decode(publicKeyBytes.buffer);
      console.log(publicKeyObject);
      setCId(credentialId);

      return {
        credentialId: credentialId,
        publicKeyId: credential.id,
      };
    } catch (e) {
      console.log("error:", e);
      termhandler('PIN_CODE')
    }
  }

  return (
    <>
      <div className=" container d-flex vh-100 vw-100 justify-content-center">
        <div className="my-auto">
          <div className=" p-4 pt-0">
            <Layout.Inset>
              <div className="Landing-container">
                <Heading1>Login with a wallet</Heading1>

                <div className="WalletButtons-container">
                  {Object.keys(wallets).map((walletKey) => {
                    const wallet = wallets[walletKey];

                    return (
                      <>
                        <WalletButton
                          key={walletKey}
                          onClick={() => openModal(wallet.modalType)}
                          imageSvg={wallet.logoSvg}
                          infoText={
                            <>
                              {wallet.infoText}{" "}
                              <TextLink
                                href={wallet.infoLink}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {wallet.infoLinkText}
                              </TextLink>
                            </>
                          }
                        >
                          {wallet.title}
                        </WalletButton>
                      </>
                    );
                  })}
                </div>
                <Modal visible={activeModal1 !== null} onClose={closeModal1}>
                  <div>Term and Conditions</div>
                  <div className="form-check">
                    <input
                      className="form-check-input mt-1"
                      type="checkbox"
                      value={acceptedTermsAndConditions}
                      onChange={() => {
                        if (acceptedTermsAndConditions) {
                          setAcceptedTermsAndConditions(false);
                        } else {
                          setAcceptedTermsAndConditions(true);
                        }
                      }}
                      id="flexCheckDefault"
                    />
                    <label
                      className="form-check-label mt-1"
                      htmlFor="flexCheckDefault"
                    >
                      I agree on{" "}
                      <Link to="/terms-and-conditions">
                        {" "}
                        Terms & Conditions
                      </Link>
                    </label>
                  </div>
                  <div className="Layout__inline mt-3">
                    <button
                      className="login-button py-0"
                      onClick={() => termhandler(valueType)}
                      disabled={!acceptedTermsAndConditions}
                    >
                      log in
                    </button>
                  </div>
                </Modal>
                <Modal visible={activeModal !== null} onClose={closeModal}>
                  {renderModalContent()}
                </Modal>
              </div>
            </Layout.Inset>
          </div>
        </div>
      </div>
    </>
  );
}