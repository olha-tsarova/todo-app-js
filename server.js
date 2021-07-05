const http = require('http')

let todos = [{
  id: 46556,
  title: 'sdvgdxcfa',
  completed: false
}]

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'})
  res.write(JSON.stringify(todos))
  res.end()
})

server.listen(5050)