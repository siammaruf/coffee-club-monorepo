import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/authSlice'
import cartReducer from '../features/cartSlice'
import orderReducer from '../features/orderSlice'

export function createStore() {
  const newStore = configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
      orders: orderReducer,
    },
  })

  // Persist cart items to localStorage (client-only, backward compatible with Zustand persist format)
  if (typeof window !== 'undefined') {
    newStore.subscribe(() => {
      const { items } = newStore.getState().cart
      try {
        localStorage.setItem(
          'coffeeclub-cart',
          JSON.stringify({ state: { items }, version: 0 })
        )
      } catch {
        // ignore write errors
      }
    })
  }

  return newStore
}

// Default singleton for client-side usage (App.tsx, hooks, etc.)
export const store = createStore()

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
