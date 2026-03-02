import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Dimensions, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  interpolate,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

const { width, height } = Dimensions.get("window");

interface AnimatedSplashProps {
  onFinish: () => void;
}

function PulseRing({ delay, size }: { delay: number; size: number }) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) })
      )
    );
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(0.6, { duration: 200 }),
        withTiming(0, { duration: 1000, easing: Easing.out(Easing.cubic) })
      )
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.ring,
        { width: size, height: size, borderRadius: size / 2 },
        ringStyle,
      ]}
    />
  );
}

function FloatingParticle({ delay, x, y }: { delay: number; x: number; y: number }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withSequence(
      withTiming(0.8, { duration: 400 }),
      withDelay(600, withTiming(0, { duration: 600 }))
    ));
    translateY.value = withDelay(delay, withTiming(-80, { duration: 1600, easing: Easing.out(Easing.cubic) }));
    scale.value = withDelay(delay, withSequence(
      withSpring(1, { damping: 8, stiffness: 120 }),
      withDelay(400, withTiming(0, { duration: 400 }))
    ));
  }, []);

  const particleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
    left: x,
    top: y,
  }));

  return <Animated.View style={[styles.particle, particleStyle]} />;
}

export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const iconScale = useSharedValue(0);
  const iconRotate = useSharedValue(-30);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(20);
  const barWidth = useSharedValue(0);
  const containerOpacity = useSharedValue(1);
  const lineScale = useSharedValue(0);

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    iconScale.value = withDelay(200, withSpring(1, { damping: 10, stiffness: 100 }));
    iconRotate.value = withDelay(200, withSpring(0, { damping: 12, stiffness: 90 }));

    titleOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    titleTranslateY.value = withDelay(600, withSpring(0, { damping: 14, stiffness: 100 }));

    subtitleOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));
    subtitleTranslateY.value = withDelay(900, withSpring(0, { damping: 14, stiffness: 100 }));

    lineScale.value = withDelay(1100, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));

    barWidth.value = withDelay(1200, withTiming(1, { duration: 800, easing: Easing.inOut(Easing.cubic) }));

    containerOpacity.value = withDelay(2400, withTiming(0, { duration: 400 }, (finished) => {
      if (finished) {
        runOnJS(handleFinish)();
      }
    }));
  }, []);

  function handleFinish() {
    setVisible(false);
    onFinish();
  }

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotate.value}deg` },
    ],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const barStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: barWidth.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: lineScale.value }],
  }));

  if (!visible) return null;

  const particles = [
    { delay: 400, x: width * 0.2, y: height * 0.35 },
    { delay: 500, x: width * 0.7, y: height * 0.3 },
    { delay: 600, x: width * 0.3, y: height * 0.55 },
    { delay: 700, x: width * 0.65, y: height * 0.6 },
    { delay: 550, x: width * 0.15, y: height * 0.5 },
    { delay: 650, x: width * 0.8, y: height * 0.45 },
  ];

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <LinearGradient
        colors={["#0A0A1A", "#0D1A2E", "#0A1520", "#0A0A1A"]}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {particles.map((p, i) => (
        <FloatingParticle key={i} delay={p.delay} x={p.x} y={p.y} />
      ))}

      <PulseRing delay={300} size={200} />
      <PulseRing delay={500} size={280} />
      <PulseRing delay={700} size={360} />

      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, iconStyle]}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryLight]}
            style={styles.iconGradient}
          >
            <Ionicons name="fitness" size={48} color="#fff" />
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.lineContainer, lineStyle]}>
          <LinearGradient
            colors={["transparent", Colors.primary, "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.line}
          />
        </Animated.View>

        <Animated.Text style={[styles.title, titleStyle]}>STRONG</Animated.Text>

        <Animated.Text style={[styles.subtitle, subtitleStyle]}>
          Your Fitness Companion
        </Animated.Text>

        <Animated.View style={[styles.progressBar, barStyle]}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryLight, Colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.progressFill}
          />
        </Animated.View>
      </View>

      <View style={styles.bottomGlow} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    gap: 16,
    zIndex: 2,
  },
  iconContainer: {
    marginBottom: 8,
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
      web: {},
    }),
  },
  lineContainer: {
    width: 120,
    height: 2,
    marginVertical: 4,
  },
  line: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 46,
    fontFamily: "Outfit_700Bold",
    color: "#FFFFFF",
    letterSpacing: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 3,
    marginTop: -4,
  },
  progressBar: {
    width: 160,
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 24,
  },
  progressFill: {
    width: "100%",
    height: "100%",
    borderRadius: 2,
  },
  ring: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: Colors.primary + "30",
  },
  particle: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  bottomGlow: {
    position: "absolute",
    bottom: -100,
    width: width * 1.5,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primary + "08",
  },
});
