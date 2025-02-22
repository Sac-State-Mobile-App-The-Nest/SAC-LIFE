import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();

export const goBackPage = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/"); 
    }
  };
