const fortunes = [
  "If you win, you live. If you lose, you die. If you don't fight, you can't win! - Eren Yeager",
  "My Soldiers Push Forward, My Soldiers Scream Out, My Soldiers Rage - Erwin Smith",
  "Part of the journey is the end. - Tony Stark",
  "Whatever it takes. - Steve Rogers",
  "Power is only given to those who are prepared to lower themselves to pick it up. - King Ragnar",
  "Don't waste your time looking back. You're not going that way. - King Ragnar",
  "I am not in danger. I am the danger. - Walter White",
  "It's easier to stay awake till 6 AM than to wake up at 6 AM",
  "What we know is just a drop, What we don't know is an ocean - Jonas (Dark)",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt"
];

// Complete style sets for each button
const styleThemes = {
  theme1: {
    fontColor: "#e74c3c",
    backgroundColor: "#fdebd0",
    borderColor: "#c0392b",
    fontFamily: "Georgia",
    fontSize: "30px"
  },
  theme2: {
    fontColor: "#27ae60",
    backgroundColor: "#e8f5e8",
    borderColor: "#16a085",
    fontFamily: "Arial",
    fontSize: "32px"
  },
  theme3: {
    fontColor: "#9b59b6",
    backgroundColor: "#f4e6ff",
    borderColor: "#8e44ad",
    fontFamily: "Times New Roman",
    fontSize: "28px"
  },
  theme4: {
    fontColor: "#f39c12",
    backgroundColor: "#fff3cd",
    borderColor: "#d68910",
    fontFamily: "Verdana",
    fontSize: "26px"
  }
};

function displayRandomFortune() {
  const fortuneText = document.getElementById("fortune-text");
  if (fortuneText) {
    const randomIndex = Math.floor(Math.random() * fortunes.length);
    fortuneText.textContent = fortunes[randomIndex];
    console.log("Random fortune", fortunes[randomIndex]);
  }
}

// Button 1: Apply Theme 1 (Red/Warm theme)
function applyTheme1() {
  const fortuneText = document.getElementById("fortune-text");
  const fortuneBox = document.getElementById("fortune-box");
  const theme = styleThemes.theme1;
  
  if (fortuneText && fortuneBox) {
    // Apply all styles at once
    fortuneText.style.color = theme.fontColor;
    fortuneText.style.fontFamily = theme.fontFamily;
    fortuneText.style.fontSize = theme.fontSize;
    fortuneBox.style.backgroundColor = theme.backgroundColor;
    fortuneBox.style.borderColor = theme.borderColor;
    
    console.log("Theme 1 applied - Red/Warm theme");
  }
}

// Button 2: Apply Theme 2 (Green/Nature theme)
function applyTheme2() {
  const fortuneText = document.getElementById("fortune-text");
  const fortuneBox = document.getElementById("fortune-box");
  const theme = styleThemes.theme2;
  
  if (fortuneText && fortuneBox) {
    // Apply all styles at once
    fortuneText.style.color = theme.fontColor;
    fortuneText.style.fontFamily = theme.fontFamily;
    fortuneText.style.fontSize = theme.fontSize;
    fortuneBox.style.backgroundColor = theme.backgroundColor;
    fortuneBox.style.borderColor = theme.borderColor;
    
    console.log("Theme 2 applied - Green/Nature theme");
  }
}

// Button 3: Apply Theme 3 (Purple/Royal theme)
function applyTheme3() {
  const fortuneText = document.getElementById("fortune-text");
  const fortuneBox = document.getElementById("fortune-box");
  const theme = styleThemes.theme3;
  
  if (fortuneText && fortuneBox) {
    // Apply all styles at once
    fortuneText.style.color = theme.fontColor;
    fortuneText.style.fontFamily = theme.fontFamily;
    fortuneText.style.fontSize = theme.fontSize;
    fortuneBox.style.backgroundColor = theme.backgroundColor;
    fortuneBox.style.borderColor = theme.borderColor;
    
    console.log("Theme 3 applied - Purple/Royal theme");
  }
}

// Button 4: Apply Theme 4 (Orange/Golden theme)
function applyTheme4() {
  const fortuneText = document.getElementById("fortune-text");
  const fortuneBox = document.getElementById("fortune-box");
  const theme = styleThemes.theme4;
  
  if (fortuneText && fortuneBox) {
    // Apply all styles at once
    fortuneText.style.color = theme.fontColor;
    fortuneText.style.fontFamily = theme.fontFamily;
    fortuneText.style.fontSize = theme.fontSize;
    fortuneBox.style.backgroundColor = theme.backgroundColor;
    fortuneBox.style.borderColor = theme.borderColor;
    
    console.log("Theme 4 applied - Orange/Golden theme");
  }
}

// STOPWATCH SECTION
// Stopwatch state variables
let time = 0;
let interval = null;
let isRunning = false;
const maxTime = 30;
const increment = 1;

// Start the stopwatch
function startStopwatch() {
  time = 0;
  updateStopwatchDisplay();
  if (!isRunning && time < maxTime) {
    isRunning = true;
    interval = setInterval(() => {
      time += 3;
      updateStopwatchDisplay();

      //Stop after 30 seconds
      if (time >= maxTime) {
        stopStopwatch();
        alert("30 seconds! Hoye Gechee");
      }
    }, increment * 1000); // 3000ms = 3 seconds
    updateStopwatchButtons();
  }
}

// Stop/pause
function stopStopwatch() {
  if (isRunning) {
    isRunning = false;

    clearInterval(interval);
    interval = null;

    updateStopwatchButtons();
  }
}

// Reset to 0
function resetStopwatch() {
  stopStopwatch();
  time = 0;
  updateStopwatchDisplay();
  updateStopwatchButtons();
}

// Update the stopwatch display
function updateStopwatchDisplay() {
  const display = document.getElementById("stopwatch-display");
  if (display) {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    display.textContent = `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
}

// Update button states on stopwatch status
function updateStopwatchButtons() {
  const startBtn = document.getElementById("start-btn");
  const stopBtn = document.getElementById("stop-btn");
  const resetBtn = document.getElementById("reset-btn");

  if (startBtn && stopBtn && resetBtn) {
    // Disable start when running or at max time
    startBtn.disabled = isRunning || time >= maxTime;
    // Disable stop when not running
    stopBtn.disabled = !isRunning;
    // Reset always enabled
    resetBtn.disabled = false;
  }
}

// TODOSECTION
// Todo list state variables
let todos = [];
let todoIdCounter = 1;

// Add a new todo item
function addTodo() {
  const todoInput = document.getElementById("todo-input");
  const text = todoInput.value.trim();

  if (text === "") {
    alert("Please enter a task!");
    return;
  }

  if (text.length > 100) {
    alert("Task is too long! Keep under 100 characters.");
    return;
  }

  const newTodo = {
    id: todoIdCounter++,
    text: text,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  todos.push(newTodo);
  todoInput.value = "";
  saveTodosToStorage();
  renderTodos(); //auto relod
}

// Delete a todo with id
function deleteTodo(id) {
  const index = todos.findIndex((i) => i.id === id);
  if (index !== -1) {
    // painai
    const deletedTodo = todos.splice(index, 1)[0];
    saveTodosToStorage(); // Save to local
    renderTodos();
    console.log("Todo deleted:", deletedTodo);
  }
}

// Toggle todo completion status
function toggleTodo(id) {
  const todo = todos.find((todo) => todo.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodosToStorage();
    renderTodos();
    console.log("Todo Select/Unselect:", todo);
  }
}

// Clear all todos
function clearAllTodos() {
  if (todos.length === 0) {
    alert("Task naai !!");
    return;
  }

  if (confirm("You sure??")) {
    todos = [];
    saveTodosToStorage();
    renderTodos();
    console.log("All tasks cleared");
  }
}

// Render all todos
function renderTodos() {
  const todoList = document.getElementById("todo-list");
  if (!todoList) return;
  todoList.innerHTML = "";
  if (todos.length === 0) {
    todoList.innerHTML = `
      <div class="no-todos">
        <p>No tasks yet. Add one above!</p>
      </div>
    `;
    updateTodoStats();
    return;
  }

  todos.forEach((todo) => {
    const todoItem = createTodoElement(todo);
    todoList.appendChild(todoItem);
  });

  updateTodoStats();
}

// HTML element for a single todo item
function createTodoElement(todo) {
  const todoItem = document.createElement("div");
  todoItem.className = `todo-item ${todo.completed ? "completed" : ""}`;
  todoItem.dataset.id = todo.id;

  // HTML XSS (stack overfollow solve)
  const escapeHtml = (text) => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  todoItem.innerHTML = `
    <div class="todo-content">
      <input type="checkbox" class="todo-checkbox" ${
        todo.completed ? "checked" : ""
      }>
      <span class="todo-text">${escapeHtml(todo.text)}</span>
    </div>
    <div class="todo-actions">
      <button class="delete-btn" title="Delete task">Delete</button>
    </div>
  `;

  // Add event listeners
  const checkbox = todoItem.querySelector(".todo-checkbox");
  const deleteBtn = todoItem.querySelector(".delete-btn");

  checkbox.addEventListener("change", () =>
    toggleTodo(Number(todoItem.dataset.id))
  );
  deleteBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTodo(Number(todoItem.dataset.id));
    }
  });

  return todoItem;
}

// Update todo statistics display
function updateTodoStats() {
  const totalTodos = todos.length;
  const completedTodos = todos.filter((todo) => todo.completed).length;
  const pendingTodos = totalTodos - completedTodos;

  const statsElement = document.getElementById("todo-stats");
  if (statsElement) {
    statsElement.innerHTML = `
      <span>Total: ${totalTodos}</span>
      <span>Completed: ${completedTodos}</span>
      <span>Pending: ${pendingTodos}</span>
    `;
  }
}

// Save todos to localStorage
function saveTodosToStorage() {
  try {
    const data = {
      todos: todos,
      nextId: todoIdCounter,
      lastSaved: new Date().toISOString(),
    };
    localStorage.setItem("todos", JSON.stringify(data));
    console.log("Todos saved to localStorage:", todos.length, "items");
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    alert("Error saving data");
  }
}

// Load todos from localStorage
function loadTodosFromStorage() {
  try {
    const data = localStorage.getItem("todos");
    if (data) {
      const parsed = JSON.parse(data);
      todos = parsed.todos || [];
      todoIdCounter = parsed.nextId || 1;
      console.log(todos.length, "items");

      if (parsed.lastSaved) {
        console.log("last saved:", new Date(parsed.lastSaved).toLocaleString());
      }
    } else {
      console.log("No todos found in local");
    }
  } catch (error) {
    console.error("Errorfrom localStorage:", error);
    todos = [];
    todoIdCounter = 1;
  }
}

// INITIALIZATION SECTION

function initializeComponents() {
  console.log("hellobhai");
  displayRandomFortune();
  const fontColorBtn = document.getElementById("font-color-btn");
  const bgColorBtn = document.getElementById("bg-color-btn");
  const borderColorBtn = document.getElementById("border-color-btn");
  const fontStyleBtn = document.getElementById("font-style-btn");

  // Updated Fortune Generator Button Connections
  if (fontColorBtn) {
    fontColorBtn.addEventListener("click", applyTheme1);
    console.log("Theme 1 button connected");
  }
  if (bgColorBtn) {
    bgColorBtn.addEventListener("click", applyTheme2);
    console.log("Theme 2 button connected");
  }
  if (borderColorBtn) {
    borderColorBtn.addEventListener("click", applyTheme3);
    console.log("Theme 3 button connected");
  }
  if (fontStyleBtn) {
    fontStyleBtn.addEventListener("click", applyTheme4);
    console.log("Theme 4 button connected");
  }

  // Initialize Stopwatch
  updateStopwatchDisplay();
  updateStopwatchButtons();

  // Connect Stopwatch buttons
  const startBtn = document.getElementById("start-btn");
  const stopBtn = document.getElementById("stop-btn");
  const resetBtn = document.getElementById("reset-btn");

  if (startBtn) {
    startBtn.addEventListener("click", startStopwatch);
    console.log("Start button connected");
  }
  if (stopBtn) {
    stopBtn.addEventListener("click", stopStopwatch);
    console.log("Stop button connected");
  }
  if (resetBtn) {
    resetBtn.addEventListener("click", resetStopwatch);
    console.log("Reset button connected");
  }

  // Initialize Todo List
  loadTodosFromStorage(); // Load saved data
  renderTodos();

  // Connect Todo List controls
  const addTodoBtn = document.getElementById("add-todo-btn");
  const todoInput = document.getElementById("todo-input");
  const clearAllBtn = document.getElementById("clear-all-btn");

  if (addTodoBtn) {
    addTodoBtn.addEventListener("click", addTodo);
    console.log("Add todo button connected");
  }
  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", clearAllTodos);
    console.log("Clear all button connected");
  }

  // Allow adding todos with Enter key
  if (todoInput) {
    todoInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        addTodo();
      }
    });
    console.log("Todo input keypress event connected");
  }

  console.log("All components successfully initialized!");
}

// APPLICATION STARTUP
// Start the application when DOM is fully loaded

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded -Assignment...");
  initializeComponents();
  console.log("Application ready");
});