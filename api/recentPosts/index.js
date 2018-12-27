const { MongoClient } = require('mongodb')
const debug = require('debug')('socialpetwork')
const { send } = require('micro')

var mongoConnection = process.env.MONGO_CONNECTION
var mongoReaderPassword = process.env.MONGO_READER_PASSWORD

module.exports = async (req, res) => {
  var url = 'mongodb://reader:' + mongoReaderPassword + '@' + mongoConnection

  debug('url', url)
  var client = await MongoClient.connect(url)
  debug('1', client)
  const db = client.db('socialpetwork-production')
  debug('2', db)
  var posts = db.collection('posts')
  debug('3', posts)
  var recent = await posts.find({}).sort({ epoch: -1 }).toArray()
  debug('4', recent)
  client.close()
  debug('5')
  debug('req: ', req.headers)

  send(res, 200, {
    data: {
      posts: recent
    }
  })
}
