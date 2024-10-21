
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const Questionnaire = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const questions = [
        {
            question: "How are you feeling today?",
            options: ["Great", "Fine", "Can't Complain", "Could be Better", "Bad"],
        },
        {
            question: "Which of these are you?",
            options: ["Freshman", "Sophomore", "Junior", "Senior", "Masters", "Doctorate"],
        }
    ];

    const handleOptionChange = (option) => {
        setAnswers({
            ...answers,
            [currentQuestion]: option,
        });
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Question {currentQuestion + 1} of {questions.length}</Text>
            <Text>{questions[currentQuestion].question}</Text>
            <View>
                {questions[currentQuestion].options.map((option, index) => (
                    <View key={index}>
                        <Button
                            title={option}
                            onPress={() => handleOptionChange(option)}
                            color={answers[currentQuestion] === option ? "blue" : "gray"}
                        />
                    </View>
                ))}
            </View>
            <View style={styles.buttons}>
                <Button onPress={handlePrevious} title="Previous" disabled={currentQuestion === 0} />
                {currentQuestion < questions.length - 1 ? (
                    <Button onPress={handleNext} title="Next" />
                ) : (
                    <Button onPress={() => alert("Submitted")} title="Submit" />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    heading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    }
});

export default Questionnaire;


