const { MongoClient } = require('mongodb')
const { send } = require('micro')
const { Base64 } = require('js-base64')
const fs = require('fs')
const util = require('util')
const { Storage } = require('@google-cloud/storage')
const writeFile = util.promisify(fs.writeFile)
const deleteFile = util.promisify(fs.unlink)
const formidable = require('formidable')
const imageType = require('image-type')
const readChunk = require('read-chunk')
const md5File = require('md5-file/promise')
const log = require('debug-with-levels')('socialpetwork-api:post')

var storage = null

var mongoConnection = process.env.MONGO_CONNECTION
var mongoWriterPassword = process.env.MONGO_WRITER_PASSWORD
var gcpStorageCredentialString = process.env.GCP_STORAGE_CREDENTIALS

async function saveFile () {
  log.trace('saveFile')
  const str = gcpStorageCredentialString

  if (!str || str === '') {
    throw new Error('GCP credentials not found in environment variable: GCP_STORAGE_CREDENTIALS')
  }

  const secret = Buffer.from(str)
  await writeFile('/tmp/gcpStorageCredentials.json', Base64.decode(secret))

  storage = new Storage({
    projectId: 'focus-heuristic-220016',
    keyFilename: '/tmp/gcpStorageCredentials.json'
  })
}

module.exports = async (req, res) => {
  log.trace('handle request')
  await saveFile()

  return new Promise(function (resolve, reject) {
    var form = new formidable.IncomingForm()
    form.multiples = true
    form.parse(req, async function (err, fields, files) {
      if (err) return reject(err)

      log.debug('files %o', files)

      var keys = Object.keys(files)
      log.debug('1 keys %o', keys)
      var media = []
      for (var i = 0; i < keys.length; i++) {
        var path = files[keys[i]].path

        const buffer = readChunk.sync(path, 0, 12)
        var hash = await md5File(path)

        var typeOfImage = imageType(buffer)
        if (!typeOfImage) {
          reject(new Error('not an image'))
        }
        log.debug('file %o', files[keys[i]])

        var bucket = storage.bucket('socialpetwork-images')
        const file = bucket.file(hash)

        var fileAlreadyInGoogleStorage = await file.exists()
        log.debug('filealreadinginstorage: ', fileAlreadyInGoogleStorage[0])
        if (!fileAlreadyInGoogleStorage[0]) {
          log.debug('uploading: %s', path)
          try {
            var response = await bucket.upload(path, {
              destination: hash,
              gzip: true,
              metadata: {
                cacheControl: 'public, max-age=31536000',
                contentType: typeOfImage.mime
              }
            })
          } catch (error) {
            reject(error)
          }
        } else {
          log.debug('file found in GCP storage, not recreating')
        }
        log.debug('deleting file: %s', path)
        await deleteFile(path)
        log.debug('hash %s', hash)
        media.push({ type: 'image', hash: hash, mimeType: typeOfImage.mime })
        log.debug('response %o', response)
        log.debug('uploaded')
      }
      var url = 'mongodb://writer:' + mongoWriterPassword + '@' + mongoConnection
      log.debug('connecting to mongo %s', url)
      var client = await MongoClient.connect(url, { useNewUrlParser: true })
      log.debug('connected to mongo')
      const db = client.db('socialpetwork-production')
      var posts = db.collection('posts')
      var record = {
        title: fields.title,
        media: media,
        epoch: new Date().getTime()
      }
      log.debug('record %o', record)
      log.debug('inserting')

      var result = await posts.insertOne(record)
      if (result.err) reject(result.err)
      log.debug('err from mongo: %o', err)
      log.debug('result from mongo: %o', result.insertedId)
      record._id = result.insertedId
      client.close()
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
