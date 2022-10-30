import { KeyManager, KeyManagerPlugins } from "@stellar/wallet-sdk";
import { Transaction } from "stellar-sdk";
import { KeyType } from "../types/types";
import { getErrorString } from "./getErrorString";
import { getNetworkConfig } from "./getNetworkConfig";
// import { store } from "../config/store";

export interface CreateKeyManagerResponse {
  id: string;
  password: string;
  errorString?: string;
  custom?: {
    [key: string]: any;
  };
}

const createKeyManager = (state: any) => {
  const localKeyStore = new KeyManagerPlugins.LocalStorageKeyStore();
  localKeyStore.configure({ storage: localStorage });
  const { settings } = state;
  // {settings: {
  //   isTestnet: false,
  //   pubnet: false,
  //   authType: null,
  // },}

  const keyManager = new KeyManager({
    keyStore: localKeyStore,
    defaultNetworkPassphrase: getNetworkConfig(!!settings.pubnet).network,
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  keyManager.registerEncrypter(KeyManagerPlugins.ScryptEncrypter);
  return keyManager;
};

export const storeKey = async ({
  publicKey,
  privateKey,
  keyType,
  path,
}: {
  publicKey: string;
  privateKey?: string;
  keyType: KeyType;
  path?: string;
}, state: any) => {
  const keyManager = createKeyManager(state);
  const { settings } = state;
  // {settings: {
  //   isTestnet: false,
  //   pubnet: false,
  //   authType: null,
  // },} //store.getState();

  const result: CreateKeyManagerResponse = {
    id: "",
    password: "Stellar Development Foundation",
    errorString: undefined,
  };

  try {
    const metaData = await keyManager.storeKey({
      key: {
        type: keyType,
        publicKey,
        privateKey: privateKey || "",
        network: getNetworkConfig(!!settings.pubnet).network,
        path,
      },
      password: result.password,
      encrypterName: KeyManagerPlugins.ScryptEncrypter.name,
    });

    result.id = metaData.id;
  } catch (error) {
    result.errorString = getErrorString(error);
    return result;
  }

  return result;
};

export const loadPrivateKey = async ({
  id,
  password,
}: {
  id: string;
  password: string;
}, state: any) => {
  const keyManager = createKeyManager(state);
  const result = await keyManager.loadKey(id, password);
  return result;
};

interface SignTransactionProps {
  id: string;
  password: string;
  transaction: Transaction;
  custom?: {
    [key: string]: any;
  };
}

export const signTransaction = ({
  id,
  password,
  transaction,
  custom,
}: SignTransactionProps, state: any): Promise<Transaction> => {
  const keyManager = createKeyManager(state);

  return keyManager.signTransaction({
    id,
    password,
    transaction,
    custom,
  });
};
