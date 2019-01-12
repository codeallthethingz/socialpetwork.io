const auth = require('./auth')
const NodeRSA = require('node-rsa')
const jwt = require('jsonwebtoken')
const { Base64 } = require('js-base64')

test('with certificate', async () => {
  const key = new NodeRSA({ b: 2048 })
  const pubKey = key.exportKey('pkcs1-public-pem')
  const priKey = key.exportKey('pkcs1-private-pem')
  var signed = jwt.sign({ email: 'enc@example.com' }, priKey, { algorithm: 'RS256' })
  var req = { headers: { cookie: 'somethingInTheway=bob; idToken=' + signed } }
  auth.JWT_SECRET = Base64.encode(pubKey)
  var user = await auth.getUserFromRequestJwt(req)
  expect(user.email).toEqual('enc@example.com')
})
test('verify jwt', async () => {
  auth.JWT_SECRET = 'DONT_VERIFY'
  var req = { headers: { cookie: 'somethingInTheway=bob; idToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUZXN0IiwiaWF0IjpudWxsLCJleHAiOm51bGwsImF1ZCI6IiIsInN1YiI6IiIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSJ9.hSgkc7OxF1U31YpkH5rO0XQpUZf2XfG1elNTmQZBvr8' } }
  var user = await auth.getUserFromRequestJwt(req)
  expect(user.email).toEqual('test@example.com')
})
test('read jwt', async () => {
  var req = { headers: { cookie: 'somethingInTheway=bob; idToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUZXN0IiwiaWF0IjpudWxsLCJleHAiOm51bGwsImF1ZCI6IiIsInN1YiI6IiIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSJ9.hSgkc7OxF1U31YpkH5rO0XQpUZf2XfG1elNTmQZBvr8' } }
  var user = await auth.getUserFromRequestJwt(req)
  expect(user.email).toEqual('test@example.com')
})
test('bad signature', async () => {
  var didntThrow = false
  try {
    auth.JWT_SECRET = 'bad secret'
    var req = { headers: { cookie: 'somethingInTheway=bob; idToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUZXN0IiwiaWF0IjpudWxsLCJleHAiOm51bGwsImF1ZCI6IiIsInN1YiI6IiIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSJ9.hSgkc7OxF1U31YpkH5rO0XQpUZf2XfG1elNTmQZBvr8' } }
    await auth.getUserFromRequestJwt(req)
    didntThrow = true
  } catch (JsonWebTokenError) {
    // expected path
  }
  expect(didntThrow).toEqual(false)
})

test('no cookie', async () => {
  var req = { headers: { cookie: '' } }
  var user = await auth.getUserFromRequestJwt(req)
  expect(user).toEqual(null)
})
test('no idToken', async () => {
  var req = { headers: { cookie: 'bob=stnhdt' } }
  var user = await auth.getUserFromRequestJwt(req)
  expect(user).toEqual(null)
})
