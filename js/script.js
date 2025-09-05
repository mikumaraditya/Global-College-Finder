// DOM Elements
const searchBtn = document.querySelector("#searchbtn");
const collegeList = document.querySelector(".college-results");
const loaderOverlay = document.querySelector("#loader-overlay");
const collegeOverlay = document.querySelector("#college-overlay");
const closeOverlayBtn = document.querySelector("#close-overlay");
const searchBox = document.querySelector("#search_box");
const logoutBtn = document.getElementById("logout-btn");
const loginBtn = document.getElementById("login-btn");

// Backend URLs
const COLLEGES_URL = "https://global-college-api.onrender.com/colleges?country=";
const AUTH_URL = "https://global-college-api.onrender.com/auth";
const SEND_EMAIL_URL = "https://global-college-api.onrender.com/send-email";
const LOGOUT_URL = "https://global-college-api.onrender.com/logout";

// --------------------- Search Functionality ---------------------
searchBtn.addEventListener("click", checkLoginAndSearch);
searchBox.addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkLoginAndSearch();
});

async function checkLoginAndSearch() {
  try {
    const res = await axios.get(AUTH_URL, { withCredentials: true });
    if (res.data.success) {
      searchColleges();
    } else {
      window.location.href = "../signin-page/signin.html";
    }
  } catch {
    window.location.href = "../signin-page/signin.html";
  }
}

async function searchColleges() {
  const country = searchBox.value.trim();
  searchBox.value = "";

  if (!country) {
    showToast("Please enter a valid country name", "error");
    return;
  }

  loaderOverlay.style.display = "flex";
  collegeList.innerHTML = "";

  const colleges = await getColleges(country);
  loaderOverlay.style.display = "none";

  if (!colleges || colleges.length === 0) {
    showToast("No colleges found! Enter a valid country name", "error");
    return;
  }

  displayColleges(colleges);
  showOverlay();
  showToast("Colleges loaded successfully!", "success");
}

async function getColleges(country) {
  try {
    const res = await axios.get(COLLEGES_URL + country, { withCredentials: true });
    return res.data;
  } catch (err) {
    console.error("Error fetching colleges:", err);
    showToast("Failed to fetch colleges. Check your connection.", "error");
    return [];
  }
}

function displayColleges(colleges) {
  collegeList.innerHTML = "";
  colleges.forEach((college) => {
    const card = `
      <div class="card card2">
        <div class="card-body text-center">
          <h5 class="card-title">${college.name}</h5>
          <p class="card-text">
            📍 ${college.country} <br>
            🌐 <a href="${college.web_pages[0]}" target="_blank">${college.web_pages[0]}</a>
          </p>
        </div>
      </div>`;
    collegeList.innerHTML += card;
  });
}

function showOverlay() {
  collegeOverlay.style.display = "flex";
  document.body.classList.add("overlay-open");
}

closeOverlayBtn.addEventListener("click", () => {
  collegeOverlay.style.display = "none";
  document.body.classList.remove("overlay-open");
});

// --------------------- Toast Notification ---------------------
function showToast(message, type = "success", duration = 3000) {
  const toast = document.createElement("div");
  toast.classList.add("toast", type);
  toast.innerText = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => document.body.removeChild(toast), 500);
  }, duration);
}

// --------------------- Navbar Collapse ---------------------
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-link, .login-btn");
  const navbarCollapse = document.querySelector(".navbar-collapse");

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 991) {
        const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: false });
        bsCollapse.hide();
      }
    });
  });
});

// --------------------- Login & Logout ---------------------
document.querySelector(".login-btn").addEventListener("click", () => {
  window.location.href = "../signin-page/signin.html";
});

async function checkLogin() {
  try {
    const res = await axios.get(AUTH_URL, { withCredentials: true });
    if (res.data.success) {
      logoutBtn.style.display = "block";
      loginBtn.style.display = "none";
    } else {
      logoutBtn.style.display = "none";
      loginBtn.style.display = "block";
    }
  } catch {
    logoutBtn.style.display = "none";
    loginBtn.style.display = "block";
  }
}

logoutBtn.addEventListener("click", async () => {
  try {
    await axios.post(LOGOUT_URL, {}, { withCredentials: true });
    logoutBtn.style.display = "none";
    loginBtn.style.display = "block";
    window.location.href = "/index.html";
  } catch {
    showToast("Failed to logout. Try again.", "error");
  }
});

// Run login check on page load
checkLogin();

// --------------------- Contact Form ---------------------
function validateForm() {
  const form = document.querySelector(".contact-form form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      // 1️⃣ Check login first
      const authRes = await axios.get(AUTH_URL, { withCredentials: true });
      if (!authRes.data.success) {
        window.location.href = "../signin-page/signin.html";
        return;
      }
    } catch {
      window.location.href = "../signin-page/signin.html";
      return;
    }

    // 2️⃣ If logged in, proceed with form submission
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();
    const communication = document.getElementById("communication").checked;
    const dataConsent = document.getElementById("data").checked;

    if (!firstName || !lastName || !email || !message) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    const emailData = { firstName, lastName, email, message, communication, dataConsent };

    try {
      loaderOverlay.style.display = "flex";

      const response = await axios.post(SEND_EMAIL_URL, emailData, { withCredentials: true });

      loaderOverlay.style.display = "none";
      showToast(response.data.message, "success");
      form.reset();
    } catch {
      loaderOverlay.style.display = "none";
      showToast("Failed to send email. Please try again later.", "error");
    }
  });
}

validateForm();

