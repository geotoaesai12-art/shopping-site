```javascript
// contact.js — contact form + reply-checking for contact.html

const API_BASE = 'https://shopping-site-production.up.railway.app';

mountLayout('contact');
mountCartDrawer();

document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;
  const msgBox = document.getElementById('formMsg');

  try {
    const res = await fetch(`${API_BASE}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, message })
    });

    const data = await res.json();

    if (!res.ok) {
      msgBox.innerHTML =
        `<div class="form-msg error">${data.error}</div>`;
      return;
    }

    msgBox.innerHTML =
      `<div class="form-msg success">
        Thanks, ${name.split(' ')[0]} — your message has been received.
        Use "Check for a reply" below with the same email to see our response.
      </div>`;

    document.getElementById('contactForm').reset();

  } catch (err) {
    msgBox.innerHTML =
      `<div class="form-msg error">
        Something went wrong. Please try again.
      </div>`;
  }
});

document.getElementById('checkReplyLink').addEventListener('click', async (e) => {
  e.preventDefault();

  const email =
    document.getElementById('email').value ||
    prompt('Enter the email you used to message us:');

  if (!email) return;

  try {
    const res = await fetch(
      `${API_BASE}/api/messages/by-email?email=${encodeURIComponent(email)}`
    );

    const messages = await res.json();

    const box = document.getElementById('repliesBox');
    const list = document.getElementById('repliesList');

    if (messages.length === 0) {
      list.innerHTML =
        `<p style="color:var(--muted); font-size:13.5px;">
          No messages found for this email yet.
        </p>`;
    } else {
      list.innerHTML = messages.map(m => `
        <div style="border-bottom:1px solid var(--line); padding:12px 0;">
          <div style="font-size:13.5px; font-weight:600;">
            You: ${m.message}
          </div>

          ${
            m.reply
              ? `<div style="font-size:13.5px; color:var(--success); margin-top:6px;">
                  <strong>SAHN Support:</strong> ${m.reply}
                </div>`
              : `<div style="font-size:12.5px; color:var(--muted); margin-top:6px;">
                  Awaiting reply...
                </div>`
          }
        </div>
      `).join('');
    }

    box.classList.remove('hidden');

  } catch (err) {
    alert('Could not check for replies right now.');
  }
});
```
