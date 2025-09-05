// DOM Elements
let searchbtn = document.querySelector("#searchbtn");
let collegeList = document.querySelector(".college-results");
let loaderOverlay = document.querySelector("#loader-overlay");
let collegeOverlay = document.querySelector("#college-overlay");
let closeOverlayBtn = document.querySelector("#close-overlay");
let searchBox = document.querySelector("#search_box");


let url = "https://global-college-api.onrender.com/colleges?country=";


searchbtn.addEventListener("click", searchColleges);


searchBox.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchColleges();
});


closeOverlayBtn.addEventListener("click", () => {
  collegeOverlay.style.display = "none";
  document.body.classList.remove("overlay-open");
});


async function searchColleges() {
  let country = searchBox.value.trim();
  searchBox.value = "";

  if (country === "") {
    showToast("Please enter a valid country name", "error");
    return;
  }

  loaderOverlay.style.display = "flex";
  collegeList.innerHTML = "";

  let colleges = await getColleges(country);


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
    let res = await axios.get(url + country);
    return res.data;
  } catch (e) {
    console.error("Error fetching colleges:", e);
    showToast("Failed to fetch colleges. Check your connection.", "error");
    return [];
  }
}


function displayColleges(colleges) {
  collegeList.innerHTML = ""; // clear previous
  colleges.forEach(college => {
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

const form = document.querySelector(".contact-form form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();
  const communication = document.getElementById("communication").checked;
  const dataConsent = document.getElementById("data").checked;

  

  const emailData = {
    firstName,
    lastName,
    email,
    message,
    communication,
    dataConsent
  };

  try {
    loaderOverlay.style.display = "flex";
    const response = await axios.post("https://global-college-api.onrender.com/send-email", emailData);
   
    loaderOverlay.style.display = "none";
    showToast(response.data.message, "success");
    form.reset();
  } catch (error) {
    loaderOverlay.style.display = "none";
    showToast("Failed to send email. Please try again later.", "error");
  }
});

document.querySelector(".login-btn").addEventListener("click", () => {
  window.location.href = "../signin-page/signin.html";
});

document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-link, .login-btn");
  const navbarCollapse = document.querySelector(".navbar-collapse");

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 991) { // Bootstrap lg breakpoint
        const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: false });
        bsCollapse.hide(); // collapse the menu
      }
    });
  });
});



