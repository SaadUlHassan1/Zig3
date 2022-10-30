import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import { RootState } from "../config/store";
import { MemoType, MemoValue, Horizon, Transaction } from "stellar-sdk";
import { getErrorString } from "demo-wallet-shared/build/helpers/getErrorString";
import { submitPaymentTransaction } from "demo-wallet-shared/build/helpers/submitPaymentTransaction";
import { ActionStatus, SendTxInitialState, RejectMessage } from "../types/types.d";

export interface PaymentTransactionParams {
  publicKey: string;
  toAccountId: string;
  amount: string;
  fee: number;
  memoType: MemoType;
  memoContent: MemoValue;
  isAccountFunded: boolean;
}

export const sendTxAction = createAsyncThunk<
  Horizon.TransactionResponse,
  Transaction | any,
  { rejectValue: RejectMessage; state: any }
>("sendTx/sendTxAction", async (tx, { rejectWithValue, getState }) => {
  let result;
  try {
    result = await submitPaymentTransaction(tx, getState());

  } catch (error) {
    return rejectWithValue({
      errorString: getErrorString(error),
    });
  }

  return result;
});

const initialState: SendTxInitialState = {
  data: null,
  status: undefined,
  errorString: undefined,
};

const sendTxSlice = createSlice({
  name: "sendTx",
  initialState,
  reducers: {
    resetSendTxAction: () => { 
      console.log('initialState:', initialState)
      return initialState
     },
  },
  extraReducers: (builder) => {
    builder.addCase(sendTxAction.pending, (state) => {
      state.status = ActionStatus.PENDING;
      state.errorString = undefined;
    });
    builder.addCase(sendTxAction.fulfilled, (state, action) => {
      state.data = action.payload;
      state.status = ActionStatus.SUCCESS;
    });
    builder.addCase(sendTxAction.rejected, (state, action) => {
      state.status = ActionStatus.ERROR;
      state.errorString = action.payload?.errorString;
    });
  },
});

export const { reducer } = sendTxSlice;
export const { resetSendTxAction } = sendTxSlice.actions;
