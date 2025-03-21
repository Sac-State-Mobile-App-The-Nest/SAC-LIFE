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

// NEEDS WORK !!!
const QuestionRenderer = (question, wellnessCheckInManager) => {
    console.log("Rendering question: ", question); // Debugging
    switch (question.inputType) {
        case "checkbox":
            return question.options.map((option) => (
                <View style={styles.inputContainer}>    
                    <TouchableOpacity
                        key={option}
                        style={styles.optionButton}
                        onPress={() => wellnessCheckInManager.handleAnswer(question.id, option, currentQuestion)}
                    >
                        <Text style={styles.optionText}>{option}</Text>
                    </TouchableOpacity>
                </View>
            ));
        case "dropdown":
            return (
                <ModalSelector
                    data={question.options}
                    initValue="Select your unit count"
                    onChange={(option) => {
                        setSelectedMajor(option.label);
                        wellnessCheckInManager.handleAnswer(question.id, option.label, currentQuestion);
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
                    initValue="Click to choose"
                    onChange={(option) => {
                        setSelectedClub(option.label);
                        wellnessCheckInManager.handleAnswer(question.id, option.label, currentQuestion);
                    }}
                    style={styles.pickerContainer}
                    initValueTextStyle={styles.pickerText}
                    selectTextStyle={styles.pickerText}
                />
            );
        default:
            console.log("Rendering default input"); // Debugging
            return (
                <TextInput
                    style={styles.input}
                    placeholder="Input here"
                    onChangeText={(text) => wellnessCheckInManager.handleAnswer(question.id, text, currentQuestion)}
                />
            );
    }
};

const WellnessCreation = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(0)).current;

  const questions = [
    //new Question(0, "How many units are you taking?", "checkbox", ["1-2", "3-9", "10-15", "16+"]),
    new Question(0, "Do you feel that you need academic assistance?", "checkbox", ["Disagree", "Slightly Disagree", "Neither Agree nor Disagree", "Slightly Agree", "Agree"]),
    //new Question(2, "Are you looking for help with a resume?", "checkbox", ["Not at the moment", "Yes I am"]),
    new Question(1, "I feel safe on campus.", "checkbox", ["Disagree", "Slightly Disagree", "Neither Agree nor Disagree", "Slightly Agree", "Agree"]),
    //new Question(4, "How has your overall health been this semester?", "checkbox", ["Very Poor", "Poor", "Fair", "Good", "Very Good"]),
    new Question(2, "Over the last few weeks, have you been feeling nervious, easily irritable, tired, worried and/or restless?", "checkbox", ["Not at all", "Some days", "Nearly every day"]),
    new Question(3, "Are you happy with how your school life is going?", "checkbox", ["Disagree", "Slightly Disagree", "Neither Agree nor Disagree", "Slightly Agree", "Agree"]),
    new Question(4, "In the last twelve months did you ever eat less or skip meals due to financial  situations?", "checkbox", ["Often True", "Sometimes True", "Never True", "Don't Know/Refuse to Answer"]),
    //new Question(8, "I know where I can get help on campus for health and psychological needs.", "checkbox", ["Strongly Disagree", "Disagree", "Slightly Disagree", "Neither Agree nor Disagree", "Slightly Agree", "Agree", "Strongly Agree"]),
    new Question(5, "Is there anything you would like to add about your school life or wellbeing?", "text"),
];

  const wellnessCheckInManager = new WellnessCheckInManager(questions, setCurrentQuestion, setAnswers);

  const handleNextPress = () => {  
      if (currentQuestion === questions.length - 1) {
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
                                    answers={answers}
                                    wellnessCheckInManager={wellnessCheckInManager}
                                    currentQuestion={currentQuestion}
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
