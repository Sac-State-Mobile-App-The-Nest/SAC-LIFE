//to-do:  hp bar, backend implementation, clean up and ui focus
import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Dimensions, ImageBackground, Animated, ActivityIndicator} from 'react-native';
import ModalSelector from 'react-native-modal-selector';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../WellnessStyles/WellnessStyles';
import BASE_URL from '../apiConfig.js';

const { width } = Dimensions.get('window');
const SAC_STATE_LOGO = require('../assets/sac-state-logo.png');

// Question class to define the structure of each question
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

// WellnessCheckInManager class to manage the flow of questions and answers
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

const CompletionScreen = ({ onPress, isSubmitting }) => (
    <View style={styles.completionContainer}>
      <Text style={styles.completionText}>Thank you for checking in on yourself!</Text>
      <TouchableOpacity
        style={[styles.largeButton, isSubmitting && { opacity: 0.6 }]}
        onPress={onPress}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#043927" />
        ) : (
          <Text style={styles.largeButtonText}>Complete Check-in!</Text>
        )}
      </TouchableOpacity>
    </View>
  );


// QuestionRenderer component to render different types of questions
const QuestionRenderer = ({ question, wellnessCheckInManager, currentQuestion, answers }) => {
    const handleCheckboxPress = (option) => {
        wellnessCheckInManager.handleAnswer(question.id, option.value, currentQuestion);
    };

    const handleDropdownChange = (option) => {
        wellnessCheckInManager.handleAnswer(question.id, option.value, currentQuestion);
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
    }
};

// Main WellnessCreation component
const WellnessCreation = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isCompleted, setIsCompleted] = useState(false);
    const navigation = useNavigation();
    const slideAnim = useRef(new Animated.Value(0)).current;
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Resets it when questionaire is complete.
    useFocusEffect(
            React.useCallback(() => {
                setCurrentQuestion(0);
                setAnswers({});
                setIsCompleted(false);
                slideAnim.setValue(0);
            }, [])
    );
    
    // Define the questions for the wellness check-in
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
                { label: "Not at all", value: 5 },
                { label: "Some days", value: 3 },
                { label: "Nearly every day", value: 1 },
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
    ];

    const wellnessCheckInManager = new WellnessCheckInManager(questions, setCurrentQuestion, setAnswers);

    // Calculate the total score based on the answers
    const calculateTotalScore = () => {
        const totalScore = Object.values(answers).reduce((sum, value) => sum + value, 0);
        console.log("Total Score:", totalScore); // This prints the sum to the console
        return totalScore;
    };

    // Handle the "Next" button press
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

    // Handle the "Previous" button press
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

    // Handle the "Complete Check-in" button press
    const handleCompletePress = async () => {
        setIsSubmitting(true); // Start loading
        const totalScore = calculateTotalScore();
        console.log("Check-in complete. Total score:", totalScore);
        console.log("Answers: ", answers);

        try {
            const payload = {
                wellnessAnswers: {
                    answers: answers,
                    score: totalScore,
                },
            };

            const token = await AsyncStorage.getItem('token');
            const userId = await AsyncStorage.getItem('userId');

            const response = await fetch(`${BASE_URL}/api/students/wellness-answers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Error sending wellness data to server');
            }
            // send wellness notifcation
            await fetch(`${BASE_URL}/api/notifications/wellness`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: parseInt(userId),
                    score: totalScore
                })
            });

            navigation.navigate('Dashboard');
        } catch (error) {
            console.error('Error sending wellness answers: ', error);
            Alert.alert('Error', 'Failed to send your answers. Please try again.');
        } finally {
            setIsSubmitting(false); // End loading
        }
    };

    return (
        <ImageBackground source={SAC_STATE_LOGO} style={styles.background} imageStyle={styles.logoImage}>
            <View style={styles.overlayContainer}>
                <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                    {isCompleted ? (
                        <CompletionScreen onPress={handleCompletePress} isSubmitting={isSubmitting} navigation={navigation} />
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