import { useEffect } from 'react'
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import { Provider, useDispatch } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { store } from './redux/store/store'
import { queryClient } from './lib/queryClient'
import { hydrateCart } from './redux/features/cartSlice'
import './index.css'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon/favicon-96x96.png" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,700;1,300&family=PT+Sans+Narrow:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <script src="/env-config.js" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1d2326',
                  color: '#dce4e8',
                  border: '1px solid #252c30',
                },
                success: {
                  iconTheme: { primary: '#ffc851', secondary: '#1d2326' },
                },
              }}
            />
          </QueryClientProvider>
        </Provider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function Root() {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(hydrateCart())
  }, [dispatch])
  return <Outlet />
}
