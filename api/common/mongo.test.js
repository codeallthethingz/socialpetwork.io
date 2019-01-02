const Mongo = require('./mongo')

test('get db', async () => {
  var count = 0
  const mongo = new Mongo('connection', 'password', {
    connect: (url, options) => {
      expect(url).toEqual('mongodb://writer:' + 'password' + '@' + 'connection')
      return {
        db: () => {
          count++
          return {}
        }
      }
    }
  })

  await mongo.getDb()
  await mongo.getDb()
  await mongo.getDb()
  expect(count).toEqual(1)
})

test('get collection', async () => {
  const mongo = new Mongo('connection', 'password')
  var count = 0
  mongo._db = { collection: () => {
    count++
    return { id: '' + count }
  } }
  var collection = await mongo.getCollection('my collection')
  expect(collection.id).toEqual('1')
})
