const http = require('http')

const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  console.log('Connected')
});

const todoSchema = new mongoose.Schema({
  title: String,
});

const Todo = mongoose.model('Todo', todoSchema)

const server = http.createServer((req, res) => {
  const { method, url } = req
  console.log(`method: ${method} url: ${url}`);

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

  if (method === 'GET' && url === '/todos') {
    res.write()
    res.end()
  }

  if (method === 'POST' && url === '/addtodo') {
    req.on('data', chunk => {
      const data = JSON.parse(chunk)
      data.completed = false
      const newTodo = new Todo(data)
      newTodo.save((err, newTodo) => {
        if (err) {
          console.error(err)
        }
      })
    })

    res.end()
  }

  res.on('error', (err) => {
    console.error(err);
  })

  res.end('')
})

server.listen(5050)