const fs = require('fs')
const util = require('util')
const imageType = require('image-type')
const readChunk = require('read-chunk')
const md5File = require('md5-file/promise')
const { Base64 } = require('js-base64')
const { Storage } = require('@google-cloud/storage')
const writeFile = util.promisify(fs.writeFile)
const log = require('debug-with-levels')('socialpetwork-common:gcp-storage')

module.exports = class GcpStorage {
  constructor (creds, credsStorageLocation, GcpStorage) {
    this._location = '/tmp/gcpStorageCredentials.json'
    this._creds = process.env.GCP_STORAGE_CREDENTIALS
    this._storage = Storage
    this._initialized = false
    this._buckets = []
    if (GcpStorage) {
      this._storage = GcpStorage
    }
    if (credsStorageLocation) {
      this._location = credsStorageLocation
    }
    if (creds) {
      this._creds = creds
    }
    if (!this._creds || this._creds.trim() === '') {
      throw new Error('GCP credentials not found in environment variable: GCP_STORAGE_CREDENTIALS')
    }
  }

  async _init () {
    if (!this._initialized) {
      log.trace('init')
      await this._saveCredentialsFile(this._creds, this._location)
      this._creds = null
      this._bucketManager = new this._storage({
        projectId: 'focus-heuristic-220016',
        keyFilename: this.gcpStorageCredentialLocation
      })
      this._storage = null
      this._initialized = true
    }
  }

  async saveImage (path) {
    log.trace('saveImage')
    this._init()

    const buffer = readChunk.sync(path, 0, 12)
    var hash = await md5File(path)

    var typeOfImage = imageType(buffer)
    log.debug('image type: %j', typeOfImage)
    if (!typeOfImage) {
      throw new Error('not an image')
    }

    var bucket = await this.getBucket('socialpetwork-images')
    const file = bucket.file(hash)

    var fileAlreadyInGoogleStorage = await file.exists()
    if (!fileAlreadyInGoogleStorage[0]) {
      log.debug('uploading: %s', path)

      await bucket.upload(path, {
        destination: hash,
        gzip: true,
        metadata: {
          cacheControl: 'public, max-age=31536000',
          contentType: typeOfImage.mime
        }
      })
      log.debug('uploaded')
    } else {
      log.debug('file found in GCP storage, not recreating')
    }
    return {
      hash: hash,
      mime: typeOfImage.mime
    }
  }

  async _saveCredentialsFile (creds, location) {
    log.trace('saveFile')
    const secret = Buffer.from(creds)
    var contents = '{\n' +
    '  "type": "service_account",\n' +
    '  "project_id": "focus-heuristic-220016",\n' +
    '  "private_key_id": "1210b61d161b7cf8618e1a89972b35656f820e70",\n' +
    '  "private_key": "-----BEGIN PRIVATE KEY-----\\n' + Base64.decode(secret).trim().replace(/\n/g, '\\n') + '\\n-----END PRIVATE KEY-----\\n",\n' +
    '  "client_email": "socialpetwork-images@focus-heuristic-220016.iam.gserviceaccount.com",\n' +
    '  "client_id": "110243778463996458045",\n' +
    '  "auth_uri": "https://accounts.google.com/o/oauth2/auth",\n' +
    '  "token_uri": "https://oauth2.googleapis.com/token",\n' +
    '  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",\n' +
    '  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/socialpetwork-images%40focus-heuristic-220016.iam.gserviceaccount.com"\n' +
  '}\n'
    await writeFile(location, contents)
  }

  async getBucket (bucketName) {
    log.trace('getBucket')
    await this._init()
    if (!this._buckets[bucketName]) {
      this._buckets[bucketName] = await this._bucketManager.bucket(bucketName)
    }
    return this._buckets[bucketName]
  }
}
