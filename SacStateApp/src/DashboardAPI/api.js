import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../apiConfig.js';

// ================================
// Fetch Services
export const fetchUserServices = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/campus_services/servicesRecommendation`, {
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

// Get the user's area of study to display on profile(ex: college of business, college of engineering & computer science)
export const fetchUserAreaOfStudy = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/students/studentAreaOfStudy`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching area of study', error);
    return [];
  }
};

// Get the user's year of study to display on profile(ex: freshman, sophomore, junior, senior, graduate)
export const fetchUserYearOfStudy = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/students/studentYearOfStudy`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching area of study', error);
    return [];
  }
};


// This is only mock data that will be used for frontend when user wants to change this
const studentColleges = [
  "college of engineering & computer science",
  "college of arts & letters",
  "college of business",
  "college of education",
  "college of health & human Services",
  "college of natural science & mathematics",
  "college of social sciences & interdisciplinary studies",
];
// Update the student's college
export const updateUserAreaOfStudy = async (token, studentColleges) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/api/students/updateUserAreaOfStudy`,
      { areaOfStudy: studentColleges[0] }, // Sending the selected area of study in the request body, must change studentColleges[0]
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating area of study', error);
    return { success: false, message: 'Failed to update area of study' };
  }
};

// Mock data
const studentYears = [
  "freshman",
  "sophomore",
  "junior",
  "senior",
  "graduate student",
];
// Update the student's year of study
export const updateUserYearOfStudy = async (token, studentYears) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/api/students/updateUserYearOfStudy`,
      { areaOfStudy: studentYears[0] }, // Sending the selected area of study in the request body, must change studentYears[0]
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating year of study', error);
    return { success: false, message: 'Failed to update year of study' };
  }
};

// Send to server: student created events
export const sendStudentCreatedEvent = async (createdEvent) => {
  console.log(createdEvent);
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/api/events/created-event`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ createdEvent })
    });
  
    if (!response.ok) {
      throw new Error('Error sending created event to server')
    }
    
  } catch (err) {
    console.error('Error sending created event: ', err);
  }
};