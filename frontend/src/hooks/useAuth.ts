import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks'
import { loginThunk, registerThunk, logoutThunk, checkAuthThunk, updateCustomer, clearError } from '@/redux/features/authSlice'
import type { LoginPayload, RegisterPayload, Customer } from '@/types/customer'

export function useAuth() {
  const dispatch = useAppDispatch()
  const { customer, isAuthenticated, loading: isLoading, error, initialized } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!initialized) {
      dispatch(checkAuthThunk())
    }
  }, [dispatch, initialized])

  return {
    customer,
    isAuthenticated,
    isLoading,
    error,
    initialized,
    login: (payload: LoginPayload) => dispatch(loginThunk(payload)).unwrap(),
    register: (payload: RegisterPayload) => dispatch(registerThunk(payload)).unwrap(),
    logout: () => dispatch(logoutThunk()).unwrap(),
    clearError: () => dispatch(clearError()),
    updateCustomer: (c: Customer) => dispatch(updateCustomer(c)),
  }
}
