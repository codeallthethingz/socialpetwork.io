const { send } = require('micro')
var log = require('debug-with-levels')('socialpetwork-api:recentPosts')

const Mongo = require('@socialpetwork/common/mongo')
const mongo = new Mongo()

module.exports = async (req, res) => {
  log.trace('recentPosts')
  try {
    var posts = await mongo.getCollection('posts')
    var recent = await posts.find({}).sort({ epoch: -1 }).limit(10).toArray()
    log.debug('Recent listings: %d', recent.length)

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
