import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  Platform,
  useColorScheme,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Crypto from "expo-crypto";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import Colors from "@/constants/colors";
import { useUser } from "@/contexts/UserContext";
import { getFoodLog, saveFoodEntry, deleteFoodEntry, FoodEntry } from "@/lib/storage";
import { apiRequest } from "@/lib/query-client";

export default function CaloriesScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const { profile } = useUser();

  const [foodLog, setFoodLog] = useState<FoodEntry[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const todayFoods = foodLog.filter((f) => f.date === today);
  const todayCalories = todayFoods.reduce((sum, f) => sum + f.calories, 0);
  const todayProtein = todayFoods.reduce((sum, f) => sum + f.protein, 0);
  const todayCarbs = todayFoods.reduce((sum, f) => sum + f.carbs, 0);
  const todayFat = todayFoods.reduce((sum, f) => sum + f.fat, 0);
  const calorieGoal = profile?.dailyCalorieGoal || 2000;

  useFocusEffect(
    useCallback(() => {
      loadFoodLog();
    }, [])
  );

  async function loadFoodLog() {
    try {
      const log = await getFoodLog();
      setFoodLog(log);
    } catch {
      setFoodLog([]);
    }
  }

  async function handleTakePhoto() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const permResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permResult.granted) {
      if (!permResult.canAskAgain && Platform.OS !== "web") {
        Alert.alert(
          "Camera Access Needed",
          "Please enable camera access in your device settings to scan food.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => {
                try {
                  const { Linking } = require("react-native");
                  Linking.openSettings();
                } catch {}
              },
            },
          ]
        );
      } else {
        Alert.alert("Permission needed", "Camera access is required to scan food.");
      }
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      await analyzeFood(result.assets[0]);
    }
  }

  async function handlePickImage() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      await analyzeFood(result.assets[0]);
    }
  }

  async function analyzeFood(asset: ImagePicker.ImagePickerAsset) {
    if (!asset.base64) {
      Alert.alert("Error", "Could not process the image.");
      return;
    }

    setAnalyzing(true);
    try {
      const response = await apiRequest("POST", "/api/analyze-food", {
        imageBase64: asset.base64,
      });
      const data = await response.json();

      const entry: FoodEntry = {
        id: Crypto.randomUUID(),
        imageUri: asset.uri,
        name: data.name || "Unknown Food",
        calories: Math.round(data.calories || 0),
        protein: Math.round(data.protein || 0),
        carbs: Math.round(data.carbs || 0),
        fat: Math.round(data.fat || 0),
        date: today,
        timestamp: new Date().toISOString(),
      };

      await saveFoodEntry(entry);
      await loadFoodLog();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert("Analysis Failed", error.message || "Could not analyze the food. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleDelete(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await deleteFoodEntry(id);
    await loadFoodLog();
  }

  const webTopPadding = Platform.OS === "web" ? 67 : 0;
  const webBottomPadding = Platform.OS === "web" ? 34 : 0;

  const renderFoodItem = ({ item }: { item: FoodEntry }) => (
    <View style={[styles.foodItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Image source={{ uri: item.imageUri }} style={styles.foodImage} contentFit="cover" />
      <View style={styles.foodInfo}>
        <Text style={[styles.foodName, { color: theme.text }]}>{item.name}</Text>
        <View style={styles.macroRow}>
          <Text style={[styles.macroText, { color: Colors.accent }]}>{item.calories} kcal</Text>
          <Text style={[styles.macroDot, { color: theme.textMuted }]}>P: {item.protein}g</Text>
          <Text style={[styles.macroDot, { color: theme.textMuted }]}>C: {item.carbs}g</Text>
          <Text style={[styles.macroDot, { color: theme.textMuted }]}>F: {item.fat}g</Text>
        </View>
      </View>
      <Pressable onPress={() => handleDelete(item.id)} hitSlop={8}>
        <Ionicons name="trash-outline" size={20} color={theme.danger} />
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + webTopPadding + 12 }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Calories</Text>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.summaryMain}>
          <Text style={[styles.summaryCalories, { color: Colors.accent }]}>{todayCalories}</Text>
          <Text style={[styles.summaryGoal, { color: theme.textSecondary }]}>/ {calorieGoal} kcal</Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min((todayCalories / calorieGoal) * 100, 100)}%`,
                backgroundColor: todayCalories > calorieGoal ? theme.danger : Colors.accent,
              },
            ]}
          />
        </View>
        <View style={styles.macroSummary}>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: theme.text }]}>{todayProtein}g</Text>
            <Text style={[styles.macroLabel, { color: theme.textMuted }]}>Protein</Text>
          </View>
          <View style={[styles.macroDivider, { backgroundColor: theme.border }]} />
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: theme.text }]}>{todayCarbs}g</Text>
            <Text style={[styles.macroLabel, { color: theme.textMuted }]}>Carbs</Text>
          </View>
          <View style={[styles.macroDivider, { backgroundColor: theme.border }]} />
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: theme.text }]}>{todayFat}g</Text>
            <Text style={[styles.macroLabel, { color: theme.textMuted }]}>Fat</Text>
          </View>
        </View>
      </View>

      {analyzing ? (
        <View style={styles.analyzingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.analyzingText, { color: theme.textSecondary }]}>Analyzing your food...</Text>
        </View>
      ) : null}

      <View style={styles.scanButtons}>
        <Pressable
          onPress={handleTakePhoto}
          disabled={analyzing}
          style={({ pressed }) => [
            styles.scanButton,
            { backgroundColor: Colors.primary, opacity: pressed || analyzing ? 0.8 : 1 },
          ]}
        >
          <Ionicons name="camera" size={22} color="#fff" />
          <Text style={styles.scanButtonText}>Take Photo</Text>
        </Pressable>
        <Pressable
          onPress={handlePickImage}
          disabled={analyzing}
          style={({ pressed }) => [
            styles.scanButton,
            { backgroundColor: theme.surface, borderColor: Colors.primary, borderWidth: 2, opacity: pressed || analyzing ? 0.8 : 1 },
          ]}
        >
          <Ionicons name="images" size={22} color={Colors.primary} />
          <Text style={[styles.scanButtonText, { color: Colors.primary }]}>Gallery</Text>
        </Pressable>
      </View>

      <View style={styles.listHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Log</Text>
        <Text style={[styles.itemCount, { color: theme.textMuted }]}>{todayFoods.length} items</Text>
      </View>

      <FlatList
        data={todayFoods}
        keyExtractor={(item) => item.id}
        renderItem={renderFoodItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + webBottomPadding + 100 }]}
        scrollEnabled={!!todayFoods.length}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={48} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>No meals logged today</Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              Take a photo of your food to get started
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Outfit_700Bold",
  },
  summaryCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    gap: 12,
  },
  summaryMain: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  summaryCalories: {
    fontSize: 36,
    fontFamily: "Outfit_700Bold",
  },
  summaryGoal: {
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255,107,53,0.15)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  macroSummary: {
    flexDirection: "row",
    alignItems: "center",
  },
  macroItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  macroValue: {
    fontSize: 18,
    fontFamily: "Outfit_600SemiBold",
  },
  macroLabel: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
  },
  macroDivider: {
    width: 1,
    height: 30,
  },
  analyzingContainer: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
  },
  analyzingText: {
    fontSize: 15,
    fontFamily: "Outfit_500Medium",
  },
  scanButtons: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  scanButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 14,
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Outfit_600SemiBold",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Outfit_600SemiBold",
  },
  itemCount: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  foodItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  foodImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  foodInfo: {
    flex: 1,
    gap: 4,
  },
  foodName: {
    fontSize: 16,
    fontFamily: "Outfit_600SemiBold",
  },
  macroRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  macroText: {
    fontSize: 14,
    fontFamily: "Outfit_600SemiBold",
  },
  macroDot: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: "Outfit_600SemiBold",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
