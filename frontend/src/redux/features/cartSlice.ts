import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Item, ItemVariation } from '@/types/item'
import type { RootState } from '../store/store'

export interface LocalCartItem {
  id: string
  item: Item
  quantity: number
  special_notes?: string
  selectedVariation?: ItemVariation
}

interface CartState {
  items: LocalCartItem[]
  isOpen: boolean
}

const loadCartFromStorage = (): LocalCartItem[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('coffeeclub-cart')
    if (stored) {
      const parsed = JSON.parse(stored) as { state?: { items?: LocalCartItem[] }; items?: LocalCartItem[] }
      // Handle Zustand persist format: { state: { items: [...] }, version: 0 }
      return parsed.state?.items || parsed.items || []
    }
  } catch {
    // ignore parse errors
  }
  return []
}

const initialState: CartState = {
  items: [],
  isOpen: false,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<{ item: Item; quantity?: number; selectedVariation?: ItemVariation }>) => {
      const { item, quantity = 1, selectedVariation } = action.payload
      const existing = state.items.find(
        (ci) => ci.item.id === item.id && (ci.selectedVariation?.id ?? null) === (selectedVariation?.id ?? null)
      )

      if (existing) {
        existing.quantity += quantity
      } else {
        state.items.push({
          id: crypto.randomUUID(),
          item,
          quantity,
          selectedVariation,
        })
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((ci) => ci.id !== action.payload)
    },
    updateQuantity: (state, action: PayloadAction<{ cartItemId: string; quantity: number }>) => {
      const { cartItemId, quantity } = action.payload
      if (quantity <= 0) {
        state.items = state.items.filter((ci) => ci.id !== cartItemId)
        return
      }
      const item = state.items.find((ci) => ci.id === cartItemId)
      if (item) {
        item.quantity = quantity
      }
    },
    updateNotes: (state, action: PayloadAction<{ cartItemId: string; notes: string }>) => {
      const { cartItemId, notes } = action.payload
      const item = state.items.find((ci) => ci.id === cartItemId)
      if (item) {
        item.special_notes = notes
      }
    },
    clearCart: (state) => {
      state.items = []
    },
    toggleDrawer: (state) => {
      state.isOpen = !state.isOpen
    },
    openDrawer: (state) => {
      state.isOpen = true
    },
    closeDrawer: (state) => {
      state.isOpen = false
    },
    hydrateCart: (state) => {
      state.items = loadCartFromStorage()
    },
  },
})

// Selectors
export const selectCartTotal = (state: RootState) =>
  (state.cart.items ?? []).reduce((total, ci) => {
    const price = ci.selectedVariation
      ? (ci.selectedVariation.sale_price ?? ci.selectedVariation.regular_price ?? 0)
      : (ci?.item?.sale_price ?? ci?.item?.regular_price ?? 0)
    return total + price * (ci?.quantity ?? 0)
  }, 0)

export const selectCartItemCount = (state: RootState) =>
  (state.cart.items ?? []).reduce((count, ci) => count + (ci?.quantity ?? 0), 0)

export const { addItem, removeItem, updateQuantity, updateNotes, clearCart, toggleDrawer, openDrawer, closeDrawer, hydrateCart } = cartSlice.actions
export default cartSlice.reducer
