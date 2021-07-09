export function getTodosFromServer(url) {
  return fetch(url)
    .then(response => response.json())
}

export function queryToServer(url, options, method, data) {
  return fetch(`${url}${options}`, {
    method: method,
    body: JSON.stringify(data),
    headers: {
      "Content-type": "application/json",
    }
  })
    .then(response => console.log(response))
}

