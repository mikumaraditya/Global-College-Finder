const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const loginButton = document.getElementById('loginButton');
const buttonLoader = document.getElementById('buttonLoader');
const buttonText = document.getElementById('buttonText');
const togglePassword = document.getElementById('togglePassword');
const toastContainer = document.getElementById('toastContainer');


togglePassword.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
});

// Function to show toast
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);

  
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    emailError.textContent = '';
    passwordError.textContent = '';

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    let valid = true;

    if (!email) {
        emailError.textContent = 'Email is required';
        valid = false;
    }
    if (!password) {
        passwordError.textContent = 'Password is required';
        valid = false;
    }
    if (!valid) return;

    loginButton.disabled = true;
    buttonLoader.style.display = 'inline-block';
    buttonText.textContent = 'Logging in...';

    try {
        const response = await axios.post(
            'https://global-college-api.onrender.com/signin',
            { email, password },
            { withCredentials: true }   
        );
        
        if (response.data.success) {  
            showToast('Login successful!', 'success');
            setTimeout(() => {  
                window.location.href = "../index.html";
            }, 1000);
        } else {
            showToast('Login failed!', 'error');
        }        
    } catch (error) {
        if (error.response?.data?.error) {
            showToast(error.response.data.error, 'error');
        } else {
            showToast('Something went wrong. Please try again.', 'error');
        }        
    } finally {
        loginButton.disabled = false;
        buttonLoader.style.display = 'none';
        buttonText.textContent = 'Login';
    }
});

