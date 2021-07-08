const http = require('http')

const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  console.log('Connected')
})

const todoSchema = new mongoose.Schema({
  title: String,
  completed: {
    type: Boolean,
    default: false
  }
})

const Todo = mongoose.model('Todo', todoSchema)

const server = http.createServer(async (req, res) => {
  const { method, url } = req
  console.log(`method: ${method} url: ${url}`)

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PATCH')

  if (method === 'GET' && url === '/todos') {
    await Todo.find({})
      .then(result => {
        res.end(JSON.stringify(result))
      })
  }

  if (method === 'POST' && url === '/addtodo') {
    req.on('data', chunk => {
      const data = JSON.parse(chunk)
      const newTodo = new Todo(data)
      newTodo.save((err, newTodo) => {
        if (err) {
          console.error(err)
          res.end(err)
        }
      })
    })

    res.end('added to list')
  }

  if (method === 'DELETE') {
    req.on('data', chunk => {
      const data = JSON.parse(chunk)
      data.forEach(element => {
        Todo.deleteOne({ _id: element._id }, function(err) {
          if (err) {
            console.error(err)
            res.end(err)
          }
        })
      });
    })

    res.end('deleted from list')
  }

  if (method === 'PATCH') {
    req.on('data', chunk => {
      const data = JSON.parse(chunk)
      data.forEach(element => {
        Todo.findByIdAndUpdate({ _id: element._id }, { title: element.title, completed: element.completed }, {new: true}, (err, dat) => {
          if (err) {
            console.error(err)
            res.end(err)
          } else {
            console.log(dat);
          }
        })
      })

      res.end('updated')
    })
  }
})

server.listen(5050)
