const app = require('./app');
const { PORT, DB_URL } = require('./config')
const knex = require('knex')

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})

const db = knex({
  client: 'pg',
  connection: DB_URL
})

app.set('db', db) // sets db as a attribute 'db' on app.req.get('db')

module.exports = db
