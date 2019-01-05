const { MongoClient, ObjectID } = require('mongodb')
const log = require('debug-with-levels')('socialpetwork-common:mongo')

module.exports = class Mongo {
  constructor (connection, password, client) {
    this._connection = process.env.MONGO_CONNECTION
    this._password = process.env.MONGO_WRITER_PASSWORD
    this._client = MongoClient
    if (connection) {
      this._connection = connection
    }
    if (password) {
      this._password = password
    }
    if (client) {
      this._client = client
    }
    this._db = null
  }
  async getDb () {
    log.trace('getDb')
    if (this._db === null) {
      log.trace('creating mongo')
      var url = 'mongodb://writer:' + this._password + '@' + this._connection
      log.debug('connecting to mongo %s', url.substring(url.indexOf('@')))
      var client = await this._client.connect(url, { useNewUrlParser: true })
      log.debug('connected to mongo')
      this._db = client.db('socialpetwork-production')
    }
    return this._db
  }
  async getCollection (collectionName) {
    log.trace('getCollection(%s)', collectionName)
    return (await this.getDb()).collection(collectionName)
  }
  async findById (collectionName, id) {
    log.trace('findById(%s, %s)', collectionName, id)
    var collection = (await this.getDb()).collection(collectionName)
    var obj = await collection.findOne({ '_id': ObjectID(id) })
    return obj
  }
  async removeById (collectionName, id) {
    log.trace('removeById(%s, %s)', collectionName, id)
    var collection = (await this.getDb()).collection(collectionName)
    await collection.remove({ '_id': ObjectID(id) })
  }
}
