import TrezorConnect from "trezor-connect";
// @ts-ignore
import transformTransaction from "trezor-connect/lib/plugins/stellar/plugin";
import { Transaction } from "stellar-sdk";
import { loadPrivateKey } from "./keyManager";

export const signTrezorTransaction = async (
  transaction: Transaction,
  keyStore: any,
  state: any,
) => {
  const { keyStoreId, password, custom } = keyStore;

  if (!custom || !custom.email || !custom.appUrl) {
    throw new Error(
      `Trezor Connect manifest with "email" and "appUrl" props is required.
      Make sure they are passed through "custom" prop.`,
    );
  }

  const key = await loadPrivateKey({
    id: keyStoreId,
    password,
  }, state);

  TrezorConnect.manifest({
    email: custom.email,
    appUrl: custom.appUrl,
  });

  const bipPath = custom.bipPath || "44'/148'/0'";
  const trezorParams = transformTransaction(`m/${bipPath}`, transaction);
  // @ts-ignore
  // Trezor memo returns number for type
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const response = await TrezorConnect.stellarSignTransaction(trezorParams);

  if (response.success) {
    const signature = Buffer.from(response.payload.signature, "hex").toString(
      "base64",
    );
    transaction.addSignature(key.publicKey, signature);

    return transaction;
  }

  throw new Error(
    response.payload?.error || "We couldn’t sign the transaction with Trezor.",
  );
};
