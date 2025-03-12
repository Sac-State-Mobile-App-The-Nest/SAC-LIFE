import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Keyboard, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ParsedText from 'react-native-parsed-text';
import styles from '../ChatbotStyles/ChatbotStyles';

const ChatbotScreen = () => {
    const [message, setMessage] = useState('');  
    const [messages, setMessages] = useState([]);
    const scrollViewRef = useRef(null); 
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [isTyping, setIsTyping] = useState(false);


    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardVisible(true);
        });

        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardVisible(false);
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);
    
    const handleSend = async () => {
        if (message.trim()) {
            setMessages([...messages, { text: message, sender: 'You' }]);
            const userMessage = message;
            setMessage('');

            try {
                const response = await fetch('http://10.0.2.2:3000/message', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: userMessage }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { text: data.response, sender: 'SacLifeBot' },
                    ]);
                } else {
                    console.error('Network response was not ok.');
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

    const handleUrlPress = (url) => {
        Linking.openURL(url);
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container} keyboardVerticalOffset={keyboardVisible ? (Platform.OS === 'ios' ? 100 : 130) : 0}>
            <View style={styles.chatContainer}>
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.messagesContainer}
                    contentContainerStyle={styles.messagesContentContainer}
                >
                    {messages.map((msg, index) => (
                        <View key={index} style={msg.sender === 'You' ? styles.userMessage : styles.botMessage}>
                            <Text style={msg.sender === 'You' ? styles.senderLabelYou : styles.senderLabelBot}>{msg.sender}</Text>
                            <View style={msg.sender === 'You' ? styles.userMessageBubble : styles.botMessageBubble}>
                                <ParsedText
                                    style={msg.sender === 'You' ? styles.userMessageText : styles.botMessageText}
                                    parse={[
                                        {
                                            type: 'url',
                                            style: { color: 'blue', textDecorationLine: 'underline' },
                                            onPress: handleUrlPress,
                                        },
                                    ]}
                                >
                                    {msg.text}
                                </ParsedText>
                            </View>
                        </View>
                    ))}
                    {isTyping && (
                        <View style={styles.botMessage}>
                            <Text style={styles.senderLabelBot}>SacLifeBot</Text>
                            <View style={styles.botMessageBubble}>
                                <Text style={styles.botMessageText}>SacLifeBot is typing...</Text>
                            </View>
                        </View>
                    )}
                </ScrollView>

                <View style={styles.inputContainer}>
                    <MaterialIcons name="search" size={20} color="#9E9E9E" style={[styles.searchIcon, { position: 'absolute', left: 5, top: 20 }]} />
                    <TextInput
                        style={styles.input}
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Ask me a question..."
                        onBlur={() => setKeyboardVisible(false)}
                    />
                    <TouchableOpacity onPress={handleSend}>
                        <MaterialIcons name="arrow-circle-up" size={30} color="#9E9E9E" style={[styles.sendIcon, { left: -10 }]} />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );    
};

export default ChatbotScreen;  