require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const winston = require('winston')
const store = require('./store')
const uuid = require('uuid/v4')

const app = express()

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common'

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())
app.use(express.json())

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN
  const authToken = req.get('Authorization')

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' })
  }
  // move to the next middleware
  next()
})

app.get('/', (req, res) => {
  res.send('Hello, world!')
})

app.get('/bookmarks', (req, res) => {
  res.json(store)
})

app.get('/bookmarks/:id', (req, res) => {
  const { id } = req.params

  const bookmark = store.find(bm => id === bm.id)

  if (bookmark) {
    return res.send(bookmark)
  }

  return res.status(400).send('404 not found')
})

app.post('/bookmarks', (req, res) => {
  const { title, url, description, rating } = req.body

  if (!title) {
    return res.status(404).send('title required')
  }

  if (!url) {
    return res.status(404).send('url required')
  }

  if (!description) {
    return res.status(404).send('description required')
  }

  if (!rating) {
    return res.status(404).send('rating required')
  }

  const id = uuid()

  const bookmark = {
    id,
    title,
    url,
    description,
    rating
  }

  store.push(bookmark)

  res
    .status(201)
    .location(`http://localhost:8000/bookmarks/${id}`)
    .json(bookmark)
})

app.delete('/bookmarks/:id', (req, res) => {
  const { id } = req.params

  const index = store.findIndex(bm => bm.id === id)

  if (index === -1){
    return res.status(404).send('Bookmark not found')
  }

  store.splice(index, 1)

  res.status(204).send('Deleted').end()
})

app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: 'info.log' })]
})

if (NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple()
    })
  )
}

module.exports = app
