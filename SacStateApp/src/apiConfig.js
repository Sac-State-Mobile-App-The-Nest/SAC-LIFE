
// apiConfig.js
const BASE_URL = 
  `http://${process.env.DEV_BACKEND_SERVER_IP}:${process.env.DEV_BACKEND_PORT}` // Local server for dev
  //: PROD_BACKEND_URL;  // Production Azure URL

export default BASE_URL;
