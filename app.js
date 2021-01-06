const todoDescription = document.querySelector(".todo-description");
const todoExpiration = document.querySelector(".todo-expiration");
const todoButton = document.querySelector(".todo-button");
const todoList = document.querySelector(".todo-list");

const modal = document.getElementById("myModal");
const confirm = document.querySelector(".confirm-button");
const cancel = document.querySelector(".cancel-button");

const timeRegex = new RegExp("^-.*$");

todoButton.addEventListener("click", addToDo);
todoList.addEventListener("click", deleteOrCheck);
todoDescription.addEventListener("change", function () {
  todoDescription.style.border = "none";
});
todoExpiration.addEventListener("change", function () {
  todoExpiration.style.border = "none";
});
cancel.addEventListener("click", function () {
  modal.style.display = "none";
});

window.onload = function () {
  let todos = JSON.parse(sessionStorage.getItem("todos"));

  todos = sort(todos);

  if (todos) todos.forEach((todo) => renderTodo(todo));
};

function calculateRemainingTime(date) {
  const now = new Date().getTime();
  const timeleft = new Date(date).getTime() - now;

  const days = Math.floor(timeleft / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
  return `${days}d ${hours}h ${minutes + 1}m`;
}

function renderTodo({ description, expirationDate, checkedAt }) {
  const todoDiv = document.createElement("div");
  todoDiv.classList.add("todo");
  const newTodo = document.createElement("li");
  newTodo.innerText = description;
  newTodo.classList.add("todo-item");

  todoDiv.appendChild(newTodo);
  if (expirationDate) {
    const expiration = document.createElement("p");
    const remainingTime = calculateRemainingTime(expirationDate);
    if (timeRegex.test(remainingTime)) {
      expiration.innerText = "Expired.";
    } else expiration.innerText = remainingTime;

    expiration.classList.add("todo-expiration");
    todoDiv.appendChild(expiration);
  }

  if (checkedAt) todoDiv.classList.toggle("completed");

  const completedButton = document.createElement("button");
  completedButton.innerHTML = '<i class="fas fa-check"></i>';
  completedButton.classList.add("complete-btn");
  todoDiv.appendChild(completedButton);

  const trashButton = document.createElement("button");
  trashButton.innerHTML = '<i class="fas fa-trash"></i>';
  trashButton.classList.add("trash-btn");
  todoDiv.appendChild(trashButton);

  todoList.appendChild(todoDiv);
}

function addToDo(e) {
  e.preventDefault();
  let todos = JSON.parse(sessionStorage.getItem("todos") || "[]");

  if (todoDescription.value.trim() === "") {
    todoDescription.style.border = "1px solid red";
    alert("Task description is required.");
  } else if (new Date(todoExpiration.value) <= new Date()) {
    todoExpiration.style.border = "1px solid red";
    alert("You cannot set the deadline in reverse date.");
  } else if (todos.find((item) => item.description === todoDescription.value)) {
    todoDescription.style.border = "1px solid red";
    alert("This task already exists.");
  } else {
    todos.push({
      description: todoDescription.value,
      expirationDate:
        todoExpiration.value.trim() !== "" ? todoExpiration.value : null,
      checkedAt: null,
    });
    sessionStorage.setItem("todos", JSON.stringify(todos));

    rerenderList(todos);

    todoDescription.value = "";
    todoExpiration.value = "";
  }
}

function rerenderList(todos) {
  while (todoList.firstChild) todoList.removeChild(todoList.firstChild);
  todos = sort(todos);
  todos.forEach((todo) => renderTodo(todo));
}

function deleteOrCheck(e) {
  let todos = JSON.parse(sessionStorage.getItem("todos"));
  const item = e.target;

  if (item.classList[0] === "trash-btn") {
    modal.style.display = "block";
    confirm.addEventListener("click", function () {
      const todo = item.parentElement;
      let updatedTodos = todos.filter(
        (item) => item.description !== todo.childNodes[0].innerText
      );
      sessionStorage.setItem("todos", JSON.stringify(updatedTodos));

      rerenderList(updatedTodos);

      modal.style.display = "none";
    });
  } else if (item.classList[0] === "complete-btn") {
    const todo = item.parentElement;

    let updatedTodos = todos.filter((item) => {
      if (item.description === todo.childNodes[0].innerText) {
        if (item.checkedAt) item.checkedAt = null;
        else {
          let date = new Date();
          date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
          item.checkedAt = date.toISOString().slice(0, 16);
        }
      }
      return item;
    });

    sessionStorage.setItem("todos", JSON.stringify(updatedTodos));
    todo.classList.toggle("completed");

    rerenderList(updatedTodos);
  }
}

function sort(items) {
  const checkedAtSorted = items.filter((item) => {
    return item.checkedAt !== null;
  });
  const expirationDateSorted = items.filter((item) => {
    return item.expirationDate !== null && item.checkedAt === null;
  });
  const theOtherHalf = items.filter((item) => {
    return item.expirationDate === null && item.checkedAt === null;
  });
  return checkedAtSorted.concat(expirationDateSorted).concat(theOtherHalf);
}
