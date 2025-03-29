import React, { useState }  from 'react';
import { View, Text, Modal, TextInput, Button, TouchableOpacity, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import styles from '../styles/SettingsStyles';
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { mutedDarkGreen, darkGray } from '../SacStateColors/GeneralColors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const ProfileModals = ({ modalVisible, modalContent, newPassword, setNewPassword, newPreferredName, setNewPreferredName, updateNameFunction, 
  updatePasswordFunction, setModalVisible, newPassword2, setNewPassword2, oldPassword, setOldPassword, setModalContent, navigation, logout}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  //is called when user decides to download their chatbot history
  const downloadHerkyBotHistory = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`http://${process.env.DEV_BACKEND_SERVER_IP}:5000/api/students/requestChatLogs`,
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
      const response = await axios.put(`http://${process.env.DEV_BACKEND_SERVER_IP}:5000/api/login_info/deactivateAccount`,
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
        Alert.alert("Error", "Unable to deactivate your account.");
      }
    } catch (error){
      Alert.alert("Error", error);
    }
  }

  //when user confirms they want to delete their chatbot history
  const deleteHerkyBotHistory = () => {

    setModalVisible(false);
    Alert.alert("Success", "HerkyBot history cleared");
  }

  return (
    <Modal visible={modalVisible} animationType="fade" transparent={true}>
    <BlurView intensity={50} style={styles.blurBackground}>
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
            <Text style={styles.modalTitle}>Sac State LIFE is your all-in-one app for navigating campus life. From chatbot assistance to event updates, we've got you covered!</Text>
            <Text style={styles.subtitle}>Developed by The Nest Team at Sac State:</Text>
            <Text style={styles.teamMembers}>        
              Nicholas Lewis{"\n"}
              Christian Buco{"\n"}
              Bryce Chao{"\n"}
              Randy Pham{"\n"}
              Justin Rivera{"\n"}
              Devin Grace{"\n"}
              Vinny Thai{"\n"}
              Darryl Nguyen{"\n"}
              Aaron Jumawan
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
          <Text style={styles.modalButtonText}>CLOSE</Text>
        </TouchableOpacity>
      </View>
    </BlurView>
  </Modal>
  );
};

export default ProfileModals;