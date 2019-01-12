const Mongo = require('./mongo')
const { ObjectId } = require('mongodb')

test('clean mongo fields', () => {
  const mongo = new Mongo('connection', 'password', {})
  var original = { _id: 'my idea', some: 'other' }
  expect(mongo.clean(original)).toEqual({ id: 'my idea', some: 'other' })
  expect(original).toEqual({ _id: 'my idea', some: 'other' })
})
test('clean mongo array', () => {
  const mongo = new Mongo('connection', 'password', {})
  var original = [{ _id: 'my idea', some: 'other' }]
  expect(mongo.clean(original)).toEqual([{ id: 'my idea', some: 'other' }])
  expect(original).toEqual([{ _id: 'my idea', some: 'other' }])
})
test('delete by id', async () => {
  var count = 0
  const mongo = new Mongo('connection', 'password', {
    connect: () => {
      return {
        db: () => {
          return {
            collection: (collectionName) => {
              expect(collectionName).toEqual('posts')
              return {
                remove: (obj) => {
                  expect(obj._id).toEqual(ObjectId('5c302522ac45522e410e0576'))
                  count++
                }
              }
            }
          }
        }
      }
    }
  })
  await mongo.removeById('posts', '5c302522ac45522e410e0576')
  expect(count).toEqual(1)
})

test('find by id', async () => {
  const mongo = new Mongo('connection', 'password', {
    connect: () => {
      return {
        db: () => {
          return {
            collection: () => {
              return {
                findOne: () => {
                  return { id: '1' }
                }
              }
            }
          }
        }
      }
    }
  })
  var result = await mongo.findById('aoeuaoeuao')
  expect(result).toEqual({ id: '1' })
})

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
  mongo._db = {
    collection: () => {
      count++
      return { id: '' + count }
    }
  }
  var collection = await mongo.getCollection('my collection')
  expect(collection.id).toEqual('1')
})
