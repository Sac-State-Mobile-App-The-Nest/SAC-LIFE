import React, { useState, useRef, useEffect } from 'react';
import { DEV_BACKEND_SERVER_IP } from '@env';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView,
    Platform, Keyboard, Linking, TouchableWithoutFeedback, Animated, Easing
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ParsedText from 'react-native-parsed-text';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/ChatbotStyles';
import * as colors from '../SacStateColors/GeneralColors';

const ChatbotScreen = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const scrollViewRef = useRef(null);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [loggedInStudentId, setLoggedInStudentId] = useState(null);

    useEffect(() => {
        const fetchStudentId = async () => {
            try {
                const username = await AsyncStorage.getItem('username');
                if (!username) return;
                const res = await fetch(`http://${DEV_BACKEND_SERVER_IP}:3000/api/students/getLoggedInUser?username=${username}`);
                const data = await res.json();
                if (data?.std_id) {
                    setLoggedInStudentId(data.std_id);
                    fetchChatHistory(data.std_id);
                }


                const response = await fetch(`http://${DEV_BACKEND_SERVER_IP}:5000/api/students/getLoggedInUser?username=${username}`);
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

    const fetchChatHistory = async (stdId) => {
        try {

            const response = await fetch(`http://${DEV_BACKEND_SERVER_IP}:5000/api/chatbot/chat-history/${stdId}`);
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
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    const handleSend = async () => {
        if (message.trim()) {
            setMessages([...messages, { text: message, sender: 'You' }]);
            setMessage('');
            setIsTyping(true);

            try {

                const response = await fetch(`http://${DEV_BACKEND_SERVER_IP}:5000/api/chatbot/message`, {

                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message, std_id: loggedInStudentId }),
                });
                const data = await res.json();
                setMessages(prev => [...prev, { text: data.response, sender: 'HerkyBot' }]);
            } catch (err) {
                console.error('Error:', err);
                setMessages(prev => [...prev, { text: 'Error: Unable to connect to server', sender: 'HerkyBot' }]);
            } finally {
                setIsTyping(false);
            }
        }
    };

    const handleClearChat = async () => {
        if (!loggedInStudentId) {
            console.error(" Cannot clear chat — no std_id available.");
            return;
        }

        try {
            const response = await fetch(`http://${DEV_BACKEND_SERVER_IP}:5000/api/chatbot/clear-chat/${loggedInStudentId}`, {
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

   

    const AnimatedDot = ({ delay = 0 }) => {
        const scaleAnim = useRef(new Animated.Value(0.5)).current;
        useEffect(() => {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleAnim, { toValue: 1, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true, delay }),
                    Animated.timing(scaleAnim, { toValue: 0.5, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                ])
            );
            pulse.start();
            return () => pulse.stop();
        }, []);
        return <Animated.View style={[styles.typingDot, { transform: [{ scale: scaleAnim }] }]} />;
    };
    


    const AnimatedMessage = ({ children, style }) => {
        const slideAnim = useRef(new Animated.Value(20)).current;
        const fadeAnim = useRef(new Animated.Value(0)).current;
        useEffect(() => {
            Animated.parallel([
                Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
            ]).start();
        }, []);
        return (
            <Animated.View style={[style, { transform: [{ translateY: slideAnim }], opacity: fadeAnim }]}>
                {children}
            </Animated.View>
        );
    }

   

    return (
      <View style={styles.container}>
        <View style={styles.chatContainer}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContentContainer}
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={true}
            scrollEnabled={true}
            nestedScrollEnabled={true}
            onContentSizeChange={() => {
              if (!keyboardVisible) {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }
            }}
          >
            {messages.map((msg, i) => (
              <AnimatedMessage key={i} style={msg.sender === 'You' ? styles.userMessage : styles.botMessage}>
                <Text style={msg.sender === 'You' ? styles.senderLabelYou : styles.senderLabelBot}>
                  {msg.sender}
                </Text>
                <View style={msg.sender === 'You' ? styles.userMessageBubble : styles.botMessageBubble}>
                  <ParsedText
                    style={msg.sender === 'You' ? styles.userMessageText : styles.botMessageText}
                    parse={[{
                      type: 'url',
                      style: { color: 'blue', textDecorationLine: 'underline' },
                      onPress: Linking.openURL,
                    }]}
                  >
                    {msg.text}
                  </ParsedText>
                </View>
              </AnimatedMessage>
            ))}
            {isTyping && (
              <View style={styles.botMessage}>
                <Text style={styles.senderLabelBot}>HerkyBot</Text>
                <View style={styles.botMessageBubble}>
                  <Text style={styles.botMessageText}>HerkyBot is typing</Text>
                  <View style={styles.typingDotsContainer}>
                    <AnimatedDot delay={0} />
                    <AnimatedDot delay={300} />
                    <AnimatedDot delay={600} />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
    
          
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 86 : 20}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.inputContainer}>
                <TouchableOpacity onPress={handleClearChat} style={{ paddingRight: 10 }}>
                  <MaterialIcons name="delete-outline" size={24} color={colors.sacGreen} />
                </TouchableOpacity>
    
                <MaterialIcons name="search" size={20} color="#9E9E9E" style={styles.searchIcon} />
                <TextInput
                  style={styles.input}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Ask me a question..."
                />
                <TouchableOpacity onPress={handleSend}>
                  <MaterialIcons name="send" size={22} style={styles.sendIcon} />
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </View>
    );
    
};

export default ChatbotScreen;