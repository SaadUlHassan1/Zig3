import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { storeKey, CreateKeyManagerResponse } from "demo-wallet-shared/build/helpers/keyManager";
import { getErrorString } from "demo-wallet-shared/build/helpers/getErrorString";
import { KeyStoreInitialState, RejectMessage, KeyType } from "../types/types";

interface WalletKeyActionProps {
  publicKey: string;
  privateKey?: string;
  keyType: KeyType;
  path?: string;
  // In wallet-sdk, "custom" is a signTransaction() prop for any extra
  // information a wallet might require.
  custom?: {
    [key: string]: any;
  };
}

export const storeKeyAction = createAsyncThunk<
  CreateKeyManagerResponse,
  WalletKeyActionProps,
  { rejectValue: RejectMessage }
>(
  "keyStore/storeKeyAction",
  async (
    { publicKey, privateKey, keyType, path, custom },
    { rejectWithValue, getState },
  ) => {
    let result;
    try {
      result = await storeKey({ publicKey, privateKey, keyType, path }, getState());
      result.custom = custom;
    } catch (error) {
      return rejectWithValue({
        errorString: getErrorString(error),
      });
    }
    return result;
  },
);

const initialState: KeyStoreInitialState = {
  keyStoreId: "",
  password: "",
  errorString: undefined,
  custom: undefined,
};

const keyStoreSlice = createSlice({
  name: "keyStore",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(storeKeyAction.pending, () => initialState);
    builder.addCase(storeKeyAction.fulfilled, (state, action) => {
      state.keyStoreId = action.payload.id;
      state.password = action.payload.password;
      state.custom = action.payload.custom;
    });
    builder.addCase(storeKeyAction.rejected, (state, action) => {
      state.errorString = action?.payload?.errorString;
    });
  },
});

export const { reducer } = keyStoreSlice;
