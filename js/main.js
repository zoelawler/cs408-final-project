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
    const loginBtn = document.getElementById("login-btn");

    loginBtn.addEventListener("click", () => {
        window.location.href="home.html";
    });
});

// toggles the eye icon for the password
export function passwordFunction() {
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
  document.getElementById("toggle-password").addEventListener("click", passwordFunction);


