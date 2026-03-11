const http = require('http')
const opts = { hostname: '127.0.0.1', port: 3000, path: '/', method: 'GET', timeout: 5000 }
const req = http.request(opts, res => {
  console.log('STATUS', res.statusCode)
  console.log('HEADERS', res.headers)
  let data = ''
  res.on('data', chunk => data += chunk)
  res.on('end', () => console.log('LENGTH', data.length))
})
req.on('error', err => console.error('ERROR', err && err.message))
req.on('timeout', ()=>{ console.error('TIMEOUT'); req.destroy() })
req.end()
