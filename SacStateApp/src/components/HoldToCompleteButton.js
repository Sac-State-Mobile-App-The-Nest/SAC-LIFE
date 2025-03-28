import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as colors from '../SacStateColors/GeneralColors';

const { width } = Dimensions.get('window');

const HoldToCompleteButton = ({ onComplete }) => {
  const progress = useRef(new Animated.Value(0)).current;
  const rippleScale = useRef(new Animated.Value(0)).current;
  const pulseOpacity = useRef(new Animated.Value(0.5)).current;
  const glowScale = useRef(new Animated.Value(1)).current;
  const textScale = useRef(new Animated.Value(1)).current;
  const [isComplete, setIsComplete] = useState(false);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const listener = progress.addListener(({ value }) => {
      setPercent(Math.round(value * 100));
    });
    return () => progress.removeListener(listener);
  }, []);

  const startFill = () => {
    Haptics.selectionAsync();

    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(glowScale, {
            toValue: 1.08,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(glowScale, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          })
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.5,
            duration: 500,
            useNativeDriver: true,
          })
        ]),
        Animated.sequence([
          Animated.timing(textScale, {
            toValue: 1.03,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(textScale, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          })
        ])
      ])
    ).start();

    Animated.timing(progress, {
      toValue: 1,
      duration: 2500,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsComplete(true);
        triggerRipple();
      }
    });
  };

  const cancelFill = () => {
    Animated.timing(progress, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    glowScale.setValue(1);
    pulseOpacity.setValue(0.5);
    textScale.setValue(1);
  };

  const triggerRipple = () => {
    rippleScale.setValue(0);
    Animated.timing(rippleScale, {
      toValue: 4,
      duration: 800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start(() => {
      onComplete();
    });
  };

  const rippleOpacity = rippleScale.interpolate({
    inputRange: [0, 4],
    outputRange: [0.4, 0],
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[styles.rippleEffect, {
          transform: [{ scale: rippleScale }],
          opacity: rippleOpacity,
        }]}
      />

      <Animated.View
        style={[styles.pulseOverlay, { opacity: pulseOpacity }]}
      />

      <Animated.View
        style={[styles.button, { transform: [{ scale: glowScale }] }]}
      >
        <LinearGradient
          colors={[colors.sacGreen, '#206C45', '#2A6F4D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Pressable
          onPressIn={!isComplete ? startFill : null}
          onPressOut={!isComplete ? cancelFill : null}
          style={StyleSheet.absoluteFill}
        >
          <View style={styles.innerContent}>
            <Animated.Text style={[styles.buttonText, { transform: [{ scale: textScale }] }]}> 
              {isComplete ? 'Profile Created' : 'Hold to Complete Your Profile!'}
            </Animated.Text>
            {!isComplete && percent > 0 && (
              <Text style={styles.percentText}>{percent}%</Text>
            )}
          </View>
        </Pressable>
      </Animated.View>

      {/* Optional Leaf Particles Placeholder */}
      {/* You can add animated leaf SVGs or images here */}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  button: {
    paddingVertical: 50,
    paddingHorizontal: 50,
    borderRadius: 50,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 7,
    elevation: 6,
    overflow: 'hidden',
  },
  innerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#F5F1DF',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  percentText: {
    color: '#FBF8EF',
    fontSize: 18,
    marginTop: 12,
    fontWeight: '600',
  },
  rippleEffect: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    backgroundColor: colors.subtleGreen,
    zIndex: 0,
  },
  pulseOverlay: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    backgroundColor: colors.mutedSacStateGreen,
    zIndex: 0,
  },
});

export default HoldToCompleteButton;
