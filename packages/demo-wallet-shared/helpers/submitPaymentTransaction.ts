import StellarSdk, { Transaction } from "stellar-sdk";
import { getErrorString } from "./getErrorString";
import { getNetworkConfig } from "./getNetworkConfig";
import { signTransaction } from "./keyManager";
import { signLedgerTransaction } from "./signLedgerTransaction";
import { signTrezorTransaction } from "./signTrezorTransaction";
import { AuthType } from "../types/types";
// import signWithRabet from "./signRabetTransaction";

// eslint-disable-next-line max-len
export const submitPaymentTransaction = async (transaction: Transaction, state: any) => {
  const { settings, keyStore } =  state;
  const server = new StellarSdk.Server(
    getNetworkConfig(!!settings.pubnet).url,
  );

  try {
    let signedTransaction: Transaction;

    // Ledger uses WebUSB API in TransportWebUSB, from their GitHub repo:
    // https://github.com/LedgerHQ/ledgerjs/tree/master/packages/hw-transport-webusb#faq-dom-exception-is-triggered-when-creating-the-transport
    // "The transport functions create() and listen() must be called in the
    // context of an user interaction (like a "click" event), otherwise it fails
    // with DOM Exception. This is by WebUSB design. You also must run on
    // HTTPS."
    // So we need to trigger the signing "directly" from the action, passing it
    // to the `wallet-sdk` fails because it's going through different layers.
    if (settings.authType === AuthType.LEDGER) {
      // eslint-disable-next-line max-len
      signedTransaction = await signLedgerTransaction(transaction, keyStore, state);
    } else if (settings.authType === AuthType.TREZOR) {
      // eslint-disable-next-line max-len
      signedTransaction = await signTrezorTransaction(transaction, keyStore, state);
    } else {
      signedTransaction = await signTransaction({
        id: keyStore.keyStoreId,
        password: keyStore.password,
        transaction,
        custom: keyStore.custom,
      }, state);
    }

    return await server.submitTransaction(signedTransaction);
  } catch (error) {
    throw new Error(
      `Failed to sign transaction, error: ${getErrorString(error)}`,
    );
  }
};
