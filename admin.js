const ADMIN_PASSWORD = "Pégase123";

const ADMIN_SESSION_KEY = "pegaseAdminConnected";

function isAdminConnected() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

function showAdminPanel() {
  document.querySelector("#loginScreen").style.display = "none";
  document.querySelector("#adminPanel").style.display = "block";
}

function showLogin() {
  document.querySelector("#loginScreen").style.display = "flex";
  document.querySelector("#adminPanel").style.display = "none";
}

document
  .querySelector("#loginForm")
  ?.addEventListener("submit", event => {

    event.preventDefault();

    const password =
      document.querySelector("#adminPassword").value;

    if (password === ADMIN_PASSWORD) {

      sessionStorage.setItem(
        ADMIN_SESSION_KEY,
        "true"
      );

      showAdminPanel();

      loadCars();

    } else {

      document.querySelector("#loginError").style.display = "block";

    }
  });

document
  .querySelector("#logoutButton")
  ?.addEventListener("click", () => {

    sessionStorage.removeItem(
      ADMIN_SESSION_KEY
    );

    showLogin();

    document.querySelector("#adminPassword").value = "";
  });


if (isAdminConnected()) {
  showAdminPanel();
} else {
  showLogin();
}
