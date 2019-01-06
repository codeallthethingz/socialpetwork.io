const auth = require('./auth')

test('read jwt', () => {
  var req = { headers: { cookie: 'somethingInTheway=bob; idToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUZXN0IiwiaWF0IjpudWxsLCJleHAiOm51bGwsImF1ZCI6IiIsInN1YiI6IiIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSJ9.hSgkc7OxF1U31YpkH5rO0XQpUZf2XfG1elNTmQZBvr8' } }
  var user = auth.getUserFromServerCookie(req)
  expect(user.email).toEqual('test@example.com')
})

test('no cookie', () => {
  var req = { headers: { cookie: '' } }
  var user = auth.getUserFromServerCookie(req)
  expect(user).toEqual(null)
})
test('no idToken', () => {
  var req = { headers: { cookie: 'bob=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUZXN0IiwiaWF0IjpudWxsLCJleHAiOm51bGwsImF1ZCI6IiIsInN1YiI6IiIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSJ9.hSgkc7OxF1U31YpkH5rO0XQpUZf2XfG1elNTmQZBvr8' } }
  var user = auth.getUserFromServerCookie(req)
  expect(user).toEqual(null)
})
