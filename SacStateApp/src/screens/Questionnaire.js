import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Keyboard, ImageBackground, Dimensions } from 'react-native';
import ModalSelector from 'react-native-modal-selector';
import { ProgressBar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import backgroundImage from './../assets/logInbackground.jpg';

const { height, width } = Dimensions.get('window');

class Question {
    constructor(id, text, options = [], conditional = null) {
        this.id = id;
        this.text = text;
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

class QuestionnaireManager {
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

const Questionnaire = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [selectedMajor, setSelectedMajor] = useState("");
    const [selectedDisability, setSelectedDisability] = useState("");
    const [name, setName] = useState("");
    const [isCompleted, setIsCompleted] = useState(false);
    const navigation = useNavigation();

    const questions = [
        new Question(0, "What is your full name?", []),
        new Question(1, "What is your major?", []),
        new Question(2, "What academic year are you in?", ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"]),
        new Question(3, "Do you have any disabilities?", ["Yes", "No", "Prefer not to say"], (answer, actions) => {
            answer === "Yes" ? actions.goToNext() : actions.skipQuestion();
        }),
        new Question(4, "If you have a disability, what kind do you have?", ["Physical", "Learning", "Visual", "Hearing", "Other"]),
        new Question(5, "Are you a veteran?", ["Yes", "No"]),
        new Question(6, "What's your sexual orientation?", ["Heterosexual", "Homosexual", "Bisexual", "Prefer not to say", "Other"])
    ];

    const questionnaireManager = new QuestionnaireManager(questions, setCurrentQuestion, setAnswers);

    const completeQuestionnaire = () => {
        setIsCompleted(true);
    };

    const restartQuestionnaire = () => {
        setCurrentQuestion(0);
        setAnswers({});
        setSelectedMajor("");
        setSelectedDisability("");
        setName("");
        setIsCompleted(false);
    };

    const renderQuestion = (question) => {
        if (question.id === 1) {
            return (
                <ModalSelector
                    data={[
                        { key: 'Computer Science', label: 'Computer Science' },
                        { key: 'Business', label: 'Business' },
                        { key: 'Biology', label: 'Biology' },
                        { key: 'Engineering', label: 'Engineering' },
                        { key: 'Other', label: 'Other' }
                    ]}
                    initValue="Select your major"
                    onChange={(option) => setSelectedMajor(option.label)}
                    style={styles.pickerContainer}
                    initValueTextStyle={styles.pickerText}
                    selectTextStyle={styles.pickerText}
                />
            );
        } else if (question.id === 4) {
            return (
                <ModalSelector
                    data={[
                        { key: 'Physical', label: 'Physical' },
                        { key: 'Learning', label: 'Learning' },
                        { key: 'Visual', label: 'Visual' },
                        { key: 'Hearing', label: 'Hearing' },
                        { key: 'Other', label: 'Other' }
                    ]}
                    initValue="Select disability type"
                    onChange={(option) => setSelectedDisability(option.label)}
                    style={styles.pickerContainer}
                    initValueTextStyle={styles.pickerText}
                    selectTextStyle={styles.pickerText}
                />
            );
        } else if (question.options.length > 0) {
            return question.options.map((option) => (
                <TouchableOpacity
                    key={option}
                    style={styles.optionButton}
                    onPress={() => questionnaireManager.handleAnswer(question.id, option, currentQuestion)}
                >
                    <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
            ));
        } else if (question.id === 0) {
            return (
                <TextInput
                    style={styles.input}
                    placeholder="Your name"
                    value={name}
                    onChangeText={(text) => setName(text)}
                    onSubmitEditing={() => questionnaireManager.handleAnswer(question.id, name, currentQuestion)}
                    blurOnSubmit={true}
                    onBlur={() => Keyboard.dismiss()}
                />
            );
        } else {
            return (
                <TextInput
                    style={styles.input}
                    placeholder="Your answer"
                    onChangeText={(text) => questionnaireManager.handleAnswer(question.id, text, currentQuestion)}
                />
            );
        }
    };

    const renderCompletionScreen = () => (
        <View style={styles.completionContainer}>
            <Text style={styles.completionText}>You have finished customizing your personal profile!</Text>
            <TouchableOpacity style={styles.largeButton} onPress={restartQuestionnaire}>
                <Text style={styles.largeButtonText}>Redo</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.largeButton}
                onPress={() => navigation.navigate('Home')}
            >
                <Text style={styles.largeButtonText}>Return to Home</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <ImageBackground source={backgroundImage} style={styles.background}>
            <View style={styles.overlay}>
                <ScrollView contentContainerStyle={styles.container}>
                    {isCompleted ? (
                        renderCompletionScreen()
                    ) : (
                        <>
                            <ProgressBar progress={(currentQuestion + 1) / questions.length} color="#B3A369" style={styles.progressBar} />
                            <Text style={styles.heading}>Question {currentQuestion + 1} of {questions.length}</Text>
                            <View style={styles.box}>
                                <Text style={styles.questionText}>{questions[currentQuestion].text}</Text>
                                {renderQuestion(questions[currentQuestion])}
                            </View>
                            <View style={styles.navigationButtons}>
                                <TouchableOpacity style={styles.button} onPress={() => questionnaireManager.goToPrevious(currentQuestion)} disabled={currentQuestion === 0}>
                                    <Text style={styles.buttonText}>Previous</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => {
                                        if (currentQuestion === questions.length - 1) {
                                            completeQuestionnaire();
                                        } else {
                                            questionnaireManager.goToNext(currentQuestion);
                                        }
                                    }}
                                >
                                    <Text style={styles.buttonText}>{currentQuestion < questions.length - 1 ? "Next" : "Submit"}</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </ScrollView>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', width: '100%' },
    container: { padding: 20, backgroundColor: 'transparent', flex: 1 },
    progressBar: { width: '100%', marginVertical: 20 },
    heading: { fontSize: 26, fontWeight: 'bold', color: 'white', marginBottom: 15, textAlign: 'center' },
    box: { 
        backgroundColor: '#c4b581', 
        borderRadius: 10, 
        padding: 20, 
        width: '80%', 
        minHeight: height * 0.2, 
        justifyContent: 'center', 
        alignItems: 'center', 
        alignSelf: 'center',
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.25, 
        shadowRadius: 3.5, 
        elevation: 5, 
        marginVertical: 10 
    },
    questionText: { fontSize: 20, color: '#043927', fontWeight: '500', textAlign: 'center', marginBottom: 20 },
    optionButton: { padding: 14, backgroundColor: '#043927', marginVertical: 5, borderRadius: 8, width: '90%', alignItems: 'center' },
    optionText: { fontSize: 18, color: '#FFFFFF', fontWeight: '500' },
    input: { padding: 12, borderWidth: 1, borderColor: 'gray', borderRadius: 5, backgroundColor: 'white', marginBottom: 10, width: '90%' },
    pickerContainer: { width: '90%', backgroundColor: 'white', borderRadius: 8, borderColor: '#043927', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 12 },
    pickerText: { color: '#043927', fontSize: 18, textAlign: 'center' },
    navigationButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, width: '90%', alignSelf: 'center' },
    button: { paddingVertical: 12, paddingHorizontal: 30, backgroundColor: '#043927', borderRadius: 12, width: '45%', alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: '500', textAlign: 'center' },
    completionContainer: { alignItems: 'center', padding: 30 },
    completionText: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 25, textAlign: 'center' },
    largeButton: { paddingVertical: 12, paddingHorizontal: 40, backgroundColor: '#043927', borderRadius: 10, width: '80%', marginVertical: 10, alignItems: 'center' },
    largeButtonText: { color: 'white', fontSize: 18, fontWeight: '600', alignItems: 'center', textAlign: 'center'},
});

export default Questionnaire;

