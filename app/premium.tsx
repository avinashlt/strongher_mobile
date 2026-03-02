import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { useUser } from "@/contexts/UserContext";
import { apiRequest } from "@/lib/query-client";

interface PremiumContent {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
}

const CATEGORY_ICONS: Record<string, { name: keyof typeof MaterialCommunityIcons.glyphMap; color: string }> = {
  workout: { name: "dumbbell", color: Colors.primary },
  nutrition: { name: "food-apple", color: Colors.accent },
  recovery: { name: "meditation", color: "#6C5CE7" },
  wellness: { name: "sleep", color: "#00B4D8" },
};

const FEATURES = [
  { icon: "barbell-outline" as const, text: "Expert Workout Plans" },
  { icon: "nutrition-outline" as const, text: "Macro Meal Guides" },
  { icon: "analytics-outline" as const, text: "Advanced Analytics" },
  { icon: "infinite-outline" as const, text: "Unlimited AI Scans" },
];

export default function PremiumScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const { profile, togglePremium } = useUser();

  const [content, setContent] = useState<PremiumContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  async function loadContent() {
    try {
      const res = await apiRequest("GET", "/api/premium-content");
      const data = await res.json();
      setContent(data);
    } catch {
      setContent([]);
    } finally {
      setLoading(false);
    }
  }

  const handleUpgrade = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    togglePremium();
  };

  const webTopPadding = Platform.OS === "web" ? 67 : 0;
  const webBottomPadding = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + webTopPadding + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" size={28} color={theme.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + webBottomPadding + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {!profile?.isPremium ? (
          <>
            <LinearGradient
              colors={isDark ? ["#1A0D2E", "#2A1A3E", "#1A0D2E"] : ["#F0E8FF", "#E0D0FF", "#F0E8FF"]}
              style={styles.heroCard}
            >
              <Ionicons name="diamond" size={48} color="#FFD700" />
              <Text style={[styles.heroTitle, { color: theme.text }]}>STRONG Premium</Text>
              <Text style={[styles.heroSub, { color: theme.textSecondary }]}>
                Take your fitness to the next level with expert-curated content
              </Text>
            </LinearGradient>

            <View style={styles.featuresGrid}>
              {FEATURES.map((f, i) => (
                <View
                  key={i}
                  style={[styles.featureItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                >
                  <Ionicons name={f.icon} size={24} color={Colors.primary} />
                  <Text style={[styles.featureText, { color: theme.text }]}>{f.text}</Text>
                </View>
              ))}
            </View>

            <Pressable
              onPress={handleUpgrade}
              style={({ pressed }) => [
                styles.upgradeButton,
                { opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.upgradeGradient}
              >
                <Ionicons name="diamond" size={20} color="#fff" />
                <Text style={styles.upgradeText}>Unlock Premium</Text>
              </LinearGradient>
            </Pressable>

            <Text style={[styles.pricingNote, { color: theme.textMuted }]}>
              Demo: Tap to toggle premium status
            </Text>
          </>
        ) : (
          <>
            <View style={styles.activeHeader}>
              <View style={[styles.activeBadge, { backgroundColor: "#FFD70020" }]}>
                <Ionicons name="diamond" size={20} color="#FFD700" />
                <Text style={styles.activeBadgeText}>Premium Active</Text>
              </View>
              <Text style={[styles.contentTitle, { color: theme.text }]}>Your Premium Content</Text>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
            ) : (
              <View style={styles.contentGrid}>
                {content.map((item) => {
                  const catIcon = CATEGORY_ICONS[item.category] || CATEGORY_ICONS.workout;
                  return (
                    <View
                      key={item.id}
                      style={[styles.contentCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    >
                      <View style={styles.contentCardHeader}>
                        <View style={[styles.categoryIcon, { backgroundColor: catIcon.color + "15" }]}>
                          <MaterialCommunityIcons name={catIcon.name} size={22} color={catIcon.color} />
                        </View>
                        <View style={[styles.durationBadge, { backgroundColor: theme.surfaceLight }]}>
                          <Text style={[styles.durationText, { color: theme.textMuted }]}>{item.duration}</Text>
                        </View>
                      </View>
                      <Text style={[styles.contentCardTitle, { color: theme.text }]}>{item.title}</Text>
                      <Text style={[styles.contentCardDesc, { color: theme.textSecondary }]}>
                        {item.description}
                      </Text>
                      <Pressable
                        style={({ pressed }) => [
                          styles.startButton,
                          { backgroundColor: catIcon.color + "15", opacity: pressed ? 0.8 : 1 },
                        ]}
                      >
                        <Text style={[styles.startButtonText, { color: catIcon.color }]}>View Details</Text>
                        <Ionicons name="arrow-forward" size={16} color={catIcon.color} />
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 24,
  },
  heroCard: {
    alignItems: "center",
    borderRadius: 24,
    padding: 32,
    gap: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: "Outfit_700Bold",
  },
  heroSub: {
    fontSize: 15,
    fontFamily: "Outfit_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  featureItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    flexGrow: 1,
  },
  featureText: {
    fontSize: 14,
    fontFamily: "Outfit_500Medium",
    flex: 1,
  },
  upgradeButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  upgradeGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 56,
  },
  upgradeText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Outfit_700Bold",
  },
  pricingNote: {
    textAlign: "center",
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
  },
  activeHeader: {
    alignItems: "center",
    gap: 12,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeBadgeText: {
    color: "#FFD700",
    fontSize: 15,
    fontFamily: "Outfit_600SemiBold",
  },
  contentTitle: {
    fontSize: 24,
    fontFamily: "Outfit_700Bold",
  },
  contentGrid: {
    gap: 14,
  },
  contentCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    gap: 10,
  },
  contentCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  durationBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 12,
    fontFamily: "Outfit_500Medium",
  },
  contentCardTitle: {
    fontSize: 17,
    fontFamily: "Outfit_600SemiBold",
  },
  contentCardDesc: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    lineHeight: 20,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  startButtonText: {
    fontSize: 14,
    fontFamily: "Outfit_600SemiBold",
  },
});
