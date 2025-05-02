import messaging from "@react-native-firebase/messaging";
import { Platform, Linking } from "react-native";
import Toast from 'react-native-toast-message';
import BASE_URL from "../apiConfig";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const registerForegroundHandler = () => {
  messaging().onMessage(async remoteMessage => {
    try {
      const { title, body } = remoteMessage.notification;
      const resourceLink = remoteMessage.data?.resource_link;

      Toast.show({
        type: 'sacLifeNotification',
        text1: title,
        text2: body,
        position: 'top',
        onPress: () => {
          if (resourceLink) Linking.openURL(resourceLink);
        },
        autoHide: true,
        visibilityTime: 120000,
        topOffset: 60,
      });
    } catch (err) {
      console.error("Error in foreground notification handler:", err);
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
      if (!userId) {
        const fromStorage = await AsyncStorage.getItem('userId');
        if (!fromStorage) {
          console.error("❌ userId is missing and not found in storage");
          return null;
        }
        userId = parseInt(fromStorage);
      }

      const token = await messaging().getToken();
      console.log("FCM Token:", token);

      const deviceInfo = `${Platform.OS} - ${Platform.Version}`;

      const response = await fetch(`${BASE_URL}/api/notifications/register-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, fcmToken: token, deviceInfo })
      });

      const text = await response.text();

      try {
        const result = JSON.parse(text);
        console.log("JSON response from token register:", result);

        if (!response.ok) {
          console.error("Failed to register FCM token on backend:", response.status, result);
          return null;
        }

        console.log("FCM Token saved to backend:", result);
        return token;
      } catch (jsonErr) {
        console.error("Failed to parse backend response:", text);
        return null;
      }

    } catch (error) {
      console.error("Error getting or registering FCM Token:", error);
      return null;
    }
  }

  listenForNotifications() {
    messaging().onNotificationOpenedApp(remoteMessage => {
      const resourceLink = remoteMessage.data?.resource_link;
      if (resourceLink) Linking.openURL(resourceLink);
    });

    messaging().getInitialNotification().then(remoteMessage => {
      const resourceLink = remoteMessage?.data?.resource_link;
      if (resourceLink) Linking.openURL(resourceLink);
    });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log("Notification received in background:", remoteMessage);
    });
  }
}

export default new PushNotificationService();