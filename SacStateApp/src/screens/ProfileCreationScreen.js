import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
import ModalSelector from 'react-native-modal-selector';
import { useNavigation } from '@react-navigation/native';
import majorList from '../assets/majorList.json';
import clubList from '../assets/clubList.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../ProfileCreationStyles/ProfileCreationStyles';

const { height } = Dimensions.get('window');

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

class ProfileCreationManager {
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
        this.questions[questionId].handleCondition(answer, this.getActions(currentQuestion));
    }

    getActions(currentQuestion) {
        return {
            goToNext: () => this.goToNext(currentQuestion),
            goToPrevious: () => this.goToPrevious(currentQuestion),
            skipQuestion: () => this.skipQuestion(currentQuestion)
        };
    }
}

const ProfileCreation = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [selectedMajor, setSelectedMajor] = useState("");
    const [selectedClub, setSelectedClub] = useState("");
    const [firstName, setFirstName] = useState("");
    const [middleInitial, setMiddleInitial] = useState("");
    const [lastName, setLastName] = useState("");
    const [isCompleted, setIsCompleted] = useState(false);
    const navigation = useNavigation();

    const questions = [
        new Question(0, "Please enter your name details (First, Middle Initial (optional), Last):", "text"),
        new Question(1, "What type of student are you?", "checkbox", ["New Student", "Transfer Student", "Re-entry Student"]),
        new Question(2, "What is your major?", "dropdown", majorList["major"]),
        new Question(3, "What academic year are you in?", "checkbox", ["Freshman", "Sophomore", "Junior", "Senior+", "Graduate"]),
        new Question(4, "Which clubs are you a part of or interested in?", "multiDropdown", clubList["club"]),
        new Question(5, "What type of campus events are you interested in?", "checkbox", ["Academic Workshops", "Social Events", "Sports", "Volunteering"]),
        new Question(6, "Which areas of support would you find most helpful?", "checkbox", ["Academic Advising", "Career Counseling", "Mental Health Resources", "Financial Aid"]),
        new Question(7, "What are your academic goals?", "checkbox", ["Achieve high grades", "Get hands-on experience", "Build a professional network", "Plan for further education"])
    ];

    const profileCreationManager = new ProfileCreationManager(questions, setCurrentQuestion, setAnswers);

    const completeProfileCreation = () => {
        setIsCompleted(true);
        console.log(answers);
        sendProfileDataToServer();
    };

    const sendProfileDataToServer = async () => {
        try {
            const specificAnswers = {
                question1: answers["1"].toLowerCase(),
                question2: answers["2"],
                question3: answers["3"].toLowerCase()
            };
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`http://${process.env.DEV_BACKEND_SERVER_IP}:5000/api/students/profile-answers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ specificAnswers })
            });

            if (!response.ok) {
                // throw new Error('Error sending profile data to server');
            }
        } catch (err) {
             console.error('Error sending profile answers: ', err);
             Alert.alert('Error', 'Failed to send profile answers. Please try again.');
        }
    };

    const renderQuestion = (question) => {
        switch (question.inputType) {
            case "text":
                return (
                    <View>
                        <TextInput
                            style={styles.input}
                            placeholder="First Name"
                            value={firstName}
                            onChangeText={(text) => setFirstName(text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Middle Initial (Optional)"
                            value={middleInitial}
                            onChangeText={(text) => setMiddleInitial(text)}
                            maxLength={1}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Last Name"
                            value={lastName}
                            onChangeText={(text) => setLastName(text)}
                        />
                    </View>
                );
            case "checkbox":
                return question.options.map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={styles.optionButton}
                        onPress={() => profileCreationManager.handleAnswer(question.id, option, currentQuestion)}
                    >
                        <Text style={styles.optionText}>{option}</Text>
                    </TouchableOpacity>
                ));
            case "dropdown":
                return (
                    <ModalSelector
                        data={question.options}
                        initValue="Select your major"
                        onChange={(option) => {
                            setSelectedMajor(option.label);
                            profileCreationManager.handleAnswer(question.id, option.label, currentQuestion);
                        }}
                        style={styles.pickerContainer}
                        initValueTextStyle={styles.pickerText}
                        selectTextStyle={styles.pickerText}
                    />
                );
            case "multiDropdown":
                return (
                    <ModalSelector
                        data={question.options}
                        initValue="Select the clubs"
                        onChange={(option) => {
                            setSelectedClub(option.label);
                            profileCreationManager.handleAnswer(question.id, option.label, currentQuestion);
                        }}
                        style={styles.pickerContainer}
                        initValueTextStyle={styles.pickerText}
                        selectTextStyle={styles.pickerText}
                    />
                );
            default:
                return (
                    <TextInput
                        style={styles.input}
                        placeholder="Your answer"
                        onChangeText={(text) => profileCreationManager.handleAnswer(question.id, text, currentQuestion)}
                    />
                );
        }
    };

    const handleNextPress = () => {
        // Validate only for question 0 (Name details)
        if (currentQuestion === 0) {
            if (firstName.trim() === "" || lastName.trim() === "") {
                Alert.alert("Error", "Please fill in both First and Last names.");
                return;
            }
            profileCreationManager.handleAnswer(0, { firstName, middleInitial, lastName }, currentQuestion);
        }
    
        if (currentQuestion === questions.length - 1) {
            // If on the last question, go to completion screen
            setIsCompleted(true);
        } else {
            // Move to the next question
            profileCreationManager.goToNext(currentQuestion);
        }
    };
    
    const renderCompletionScreen = () => (
        <View style={styles.completionContainer}>
            <Text style={styles.completionText}>You have finished customizing your personal profile!</Text>
            <TouchableOpacity
                style={styles.largeButton}
                onPress={async () => {
                    try {
                        // Call the function to send data to the server
                        await sendProfileDataToServer();
    
                        // Navigate to Dashboard and reset the navigation stack
                        navigation.reset({
                            index: 0,
                            routes: [{ name: "Dashboard" }],
                        });
                    } catch (error) {
                        console.error("Error submitting profile data:", error);
                        Alert.alert("Error", "Failed to submit profile data. Please try again.");
                    }
                }}
            >
                <Text style={styles.largeButtonText}>Create Your Profile!</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.background}>
            <View style={styles.overlay}>
                <ScrollView contentContainerStyle={styles.container}>
                    {isCompleted ? (
                        renderCompletionScreen()
                    ) : (
                        <>
                            <Text style={styles.heading}>Question {currentQuestion + 1} of {questions.length}</Text>
                            <View style={styles.box}>
                                <Text style={styles.questionText}>{questions[currentQuestion].text}</Text>
                                {renderQuestion(questions[currentQuestion])}
                            </View>
                            <View style={styles.navigationButtons}>
                                {/* Conditionally render the "Previous" button only if it's not the first question */}
                                {currentQuestion !== 0 ? (
                                    <TouchableOpacity
                                        style={[styles.button, styles.previousButton]}
                                        onPress={() => profileCreationManager.goToPrevious(currentQuestion)}
                                    >
                                        <Text style={styles.buttonText}>Previous</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.placeholderButton} /> // Placeholder for alignment
                                )}

                                <TouchableOpacity
                                    style={[styles.button, styles.nextButton]} // Ensure consistent styling
                                    onPress={() => {
                                        if (currentQuestion === questions.length - 1) {
                                            completeProfileCreation(); // Execute when the last question is reached
                                        } else {
                                            handleNextPress();
                                        }
                                    }}
                                >
                                    <Text style={styles.buttonText}>Next</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </ScrollView>
            </View>
        </View>
    );
};

export default ProfileCreation;
