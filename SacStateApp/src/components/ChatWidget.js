import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    //function for opeingn and closing chat window
    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    //appends message to messages 
    const handleSend = () => {
        if (message.trim()) {
            setMessages([...messages, { text: message, sender: 'You' }]);
            setMessage('');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.chatWidget}
            keyboardVerticalOffset={900} // Adjust offset as needed
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
        flexDirection: 'row', // Makes icon and text align horizontally
        alignItems: 'center', // Centers the icon and text vertically
        backgroundColor: '#043927',//change for toggle button color
        padding: 10,
        borderRadius: 5,
    },
    toggleText: {
        color: '#c4b581', // Change this to your desired color
        fontWeight: 'bold', // Optional: make text bold
        marginLeft: 5,
    },
    chatBox: {
        backgroundColor: '#c4b581', //chatbox color
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
        paddingBottom: 10, // Adds padding at the bottom of messages
    },
    messageContainer: {
        marginBottom: 10,
    },
    senderLabel: {
        fontSize: 12,
        color: '#555', // Label color
        marginBottom: 2,
    },
    message: {
        backgroundColor: '#f1f1f1',//message bubble collor
        padding: 5,
        borderRadius: 3,
        marginBottom: 5,
    },
    input: {
        height: 40,
        borderColor: '#28a745',//border color
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
});

export default ChatWidget;
