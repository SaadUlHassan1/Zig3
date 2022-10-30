import { useEffect } from "react";
// import { isConnected } from "@stellar/freighter-api";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button, InfoBlock } from "@stellar/design-system";

import { WalletModalContent } from "../WalletModalContent";
import { ErrorMessage } from "../ErrorMessage";

import { fetchAccountAction, resetAccountAction } from "ducks/account";
import { storeKeyAction } from "ducks/keyStore";
import { updateSettingsAction } from "ducks/settings";
import { fetchRabetStellarAddressAction } from "ducks/wallet/rabet";
// import { logEvent } from "../../helpers/tracking";
import { useErrorMessage } from "../../hooks/useErrorMessage";
import { useRedux } from "../../hooks/useRedux";
import { ActionStatus, AuthType, KeyType, ModalPageProps } from "../../types/types.d";

declare global {
  interface Window {
    rabet: any;
  }
}

export const SignInRabetForm = ({ onClose }: ModalPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { walletRabet, account, settings } = useRedux(
    "walletRabet",
    "account",
    "settings",
  );
  const {
    data: rabetData,
    status: rabetStatus,
    errorString: rabetErrorMessage,
  } = walletRabet;
  const {
    status: accountStatus,
    isAuthenticated,
    errorString: accountErrorMessage,
  } = account;
  // const isAvailable = isConnected();
  // type window = {
  //   rabet: any
  // }

  const isAvailable = window.rabet ? true : false;
  console.log("window -:", window.rabet);

  // if(window.rabet) {

  // }
  const { isTestnet } = settings;

  const { errorMessage, setErrorMessage } = useErrorMessage({
    initialMessage: rabetErrorMessage || accountErrorMessage,
    onUnmount: () => {
      // Reset account store, if there are errors.
      // walletFreighter store is reset every time modal is closed.
      dispatch(resetAccountAction());
    },
  });

  // const { errorMessage, setErrorMessage } = useErrorMessage({
  //   initialMessage: "",
  // });

  const fetchRabetLogin = () => {
    setErrorMessage("");
    dispatch(fetchRabetStellarAddressAction());
    // fetchRabetStellarAddressAction();
  };

  // const fetchRabetStellarAddressAction = async () => {
  //   console.log("here");
  //   try {
  //     debugger
  //     if(!window.rabet) {
  //       console.log('window.rabet):', window.rabet)
  //     }
  //     const rabetResponse = await window.rabet.connect();
  //     console.log("rabetResponse - :", rabetResponse);
  //     setErrorMessage(rabetResponse.publicKey.toString());
  //     const keys = {
  //       secretKey: "",
  //       publicKey: rabetResponse.publicKey,
  //     };
  //     localStorage.setItem("keys", JSON.stringify(keys));
  //     if (onClose) {
  //       onClose("/wallet");
  //     }
  //     // return { publicKey: rabetResponse.publicKey };
  //   } catch (e) {
  //     const error = getCatchError(e);
  //     // return rejectWithValue({
  //     //   errorString: error.toString(),
  //     // });
  //     setErrorMessage(error.toString());
  //   }
  // };

  useEffect(() => {
    if (rabetStatus === ActionStatus.SUCCESS) {
      if (rabetData) {
        dispatch(fetchAccountAction({publicKey: rabetData.publicKey}));
        dispatch(
          storeKeyAction({
            publicKey: rabetData.publicKey,
            keyType: KeyType.rabet,
            custom: { network: isTestnet ? "TESTNET" : "PUBLIC" },
          }),
        );
        // logEvent("login: connected with rabet");
      } else {
        setErrorMessage("Something went wrong, please try again.");
        // logEvent("login: saw connect with rabet error", {
        //   message: rabetErrorMessage,
        // });
      }
    }
  }, [
    rabetStatus,
    dispatch,
    rabetData,
    setErrorMessage,
    rabetErrorMessage,
    isTestnet,
  ]);

  useEffect(() => {
    if (accountStatus === ActionStatus.SUCCESS) {
      if (isAuthenticated) {
        navigate({
          pathname: "/newwallet",
          search: location.search,
        });
        dispatch(updateSettingsAction({ authType: AuthType.RABET }));
      } else {
        setErrorMessage("Something went wrong, please try again.");
        // logEvent("login: saw connect with freighter error", {
        //   message: accountErrorMessage,
        // });
      }
    }
  }, [accountStatus, dispatch, isAuthenticated, setErrorMessage, accountErrorMessage, navigate, location.search]);

  const message = isAvailable
    ? `Click on "Connect with Rabet" to launch Rabet browser extension wallet.`
    : "To use Rabet, please download or enable Rabet browser extension wallet.";

  return (
    <WalletModalContent
      type="rabet"
      buttonFooter={
        <>
          {!rabetStatus && (
          <Button
            onClick={fetchRabetLogin}
            disabled={!isAvailable}
          >
            Connect with Rabet
          </Button>
          )}
          <Button onClick={onClose} variant={Button.variant.secondary}>
            Cancel
          </Button>
        </>
      }
    >
      {!rabetStatus && <InfoBlock>{message}</InfoBlock>}
      {rabetStatus === ActionStatus.PENDING && (
      <InfoBlock>Please follow the instructions in the Rabet popup.</InfoBlock>
      )}

      <ErrorMessage
        message={errorMessage}
        textAlign="center"
        marginTop="1rem"
      />
    </WalletModalContent>
  );
};
