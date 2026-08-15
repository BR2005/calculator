const http = require('http')
const fs = require('fs')
const path = require('path')

const port = process.env.PORT || 3000

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    if (req.url === '/health') {
      res.setHeader('Content-Type', 'text/plain')
      res.end('hello bro')
      return
    }

    let filePath = req.url === '/' ? 'calculator.html' : req.url.slice(1)
    if (filePath.includes('..')) { res.statusCode = 400; res.end('Bad Request'); return }
    fs.readFile(path.join(__dirname, filePath), (err, data) => {
      if (err) { res.statusCode = 404; res.end('Not found'); return }
      const ext = path.extname(filePath)
      res.setHeader('Content-Type', mime[ext] || 'application/octet-stream')
      res.end(data)
    })
  } else if (req.method === 'POST' && req.url === '/calculate') {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => {
      try {
        const { a, b, op } = JSON.parse(body)
        const x = Number(a)
        const y = Number(b)
        if (!isFinite(x) || !isFinite(y)) throw new Error('Invalid numbers')
        let result
        switch (op) {
          case '+': result = x + y; break
          case '-': result = x - y; break
          case '*': result = x * y; break
          case '/':
            if (y === 0) { res.statusCode = 400; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: 'Division by zero' })); return }
            result = x / y; break
          default:
            res.statusCode = 400; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: 'Invalid operator' })); return
        }
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ result }))
      } catch (e) {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: e.message }))
      }
    })
  } else {
    res.statusCode = 404; res.end('Not found')
  }
})

server.listen(port, () => console.log(`Server running on http://localhost:${port}`))
