'use strict'

let root = document.querySelector('.root')
const rootParent = root.parentElement

const filterButtons = [{id: 'all', title: 'All'}, {id: 'active', title: 'Active'}, {id: 'completed', title: 'Completed'}]
let savedTodos = localStorage.todos ? JSON.parse(localStorage.getItem('todos')) : []
let todosToRender = savedTodos
let filterBy = 'all'

const mainSection = document.createElement('section')
mainSection.classList.add('main')

const toggleAllInput = document.createElement('input')
toggleAllInput.setAttribute('id', 'toggle-all')
toggleAllInput.setAttribute('type', 'checkbox')
toggleAllInput.addEventListener('click', changeStatuses)
toggleAllInput.classList.add('toggle-all')

const toggleAllLabel = document.createElement('label')
toggleAllLabel.setAttribute('for', 'toggle-all')

const itemList = document.createElement('ul')
itemList.classList.add('todo-list')


const activeTodoCounter = document.createElement('span')
activeTodoCounter.classList.add('todo-count')


const clearCompletedButton = document.createElement('button')
clearCompletedButton.classList.add('clear-completed')
clearCompletedButton.addEventListener('click', clearCompleted)
clearCompletedButton.textContent = 'Clear Completed'

render()

function render() {
  root.remove()
  root = document.createElement('div')
  root.classList.add('root')
  rootParent.append(root)

  console.log(savedTodos);
  const todosActive = savedTodos.filter(todo => !todo.completed)
  const todosCompleted = savedTodos.filter(todo => todo.completed)

  todosActive.length === 0 ? toggleAllInput.setAttribute('checked', '') : ''

  if (!savedTodos.length) {
    return
  }

  root.append(mainSection)
  mainSection.append(toggleAllInput)
  mainSection.append(toggleAllLabel)
  mainSection.append(itemList)

  const footerSection = document.createElement('footer')
  footerSection.classList.add('footer')

  const filtersList = document.createElement('ul')
  filtersList.classList.add('filters')

  root.append(footerSection)
  footerSection.append(filtersList)

  if (todosActive.length) {
    footerSection.append(activeTodoCounter)
  }

  filterButtons.map(button => {
    const filterListItem = document.createElement('li')
    const filterButton = document.createElement('button')

    filterButton.setAttribute('type', 'button')
    filterButton.setAttribute('id', `${button.id}`)
    filterButton.addEventListener('click', () => filterTodos(button.id))
    filterButton.textContent = `${button.title}`
    filterBy === button.id ? filterButton.classList.add('selected') : ''

    filtersList.append(filterListItem)
    filterListItem.append(filterButton)
  })

  if (todosCompleted.length) {
    footerSection.append(clearCompletedButton)
  }

  initTodos()
}

function initTodos() {
  itemList.innerHTML = ''

  todosToRender.map(todo => {
    const todoItem = document.createElement('li')
    todoItem.classList.add('todo-item')
    todoItem.setAttribute('id', `${todo.id}`)
    todo.completed ? todoItem.classList.add('completed') : ''

    const todoInput = document.createElement('input')
    todoInput.classList.add('toggle')
    todoInput.setAttribute('id', `todo-${todo.id}`)
    todoInput.setAttribute('type', 'checkbox')
    todoInput.addEventListener('click', () => setStatus(todo.id))
    todo.completed ? todoInput.setAttribute('checked', '') : ''

    const todoLabel = document.createElement('label')
    todoLabel.setAttribute('for', `todo-${todo.id}`)
    todoLabel.textContent = `${todo.title}`

    const todoButton = document.createElement('button')
    todoButton.classList.add('destroy')
    todoButton.addEventListener('click', () => removeTodo(todo.id))

    itemList.append(todoItem)
    todoItem.append(todoInput)
    todoItem.append(todoLabel)
    todoItem.append(todoButton)
  })

  updateInfo()
}

function updateInfo() {
  console.log('updated')

  const active = savedTodos.filter(todo => !todo.completed)
  activeTodoCounter.textContent = activeTodosCounter(active.length)
}

function activeTodosCounter(todosLength) {
  switch (todosLength) {
    case 0:
      return ''

    case 1:
      return '1 item left'

    default:
      return `${todosLength} items left`
  }
}

function filterTodos(buttonId) {
  switch(buttonId) {
    case 'all':
      filterBy = 'all'
      todosToRender = savedTodos
      render()
      break

    case 'active':
      filterBy = 'active'
      todosToRender = savedTodos.filter(todo => !todo.completed)
      render()
      break

    case 'completed':
      filterBy = 'completed'
      todosToRender = savedTodos.filter(todo => todo.completed)
      render()
      break

    default:
      return
  }
}

function clearCompleted() {
  savedTodos = savedTodos.filter(todo => !todo.completed)
  todosToRender = savedTodos
  localStorage.setItem('todos', JSON.stringify(todosToRender))

  render()
}

function addTodo(event) {
  const newTodoTitle = event.target.value.trim()

  if (event.key !== 'Enter' || !newTodoTitle) {
    return
  }

  const id = +new Date()

  const newTodo = {
    id,
    title: newTodoTitle,
    completed: false,
  }

  savedTodos.push(newTodo)
  todosToRender = savedTodos
  localStorage.setItem('todos', JSON.stringify(savedTodos))

  event.target.value = ''
  render()
}

function removeTodo(todoId) {
  savedTodos = savedTodos.filter(todo => todo.id !== todoId)
  todosToRender = savedTodos
  localStorage.setItem('todos', JSON.stringify(savedTodos))

  render()
}

function setStatus(todoId) {
  const checkedTodo = savedTodos.find(todo => todo.id === todoId)

  checkedTodo.completed = !checkedTodo.completed
  localStorage.setItem('todos', JSON.stringify(savedTodos))

  render()
}

function changeStatuses() {
  savedTodos.map(todo => todo.completed = toggleAllInput.checked)
  localStorage.setItem('todos', JSON.stringify(savedTodos))

  render()
}
