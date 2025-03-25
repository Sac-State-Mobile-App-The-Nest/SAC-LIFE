import { DEV_BACKEND_SERVER_IP, DEV_BACKEND_PORT, PROD_BACKEND_URL } from '@env';
// apiConfig.js
const BASE_URL = __DEV__
  ? `http://${process.env.DEV_BACKEND_SERVER_IP}:${process.env.DEV_BACKEND_PORT}` // Local server for dev
  : PROD_BACKEND_URL;  // Production Azure URL

export default BASE_URL;
