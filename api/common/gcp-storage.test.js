const GcpStorage = require('./gcp-storage')
const { Base64 } = require('js-base64')
const util = require('util')
const fs = require('fs')
const readFile = util.promisify(fs.readFile)

test('credentials file created', async () => {
  var creds = Base64.encode('hello world')
  var credsStorageLocation = '/tmp/hello'
  var gcpStorage = new GcpStorage(creds, credsStorageLocation, null)
  gcpStorage._saveCredentialsFile(creds, credsStorageLocation)
  expect((await readFile(credsStorageLocation, 'utf8'))).toEqual('hello world')
})

test('credentials missing', async () => {
  var didntThrow = false
  try {
    expect(new GcpStorage(' ', null, null)).toThrow(new Error('GCP credentials not found in environment variable: GCP_STORAGE_CREDENTIALS'))
    didntThrow = true
  } catch (error) {
    // expected
  }
  expect(didntThrow).toEqual(false)
})

class MockStorage {
  constructor () {
    this._count = 0
  }
  bucket () {
    this._count++
    return this._count + ''
  }
  static getCount () {
    return this.count
  }
}

test('connected to bucket', async () => {
  var gcpStorage = new GcpStorage(Base64.encode('hello world'), '/tmp/creds', MockStorage)
  expect(await gcpStorage.getBucket('bob')).toEqual('1')
})

test('only gets bucket once', async () => {
  var gcpStorage = new GcpStorage(Base64.encode('hello world'), '/tmp/creds', MockStorage)
  expect(await gcpStorage.getBucket('bob')).toEqual('1')
  expect(await gcpStorage.getBucket('bob')).toEqual('1')
})
