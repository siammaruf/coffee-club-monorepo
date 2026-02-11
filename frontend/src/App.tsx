import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { store } from './redux/store/store'
import { queryClient } from './lib/queryClient'
import { router } from './router'

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#fef3c7',
              border: '1px solid #f59e0b',
            },
            success: {
              iconTheme: { primary: '#f59e0b', secondary: '#1a1a2e' },
            },
          }}
        />
      </QueryClientProvider>
    </Provider>
  )
}
