import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCatchError } from "@stellar/frontend-helpers";

import { ActionStatus, RejectMessage, WalletInitialState } from "types/types.d";

declare global {
  interface Window {
    rabet:any;
  }
}

export const fetchRabetStellarAddressAction = createAsyncThunk<
  { publicKey: string },
  undefined,
  { rejectValue: RejectMessage }
>(
  "walletRabet/fetchRabetStellarAddressAction",
  async (_, { rejectWithValue }) => {
    try {
      const RabetResponse = await window.rabet.connect();
      return { publicKey: RabetResponse };
    } catch (e) {
      const error = getCatchError(e);
      return rejectWithValue({
        errorString: error.toString(),
      });
    }
  },
);

const initialState: WalletInitialState = {
  data: null,
  status: undefined,
  errorString: undefined,
};

const walletRabetSlice = createSlice({
  name: "walletRabet",
  initialState,
  reducers: {
    resetRabetAction: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchRabetStellarAddressAction.pending,
      (state = initialState) => {
        state.status = ActionStatus.PENDING;
      },
    );

    builder.addCase(
      fetchRabetStellarAddressAction.fulfilled,
      (state, action) => {
        state.data = action.payload;
        state.status = ActionStatus.SUCCESS;
      },
    );

    builder.addCase(
      fetchRabetStellarAddressAction.rejected,
      (state, action) => {
        // Do not update state if user has closed modal and left Rabet open
        if (state.status) {
          state.data = null;
          state.status = ActionStatus.ERROR;
          state.errorString = action.payload?.errorString;
        }
      },
    );
  },
});

export const { reducer } = walletRabetSlice;
export const { resetRabetAction } = walletRabetSlice.actions;