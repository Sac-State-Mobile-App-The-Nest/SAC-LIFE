async function verifyEmail() {
  const statusEl = document.getElementById('status');
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (!token) {
    statusEl.textContent = "Invalid verification link.";
  } else {
    try {
      const res = await fetch(` https://sacstate-backend.azurewebsites.net/api/signup/verify?token=${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error("Verification failed");
      }

      const data = await res.json();
      console.log(data);
      statusEl.textContent = data.message || "Email successfully verified!";

    } catch (err) {
      console.error(err);
      statusEl.textContent = "Verification failed or link expired.";
    }
  }
}

window.addEventListener('load', () => {
  verifyEmail();
});

module.exports = { verifyEmail };