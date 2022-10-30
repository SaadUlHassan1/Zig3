import StellarSdk, { Transaction } from "stellar-sdk";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import LedgerApi from "@ledgerhq/hw-app-str";
import { loadPrivateKey } from "./keyManager";

export const signLedgerTransaction = async (
  transaction: Transaction,
  keyStore: any,
  state: any,
) => {
  const key = await loadPrivateKey({
    id: keyStore.keyStoreId,
    password: keyStore.password,
  }, state);

  const transport = await TransportWebUSB.create();
  const ledgerApi = new LedgerApi(transport);
  const result = await ledgerApi.signTransaction(
    "44'/148'/0'",
    transaction.signatureBase(),
  );

  const keyPair = StellarSdk.Keypair.fromPublicKey(key.publicKey);
  const decoratedSignature = new StellarSdk.xdr.DecoratedSignature({
    hint: keyPair.signatureHint(),
    signature: result.signature,
  });
  transaction.signatures.push(decoratedSignature);

  return transaction;
};
