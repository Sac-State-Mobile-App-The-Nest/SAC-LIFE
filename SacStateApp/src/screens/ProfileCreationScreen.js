import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions, ImageBackground } from 'react-native';
import ModalSelector from 'react-native-modal-selector';
import { useNavigation } from '@react-navigation/native';
import majorList from '../assets/majorList.json';
import clubList from '../assets/clubList.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../ProfileCreationStyles/ProfileCreationStyles';

const { height } = Dimensions.get('window');

// Ensure the Sac State logo is stored in your assets directory
const SAC_STATE_LOGO = require('../assets/sac-state-logo.png'); // Replace with the correct path to your logo file

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
    new Question(0, "Tell us your name!", "text"),
    new Question(1, "How would you describe your student journey?", "checkbox", ["New Student", "Transfer student", "Returning student"]),
    new Question(2, "What’s your major or area of study?", "dropdown", majorList["major"]),
    new Question(3, "What year are you in your studies?", "checkbox", ["First-year (Freshman)", "Second-year (Sophomore)", "Third-year (Junior)", "Fourth-year (Senior+)", "Graduate/Professional"]),
    new Question(4, "Which clubs are you a part of or would like to join?", "multiDropdown", clubList["club"]),
    new Question(5, "What kinds of campus events interest you the most?", "checkbox", ["Workshops to boost your skills", "Fun and social meet-ups", "Sports and fitness activities", "Community service/volunteering"]),
    new Question(6, "What type of support could help you succeed?", "checkbox", ["Guidance for classes and grades", "Career advice and planning", "Wellness and mental health support", "Help with financial aid or scholarships"]),
    new Question(7, "What’s your top priority for your time at Sac State?", "checkbox", ["Excelling in classes", "Getting hands-on experience", "Building a network for my future", "Preparing for grad school or beyond"])
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
        if (currentQuestion === 0) {
            if (firstName.trim() === "" || lastName.trim() === "") {
                Alert.alert("Error", "Please fill in both First and Last names.");
                return;
            }
            profileCreationManager.handleAnswer(0, { firstName, middleInitial, lastName }, currentQuestion);
        }
    
        if (currentQuestion === questions.length - 1) {
            setIsCompleted(true);
        } else {
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
                        await sendProfileDataToServer();
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
        <ImageBackground
            source={SAC_STATE_LOGO}
            style={styles.background}
            imageStyle={styles.logoImage} // Apply specific style for the logo
        >
            <View style={styles.logoContainer}>
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
                                {currentQuestion !== 0 ? (
                                    <TouchableOpacity
                                        style={[styles.button, styles.previousButton]}
                                        onPress={() => profileCreationManager.goToPrevious(currentQuestion)}
                                    >
                                        <Text style={styles.buttonText}>Previous</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.placeholderButton} />
                                )}
                                <TouchableOpacity
                                    style={[styles.button, styles.nextButton]}
                                    onPress={() => {
                                        if (currentQuestion === questions.length - 1) {
                                            completeProfileCreation();
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
        </ImageBackground>
    );
};

export default ProfileCreation;
