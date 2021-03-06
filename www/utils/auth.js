import jwtDecode from 'jwt-decode'
import Cookie from 'js-cookie'
import axios from 'axios'

const getQueryParams = () => {
  const params = {}
  window.location.href.replace(/([^(?|#)=&]+)(=([^&]*))?/g, ($0, $1, $2, $3) => {
    params[$1] = $3
  })
  return params
}
export const getMe = async () => {
  try {
    var me = await axios({
      method: 'get',
      url: '/api/user'
    })
    return me.data
  } catch (error) {
    unsetToken()
    console.log('was broser: ', process.browser, 'getMe', error)
  }
}
export const getMeFromServer = async (req) => {
  try {
    if (!req || !req.headers || !req.headers.referer) {
      return null
    }
    var referer = req.headers.referer
    if (referer.indexOf('/', 9) !== -1) {
      referer = referer.substring(0, referer.indexOf('/', 9) + 1)
    }
    var me = await axios({
      method: 'get',
      url: referer + 'api/user',
      headers: req.headers
    })
    return me.data
  } catch (error) {
    unsetToken()
    console.log('getmefromserver', error)
  }
}

export const setToken = (idToken, accessToken) => {
  if (!process.browser) {
    return
  }
  Cookie.set('idToken', idToken)
  Cookie.set('accessToken', accessToken)
}

export const unsetToken = () => {
  if (!process.browser) {
    return
  }
  Cookie.remove('idToken')
  Cookie.remove('accessToken')

  // to support logging out from all windows
  window.localStorage.setItem('logout', Date.now())
}

export const getUserFromServerCookie = (req) => {
  if (!req.headers.cookie) {
    return undefined
  }
  const jwtCookie = req.headers.cookie.split(';').find(c => c.trim().startsWith('idToken='))
  if (!jwtCookie) {
    return undefined
  }
  const jwt = jwtCookie.split('=')[1]
  var claims = jwtDecode(jwt)
  if (isExpired(claims)) {
    return null
  }
  return claims
}

export const getUserFromLocalCookie = () => {
  var idToken = Cookie.get('idToken')
  var claims = idToken ? jwtDecode(idToken) : null
  if (isExpired(claims)) {
    unsetToken()
    return null
  }
  return claims
}

export const isExpired = (claims) => {
  if (!claims || claims === null) {
    return true
  }
  var dateNow = new Date()

  return claims.exp < (dateNow.getTime() / 1000)
}
