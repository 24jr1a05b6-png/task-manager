const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");

const API_URL = "http://localhost:5000/api/tasks";


/* =========================
   LOAD TASKS
========================= */

async function loadTasks() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load tasks");
        }

        const tasks = await response.json();

        renderTasks(tasks);

    } catch (error) {
        console.error("Load tasks error:", error);
        alert("Could not connect to the server.");
    }
}


/* =========================
   ADD TASK
========================= */

async function addTask() {

    const taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("Please enter a task!");
        return;
    }

    try {

        const response = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                text: taskText
            })
        });

        if (!response.ok) {
            throw new Error("Failed to add task");
        }

        taskInput.value = "";

        loadTasks();

    } catch (error) {

        console.error("Add task error:", error);
        alert("Could not add the task.");

    }
}


/* =========================
   DISPLAY TASKS
========================= */

function renderTasks(tasks) {

    taskList.innerHTML = "";

    tasks.forEach(function (task) {

        const taskItem = document.createElement("div");

        taskItem.classList.add("task-item");

        if (task.completed) {
            taskItem.classList.add("completed");
        }

        taskItem.innerHTML = `
            <span>${task.text}</span>

            <div class="task-actions">

                <button class="complete-btn">
                    ${task.completed ? "Undo" : "Complete"}
                </button>

                <button class="edit-btn">
                    Edit
                </button>

                <button class="delete-btn">
                    Delete
                </button>

            </div>
        `;


        /* =========================
           COMPLETE / UNDO
        ========================= */

        const completeBtn =
            taskItem.querySelector(".complete-btn");

        completeBtn.addEventListener("click", async function () {

            try {

                const response = await fetch(
                    `${API_URL}/${task._id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            completed: !task.completed
                        })
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to update task");
                }

                loadTasks();

            } catch (error) {

                console.error("Complete error:", error);
                alert("Could not update the task.");

            }

        });


        /* =========================
           EDIT TASK
        ========================= */

        const editBtn =
            taskItem.querySelector(".edit-btn");

        editBtn.addEventListener("click", async function () {

            const newTaskText = prompt(
                "Edit your task:",
                task.text
            );

            if (
                newTaskText === null ||
                newTaskText.trim() === ""
            ) {
                return;
            }

            try {

                const response = await fetch(
                    `${API_URL}/${task._id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            text: newTaskText.trim()
                        })
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to edit task");
                }

                loadTasks();

            } catch (error) {

                console.error("Edit error:", error);
                alert("Could not edit the task.");

            }

        });


        /* =========================
           DELETE TASK
        ========================= */

        const deleteBtn =
            taskItem.querySelector(".delete-btn");

        deleteBtn.addEventListener("click", async function () {

            const confirmDelete = confirm(
                "Are you sure you want to delete this task?"
            );

            if (!confirmDelete) {
                return;
            }

            try {

                const response = await fetch(
                    `${API_URL}/${task._id}`,
                    {
                        method: "DELETE"
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to delete task");
                }

                loadTasks();

            } catch (error) {

                console.error("Delete error:", error);
                alert("Could not delete the task.");

            }

        });


        taskList.appendChild(taskItem);

    });

    updateStats(tasks);
}


/* =========================
   UPDATE STATISTICS
========================= */

function updateStats(tasks) {

    const total = tasks.length;

    const completed = tasks.filter(function (task) {
        return task.completed === true;
    }).length;

    const pending = total - completed;

    totalTasks.textContent = total;
    pendingTasks.textContent = pending;
    completedTasks.textContent = completed;
}


/* =========================
   ADD BUTTON
========================= */

addTaskBtn.addEventListener("click", addTask);


/* =========================
   ENTER KEY
========================= */

taskInput.addEventListener("keypress", function (event) {

    if (event.key === "Enter") {
        addTask();
    }

});


/* =========================
   INITIAL LOAD
========================= */

loadTasks();