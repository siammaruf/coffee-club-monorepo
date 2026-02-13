import { renderToPipeableStream } from 'react-dom/server'
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from 'react-router'
import { Provider } from 'react-redux'
import { QueryClientProvider, dehydrate } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { routes } from './routes'
import { createStore } from './redux/store/store'
import { createQueryClient } from './lib/queryClient'

export async function render(url: string) {
  const store = createStore()
  const queryClient = createQueryClient()
  const helmetContext: Record<string, unknown> = {}

  const handler = createStaticHandler(routes)
  const fetchRequest = new Request(`http://localhost${url}`, { method: 'GET' })
  const context = await handler.query(fetchRequest)

  if (context instanceof Response) {
    return { redirect: context.headers.get('Location') || '/' }
  }

  const router = createStaticRouter(handler.dataRoutes, context)
  const dehydratedState = dehydrate(queryClient)

  const stream = renderToPipeableStream(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider context={helmetContext}>
          <StaticRouterProvider router={router} context={context} />
        </HelmetProvider>
      </QueryClientProvider>
    </Provider>,
    {
      onShellReady() {
        /* resolved by the server wrapper */
      },
      onError(error: unknown) {
        console.error('SSR Error:', error)
      },
    }
  )

  return { stream, helmetContext, dehydratedState }
}
