import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { DataProvider, Types } from "@stellar/wallet-sdk";
import { Keypair } from "stellar-sdk";

import { RootState } from "../config/store";
import { settingsSelector } from "./settings";
import { getAssetData } from "demo-wallet-shared/build/helpers/getAssetData";
import { getErrorMessage } from "demo-wallet-shared/build/helpers/getErrorMessage";
import { getErrorString } from "demo-wallet-shared/build/helpers/getErrorString";
import { getNetworkConfig } from "demo-wallet-shared/build/helpers/getNetworkConfig";
import { log } from "demo-wallet-shared/build/helpers/log";
import {
  ActionStatus,
  Asset,
  RejectMessage,
  AccountInitialState,
} from "../types/types.d";

let accountWatcherStopper: any;
interface UnfundedAccount extends Types.AccountDetails {
  id: string;
}

interface AccountKeyPair {
  publicKey: string;
  secretKey: string;
}

interface AccountActionBaseResponse {
  data: Types.AccountDetails | UnfundedAccount;
  assets: Asset[];
  isUnfunded: boolean;
}

interface FetchAccountActionResponse extends AccountActionBaseResponse {
  secretKey: string;
}

export const fetchAccountAction = createAsyncThunk<
  FetchAccountActionResponse,
  AccountKeyPair,
  { rejectValue: any; state: any }
>(
  "account/fetchAccountAction",
  async ({ publicKey, secretKey }, { rejectWithValue, getState }) => {
    const { pubnet } = settingsSelector(getState());
    const networkConfig = getNetworkConfig(pubnet);
    let dataProvider
    if(!secretKey && publicKey) {
      dataProvider = new DataProvider({
        serverUrl: getNetworkConfig(pubnet).url,
        accountOrKey: publicKey,
        networkPassphrase: getNetworkConfig(pubnet).network,
      });
    } else {
      dataProvider = new DataProvider({
        serverUrl: networkConfig.url,
        accountOrKey: publicKey,
        networkPassphrase: networkConfig.network,
      });
    }

    let stellarAccount: Types.AccountDetails | null = null;
    let assets: Asset[] = [];
    let isUnfunded = false;

    log.request({
      title: `Fetching account info`,
      body: `Public key: ${publicKey}`,
    });

    try {
      stellarAccount = await dataProvider.fetchAccountDetails();
      assets = await getAssetData({
        balances: stellarAccount.balances,
        networkUrl: networkConfig.url,
      });
    } catch (error : any) {
      if (error.isUnfunded) {
        log.instruction({ title: `Account is not funded` });

        stellarAccount = {
          id: publicKey,
        } as UnfundedAccount;

        isUnfunded = true;
      } else {
        const errorMessage = getErrorString(error);
        log.error({
          title: `Fetching account \`${publicKey}\` failed`,
          body: errorMessage,
        });
        return rejectWithValue({
          errorString: errorMessage,
        });
      }
    }

    log.response({
      title: `Account info fetched`,
      body: stellarAccount,
    });

    return { data: stellarAccount, assets, isUnfunded, secretKey };
  },
);

export const createRandomAccount = createAsyncThunk<
  string,
  undefined,
  { rejectValue: RejectMessage; state: RootState }
>("account/createRandomAccount", (_, { rejectWithValue }) => {
  try {
    log.instruction({ title: "Generating new keypair" });
    const keypair = Keypair.random();
    return keypair.secret();
  } catch (error: any) {
    log.error({
      title: "Generating new keypair failed",
      body: getErrorMessage(error),
    });
    return rejectWithValue({
      errorString:
        "Something went wrong while creating random account, please try again.",
    });
  }
});

export const fundTestnetAccount = createAsyncThunk<
  AccountActionBaseResponse,
  string,
  { rejectValue: RejectMessage; state: RootState }
>(
  "account/fundTestnetAccount",
  async (publicKey, { rejectWithValue, getState }) => {
    log.instruction({
      title: "The friendbot is funding testnet account",
      body: `Public key: ${publicKey}`,
    });

    const { pubnet } = settingsSelector(getState());
    const networkConfig = getNetworkConfig(pubnet);

    const dataProvider = new DataProvider({
      serverUrl: networkConfig.url,
      accountOrKey: publicKey,
      networkPassphrase: networkConfig.network,
    });

    try {
      await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
      const stellarAccount = await dataProvider.fetchAccountDetails();
      const assets = await getAssetData({
        balances: stellarAccount.balances,
        networkUrl: networkConfig.url,
      });

      log.response({
        title: "The friendbot funded account",
        body: stellarAccount,
      });

      return { data: stellarAccount, assets, isUnfunded: false };
    } catch (error: any) {
      log.error({
        title: "The friendbot funding of the account failed",
        body: getErrorMessage(error),
      });

      return rejectWithValue({
        errorString:
          "Something went wrong with funding the account, please try again.",
      });
    }
  },
);

export const startAccountWatcherAction = createAsyncThunk<
  { isAccountWatcherStarted: boolean },
  string,
  { rejectValue: RejectMessage; state: any }
>(
  "account/startAccountWatcherAction",
  (publicKey, { rejectWithValue, getState, dispatch }) => {
    try {
      const { pubnet } = settingsSelector(getState());

      const dataProvider = new DataProvider({
        serverUrl: getNetworkConfig(pubnet).url,
        accountOrKey: publicKey,
        networkPassphrase: getNetworkConfig(pubnet).network,
      });

      accountWatcherStopper = dataProvider.watchAccountDetails({
        onMessage: (accountDetails: Types.AccountDetails) => {
          dispatch(updateAccountAction(accountDetails));
        },
        onError: () => {
          const errorString = "We couldn’t update your account at this time.";
          dispatch(updateAccountErrorAction({ errorString }));
        },
      });

      return { isAccountWatcherStarted: true };
    } catch (error) {
      return rejectWithValue({
        errorString: getErrorString(error),
      });
    }
  },
);
const initialState: AccountInitialState = {
  data: null,
  assets: [],
  errorString: undefined,
  isAuthenticated: false,
  isUnfunded: false,
  secretKey: "",
  status: undefined,
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    resetAccountAction: () => initialState,
    resetAccountStatusAction: (state) => {
      state.status = undefined;
    },
    updateAccountAction: (state, action) => {
      state.data = action.payload;
    },
    updateAccountErrorAction: (state, action) => {
      state.status = ActionStatus.ERROR;
      state.errorString = action.payload.errorString;
    },
    stopAccountWatcherAction: () => {
      if (accountWatcherStopper) {
        accountWatcherStopper.stop();
        accountWatcherStopper = undefined;
      }

      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAccountAction.pending, (state = initialState) => {
      state.status = ActionStatus.PENDING;
    });
    builder.addCase(fetchAccountAction.fulfilled, (state, action) => {
      state.data = action.payload.data;
      state.assets = action.payload.assets;
      state.isAuthenticated = Boolean(action.payload.data);
      state.isUnfunded = action.payload.isUnfunded;
      state.secretKey = action.payload.secretKey;
      state.status = ActionStatus.SUCCESS;
    });
    builder.addCase(fetchAccountAction.rejected, (state, action) => {
      state.errorString = action.payload?.errorString;
      state.status = ActionStatus.ERROR;
    });

    builder.addCase(createRandomAccount.pending, (state = initialState) => {
      state.status = ActionStatus.PENDING;
    });
    builder.addCase(createRandomAccount.fulfilled, (state, action) => {
      state.secretKey = action.payload;
      state.status = ActionStatus.SUCCESS;
    });
    builder.addCase(createRandomAccount.rejected, (state, action) => {
      state.errorString = action.payload?.errorString;
      state.status = ActionStatus.ERROR;
    });

    builder.addCase(fundTestnetAccount.pending, (state) => {
      state.status = ActionStatus.PENDING;
    });
    builder.addCase(fundTestnetAccount.fulfilled, (state, action) => {
      state.data = action.payload.data;
      state.assets = action.payload.assets;
      state.isUnfunded = action.payload.isUnfunded;
      state.status = ActionStatus.SUCCESS;
    });
    builder.addCase(fundTestnetAccount.rejected, (state, action) => {
      state.errorString = action.payload?.errorString;
      state.status = ActionStatus.ERROR;
    });
  },
});

export const accountSelector = (state: RootState) => state.account;

export const { reducer } = accountSlice;
export const {
  resetAccountAction,
  resetAccountStatusAction,
  updateAccountAction,
  updateAccountErrorAction,
  stopAccountWatcherAction,
} = accountSlice.actions;
