import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Customer, LoginPayload, RegisterPayload } from '@/types/customer'
import { authService } from '@/services/httpServices/authService'

interface AuthState {
  customer: Customer | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  initialized: boolean
}

const initialState: AuthState = {
  customer: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  initialized: false,
}

export const loginThunk = createAsyncThunk<Customer, LoginPayload, { rejectValue: string }>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      return await authService.login(payload)
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Login failed. Please check your credentials.'
      return rejectWithValue(message)
    }
  }
)

export const registerThunk = createAsyncThunk<Customer, RegisterPayload, { rejectValue: string }>(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      return await authService.register(payload)
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Registration failed. Please try again.'
      return rejectWithValue(message)
    }
  }
)

export const logoutThunk = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout()
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Logout failed.'
      return rejectWithValue(message)
    }
  }
)

export const checkAuthThunk = createAsyncThunk<Customer, void, { rejectValue: string }>(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getMe()
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Auth check failed.'
      return rejectWithValue(message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateCustomer: (state, action: PayloadAction<Customer>) => {
      state.customer = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false
        state.customer = action.payload
        state.isAuthenticated = true
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Login failed'
      })

    // Register
    builder
      .addCase(registerThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false
        state.customer = action.payload
        state.isAuthenticated = true
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Registration failed'
      })

    // Logout
    builder
      .addCase(logoutThunk.fulfilled, (state) => {
        state.customer = null
        state.isAuthenticated = false
        state.loading = false
        state.error = null
      })
      .addCase(logoutThunk.rejected, (state) => {
        // Still clear auth state even on logout failure
        state.customer = null
        state.isAuthenticated = false
        state.loading = false
        state.error = null
      })

    // Check Auth
    builder
      .addCase(checkAuthThunk.pending, (state) => {
        state.loading = true
      })
      .addCase(checkAuthThunk.fulfilled, (state, action) => {
        state.loading = false
        state.customer = action.payload
        state.isAuthenticated = true
        state.initialized = true
      })
      .addCase(checkAuthThunk.rejected, (state) => {
        state.loading = false
        state.customer = null
        state.isAuthenticated = false
        state.initialized = true
      })
  },
})

export const { updateCustomer, clearError } = authSlice.actions
export default authSlice.reducer
