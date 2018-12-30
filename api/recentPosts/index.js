const { MongoClient } = require('mongodb')
const { send } = require('micro')
var log = require('debug-with-levels')('socialpetwork-api:recentPosts')

var mongoConnection = process.env.MONGO_CONNECTION
var mongoReaderPassword = process.env.MONGO_READER_PASSWORD

module.exports = async (req, res) => {
  log.trace('recentPosts')
  try {
    var url = 'mongodb://reader:' + mongoReaderPassword + '@' + mongoConnection

    var client = await MongoClient.connect(url, { useNewUrlParser: true })
    const db = client.db('socialpetwork-production')
    var posts = db.collection('posts')
    var recent = await posts.find({}).sort({ epoch: -1 }).toArray()
    client.close()
    log.debug('Recent listings: %j', recent)

    send(res, 200, {
      data: {
        posts: recent
      }
    })
  } catch (error) {
    log.error(error)
    send(res, 500, 'something went wrong')
  }
}
