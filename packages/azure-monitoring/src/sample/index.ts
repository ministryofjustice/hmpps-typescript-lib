import express, { Express } from 'express'
import logger from './logger'

const PORT: number = parseInt(process.env.PORT || '8080', 10)
const app: Express = express()

// excluded from monitoring
app.get('/ping', (req, res) => {
  res.send('pong')
})

// included in monitoring
app.get('/info', (req, res) => {
  res.send('info')
})

app.get('/log', (req, res) => {
  logger.debug('some debug')
  logger.info('some info')
  logger.warn('some warn')

  logger.error('some error-1')
  logger.error('some error-2: %s.', 'a message 1')
  // error included as trace
  logger.error('some error-3', new Error('aaa'))
  // error included as trace with placeholder
  logger.error('some error-4: %s.', 'a message 2', new Error('bbb'))
  // error included as exception without message
  logger.error(new Error('ccc'), 'some error-5')
  // error included as exception without message
  logger.error(new Error('ddd'), 'some error-6: %s.', 'a message 3')

  res.send({ some: 'result' })
})

app.listen(PORT, () => {
  logger.info(`Listening for requests on http://localhost:${PORT}`)
})
