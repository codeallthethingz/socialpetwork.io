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
  log.debug('post: %o', post)
  send(res, 200, post)
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
  } catch (error) {
    send(res, 500, 'could not delete: ' + error)
  }
  log.debug('deleted: %o', post)
  send(res, 200, post)
}

const createPost = async (req, res) => {
  log.trace('handle request')
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
        media: media,
        epoch: new Date().getTime()
      }
      var result = await posts.insertOne(record)
      log.info('Inserted record %j', record)
      record._id = result.insertedId
      resolve(record)
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
