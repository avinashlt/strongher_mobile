import React from "react";
import { StyleSheet, Text, View, Pressable, Platform, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import Colors from "@/constants/colors";

export default function FoodDetailScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const params = useLocalSearchParams<{
    name: string;
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    imageUri: string;
  }>();

  const webTopPadding = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + webTopPadding + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" size={28} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{params.name || "Food Details"}</Text>
        <View style={{ width: 28 }} />
      </View>

      {params.imageUri ? (
        <Image source={{ uri: params.imageUri }} style={styles.foodImage} contentFit="cover" />
      ) : null}

      <View style={styles.content}>
        <View style={[styles.calorieCard, { backgroundColor: Colors.accent + "15" }]}>
          <Text style={[styles.calorieValue, { color: Colors.accent }]}>{params.calories || 0}</Text>
          <Text style={[styles.calorieLabel, { color: theme.textSecondary }]}>calories</Text>
        </View>

        <View style={styles.macroGrid}>
          <View style={[styles.macroCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.macroValue, { color: "#FF6B9D" }]}>{params.protein || 0}g</Text>
            <Text style={[styles.macroLabel, { color: theme.textMuted }]}>Protein</Text>
          </View>
          <View style={[styles.macroCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.macroValue, { color: "#FFB830" }]}>{params.carbs || 0}g</Text>
            <Text style={[styles.macroLabel, { color: theme.textMuted }]}>Carbs</Text>
          </View>
          <View style={[styles.macroCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.macroValue, { color: "#6C5CE7" }]}>{params.fat || 0}g</Text>
            <Text style={[styles.macroLabel, { color: theme.textMuted }]}>Fat</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Outfit_600SemiBold",
  },
  foodImage: {
    width: "100%",
    height: 260,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  calorieCard: {
    alignItems: "center",
    paddingVertical: 24,
    borderRadius: 20,
    gap: 4,
  },
  calorieValue: {
    fontSize: 48,
    fontFamily: "Outfit_700Bold",
  },
  calorieLabel: {
    fontSize: 16,
    fontFamily: "Outfit_500Medium",
  },
  macroGrid: {
    flexDirection: "row",
    gap: 12,
  },
  macroCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  macroValue: {
    fontSize: 22,
    fontFamily: "Outfit_700Bold",
  },
  macroLabel: {
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
  },
});
