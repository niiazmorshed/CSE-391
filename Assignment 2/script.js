const fortunes = [
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Your limitation—it's only your imagination.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Success doesn't just find you. You have to go out and get it.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Don't stop when you're tired. Stop when you're done.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Do something today that your future self will thank you for.",
  "Little things make big days.",
  "It's going to be hard, but hard does not mean impossible.",
  "Push yourself, because no one else is going to do it for you.",
  "Sometimes later becomes never. Do it now.",
  "Great things happen to those who don't stop believing.",
  "Everything you've ever wanted is on the other side of fear.",
];

// Function to get random fortune
function getRandomFortune() {
  const randomIndex = Math.floor(Math.random() * fortunes.length);
  return fortunes[randomIndex];
}

// Function to display random fortune on page load
function displayRandomFortune() {
  const fortuneText = document.getElementById("fortune-text");
  if (fortuneText) {
    fortuneText.textContent = getRandomFortune();
    console.log("Random fortune displayed on page load");
  }
}

// Fortune box styling functions
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

function changeFontStyle() {
  const fortuneText = document.getElementById("fortune-text");
  const fonts = [
    { family: "Roboto", size: "28px" },
    { family: "Georgia", size: "26px" },
    { family: "Arial", size: "30px" },
    { family: "Times New Roman", size: "27px" },
    { family: "Verdana", size: "25px" },
    { family: "Comic Sans MS", size: "29px" },
  ];
  const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
  fortuneText.style.fontFamily = randomFont.family;
  fortuneText.style.fontSize = randomFont.size;
  console.log("Font style changed to:", randomFont.family, randomFont.size);
}

// ================================
// STOPWATCH (Question 2 - 35 Marks)
// ================================

// Stopwatch variables
let time = 0; // Time in seconds
let interval = null;
let isRunning = false;
const maxTime = 30; // Maximum time in seconds
const increment = 3; // Increment by 3 seconds

// Function to start the stopwatch
function startStopwatch() {
  if (!isRunning && time < maxTime) {
    isRunning = true;
    interval = setInterval(function () {
      time += increment;
      updateStopwatchDisplay();

      // Auto-stop at 30 seconds
      if (time >= maxTime) {
        stopStopwatch();
        alert("Stopwatch automatically stopped at 30 seconds!");
        console.log("Stopwatch automatically stopped at 30 seconds");
      }
    }, increment * 1000); // Convert to milliseconds (3000ms = 3s)

    console.log("Stopwatch started");
    updateStopwatchButtons();
  }
}

// Function to stop/pause the stopwatch
function stopStopwatch() {
  if (isRunning) {
    isRunning = false;
    clearInterval(interval);
    interval = null;
    console.log("Stopwatch stopped at:", time, "seconds");
    updateStopwatchButtons();
  }
}

// Function to reset the stopwatch to 0
function resetStopwatch() {
  stopStopwatch();
  time = 0;
  updateStopwatchDisplay();
  console.log("Stopwatch reset to 0");
  updateStopwatchButtons();
}

// Function to update the stopwatch display
function updateStopwatchDisplay() {
  const display = document.getElementById("stopwatch-display");
  if (display) {
    display.textContent = formatTime(time);
  }
}

// Function to format time for display (MM:SS)
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

// Function to update button states
function updateStopwatchButtons() {
  const startBtn = document.getElementById("start-btn");
  const stopBtn = document.getElementById("stop-btn");
  const resetBtn = document.getElementById("reset-btn");

  if (startBtn && stopBtn && resetBtn) {
    // Disable start button when running or at max time
    startBtn.disabled = isRunning || time >= maxTime;

    // Disable stop button when not running
    stopBtn.disabled = !isRunning;

    // Reset button is always enabled
    resetBtn.disabled = false;
  }
}

// ================================
// TODO LIST (Question 3 - 40 Marks)
// ================================

// Todo list variables
let todos = [];
let todoIdCounter = 1;

// Function to add a new todo
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

// Function to delete a todo
function deleteTodo(id) {
  const index = todos.findIndex((todo) => todo.id === id);
  if (index !== -1) {
    const deletedTodo = todos.splice(index, 1)[0];
    saveTodosToStorage();
    renderTodos();
    console.log("Todo deleted:", deletedTodo);
  }
}

// Function to toggle todo completion
function toggleTodo(id) {
  const todo = todos.find((todo) => todo.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodosToStorage();
    renderTodos();
    console.log("Todo toggled:", todo);
  }
}

// Function to clear all todos
function clearAllTodos() {
  if (todos.length === 0) {
    alert("No tasks to clear!");
    return;
  }

  if (
    confirm(
      "Are you sure you want to delete all tasks? This action cannot be undone."
    )
  ) {
    todos = [];
    saveTodosToStorage();
    renderTodos();
    console.log("All todos cleared");
  }
}

// Function to render all todos
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

// Function to create a single todo element
function createTodoElement(todo) {
  const todoItem = document.createElement("div");
  todoItem.className = `todo-item ${todo.completed ? "completed" : ""}`;
  todoItem.dataset.id = todo.id;

  todoItem.innerHTML = `
        <div class="todo-content">
            <input type="checkbox" class="todo-checkbox" ${
              todo.completed ? "checked" : ""
            }>
            <span class="todo-text">${escapeHtml(todo.text)}</span>
        </div>
        <div class="todo-actions">
            <button class="delete-btn" title="Delete task">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

  // Add event listeners
  const checkbox = todoItem.querySelector(".todo-checkbox");
  const deleteBtn = todoItem.querySelector(".delete-btn");

  checkbox.addEventListener("change", function () {
    toggleTodo(todo.id);
  });

  deleteBtn.addEventListener("click", function () {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTodo(todo.id);
    }
  });

  return todoItem;
}

// Function to update todo statistics
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

// Function to save todos to localStorage
function saveTodosToStorage() {
  try {
    const data = {
      todos: todos,
      nextId: todoIdCounter,
      lastSaved: new Date().toISOString(),
    };
    localStorage.setItem("cse391_todos", JSON.stringify(data));
    console.log("Todos saved to localStorage:", todos.length, "items");
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    alert("Error saving data. Your browser might be in private mode.");
  }
}

// Function to load todos from localStorage
function loadTodosFromStorage() {
  try {
    const data = localStorage.getItem("cse391_todos");
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

// Function to escape HTML (prevent XSS)
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ================================
// INITIALIZATION AND EVENT LISTENERS
// ================================

// Function to initialize all components
function initializeComponents() {
  console.log("CSE 391 Assignment 2 - JavaScript Applications Initializing...");
  console.log("Testing stopwatch elements:");
  console.log("Display element:", document.getElementById("stopwatch-display"));
  console.log("Start button:", document.getElementById("start-btn"));
  console.log("Stop button:", document.getElementById("stop-btn"));
  console.log("Reset button:", document.getElementById("reset-btn"));

  // Initialize Fortune Generator
  displayRandomFortune();

  // Add event listeners for fortune controls
  const fontColorBtn = document.getElementById("font-color-btn");
  const bgColorBtn = document.getElementById("bg-color-btn");
  const borderColorBtn = document.getElementById("border-color-btn");
  const fontStyleBtn = document.getElementById("font-style-btn");

  if (fontColorBtn) fontColorBtn.addEventListener("click", changeFontColor);
  if (bgColorBtn) bgColorBtn.addEventListener("click", changeBackgroundColor);
  if (borderColorBtn)
    borderColorBtn.addEventListener("click", changeBorderColor);
  if (fontStyleBtn) fontStyleBtn.addEventListener("click", changeFontStyle);

  // Initialize Stopwatch
  updateStopwatchDisplay();
  updateStopwatchButtons();

  // Add event listeners for stopwatch controls
  const startBtn = document.getElementById("start-btn");
  const stopBtn = document.getElementById("stop-btn");
  const resetBtn = document.getElementById("reset-btn");

  if (startBtn) startBtn.addEventListener("click", startStopwatch);
  if (stopBtn) stopBtn.addEventListener("click", stopStopwatch);
  if (resetBtn) resetBtn.addEventListener("click", resetStopwatch);

  // Initialize Todo List
  loadTodosFromStorage();
  renderTodos();

  // Add event listeners for todo controls
  const addTodoBtn = document.getElementById("add-todo-btn");
  const todoInput = document.getElementById("todo-input");
  const clearAllBtn = document.getElementById("clear-all-btn");

  if (addTodoBtn) {
    addTodoBtn.addEventListener("click", addTodo);
  }

  if (todoInput) {
    todoInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        addTodo();
      }
    });
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", clearAllTodos);
  }

  console.log("All components successfully initialized!");
}

// ================================
// PAGE LOAD EVENT
// ================================

// Initialize everything when DOM is fully loaded
// Replace your current DOMContentLoaded event with this
document.addEventListener("DOMContentLoaded", function () {
  console.log("Initializing stopwatch...");

  // Force initialize display
  updateStopwatchDisplay();
  updateStopwatchButtons();

  // Attach event listeners with error checking
  const startBtn = document.getElementById("start-btn");
  const stopBtn = document.getElementById("stop-btn");
  const resetBtn = document.getElementById("reset-btn");

  if (startBtn) {
    startBtn.onclick = startStopwatch;
    console.log("Start button connected");
  } else {
    console.error("Start button not found!");
  }

  if (stopBtn) {
    stopBtn.onclick = stopStopwatch;
    console.log("Stop button connected");
  } else {
    console.error("Stop button not found!");
  }

  if (resetBtn) {
    resetBtn.onclick = resetStopwatch;
    console.log("Reset button connected");
  } else {
    console.error("Reset button not found!");
  }

  console.log("Stopwatch initialization complete");
});

// ================================
// DEBUGGING AND TESTING FUNCTIONS
// ================================

// Function to test all components (for debugging)
function testAllComponents() {
  console.log("=== Testing All Components ===");

  // Test Fortune Generator
  console.log("Fortune Generator Test:");
  console.log("Total fortunes available:", fortunes.length);
  console.log(
    "Current fortune:",
    document.getElementById("fortune-text")?.textContent
  );

  // Test Stopwatch
  console.log("Stopwatch Test:");
  console.log("Current time:", time, "seconds");
  console.log("Is running:", isRunning);
  console.log("Max time:", maxTime, "seconds");
  console.log("Increment:", increment, "seconds");

  // Test Todo List
  console.log("Todo List Test:");
  console.log("Total todos:", todos.length);
  console.log("Completed todos:", todos.filter((t) => t.completed).length);
  console.log("Pending todos:", todos.filter((t) => !t.completed).length);

  console.log("=== Test Complete ===");
}

// Make test function globally accessible
window.testAllComponents = testAllComponents;

// ================================
// ERROR HANDLING
// ================================

// Global error handler
window.addEventListener("error", function (e) {
  console.error("JavaScript Error:", e.error);
  console.error("File:", e.filename);
  console.error("Line:", e.lineno);
  console.error("Column:", e.colno);
});

// Console welcome message
console.log(`
🎉 CSE 391 Assignment 2 - JavaScript Programming 🎉
================================================
Ready to load interactive components:

📋 Fortune Generator (25 marks)
⏱️  Stopwatch Timer (35 marks)  
✅ Todo List (40 marks)

Debug command: testAllComponents()

Loading... 🚀
`);
