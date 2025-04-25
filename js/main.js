window.onload = loaded;

/**
 * Simple Function that will be run when the browser is finished loading.
 */
function loaded() {
    // Assign to a variable so we can set a breakpoint in the debugger!
    const hello = sayHello();
    console.log(hello);
}

/**
 * This function returns the string 'hello'
 * @return {string} the string hello
 */
export function sayHello() {
    return 'hello';
}

// when user clicks login, go to new page
document.addEventListener("DOMContentLoaded", () => {
    console.log(sayHello());

    const loginBtn = document.getElementById("login-btn");
    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            window.location.href = "home.html";
        });
    }

    const toggleIcon = document.getElementById("toggle-password");
    if (toggleIcon) {
        toggleIcon.addEventListener("click", passwordFunction);
    }

    const openBtn = document.getElementById("add-task-modal");
    const modal = document.getElementById("modal");
    const closeModalBtn = document.getElementById("close-modal");

    if (openBtn && modal) {
        openBtn.addEventListener("click", () => {
            modal.classList.add("open");
        });
    }
    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => {
            modal.classList.remove("open");
        });
    }

    loadTasks();
    document.getElementById("send-data").onclick = sendTask;
});

// toggles the eye icon for the password
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

// formats the date
function getFormattedDate(date) {
    var year = date.getFullYear();
    var month = (1 + date.getMonth()).toString();

    if (month.length > 1) {
        month = month;
    } else {
        month = '0' + month;
    }

    var day = date.getDate().toString();
    if (day.length > 1) {
        day = day;
    } else {
        day = '0' + day;
    }

    return month + '-' + day + '-' + year;
}

let currId = localStorage.getItem('currId') || 1;
function sendTask() {
    let xhr = new XMLHttpRequest();
    xhr.open("PUT", "https://gx68qujy06.execute-api.us-east-2.amazonaws.com/items");
    xhr.setRequestHeader("Content-Type", "application/json");

    // Get elements by their id
    let task = document.getElementById("task-name").value;
    let description = document.getElementById("description").value;
    let dueDate = document.getElementById("due-date").value;
    let status = document.getElementById("status").value;

    if (task && description && dueDate && status) {
        let data = {
            "id": currId.toString(),
            "task": task,
            "description": description,
            "date-created": getFormattedDate(new Date()),
            "status": status,
            "dueDate": dueDate
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
                document.getElementById("status").value = "";
                currId++;
                localStorage.setItem('currId', currId);
                loadTasks();
            } else {
                alert(`Failed to add ${task}`);
            }
        }
    } else {
        alert("Fill out all text fields");
    }
}

function loadTasks() {
    let table = document.getElementById("table-body"); //want to get the table and insert into the table body
    let xhr = new XMLHttpRequest();
    table.innerHTML = ''; // clear previous data

    xhr.addEventListener("load", function () {
        if (xhr.status === 200) { // make sure request was successful
            let data = JSON.parse(xhr.responseText);

            if (data.length === 0) { // check to see if theres any data to load, if not alerts
                console.log("No data to load");
            } else {
                for (let i = 0; i < data.length; i++) {
                    const item = data[i];
                    let row = table.insertRow();

                    // populate table with the data
                    row.innerHTML = `
                    <td>${item.task}</td>
                    <td>${item.description}</td>
                    <td>${item["date-created"] || item.dateCreated}</td>
                    <td>${item.status}</td>
                    <td>${item.dueDate}</td>
                    <td><img src="img/trash.png" alt="delete icon" id="delete-icon"></td>
                `;

                    row.querySelector("#delete-icon").addEventListener("click", function () {
                        deleteTask(item.id); 
                    });
                }
            }
        } else {
            console.log("Unable to load data");
        }
    });
    xhr.open("GET", "https://gx68qujy06.execute-api.us-east-2.amazonaws.com/items");
    xhr.send();
}


function deleteTask(id) {
    let xhr = new XMLHttpRequest();
    xhr.open("DELETE", `https://gx68qujy06.execute-api.us-east-2.amazonaws.com/items/${id}`);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
        if (xhr.status === 200) {
            loadTasks();
            let row = document.querySelector(`#task-row-${id}`);
            if (row) {
                row.remove(); 
            }
        } else {
            alert(`Failed to delete task with id ${id}`);
        }

    };
    xhr.send();
}

