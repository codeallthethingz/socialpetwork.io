const { MongoClient } = require('mongodb')
const { json, send } = require('micro')

var mongoConnection = process.env.MONGO_CONNECTION
var mongoWriterPassword = process.env.MONGO_WRITER_PASSWORD

module.exports = async (req, res) => {
  var url = 'mongodb://writer:' + mongoWriterPassword + '@' + mongoConnection
  console.log('url', url)
  var client = await MongoClient.connect(url)
  const db = client.db('socialpetwork-production')
  var posts = db.collection('posts')
  const data = await json(req)
  var record = {
    title: data.title,
    media: { type: 'image', url: data.url },
    epoch: new Date().getTime()
  }
  var result = await posts.insertOne(record)
  console.log(result)
  client.close()
  send(res, 200, result)
}
