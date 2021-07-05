const API_URL = 'http://127.0.0.1:5050'

let todos

function getTodosFromServer(url, options) {
  return fetch(url)
    .then(response => console.log(response))
}

getTodosFromServer(API_URL)