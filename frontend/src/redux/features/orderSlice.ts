import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Order, CreateOrderPayload } from '@/types/order'
import { orderService } from '@/services/httpServices/orderService'

interface OrderState {
  orders: Order[]
  currentOrder: Order | null
  loading: boolean
  error: string | null
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
}

export const fetchOrdersThunk = createAsyncThunk<Order[], { page?: number; limit?: number } | void, { rejectValue: string }>(
  'orders/fetchOrders',
  async (params, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 20 } = params ?? {}
      const response = await orderService.getOrders(page, limit)
      return response.data
    } catch (err: unknown) {
      return rejectWithValue((err as { message?: string })?.message || 'Failed to load orders')
    }
  }
)

export const fetchOrderThunk = createAsyncThunk<Order, string, { rejectValue: string }>(
  'orders/fetchOrder',
  async (id, { rejectWithValue }) => {
    try {
      return await orderService.getOrder(id)
    } catch (err: unknown) {
      return rejectWithValue((err as { message?: string })?.message || 'Failed to load order details')
    }
  }
)

export const createOrderThunk = createAsyncThunk<Order, CreateOrderPayload, { rejectValue: string }>(
  'orders/createOrder',
  async (payload, { rejectWithValue }) => {
    try {
      return await orderService.createOrder(payload)
    } catch (err: unknown) {
      return rejectWithValue((err as { message?: string })?.message || 'Failed to place order')
    }
  }
)

export const cancelOrderThunk = createAsyncThunk<Order, string, { rejectValue: string }>(
  'orders/cancelOrder',
  async (id, { rejectWithValue }) => {
    try {
      return await orderService.cancelOrder(id)
    } catch (err: unknown) {
      return rejectWithValue((err as { message?: string })?.message || 'Failed to cancel order')
    }
  }
)

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null
    },
  },
  extraReducers: (builder) => {
    // Fetch Orders
    builder
      .addCase(fetchOrdersThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrdersThunk.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload
      })
      .addCase(fetchOrdersThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to load orders'
      })

    // Fetch Single Order
    builder
      .addCase(fetchOrderThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrderThunk.fulfilled, (state, action) => {
        state.loading = false
        state.currentOrder = action.payload
      })
      .addCase(fetchOrderThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to load order'
      })

    // Create Order
    builder
      .addCase(createOrderThunk.fulfilled, (state, action) => {
        state.orders.unshift(action.payload)
      })

    // Cancel Order
    builder
      .addCase(cancelOrderThunk.fulfilled, (state, action) => {
        const index = state.orders.findIndex((o) => o.id === action.payload.id)
        if (index !== -1) state.orders[index] = action.payload
        if (state.currentOrder?.id === action.payload.id) state.currentOrder = action.payload
      })
  },
})

export const { clearOrderError, clearCurrentOrder } = orderSlice.actions
export default orderSlice.reducer
