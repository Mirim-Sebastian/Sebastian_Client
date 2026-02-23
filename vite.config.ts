import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const fishMock = (): Plugin => ({
  name: 'fish-mock',
  configureServer(server) {
    let counter = 0
    server.middlewares.use('/fish', (req, res, next) => {
      if (req.method !== 'POST') {
        next()
        return
      }
      let body = ''
      req.on('data', (chunk) => {
        body += chunk
      })
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}') as {
            name?: string
            image?: string
          }
          if (!payload.name || !payload.image) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'text/plain')
            res.end('name and image are required')
            return
          }
          const fish = {
            id: `fish_${Date.now()}_${counter++}`,
            name: payload.name,
            image: payload.image,
          }
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(fish))
        } catch (error) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'text/plain')
          res.end('invalid json')
        }
      })
    })
  },
})

export default defineConfig({
  plugins: [react(), fishMock()],
})
