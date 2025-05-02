import React, { useState }  from 'react';
import { View, Text, Modal, TextInput, Button, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import styles from '../styles/SettingsStyles';
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { mutedDarkGreen, darkGray } from '../SacStateColors/GeneralColors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../apiConfig.js';
import axios from 'axios';

const ProfileModals = ({ modalVisible, modalContent, newPassword, setNewPassword, newPreferredName, setNewPreferredName, updateNameFunction, 
  updatePasswordFunction, setModalVisible, newPassword2, setNewPassword2, oldPassword, setOldPassword, setModalContent, navigation, logout}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  //is called when user decides to download their chatbot history
  const downloadHerkyBotHistory = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/students/requestChatLogs`,
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          } 
        });
      const chatHistoryData = response.data;
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { text-align: center; }
              ul { list-style-type: none; padding: 0; }
              li { margin-bottom: 10px; }
              strong { color: darkgreen; }
            </style>
          </head>
          <body>
            <h1>Chatbot Conversation History</h1>
            <ul>
              ${chatHistoryData.map(chat => `
                <li><strong>Time:</strong> ${new Date(chat.timestamp).toLocaleString()}</li>
                <li><strong>Student:</strong> ${chat.student_question}</li>
                <li><strong>Bot:</strong> ${chat.bot_response}</li>
                <li><strong>Session ID:</strong> ${chat.session_id}</li>
                <br>
              `).join("")}
            </ul>
          </body>
        </html>
      `;
  
      //generate a pdf file
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
  
      //let user share the pdf file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("Error", "Sharing not available on this device");
      }
    } catch (error) {
      console.log("Error:", error);
      Alert.alert("Error", "Failed to retrieve chat logs.");
    }
  };

  const deactivateAccountConfirm = async () => {
    try{
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(`${BASE_URL}/api/login_info/deactivateAccount`,
        {}, 
        { 
          headers: { Authorization: `Bearer ${token}` } 
        }
      );
      //if deactivated was set to true in the database, account should be logged out
      let result = response.data.deactivated;
      console.log(result);
      if (result) {
        setModalVisible(false);
        Alert.alert("Success", "Your account has been deactivated.");
        logout(navigation);
      } else {
        setModalVisible(false);
        Alert.alert("Error", "Unable to deactivate your account. Try again");
      }
    } catch (error){
      Alert.alert("Error", "Failed to deactivate account");
    }
  }

  //when user confirms they want to delete their chatbot history
  const deleteHerkyBotHistory = async () => {
    //call api to delete chat history
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('delete clicked');
      const response = await axios.delete(`${BASE_URL}/api/students/deleteChatLogs`, 
        { 
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log('deleted');
      if (response.data.success) {
        setModalVisible(false);
        Alert.alert("Success", "HerkyBot history cleared");
      } else {
        setModalVisible(false);
        Alert.alert("Error", "Unable to delete HerkyBot history. Try again");
      }
    } catch (err){
      Alert.alert("Error", "Unable to delete HerkyBot history");
    }
  }

  return (
    <Modal visible={modalVisible} animationType="fade" transparent={true}>
    <BlurView intensity={40} style={styles.blurBackground}>
      <View style={styles.centeredModal}>
        {/*Changing their profile name*/}
        {modalContent === 'editProfileName' && (
          <View>
            <Text style={styles.modalTitle}>Change Your Profile Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter new preferred name"
              value={newPreferredName}
              onChangeText={setNewPreferredName}
            />
            <TouchableOpacity style={styles.saveButton} onPress={updateNameFunction}>
              <Text style={styles.saveButtonText}>SAVE</Text>
            </TouchableOpacity>
          </View>
        )}
        {/*Changing their password*/}
        {modalContent === 'editPassword' && (
          <View>
            <Text style={styles.modalTitle}>Change Your Password</Text>
            <View style={styles.inputPasswordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Enter old password"
                secureTextEntry={!isPasswordVisible}
                value={oldPassword}
                onChangeText={setOldPassword}
              />
              <TouchableOpacity style={styles.eyeIconContainer} onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <Ionicons 
                  name={isPasswordVisible ? 'eye-off' : 'eye'} 
                  size={24} 
                  color="gray"
                  style={styles.eyeIcon} 
                />
              </TouchableOpacity>
            </View>
            <View style={styles.inputPasswordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Enter new password"
                secureTextEntry={!isPasswordVisible}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity style={styles.eyeIconContainer} onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <Ionicons 
                  name={isPasswordVisible ? 'eye-off' : 'eye'} 
                  size={24} 
                  color="gray"
                  style={styles.eyeIcon} 
                />
              </TouchableOpacity>
            </View>
            <View style={styles.inputPasswordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Confirm new password"
                secureTextEntry={!isPasswordVisible}
                value={newPassword2}
                onChangeText={setNewPassword2}
              />
              <TouchableOpacity style={styles.eyeIconContainer} onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <Ionicons 
                  name={isPasswordVisible ? 'eye-off' : 'eye'} 
                  size={24} 
                  color="gray"
                  style={styles.eyeIcon} 
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={() => updatePasswordFunction(oldPassword, newPassword, newPassword2)}>
              <Text style={styles.saveButtonText}>CHANGE PASSWORD</Text>
            </TouchableOpacity>
          </View>
        )}
        {/*Download their chatbot data*/}
        {modalContent === 'downloadChatbotData' && (
          <View>
            <Text style={styles.modalTitle}>Are you sure your want to download your HerkyBot chat history?</Text>
            <TouchableOpacity style={styles.saveButton} onPress={downloadHerkyBotHistory}>
              <Text style={styles.saveButtonText}>DOWNLOAD</Text>
            </TouchableOpacity>
          </View>
        )}
        {/*Delete their chatbot data - devin working on this in separate task. can move here later*/}
        {modalContent === 'deleteChatbotData' && (
          <View>
            <Text style={styles.modalTitle}>Are you sure your want to delete your HerkyBot chat history?
            There is no going back.</Text>
            <TouchableOpacity style={styles.saveButton} onPress={deleteHerkyBotHistory}>
              <Text style={styles.saveButtonText}>CONFIRM</Text>
            </TouchableOpacity>
          </View>
        )}
        {/*Delete their account */}
        {modalContent === 'deactivateAccount' && (
          <View>
            <Text style={styles.modalTitle}>
              Are you sure your want to delete your account? There is no going back.
            </Text>
            <TouchableOpacity style={styles.saveButton} onPress={() => setModalContent('confirmDeactivation')}>
              <Text style={styles.saveButtonText}>YES</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Second Confirmation Modal */}
        {modalContent === 'confirmDeactivation' && (
          <View>
            <Text style={styles.modalTitle}>
              This is your final confirmation. Are you absolutely sure?
            </Text>
            <TouchableOpacity style={styles.saveButton} onPress={deactivateAccountConfirm}>
              <Text style={styles.saveButtonText}>CONFIRM</Text>
            </TouchableOpacity>
          </View>
        )}
        {modalContent === 'about' && (
          <View>
            <ScrollView contentContainerStyle={styles.containerTOS}>
              <Text style={styles.headerTOS}>Sac State LIFE is your all-in-one app for navigating campus life. From chatbot assistance to event updates, we've got you covered!</Text>
              <Text style={styles.sectionHeaderTOS}>Project Product Owner</Text>
              <Text style={styles.paragraphTOS}>        
                - Dr. Basia D.Ellis, Ph.D. - Principal Investigator, Associate Professor, Organization: Department of Undergraduate Studies in Education.
              </Text>
              <Text style={styles.sectionHeaderTOS}>Honorable Mentions</Text>
              <Text style={styles.paragraphTOS}>        
                - Bobby Reed - Technology Lead for LIFE App, Founder and CEO of Capitol Tech Solutions
              </Text>

              <Text style={styles.sectionHeaderTOS}>Developed by The Nest Team at Sac State</Text>
              <Text style={styles.paragraphTOS}>        
                - Nicholas Lewis{"\n"}
                - Christian Buco{"\n"}
                - Bryce Chao{"\n"}
                - Vinny Thai{"\n"}
                - Darryl Nguyen{"\n"}
                - Randy Pham{"\n"}
                - Justin Rivera{"\n"}
                - Devin Grace{"\n"}
                - Aaron Jumawan{"\n"}
              </Text>

              <Text style={styles.sectionHeaderTOS}>SAC LIFE Features</Text>
              <Text style={styles.paragraphTOS}>        
                - AI-powered Chatbot{"\n"}
                - Personalized Campus Services Dashboard{"\n"}
                - Sac State Events Calendar Dashboard{"\n"}
                - Custom Events Dashboard{"\n"}
                - Wellness Bar{"\n"}
                - Settings Section{"\n"}
              </Text>
            </ScrollView>
          </View>
        )}
        {modalContent === 'tos' && (
          <View>
            <ScrollView contentContainerStyle={styles.containerTOS}>
              <Text style={styles.headerTOS}>Terms of Service</Text>

              <Text style={styles.sectionHeaderTOS}>Waiver and Release of Liability</Text>
              <Text style={styles.paragraphTOS}>
                1. Voluntary Participation. I acknowledge that I have voluntarily registered to use the Sac LIFE App, a resource and wellness-oriented mobile application developed to support students at California State University, Sacramento (hereafter referred to as "Sacramento State"). The app provides access to campus resources, events, wellness tracking features, and recommendations related to student support services (collectively, the "Sac LIFE Services").
              </Text>
              <Text style={styles.paragraphTOS}>
                2. Assumption of Risk. I understand and acknowledge that participation in wellness assessments or acting on service recommendations provided within the app carries certain risks. These may include, but are not limited to, emotional responses or physical decisions made as a result of wellness feedback. I voluntarily assume full responsibility for any outcomes resulting from my use of the Sac LIFE Services, and I understand that any action taken based on recommendations is at my own discretion.
              </Text>
              <Text style={styles.paragraphTOS}>
                3. Release. As consideration for being permitted to use the Sac LIFE App, I release and hold harmless Sacramento State, its affiliates, the California State University Board of Trustees, the State of California, and their officers, employees, and agents (collectively, "Releasees") from any claims, liabilities, or demands arising from my use of the app, including but not limited to claims resulting from ordinary negligence.
              </Text>

              <Text style={styles.sectionHeaderTOS}>Consent to Use Data and Privacy</Text>
              <Text style={styles.paragraphTOS}>
                I acknowledge that the Sac LIFE App collects certain user-generated data to provide personalized services. This includes, but is not limited to:{'\n'}
                  - Basic account credentials for login and personalization (non-student ID based){'\n'}
                  - User-provided wellness scores and responses{'\n'}
                  - Chatbot interactions and history{'\n'}
                  - Tags associated with users to recommend campus resources{'\n'}

                  This data is **not shared with third parties**, nor is it used for marketing or commercial purposes. The primary use of this data is to offer tailored resource suggestions to enhance the user’s well-being and campus experience.
              </Text>

              <Text style={styles.sectionHeaderTOS}>Acknowledgement of Services, Resources, and Links</Text>
              <Text style={styles.paragraphTOS}>
                The Sac LIFE App provides links and access to various Sacramento State services and resources. I understand that Sac LIFE does not facilitate bookings or service delivery directly, but acts as a centralized information platform. Any transactions, appointments, or services accessed through external links are governed by the policies and terms of the respective Sacramento State departments or third-party providers.
              </Text>

              <Text style={styles.sectionHeaderTOS}>Medical Disclaimer</Text>
              <Text style={styles.paragraphTOS}>
                The wellness scoring feature is designed for self-awareness and informational purposes only. It is not a medical or psychological diagnostic tool and should not be used as a substitute for professional healthcare or counseling. I acknowledge that I am responsible for my own health and well-being, and any action taken based on app recommendations is done voluntarily.
              </Text>

              <Text style={styles.sectionHeaderTOS}>Electronic Acceptance Terms</Text>
              <Text style={styles.paragraphTOS}>
                By downloading, installing, or using this app, you acknowledge and agree to be bound by this Terms of Service. Your continued use of the app constitutes your acceptance of these terms.{'\n'}

                This Terms of Service is made available for your reference within the app's settings. No physical or digital signature is required, and your acceptance is effective upon download and use of the app. A copy of this agreement may be stored electronically and shall be considered valid and legally binding.
              </Text>

              <Text style={styles.paragraphTOS}>
                ***********************************************
              </Text>

              <Text style={styles.sectionHeaderTOS}>General Terms</Text>
              <Text style={styles.paragraphTOS}>
                I understand and agree that:{'\n'}

                - I must be at least 18 years old or a currently enrolled Sacramento State student to use the app.{'\n'}
                - Sac LIFE reserves the right to update or change this Terms of Service at any time.{'\n'}
                - Continued use of the app after updates to this agreement indicates acceptance of the new terms.{'\n'}
                - If any part of this agreement is held invalid, the rest remains enforceable.{'\n\n'}

                **I HAVE CAREFULLY READ THIS TERMS OF SERVICE AGREEMENT AND FULLY UNDERSTAND ITS CONTENT. I AGREE TO ITS TERMS VOLUNTARILY AND WITH FULL KNOWLEDGE OF ITS SIGNIFICANCE.**
              </Text>
            </ScrollView>
          </View>
        )}

        <View style={styles.modalCloseContainer}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.modalButtonText}>CLOSE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BlurView>
  </Modal>
  );
};

export default ProfileModals;