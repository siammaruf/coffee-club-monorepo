import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { store } from './redux/store/store'
import { queryClient } from './lib/queryClient'
import { routes } from './routes'

const router = createBrowserRouter(routes)

export default function App() {
  return (
    <HelmetProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#FDF8F3',
                color: '#2C2118',
                border: '1px solid #E8DCC8',
              },
              success: {
                iconTheme: { primary: '#A0782C', secondary: '#FDF8F3' },
              },
            }}
          />
        </QueryClientProvider>
      </Provider>
    </HelmetProvider>
  )
}
