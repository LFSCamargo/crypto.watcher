import { fileURLToPath } from 'node:url'
import { app } from './app'
import { config } from './core/config'
import { logger } from './core/logger'

const isMain = process.argv[1] === fileURLToPath(import.meta.url)

if (isMain) {
  app.listen(config.port, () => {
    logger.info(`API listening on http://localhost:${config.port}`)
  })
}
