import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../ChatbotStyles/ChatbotStyles';

const ChatbotScreen = () => {

    const [message, setMessage] = useState('');  
    const [messages, setMessages] = useState([]);
    const scrollViewRef = useRef(null); 
    
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
                        headers: { 'Content-Type': 'application/json' },
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
                        //fail error 
                        setMessages((prevMessages) => [
                            ...prevMessages,
                            { text: 'Error: Unable to fetch response from server', sender: 'SacLifeBot' },
                        ]);
                    }
                } catch (error) {
                    console.error('Error fetching response:', error);
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { text: 'Error: Unable to connect to server', sender: 'SacLifeBot' },
                    ]);
                }
            }
        };
    
        useEffect(() => {
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollToEnd({ animated: true });
            }
        }, [messages]);

    return(
        
        // Lifts the input to the the of the keyboard, 100 for ios, 80 for android.
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container} keyboardVerticalOffset={Platform.OS === 'ios' ? 100:80}>
            <View style={styles.chatContainer}>
                {/* Scrollable chat log */}
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.messagesContainer}
                    contentContainerStyle={styles.messagesContentContainer}
                 >
                    {messages.map((msg, index) => (
                            // Used for the You and SacLifeBot text above messages.
                            <View key={index} style={msg.sender === 'You' ? styles.userMessage : styles.botMessage}>
                                <Text style={msg.sender === 'You' ? styles.senderLabelYou : styles.senderLabelBot}>{msg.sender}</Text>
                            
                                {/* Message Bubble */}
                                <View style={msg.sender === 'You' ? styles.userMessageBubble : styles.botMessageBubble}>
                                    <Text style={msg.sender === 'You' ? styles.userMessageText : styles.botMessageText}>{msg.text}</Text>
                                </View>
                            </View>
                    ))}
                </ScrollView>

                {/* Text input and send button */}
                <View style={styles.inputContainer}>
                    {/* Puts the search icon in the input bubble. */}
                    <MaterialIcons name="search" size={20} color="#9E9E9E" style={[styles.searchIcon, { position: 'absolute', left: 5, top: 20 }]} />
                    <TextInput
                        style={styles.input}
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Ask me a question..."
                    />
                    <TouchableOpacity onPress={handleSend}>
                        <MaterialIcons name="arrow-circle-up" size={30} color="#9E9E9E" style={styles.sendIcon} />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );    
};

export default ChatbotScreen;