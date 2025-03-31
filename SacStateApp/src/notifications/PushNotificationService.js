import messaging from "@react-native-firebase/messaging";
import { Alert,  Platform } from "react-native";
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

      const deviceInfo = `${Platform.OS} - ${Platform.Version}`;
  
      const response = await fetch(`${process.env.PROD_BACKEND_URL}/api/notifications/register-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, fcmToken: token, deviceInfo })
      });
  
      const data = await response.json();
      if (!response.ok) {
        console.error("Failed to register FCM token on backend:", response.status, data);
        return null;
      }
  
      console.log("FCM Token saved to backend:", data);
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