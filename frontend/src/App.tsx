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
              background: '#1A1A1A',
              color: '#F5F0E1',
              border: '1px solid #C5961A',
            },
            success: {
              iconTheme: { primary: '#C5961A', secondary: '#1A1A1A' },
            },
          }}
        />
      </QueryClientProvider>
    </Provider>
  )
}
