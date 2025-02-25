import { StyleSheet } from 'react-native';
import * as colors from '../SacStateColors/GeneralColors';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.offWhite,
        padding: 0,
    },
    chatContainer: {
        flex: 1,
        justifyContent: 'space-between',
        padding: -5, //was 0 before 2nd commit.
    },
    messagesContainer: {
        flex: 1,
        padding: 5,
    },
    messagesContentContainer: {
        paddingBottom: 10,
    },
    
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        marginLeft: -10,
        paddingTop: 10,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: colors.mutedGold,
    },
    input: {
        flex: 1,
        height: 40,
        backgroundColor: colors.fadedWhiteSmoke,
        borderRadius: 20,
        paddingLeft: 40,
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    sendButton: {
        marginLeft: 10,
        padding: 10,
        backgroundColor: colors.mutedSacGreen,
        borderRadius: 20,
    },
    searchIcon: {
        marginLeft: 30,
        zIndex: 1,
    },
      sendIcon: {
        marginLeft: 10,
        marginRight: -4,
        color: colors.sacGreen,
    },

    // User message background (bubble around senderLabel)
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: colors.offWhite,
        marginBottom: 10,
        borderRadius: 10,
        padding: 12,
        maxWidth: '80%',
    },
    
    // Bot message background (bubble around senderLabel)
    botMessage: {
        alignSelf: 'flex-start',
        backgroundColor: colors.offWhite,
        marginBottom: 10,
        borderRadius: 10,
        padding: 12,
        maxWidth: '80%',
    },

    // You and SacLifeBot text
    senderLabelYou: {
        fontSize: 12,
        color: colors.gray,
        marginBottom: 4, // Add some space between the sender label and the message bubble
        marginRight: 5,
        alignSelf: 'flex-end',
    },
    
    senderLabelBot: {
        fontSize: 12,
        color: colors.gray,
        marginBottom: 4, // Add some space between the sender label and the message bubble
        marginLeft: 5,
    },

    userMessageBubble: {
        maxWidth: '80%', // Limit the bubble width for better readability
        padding: 10,
        borderRadius: 15, // Rounded corners for the user bubble
        backgroundColor: colors.whiteGreen,
        borderColor: colors.sacGreen,
        borderWidth: 1,
        alignSelf: 'flex-end', // User message is on the right side
    },

    // Bot's message bubble container
    botMessageBubble: {
        maxWidth: '80%', // Limit the bubble width for better readability
        padding: 10,
        borderRadius: 15, // Rounded corners for the bot bubble
        backgroundColor: colors.whiteGold, // Web-Only color sac gold
        borderColor: colors.mutedGold,
        borderWidth: 1,
        alignSelf: 'flex-start', // Bot message is on the left side
    },

    userMessageText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.sacGreen,
    },
    botMessageText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.sacGreen,
    },
});

export default styles;