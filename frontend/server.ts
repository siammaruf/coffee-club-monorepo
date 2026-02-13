import express from 'express'
import compression from 'compression'
import { createServer as createViteServer } from 'vite'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { PassThrough } from 'stream'

const __dirname = dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'
const PORT = Number(process.env.PORT) || 3000

async function createServer() {
  const app = express()

  app.use(compression())

  let vite: Awaited<ReturnType<typeof createViteServer>> | undefined

  if (!isProduction) {
    // Dev mode: use Vite middleware for HMR
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    })
    app.use(vite.middlewares)
  } else {
    // Prod mode: serve static files from dist/client
    const sirv = (await import('serve-static')).default
    app.use(
      sirv(resolve(__dirname, 'dist/client'), {
        index: false,
      })
    )
  }

  app.use('*', async (req, res) => {
    const url = req.originalUrl

    try {
      // 1. Read index.html template
      let template: string
      if (!isProduction) {
        template = readFileSync(resolve(__dirname, 'index.html'), 'utf-8')
        template = await vite!.transformIndexHtml(url, template)
      } else {
        template = readFileSync(
          resolve(__dirname, 'dist/client/index.html'),
          'utf-8'
        )
      }

      // 2. Load the server entry
      let render: (
        url: string
      ) => Promise<{
        redirect?: string
        stream?: ReturnType<typeof import('react-dom/server').renderToPipeableStream>
        helmetContext?: Record<string, unknown>
        dehydratedState?: unknown
      }>

      if (!isProduction) {
        const mod = await vite!.ssrLoadModule('/src/entry-server.tsx')
        render = mod.render
      } else {
        const mod = await import('./dist/server/entry-server.js')
        render = mod.render
      }

      // 3. Render the app
      const result = await render(url)

      if (result.redirect) {
        res.redirect(301, result.redirect)
        return
      }

      const { stream, helmetContext, dehydratedState } = result

      // 4. Extract helmet tags
      const helmet = (helmetContext as Record<string, Record<string, { toString: () => string }>>)?.helmet
      const headTags = helmet
        ? [
            helmet.title?.toString() || '',
            helmet.meta?.toString() || '',
            helmet.link?.toString() || '',
            helmet.script?.toString() || '',
          ]
            .filter(Boolean)
            .join('\n    ')
        : ''

      // 5. Split template at the root div
      const [htmlStart, htmlEnd] = template.split('<!--ssr-outlet-->')

      // If no SSR outlet marker, fall back to splitting on the root div
      let beforeContent: string
      let afterContent: string

      if (htmlEnd !== undefined) {
        // Inject head tags
        beforeContent = htmlStart!.replace(
          '<!--ssr-head-->',
          headTags
        )
        afterContent = htmlEnd
      } else {
        // Fallback: split on <div id="root">
        const rootDivIdx = template.indexOf('<div id="root">')
        const rootEndIdx = template.indexOf('</div>', rootDivIdx) + 6
        const afterRoot = template.slice(rootEndIdx)

        beforeContent = template
          .slice(0, rootDivIdx)
          .replace('<!--ssr-head-->', headTags) +
          '<div id="root">'
        afterContent = '</div>' + afterRoot
      }

      // 6. Inject dehydrated state script before closing body
      const dehydrateScript = dehydratedState
        ? `<script>window.__REACT_QUERY_STATE__=${JSON.stringify(dehydratedState).replace(/</g, '\\u003c')}</script>`
        : ''

      afterContent = afterContent.replace(
        '</body>',
        `${dehydrateScript}\n  </body>`
      )

      // 7. Pipe the stream
      res.status(200).set({ 'Content-Type': 'text/html' })
      res.write(beforeContent)

      const pipeableStream = stream as unknown as { pipe: (dest: PassThrough) => void }
      const { PassThrough } = await import('stream')
      const passThrough = new PassThrough()

      passThrough.on('data', (chunk: Buffer) => {
        res.write(chunk)
      })

      passThrough.on('end', () => {
        res.write(afterContent)
        res.end()
      })

      pipeableStream.pipe(passThrough)
    } catch (e) {
      if (!isProduction && vite) {
        vite.ssrFixStacktrace(e as Error)
      }
      console.error('SSR render error:', e)
      res.status(500).end((e as Error).message)
    }
  })

  app.listen(PORT, () => {
    console.log(
      `Server running at http://localhost:${PORT} (${isProduction ? 'production' : 'development'})`
    )
  })
}

createServer()
