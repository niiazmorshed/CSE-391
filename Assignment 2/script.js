const fortunes = [
  "If you win, you live. If you lose, you die. If you don't fight, you can't win! - Eren Yeager",
  "My Soulders Push Forward, My Soulders Scream Out, My Soulders Rage - Erwin Smith",
  "Part of the journey is the end. - Tony Stark",
  "Whatever it takes. - Steve Rogers",
  "Power is only given to those who are prepared to lower themselves to pick it up. - King Ragnar",
  "Don't waste your time looking back. You're not going that way. - King Ragnar",
  "I am not in danger. I am the danger. - Walter White",
  "It's easier to stay awake till 6 AM than to wake up at 6 AM",
  "What we know is just a drop, What we don't know is an ocean -Jonas (Dark)"
  
];

// Display a random fortune when page loads
function displayRandomFortune() {
  const fortuneText = document.getElementById("fortune-text");
  if (fortuneText) {
    const randomIndex = Math.floor(Math.random() * fortunes.length);
    fortuneText.textContent = fortunes[randomIndex];
    console.log(
      "Random fortune displayed on page load:",
      fortunes[randomIndex]
    );
  }
}

// Button 1: Change fortune text color randomly
function changeFontColor() {
  const fortuneText = document.getElementById("fortune-text");
  const colors = [
    "#fd6e0a",
    "#2c3e50",
    "#e74c3c",
    "#27ae60",
    "#9b59b6",
    "#f39c12",
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  fortuneText.style.color = randomColor;
  console.log("Font color changed to:", randomColor);
}

// Button 2: Change fortune box background color randomly
function changeBackgroundColor() {
  const fortuneBox = document.getElementById("fortune-box");
  const colors = [
    "#fff8f3",
    "#ecf0f1",
    "#fdebd0",
    "#e8f5e8",
    "#f4e6ff",
    "#fff3cd",
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  fortuneBox.style.backgroundColor = randomColor;
  console.log("Background color changed to:", randomColor);
}

// Button 3: Change fortune box border color randomly
function changeBorderColor() {
  const fortuneBox = document.getElementById("fortune-box");
  const colors = [
    "#fd6e0a",
    "#34495e",
    "#c0392b",
    "#16a085",
    "#8e44ad",
    "#f39c12",
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  fortuneBox.style.borderColor = randomColor;
  console.log("Border color changed to:", randomColor);
}

// Button 4: Change font family and size slightly
function changeFontStyle() {
  const fortuneText = document.getElementById("fortune-text");
  const fonts = [
    { family: "Roboto", size: "28px" },
    { family: "Georgia", size: "26px" },
    { family: "Arial", size: "30px" },
    { family: "Times New Roman", size: "27px" },
    { family: "Verdana", size: "25px" },
    { family: "Courier New", size: "24px" },
  ];
  const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
  fortuneText.style.fontFamily = randomFont.family;
  fortuneText.style.fontSize = randomFont.size;
  console.log("Font style changed to:", randomFont.family, randomFont.size);
}

// STOPWATCH SECTION
// Stopwatch state variables
let time = 0;
let interval = null;
let isRunning = false;
const maxTime = 30;
const increment = 3;

// Start the stopwatch
function startStopwatch() {
  if (!isRunning && time < maxTime) {
    isRunning = true;
    interval = setInterval(() => {
      time += increment;
      updateStopwatchDisplay();
      console.log("Stopwatch time:", time, "seconds");

      // Auto-stop at 30 seconds
      if (time >= maxTime) {
        stopStopwatch();
        alert("Stopwatch automatically stopped at 30 seconds!");
        console.log("Stopwatch automatically stopped at 30 seconds");
      }
    }, increment * 1000); // 3000ms = 3 seconds
    console.log("Stopwatch started");
    updateStopwatchButtons();
  }
}

// Stop/pause the stopwatch
function stopStopwatch() {
  if (isRunning) {
    isRunning = false;
    clearInterval(interval);
    interval = null;
    console.log("Stopwatch stopped at:", time, "seconds");
    updateStopwatchButtons();
  }
}

// Reset the stopwatch to 0
function resetStopwatch() {
  stopStopwatch();
  time = 0;
  updateStopwatchDisplay();
  console.log("Stopwatch reset to 0");
  updateStopwatchButtons();
}

// Update the stopwatch display (MM:SS format)
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

// TODO LIST SECTION
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
    alert("Task is too long! Please keep it under 100 characters.");
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
  renderTodos();
  console.log("Todo added:", newTodo);
}

// Delete a todo item by ID
function deleteTodo(id) {
  const index = todos.findIndex((todo) => todo.id === id);
  if (index !== -1) {
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
    saveTodosToStorage(); // Save to localStorage
    renderTodos();
    console.log("Todo toggled:", todo);
  }
}

// Clear all todos with confirmation
function clearAllTodos() {
  if (todos.length === 0) {
    alert("No tasks to clear!");
    return;
  }

  if (confirm("Are you sure you want to delete all tasks?")) {
    todos = [];
    saveTodosToStorage(); // Save to localStorage
    renderTodos();
    console.log("All tasks cleared");
  }
}

// Render all todos to the DOM
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

// Create HTML element for a single todo item
function createTodoElement(todo) {
  const todoItem = document.createElement("div");
  todoItem.className = `todo-item ${todo.completed ? "completed" : ""}`;
  todoItem.dataset.id = todo.id;

  // Escape HTML to prevent XSS attacks
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
      console.log("Todos loaded from localStorage:", todos.length, "items");

      if (parsed.lastSaved) {
        console.log(
          "Data last saved:",
          new Date(parsed.lastSaved).toLocaleString()
        );
      }
    } else {
      console.log("No previous todos found in localStorage");
    }
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    todos = [];
    todoIdCounter = 1;
  }
}

// INITIALIZATION SECTION
// Initialize all components according to assignment requirements

function initializeComponents() {
  console.log("391 Assignment 2");

  // Initialize Fortune Generator (Question 1)
  displayRandomFortune();

  // Connect Fortune Generator buttons (4 buttons as per requirement)
  const fontColorBtn = document.getElementById("font-color-btn");
  const bgColorBtn = document.getElementById("bg-color-btn");
  const borderColorBtn = document.getElementById("border-color-btn");
  const fontStyleBtn = document.getElementById("font-style-btn");

  if (fontColorBtn) {
    fontColorBtn.addEventListener("click", changeFontColor);
    console.log("Font color button connected");
  }
  if (bgColorBtn) {
    bgColorBtn.addEventListener("click", changeBackgroundColor);
    console.log("Background color button connected");
  }
  if (borderColorBtn) {
    borderColorBtn.addEventListener("click", changeBorderColor);
    console.log("Border color button connected");
  }
  if (fontStyleBtn) {
    fontStyleBtn.addEventListener("click", changeFontStyle);
    console.log("Font style button connected");
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

// ERROR HANDLING & DEBUGGING
// Global error handler for debugging

window.addEventListener("error", (e) => {
  console.error("JavaScript Error:", e.error);
  console.error("File:", e.filename);
  console.error("Line:", e.lineno);
  console.error("Column:", e.colno);
});

console.log("391 Assignment 2");
