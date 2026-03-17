import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Item, ItemVariation } from '@/types/item'
import type { Cart } from '@/types/cart'
import type { RootState } from '../store/store'
import { getEffectivePrice } from '@/lib/utils'
import { cartService } from '@/services/httpServices/cartService'

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
  hydrated: boolean
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

function serverCartToLocalItems(cart: Cart): LocalCartItem[] {
  return cart.items.map((ci) => ({
    id: ci.id,
    item: {
      id: ci.item.id,
      name: ci.item.name,
      name_bn: ci.item.name_bn,
      image: ci.item.image,
      regular_price: ci.item.regular_price,
      sale_price: ci.item.sale_price,
      slug: '',
      description: '',
      type: 'BAR' as const,
      status: 'available' as const,
      has_variations: false,
      categories: [],
      created_at: '',
      updated_at: '',
    },
    quantity: ci.quantity,
    special_notes: ci.special_notes ?? undefined,
  }))
}

const initialState: CartState = {
  items: [],
  isOpen: false,
  hydrated: false,
}

// Fetch server cart for authenticated users on page load
export const fetchServerCart = createAsyncThunk<LocalCartItem[], void, { rejectValue: string }>(
  'cart/fetchServerCart',
  async (_, { rejectWithValue }) => {
    try {
      const cart = await cartService.getCart()
      return serverCartToLocalItems(cart)
    } catch (err: unknown) {
      return rejectWithValue((err as { message?: string })?.message || 'Failed to fetch cart')
    }
  }
)

// After login: push local items to server, then return merged server cart
export const syncCartOnLogin = createAsyncThunk<LocalCartItem[], LocalCartItem[], { rejectValue: string }>(
  'cart/syncCartOnLogin',
  async (localItems, { rejectWithValue }) => {
    try {
      for (const localItem of localItems) {
        await cartService.addItem({
          item_id: localItem.item.id,
          quantity: localItem.quantity,
          special_notes: localItem.special_notes,
        })
      }
      const cart = await cartService.getCart()
      localStorage.removeItem('coffeeclub-cart')
      return serverCartToLocalItems(cart)
    } catch (err: unknown) {
      return rejectWithValue((err as { message?: string })?.message || 'Cart sync failed')
    }
  }
)

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
      state.hydrated = false
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
      state.hydrated = true
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchServerCart.fulfilled, (state, action) => {
      state.items = action.payload
      state.hydrated = true
    })
    builder.addCase(syncCartOnLogin.fulfilled, (state, action) => {
      state.items = action.payload
      state.hydrated = true
    })
  },
})

// Selectors
export const selectCartTotal = (state: RootState) =>
  (state.cart.items ?? []).reduce((total, ci) => {
    const price = ci.selectedVariation
      ? getEffectivePrice(ci.selectedVariation.regular_price ?? 0, ci.selectedVariation.sale_price)
      : getEffectivePrice(ci?.item?.regular_price ?? 0, ci?.item?.sale_price)
    return total + price * (ci?.quantity ?? 0)
  }, 0)

export const selectCartItemCount = (state: RootState) =>
  (state.cart.items ?? []).reduce((count, ci) => count + (ci?.quantity ?? 0), 0)

export const { addItem, removeItem, updateQuantity, updateNotes, clearCart, toggleDrawer, openDrawer, closeDrawer, hydrateCart } = cartSlice.actions
export default cartSlice.reducer
