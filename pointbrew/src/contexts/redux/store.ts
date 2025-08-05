import { configureStore } from '@reduxjs/toolkit';
import paymentReducer from './slides/idPaymentSlice'; // 👈 agrega esta línea

export const store = configureStore({
  reducer: {
    payment: paymentReducer, // 👈 registra el reducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
