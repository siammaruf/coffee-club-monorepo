import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/authSlice'
import cartReducer from '../features/cartSlice'
import orderReducer from '../features/orderSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    orders: orderReducer,
  },
})

// Persist cart items to localStorage (backward compatible with Zustand persist format)
store.subscribe(() => {
  const { items } = store.getState().cart
  try {
    localStorage.setItem(
      'coffeeclub-cart',
      JSON.stringify({ state: { items }, version: 0 })
    )
  } catch {
    // ignore write errors
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
