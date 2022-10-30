import { useState, useEffect } from "react";
import { Keypair } from "stellar-sdk";
import {
  Button,
  Checkbox,
  Heading4,
  InfoBlock,
  TextLink,
  Modal,
  CopyText,
  Heading6,
} from "@stellar/design-system";

import { KeyPairWithLabels } from "./KeyPairWithLabels";

export const NewKeyPairForm = ({ onClose, createAccount, userName }) => {
  const [acceptedWarning, setAcceptedWarning] = useState(false);
  const [newKeyPair, setNewKeyPair] = useState();
  const [keyPairCopyString, setKeyPairCopyString] = useState("");
  const [confirmSavedSecretKey, setConfirmSavedSecretKey] = useState(false);
  useEffect(() => {
    //Removed Warning
    // const logMessage = acceptedWarning
    //   ? "login: previewed new kepair"
    //   : "login: saw new kepair warning";
    // logEvent(logMessage);
    // const keypair = Keypair.random();
    // setNewKeyPair({
    //   publicKey: keypair.publicKey(),
    //   secretKey: keypair.secret(),
    // });
  }, [acceptedWarning]);

  const generateNewKeyPair = () => {
    const keypair = Keypair.random();
    setNewKeyPair({
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
    });

    // Spacing here is important for copied string
    setKeyPairCopyString(`Public key:
${keypair.publicKey()}
Secret key:
${keypair.secret()}`);
  };

  const handleContinue = () => {
    setAcceptedWarning(true);
    generateNewKeyPair();
  };

  const handleDone = () => {
    handleClose();
  };

  const handleClose = () => {
    if (onClose) {
      onClose(null);
    }
  };

  const toggleConfirmSavedSecretKey = () => {
    setConfirmSavedSecretKey(!confirmSavedSecretKey);
  };

  return (
    <>
      {/* Show warning */}
      {!acceptedWarning && (
        <>
          <Modal.Heading>Generate a new keypair</Modal.Heading>

          <Modal.Body>
            <InfoBlock variant={InfoBlock.variant.error}>
              <Heading4>ATTENTION: Secret key wallets are not safe:</Heading4>
              <Heading6>
                Please be aware when using biometrics to store your secret keys,
                while they are secure; It’s advised that you should:
              </Heading6>

              <ul>
                <li>Back up your keys. Writing them down.</li>
                <li>Keeping them in a safe and secure place.</li>
                <li>
                  Do not hold large sums of crypto value on them with this key
                  store method. Use a cold storages method link Trezo or Ledger
                  instead.
                </li>
                <li>
                  Remember a wallet is a wallet. If you lose your device you
                  lose your keys; and hacks maybe able to steal
                </li>
              </ul>
            </InfoBlock>
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={handleContinue}>Continue</Button>
            <Button onClick={handleClose} variant={Button.variant.secondary}>
              Cancel
            </Button>
          </Modal.Footer>
        </>
      )}

      {/* Show generate new key pair form */}
      {acceptedWarning && (
        <>
          <Modal.Heading>Generate a new keypair</Modal.Heading>

          <Modal.Body>
            <InfoBlock variant={InfoBlock.variant.error}>
              <Heading4>ATTENTION:</Heading4>

              <ul>
                <li>
                  It is very important to save your secret key and store it
                  somewhere safe.
                </li>
                <li>
                  If you lose it, you will lose access to your account. No one
                  in the known universe will be able to help you get back in.
                </li>
                <li>
                  SDF does not store a copy of your keys and cannot help you
                  recover lost keys.
                </li>
                <li>
                  Anyone who knows your secret key has access to your funds.
                </li>
                <li>
                  You have several options: Write your key down on a piece of
                  paper. Keep it in a safe. Store it in a password manager. Use
                  a hardware wallet. But don't ever keep it unencrypted on your
                  computer or in your email.
                </li>
                <li>
                  <strong>
                    Note: Connecting by entering a secret key may be deprecated
                    in a future version of the Account Viewer.
                  </strong>
                </li>
              </ul>
            </InfoBlock>

            {newKeyPair && (
              <>
                <KeyPairWithLabels
                  publicKey={newKeyPair.publicKey}
                  secretKey={newKeyPair.secretKey}
                />

                <div className="CopyKey-container">
                  <CopyText
                    textToCopy={keyPairCopyString}
                    showCopyIcon
                    showTooltip
                    tooltipPosition={CopyText.tooltipPosition.right}
                  >
                    <TextLink>Copy keys</TextLink>
                  </CopyText>
                </div>
              </>
            )}

            {/* <ErrorMessage message={errorMessage} marginBottom="1.5rem" /> */}

            <Checkbox
              id="confirmSavedSecretKey"
              label="I’ve stored my secret key in a safe place"
              checked={!!confirmSavedSecretKey}
              onChange={toggleConfirmSavedSecretKey}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button
              onClick={() =>
                createAccount({
                  id: Math.floor(Math.random() * Date.now()),
                  name: userName,
                  secretKey: newKeyPair.secretKey,
                  publicKey: newKeyPair.publicKey,
                })
              }
            >
              Create Now
            </Button>
            <Button onClick={handleDone}>Close</Button>
          </Modal.Footer>
        </>
      )}
    </>
  );
};
