import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
  useColorScheme,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import * as Crypto from "expo-crypto";
import * as Haptics from "expo-haptics";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { getCycleData, saveCycleEntry, deleteCycleEntry, CycleEntry } from "@/lib/storage";

const SYMPTOMS = [
  { key: "cramps", icon: "flash-outline" as const, label: "Cramps" },
  { key: "headache", icon: "medical-outline" as const, label: "Headache" },
  { key: "bloating", icon: "water-outline" as const, label: "Bloating" },
  { key: "fatigue", icon: "bed-outline" as const, label: "Fatigue" },
  { key: "mood", icon: "happy-outline" as const, label: "Mood Swings" },
  { key: "acne", icon: "ellipse-outline" as const, label: "Acne" },
];

export default function CycleScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;

  const [cycles, setCycles] = useState<CycleEntry[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isLogging, setIsLogging] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useFocusEffect(
    useCallback(() => {
      loadCycles();
    }, [])
  );

  async function loadCycles() {
    const data = await getCycleData();
    setCycles(data);
  }

  const activeCycle = cycles.find((c) => !c.endDate);
  const lastCompletedCycle = cycles.find((c) => !!c.endDate);

  const getCycleLength = () => {
    if (!lastCompletedCycle?.endDate) return 28;
    const start = new Date(lastCompletedCycle.startDate);
    const end = new Date(lastCompletedCycle.endDate);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getNextPeriodDate = () => {
    const lastStart = activeCycle?.startDate || lastCompletedCycle?.startDate;
    if (!lastStart) return null;
    const avgLength = getCycleLength();
    const next = new Date(lastStart);
    next.setDate(next.getDate() + avgLength);
    return next;
  };

  const getDaysSince = () => {
    if (!activeCycle) return null;
    const start = new Date(activeCycle.startDate);
    const now = new Date();
    return Math.round((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getCurrentPhase = () => {
    const daysSince = getDaysSince();
    if (daysSince === null) {
      const nextDate = getNextPeriodDate();
      if (!nextDate) return { name: "No Data", color: theme.textMuted };
      const daysUntil = Math.round((nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntil <= 0) return { name: "Period Expected", color: Colors.dark.pink };
      if (daysUntil <= 3) return { name: "Pre-menstrual", color: "#FFB830" };
      return { name: "Cycle Day", color: Colors.primary };
    }
    if (daysSince <= 5) return { name: "Menstruation", color: Colors.dark.pink };
    if (daysSince <= 13) return { name: "Follicular", color: Colors.primary };
    if (daysSince <= 16) return { name: "Ovulation", color: "#FFB830" };
    return { name: "Luteal", color: "#6C5CE7" };
  };

  async function startPeriod() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (activeCycle) {
      const updated = { ...activeCycle, endDate: today };
      await saveCycleEntry(updated);
    }
    const newCycle: CycleEntry = {
      id: Crypto.randomUUID(),
      startDate: today,
      symptoms: [],
      notes: "",
    };
    await saveCycleEntry(newCycle);
    await loadCycles();
  }

  async function endPeriod() {
    if (!activeCycle) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updated = { ...activeCycle, endDate: today };
    await saveCycleEntry(updated);
    await loadCycles();
  }

  async function logSymptoms() {
    if (!activeCycle || selectedSymptoms.length === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const updated = {
      ...activeCycle,
      symptoms: [...new Set([...activeCycle.symptoms, ...selectedSymptoms])],
    };
    await saveCycleEntry(updated);
    setSelectedSymptoms([]);
    setIsLogging(false);
    await loadCycles();
  }

  const toggleSymptom = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSymptoms((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const phase = getCurrentPhase();
  const daysSince = getDaysSince();
  const nextPeriod = getNextPeriodDate();
  const avgCycleLength = getCycleLength();

  const webTopPadding = Platform.OS === "web" ? 67 : 0;
  const webBottomPadding = Platform.OS === "web" ? 34 : 0;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Cycle Tracker</Text>

        <View style={[styles.phaseCard, { backgroundColor: phase.color + "15", borderColor: phase.color + "30" }]}>
          <View style={[styles.phaseIndicator, { backgroundColor: phase.color }]} />
          <View style={styles.phaseInfo}>
            <Text style={[styles.phaseLabel, { color: theme.textSecondary }]}>Current Phase</Text>
            <Text style={[styles.phaseName, { color: phase.color }]}>{phase.name}</Text>
            {daysSince !== null ? (
              <Text style={[styles.dayCount, { color: theme.textSecondary }]}>Day {daysSince + 1}</Text>
            ) : null}
          </View>
          <View style={styles.phaseIcon}>
            <MaterialCommunityIcons name="flower-tulip" size={40} color={phase.color} />
          </View>
        </View>

        <View style={styles.actionRow}>
          {!activeCycle ? (
            <Pressable
              onPress={startPeriod}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: Colors.dark.pink, opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.actionText}>Log Period Start</Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                onPress={endPeriod}
                style={({ pressed }) => [
                  styles.actionButton,
                  { flex: 1, backgroundColor: theme.surface, borderColor: Colors.dark.pink, borderWidth: 2, opacity: pressed ? 0.9 : 1 },
                ]}
              >
                <Ionicons name="checkmark-circle" size={20} color={Colors.dark.pink} />
                <Text style={[styles.actionText, { color: Colors.dark.pink }]}>End Period</Text>
              </Pressable>
              <Pressable
                onPress={() => setIsLogging(!isLogging)}
                style={({ pressed }) => [
                  styles.actionButton,
                  { flex: 1, backgroundColor: Colors.dark.pink, opacity: pressed ? 0.9 : 1 },
                ]}
              >
                <Ionicons name="list" size={20} color="#fff" />
                <Text style={styles.actionText}>Log Symptoms</Text>
              </Pressable>
            </>
          )}
        </View>

        {isLogging ? (
          <View style={[styles.symptomsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.symptomsTitle, { color: theme.text }]}>How are you feeling?</Text>
            <View style={styles.symptomsGrid}>
              {SYMPTOMS.map((s) => {
                const isSelected = selectedSymptoms.includes(s.key);
                return (
                  <Pressable
                    key={s.key}
                    onPress={() => toggleSymptom(s.key)}
                    style={[
                      styles.symptomChip,
                      {
                        backgroundColor: isSelected ? Colors.dark.pink + "20" : theme.surfaceLight,
                        borderColor: isSelected ? Colors.dark.pink : theme.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={s.icon}
                      size={18}
                      color={isSelected ? Colors.dark.pink : theme.textSecondary}
                    />
                    <Text
                      style={[
                        styles.symptomLabel,
                        { color: isSelected ? Colors.dark.pink : theme.textSecondary },
                      ]}
                    >
                      {s.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {selectedSymptoms.length > 0 ? (
              <Pressable
                onPress={logSymptoms}
                style={({ pressed }) => [
                  styles.saveButton,
                  { backgroundColor: Colors.dark.pink, opacity: pressed ? 0.9 : 1 },
                ]}
              >
                <Text style={styles.saveButtonText}>Save Symptoms</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <View style={styles.insightsRow}>
          <View style={[styles.insightCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="calendar" size={22} color={Colors.primary} />
            <Text style={[styles.insightValue, { color: theme.text }]}>{avgCycleLength}</Text>
            <Text style={[styles.insightLabel, { color: theme.textMuted }]}>Avg Cycle Days</Text>
          </View>
          <View style={[styles.insightCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="time" size={22} color={Colors.dark.pink} />
            <Text style={[styles.insightValue, { color: theme.text }]}>
              {nextPeriod
                ? Math.max(0, Math.round((nextPeriod.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                : "--"}
            </Text>
            <Text style={[styles.insightLabel, { color: theme.textMuted }]}>Days Until Next</Text>
          </View>
        </View>

        {cycles.length > 0 ? (
          <View style={styles.historySection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>History</Text>
            {cycles.slice(0, 6).map((cycle) => (
              <View
                key={cycle.id}
                style={[styles.historyItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <View style={[styles.historyDot, { backgroundColor: Colors.dark.pink }]} />
                <View style={styles.historyInfo}>
                  <Text style={[styles.historyDate, { color: theme.text }]}>
                    {formatDate(cycle.startDate)}
                    {cycle.endDate ? ` - ${formatDate(cycle.endDate)}` : " (Ongoing)"}
                  </Text>
                  {cycle.symptoms.length > 0 ? (
                    <Text style={[styles.historySymptoms, { color: theme.textMuted }]}>
                      {cycle.symptoms.join(", ")}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    deleteCycleEntry(cycle.id).then(loadCycles);
                  }}
                  hitSlop={8}
                >
                  <Ionicons name="close-circle-outline" size={20} color={theme.textMuted} />
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="flower-tulip-outline" size={48} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>No cycles logged yet</Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              Start logging your period to track your cycle
            </Text>
          </View>
        )}
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
  phaseCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    gap: 16,
  },
  phaseIndicator: {
    width: 4,
    height: 60,
    borderRadius: 2,
  },
  phaseInfo: {
    flex: 1,
    gap: 2,
  },
  phaseLabel: {
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
  },
  phaseName: {
    fontSize: 24,
    fontFamily: "Outfit_700Bold",
  },
  dayCount: {
    fontSize: 14,
    fontFamily: "Outfit_500Medium",
  },
  phaseIcon: {
    opacity: 0.8,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 14,
    paddingHorizontal: 20,
  },
  actionText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Outfit_600SemiBold",
  },
  symptomsCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  symptomsTitle: {
    fontSize: 18,
    fontFamily: "Outfit_600SemiBold",
  },
  symptomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  symptomChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  symptomLabel: {
    fontSize: 14,
    fontFamily: "Outfit_500Medium",
  },
  saveButton: {
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 14,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Outfit_600SemiBold",
  },
  insightsRow: {
    flexDirection: "row",
    gap: 12,
  },
  insightCard: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  insightValue: {
    fontSize: 28,
    fontFamily: "Outfit_700Bold",
  },
  insightLabel: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
  },
  historySection: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Outfit_600SemiBold",
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  historyInfo: {
    flex: 1,
    gap: 2,
  },
  historyDate: {
    fontSize: 15,
    fontFamily: "Outfit_500Medium",
  },
  historySymptoms: {
    fontSize: 13,
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
