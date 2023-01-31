// Seleção de elementos
const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const editForm = document.querySelector("#edit-form");
const editId = document.querySelector("#edit-id");
const editInput = document.querySelector("#edit-input");
const toolbarDiv = document.querySelector("#toolbar");
const cancelEditBtn = document.querySelector("#cancel-edit-btn");
const searchInput = document.querySelector("#search-input");
const eraseBtn = document.querySelector("#erase-button");
const filterDropdown = document.querySelector("#filter-select");

let oldInputValue;

// Funções
const loadTodo = (id, text, completed = 0) => {
    const todo = document.createElement("div")
    todo.classList.add("todo")

    const itemId = document.createElement("input")
    itemId.classList.add("todo-id")
    itemId.setAttribute("type", "hidden");
    itemId.value = id
    todo.appendChild(itemId)

    const itemCompleted = document.createElement("input")
    itemCompleted.classList.add("todo-completed")
    itemCompleted.setAttribute("type", "hidden");
    itemCompleted.value = completed
    todo.appendChild(itemCompleted)

    const title = document.createElement("h3")
    title.innerText = text
    todo.appendChild(title)

    const finishBtn = document.createElement("button")
    finishBtn.classList.add("finish-todo")
    finishBtn.innerHTML = '<i class="fa-solid fa-check"></i>'
    todo.appendChild(finishBtn)

    const editBtn = document.createElement("button")
    editBtn.classList.add("edit-todo")
    editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>'
    todo.appendChild(editBtn)

    const removeBtn = document.createElement("button")
    removeBtn.classList.add("remove-todo")
    removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>'
    todo.appendChild(removeBtn)

    // Utilizando dados da API
    if (completed) {
        todo.classList.add("done");
    }

    todoList.appendChild(todo)

    todoInput.value = ''
    todoInput.focus()
}

const updateTodo = (newTodo) => {

    const todos = document.querySelectorAll(".todo")

    todos.forEach((todo) => {
        let todoTitle = todo.querySelector("h3")

        if(todoTitle.innerText === oldInputValue) {
            todoTitle.innerText = newTodo
        }
    })

}

const getSearchedTodos = (search) => {
    const todos = document.querySelectorAll(".todo");
  
    todos.forEach((todo) => {
      const todoTitle = todo.querySelector("h3").innerText.toLowerCase();
  
      todo.style.display = "flex";
  
      if (!todoTitle.includes(search)) {
        todo.style.display = "none";
      }
    });
  };

const filterTodos = (filterValue) => {
    const todos = document.querySelectorAll(".todo");
  
    switch (filterValue) {
      case "all":
        todos.forEach((todo) => (todo.style.display = "flex"));
  
        break;
  
      case "done":
        todos.forEach((todo) =>
          todo.classList.contains("done")
            ? (todo.style.display = "flex")
            : (todo.style.display = "none")
        );
  
        break;
  
      case "todo":
        todos.forEach((todo) =>
          !todo.classList.contains("done")
            ? (todo.style.display = "flex")
            : (todo.style.display = "none")
        );
  
        break;
  
      default:
        break;
    }
  };

const toggleForms = () => {
    editForm.classList.toggle("hide")
    todoForm.classList.toggle("hide")
    todoList.classList.toggle("hide")
    toolbarDiv.classList.toggle("hide")
}

// Eventos
todoForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const inputValue = todoInput.value

    if(inputValue) {
        saveTodoAPI({ title: inputValue.trim() })
    }
})

document.addEventListener("click", (e) => {
    const targetElement = e.target
    const parentElement = targetElement.closest("div")
    let todoTitle, todoId, todoCompleted;

    if(parentElement && parentElement.querySelector("h3")){
        todoTitle = parentElement.querySelector("h3").innerText
        todoId = parentElement.querySelector(".todo-id").value
        todoCompleted = parentElement.querySelector(".todo-completed").value
        //console.log(todoCompleted)
    }

    if(targetElement.classList.contains("finish-todo")) {
        parentElement.classList.toggle("done")
        let isCompleted = todoCompleted == 0 ? 1 : 0
        parentElement.querySelector(".todo-completed").value = isCompleted
        updateTodoStatusAPI(todoId, isCompleted)
    }
    
    if(targetElement.classList.contains("edit-todo")) {
        toggleForms()

        editId.value = todoId
        editInput.value = todoTitle
        oldInputValue = todoTitle
    }
    
    if(targetElement.classList.contains("remove-todo")) {
        parentElement.remove()

        // Utilizando dados da API
        removeTodoAPI(todoId);
    }
})

cancelEditBtn.addEventListener("click", (e) => {
    e.preventDefault()

    toggleForms();
})

editForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const editIdValue = editId.value
    const editInputValue = editInput.value

    if(editInputValue) {
        updateTodo(editInputValue)
        updateTodoTitleAPI(editIdValue, editInputValue)
    }

    toggleForms()
})

searchInput.addEventListener("keyup", (e) => {
    const search = e.target.value;

    getSearchedTodos(search);
})

eraseBtn.addEventListener("click", (e) => {
    e.preventDefault();

    searchInput.value = "";

    searchInput.dispatchEvent(new Event("keyup"));
})

filterDropdown.addEventListener("change", (e) => {
    const filterValue = e.target.value;

    filterTodos(filterValue)
})

// API
const getTodosAPI = async () => {
    const APIResponse = await fetch("http://localhost:3333/to-do-items")
    
    if(APIResponse.status == 200){
        todos = await APIResponse.json()
        return todos
    }

};

const getTodoById = async (todoId) => {
    const APIResponse = await fetch(`http://localhost:3333/to-do-items/${todoId}`)
    
    if(APIResponse.status == 200){
        todo = await APIResponse.json()
        //console.log(todo)

        return todo
    }
}

const loadTodoById = async (todoId) => {
    const todo = await getTodoById(todoId)

    loadTodo(todo.id, todo.title, todo.completed, 0)
}
  
const loadTodos = async () => {
    const todos = await getTodosAPI();

    todos.forEach(todo => {
        loadTodoById(todo.id)
    });
};

const saveTodoAPI = async (newTodo) => {
    const todos = document.querySelectorAll(".todo")

    for(let item = 0; item < todos.length; item++){
        
        if(newTodo.title === todos[item].querySelector('h3').innerHTML){
            
            //isValid = false
            alert("Tarefa já existe")
            return
        }
    }

    const response = await fetch('http://localhost:3333/to-do-items', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }, 
        
        body: JSON.stringify(newTodo)
    })

    if(response.ok){
        const json = await response.json()

        loadTodoById(json.id)
    }
    
};
  
const removeTodoAPI = async (todoId) => {
    fetch(`http://localhost:3333/to-do-items/${todoId}`, { 
        method: 'DELETE' 
    })//.then(() => console.log('deleted'))
}

const updateTodoStatusAPI = async (todoId, todoCompleted) => {
    const response = await fetch(`http://localhost:3333/to-do-items/${todoId}?situation=${todoCompleted}`, {
        method: 'PATCH',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }, 
        
        body: JSON.stringify({ id: todoId, completed: todoCompleted } )
    })

    if(response.ok){
        //const json = await response.json()
        //console.log('updated')
        //loadTodoById(json.id)
    }
}

const updateTodoTitleAPI = async (todoId, todoTitle) => {
    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: todoId, title: todoTitle } )
    };
    
    const response = await fetch(`http://localhost:3333/to-do-items/${todoId}`, requestOptions);

    if(response.ok){
        //const json = await response.json()
        //console.log('updated')
        //loadTodoById(json.id)
    }
}

  
loadTodos();

const randomBackground = () => {
    bgImages = [
        'url("../img/desk1.jpg")',
        'url("../img/desk2.jpg")',
        'url("../img/desk3.jpg")'
    ]

    document.body.style.backgroundImage = bgImages[Math.floor(Math.random() * 3)]
}