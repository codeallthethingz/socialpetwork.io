const { send } = require('micro')
const { router, get, post, del } = require('microrouter')
const fs = require('fs')
const util = require('util')
const deleteFile = util.promisify(fs.unlink)
const formidable = require('formidable')
const log = require('debug-with-levels')('socialpetwork-api:post')
const GcpStorage = require('@socialpetwork/common/gcp-storage')
const gcpStorage = new GcpStorage()
const Mongo = require('@socialpetwork/common/mongo')
const mongo = new Mongo()
const { getUserFromRequestJwt } = require('@socialpetwork/common/auth')

const getPost = async (req, res) => {
  log.trace('getPost: %j', req.params)
  if (!req.params.id) {
    send(res, 404, 'id not defined')
    return
  }
  var post = await mongo.findById('posts', req.params.id)

  if (!post) {
    send(res, 404, 'id not found: ' + req.params.id)
    return
  }
  var returnPost = mongo.clean(post)
  log.debug('post: %o', returnPost)
  send(res, 200, returnPost)
}

const deletePost = async (req, res) => {
  log.trace('deletePost: %j', req.params)
  if (!req.params.id) {
    send(res, 404, 'id not defined')
    return
  }
  var post = await mongo.findById('posts', req.params.id)

  if (!post) {
    send(res, 404, 'id not found: ' + req.params.id)
    return
  }
  try {
    await mongo.removeById('posts', req.params.id)
    log.info('removed post %s', req.params.id)
  } catch (error) {
    send(res, 500, 'could not delete: ' + error)
  }
  var returnPost = mongo.clean(post)
  log.debug('deleted: %o', returnPost)
  send(res, 200, returnPost)
}

const createPost = async (req, res) => {
  log.trace('handle request')
  var username = 'anonymous'

  var socialUser = await getUserFromRequestJwt(req)
  if (socialUser) {
    log.debug('JWT User: %j', socialUser)
    var users = await mongo.getCollection('users')
    var user = await users.findOne({ email: socialUser.email })
    log.debug('Mongo User: %j', user)
    if (!user || !user.username) {
      send(res, 401, 'User is not set up correctly to create posts, must have a row in the database with a username and email')
      return
    }
    username = user.username
  }
  return new Promise(function (resolve, reject) {
    var form = new formidable.IncomingForm()
    form.multiples = true
    form.parse(req, async function (err, fields, files) {
      if (err) return reject(err)
      var keys = Object.keys(files)
      var media = []
      for (var i = 0; i < keys.length; i++) {
        var path = files[keys[i]].path
        var imageDetails = await gcpStorage.saveImage(path)
        media.push({ type: 'image', hash: imageDetails.hash, mimeType: imageDetails.mime })
        await deleteFile(path)
      }
      var posts = await mongo.getCollection('posts')
      var record = {
        text: fields.text,
        username: username,
        media: media,
        epoch: new Date().getTime()
      }
      var result = await posts.insertOne(record)
      log.info('Inserted record %j', record)
      record._id = result.insertedId
      resolve(mongo.clean(record))
    })
  }).then(function (result) {
    log.debug('then resolved. sending response')
    send(res, 200, {
      data: {
        inserted: result
      }
    })
  }).catch(function (error) {
    log.error(error)
    send(res, 500, error)
  })
}

module.exports = router(
  post('/api/post', createPost),
  get('/api/post/:id', getPost),
  del('/api/post/:id', deletePost)
)
