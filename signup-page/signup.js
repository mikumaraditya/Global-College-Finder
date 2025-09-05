document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const signupButton = document.getElementById('signupButton');
    const buttonLoader = document.getElementById('buttonLoader');
    const buttonText = document.getElementById('buttonText');
    const togglePassword = document.getElementById('togglePassword');
  
  
    function showToast(message, type = "success") {
      const toast = document.createElement("div");
      toast.className = `toast ${type}`;
      toast.textContent = message;
      document.body.appendChild(toast);
  
      setTimeout(() => toast.classList.add("show"), 100);
  
   
      setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
 
    if (togglePassword) {
      togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.querySelector('i').classList.toggle('fa-eye');
        togglePassword.querySelector('i').classList.toggle('fa-eye-slash');
      });
    }

    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
  
      if (!email || !password) {
        showToast("Email and password are required", "error");
        return;
      }
  

      signupButton.disabled = true;
      buttonLoader.style.display = 'inline-block';
      buttonText.style.display = 'none';
  
      try {
        const response = await axios.post("http://localhost:8000/signup", {
          email,
          password
        });
  
   
        if (response.status === 200 || response.status === 201) {
          showToast(response.data.message || "Signup successful!", "success");
          setTimeout(() => {
            window.location.href = '/signin';
          }, 1000);
        }
  
      } catch (error) {
        console.error("Signup failed:", error);
  
        let errorMessage = "Internal server error";
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
  
        showToast(errorMessage, "error"); 
      } finally {
        signupButton.disabled = false;
        buttonLoader.style.display = 'none';
        buttonText.style.display = 'inline-block';
      }
    });
  });
  