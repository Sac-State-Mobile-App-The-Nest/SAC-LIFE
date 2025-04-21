import axios from 'axios';

const API_BASE_URL = 'https://sacstate-backend.azurewebsites.net/api';

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Logout function
 */
const logoutAdmin = (navigate) => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('refreshToken');
  if (navigate) navigate('/login');
  else window.location.href = '/login';
};

/**
 * Refreshes the access token if expired.
 */
const refreshAccessToken = async () => {
  try {
    const refreshToken = sessionStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error("No refresh token available");

    const response = await axios.post(`${API_BASE_URL}/admin_refresh`, { refreshToken });

    if (response.data.accessToken) {
      sessionStorage.setItem('token', response.data.accessToken);
      return response.data.accessToken;
    }
  } catch (error) {
    console.error("Failed to refresh access token:", error);
    logoutAdmin();
    return null;
  }
};

/**
 * Request Interceptor: Automatically refreshes token if expired.
 */
api.interceptors.request.use(async (config) => {
  let token = sessionStorage.getItem('token');
  if (!token) return config;

  // Decode JWT to check expiration
  const payload = JSON.parse(atob(token.split('.')[1]));
  if (Date.now() >= payload.exp * 1000) {
    console.warn("Access token expired. Refreshing...");
    token = await refreshAccessToken();
    if (!token) throw new Error("Token refresh failed");
  }

  config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

export { api, refreshAccessToken, logoutAdmin };
