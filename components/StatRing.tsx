import React from "react";
import { StyleSheet, View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface StatRingProps {
  progress: number;
  size: number;
  strokeWidth: number;
  color: string;
  bgColor: string;
  label: string;
  value: string;
  textColor: string;
}

export function StatRing({ progress, size, strokeWidth, color, bgColor, label, value, textColor }: StatRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = circumference - clampedProgress * circumference;

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={bgColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <Text style={[styles.value, { color: textColor, fontSize: size * 0.18 }]}>{value}</Text>
        </View>
      </View>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 6,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontWeight: "700",
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.7,
  },
});
