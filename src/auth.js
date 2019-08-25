const { API_TOKEN } = require('./config')
const logger = require('./logger')

module.exports = function validateBearerToken(req, res, next) {
  const apiToken = API_TOKEN;
  const authToken = req.get('Authorization')

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    logger.error('Unauthorized Request')
    return res.status(401).json({ error: 'Unauthorized request' })
  }
  // move to the next middleware
  next()
}
