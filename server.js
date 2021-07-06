const http = require('http')

let todos = [{
  id: 46556,
  title: 'sdvgdxcfa',
  completed: false
}]

const server = http.createServer((req, res) => {
  const { headers, method, url } = req

  console.log(`method: ${method} url: ${url}`);
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')

  if (method === 'GET' && url === '/todos') {
    res.end(JSON.stringify(todos));
  }

  if (method === 'POST' && url === '/todos') {
    req.on('data', chunk => {
      console.log(`Data chunk available: ${chunk}`)
      todos = todos.concat(JSON.parse(chunk))
    })
    res.end(JSON.stringify(todos))
  }

  res.on('error', (err) => {
    console.error(err);
  })

  res.end('')
})

server.listen(5050)