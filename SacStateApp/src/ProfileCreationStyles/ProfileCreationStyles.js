import { StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window') || { height: 800 };

const styles = StyleSheet.create({
    background: { flex: 1, backgroundColor: "#FFFFFF" }, // White background
    overlay: { flex: 1, justifyContent: "center", alignItems: "center", width: "100%" },
    container: { padding: 20, backgroundColor: "transparent", flex: 1 },
    heading: { fontSize: 26, fontWeight: "bold", color: "#043927", marginBottom: 15, textAlign: "center" },
    box: {
        backgroundColor: "#c4b581",
        borderRadius: 10,
        padding: 20,
        width: "80%",
        minHeight: height * 0.2,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5,
        marginVertical: 10,
    },
    questionText: { fontSize: 20, color: "#043927", fontWeight: "500", textAlign: "center", marginBottom: 20 },
    optionButton: { padding: 14, backgroundColor: "#043927", marginVertical: 5, borderRadius: 8, width: "90%", alignItems: "center" },
    optionText: { fontSize: 18, color: "#FFFFFF", fontWeight: "500" },
    input: { padding: 12, borderWidth: 1, borderColor: "gray", borderRadius: 5, backgroundColor: "white", marginBottom: 10, width: "90%" },
    pickerContainer: { width: "90%", backgroundColor: "white", borderRadius: 8, borderColor: "#043927", borderWidth: 1, paddingHorizontal: 10, paddingVertical: 12 },
    pickerText: { color: "#043927", fontSize: 18, textAlign: "center" },
    navigationButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 20, width: "90%", alignSelf: "center" },
    button: { paddingVertical: 12, paddingHorizontal: 30, backgroundColor: "#043927", borderRadius: 12, width: "45%", alignItems: "center" },
    buttonText: { color: "white", fontSize: 16, fontWeight: "500", textAlign: "center" },
    completionContainer: { alignItems: "center", padding: 30 },
    completionText: { fontSize: 24, fontWeight: "bold", color: "#043927", marginBottom: 25, textAlign: "center" },
    largeButton: { paddingVertical: 12, paddingHorizontal: 40, backgroundColor: "#043927", borderRadius: 10, width: "80%", marginVertical: 10, alignItems: "center" },
    largeButtonText: { color: "white", fontSize: 18, fontWeight: "600", alignItems: "center", textAlign: "center" },
});

export default styles;
