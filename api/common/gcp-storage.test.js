const GcpStorage = require('./gcp-storage')
const { Base64 } = require('js-base64')
const util = require('util')
const fs = require('fs')
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

class MockStorage {
  constructor () {
    this._count = 0
  }
  bucket () {
    this._count++
    return {
      upload: () => {
      },
      name: this._count + ''
    }
  }
}

test('storage error', async () => {
  await writeFile('/tmp/mockImage.png', Base64.decode('R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='), 'binary')
  var gcpStorage = new GcpStorage(Base64.encode('hello world'), '/tmp/creds', MockStorage)
  var didntThrow = false
  gcpStorage._bucketManager = {
    bucket: () => {
      return {
        upload: (aoeu, data) => {
          throw new Error('IO Error')
        },
        file: () => {
          return { exists: () => [false] }
        }
      }
    }
  }
  gcpStorage._initialized = true
  try {
    await gcpStorage.saveImage('/tmp/mockImage.png')
    didntThrow = true
  } catch (error) {
    expect(error.message).toEqual('IO Error')
  }
  expect(didntThrow).toEqual(false)
})

test('store image', async () => {
  var expectedHash = '3aeb1d5c1dc87690d5626ca6f688c913'
  await writeFile('/tmp/mockImage.png', Base64.decode('R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='), 'binary')
  var gcpStorage = new GcpStorage(Base64.encode('hello world'), '/tmp/creds', MockStorage)
  var uploaded = false
  gcpStorage._bucketManager = {
    bucket: () => {
      return {
        upload: (aoeu, data) => {
          expect(data.destination).toEqual(expectedHash)
          uploaded = true
        },
        file: () => {
          return { exists: () => [false] }
        }
      }
    }
  }
  gcpStorage._initialized = true
  var result = await gcpStorage.saveImage('/tmp/mockImage.png')
  expect(uploaded).toEqual(true)
  expect(result).toEqual({
    hash: expectedHash, mime: 'image/gif'
  })
})

test('not image', async () => {
  var didntThrow = false
  try {
    writeFile('/tmp/badImage.png', 'data')
    var gcpStorage = new GcpStorage(Base64.encode('hello world'), '/tmp/creds', MockStorage)
    await gcpStorage.saveImage('/tmp/badImage.png')
    didntThrow = true
  } catch (error) {
    // expected
  }
  expect(didntThrow).toEqual(false)
})

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

test('connected to bucket', async () => {
  var gcpStorage = new GcpStorage(Base64.encode('hello world'), '/tmp/creds', MockStorage)
  expect((await gcpStorage.getBucket('bob')).name).toEqual('1')
})

test('only gets bucket once', async () => {
  var gcpStorage = new GcpStorage(Base64.encode('hello world'), '/tmp/creds', MockStorage)
  expect((await gcpStorage.getBucket('bob')).name).toEqual('1')
  expect((await gcpStorage.getBucket('bob')).name).toEqual('1')
})
