import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions, ImageBackground } from 'react-native';
import ModalSelector from 'react-native-modal-selector';
import { useNavigation } from '@react-navigation/native';
import majorList from '../assets/majorList.json';
import ethnicity from '../assets/ethnicity.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../ProfileCreationStyles/ProfileCreationStyles';

const { height } = Dimensions.get('window');

// Ensure the Sac State logo is stored in your assets directory
const SAC_STATE_LOGO = require('../assets/sac-state-logo.png'); // Replace with the correct path to your logo file

// Class to represent a question in the profile creation process
class Question {
    constructor(id, text, inputType, options = [], placeholder = null) {
        this.id = id;
        this.text = text;
        this.inputType = inputType;
        this.options = options;
        this.placeholder = placeholder;
    }

    handleCondition(answer, actions) {
        if (this.conditional) {
            this.conditional(answer, actions);
        }
    }
}

// Class to manage the profile creation process, including navigation and answer handling
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
    const [preferredName, setPreferredName] = useState("");
    const [isCompleted, setIsCompleted] = useState(false);
    const navigation = useNavigation();

    // List of questions for the profile creation process
    const questions = [
        new Question(0, "Tell us your name! (Or preferred name)", "text"),
        new Question(1, "What is your race?", "dropdown", ethnicity["ethnicity"], "Select Race"),
        new Question(2, "How would you describe your student journey?", "checkbox", ["New Student", "Transfer student", "Returning student"]),
        new Question(3, "What’s your area of study?", "dropdown", majorList["major"], "Select College"),
        new Question(4, "What year are you in your studies?", "checkbox", ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"]),
        new Question(5, "Expected graduation date?", "graduationDate", ["Spring", "Fall"]),
        new Question(6, "What kinds of campus events interest you the most?", "checkbox", ["Workshops to boost your skills", "Fun and social meet-ups", "Sports and fitness activities", "Community service/volunteering"]),
        new Question(7, "What type of support could help you succeed?", "checkbox", ["Guidance for classes and grades", "Career advice and planning", "Wellness and mental health support", "Help with financial aid or scholarships"]),
        new Question(8, "Do you have any disabilities?", "checkbox", ["Yes", "No", "Prefer Not to Say"]),
        new Question(9, "Are you a Veteran?", "checkbox", ["Yes", "No", "Prefer Not to Say"])
    ];

    const profileCreationManager = new ProfileCreationManager(questions, setCurrentQuestion, setAnswers);

    // Function to mark profile creation as complete and send data to the server
    const completeProfileCreation = () => {
        setIsCompleted(true);
        sendProfileDataToServer();
    };

    // Function to send profile data to the server
    const sendProfileDataToServer = async () => {
        try {
            const specificAnswers = {
                question0: answers["0"], // preferred name
                question1: answers["1"], // race
                question2: answers["2"] === "Returning student" ? "reentry student" : answers["2"].toLowerCase(), // type of student (eg. new student, transfer)
                question3: answers["3"], // college
                question4: answers["4"] === "Graduate" ? "graduate student" : answers["4"].toLowerCase(), // what year are you? (eg. freshman, sophomore)
                question5: answers["5"]["semester"] + " " + answers["5"]["year"], // This will now contain { semester: "Spring/Fall", year: "2024" }
                question6: answers["6"], // what events
                question7: answers["7"], // other types of student
                question8: answer["8"], //Disability
                question9: answer[9]    //Veteran
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
                throw new Error('Error sending profile data to server');
            }

            // Navigate to the Dashboard after successful submission
            navigation.reset({
                index: 0,
                routes: [{ name: "Dashboard" }],
            });
        } catch (err) {
            console.error('Error sending profile answers: ', err);
            Alert.alert('Error', 'Failed to send profile answers. Please try again.');
        }
    };

    // Function to render the current question based on its input type
    const renderQuestion = (question) => {
        switch (question.inputType) {
            case "text":
                return (
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Preferred Name"
                            value={preferredName}
                            onChangeText={(text) => setPreferredName(text)}
                        />
                    </View>
                );
            case "checkbox":
                return (
                    <View style={styles.checkboxContainer}>
                        {question.options.map((option) => {
                            const isMultiSelect = question.id === 6 || question.id === 7;
                            let isSelected;
                            if (isMultiSelect) {
                                isSelected = (answers[question.id] || []).includes(option);
                            } else {
                                isSelected = answers[question.id] === option;
                            }
                            return (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.optionButton,
                                        isSelected && styles.selectedOptionButton
                                    ]}
                                    onPress={() => {
                                        if (isMultiSelect) {
                                            const currentAnswers = answers[question.id] || [];
                                            const newAnswers = currentAnswers.includes(option)
                                                ? currentAnswers.filter(item => item !== option)
                                                : [...currentAnswers, option];
                                            profileCreationManager.handleAnswer(question.id, newAnswers, currentQuestion);
                                        } else {
                                            profileCreationManager.handleAnswer(question.id, option, currentQuestion);
                                        }
                                    }}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        isSelected && styles.selectedOptionText
                                    ]}>{option}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                );
            case "dropdown":
                return (
                    <View style={styles.inputContainer}>
                        <ModalSelector
                            data={question.options}
                            initValue={question.placeholder}
                            onChange={(option) => {
                                setSelectedMajor(option.label);
                                profileCreationManager.handleAnswer(question.id, option.key, currentQuestion);
                            }}
                            style={styles.pickerContainer}
                            initValueTextStyle={styles.pickerText}
                            selectTextStyle={styles.pickerText}
                        />
                    </View>
                );
            case "graduationDate":
                return (
                    <View style={styles.inputContainer}>
                        <ModalSelector
                            data={question.options.map(option => ({ key: option, label: option }))}
                            initValue="Select semester"
                            onChange={(option) => {
                                profileCreationManager.handleAnswer(question.id, { semester: option.label, year: answers[question.id]?.year || "" }, currentQuestion);
                            }}
                            style={styles.pickerContainer}
                            initValueTextStyle={styles.pickerText}
                            selectTextStyle={styles.pickerText}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Graduation year (e.g., 2024)"
                            keyboardType="numeric"
                            value={answers[question.id]?.year || ""}
                            onChangeText={(text) => {
                                const currentYear = new Date().getFullYear();
                                // Allow 2024 and any year after the current year
                                if (text.length === 4 && (parseInt(text) <= currentYear || isNaN(parseInt(text)))) {
                                    Alert.alert("Error", "Please enter a valid graduation year (current year or later).");
                                    return;
                                }
                                const semester = answers[question.id]?.semester || "";
                                profileCreationManager.handleAnswer(question.id, { semester, year: text }, currentQuestion);
                            }}
                            maxLength={4}
                        />
                        {answers[question.id]?.semester && answers[question.id]?.year && (
                            <Text style={styles.selectedDropdownText}>
                                Selected: {answers[question.id].semester} {answers[question.id].year}
                            </Text>
                        )}
                    </View>
                );
            default:
                return (
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Your answer"
                            onChangeText={(text) => profileCreationManager.handleAnswer(question.id, text, currentQuestion)}
                        />
                    </View>
                );
        }
    };

    // Function to handle the "Next" button press
    const handleNextPress = () => {
        if (currentQuestion === 0) {
            if (preferredName.trim() === "") {
                Alert.alert("Error", "Please fill in your name.");
                return;
            }
            profileCreationManager.handleAnswer(0, preferredName, currentQuestion);
        }

        if (currentQuestion === 5) {
            const graduationDate = answers[5];
            const currentYear = new Date().getFullYear();
            if (!graduationDate?.semester || !graduationDate?.year || graduationDate.year.length !== 4 || parseInt(graduationDate.year) < currentYear) {
                Alert.alert("Error", "Please select a semester and enter a valid 4-digit year (current year or later).");
                return;
            }
        }

        if (currentQuestion === questions.length - 1) {
            setIsCompleted(true);
        } else {
            profileCreationManager.goToNext(currentQuestion);
        }
    };

    // Function to render the completion screen after all questions are answered
    const renderCompletionScreen = () => (
        <View style={styles.completionContainer}>
            <Text style={styles.completionText}>You have finished customizing your personal profile!</Text>
            <TouchableOpacity
                style={styles.largeButton}
                onPress={async () => {
                    try {
                        await sendProfileDataToServer();
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

