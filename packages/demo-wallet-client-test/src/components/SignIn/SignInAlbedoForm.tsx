import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button, InfoBlock } from "@stellar/design-system";

import { WalletModalContent } from "components/WalletModalContent";
import { ErrorMessage } from "components/ErrorMessage";

import { fetchAccountAction, resetAccountAction } from "ducks/account";
import { storeKeyAction } from "ducks/keyStore";
import { updateSettingsAction } from "ducks/settings";
import { fetchAlbedoStellarAddressAction } from "ducks/wallet/albedo";
import { logEvent } from "helpers/tracking";
import { useErrorMessage } from "hooks/useErrorMessage";
import { useRedux } from "hooks/useRedux";
import { ActionStatus, AuthType, ModalPageProps, KeyType } from "types/types.d";

export const SignInAlbedoForm = ({ onClose }: ModalPageProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const { walletAlbedo, account } = useRedux("walletAlbedo", "account");
  const {
    data: albedoData,
    status: albedoStatus,
    errorString: albedoErrorMessage,
  } = walletAlbedo;
  const {
    status: accountStatus,
    isAuthenticated,
    errorString: accountErrorMessage,
  } = account;

  const { errorMessage, setErrorMessage } = useErrorMessage({
    initialMessage: albedoErrorMessage || accountErrorMessage,
    onUnmount: () => {
      // Reset account store, if there are errors.
      // walletAlbedo store is reset every time modal is closed.
      dispatch(resetAccountAction());
    },
  });

  const fetchAlbedoLogin = () => {
    setErrorMessage("");
    dispatch(fetchAlbedoStellarAddressAction());
  };

  useEffect(() => {
    if (albedoStatus === ActionStatus.SUCCESS) {
      if (albedoData) {
        dispatch(fetchAccountAction({publicKey: albedoData.publicKey}));
        dispatch(
          storeKeyAction({
            publicKey: albedoData.publicKey,
            keyType: KeyType.albedo,
          }),
        );
        logEvent("login: connected albedo");
      } else {
        setErrorMessage("Something went wrong, please try again.");
        logEvent("login: saw connect with albedo error", {
          message: albedoErrorMessage,
        });
      }
    }
  }, [albedoStatus, dispatch, albedoData, setErrorMessage, albedoErrorMessage]);

  useEffect(() => {
    if (accountStatus === ActionStatus.SUCCESS) {
      if (isAuthenticated) {
        navigate({
          pathname: "/newwallet",
          search: location.search,
        });
        dispatch(updateSettingsAction({ authType: AuthType.ALBEDO }));
      } else {
        setErrorMessage("Something went wrong, please try again.");
        logEvent("login: saw connect with albedo error", {
          message: accountErrorMessage,
        });
      }
    }
  }, [
    accountStatus,
    dispatch,
    navigate,
    isAuthenticated,
    setErrorMessage,
    accountErrorMessage,
    location.search,
  ]);

  return (
    <WalletModalContent
      type="albedo"
      buttonFooter={
        <>
          {!albedoStatus && (
            <Button onClick={fetchAlbedoLogin}>Connect with Albedo</Button>
          )}
          <Button onClick={onClose} variant={Button.variant.secondary}>
            Cancel
          </Button>
        </>
      }
    >
      {!albedoStatus && (
        <InfoBlock>
          Click on "Connect with Albedo" to launch Albedo browser wallet.
        </InfoBlock>
      )}

      {albedoStatus === ActionStatus.PENDING && (
        <InfoBlock>
          Please follow the instructions in the Albedo popup.
        </InfoBlock>
      )}

      <ErrorMessage message={errorMessage} textAlign="center" />
    </WalletModalContent>
  );
};
