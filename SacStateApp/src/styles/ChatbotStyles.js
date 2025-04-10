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
        padding: 0,
        marginTop: 10,
    },
    messagesContainer: {
        flex: 1,
        paddingHorizontal: 10,
        paddingBottom: 15,
    },
    messagesContentContainer: {
        paddingBottom: 20,
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        paddingTop: 10,
        paddingBottom: 10,
        paddingHorizontal: 15,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderTopColor: colors.mutedGold,
        borderBottomColor: colors.mutedGold,
        backgroundColor: colors.whiteGreen,
    },
    input: {
        flex: 1,
        height: 45,
        backgroundColor: colors.fadedWhiteSmoke,
        borderRadius: 25,
        paddingLeft: 40,
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#ddd',
        marginRight: 10,
    },
    sendButton: {
        padding: 12,
        backgroundColor: colors.mutedSacGreen,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchIcon: {
        paddingTop: 3,
        marginLeft: 25,
        zIndex: 1,
    },
    sendIcon: {
        paddingLeft: 10,
        marginRight: -10,
        color: colors.sacGreen,
    },
   
    // Sender labels with bubble around them
    senderLabelYou: {
        fontSize: 12,
        color: colors.white,
        backgroundColor: colors.sacGreen, // Green background to make it stand out
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12, // Rounded corners for the label bubble
        marginTop: 4,
        marginBottom: 4,
        marginRight: 10,
        alignSelf: 'flex-end',
    },

    senderLabelBot: {
        fontSize: 12,
        color: colors.gray,
        marginBottom: 4, // Add some space between the sender label and the message bubble
        marginLeft: 10,
    },

    // User message bubble container
    userMessageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 20,
        backgroundColor: colors.whiteGreen,
        borderColor: colors.sacGreen,
        borderWidth: 1,
        alignSelf: 'flex-end',
        marginRight: 5,
    },

    // Bot message bubble container
    botMessageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 20,
        backgroundColor: colors.whiteGold,
        borderColor: colors.mutedGold,
        borderWidth: 1,
        marginTop: 4,
        marginBottom: 4,
        alignSelf: 'flex-start',
        marginLeft: 5,
    },

    // Typing indicator bubble
    typingIndicator: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 20,
        backgroundColor: colors.whiteGold,
        borderColor: colors.mutedGold,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    typingIndicatorText: {
        fontSize: 14,
        fontStyle: 'italic',
        color: colors.gray,
    },

    userMessageText: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.sacGreen,
    },
    botMessageText: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.sacGreen,
    },
});

export default styles;
