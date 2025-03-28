import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as colors from '../SacStateColors/GeneralColors';

const { width } = Dimensions.get('window');

const HoldToCompleteButton = ({ onComplete }) => {
  const progress = useRef(new Animated.Value(0)).current;
  const rippleScale = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
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
    glowOpacity.setValue(1);

    Animated.parallel([
      Animated.timing(progress, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: false,
          }),
          Animated.timing(glowOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: false,
          }),
        ])
      ),
    ]).start(({ finished }) => {
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

  const borderWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 20],
  });

  const rippleOpacity = rippleScale.interpolate({
    inputRange: [0, 4],
    outputRange: [0.4, 0],
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[styles.ring, { borderWidth, opacity: glowOpacity }]}>
        <LinearGradient
          colors={['#66bb6a', '#43a047']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Pressable
        onPressIn={!isComplete ? startFill : null}
        onPressOut={!isComplete ? cancelFill : null}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          {isComplete ? 'Profile Created' : 'Hold to Complete Your Profile!'}
        </Text>
        {!isComplete && percent > 0 && (
          <Text style={styles.percentText}>{percent}%</Text>
        )}
      </Pressable>

      <Animated.View
        pointerEvents="none"
        style={[styles.rippleEffect, {
          transform: [{ scale: rippleScale }],
          opacity: rippleOpacity,
        }]}
      />
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
    paddingVertical: 18,
    paddingHorizontal: 30,
    backgroundColor: colors.sacGreen,
    borderRadius: 30,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  percentText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '600',
  },
  ring: {
    position: 'absolute',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    borderColor: '#81C784',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  rippleEffect: {
    position: 'absolute',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: '#A5D6A7',
    zIndex: 0,
  },
});

export default HoldToCompleteButton;
