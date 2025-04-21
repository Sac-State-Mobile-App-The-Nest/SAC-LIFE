const statusEl = document.getElementById('status');
const params = new URLSearchParams(window.location.search);
const token = params.get('token');

if (!token) {
  statusEl.textContent = "Invalid verification link.";
} else {
  fetch(` https://sacstate-backend.azurewebsites.net/api/signup/verify?token=${token}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("Verification failed");
      }
      return res.json();
    })
    .then(data => {
      console.log(data);
      statusEl.textContent = data.message || "Email successfully verified!";
    })
    .catch(err => {
      console.error(err);
      statusEl.textContent = "Verification failed or link expired.";
    });
}