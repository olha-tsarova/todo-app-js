const API_URL = 'http://127.0.0.1:5050'
const TODOS_URL = '/todos'

let todos = [{
  id: 465358945,
  title: 'Some title',
  completed: false
}]

function getTodosFromServer(url, options) {
  return fetch(url)
    .then(response => console.log(response))
}

function postTodoToServer(url, options, data) {
  return fetch(`${url}${options}`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      "Content-type": "application/json",
    },
  })
  .then(response => console.log(response))
}

// getTodosFromServer(API_URL)
// postTodoToServer(API_URL, TODOS_URL, todos)