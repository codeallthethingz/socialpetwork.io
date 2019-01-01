const fs = require('fs')
const util = require('util')
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
  async _saveCredentialsFile (creds, location) {
    log.trace('saveFile')
    const secret = Buffer.from(creds)
    await writeFile(location, Base64.decode(secret))
  }

  async getBucket (bucketName) {
    log.trace('getBucket')
    await this._init()
    if (!this._buckets[bucketName]) {
      this._buckets[bucketName] = await this._bucketManager.bucket(bucketName)
    }
    console.log(this._buckets)
    return this._buckets[bucketName]
  }
}
