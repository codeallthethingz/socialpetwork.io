const jwt = require('jsonwebtoken')
const log = require('debug-with-levels')('socialpetwork-common:auth')
const { Base64 } = require('js-base64')

module.exports.JWT_SECRET = process.env.JWT_SECRET
var initialized = false
module.exports.getUserFromRequestJwt = async (req) => {
  log.trace('getUserFromRequestJwt')
  init()
  if (!req.headers.cookie) {
    return null
  }
  const jwtCookie = req.headers.cookie.split(';').find(c => c.trim().startsWith('idToken='))
  if (!jwtCookie) {
    return null
  }
  const token = jwtCookie.split('=')[1]
  var claims = await new Promise(function (resolve, reject) {
    if (exports.JWT_SECRET === 'DONT_VERIFY') {
      resolve(jwt.decode(token))
    } else {
      jwt.verify(token, Base64.decode(exports.JWT_SECRET), (err, decode) => {
        if (err) {
          reject(err)
        }
        log.debug('decoded user: %j', decode)
        resolve(decode)
      })
    }
  })
  return claims
}

function init () {
  if (!initialized) {
    log.info('JWT_SECRET ' +
      (exports.JWT_SECRET
        ? '****' + exports.JWT_SECRET.substring(exports.JWT_SECRET.length - 4, exports.JWT_SECRET.length)
        : null))
    initialized = true
  }
}
