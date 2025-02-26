import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Linking  } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 
import ParsedText from 'react-native-parsed-text';
import styles from '../DashboardStyles/WidgetStyles';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');  
    const [messages, setMessages] = useState([]);
    const scrollViewRef = useRef(null); 

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

    const handleUrlPress = (url) => {
        Linking.openURL(url);
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.chatWidgetContainer}>
            <TouchableOpacity onPress={toggleChat} style={styles.chatToggle}>
                <MaterialIcons name="chat" size={24} color="#043927" />
                <Text style={styles.toggleText}>{isOpen ? 'Close Chat' : 'Got a question? Let\'s chat!'}</Text>
            </TouchableOpacity>

            {isOpen && (
                <View style={styles.chatBox}>
                    <ScrollView 
                        ref={scrollViewRef}  
                        style={styles.messages} 
                        contentContainerStyle={styles.messagesContainer}
                        //to help scrolling on our emulator
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled={true}
                    >
                        {messages.map((msg, index) => (
                            <View key={index} style={styles.messageContainer}>
                                <Text style={styles.senderLabel}>{msg.sender}</Text>
                                <ParsedText
                                    style={styles.message}
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
