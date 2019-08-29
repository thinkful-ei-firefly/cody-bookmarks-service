// const db = require('./server.js')

const bookmarkService = {
  getAllBookmarks(db){
    return db.select('*').from('bookmarks_table')
  }
}

module.exports = {
  bookmarkService
}