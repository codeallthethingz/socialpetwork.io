const createProxy = require('micro-proxy')
const { spawn } = require('child_process')

var micros = [
  { name: 'recentPosts', port: 3001 },
  { name: 'post', port: 3002 },
  { name: 'www', port: 3000 }
]

function spawnMicro (info) {
  var newProcess = null
  if (info.name === 'www') {
    newProcess = spawn('npm', ['run', 'dev'], {
      cwd: './www/', stdio: 'inherit'
    })
  } else {
    newProcess = spawn('micro-dev', ['-sp ' + info.port, '-w .', '-w ../common', '.'], {
      cwd: './api/' + info.name + '/',
      stdio: 'inherit'
    })
  }
  return newProcess
}

var running = []
var proxyConfig = []
var method = ['GET', 'POST', 'OPTIONS', 'DELETE', 'PUT']
micros.forEach(micro => {
  running.push(spawnMicro(micro))
  if (micro.name === 'www') {
    proxyConfig.push({
      'pathname': '/',
      method,
      'dest': 'http://localhost:' + micro.port
    })
  } else {
    proxyConfig.push({
      'pathname': '/api/' + micro.name + '**',
      method,
      'dest': 'http://localhost:' + micro.port
    })
  }
})

process.on('SIGINT', function (source, count) {
  if (source === 'keyboard') {
    running.forEach(micro => micro.kill())
    process.exit()
  }
})

const proxy = createProxy(proxyConfig)
proxy.listen(9000, (err) => {
  if (err) {
    throw err
  }
})
