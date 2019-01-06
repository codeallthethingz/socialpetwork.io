const jwtDecode = require('jwt-decode')

module.exports.getUserFromServerCookie = (req) => {
  if (!req.headers.cookie) {
    return null
  }
  const jwtCookie = req.headers.cookie.split(';').find(c => c.trim().startsWith('idToken='))
  if (!jwtCookie) {
    return null
  }
  const jwt = jwtCookie.split('=')[1]
  return jwtDecode(jwt)
}
