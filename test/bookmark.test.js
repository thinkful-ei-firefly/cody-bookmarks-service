// const { expect } = require('chai')
// const supertest = require('supertest')
// require('dotenv').config()
const app = require('../src/app')
const knex = require('knex')
const { makeBookmarksArray } = require('./bookmark.fixtures')

describe('Bookmarks Endpoints', () => {
  let db

  before('connect to db and truncate', () => {
    // copy the bookmarks so we can restore
    db = knex({
      client: 'pg',
      connection: process.env.DB_TEST_URL
    })
    app.set('db', db) // sets test knex link
  })

  const cleanBmTable = () => db('bookmarks_table').truncate() // db(knex) takes arg for table
  before('clean Bm table', cleanBmTable)
  afterEach('clean Bm table', cleanBmTable)
  after('disconnect from db', () => db.destroy()) // disconnect from db after all tests run

  describe('Unauthorized requests', () => {
    it('responds with 401 unauthorized got GET /bookmarks', () => {
      return supertest(app)
        .get('/bookmarks')
        .expect(401, { error: 'Unauthorized request' })
    })
    it(`responds with 401 Unauthorized for POST /bookmarks`, () => {
      return supertest(app)
        .post('/bookmarks')
        .send({ title: 'test-title', url: 'http://some.thing.com', rating: 1 })
        .expect(401, { error: 'Unauthorized request' })
    })

    it(`responds with 401 Unauthorized for GET /bookmarks/:id`, () => {
      const secondBookmark = makeBookmarksArray()[1]
      return supertest(app)
        .get(`/bookmarks/${secondBookmark.id}`)
        .expect(401, { error: 'Unauthorized request' })
    })

    it(`responds with 401 Unauthorized for DELETE /bookmarks/:id`, () => {
      const aBookmark = makeBookmarksArray()[1]
      return supertest(app)
        .delete(`/bookmarks/${aBookmark.id}`)
        .expect(401, { error: 'Unauthorized request' })
    })
  })

  describe('GET /bookmarks', () => {
    context('given no bookmarks in db', () => {
      it('responds 200 with an empty list', () => {
        return supertest(app)
          .get('/bookmarks')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, [])
      })
    })

    context('given bookmarks in db', () => {
      const testBms = makeBookmarksArray()

      // b4 each it insert clean testBms into db table, 'truncate' table already in first describe
      beforeEach('insert bookmarks', () => {
        return db.insert(testBms).into('bookmarks_table')
      })

      it('responds 200 with a list of 3 bookmarks', () =>{
        return supertest(app)
        .get('/bookmarks')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(200, testBms)
      })
    })
  })

  // context('GET /bookmarks/:id', () => {
  //   it('gets the bookmark by ID from the store', () => {
  //     const secondBookmark = store.bookmarks[1]
  //     return supertest(app)
  //       .get(`/bookmarks/${secondBookmark.id}`)
  //       .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //       .expect(200, secondBookmark)
  //   })

  //   it(`returns 404 whe bookmark doesn't exist`, () => {
  //     return supertest(app)
  //       .get(`/bookmarks/doesnt-exist`)
  //       .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //       .expect(404, 'Bookmark Not Found')
  //   })
  // })

  //   describe('DELETE /bookmarks/:id', () => {
  //     it('removes the bookmark by ID from the store', () => {
  //       const secondBookmark = store.bookmarks[1]
  //       const expectedBookmarks = store.bookmarks.filter(
  //         s => s.id !== secondBookmark.id
  //       )
  //       return supertest(app)
  //         .delete(`/bookmarks/${secondBookmark.id}`)
  //         .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //         .expect(204)
  //         .then(() => {
  //           expect(store.bookmarks).to.eql(expectedBookmarks)
  //         })
  //     })

  //     it(`returns 404 whe bookmark doesn't exist`, () => {
  //       return supertest(app)
  //         .delete(`/bookmarks/doesnt-exist`)
  //         .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //         .expect(404, 'Bookmark Not Found')
  //     })
  //   })

  //   describe('POST /bookmarks', () => {
  //     it(`responds with 400 missing 'title' if not supplied`, () => {
  //       const newBookmarkMissingTitle = {
  //         // title: 'test-title',
  //         url: 'https://test.com',
  //         rating: 1
  //       }
  //       return supertest(app)
  //         .post(`/bookmarks`)
  //         .send(newBookmarkMissingTitle)
  //         .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //         .expect(400, `'title' is required`)
  //     })

  //     it(`responds with 400 missing 'url' if not supplied`, () => {
  //       const newBookmarkMissingUrl = {
  //         title: 'test-title',
  //         // url: 'https://test.com',
  //         rating: 1
  //       }
  //       return supertest(app)
  //         .post(`/bookmarks`)
  //         .send(newBookmarkMissingUrl)
  //         .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //         .expect(400, `'url' is required`)
  //     })

  //     it(`responds with 400 missing 'rating' if not supplied`, () => {
  //       const newBookmarkMissingRating = {
  //         title: 'test-title',
  //         url: 'https://test.com'
  //         // rating: 1,
  //       }
  //       return supertest(app)
  //         .post(`/bookmarks`)
  //         .send(newBookmarkMissingRating)
  //         .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //         .expect(400, `'rating' is required`)
  //     })

  //     it(`responds with 400 invalid 'rating' if not between 0 and 5`, () => {
  //       const newBookmarkInvalidRating = {
  //         title: 'test-title',
  //         url: 'https://test.com',
  //         rating: 'invalid'
  //       }
  //       return supertest(app)
  //         .post(`/bookmarks`)
  //         .send(newBookmarkInvalidRating)
  //         .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //         .expect(400, `'rating' must be a number between 0 and 5`)
  //     })

  //     it(`responds with 400 invalid 'url' if not a valid URL`, () => {
  //       const newBookmarkInvalidUrl = {
  //         title: 'test-title',
  //         url: 'htp://invalid-url',
  //         rating: 1
  //       }
  //       return supertest(app)
  //         .post(`/bookmarks`)
  //         .send(newBookmarkInvalidUrl)
  //         .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //         .expect(400, `'url' must be a valid URL`)
  //     })

  //     it('adds a new bookmark to the store', () => {
  //       const newBookmark = {
  //         title: 'test-title',
  //         url: 'https://test.com',
  //         description: 'test description',
  //         rating: 1
  //       }
  //       return supertest(app)
  //         .post(`/bookmarks`)
  //         .send(newBookmark)
  //         .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //         .expect(201)
  //         .expect(res => {
  //           expect(res.body.title).to.eql(newBookmark.title)
  //           expect(res.body.url).to.eql(newBookmark.url)
  //           expect(res.body.description).to.eql(newBookmark.description)
  //           expect(res.body.rating).to.eql(newBookmark.rating)
  //           expect(res.body.id).to.be.a('string')
  //         })
  //         .then(res => {
  //           expect(store.bookmarks[store.bookmarks.length - 1]).to.eql(res.body)
  //         })
  //     })
  //   })
})
