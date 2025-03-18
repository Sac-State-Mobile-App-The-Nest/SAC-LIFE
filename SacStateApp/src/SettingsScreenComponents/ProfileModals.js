import React, { useState }  from 'react';
import { View, Text, Modal, TextInput, Button, TouchableOpacity, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import styles from '../SettingsStyles/SettingsStyles';
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { mutedDarkGreen, darkGray } from '../SacStateColors/GeneralColors';
import { Ionicons } from '@expo/vector-icons';

const ProfileModals = ({ modalVisible, modalContent, newPassword, setNewPassword, newName, setNewName, updateNameFunction, 
  updatePasswordFunction, setModalVisible, newPassword2, setNewPassword2, oldPassword, setOldPassword }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  //sample chatbot logs
  const chatHistory = [
    { role: "user", message: "Hello, how are you?" },
    { role: "bot", message: "I'm doing great! How can I assist you?" },
    { role: "user", message: "Tell me a joke." },
    { role: "bot", message: "Why don't skeletons fight each other? Because they don't have the guts!" },
  ];

  //is called when user decides to download their chatbot history
  const downloadHerkyBotHistory = async () => {
    //converts chat history into html
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            ul { list-style-type: none; padding: 0; }
            li { margin-bottom: 10px; }
            strong { color: mutedDarkGreen; }
          </style>
        </head>
        <body>
          <h1>Chatbot Conversation History</h1>
          <ul>
            ${chatHistory.map(chat => `<li><strong>${chat.role}:</strong> ${chat.message}</li>`).join("")}
          </ul>
        </body>
      </html>
    `;
    try{
      //generates pdf file
      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      //option for user to download or share pdf to their device
      if (await Sharing.isAvailableAsync()){
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("Error", "Sharing not available on this device");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to generate chat logs.");
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
              value={newName}
              onChangeText={setNewName}
            />
            <TouchableOpacity style={styles.saveButton} onPress={updateNameFunction}>
              <Text style={styles.saveButtonText}>Save</Text>
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
            <Button title="Change Password" onPress={() => updatePasswordFunction(oldPassword, newPassword, newPassword2)} />
          </View>
        )}
        {/*Download their chatbot data*/}
        {modalContent === 'downloadChatbotData' && (
          <View>
          <Text style={styles.modalTitle}>Are you sure your want to download your HerkyBot chat history?</Text>
            <Button title="Download" onPress={downloadHerkyBotHistory} />
          </View>
        )}
        {/*Delete their chatbot data */}
        {modalContent === 'deleteChatbotData' && (
          <View>
          <Text style={styles.modalTitle}>Are you sure your want to delete your HerkyBot chat history?
            There is no going back.</Text>
            <Button title="Confirm" onPress={deleteHerkyBotHistory} />
          </View>
        )}
        {/*Delete their account */}
        {modalContent === 'deactivateAccount' && (
          <View>
          <Text style={styles.modalTitle}>Are you sure your want to delete your account?
            There is no going back.</Text>
            <Button title="Confirm" onPress={deleteHerkyBotHistory} />
          </View>
        )}

        <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
          <Text style={styles.modalButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </BlurView>
  </Modal>
  );
};

export default ProfileModals;