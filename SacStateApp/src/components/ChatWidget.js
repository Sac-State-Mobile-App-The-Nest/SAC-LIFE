import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 

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
                    //add Dialogflow's response to the chat
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
            style={styles.chatWidget}
            keyboardVerticalOffset={900} 
        >
            <TouchableOpacity onPress={toggleChat} style={styles.chatToggle}>
                <MaterialIcons name="chat" size={20} color="#c4b581" />
                <Text style={styles.toggleText}>{isOpen ? 'Close' : 'Chat'}</Text>
            </TouchableOpacity>
            {isOpen && (
                <View style={styles.chatBox}>
                    <ScrollView 
                        style={styles.messages} 
                        contentContainerStyle={styles.messagesContainer}
                    >
                        {messages.map((msg, index) => (
                            <View key={index} style={styles.messageContainer}>
                                <Text style={styles.senderLabel}>{msg.sender}</Text>
                                <Text style={styles.message}>{msg.text}</Text>
                            </View>
                        ))}
                    </ScrollView>
                    <TextInput
                        style={styles.input}
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Type a message"
                    />
                    <Button title="Send" onPress={handleSend} />
                </View>
            )}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    chatWidget: {
        position: 'absolute',
        bottom: 20,
        right: 1,
    },
    chatToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#043927',
        padding: 10,
        borderRadius: 5,
    },
    toggleText: {
        color: '#c4b581',
        fontWeight: 'bold',
        marginLeft: 5,
    },
    chatBox: {
        backgroundColor: '#c4b581',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        width: 250,
        maxWidth: '100%',
        maxHeight: 500,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
    },
    messages: {
        flexGrow: 1,
        maxHeight: 150,
        marginBottom: 10,
    },
    messagesContainer: {
        paddingBottom: 10,
    },
    messageContainer: {
        marginBottom: 10,
    },
    senderLabel: {
        fontSize: 12,
        color: '#555',
        marginBottom: 2,
    },
    message: {
        backgroundColor: '#f1f1f1',
        padding: 5,
        borderRadius: 3,
        marginBottom: 5,
    },
    input: {
        height: 40,
        borderColor: '#28a745',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
});

export default ChatWidget;
