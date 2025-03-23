//to-do:  hp bar, backend implementation, clean up and ui focus
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions, ImageBackground, Image, Animated } from 'react-native';
import ModalSelector from 'react-native-modal-selector';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from '../WellnessStyles/WellnessStyles';

const { width, height } = Dimensions.get('window');
const SAC_STATE_LOGO = require('../assets/sac-state-logo.png');

class Question {
    constructor(id, text, inputType, options = [], conditional = null) {
        this.id = id;
        this.text = text;
        this.inputType = inputType;
        this.options = options;
        this.conditional = conditional;
    }

    handleCondition(answer, actions) {
        if (this.conditional) {
            this.conditional(answer, actions);
        } else {
            actions.goToNext();
        }
    }
}

class WellnessCheckInManager {
    constructor(questions, setCurrentQuestion, setAnswers) {
        this.questions = questions;
        this.setCurrentQuestion = setCurrentQuestion;
        this.setAnswers = setAnswers;
    }

    goToNext(currentQuestion) {
        this.setCurrentQuestion(Math.min(currentQuestion + 1, this.questions.length - 1));
    }

    goToPrevious(currentQuestion) {
        this.setCurrentQuestion(Math.max(currentQuestion - 1, 0));
    }

    skipQuestion(currentQuestion) {
        this.setCurrentQuestion(Math.min(currentQuestion + 2, this.questions.length - 1));
    }

    handleAnswer(questionId, answer, currentQuestion) {
        this.setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    }
}

// Sending profile data to server code goes here !!!

const CompletionScreen = ({ onPress }) => (
    <View style={styles.completionContainer}>
        <Text style={styles.completionText}>Thank you for checking in on yourself!</Text>
        <TouchableOpacity style={styles.largeButton} onPress={onPress}>
            <Text style={styles.largeButtonText}>Complete Check-in!</Text>
        </TouchableOpacity>
    </View>
);

// Updated QuestionRenderer function to handle user interaction
const QuestionRenderer = ({ question, wellnessCheckInManager, currentQuestion, answers }) => {
    const handleCheckboxPress = (option) => {
        wellnessCheckInManager.handleAnswer(question.id, option.value, currentQuestion);
    };

    const handleDropdownChange = (option) => {
        wellnessCheckInManager.handleAnswer(question.id, option.value, currentQuestion);
    };

    const handleTextInputChange = (text) => {
        wellnessCheckInManager.handleAnswer(question.id, text, currentQuestion);
    };

    switch (question.inputType) {
        case "checkbox":
            return (
                <View style={styles.inputContainer}>
                    {question.options.map((option) => (
                        <TouchableOpacity
                            key={option.label}
                            style={[
                                styles.optionButton,
                                answers[question.id] === option.value && styles.selectedOptionButton
                            ]}
                            onPress={() => handleCheckboxPress(option)}
                        >
                            <Text style={styles.optionText}>{option.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            );
        case "dropdown":
            return (
                <ModalSelector
                    data={question.options.map((option) => ({ key: option.value, label: option.label }))}
                    initValue="Select an option"
                    onChange={handleDropdownChange}
                    style={styles.pickerContainer}
                    initValueTextStyle={styles.pickerText}
                    selectTextStyle={styles.pickerText}
                />
            );
        case "multiDropdown":
            return (
                <ModalSelector
                    data={question.options.map((option) => ({ key: option.value, label: option.label }))}
                    initValue="Click to choose"
                    onChange={handleDropdownChange}
                    style={styles.pickerContainer}
                    initValueTextStyle={styles.pickerText}
                    selectTextStyle={styles.pickerText}
                />
            );
        default:
            // ================== CHANGES START HERE ==================
            // Make the final question's text box larger and multiline
            if (question.id === 5) { // Assuming the final question has id 5
                return (
                    <TextInput
                        style={[styles.input, styles.largeInput]} // Apply a larger style
                        placeholder="Input here"
                        onChangeText={handleTextInputChange}
                        value={answers[question.id] || ''}
                        multiline={true} // Allow multiline input
                        numberOfLines={5} // Set a minimum number of lines
                        scrollEnabled={true} // Enable scrolling
                        textAlignVertical="top" // Align text to the top
                    />
                );
            } else {
                return (
                    <TextInput
                        style={styles.input}
                        placeholder="Input here"
                        onChangeText={handleTextInputChange}
                        value={answers[question.id] || ''}
                    />
                );
            }
            // ================== CHANGES END HERE ==================
    }
};

const WellnessCreation = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isCompleted, setIsCompleted] = useState(false);
    const navigation = useNavigation();
    const slideAnim = useRef(new Animated.Value(0)).current;

    const questions = [
        new Question(0, "Do you feel that you need academic assistance?", "checkbox", 
            [
                { label: "Disagree", value: 5 },
                { label: "Slightly Disagree", value: 4 },
                { label: "Neither Agree nor Disagree", value: 3 },
                { label: "Slightly Agree", value: 2 },
                { label: "Agree", value: 1 }
            ]
        ),

        new Question(1, "I feel safe on campus.", "checkbox", 
            [
                { label: "Disagree", value: 1 },
                { label: "Slightly Disagree", value: 2 },
                { label: "Neither Agree nor Disagree", value: 3 },
                { label: "Slightly Agree", value: 4 },
                { label: "Agree", value: 5 }
            ]
        ),

        new Question(2, "Over the last few weeks, have you been feeling nervous, easily irritable, tired, worried and/or restless?", "checkbox", 
            [
                { label: "Not at all", value: 1 },
                { label: "Some days", value: 3 },
                { label: "Nearly every day", value: 5 },
            ]
        ),

        new Question(3, "Are you happy with how your school life is going?", "checkbox", 
            [
                { label: "Disagree", value: 1 },
                { label: "Slightly Disagree", value: 2 },
                { label: "Neither Agree nor Disagree", value: 3 },
                { label: "Slightly Agree", value: 4 },
                { label: "Agree", value: 5 }
            ]
        ),

        new Question(4, "In the last twelve months did you ever eat less or skip meals due to financial situations?", "checkbox", 
            [
                { label: "Disagree", value: 5 },
                { label: "Slightly Disagree", value: 4 },
                { label: "Neither Agree nor Disagree", value: 3 },
                { label: "Slightly Agree", value: 2 },
                { label: "Agree", value: 1 }
            ]
        ),

        new Question(5, "Is there anything you would like to add about your school life or wellbeing?", "text"), // Final question with a larger text box
    ];

    const wellnessCheckInManager = new WellnessCheckInManager(questions, setCurrentQuestion, setAnswers);

    const calculateTotalScore = () => {
        const totalScore = Object.values(answers).reduce((sum, value) => sum + value, 0);
        console.log("Total Score:", totalScore); // This prints the sum to the console
        return totalScore;
    };
    
    const handleNextPress = () => {
        if (currentQuestion === questions.length - 1) {
            const totalScore = calculateTotalScore();
            setIsCompleted(true);
        }

        // Start exit animation
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: -width, // Slide left
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Change question
            setCurrentQuestion(prev => prev + 1);

            // Reset animation position
            slideAnim.setValue(width);

            // Start enter animation
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0, // Slide back in
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        });
    };

    const handlePreviousPress = () => {
        // Start exit animation
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: width, // Slide right
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Change question
            setCurrentQuestion(prev => prev - 1);

            // Reset animation position
            slideAnim.setValue(-width);

            // Start enter animation
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0, // Slide back in
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        });
    };

    const handleCompletePress = () => {
        const totalScore = calculateTotalScore();
        console.log("Check-in complete. Total score:", totalScore);
    };

    if (isCompleted) {
        return <CompletionScreen onPress={handleCompletePress} />;
    }


    return (
        <ImageBackground source={SAC_STATE_LOGO} style={styles.background} imageStyle={styles.logoImage}>
            <View style={styles.overlayContainer}>
                <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                    {isCompleted ? (
                        <CompletionScreen />
                        //<CompletionScreen onPress={() => sendProfileDataToServer(answers, navigation)} />
                    ) : (
                        <>
                            {/* Animated question title */}
                            <Animated.Text
                                style={[
                                    styles.heading,
                                    { transform: [{ translateX: slideAnim }] }
                                ]}
                            >
                                Question {currentQuestion + 1} of {questions.length}
                            </Animated.Text>

                            {/* Animated question box */}
                            <Animated.View
                                style={[styles.questionContainer, { transform: [{ translateX: slideAnim }] }]}
                            >
                                <View style={styles.box}>
                                    <Text style={styles.questionText}>{questions[currentQuestion].text}</Text>
                                    <QuestionRenderer
                                        question={questions[currentQuestion]}
                                        wellnessCheckInManager={wellnessCheckInManager}
                                        currentQuestion={currentQuestion}
                                        answers={answers}
                                    />
                                </View>
                            </Animated.View>

                            {/* Animated navigation buttons */}
                            <Animated.View
                                style={[styles.navigationButtons, { transform: [{ translateX: slideAnim }] }]}
                            >
                                {currentQuestion !== 0 && (
                                    <TouchableOpacity
                                        style={[styles.button, styles.previousButton]}
                                        onPress={handlePreviousPress}
                                    >
                                        <Text style={styles.buttonText}>Previous</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        styles.nextButton,
                                        currentQuestion === 0 && { marginLeft: 'auto' }
                                    ]}
                                    onPress={handleNextPress}
                                >
                                    <Text style={styles.buttonText}>Next</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        </>
                    )}
                </ScrollView>
            </View>
        </ImageBackground>
    );
};

export default WellnessCreation;