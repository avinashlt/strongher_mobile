import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Platform,
  useColorScheme,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Pedometer } from "expo-sensors";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useUser } from "@/contexts/UserContext";
import { StatRing } from "@/components/StatRing";
import { getStepData, saveStepDay, StepDay } from "@/lib/storage";

export default function StepsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const { profile } = useUser();

  const [isPedometerAvailable, setIsPedometerAvailable] = useState<boolean | null>(null);
  const [currentSteps, setCurrentSteps] = useState(0);
  const [weekData, setWeekData] = useState<StepDay[]>([]);

  const today = new Date().toISOString().split("T")[0];
  const stepGoal = profile?.dailyStepGoal || 10000;

  useFocusEffect(
    useCallback(() => {
      loadWeekData();
    }, [])
  );

  useEffect(() => {
    if (Platform.OS === "web") {
      setIsPedometerAvailable(false);
      return;
    }

    let subscription: { remove: () => void } | null = null;

    async function initPedometer() {
      try {
        const available = await Pedometer.isAvailableAsync();
        setIsPedometerAvailable(available);

        if (available) {
          const start = new Date();
          start.setHours(0, 0, 0, 0);
          const end = new Date();

          try {
            const result = await Pedometer.getStepCountAsync(start, end);
            setCurrentSteps(result.steps);
            await saveStepDay({ date: today, steps: result.steps, goal: stepGoal });
          } catch {
            setCurrentSteps(0);
          }

          subscription = Pedometer.watchStepCount((result) => {
            setCurrentSteps((prev) => {
              const newSteps = prev + result.steps;
              saveStepDay({ date: today, steps: newSteps, goal: stepGoal });
              return newSteps;
            });
          });
        }
      } catch {
        setIsPedometerAvailable(false);
      }
    }

    initPedometer();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  async function loadWeekData() {
    let data: StepDay[] = [];
    try {
      data = await getStepData();
    } catch {}
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const existing = data.find((s) => s.date === dateStr);
      last7.push(existing || { date: dateStr, steps: 0, goal: stepGoal });
    }
    setWeekData(last7);
  }

  const addManualSteps = async (amount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newSteps = currentSteps + amount;
    setCurrentSteps(newSteps);
    await saveStepDay({ date: today, steps: newSteps, goal: stepGoal });
    await loadWeekData();
  };

  const progress = Math.min(currentSteps / stepGoal, 1);
  const remaining = Math.max(stepGoal - currentSteps, 0);
  const distance = ((currentSteps * 0.762) / 1000).toFixed(1);
  const caloriesBurned = Math.round(currentSteps * 0.04);

  const maxSteps = Math.max(...weekData.map((d) => d.steps), stepGoal);

  const webTopPadding = Platform.OS === "web" ? 67 : 0;
  const webBottomPadding = Platform.OS === "web" ? 34 : 0;

  const getDayLabel = (dateStr: string) => {
    const d = new Date(dateStr + "T12:00:00");
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[d.getDay()];
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + webTopPadding + 12, paddingBottom: insets.bottom + webBottomPadding + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.headerTitle, { color: theme.text }]}>Steps</Text>

        <View style={styles.mainRing}>
          <StatRing
            progress={progress}
            size={180}
            strokeWidth={16}
            color={Colors.primary}
            bgColor={isDark ? "#1A2E28" : "#E0F0E8"}
            label=""
            value={currentSteps.toLocaleString()}
            textColor={theme.text}
          />
          <Text style={[styles.goalText, { color: theme.textSecondary }]}>
            {remaining.toLocaleString()} steps to go
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="footsteps" size={20} color={Colors.primary} />
            <Text style={[styles.statValue, { color: theme.text }]}>{distance}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>km</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="flame" size={20} color={Colors.accent} />
            <Text style={[styles.statValue, { color: theme.text }]}>{caloriesBurned}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>kcal burned</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="time" size={20} color="#6C5CE7" />
            <Text style={[styles.statValue, { color: theme.text }]}>{Math.round(currentSteps / 100)}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>min active</Text>
          </View>
        </View>

        {isPedometerAvailable === false ? (
          <View style={[styles.manualSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.manualTitle, { color: theme.text }]}>Pedometer not available</Text>
            <Text style={[styles.manualSub, { color: theme.textSecondary }]}>
              Add steps manually on this device
            </Text>
            <View style={styles.manualButtons}>
              {[500, 1000, 2500, 5000].map((amount) => (
                <Pressable
                  key={amount}
                  onPress={() => addManualSteps(amount)}
                  style={({ pressed }) => [
                    styles.manualBtn,
                    { backgroundColor: Colors.primary + "20", opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <Text style={[styles.manualBtnText, { color: Colors.primary }]}>+{amount}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.weekSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>This Week</Text>
          <View style={styles.weekChart}>
            {weekData.map((day, i) => {
              const height = maxSteps > 0 ? Math.max((day.steps / maxSteps) * 120, 4) : 4;
              const isToday = day.date === today;
              return (
                <View key={day.date} style={styles.barContainer}>
                  <Text style={[styles.barValue, { color: theme.textMuted }]}>
                    {day.steps > 999 ? `${(day.steps / 1000).toFixed(1)}k` : day.steps}
                  </Text>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height,
                          backgroundColor: isToday ? Colors.primary : Colors.primary + "40",
                          borderRadius: 6,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.dayLabel,
                      { color: isToday ? Colors.primary : theme.textMuted, fontFamily: isToday ? "Outfit_600SemiBold" : "Outfit_400Regular" },
                    ]}
                  >
                    {getDayLabel(day.date)}
                  </Text>
                </View>
              );
            })}
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
    gap: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Outfit_700Bold",
  },
  mainRing: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  goalText: {
    fontSize: 15,
    fontFamily: "Outfit_500Medium",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Outfit_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Outfit_400Regular",
  },
  manualSection: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  manualTitle: {
    fontSize: 16,
    fontFamily: "Outfit_600SemiBold",
  },
  manualSub: {
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
  },
  manualButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  manualBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  manualBtnText: {
    fontSize: 14,
    fontFamily: "Outfit_600SemiBold",
  },
  weekSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Outfit_600SemiBold",
  },
  weekChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 180,
    gap: 4,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  barValue: {
    fontSize: 10,
    fontFamily: "Outfit_500Medium",
  },
  barWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    width: "100%",
    alignItems: "center",
  },
  bar: {
    width: "70%",
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 12,
  },
});
