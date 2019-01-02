const { send } = require('micro')
const fs = require('fs')
const util = require('util')
const deleteFile = util.promisify(fs.unlink)
const formidable = require('formidable')
const log = require('debug-with-levels')('socialpetwork-api:post')
const GcpStorage = require('@socialpetwork/common/gcp-storage')
const gcpStorage = new GcpStorage()
const Mongo = require('@socialpetwork/common/mongo')
const mongo = new Mongo()

module.exports = async (req, res) => {
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
        title: fields.title,
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
