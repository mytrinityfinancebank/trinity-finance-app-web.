document.getElementById('login-form').addEventListener('submit', function(event) {
event.preventDefault(); // Stop the form from submitting normally
const accountId = document.getElementById('account-id').value;
const password = document.getElementById('password').value;
// --- Mock Authentication Logic ---
// In a real application, you would send this to a server.
// For this mock, we'll use a hardcoded set of credentials.
const MOCK_USER_ID = '7739118821';
const MOCK_PASSWORD = 'password123';
if (accountId === MOCK_USER_ID && password === MOCK_PASSWORD) {
// Successful login: Redirect to the dashboard (index.html)
alert('Login Successful! Redirecting to dashboard...');
window.location.href = 'index.html';
} else {
// Failed login
alert('Login Failed: Invalid Account ID or Password. (Hint: Try Account ID: 7739118821 and Password: password123)');
}
});
