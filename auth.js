// auth.js — handles both login.html and signup.html forms
// (these pages show only the centered box, no shared header/footer)

const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const msgBox = document.getElementById('formMsg');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        msgBox.innerHTML = `<div class="form-msg error">${data.error}</div>`;
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.user.name);
      window.location.href = 'index.html';
    } catch (err) {
      msgBox.innerHTML = `<div class="form-msg error">Something went wrong. Please try again.</div>`;
    }
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        msgBox.innerHTML = `<div class="form-msg error">${data.error}</div>`;
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.user.name);
      window.location.href = 'index.html';
    } catch (err) {
      msgBox.innerHTML = `<div class="form-msg error">Something went wrong. Please try again.</div>`;
    }
  });
}
