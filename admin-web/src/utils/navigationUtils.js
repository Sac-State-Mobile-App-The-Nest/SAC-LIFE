import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Users.css'; // Optional: import separate CSS for styling

const BackButton = () => {
  const navigate = useNavigate();

  const goBackPage = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/"); 
    }
  };

  return (
    <button className="back-button" onClick={goBackPage}>
      Go Back
    </button>
  );
};

export default BackButton;