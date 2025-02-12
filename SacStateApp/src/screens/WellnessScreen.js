import React, { useState } from 'react';
//import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ImageBackground } from 'react-native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions, ImageBackground } from 'react-native';
import ModalSelector from 'react-native-modal-selector';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import styles from '../WellnessStyles/WellnessStyles';

const { height } = Dimensions.get('window');

// Ensure the Sac State logo is stored in your assets directory
const SAC_STATE_LOGO = require('../assets/sac-state-logo.png'); // Replace with the correct path to your logo file


//What kind of questions are needed? Not text most likely, so just multiple choice and check boxes? (Leaving all setup for now)
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


const WellnessCreation = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const navigation = useNavigation();

  const questions = [
  new Question(0, "How are you feeling overall?", "checkbox", ["Bad", "Decent", "Good", "Great"]),
  new Question(1, "How many units are you taking?", "dropdown", ["3-9", "10-15", "16+"]),
  new Question(2, "What year are you in your studies?", "checkbox", ["First-year (Freshman)", "Second-year (Sophomore)", "Third-year (Junior)", "Fourth-year (Senior+)", "Graduate/Professional"]),
  new Question(3, "What type of support could help you succeed?", "checkbox", ["Guidance for classes and grades", "Career advice and planning", "Wellness and mental health support", "Help with financial aid or scholarships"]),
];

  const wellnessCheckInManager = new WellnessCheckInManager(questions, setCurrentQuestion, setAnswers);

  const completeWellnessCheckIn = () => {
      setIsCompleted(true);
      console.log(answers);
      //sendProfileDataToServer();
  };

  // NEED TO SEND DATA TO SERVER HERE

  const renderQuestion = (question) => {
      switch (question.inputType) {
          case "checkbox":
              return question.options.map((option) => (
                  <TouchableOpacity
                      key={option}
                      style={styles.optionButton}
                      onPress={() => wellnessCheckInManager.handleAnswer(question.id, option, currentQuestion)}
                  >
                      <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
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
              return (
                  <TextInput
                      style={styles.input}
                      placeholder="Input here"
                      onChangeText={(text) => wellnessCheckInManager.handleAnswer(question.id, text, currentQuestion)}
                  />
              );
      }
  };

  const handleNextPress = () => {  
      if (currentQuestion === questions.length - 1) {
          setIsCompleted(true);
      } else {
        wellnessCheckInManager.goToNext(currentQuestion);
      }
  };
  
  const renderCompletionScreen = () => (
    <View style={styles.completionContainer}>
        <Text style={styles.completionText}>Thank you for checking in!</Text>
        <TouchableOpacity
            style={styles.largeButton}
            onPress={async () => {
                try {
                    //await sendProfileDataToServer();
                    navigation.reset({
                        index: 0,
                        routes: [{ name: "Dashboard" }],
                    });
                } catch (error) {
                    console.error("Error submitting Wellness data:", error);
                    Alert.alert("Error", "Failed to submit Wellness data. Please try again.");
                }
            }}
        >
            <Text style={styles.largeButtonText}>Finish Check-in!</Text>
        </TouchableOpacity>
    </View>
);

  return (
      <ImageBackground
          source={SAC_STATE_LOGO}
          style={styles.background}
          imageStyle={styles.logoImage}
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
                                      onPress={() => wellnessCheckInManager.goToPrevious(currentQuestion)}
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
                                        completeWellnessCheckIn();
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

export default WellnessCreation;
