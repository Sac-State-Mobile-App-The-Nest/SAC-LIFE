import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSend = async () => {
    if (message.trim()) {
      setMessages([...messages, { text: message, sender: 'You' }]);
      setMessage('');

      // Mocked response for now (replace this with your fetch logic)
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: 'Let me help you with that!', sender: 'SacLifeBot' },
      ]);
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

const styles = StyleSheet.create({
  chatWidgetContainer: {
    position: 'relative',
    marginHorizontal: 20,
    marginTop: 20,
  },
  chatToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBF8EF', // Faded Sac State gold
    borderColor: '#E4CFA3', // Muted gold border
    padding: 15,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3, // For Android shadow
  },
  toggleText: {
    color: '#043927', // Deep Sac State green
    fontWeight: '600',
    marginLeft: 10,
    fontSize: 16,
  },
  chatBox: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 20,
    marginTop: 10,
    width: '100%',
    maxHeight: 300,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
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
    backgroundColor: '#F1F1F1',
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
    fontSize: 14,
    color: '#333',
  },
  searchIcon: {
    marginLeft: 5,
  },
  sendIcon: {
    marginLeft: 5,
  },
});

export default ChatWidget;

