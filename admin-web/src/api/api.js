import axios from 'axios';

// Create an Axios instance with a base URL
const api = axios.create({
  baseURL: 'http://192.168.1.223:5000/api',
});

// Add an interceptor to handle expired tokens globally
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.error("Session expired. Logging out...");
      logoutAdmin();  // Automatically log out admin
    }
    return Promise.reject(error);
  }
);

const logoutAdmin = (navigate) => {
  localStorage.removeItem('token'); 
  if (navigate) {
    navigate('/login'); // Redirect using React Router
  } else {
    window.location.href = '/login'; // Fallback if navigate is not passed
  }
};

export { api, logoutAdmin };