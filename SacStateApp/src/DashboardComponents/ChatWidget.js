import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 
import styles from '../DashboardStyles/WidgetStyles';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');  
    const [messages, setMessages] = useState([]);

    // function for opening and closing chat window
    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    // function to send message to server and handle response
    const handleSend = async () => {
        if (message.trim()) {
            //add user's message to the chat
            setMessages([...messages, { text: message, sender: 'You' }]);
            const userMessage = message;
            setMessage('');

            try {
                //sends fetch to android emulator ip 
                const response = await fetch('http://10.0.2.2:3000/message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: userMessage }),
                });

                if (response.ok) {
                    const data = await response.json();
                    // add Dialogflow's response to the chat
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { text: data.response, sender: 'SacLifeBot' },
                    ]);
                } else {
                    console.error('Network response was not ok.');
                    //server response fail error
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { text: 'Error: Unable to fetch response from server', sender: 'SacLifeBot' },
                    ]);
                }
            } catch (error) {
                console.error('Error fetching response:', error);
                //will display connection error
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { text: 'Error: Unable to connect to server', sender: 'SacLifeBot' },
                ]);
            }
        }
    };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.chatWidgetContainer}
    >
      <TouchableOpacity onPress={toggleChat} style={styles.chatToggle}>
        <MaterialIcons name="chat" size={24} color="#043927" />
        <Text style={styles.toggleText}>{isOpen ? 'Close Chat' : 'Got a question? Let\'s chat!'}</Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.chatBox}>
          <ScrollView style={styles.messages} contentContainerStyle={styles.messagesContainer}>
            {messages.map((msg, index) => (
              <View key={index} style={styles.messageContainer}>
                <Text style={styles.senderLabel}>{msg.sender}</Text>
                <Text style={styles.message}>{msg.text}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.inputContainer}>
            <MaterialIcons name="search" size={20} color="#9E9E9E" style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="Ask me a question..."
            />
            <TouchableOpacity onPress={handleSend}>
              <MaterialIcons name="send" size={24} color="#043927" style={styles.sendIcon} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default ChatWidget;