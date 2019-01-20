const { send, json } = require('micro')
var log = require('debug-with-levels')('socialpetwork-api:user')
const { router, post, get } = require('microrouter')
const Mongo = require('@socialpetwork/common/mongo')
const mongo = new Mongo()
const { getUserFromRequestJwt } = require('@socialpetwork/common/auth')
const reserved = require('./reserved-usernames')

const getMe = async (req, res) => {
  log.trace('getMe')
  try {
    var socialUser = await getUserFromRequestJwt(req)
    if (!socialUser) {
      log.debug('no logged in user')
      send(res, 401, 'Not authorized to get a user')
      return
    }
    log.debug('JWT User: %j', socialUser)
    var users = await mongo.getCollection('users')
    var user = await users.findOne({ email: socialUser.email })
    if (user) {
      log.debug('user found %j', mongo.clean(user))
      send(res, 200, mongo.clean(user))
      return
    }
    log.debug('No user found creating one fro : %s', socialUser.email)
    var newUser = { email: socialUser.email }
    var result = await users.insertOne(newUser)
    newUser.id = result.insertedId
    send(res, 200, mongo.clean(newUser))
    return
  } catch (error) {
    log.error('error  ', error)
    send(res, 500, 'something went wrong: ' + error)
  }
  log.trace('getMe done')
}

const createUser = async (req, res) => {
  log.trace('createUser')
  try {
    var socialUser = await getUserFromRequestJwt(req)
    if (!socialUser) {
      log.debug('no logged in user')
      send(res, 401, 'Not authorized to get or create a user')
      return
    }
    log.debug('JWT User: %j', socialUser)
    var users = await mongo.getCollection('users')
    var user = await users.findOne({ email: socialUser.email })
    if (user.username) {
      log.debug('user found %j', mongo.clean(user))
      send(res, 200, mongo.clean(user))
      return
    }
    var data = await json(req)
    if (!data.username) {
      log.debug('No username in payload so will not update. Payload: %j', data)
      send(res, 401, 'No username found in submission so not updating user')
      return
    }
    if (notAcceptable(data.username)) {
      log.debug('Bad username selected: %s', data.username)
      send(res, 401, 'Username is not permitted')
      return
    }
    user.username = data.username
    await users.update({ email: socialUser.email }, user)
    log.info('user update: %j', user)
    send(res, 200, mongo.clean(user))
  } catch (error) {
    log.error(error)
    send(res, 500, 'something went wrong: ' + error)
  }
}

function notAcceptable (name) {
  const nameLower = name.toLowerCase().trim()
  if (nameLower.indexOf('admin') !== -1) {
    return true
  }
  if (reserved.indexOf(nameLower) !== -1) {
    return true
  }
  return false
}
module.exports = router(
  post('/api/user', createUser),
  get('/api/user', getMe)
  // del('/api/user/:id', deleteUser)
)
