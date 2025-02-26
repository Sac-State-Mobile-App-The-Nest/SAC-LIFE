import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions, ImageBackground } from 'react-native';
import ModalSelector from 'react-native-modal-selector';
import { useNavigation } from '@react-navigation/native';
import majorList from '../assets/majorList.json';
import ethnicity from '../assets/ethnicity.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../ProfileCreationStyles/ProfileCreationStyles';

const { height } = Dimensions.get('window');
const SAC_STATE_LOGO = require('../assets/sac-state-logo.png');

// Question class to represent a question in the profile creation process
class Question {
    constructor(id, text, inputType, options = [], placeholder = null) {
        this.id = id;
        this.text = text;
        this.inputType = inputType;
        this.options = options;
        this.placeholder = placeholder;
    }
}

// ProfileCreationManager class to manage the profile creation process
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

    handleAnswer(questionId, answer, currentQuestion) {
        this.setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    }
}

// Function to validate the graduation year input
const validateGraduationYear = (text, selectedYear) => {
    const currentYear = new Date().getFullYear();
    const minimumGraduationYear = getMinimumGraduationYear(selectedYear);

    if (text.length === 4) {
        const inputYear = parseInt(text);
        if (isNaN(inputYear)) {
            return { isValid: false, message: "Please enter a valid 4-digit year." };
        }
        if (inputYear < currentYear) {
            return { isValid: false, message: "Invalid Year: Graduation year cannot be before the current year." };
        }
        if (inputYear < minimumGraduationYear) {
            return { isValid: false, message: `Invalid Year: Graduation year must be ${minimumGraduationYear} or later for a ${selectedYear}.` };
        }
        return { isValid: true, message: "" };
    } else if (text.length > 4) {
        return { isValid: false, message: "Invalid Year: Please enter a valid 4-digit year." };
    }
    return { isValid: true, message: "" };
};

// Function to calculate the minimum graduation year based on the selected year in studies
const getMinimumGraduationYear = (selectedYear) => {
    const currentYear = new Date().getFullYear();
    switch (selectedYear) {
        case "Freshman":
            return currentYear + 3;
        case "Sophomore":
            return currentYear + 2;
        case "Junior":
            return currentYear + 1;
        case "Senior":
            return currentYear;
        default:
            return currentYear;
    }
};

// Function to send profile data to the server
const sendProfileDataToServer = async (answers, navigation) => {
    try {
        const specificAnswers = {
            question0: answers["0"],    //name
            question1: answers["1"],    //race
            question2: answers["2"] === "Returning student" ? "reentry student" : answers["2"].toLowerCase(), //student status
            question3: answers["3"],    //area of study
            question4: answers["4"] === "Graduate" ? "graduate student" : answers["4"].toLowerCase(), //student year
            question5: answers["5"]["semester"] + " " + answers["5"]["year"],   //student graduation 
            question6: answers["6"],    //campus interest
            question7: answers["7"],    //campus support
            question8: answers["8"],    //disability check
            question9: answers["9"]     //veteran check
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

        navigation.reset({
            index: 0,
            routes: [{ name: "Dashboard" }],
        });
    } catch (err) {
        console.error('Error sending profile answers: ', err);
        Alert.alert('Error', 'Failed to send profile answers. Please try again.');
        navigation.reset({
            index: 0,
            routes: [{ name: "Dashboard" }],
        });
    }
};

// Component to render the completion screen
const CompletionScreen = ({ onPress }) => (
    <View style={styles.completionContainer}>
        <Text style={styles.completionText}>You have finished customizing your personal profile!</Text>
        <TouchableOpacity style={styles.largeButton} onPress={onPress}>
            <Text style={styles.largeButtonText}>Create Your Profile!</Text>
        </TouchableOpacity>
    </View>
);

// Component to render a single question
const QuestionRenderer = ({ question, answers, profileCreationManager, currentQuestion, preferredName, setPreferredName }) => {
    switch (question.inputType) {
        case "text":
            return (
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Preferred Name"
                        value={preferredName}
                        onChangeText={setPreferredName}
                    />
                </View>
            );
        case "checkbox":
            return (
                <View style={styles.checkboxContainer}>
                    {(question.id === 6 || question.id === 7) && (
                        <Text style={styles.selectAllText}>(Select all that may apply)</Text>
                    )}
                    {question.options.map((option) => {
                        const isMultiSelect = question.id === 6 || question.id === 7;
                        const isSelected = isMultiSelect ? (answers[question.id] || []).includes(option) : answers[question.id] === option;
                        return (
                            <TouchableOpacity
                                key={option}
                                style={[styles.optionButton, isSelected && styles.selectedOptionButton]}
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
                                <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>{option}</Text>
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
                        onChange={(option) => profileCreationManager.handleAnswer(question.id, option.key, currentQuestion)}
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
                        onChange={(option) => profileCreationManager.handleAnswer(question.id, { semester: option.label, year: answers[question.id]?.year || "" }, currentQuestion)}
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
                            const validation = validateGraduationYear(text, answers[4]);
                            if (!validation.isValid) {
                                Alert.alert("Error", validation.message);
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
            return null;
    }
};

// Main ProfileCreation component
const ProfileCreation = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [preferredName, setPreferredName] = useState("");
    const [isCompleted, setIsCompleted] = useState(false);
    const navigation = useNavigation();

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

    const handleNextPress = () => {
        if (currentQuestion === 0 && preferredName.trim() === "") {
            Alert.alert("Error", "Please fill in your name.");
            return;
        }

        if (currentQuestion === 5) {
            const graduationDate = answers[5];
            const currentYear = new Date().getFullYear();
            const selectedYear = answers[4];
            const minimumGraduationYear = getMinimumGraduationYear(selectedYear);

            if (!graduationDate?.semester || !graduationDate?.year || graduationDate.year.length !== 4 || parseInt(graduationDate.year) < minimumGraduationYear) {
                Alert.alert("Error", `Please select a semester and enter a valid 4-digit year (${minimumGraduationYear} or later).`);
                return;
            }
        }

        if (currentQuestion === questions.length - 1) {
            setIsCompleted(true);
        } else {
            profileCreationManager.goToNext(currentQuestion);
        }
    };

    return (
        <ImageBackground source={SAC_STATE_LOGO} style={styles.background} imageStyle={styles.logoImage}>
            <View style={styles.logoContainer}>
                <ScrollView contentContainerStyle={styles.container}>
                    {isCompleted ? (
                        <CompletionScreen onPress={() => sendProfileDataToServer(answers, navigation)} />
                    ) : (
                        <>
                            <Text style={styles.heading}>Question {currentQuestion + 1} of {questions.length}</Text>
                            <View style={styles.box}>
                                <Text style={styles.questionText}>{questions[currentQuestion].text}</Text>
                                <QuestionRenderer
                                    question={questions[currentQuestion]}
                                    answers={answers}
                                    profileCreationManager={profileCreationManager}
                                    currentQuestion={currentQuestion}
                                    preferredName={preferredName}
                                    setPreferredName={setPreferredName}
                                />
                            </View>
                            <View style={styles.navigationButtons}>
                                {currentQuestion !== 0 && (
                                    <TouchableOpacity
                                        style={[styles.button, styles.previousButton]}
                                        onPress={() => profileCreationManager.goToPrevious(currentQuestion)}
                                    >
                                        <Text style={styles.buttonText}>Previous</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={[styles.button, styles.nextButton]}
                                    onPress={handleNextPress}
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