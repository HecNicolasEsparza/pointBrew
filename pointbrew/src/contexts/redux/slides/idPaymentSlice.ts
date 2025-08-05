import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PaymentState {
  paymentId: number | null;
}

const initialState: PaymentState = {
  paymentId: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setPaymentId: (state, action: PayloadAction<number>) => {
      state.paymentId = action.payload;
    },
    clearPaymentId: (state) => {
      state.paymentId = null;
    },
  },
});

export const { setPaymentId, clearPaymentId } = paymentSlice.actions;
export default paymentSlice.reducer;
