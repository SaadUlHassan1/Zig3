import React, { useState } from "react";
import { Button, Heading5, Input, Modal } from "@stellar/design-system";

import { WalletModalContent } from "../WalletModalContent";
import { ErrorMessage } from "../ErrorMessage";
import { useErrorMessage } from "../../hooks/useErrorMessage";

export const PinCodeModal = ({
  onClose,
  setUserPin,
  userPin,
  handleConfirm,
  component,
  loginData,
}) => {
  const [confirmPin, setConfirmPin] = useState(null);

  const { errorMessage, setErrorMessage } = useErrorMessage({
    initialMessage: "",
  });

  const handleModalClose = () => {
    onClose();
    setUserPin(null);
  };

  const isDisabled = () => {
    if (
      component.includes("Register") &&
      (!userPin || !confirmPin || userPin !== confirmPin)
    ) {
      return true;
    } else if (
      component.includes("Login") &&
      (!userPin || (loginData || {}).userPin !== userPin)
    ) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <WalletModalContent
      type="fingerFace"
      buttonFooter={
        <>
          <Button onClick={handleConfirm} disabled={isDisabled()}>
            Confirm & {component.includes("Register") ? "Register" : "Login"}
          </Button>
          <Button onClick={handleModalClose} variant={Button.variant.secondary}>
            Cancel
          </Button>
        </>
      }
    >
      <div className="form-access my-auto">
        <Modal.Body>
          <Heading5 className="text-center">
            Please Enter Pin to {component}
          </Heading5>
          <Input
            className="w-100 secret-key-field"
            id="pin"
            type="password"
            label="User Pin:*"
            onChange={(e) => setUserPin(e.target.value)}
            value={userPin}
            onBlur={() => {
              if (
                component.includes("Login") &&
                (!userPin || (loginData || {}).userPin !== userPin)
              ) {
                setErrorMessage(
                  `Incorrect Pin for ${
                    loginData.name ?? "this account"
                  }. Please Enter Valid Pin`
                );
              } else {
                setErrorMessage("");
              }
            }}
            placeholder="Please Enter Pin"
          />
          {component.includes("Register") && (
            <Input
              className="w-100 secret-key-field"
              id="pin"
              type="password"
              label="Confirm User Pin:*"
              onChange={(e) => setConfirmPin(e.target.value)}
              value={confirmPin}
              onBlur={() => {
                if (
                  component.includes("Register") &&
                  (!userPin || !confirmPin || userPin !== confirmPin)
                ) {
                  setErrorMessage(
                    "Pin does not matched. Plesae enter the same pin in both fields"
                  );
                } else {
                  setErrorMessage("");
                }
              }}
              placeholder="Please Re Enter the same Pin"
            />
          )}
        </Modal.Body>
      </div>

      <ErrorMessage message={errorMessage} textAlign="center" />
    </WalletModalContent>
  );
};
