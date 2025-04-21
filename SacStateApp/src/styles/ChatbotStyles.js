import { StyleSheet, Platform } from 'react-native';
import * as colors from '../SacStateColors/GeneralColors';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.offWhite,
    },
    chatContainer: {
        flex: 1,
    },
    messagesContainer: {
        flex: 1,
        paddingHorizontal: 12,
        paddingTop: 12,
    },
    messagesContentContainer: {
        flexGrow: 1,
        paddingBottom: 120,
        paddingTop: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === 'android' ? 10 : 12,
        backgroundColor: colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 3,
    },
    input: {
        flex: 1,
        height: 44,
        backgroundColor: '#F3F4F6',
        borderRadius: 22,
        paddingLeft: 40,
        paddingRight: 40, // give room for send icon
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        color: colors.sacGreen,
      },
    searchIcon: {
        position: 'absolute',
        left: 60,
        top: Platform.OS === 'android' ? 21 : 16,
        zIndex: 1,
        tintColor: '#9E9E9E'
    },
    sendIcon: {
        backgroundColor: '#F3F3F3',   // subtle background
        borderRadius: 20,
        padding: 6,
        marginLeft: 6,
        elevation: 2,                 // soft shadow
        color: colors.sacGreen,
    },
    senderLabelYou: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.white,
        backgroundColor: colors.sacGreen,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: 'flex-end',
        marginBottom: 2,
    },
    senderLabelBot: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.white,
        backgroundColor: colors.mutedGold,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 2,
    },
    userMessageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 18,
        backgroundColor: colors.sacGreen,
        alignSelf: 'flex-end',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    botMessageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 18,
        backgroundColor: colors.whiteGold,
        alignSelf: 'flex-start',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.mutedGold,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    userMessageText: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.white,
    },
    botMessageText: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.sacGreen,
    },
    typingDotsContainer: {
        flexDirection: 'row',
        paddingTop: 4,
        paddingLeft: 10,
        alignItems: 'center',
        gap: 6,
    },
    typingDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.sacGreen,
        opacity: 0.6,
    },
    trashButton: {
        position: 'absolute',
        bottom: 75, // aligns above the tab bar but below the input
        left: 20,
        padding: 10,
        backgroundColor: '#F3F3F3',
        borderRadius: 20,
        elevation: 2,
        zIndex: 10,
    }
});

export default styles;
