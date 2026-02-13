import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Item } from '@/types/item'
import type { RootState } from '../store/store'

export interface LocalCartItem {
  id: string
  item: Item
  quantity: number
  special_notes?: string
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
  items: loadCartFromStorage(),
  isOpen: false,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<{ item: Item; quantity?: number }>) => {
      const { item, quantity = 1 } = action.payload
      const existing = state.items.find((ci) => ci.item.id === item.id)

      if (existing) {
        existing.quantity += quantity
      } else {
        state.items.push({
          id: crypto.randomUUID(),
          item,
          quantity,
        })
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((ci) => ci.item.id !== action.payload)
    },
    updateQuantity: (state, action: PayloadAction<{ itemId: string; quantity: number }>) => {
      const { itemId, quantity } = action.payload
      if (quantity <= 0) {
        state.items = state.items.filter((ci) => ci.item.id !== itemId)
        return
      }
      const item = state.items.find((ci) => ci.item.id === itemId)
      if (item) {
        item.quantity = quantity
      }
    },
    updateNotes: (state, action: PayloadAction<{ itemId: string; notes: string }>) => {
      const { itemId, notes } = action.payload
      const item = state.items.find((ci) => ci.item.id === itemId)
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
  },
})

// Selectors
export const selectCartTotal = (state: RootState) =>
  state.cart.items.reduce((total, ci) => {
    const price = ci.item.sale_price ?? ci.item.regular_price
    return total + price * ci.quantity
  }, 0)

export const selectCartItemCount = (state: RootState) =>
  state.cart.items.reduce((count, ci) => count + ci.quantity, 0)

export const { addItem, removeItem, updateQuantity, updateNotes, clearCart, toggleDrawer, openDrawer, closeDrawer } = cartSlice.actions
export default cartSlice.reducer
