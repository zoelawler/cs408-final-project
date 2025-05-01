let allTasks = [];

// Call functions to make sure DOM is loaded before running scripts
document.addEventListener("DOMContentLoaded", () => {
    loginBtn();
    togglePassword();
    modalFunction();
    taskFilter();
    searchTable();
    loadTasks();
    const sendDataBtn = document.getElementById("send-data");
    if (sendDataBtn) {
        sendDataBtn.onclick = sendTask;
    }
});

// when user clicks login, go to home page
function loginBtn() {
    const loginBtn = document.getElementById("login-btn");
    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            window.location.href = "/html/home.html";
        });
    }
}

// if user clicks on the password eye, go to password function
function togglePassword() {
    const toggleIcon = document.getElementById("toggle-password");
    if (toggleIcon) {
        toggleIcon.addEventListener("click", passwordFunction);
    }
}

// toggles the eye icon and the visiblity of the password
function passwordFunction() {
    const passwordInput = document.getElementById("login-password");
    const toggleIcon = document.getElementById("toggle-password");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleIcon.src = "img/hidden.png";
    } else {
        passwordInput.type = "password";
        toggleIcon.src = "img/eye.png"
    }
}

// Displays the modal 
function modalFunction() {
    const openBtn = document.getElementById("add-task-modal");
    const modal = document.getElementById("modal");
    const closeModalBtn = document.getElementById("close-modal");

    if (openBtn && modal) {
        openBtn.addEventListener("click", () => {
            modal.classList.add("open");

            document.getElementById("task-name").value = "";
            document.getElementById("description").value = "";
            document.getElementById("due-date").value = "";
            document.getElementById("task-status").value = "Not Started";

            document.getElementById("modal-title").textContent = "Add a New Task";
            document.getElementById("send-data").textContent = "Add Task";
            document.getElementById("send-data").onclick = sendTask;
        });
    }
    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => {
            modal.classList.remove("open");
        });
    }
}

// Search for a keyword in the task name
function searchTable() {
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("input", function (e) {
            const keyword = e.target.value.toLowerCase();
            const table = document.getElementById("table-body");

            const filteredTasks = allTasks.filter(task =>
                task.task.toLowerCase().includes(keyword)
            );
            displayTasks(filteredTasks, table);
        });
    }
}

// formats the date for created date
function getFormattedDate(date) {
    let year = date.getFullYear();
    let month = (1 + date.getMonth()).toString();

    if (month.length > 1) {
        month = month;
    } else {
        month = '0' + month;
    }

    let day = date.getDate().toString();
    if (day.length > 1) {
        day = day;
    } else {
        day = '0' + day;
    }
    return month + '-' + day + '-' + year;
}

// Reformats the due date to MM-DD-YYYY
function reformatDate(date) {
    const newDate = date.split("-");

    if (newDate.length !== 3) {
        return date;
    }

    const year = newDate[0];
    const month = newDate[1];
    const day = newDate[2];

    return month + '-' + day + '-' + year;
}

// Reformats the due date back to YYYY-MM-DD for editing tasks
function formatDateForEdit(date) {
    const newDate = date.split("-");

    if (newDate.length !== 3) {
        return date;
    }

    const month = newDate[0];
    const day = newDate[1];
    const year = newDate[2];

    return year + '-' + month + '-' + day;
}

// Changes the modal text for edit tasks
function editTasks(item) {
    const modal = document.getElementById("modal");
    if (!modal) {
        return;
    }

    document.getElementById("modal-title").textContent = "Edit Task";
    document.getElementById("send-data").textContent = "Update Task";

    modal.classList.add("open");

    document.getElementById("task-name").value = item.task;
    document.getElementById("description").value = item.description;
    document.getElementById("due-date").value = formatDateForEdit(item.dueDate);
    document.getElementById("task-status").value = item.status;

    document.getElementById("send-data").onclick = function () {
        updateTask(item.id);
    };
}

// Updates the task in the table and in AWS
function updateTask(id) {
    let xhr = new XMLHttpRequest();
    xhr.open("PUT", "https://gx68qujy06.execute-api.us-east-2.amazonaws.com/items");
    xhr.setRequestHeader("Content-Type", "application/json");

    let task = document.getElementById("task-name").value;
    let description = document.getElementById("description").value;
    let dueDate = document.getElementById("due-date").value;
    let status = document.getElementById("task-status").value;


    if (task && description && dueDate && status) {
        let data = {
            "id": id.toString(),
            "task": task,
            "description": description,
            "date-created": getFormattedDate(new Date()),
            "status": status,
            "dueDate": reformatDate(dueDate)
        };

        console.log("Data to be sent:", data);

        xhr.send(JSON.stringify(data)); // Sends request to server as a JSON string
        xhr.onload = function () {
            if (xhr.status === 200) { // Make sure request was successful
                document.getElementById("modal").classList.remove("open");
                loadTasks(); // Automatically loads table with new data
            } else {
                alert(`Failed to add ${task}`);
            }
        }
    } else {
        alert("Fill out all text fields");
    }
}

// Displays the status on the table by which status id it is
function taskFilter() {
    const statusSelect = document.getElementById("filter-status");
    if (statusSelect) {
        statusSelect.addEventListener("change", (e) => {
            const filter = e.target.value;
            const table = document.getElementById("table-body");

            if (filter === "completed") {
                const completedTasks = allTasks.filter(task => task.status.toLowerCase() === "completed");
                displayTasks(completedTasks, table);
            } else if (filter === "not-started") {
                const notStartedTasks = allTasks.filter(task => task.status.toLowerCase() === "not started");
                displayTasks(notStartedTasks, table);
            } else if (filter === "in-progress") {
                const inProgressTasks = allTasks.filter(task => task.status.toLowerCase() === "in progress");
                displayTasks(inProgressTasks, table);
            } else {
                displayTasks(allTasks, table);
            }
        });
    }
}

// Sends a task to AWS
function sendTask() {
    let currId = localStorage.getItem('currId') || 1;
    let xhr = new XMLHttpRequest();
    xhr.open("PUT", "https://gx68qujy06.execute-api.us-east-2.amazonaws.com/items");
    xhr.setRequestHeader("Content-Type", "application/json");

    // Get elements by their id
    let task = document.getElementById("task-name").value;
    let description = document.getElementById("description").value;
    let dueDate = document.getElementById("due-date").value;
    let status = document.getElementById("task-status").value;

    if (task && description && dueDate && status) {
        let data = {
            "id": currId.toString(),
            "task": task,
            "description": description,
            "date-created": getFormattedDate(new Date()),
            "status": status,
            "dueDate": reformatDate(dueDate)
        };

        console.log("Data to be sent:", data);

        xhr.send(JSON.stringify(data)); // Sends request to server as a JSON string
        xhr.onload = function () {
            if (xhr.status === 200) { // Make sure request was successful
                document.getElementById("modal").classList.remove("open");

                // Clear text input after clicking "Add Item"
                document.getElementById("task-name").value = "";
                document.getElementById("description").value = "";
                document.getElementById("due-date").value = "";
                document.getElementById("task-status").value = "";
                currId++;
                localStorage.setItem('currId', currId);

                loadTasks(); // Automatically loads table with new data
            } else {
                alert(`Failed to add ${task}`);
            }
        }
    } else {
        alert("Fill out all text fields");
    }
}

// Loads the tasks from AWS
function loadTasks() {
    let table = document.getElementById("table-body");
    if (!table) {
        return;
    }

    let xhr = new XMLHttpRequest();
    table.innerHTML = ''; // clear previous data

    xhr.addEventListener("load", function () {
        if (xhr.status === 200) { // make sure request was successful
            allTasks = JSON.parse(xhr.responseText);
            if (window.location.pathname.includes('completed')) { // make sure we're on the completed tasks page
                const completedTasks = allTasks.filter(task => task.status.toLowerCase() === "completed");
                displayTasks(completedTasks, table); // show only completed tasks
            } else {
                displayTasks(allTasks, table); // show all tasks
            }
        } else {
            console.log("Unable to load data");
        }
    });
    xhr.open("GET", "https://gx68qujy06.execute-api.us-east-2.amazonaws.com/items");
    xhr.send();
}

// Displays the tasks in the table
function displayTasks(tasks, table) {
    table.innerHTML = ''; // clear previous data

    if (tasks.length === 0) { // check to see if theres any data to load
        console.log("No data to load");
        return;
    }
    for (let item of tasks) {
        // const item = data[i];
        let row = table.insertRow();

        // populate table with the data
        row.innerHTML = `
            <td>${item.task}</td>
            <td>${item.description}</td>
            <td>${item["date-created"] || item.dateCreated}</td>
            <td>${item.status}</td>
            <td>${item.dueDate}</td>
            <td>
                <img src="/img/editing.png" alt="edit icon" class="edit-icon">
                <img src="/img/trash.png" alt="delete icon" class="delete-icon">
            </td>
        `;

        row.querySelector(".delete-icon").addEventListener("click", function () {
            deleteTask(item.id);
        });

        row.querySelector(".edit-icon").addEventListener("click", function () {
            console.log('Item to edit:', item);
            editTasks(item);
        })
    }
}

// Deletes a task from the table and AWS
function deleteTask(id) {
    let xhr = new XMLHttpRequest();
    xhr.open("DELETE", `https://gx68qujy06.execute-api.us-east-2.amazonaws.com/items/${id}`);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
        if (xhr.status === 200) {
            loadTasks();
        } else {
            alert(`Failed to delete task with id ${id}`);
        }
    };
    xhr.send();
}