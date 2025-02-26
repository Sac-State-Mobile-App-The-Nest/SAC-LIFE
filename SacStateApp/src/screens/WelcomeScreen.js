// WelcomeScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Image, Dimensions } from 'react-native';
import styles from '../WelcomeStyles/WelcomeStyles';

const WelcomeScreen = ({ navigation }) => {  // <-- Destructure navigation here
  const { width } = Dimensions.get('window');
  const containerWidth = width * 0.8;

  // Animated values for the logo and texts.
  const logoFadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1.5)).current;
  const welcomeTextFadeAnim = useRef(new Animated.Value(0)).current;
  const subTextFadeAnim = useRef(new Animated.Value(0)).current;
  // Animated value for the loading bar's width.
  const loadingBarAnim = useRef(new Animated.Value(0)).current;
  // Animated value for the loading bar container's opacity.
  const loadingBarContainerOpacity = useRef(new Animated.Value(0)).current;

  // State flag to control rendering of the subtext.
  const [showSubText, setShowSubText] = useState(false);

  useEffect(() => {
    // Reset values on mount.
    logoFadeAnim.setValue(0);
    scaleAnim.setValue(1.5);
    welcomeTextFadeAnim.setValue(0);
    subTextFadeAnim.setValue(0);
    loadingBarAnim.setValue(0);
    loadingBarContainerOpacity.setValue(0);
    setShowSubText(false);

    // 1. Animate the logo: fade in and scale from 1.5 to 1 over 1000ms.
    Animated.parallel([
      Animated.timing(logoFadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Fade in the "Welcome" text over 500ms.
      Animated.timing(welcomeTextFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // 3. Hold "Welcome" on screen for 1000ms.
        setTimeout(() => {
          // 4. Fade out "Welcome" over 250ms.
          Animated.timing(welcomeTextFadeAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            // 5. Now that "Welcome" is completely gone,
            // set the flag so the subtext is rendered.
            setShowSubText(true);
            // Then fade in the subtext over 500ms.
            Animated.timing(subTextFadeAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }).start(() => {
              // 6. After subtext is fully faded in, fade in the loading bar container.
              Animated.timing(loadingBarContainerOpacity, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
              }).start(() => {
                // 7. Animate the loading bar's width from 0 to containerWidth over 1500ms.
                Animated.timing(loadingBarAnim, {
                  toValue: containerWidth,
                  duration: 1500,
                  useNativeDriver: false, // Width animations require useNativeDriver: false.
                }).start(() => {
                  // Navigation callback after the final animation completes.
                  navigation.navigate('LogIn'); // Or use navigation.replace('LogIn') if you don't want to allow going back.
                });
              });
            });
          });
        }, 1000);
      });
    });
  }, [
    logoFadeAnim,
    scaleAnim,
    welcomeTextFadeAnim,
    subTextFadeAnim,
    loadingBarAnim,
    loadingBarContainerOpacity,
    containerWidth,
    navigation, // Include navigation in the dependency array.
  ]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: logoFadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Image
          source={require('../assets/sacStateLogo.png')}
          style={styles.logo}
          accessible={true}
          accessibilityLabel="Sacramento State Logo"
        />
      </Animated.View>
      <View style={styles.textContainer}>
        <Animated.Text style={[styles.messageText, { opacity: welcomeTextFadeAnim }]}>
          Welcome
        </Animated.Text>
        {showSubText && (
          <Animated.Text style={[styles.messageText, { opacity: subTextFadeAnim }]}>
            Your Journey Starts Here
          </Animated.Text>
        )}
      </View>
      {/* Loading bar container */}
      <Animated.View style={[styles.loadingBarContainer, { opacity: loadingBarContainerOpacity }]}>
        <Animated.View style={[styles.loadingBar, { width: loadingBarAnim }]} />
      </Animated.View>
    </View>
  );
};

export default WelcomeScreen;
