const agreeTerms = document.getElementById('agreeTerms');
const signupBtn = document.getElementById('signup');

// Check terms and enable/disable the signup button
agreeTerms.addEventListener('change', () => {
    if (agreeTerms.checked) {
        signupBtn.style.backgroundColor = 'green';  
        signupBtn.style.cursor = 'pointer';
        signupBtn.disabled = false;
    } else {
        signupBtn.style.backgroundColor = ''; // Reset the background
        signupBtn.style.cursor = ''; 
        signupBtn.disabled = true;
    }
});

// Disable right-click (optional security feature)
// document.addEventListener('contextmenu', function(e) {
//     e.preventDefault();
//     alert('Inspector is not allowed here!');
// });

// Handle show/hide password functionality
const hide = document.getElementById('hide');
const show = document.getElementById('show');
const passwordInput = document.getElementById('password');

hide.addEventListener('click', function() {
    passwordInput.setAttribute('type', 'text'); // Show password
    hide.style.display = 'none'; // Hide the "hide" icon
    show.style.display = 'block'; // Show the "show" icon
});

show.addEventListener('click', function() {
    passwordInput.setAttribute('type', 'password'); // Hide password
    show.style.display = 'none'; // Hide the "show" icon
    hide.style.display = 'block'; // Show the "hide" icon
});

// Ensure the state is maintained when the page is revisited
window.addEventListener('load', function() {
    // Reset button state based on checkbox
    if (agreeTerms.checked) {
        signupBtn.style.backgroundColor = 'green';
        signupBtn.style.cursor = 'pointer';
        signupBtn.disabled = false;
    } else {
        signupBtn.disabled = true;
    }
});


