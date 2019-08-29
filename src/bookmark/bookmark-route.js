const express = require('express');
const logger = require('../logger');
const store = require('../store')
const uuid = require('uuid/v4');
const {bookmarkService} = require('./bookmarkService')


const bookmarkRoute = express.Router();
const bodyParser = express.json();

bookmarkRoute.route('/')
  .get((req, res, next) => {
    bookmarkService.getAllBookmarks(req.app.get('db')) // in server we app.set('db', db) (string its called, knex db)
    .then(bm => {
      res.json(bm)
    })
    .catch(next) // next b/c of error handling middleware
  })
  
  .post((req, res) => {
    const { title, url, description, rating } = req.body

    if (!title) {
      logger.error('title required');
      return res.status(400).send('title required')
    }
    if (!url) {
      logger.error('url required');
      return res.status(400).send('url required')
    }
    if (!description) {
      logger.error('description required');
      return res.status(400).send('description required')
    }
    if (!rating) {
      logger.error('rating required');
      return res.status(400).send('rating required')
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

    logger.info(`bookmark with id ${id} added`)
    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${id}`)
      .json(bookmark)
  })


bookmarkRoute.route('/:id')
  .get((req, res) => {
    const { id } = req.params

    const bookmark = store.find(bm => id === bm.id)

    if (bookmark) {
      logger.info(`bookmark with id ${id} found`)
      return res.send(bookmark)
    }
    logger.error(`bookmark with id ${id} not found`)
    return res.status(404).send('404 not found')
  })
  .delete((req, res) => {
    const { id } = req.params

    const index = store.findIndex(bm => bm.id === id)

    if (index === -1){
      logger.error(`bookmark with id ${id} not found`)
      return res.status(404).send('Bookmark not found')
    }

    store.splice(index, 1)
    logger.info(`bookmark with id ${id} deleted`)
    res.status(204).send('Deleted').end()
  })

module.exports = bookmarkRoute;
