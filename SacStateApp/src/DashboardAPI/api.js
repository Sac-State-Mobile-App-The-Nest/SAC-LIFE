import axios from 'axios';

export const fetchUserServices = async (token) => {
  try {
    const response = await axios.get(`http://${process.env.DEV_BACKEND_SERVER_IP}:5000/api/campus_services/servicesRecommendation`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching services recommendations', error);
    return [];
  }
};
