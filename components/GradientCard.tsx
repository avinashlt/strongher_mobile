import React from "react";
import { StyleSheet, View, Pressable, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface GradientCardProps {
  colors: [string, string, ...string[]];
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export function GradientCard({ colors, children, onPress, style }: GradientCardProps) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          style,
          { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
      >
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
          {children}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, style]}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
  },
  gradient: {
    padding: 20,
  },
});
