import messaging from "@react-native-firebase/messaging";
import { Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

class PushNotificationService {
  async requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Notification permission granted.");
      return this.getToken();
    } else {
      console.log("Notification permission denied.");
    }
  }

  async getToken(userId) {
    try {
        const token = await messaging().getToken();
        console.log("FCM Token:", token);

        // Send token to backend
        await fetch(`https://${process.env.DEV_BACKEND_SERVER_IP}/api/notifications/register-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId, // Pass the logged-in user's ID
                fcmToken: token
            })
        });

        return token;
    } catch (error) {
        console.error("Error getting FCM Token:", error);
    }
  }

  listenForNotifications() {
    messaging().onMessage(async (remoteMessage) => {
      Alert.alert(
        remoteMessage.notification.title,
        remoteMessage.notification.body
      );
    });

    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log("Notification caused app to open:", remoteMessage);
    });

    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log("Notification received in background:", remoteMessage);
    });
  }
}

export default new PushNotificationService();