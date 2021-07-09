'use strict'
// import { queryToServer, getTodosFromServer } from "./api.js";
const API_URL = 'http://127.0.0.1:5050'
const GET_TODOS_URL = '/todos'
const ADD_TODO = '/addtodo'
const DELETE_TODOS_URL = '/delete'
const EDIT_TODOS_URL = '/edit'
const CHANGE_STATUSES_URL = '/changestatuses'

const M_POST = 'POST'
const M_GET = 'GET'
const M_PATCH = 'PATCH'
const M_DELETE = 'DELETE'

function getTodosFromServer(url, options) {
  return fetch(`${url}${options}`)
    .then(response => response.json())
    .then(res => {
      return res
    })
}

function queryToServer(url, options, method, data) {
  return fetch(`${url}${options}`, {
    method: method,
    body: JSON.stringify(data),
    headers: {
      "Content-type": "application/json",
    }
  })
      .then(response => console.log(response))
}

let root = document.querySelector('.root')
const rootParent = root.parentElement

const filter_completed = 'completed'
const filter_active = 'active'
const filter_all = 'all'
const filterButtons = [{id: filter_all, title: 'All'}, {id: filter_active, title: 'Active'}, {id: filter_completed, title: 'Completed'}]

let newTodoInput = document.querySelector('.new-todo')

const CHANGE_STATUS_EVENT = 'change_status'
const SET_STATUS_EVENT = 'set_status'
const FILTER_TODOS_EVENT = 'filter_todos'
const CLEAR_COMPLETED_EVENT = 'clear_completed'
const ADD_TODO_EVENT = 'add_todo'
const REMOVE_TODO_EVENT = 'remove_todo'

class EventEmitter {
  constructor() {
    this.events = {};
  }

  /**
   * @param {string} eventName
   * @param {Function} callback
   */
  on(eventName, callback) {
    !this.events[eventName] && (this.events[eventName] = []);
    this.events[eventName].push(callback);
  }

  /**
   * @param {string} eventName
   * @param {Function} callback
   */
  off(eventName, callback) {
    this.events[eventName] = this.events[eventName].filter(eventCallback => callback !== eventCallback);
  }

  /**
   * @param {string} eventName
   * @param {any} args
   */
  emit(eventName, args) {
    const event = this.events[eventName];
    event && event.forEach(callback => callback.call(null, args));
  }
}

class Model {
  constructor() {
    this.filterBy = filter_all
    this.todos = []
  }

 async loadTodos() {
  await getTodosFromServer(API_URL, GET_TODOS_URL).then(result => {
    this.todos = result
  })

  }

  getTodosActive() {
    console.log(this.todos)
    return this.todos.filter(todo => !todo.completed)
  }

  getTodosCompleted() {
    return this.todos.filter(todo => todo.completed)
  }

  saveChanges(tasks) {
    localStorage.setItem('todos', JSON.stringify(tasks))
  }

  async getTodos() {
    // return localStorage.todos ? JSON.parse(localStorage.getItem('todos')) : []
  //   getTodosFromServer(API_URL, GET_TODOS_URL)
  //     .then(response => {
  //       return response
  //     })
  //     .catch(err => console.warn(err))
    await getTodosFromServer(API_URL, GET_TODOS_URL).then(result => {
      return result
    })
  }
}

class View {
  constructor(modelObj, emitterObj) {
    this.model = modelObj
    this.emitter = emitterObj
  }

  initMain() {
    const mainSection = document.createElement('section')
    mainSection.classList.add('main')
    mainSection.append(this.initToggleAll())
    mainSection.append(this.initTodos())

    return mainSection
  }

  initFooter() {
    const footerSection = document.createElement('footer')
    footerSection.classList.add('footer')
    footerSection.append(this.initFilters(filterButtons))

    if (this.model.getTodosActive().length) {
      footerSection.append(this.initActiveTodosCounter())
    }

    if (this.model.getTodosCompleted().length) {
      footerSection.append(this.initClearCompletedButton())
    }

    return footerSection
  }

  initToggleAll() {
    const toggleAllContainer = document.createElement('div')
    const toggleAllInput = document.createElement('input')
    toggleAllInput.setAttribute('id', 'toggle-all')
    toggleAllInput.setAttribute('type', 'checkbox')
    toggleAllInput.classList.add('toggle-all')
    this.model.getTodosActive().length === 0 ? toggleAllInput.setAttribute('checked', '') : ''
    toggleAllInput.addEventListener('click', (event) => {
      this.emitter.emit(CHANGE_STATUS_EVENT, (event.target.checked))
      this.render()
    })

    const toggleAllLabel = document.createElement('label')
    toggleAllLabel.setAttribute('for', 'toggle-all')

    toggleAllContainer.append(toggleAllInput)
    toggleAllContainer.append(toggleAllLabel)

    return toggleAllContainer
  }

  initFilters(filtersArr) {
    const filtersList = document.createElement('ul')
    filtersList.classList.add('filters')

    filtersArr.map(button => {
      const filterListItem = document.createElement('li')
      const filterButton = document.createElement('button')

      filterButton.setAttribute('type', 'button')
      filterButton.setAttribute('id', `${button.id}`)
      filterButton.addEventListener('click', () => {
        this.emitter.emit(FILTER_TODOS_EVENT, button.id)
        this.render()
      })

      filterButton.textContent = `${button.title}`
      this.model.filterBy === button.id ? filterButton.classList.add('selected') : ''

      filtersList.append(filterListItem)
      filterListItem.append(filterButton)
    })

    return filtersList
  }

  initActiveTodosCounter() {
    const counterText = this.model.getTodosActive().length === 1 ? '1 item left' : `${this.model.getTodosActive().length} items left`
    const activeTodoCounter = document.createElement('span')
    activeTodoCounter.classList.add('todo-count')
    activeTodoCounter.textContent = counterText

    return activeTodoCounter
  }

  initClearCompletedButton() {
    const clearCompletedButton = document.createElement('button')
    clearCompletedButton.classList.add('clear-completed')
    clearCompletedButton.addEventListener('click', () => {
      this.emitter.emit(CLEAR_COMPLETED_EVENT)
      this.render()
    })

    clearCompletedButton.textContent = 'Clear Completed'

    return clearCompletedButton
  }

  initTodos() {
    let tasks
    if (this.model.filterBy === filter_all) {
      tasks = this.model.todos
      console.log(tasks);
    }

    if (this.model.filterBy === filter_active) {
      tasks = this.model.getTodosActive()
    }

    if (this.model.filterBy === filter_completed) {
      tasks = this.model.getTodosCompleted()
    }

    const itemList = document.createElement('ul')
    itemList.classList.add('todo-list')

    tasks.map(todo => {
      const todoItem = document.createElement('li')
      todoItem.classList.add('todo-item')
      todoItem.setAttribute('id', `${todo._id}`)
      todo.completed ? todoItem.classList.add('completed') : ''

      const todoInput = document.createElement('input')
      todoInput.classList.add('toggle')
      todoInput.setAttribute('id', `todo-${todo._id}`)
      todoInput.setAttribute('type', 'checkbox')
      todoInput.addEventListener('click', () => {
        this.emitter.emit(SET_STATUS_EVENT, todo._id)
        this.render()
      })

      todo.completed ? todoInput.setAttribute('checked', '') : ''

      const todoLabel = document.createElement('label')
      todoLabel.setAttribute('for', `todo-${todo._id}`)
      todoLabel.textContent = `${todo.title}`

      const todoButton = document.createElement('button')
      todoButton.classList.add('destroy')
      todoButton.addEventListener('click', () => {
        this.emitter.emit(REMOVE_TODO_EVENT, todo._id)
        this.render()
      })

      todoItem.append(todoInput)
      todoItem.append(todoLabel)
      todoItem.append(todoButton)
      itemList.prepend(todoItem)
    })

    return itemList
  }



  addTodoHandler = (event) => {
    if (event.key !== 'Enter') {
      return
    }

    this.emitter.emit(ADD_TODO_EVENT, event.target.value)

    event.target.value = ''
    this.render()
  }

  async render() {
    debugger
    await this.model.loadTodos().then(res => {
      if (!this.model.todos.length) {
        return
      }
    })

    newTodoInput.addEventListener('keydown', this.addTodoHandler)

    root.remove()

    if (!this.model.todos.length) {
      return
    }

    root = document.createElement('div'),
    root.classList.add('root'),
    rootParent.append(root),

    root.append(this.initMain()),
    root.append(this.initFooter())
  }
}

class Controller {
  constructor(viewObj, modelObj, emitterObj) {
    this.view = viewObj
    this.model = modelObj
    this.emitter = emitterObj

    this.emitter.on(FILTER_TODOS_EVENT, (button) => this.filterTodos(button))
    this.emitter.on(CLEAR_COMPLETED_EVENT, () => this.clearCompleted())
    this.emitter.on(SET_STATUS_EVENT, (todo) => this.setStatus(todo))
    this.emitter.on(CHANGE_STATUS_EVENT, (bool) => this.changeStatuses(bool))
    this.emitter.on(ADD_TODO_EVENT, (value) => this.addTodo(value))
    this.emitter.on(REMOVE_TODO_EVENT, (id) => this.removeTodo(id))
  }

  addTodo(title) {
    const newTodoTitle = title.trim()
    let savedTodos = this.model.todos

    if (!newTodoTitle) {
      return
    }

    const id = +new Date()

    const newTodo = {
      id,
      title: newTodoTitle,
      completed: false,
    }

    savedTodos = [...savedTodos, newTodo]
    this.model.saveChanges(savedTodos)
  }

  removeTodo(todoId) {
    let savedTodos = this.model.todos
    savedTodos = savedTodos.filter(todo => todo.id !== todoId)
    this.model.saveChanges(savedTodos)
  }

  filterTodos(buttonId) {
    switch(buttonId) {
      case filter_all:
        this.model.filterBy  = filter_all
        break

      case filter_active:
        this.model.filterBy  = filter_active
        break

      case filter_completed:
        this.model.filterBy  = filter_completed
        break

      default:
        return
    }
  }

  clearCompleted() {
    const activeTodos = this.model.getTodosActive()
    this.model.saveChanges(activeTodos)
  }

  setStatus(todoId) {
    let savedTodos = this.model.todos
    const checkedTodo = savedTodos.find(todo => todo.id === todoId)
    checkedTodo.completed = !checkedTodo.completed
    this.model.saveChanges(savedTodos)
  }

  changeStatuses(checked) {
    let savedTodos = this.model.todos

    let changedTodos = savedTodos.map(todo => ({
      ...todo,
      completed: checked,
    }))

    this.model.saveChanges(changedTodos)
  }
}

const model = new Model()
const emitter = new EventEmitter()
const view = new View(model, emitter)
const controller = new Controller(view, model, emitter)

view.render()
