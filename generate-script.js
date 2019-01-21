const editJsonFile = require('edit-json-file')
const fs = require('fs')
const util = require('util')
const writeFile = util.promisify(fs.writeFile)
var _ = require('lodash')

var env = [
  'MONGO_CONNECTION',
  'MONGO_WRITER_PASSWORD',
  'DEBUG',
  'GCP_STORAGE_CREDENTIALS',
  'JWT_SECRET'
]
var micros = [
  { name: 'api/recentPosts', port: 3001, runWith: 'micro', env: env },
  { name: 'api/post', port: 3002, runWith: 'micro', env: env },
  { name: 'api/user', port: 3003, runWith: 'micro', env: env },
  { name: 'www', port: 3000, runWith: 'npm' }
]

function createCommand (info) {
  var newProcess = null
  if (info.runWith === 'npm') {
    newProcess = create('npm', ['run', 'dev'], {
      cwd: './www/',
      stdio: 'inherit',
      port: 3000,
      env: info.env
    })
  } else {
    newProcess = create('micro-dev', ['-sp ' + info.port, '-w .', '-w ../common', '.'], {
      cwd: './' + info.name + '/',
      port: info.port,
      stdio: 'inherit',
      env: info.env
    })
  }
  return newProcess
}
var missingVariable = false
function create (command, params, config) {
  var envInfo = ''
  if (config.env) {
    for (var i = 0; i < config.env.length; i++) {
      var variable = config.env[i]
      if (!process.env[variable] || process.env[variable].trim() === '') {
        console.error('Could not find env variable: ' + variable + ' will exit')
        missingVariable = true
      }
      envInfo += ' ' + variable + '="$' + variable + '"'
    }
  }
  return '-t "' + command + ' ' + config.cwd + ' ' + config.port + '" "cd ' + config.cwd + ' && ' + envInfo + ' ' + command + ' ' + params.join(' ') + '"'
}

var commands = []
var proxyConfig = { rules: [] }
var method = ['GET', 'POST', 'OPTIONS', 'DELETE', 'PUT']
var devDependencies = {}
var dependencies = {}

let microPackageJson = editJsonFile('api/common/package.json')
_.merge(dependencies, microPackageJson.get('dependencies'))
_.merge(devDependencies, microPackageJson.get('devDependencies'))

micros.forEach(micro => {
  let microPackageJson = editJsonFile(micro.name + '/package.json')
  _.merge(dependencies, microPackageJson.get('dependencies'))
  _.merge(devDependencies, microPackageJson.get('devDependencies'))

  commands.push(createCommand(micro))
  if (micro.name === 'www') {
    proxyConfig.rules.push({
      'pathname': '/',
      method,
      'dest': 'http://localhost:' + micro.port
    })
  } else {
    proxyConfig.rules.push({
      'pathname': '/' + micro.name + '**',
      method,
      'dest': 'http://localhost:' + micro.port
    })
  }
})

async function writeProxy () {
  await writeFile('proxy.json', JSON.stringify(proxyConfig, null, 2))
}
writeProxy()
var proxyComm = '-t "micro-proxy 9000" "cat proxy.json | jq -c \'.rules[] | { pathname, dest}\'  && sleep 5 && micro-proxy -r proxy.json -p 9000"'
var curlComm = '-t curl "zsh"'
var nextComm = commands.splice(commands.length - 1, 1)
var microsComm = commands.join(' .. ')
var stmuxCommand = '[ [ [ ' + curlComm + ' : ' + proxyComm + ' ] .. ' + nextComm + ' ] : [ ' + microsComm + ' ] ]'
var scriptCommand = 'node generate-script.js && stmux -M true -- ' + stmuxCommand

let packageJson = editJsonFile('package.json')
packageJson.set('scripts.dev', scriptCommand)
packageJson.set('dependencies', dependencies)
packageJson.set('devDependencies', devDependencies)
packageJson.save()

if (missingVariable) {
  process.exit(1)
}
