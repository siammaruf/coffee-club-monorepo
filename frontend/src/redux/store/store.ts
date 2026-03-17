import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit'
import authReducer, { loginThunk, logoutThunk, registerThunk } from '../features/authSlice'
import cartReducer, { syncCartOnLogin, clearCart, hydrateCart } from '../features/cartSlice'
import orderReducer from '../features/orderSlice'
import type { LocalCartItem } from '../features/cartSlice'

const listenerMiddleware = createListenerMiddleware()

// On login/register: merge local cart into server cart
listenerMiddleware.startListening({
  actionCreator: loginThunk.fulfilled,
  effect: async (_action, listenerApi) => {
    const state = listenerApi.getState() as { cart: { items: LocalCartItem[] } }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (listenerApi.dispatch as any)(syncCartOnLogin(state.cart.items))
  },
})

listenerMiddleware.startListening({
  actionCreator: registerThunk.fulfilled,
  effect: async (_action, listenerApi) => {
    const state = listenerApi.getState() as { cart: { items: LocalCartItem[] } }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (listenerApi.dispatch as any)(syncCartOnLogin(state.cart.items))
  },
})

// On logout: save server cart back to localStorage, then clear Redux
listenerMiddleware.startListening({
  actionCreator: logoutThunk.fulfilled,
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState() as { cart: { items: LocalCartItem[] } }
    const items = [...state.cart.items]
    listenerApi.dispatch(clearCart())           // sets hydrated=false → subscriber no-op
    if (items.length > 0) {
      try {
        localStorage.setItem(
          'coffeeclub-cart',
          JSON.stringify({ state: { items }, version: 0 })
        )
      } catch { /* ignore */ }
    }
    listenerApi.dispatch(hydrateCart())         // re-reads localStorage → hydrated=true
  },
})

export function createStore() {
  const newStore = configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
      orders: orderReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(listenerMiddleware.middleware),
  })

  // Persist cart items to localStorage (client-only)
  // Guards: only write after hydrateCart runs (hydrated=true) and only for guests
  if (typeof window !== 'undefined') {
    newStore.subscribe(() => {
      const state = newStore.getState()
      if (!state.cart.hydrated) return          // skip before hydrateCart/fetchServerCart runs
      if (state.auth.isAuthenticated) return    // logged-in cart lives on server
      try {
        localStorage.setItem(
          'coffeeclub-cart',
          JSON.stringify({ state: { items: state.cart.items }, version: 0 })
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
