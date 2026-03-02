import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, Text, View, ScrollView, Platform, useColorScheme, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useUser } from "@/contexts/UserContext";
import { GradientCard } from "@/components/GradientCard";
import { StatRing } from "@/components/StatRing";
import { getFoodLog, getStepData, FoodEntry, StepDay } from "@/lib/storage";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const { profile, isOnboarded, isLoading } = useUser();

  const [todayCalories, setTodayCalories] = useState(0);
  const [todaySteps, setTodaySteps] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const loadData = useCallback(async () => {
    const foodLog = await getFoodLog();
    const todayFoods = foodLog.filter((f: FoodEntry) => f.date === today);
    setTodayCalories(todayFoods.reduce((sum: number, f: FoodEntry) => sum + f.calories, 0));

    const stepData = await getStepData();
    const todayStep = stepData.find((s: StepDay) => s.date === today);
    setTodaySteps(todayStep?.steps || 0);
  }, [today]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  useEffect(() => {
    if (!isLoading && !isOnboarded) {
      router.replace("/onboarding");
    }
  }, [isLoading, isOnboarded]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (isLoading || !profile) return null;

  const calorieGoal = profile.dailyCalorieGoal;
  const stepGoal = profile.dailyStepGoal;
  const calorieProgress = Math.min(todayCalories / calorieGoal, 1);
  const stepProgress = Math.min(todaySteps / stepGoal, 1);
  const webTopPadding = Platform.OS === "web" ? 67 : 0;
  const webBottomPadding = Platform.OS === "web" ? 34 : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + webTopPadding + 16, paddingBottom: insets.bottom + webBottomPadding + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <View style={styles.headerSection}>
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>{getGreeting()}</Text>
            <Text style={[styles.name, { color: theme.text }]}>{profile.name}</Text>
          </View>
          {profile.isPremium ? (
            <View style={styles.premiumBadge}>
              <Ionicons name="diamond" size={14} color="#FFD700" />
              <Text style={styles.premiumText}>PRO</Text>
            </View>
          ) : null}
        </View>

        <GradientCard colors={isDark ? ["#1A2E3C", "#0D1F2E"] : ["#E8F8F2", "#D0F0E4"]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Today's Progress</Text>
          <View style={styles.ringsRow}>
            <StatRing
              progress={calorieProgress}
              size={100}
              strokeWidth={10}
              color={Colors.accent}
              bgColor={isDark ? "#2A2A40" : "#E0E0EA"}
              label="Calories"
              value={`${todayCalories}`}
              textColor={theme.text}
            />
            <StatRing
              progress={stepProgress}
              size={100}
              strokeWidth={10}
              color={Colors.primary}
              bgColor={isDark ? "#2A2A40" : "#E0E0EA"}
              label="Steps"
              value={`${todaySteps}`}
              textColor={theme.text}
            />
          </View>
        </GradientCard>

        <View style={styles.quickActions}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <GradientCard
              colors={["#FF6B35", "#FF8A5C"]}
              onPress={() => router.push("/(tabs)/calories")}
              style={styles.actionCard}
            >
              <Ionicons name="camera" size={28} color="#fff" />
              <Text style={styles.actionLabel}>Scan Food</Text>
              <Text style={styles.actionSub}>{todayCalories} / {calorieGoal} kcal</Text>
            </GradientCard>
            <GradientCard
              colors={["#0D9F6E", "#14B87D"]}
              onPress={() => router.push("/(tabs)/steps")}
              style={styles.actionCard}
            >
              <Ionicons name="walk" size={28} color="#fff" />
              <Text style={styles.actionLabel}>Step Tracker</Text>
              <Text style={styles.actionSub}>{todaySteps.toLocaleString()} steps</Text>
            </GradientCard>
          </View>
          {profile.gender === "female" ? (
            <GradientCard
              colors={["#FF6B9D", "#FF8AB5"]}
              onPress={() => router.push("/(tabs)/cycle")}
              style={{ marginTop: 12 }}
            >
              <View style={styles.cycleAction}>
                <View>
                  <Text style={styles.actionLabel}>Cycle Tracker</Text>
                  <Text style={styles.actionSub}>Track your menstrual cycle</Text>
                </View>
                <Ionicons name="heart" size={28} color="#fff" />
              </View>
            </GradientCard>
          ) : null}
        </View>

        {!profile.isPremium ? (
          <GradientCard
            colors={isDark ? ["#2A1A3E", "#1A0D2E"] : ["#F0E8FF", "#E0D0FF"]}
            onPress={() => router.push("/premium")}
          >
            <View style={styles.premiumCta}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={[styles.premiumCtaTitle, { color: theme.text }]}>Unlock Premium</Text>
                <Text style={[styles.premiumCtaSub, { color: theme.textSecondary }]}>
                  Get workout plans, meal guides & expert tips
                </Text>
              </View>
              <Ionicons name="arrow-forward-circle" size={36} color={Colors.primary} />
            </View>
          </GradientCard>
        ) : null}
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
    gap: 20,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 15,
    fontFamily: "Outfit_400Regular",
  },
  name: {
    fontSize: 28,
    fontFamily: "Outfit_700Bold",
    marginTop: 2,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFD70020",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFD70040",
  },
  premiumText: {
    color: "#FFD700",
    fontFamily: "Outfit_700Bold",
    fontSize: 13,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "Outfit_600SemiBold",
    marginBottom: 16,
  },
  ringsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  quickActions: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Outfit_700Bold",
  },
  actionsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  actionCard: {
    flex: 1,
  },
  actionLabel: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Outfit_600SemiBold",
    marginTop: 8,
  },
  actionSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
    marginTop: 2,
  },
  cycleAction: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  premiumCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  premiumCtaTitle: {
    fontSize: 18,
    fontFamily: "Outfit_700Bold",
  },
  premiumCtaSub: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
  },
});
