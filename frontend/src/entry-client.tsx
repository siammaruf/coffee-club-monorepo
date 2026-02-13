import { hydrateRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { QueryClientProvider, HydrationBoundary } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { routes } from './routes'
import { createStore } from './redux/store/store'
import { createQueryClient } from './lib/queryClient'
import './index.css'

const router = createBrowserRouter(routes)
const store = createStore()
const queryClient = createQueryClient()

// Get dehydrated state from SSR
const dehydratedState = (window as unknown as { __REACT_QUERY_STATE__?: unknown }).__REACT_QUERY_STATE__

hydrateRoot(
  document.getElementById('root')!,
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <HelmetProvider>
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
        </HelmetProvider>
      </HydrationBoundary>
    </QueryClientProvider>
  </Provider>
)
