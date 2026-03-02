import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  useColorScheme,
  TextInput,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useUser } from "@/contexts/UserContext";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const { profile, updateProfile, togglePremium } = useUser();

  const [editingCalories, setEditingCalories] = useState(false);
  const [editingSteps, setEditingSteps] = useState(false);
  const [calorieInput, setCalorieInput] = useState("");
  const [stepInput, setStepInput] = useState("");

  if (!profile) return null;

  const handleSaveCalories = () => {
    const val = parseInt(calorieInput, 10);
    if (val > 0 && val < 10000) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      updateProfile({ dailyCalorieGoal: val });
      setEditingCalories(false);
    }
  };

  const handleSaveSteps = () => {
    const val = parseInt(stepInput, 10);
    if (val > 0 && val < 100000) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      updateProfile({ dailyStepGoal: val });
      setEditingSteps(false);
    }
  };

  const webTopPadding = Platform.OS === "web" ? 67 : 0;
  const webBottomPadding = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + webTopPadding + 12, paddingBottom: insets.bottom + webBottomPadding + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>

        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: Colors.primary + "20" }]}>
            <Text style={[styles.avatarText, { color: Colors.primary }]}>
              {profile.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.userName, { color: theme.text }]}>{profile.name}</Text>
          <View style={styles.badgeRow}>
            {profile.isPremium ? (
              <View style={[styles.badge, { backgroundColor: "#FFD70020", borderColor: "#FFD70040" }]}>
                <Ionicons name="diamond" size={14} color="#FFD700" />
                <Text style={[styles.badgeText, { color: "#FFD700" }]}>Premium</Text>
              </View>
            ) : (
              <View style={[styles.badge, { backgroundColor: theme.surfaceLight, borderColor: theme.border }]}>
                <Text style={[styles.badgeText, { color: theme.textSecondary }]}>Free Plan</Text>
              </View>
            )}
            <View style={[styles.badge, { backgroundColor: theme.surfaceLight, borderColor: theme.border }]}>
              <Ionicons
                name={profile.gender === "male" ? "male" : profile.gender === "female" ? "female" : "body"}
                size={14}
                color={theme.textSecondary}
              />
              <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
                {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Goals</Text>

          <View style={[styles.settingRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="flame" size={22} color={Colors.accent} />
              <View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Daily Calorie Goal</Text>
                {!editingCalories ? (
                  <Text style={[styles.settingValue, { color: theme.textSecondary }]}>
                    {profile.dailyCalorieGoal} kcal
                  </Text>
                ) : null}
              </View>
            </View>
            {editingCalories ? (
              <View style={styles.editRow}>
                <TextInput
                  style={[styles.editInput, { color: theme.text, borderColor: theme.border }]}
                  keyboardType="number-pad"
                  value={calorieInput}
                  onChangeText={setCalorieInput}
                  placeholder={String(profile.dailyCalorieGoal)}
                  placeholderTextColor={theme.textMuted}
                  autoFocus
                />
                <Pressable onPress={handleSaveCalories}>
                  <Ionicons name="checkmark-circle" size={28} color={Colors.primary} />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => {
                  setCalorieInput(String(profile.dailyCalorieGoal));
                  setEditingCalories(true);
                }}
              >
                <Ionicons name="create-outline" size={22} color={theme.textMuted} />
              </Pressable>
            )}
          </View>

          <View style={[styles.settingRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="walk" size={22} color={Colors.primary} />
              <View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Daily Step Goal</Text>
                {!editingSteps ? (
                  <Text style={[styles.settingValue, { color: theme.textSecondary }]}>
                    {profile.dailyStepGoal.toLocaleString()} steps
                  </Text>
                ) : null}
              </View>
            </View>
            {editingSteps ? (
              <View style={styles.editRow}>
                <TextInput
                  style={[styles.editInput, { color: theme.text, borderColor: theme.border }]}
                  keyboardType="number-pad"
                  value={stepInput}
                  onChangeText={setStepInput}
                  placeholder={String(profile.dailyStepGoal)}
                  placeholderTextColor={theme.textMuted}
                  autoFocus
                />
                <Pressable onPress={handleSaveSteps}>
                  <Ionicons name="checkmark-circle" size={28} color={Colors.primary} />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => {
                  setStepInput(String(profile.dailyStepGoal));
                  setEditingSteps(true);
                }}
              >
                <Ionicons name="create-outline" size={22} color={theme.textMuted} />
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Subscription</Text>
          {!profile.isPremium ? (
            <Pressable
              onPress={() => router.push("/premium")}
              style={({ pressed }) => [
                styles.premiumCard,
                { backgroundColor: Colors.primary, opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <View style={styles.premiumCardContent}>
                <Ionicons name="diamond" size={24} color="#fff" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.premiumCardTitle}>Upgrade to Premium</Text>
                  <Text style={styles.premiumCardSub}>Unlock workout plans, meal guides & more</Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </View>
            </Pressable>
          ) : (
            <View style={[styles.settingRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.settingLeft}>
                <Ionicons name="diamond" size={22} color="#FFD700" />
                <View>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>Premium Active</Text>
                  <Text style={[styles.settingValue, { color: theme.textSecondary }]}>Full access enabled</Text>
                </View>
              </View>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  togglePremium();
                }}
              >
                <Text style={[styles.cancelText, { color: theme.danger }]}>Cancel</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>App</Text>
          <View style={[styles.settingRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle" size={22} color={theme.textSecondary} />
              <View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Version</Text>
                <Text style={[styles.settingValue, { color: theme.textSecondary }]}>1.0.0</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Outfit_700Bold",
  },
  avatarSection: {
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 32,
    fontFamily: "Outfit_700Bold",
  },
  userName: {
    fontSize: 24,
    fontFamily: "Outfit_700Bold",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 13,
    fontFamily: "Outfit_500Medium",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Outfit_600SemiBold",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: "Outfit_500Medium",
  },
  settingValue: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 100,
    fontSize: 16,
    fontFamily: "Outfit_500Medium",
    textAlign: "center",
  },
  premiumCard: {
    borderRadius: 16,
    padding: 20,
  },
  premiumCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  premiumCardTitle: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "Outfit_600SemiBold",
  },
  premiumCardSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
  },
  cancelText: {
    fontSize: 14,
    fontFamily: "Outfit_600SemiBold",
  },
});
