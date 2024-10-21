import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Questionnaire = () => {
    const [currentQuestion, setCurrentQuestion] =useState(0);
    const [answers, setAnswers] = useState({});
    const questions = [
        {
            question: "How are you feeling today?",
             options: ["Great", "Fine", "Can't Complain", "Could be Better", "Bad"],
        },
        {
            question: "Which of these are you?",
            options: ["Freshman", "Sophmore", "Junior", "Senior", "Masters", "Doctorate"],
        }
    ];

    const handleOptionChange = (event) => {
        setAnswers({
            answers, 
            [currentQuestion]: event.target.value,
        });
    };

    const handleNext = () => {
        if(currentQuestion < questions.length -1){
            setCurrentQuestion(currentQuestion + 1);
        } 
    };

    const handlePrevious = () => {
        if(currentQuestion > 0){
            setCurrentQuestion(currentQuestion -1);
        }
    };

    return (
        <div>
          <h2>Question {currentQuestion + 1} of {questions.length}</h2>
          <p>{questions[currentQuestion].question}</p>
          <div>
            {questions[currentQuestion].options.map((option, index) => (
              <div key={index}>
                <input
                  type="radio"
                  value={option}
                  checked={answers[currentQuestion] === option}
                  onChange={handleOptionChange}
                />
                {option}
              </div>
            ))}
          </div>
          <div>
            <button onClick={handlePrevious} disabled={currentQuestion === 0}>
              Previous
            </button>
            {currentQuestion < questions.length - 1 ? (
              <button onClick={handleNext}>
                Next
              </button>
            ) : (
              <button onClick={handleSubmit}>
                Submit
              </button>
            )}
          </div>
        </div>
      );
    }

    export default Questionnaire;
    


