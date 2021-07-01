'use strict'

let root = document.querySelector('.root')
const rootParent = root.parentElement
const filterButtons = [{id: 'all', title: 'All'}, {id: 'active', title: 'Active'}, {id: 'completed', title: 'Completed'}]

let newTodoInput = document.querySelector('.new-todo')

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
  unsubscribe(eventName, callback) {
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
    this.savedTodos = localStorage.todos ? this.getTodos() : []
    this.filterBy = 'all'
  }

  saveChanges(todos) {
    localStorage.setItem('todos', JSON.stringify(todos))
  }

  getTodos() {
    return JSON.parse(localStorage.getItem('todos'))
  }

  addTodo(event) {
    const newTodoTitle = event.target.value.trim()

    if (!newTodoTitle) {
      return
    }

    const id = +new Date()

    const newTodo = {
      id,
      title: newTodoTitle,
      completed: false,
    }

    this.savedTodos.push(newTodo)
    this.saveChanges(this.savedTodos)

    event.target.value = ''
  }

  removeTodo(todoId) {
    this.savedTodos = this.savedTodos.filter(todo => todo.id !== todoId)
    this.saveChanges(this.savedTodos)
  }
}

class View {
  constructor(modelObj, emitterObj) {
    this.model = modelObj
    this.emitter = emitterObj

    this.todos = modelObj.savedTodos

    this.todosActive = this.todos.filter(todo => !todo.completed)
    this.todosCompleted = this.todos.filter(todo => todo.completed)
  }

  render() {
    newTodoInput.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') {
        return
      }

      this.model.addTodo(event)

      this.render()
    })

    if (!this.todos.length) {
      return
    }

    root.remove()

    root = document.createElement('div')
    root.classList.add('root')
    rootParent.append(root)

    root.append(this.initMain())
    root.append(this.initFooter())
  }

   initMain() {
    console.log('init main');

    const mainSection = document.createElement('section')
    mainSection.classList.add('main')
    mainSection.append(this.initToggleAll())
    mainSection.append(this.initTodos())

    return mainSection
  }

  initFooter() {
    console.log('init footer');

    const footerSection = document.createElement('footer')
    footerSection.classList.add('footer')
    footerSection.append(this.initFilters(filterButtons))

    if (this.todosActive.length) {
      footerSection.append(this.initActiveTodosCounter())
    }

    if (this.todosCompleted.length) {
      footerSection.append(this.initClearCompletedButton())
    }

    return footerSection
  }

  initToggleAll() {
    console.log('init toggler');

    const toggleAllContainer = document.createElement('div')
    const toggleAllInput = document.createElement('input')
    toggleAllInput.setAttribute('id', 'toggle-all')
    toggleAllInput.setAttribute('type', 'checkbox')
    toggleAllInput.classList.add('toggle-all')
    this.todosActive.length === 0 ? toggleAllInput.setAttribute('checked', '') : ''
    toggleAllInput.addEventListener('click', (event) => {
      this.emitter.on('changeStatuses()', event)
      // this.controller.changeStatuses(event)
      this.model.saveChanges(this.todos)
      // this.render()
    })

    const toggleAllLabel = document.createElement('label')
    toggleAllLabel.setAttribute('for', 'toggle-all')

    toggleAllContainer.append(toggleAllInput)
    toggleAllContainer.append(toggleAllLabel)

    return toggleAllContainer
  }

  initFilters(filtersArr) {
    console.log('init filters');

    const filtersList = document.createElement('ul')
    filtersList.classList.add('filters')

    filtersArr.map(button => {
      const filterListItem = document.createElement('li')
      const filterButton = document.createElement('button')

      filterButton.setAttribute('type', 'button')
      filterButton.setAttribute('id', `${button.id}`)
      filterButton.addEventListener('click', () => {
        this.controller.filterTodos(button.id)

        // this.render()
      })

      filterButton.textContent = `${button.title}`
      this.model.filterBy === button.id ? filterButton.classList.add('selected') : ''

      filtersList.append(filterListItem)
      filterListItem.append(filterButton)
    })

    return filtersList
  }

  initActiveTodosCounter() {
    console.log('init counter');

    const counterText = this.todosActive.length === 1 ? '1 item left' : `${this.todosActive.length} items left`
    const activeTodoCounter = document.createElement('span')
    activeTodoCounter.classList.add('todo-count')
    activeTodoCounter.textContent = counterText

    return activeTodoCounter
  }

  initClearCompletedButton() {
    console.log('init clear button');

    const clearCompletedButton = document.createElement('button')
    clearCompletedButton.classList.add('clear-completed')
    clearCompletedButton.addEventListener('click', () => {
      this.controller.clearCompleted()

      // this.render()
    })

    clearCompletedButton.textContent = 'Clear Completed'

    return clearCompletedButton
  }

  initTodos() {
    console.log('init todo list');

    const itemList = document.createElement('ul')
    itemList.classList.add('todo-list')

    this.todos.map(todo => {
      const todoItem = document.createElement('li')
      todoItem.classList.add('todo-item')
      todoItem.setAttribute('id', `${todo.id}`)
      todo.completed ? todoItem.classList.add('completed') : ''

      const todoInput = document.createElement('input')
      todoInput.classList.add('toggle')
      todoInput.setAttribute('id', `todo-${todo.id}`)
      todoInput.setAttribute('type', 'checkbox')
      todoInput.addEventListener('click', () => {
        this.controller.setStatus(todo.id)

        // this.render()
      })

      todo.completed ? todoInput.setAttribute('checked', '') : ''

      const todoLabel = document.createElement('label')
      todoLabel.setAttribute('for', `todo-${todo.id}`)
      todoLabel.textContent = `${todo.title}`

      const todoButton = document.createElement('button')
      todoButton.classList.add('destroy')
      todoButton.addEventListener('click', () => {
        this.model.removeTodo(todo.id)

        // this.render()
      })

      todoItem.append(todoInput)
      todoItem.append(todoLabel)
      todoItem.append(todoButton)
      itemList.append(todoItem)
    })

    return itemList
  }
}

class Controller {
  constructor(viewObj) {
    this.view = viewObj

    this.todosToRender = this.view.todos
  }

  filterTodos(buttonId) {
    switch(buttonId) {
      case 'all':
        this.filterBy  = 'all'
        this.todosToRender = this.view.todos
        break

      case 'active':
        this.filterBy  = 'active'
        this.todosToRender = this.todosToRender.filter(todo => !todo.completed)
        break

      case 'completed':
        this.filterBy  = 'completed'
        this.todosToRender = this.todosToRender.filter(todo => todo.completed)
        break

      default:
        return
    }
  }

  clearCompleted() {
    this.todosToRender = this.todosToRender.filter(todo => !todo.completed)
    // this.model.saveChanges()
  }

  setStatus(todoId) {
    const checkedTodo = this.savedTodos.find(todo => todo.id === todoId)

    checkedTodo.completed = !checkedTodo.completed
    // this.model.saveChanges()
  }

  changeStatuses(event) {
    this.todosToRender.map(todo => todo.completed = event.target.checked)
  }
}

const model = new Model()
const emitter = new EventEmitter()
const view = new View(model, emitter)
const controller = new Controller(view)

view.render()
