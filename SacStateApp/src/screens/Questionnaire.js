import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Linking, TextInput, Alert } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { Tooltip } from 'react-native-elements';

class Question {
    constructor(id, text, options, conditional = null, tooltip = "") {
        this.id = id;
        this.text = text;
        this.options = options;
        this.conditional = conditional;
        this.tooltip = tooltip;
    }

    handleCondition(answer, actions) {
        return this.conditional ? this.conditional(answer, actions) : actions.goToNext();
    }
}

class QuestionnaireLogic {
    constructor(questions, actions) {
        this.questions = questions;
        this.answers = {};
        this.actions = actions;
    }

    answerQuestion(questionId, answer) {
        this.answers[questionId] = answer;
        this.questions[questionId].handleCondition(answer, this.actions);
    }

    get currentAnswer() {
        return (questionId) => this.answers[questionId] || null;
    }
}

const Questionnaire = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showResource, setShowResource] = useState(null);
    const [contactInfo, setContactInfo] = useState("");
    const [showReview, setShowReview] = useState(false);

    const actions = {
        goToNext: () => setCurrentQuestion((prev) => Math.min(prev + 1, questions.length - 1)),
        goToPrevious: () => setCurrentQuestion((prev) => Math.max(prev - 1, 0)),
        showResource: (resource) => setShowResource(resource),
        hideResource: () => setShowResource(null),
        showReview: () => setShowReview(true),
        hideReview: () => setShowReview(false),
    };

    const questions = [
        new Question(0, "How are you feeling today?", ["Great", "Fine", "Can't Complain", "Could be Better", "Bad"],
            (answer, actions) => answer === "Bad" ? actions.showResource('mentalHealth') : actions.goToNext()),

        new Question(1, "Do you require any physical accessibility accommodations, such as wheelchair access or assistive technologies?", ["Yes", "No", "Not Sure"],
            (answer, actions) => answer === "Yes" ? actions.showResource('accessibility') : actions.goToNext(), 
            "Examples include screen readers, wheelchair ramps, etc."),

        new Question(2, "Would you benefit from additional tutoring or academic support resources?", ["Yes, regularly", "Sometimes", "No"],
            (answer, actions) => (answer === "Yes, regularly" || answer === "Sometimes") ? actions.showResource('tutoring') : actions.goToNext()),

        new Question(3, "Are you experiencing any difficulties with financial aid, tuition, or housing?", ["Yes", "No", "Prefer not to say"],
            (answer, actions) => answer === "Yes" ? actions.showResource('financialAid') : actions.goToNext()),

        new Question(4, "Would you like more guidance with career planning, internships, or job placement?", ["Yes", "No", "I have enough support"],
            (answer, actions) => answer === "Yes" ? actions.showResource('careerSupport') : actions.goToNext()),

        new Question(5, "Are you aware of on-campus health services available to you?", ["Yes", "No", "Not Sure"],
            (answer, actions) => answer === "No" ? actions.showResource('healthServices') : actions.goToNext()),

        new Question(6, "Do you need support with online learning tools or access to technology?", ["Yes", "No", "Sometimes"],
            (answer, actions) => (answer === "Yes" || answer === "Sometimes") ? actions.showResource('digitalLearning') : actions.goToNext()),

        new Question(7, "How would you like to receive information about campus resources and updates?", ["Email", "Text Message", "Campus Portal", "Do not wish to receive updates"]),

        new Question(8, "How satisfied are you with the campus facilities (e.g., library, student center, study spaces)?", ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"]),

        new Question(9, "What additional support or resources would you find helpful in your academic journey?", [], null),
    ];

    const questionnaire = new QuestionnaireLogic(questions, actions);

    const handleOptionChange = (option) => {
        questionnaire.answerQuestion(currentQuestion, option);
    };

    const Option = ({ option }) => (
        <TouchableOpacity onPress={() => handleOptionChange(option)} style={[
            styles.optionButton, questionnaire.get.currentAnswer(currentQuestion) === option && styles.selectedOption
        ]}>
            <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
    );

    const ResourceLink = ({ resource }) => {
        const resources = {
            mentalHealth: {
                text: "For mental health support, visit:",
                link: "https://www.csus.edu/student-life/health-counseling/",
                name: "Sacramento State University Mental Health Services"
            },
            accessibility: {
                text: "For accessibility accommodations, check out:",
                link: "https://www.csus.edu/accessibility/",
                name: "Sacramento State Accessibility Services"
            },
            tutoring: {
                text: "Explore academic tutoring options at:",
                link: "https://www.csus.edu/academic-support/",
                name: "Academic Support Services"
            },
            financialAid: {
                text: "For financial aid and housing support, visit:",
                link: "https://www.csus.edu/student-affairs/financial-aid-scholarships/",
                name: "Financial Aid Services"
            },
            careerSupport: {
                text: "Learn about career planning resources here:",
                link: "https://www.csus.edu/student-life/career-center/",
                name: "Career Center"
            },
            healthServices: {
                text: "For on-campus health services, check out:",
                link: "https://www.csus.edu/student-life/health-counseling/",
                name: "Health Services"
            },
            digitalLearning: {
                text: "For support with online learning tools, visit:",
                link: "https://www.csus.edu/information-resources-technology/",
                name: "Digital Learning Support"
            }
        };

        const resourceInfo = resources[resource];
        return (
            <View style={styles.resourceContainer}>
                <Text style={styles.resourceText}>{resourceInfo.text}</Text>
                <Text style={styles.resourceLink} onPress={() => Linking.openURL(resourceInfo.link)}>
                    {resourceInfo.name}
                </Text>
            </View>
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <ProgressBar progress={(currentQuestion + 1) / questions.length} color="#B3A369" style={styles.progressBar} />
            <Text style={styles.progressText}>{Math.round(((currentQuestion + 1) / questions.length) * 100)}% Completed</Text>
            <Text style={styles.heading}>Question {currentQuestion + 1} of {questions.length}</Text>
            
            <View style={styles.questionContainer}>
                <Text style={styles.questionText}>
                    {questions[currentQuestion].text}
                    {questions[currentQuestion].tooltip && (
                        <Tooltip popover={<Text>{questions[currentQuestion].tooltip}</Text>}>
                            <Text style={styles.tooltipText}> [?]</Text>
                        </Tooltip>
                    )}
                </Text>
            </View>

            {questions[currentQuestion].options.length > 0 ? (
                <View style={styles.optionsContainer}>
                    {questions[currentQuestion].options.map((option, index) => (
                        <Option key={index} option={option} />
                    ))}
                </View>
            ) : (
                <TextInput
                    style={styles.input}
                    placeholder="Your answer"
                    onChangeText={text => setContactInfo(text)}
                    value={contactInfo}
                />
            )}

            {showResource && <ResourceLink resource={showResource} />}

            <View style={styles.navigationButtons}>
                <TouchableOpacity style={[styles.button, styles.prevButton]} onPress={actions.goToPrevious} disabled={currentQuestion === 0}>
                    <Text style={styles.buttonText}>Previous</Text>
                </TouchableOpacity>
                {currentQuestion < questions.length - 1 ? (
                    <TouchableOpacity style={[styles.button, styles.nextButton]} onPress={actions.goToNext}>
                        <Text style={styles.buttonText}>Next</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={() => actions.showReview()}>
                        <Text style={styles.buttonText}>Review & Submit</Text>
                    </TouchableOpacity>
                )}
            </View>

            {showReview && (
                <View style={styles.reviewContainer}>
                    <Text style={styles.reviewHeading}>Review Your Answers</Text>
                    {questions.map((question, index) => (
                        <View key={index} style={styles.reviewItem}>
                            <Text style={styles.questionText}>{question.text}</Text>
                            <Text style={styles.answerText}>
                                {questionnaire.answers[index] || "No answer provided"}
                            </Text>
                        </View>
                    ))}
                    <TextInput
                        style={styles.input}
                        placeholder="Contact Information (Optional)"
                        onChangeText={text => setContactInfo(text)}
                        value={contactInfo}
                    />
                    <TouchableOpacity
                        style={[styles.button, styles.submitButton]}
                        onPress={() => Alert.alert("Submission Complete", "Thank you for completing the questionnaire!")}
                    >
                        <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => actions.hideReview()}>
                        <Text style={styles.buttonText}>Edit Answers</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, alignItems: 'center', backgroundColor: '#F0F3EF' },
    progressBar: { width: '100%', marginVertical: 20, height: 8, borderRadius: 5 },
    progressText: { fontSize: 14, color: '#4A4A4A', textAlign: 'center', marginBottom: 10 },
    heading: { fontSize: 20, fontWeight: 'bold', color: '#0E7A5F', marginBottom: 20 },
    questionContainer: { width: '100%', alignItems: 'center', marginBottom: 20, padding: 15, backgroundColor: '#fff', borderRadius: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 5 },
    questionText: { fontSize: 16, color: '#4A4A4A', textAlign: 'center' },
    tooltipText: { color: '#0E7A5F', fontSize: 14 },
    optionsContainer: { width: '100%', alignItems: 'center' },
    optionButton: {
        backgroundColor: '#F0F3EF', borderColor: '#0E7A5F', borderWidth: 1,
        borderRadius: 10, padding: 12, marginVertical: 5, width: '80%', alignItems: 'center',
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3,
    },
    selectedOption: { backgroundColor: '#B3A369' },
    optionText: { color: '#0E7A5F', fontSize: 16 },
    resourceContainer: { backgroundColor: '#E0E7D8', padding: 15, borderRadius: 10, marginVertical: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 },
    resourceText: { color: '#4A4A4A', fontSize: 14, marginBottom: 10, textAlign: 'center' },
    resourceLink: { color: '#0E7A5F', textDecorationLine: 'underline', textAlign: 'center' },
    navigationButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 },
    button: { borderRadius: 10, padding: 12, width: '45%', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 5 },
    prevButton: { backgroundColor: '#B0BEC5' },
    nextButton: { backgroundColor: '#B3A369' },
    submitButton: { backgroundColor: '#0E7A5F' },
    editButton: { backgroundColor: '#FFD700', marginTop: 10 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    reviewContainer: { padding: 20, backgroundColor: '#FFFFFF', borderRadius: 10, marginVertical: 20, width: '90%', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 5 },
    reviewHeading: { fontSize: 18, fontWeight: 'bold', color: '#0E7A5F', marginBottom: 10, textAlign: 'center' },
    reviewItem: { marginBottom: 15 },
    answerText: { fontSize: 16, color: '#4A4A4A' },
    input: { width: '90%', padding: 10, borderColor: '#0E7A5F', borderWidth: 1, borderRadius: 10, marginTop: 10, backgroundColor: '#FFF', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 },
});

export default Questionnaire