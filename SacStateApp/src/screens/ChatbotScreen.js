import React, { useState, useRef, useEffect } from 'react';
import { DEV_BACKEND_SERVER_IP } from '@env';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView,
    Platform, Keyboard, Linking, TouchableWithoutFeedback
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ParsedText from 'react-native-parsed-text';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/ChatbotStyles';

const ChatbotScreen = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const scrollViewRef = useRef(null);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [loggedInStudentId, setLoggedInStudentId] = useState(null);

    // Fetch std_id when the component mounts
    useEffect(() => {
        const fetchStudentId = async () => {
            try {
                const username = await AsyncStorage.getItem('username');
                if (!username) {
                    console.error(" No username stored in AsyncStorage.");
                    return;
                }
                const response = await fetch(`http://${DEV_BACKEND_SERVER_IP}:3000/api/students/getLoggedInUser?username=${username}`);
                const responseText = await response.text();

                if (response.ok) {
                    const userData = JSON.parse(responseText);
                    if (userData.std_id) {
                        setLoggedInStudentId(userData.std_id);
                        fetchChatHistory(userData.std_id);
                    } else {
                        console.error(" std_id missing in response.");
                    }
                } else {
                    console.error(` Failed to fetch student ID, status: ${response.status}, body:`, responseText);
                }
            } catch (error) {
                console.error(" Error fetching student ID:", error);
            }
        };

        fetchStudentId();
    }, []);

    // Fetch chat history using std_id
    const fetchChatHistory = async (stdId) => {
        try {
            const response = await fetch(`http://${DEV_BACKEND_SERVER_IP}:3000/chat-history/${stdId}`);
            if (response.ok) {
                const history = await response.json();
                setMessages(history.flatMap(chat => [
                    { text: chat.student_question, sender: 'You' },
                    { text: chat.bot_response, sender: 'SacLifeBot' }
                ]));
            } else {
                console.error(` Failed to fetch chat history, status: ${response.status}`);
            }
        } catch (error) {
            console.error("Error fetching chat history:", error);
        }
    };

    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }

        // Add listeners for keyboard events
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardVisible(true);
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardVisible(false);
        });

        // Cleanup listeners on unmount
        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    const handleSend = async () => {
        if (message.trim()) {
            setMessages([...messages, { text: message, sender: 'You' }]);
            setMessage('');
            setIsTyping(true);

            const requestBody = { message, std_id: loggedInStudentId };

            try {
                const response = await fetch(`http://${DEV_BACKEND_SERVER_IP}:3000/message`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                });

                if (response.ok) {
                    const data = await response.json();
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { text: data.response, sender: 'HerkyBot' },
                    ]);
                } else {
                    console.error('Network response was not ok.');
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { text: 'Error: Unable to fetch response from server', sender: 'HerkyBot' },
                    ]);
                }
            } catch (error) {
                console.error('Error fetching response:', error);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { text: 'Error: Unable to connect to server', sender: 'HerkyBot' },
                ]);
            } finally {
                setIsTyping(false);
            }
        }
    };

    const handleUrlPress = (url) => {
        Linking.openURL(url);
    };

    const handleClearChat = async () => {
        if (!loggedInStudentId) {
            console.error(" Cannot clear chat — no std_id available.");
            return;
        }

        try {
            const response = await fetch(`http://${DEV_BACKEND_SERVER_IP}:3000/clear-chat/${loggedInStudentId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                console.log("Chat history cleared.");
                setMessages([]);
            } else {
                console.error(` Failed to clear chat history, status: ${response.status}`);
            }
        } catch (error) {
            console.error(" Error clearing chat:", error);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 86 : 0} // Adjust the value as needed
        >
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View style={styles.chatContainer}>
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.messagesContainer}
                        contentContainerStyle={styles.messagesContentContainer}
                    >
                        {messages.map((msg, index) => (
                            <View key={index} style={msg.sender === 'You' ? styles.userMessage : styles.botMessage}>
                                <Text style={msg.sender === 'You' ? styles.senderLabelYou : styles.senderLabelBot}>
                                    {msg.sender}
                                </Text>
                                <View style={msg.sender === 'You' ? styles.userMessageBubble : styles.botMessageBubble}>
                                    <ParsedText
                                        style={msg.sender === 'You' ? styles.userMessageText : styles.botMessageText}
                                        parse={[{
                                            type: 'url',
                                            style: { color: 'blue', textDecorationLine: 'underline' },
                                            onPress: handleUrlPress,
                                        }]}
                                    >
                                        {msg.text}
                                    </ParsedText>
                                </View>
                            </View>
                        ))}
                        {isTyping && (
                            <View style={styles.botMessage}>
                                <Text style={styles.senderLabelBot}>HerkyBot</Text>
                                <View style={styles.botMessageBubble}>
                                    <Text style={styles.botMessageText}>HerkyBot is typing...</Text>
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    <TouchableOpacity onPress={handleClearChat}>
                        <Text style={{ color: 'rgba(4, 57, 39, 0.8)', alignSelf: 'center', marginBottom: 10 }}>
                            Clear Chat History
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.inputContainer}>
                        <MaterialIcons
                            name="search"
                            size={20}
                            color="#9E9E9E"
                            style={[styles.searchIcon, { position: 'absolute', left: 5, top: 20 }]}
                        />
                        <TextInput
                            style={styles.input}
                            value={message}
                            onChangeText={setMessage}
                            placeholder="Ask me a question..."
                        />
                        <TouchableOpacity onPress={handleSend}>
                            <MaterialIcons
                                name="arrow-circle-up"
                                size={30}
                                color="#9E9E9E"
                                style={[styles.sendIcon, { left: -10 }]}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default ChatbotScreen;
