const taskInput =
    document.getElementById("taskInput");

const priorityInput =
    document.getElementById("priorityInput");

const categoryInput =
    document.getElementById("categoryInput");

const dueDateInput =
    document.getElementById("dueDateInput");

const statusInput =
    document.getElementById("statusInput");

const addTaskBtn =
    document.getElementById("addTaskBtn");

const taskList =
    document.getElementById("taskList");

const totalTasks =
    document.getElementById("totalTasks");

const pendingTasks =
    document.getElementById("pendingTasks");

const completedTasks =
    document.getElementById("completedTasks");

const welcomeMessage =
    document.getElementById("welcomeMessage");

const searchInput =
    document.getElementById("searchInput");


const API_URL =
    "http://localhost:5000/api/tasks";


const authToken =
    localStorage.getItem("token");


if (!authToken) {

    window.location.href =
        "auth.html";

}


let allTasks = [];


// =========================
// USER INFORMATION
// =========================

const userData =
    localStorage.getItem("user");


if (userData) {

    const user =
        JSON.parse(userData);

    welcomeMessage.textContent =
        `Welcome, ${user.name} 👋`;

}


// =========================
// LOAD TASKS
// =========================

async function loadTasks() {

    try {

        const response =
            await fetch(API_URL, {

                method: "GET",

                headers: {

                    "Authorization":
                        `Bearer ${authToken}`

                }

            });


        if (!response.ok) {

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                window.location.href =
                    "auth.html";

                return;

            }


            const errorData =
                await response.json();


            throw new Error(
                errorData.message ||
                "Failed to load tasks"
            );

        }


        const tasks =
            await response.json();


        allTasks =
            tasks;


        renderTasks(
            allTasks
        );


    } catch (error) {

        console.error(
            "Load tasks error:",
            error
        );

        alert(
            error.message ||
            "Could not connect to the server."
        );

    }

}


// =========================
// ADD TASK
// =========================

async function addTask() {

    const taskText =
        taskInput.value.trim();

    const priority =
        priorityInput.value;

    const category =
        categoryInput.value;

    const dueDate =
        dueDateInput.value;

    const status =
        statusInput.value;


    if (taskText === "") {

        alert(
            "Please enter a task!"
        );

        return;

    }


    try {

        const response =
            await fetch(
                API_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${authToken}`

                    },

                    body: JSON.stringify({

                        text:
                            taskText,

                        priority:
                            priority,

                        category:
                            category,

                        dueDate:
                            dueDate || null,

                        status:
                            status

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                window.location.href =
                    "auth.html";

                return;

            }


            throw new Error(
                data.message ||
                "Failed to add task"
            );

        }


        taskInput.value = "";

        priorityInput.value =
            "Medium";

        categoryInput.value =
            "General";

        dueDateInput.value =
            "";

        statusInput.value =
            "Pending";


        await loadTasks();


    } catch (error) {

        console.error(
            "Add task error:",
            error
        );

        alert(
            error.message ||
            "Could not add the task."
        );

    }

}


// =========================
// FORMAT DATE
// =========================

function formatDate(dateValue) {

    if (!dateValue) {

        return "No due date";

    }


    const date =
        new Date(dateValue);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "No due date";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// =========================
// CHECK OVERDUE
// =========================

function isOverdue(task) {

    if (
        !task.dueDate ||
        task.completed ||
        task.status === "Completed"
    ) {

        return false;

    }


    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const dueDate =
        new Date(
            task.dueDate
        );

    dueDate.setHours(
        0,
        0,
        0,
        0
    );


    return dueDate < today;

}


// =========================
// DISPLAY TASKS
// =========================

function renderTasks(tasks) {

    taskList.innerHTML = "";


    if (tasks.length === 0) {

        if (allTasks.length === 0) {

            taskList.innerHTML = `
                <p>
                    No tasks yet. Add your first task!
                </p>
            `;

        } else {

            taskList.innerHTML = `
                <p>
                    No tasks found.
                </p>
            `;

        }


        updateStats(
            allTasks
        );

        return;

    }


    tasks.forEach(function (task) {

        const taskItem =
            document.createElement("div");


        taskItem.classList.add(
            "task-item"
        );


        if (
            task.completed ||
            task.status === "Completed"
        ) {

            taskItem.classList.add(
                "completed"
            );

        }


        const priority =
            task.priority || "Medium";


        const category =
            task.category || "General";


        const status =
            task.status ||
            (
                task.completed
                    ? "Completed"
                    : "Pending"
            );


        const overdue =
            isOverdue(task);


        taskItem.innerHTML = `

            <div class="task-content">

                <span class="task-text">
                    ${task.text}
                </span>


                <div class="task-meta">

                    <span class="priority-badge">
                        ⭐ ${priority}
                    </span>


                    <span class="category-badge">
                        🏷️ ${category}
                    </span>


                    <span class="status-badge">
                        📌 ${status}
                    </span>


                    <span class="due-date-badge">
                        📅 ${
                            formatDate(
                                task.dueDate
                            )
                        }
                    </span>


                    ${
                        overdue
                            ? `
                                <span class="overdue-badge">
                                    ⚠️ Overdue
                                </span>
                            `
                            : ""
                    }

                </div>

            </div>


            <div class="task-actions">

                <button class="complete-btn">
                    ${
                        task.completed
                            ? "Undo"
                            : "Complete"
                    }
                </button>


                <button class="edit-btn">
                    Edit
                </button>


                <button class="delete-btn">
                    Delete
                </button>

            </div>

        `;


        // =========================
        // COMPLETE / UNDO
        // =========================

        const completeBtn =
            taskItem.querySelector(
                ".complete-btn"
            );


        completeBtn.addEventListener(
            "click",
            async function () {

                try {

                    const response =
                        await fetch(
                            `${API_URL}/${task._id}`,
                            {

                                method: "PUT",

                                headers: {

                                    "Content-Type":
                                        "application/json",

                                    "Authorization":
                                        `Bearer ${authToken}`

                                },

                                body: JSON.stringify({

                                    completed:
                                        !task.completed

                                })

                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Failed to update task"
                        );

                    }


                    await loadTasks();


                } catch (error) {

                    console.error(
                        "Complete error:",
                        error
                    );

                    alert(
                        error.message ||
                        "Could not update the task."
                    );

                }

            }
        );


        // =========================
        // EDIT TASK
        // =========================

        const editBtn =
            taskItem.querySelector(
                ".edit-btn"
            );


        editBtn.addEventListener(
            "click",
            async function () {

                const newTaskText =
                    prompt(
                        "Edit your task:",
                        task.text
                    );


                if (
                    newTaskText === null
                ) {

                    return;

                }


                if (
                    newTaskText.trim() === ""
                ) {

                    alert(
                        "Task cannot be empty."
                    );

                    return;

                }


                const newPriority =
                    prompt(
                        "Priority: Low, Medium, or High",
                        task.priority || "Medium"
                    );


                if (
                    newPriority === null
                ) {

                    return;

                }


                const cleanPriority =
                    newPriority
                        .trim()
                        .toLowerCase();


                let finalPriority;


                if (
                    cleanPriority === "low"
                ) {

                    finalPriority =
                        "Low";

                } else if (
                    cleanPriority === "medium"
                ) {

                    finalPriority =
                        "Medium";

                } else if (
                    cleanPriority === "high"
                ) {

                    finalPriority =
                        "High";

                } else {

                    alert(
                        "Invalid priority."
                    );

                    return;

                }


                const newCategory =
                    prompt(
                        "Category: General, Work, Study, Personal, or Other",
                        task.category || "General"
                    );


                if (
                    newCategory === null
                ) {

                    return;

                }


                const cleanCategory =
                    newCategory
                        .trim()
                        .toLowerCase();


                let finalCategory;


                if (
                    cleanCategory === "general"
                ) {

                    finalCategory =
                        "General";

                } else if (
                    cleanCategory === "work"
                ) {

                    finalCategory =
                        "Work";

                } else if (
                    cleanCategory === "study"
                ) {

                    finalCategory =
                        "Study";

                } else if (
                    cleanCategory === "personal"
                ) {

                    finalCategory =
                        "Personal";

                } else if (
                    cleanCategory === "other"
                ) {

                    finalCategory =
                        "Other";

                } else {

                    alert(
                        "Invalid category."
                    );

                    return;

                }


                const currentDueDate =
                    task.dueDate
                        ? new Date(
                            task.dueDate
                        )
                            .toISOString()
                            .split("T")[0]
                        : "";


                const newDueDate =
                    prompt(
                        "Due date (YYYY-MM-DD). Leave empty for no due date:",
                        currentDueDate
                    );


                if (
                    newDueDate === null
                ) {

                    return;

                }


                if (
                    newDueDate !== ""
                ) {

                    const testDate =
                        new Date(
                            newDueDate
                        );


                    if (
                        isNaN(
                            testDate.getTime()
                        )
                    ) {

                        alert(
                            "Invalid due date."
                        );

                        return;

                    }

                }


                const newStatus =
                    prompt(
                        "Status: Pending, In Progress, or Completed",
                        task.status ||
                        (
                            task.completed
                                ? "Completed"
                                : "Pending"
                        )
                    );


                if (
                    newStatus === null
                ) {

                    return;

                }


                const cleanStatus =
                    newStatus
                        .trim()
                        .toLowerCase();


                let finalStatus;


                if (
                    cleanStatus === "pending"
                ) {

                    finalStatus =
                        "Pending";

                } else if (
                    cleanStatus === "in progress"
                ) {

                    finalStatus =
                        "In Progress";

                } else if (
                    cleanStatus === "completed"
                ) {

                    finalStatus =
                        "Completed";

                } else {

                    alert(
                        "Invalid status."
                    );

                    return;

                }


                try {

                    const response =
                        await fetch(
                            `${API_URL}/${task._id}`,
                            {

                                method: "PUT",

                                headers: {

                                    "Content-Type":
                                        "application/json",

                                    "Authorization":
                                        `Bearer ${authToken}`

                                },

                                body: JSON.stringify({

                                    text:
                                        newTaskText.trim(),

                                    priority:
                                        finalPriority,

                                    category:
                                        finalCategory,

                                    dueDate:
                                        newDueDate || null,

                                    status:
                                        finalStatus

                                })

                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Failed to edit task"
                        );

                    }


                    await loadTasks();


                } catch (error) {

                    console.error(
                        "Edit error:",
                        error
                    );

                    alert(
                        error.message ||
                        "Could not edit the task."
                    );

                }

            }
        );


        // =========================
        // DELETE TASK
        // =========================

        const deleteBtn =
            taskItem.querySelector(
                ".delete-btn"
            );


        deleteBtn.addEventListener(
            "click",
            async function () {

                const confirmDelete =
                    confirm(
                        "Are you sure you want to delete this task?"
                    );


                if (!confirmDelete) {

                    return;

                }


                try {

                    const response =
                        await fetch(
                            `${API_URL}/${task._id}`,
                            {

                                method: "DELETE",

                                headers: {

                                    "Authorization":
                                        `Bearer ${authToken}`

                                }

                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Failed to delete task"
                        );

                    }


                    await loadTasks();


                } catch (error) {

                    console.error(
                        "Delete error:",
                        error
                    );

                    alert(
                        error.message ||
                        "Could not delete the task."
                    );

                }

            }
        );


        taskList.appendChild(
            taskItem
        );

    });


    updateStats(
        allTasks
    );

}


// =========================
// UPDATE STATISTICS
// =========================

function updateStats(tasks) {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            function (task) {

                return (
                    task.completed === true ||
                    task.status === "Completed"
                );

            }
        ).length;


    const pending =
        total - completed;


    totalTasks.textContent =
        total;


    pendingTasks.textContent =
        pending;


    completedTasks.textContent =
        completed;

}


// =========================
// SEARCH
// =========================

searchInput.addEventListener(
    "input",
    function () {

        const searchTerm =
            searchInput.value
                .trim()
                .toLowerCase();


        const filteredTasks =
            allTasks.filter(
                function (task) {

                    return (
                        task.text
                            .toLowerCase()
                            .includes(searchTerm)

                        ||

                        (
                            task.priority || ""
                        )
                            .toLowerCase()
                            .includes(searchTerm)

                        ||

                        (
                            task.category || ""
                        )
                            .toLowerCase()
                            .includes(searchTerm)

                        ||

                        (
                            task.status || ""
                        )
                            .toLowerCase()
                            .includes(searchTerm)
                    );

                }
            );


        renderTasks(
            filteredTasks
        );

    }
);


// =========================
// ADD BUTTON
// =========================

addTaskBtn.addEventListener(
    "click",
    addTask
);


// =========================
// ENTER KEY
// =========================

taskInput.addEventListener(
    "keypress",
    function (event) {

        if (event.key === "Enter") {

            addTask();

        }

    }
);


// =========================
// LOGOUT
// =========================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.onclick =
        function () {

            const confirmLogout =
                window.confirm(
                    "Are you sure you want to logout?"
                );


            if (confirmLogout) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "user"
                );

                window.location.href =
                    "auth.html";

            }

        };

}


// =========================
// INITIAL LOAD
// =========================

loadTasks();