import messaging from "@react-native-firebase/messaging";
import { Alert,  Platform } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from "../apiConfig";

export const registerForegroundHandler = () => {
  messaging().onMessage(async remoteMessage => {
      console.log(' Foreground notification:', remoteMessage);

      // Example display using Alert (replace with a Toast or custom UI)
      if (remoteMessage.notification) {
          const { title, body } = remoteMessage.notification;
          Alert.alert(title, body);
      }
  });
};

class PushNotificationService {
  async requestUserPermission(userId) {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Notification permission granted.");
      return this.getToken(userId);
    } else {
      console.log("Notification permission denied.");
    }
  }
  

  async getToken(userId) {
    try {
      const token = await messaging().getToken();
      console.log("FCM Token:", token);

      const deviceInfo = `${Platform.OS} - ${Platform.Version}`;
  
      const response = await fetch(`${BASE_URL}/api/notifications/register-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, fcmToken: token, deviceInfo })
      });
  
      const result = await response.json();
      console.log("JSON response from token register:", result);

      if (!response.ok) {
        console.error("Failed to register FCM token on backend:", response.status, result);
        return null;
      }
  
      console.log("FCM Token saved to backend:", result);
      return token;
    } catch (error) {
      console.error("Error getting or registering FCM Token:", error);
      return null;
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