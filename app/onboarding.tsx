import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, Pressable, Platform, useColorScheme, KeyboardAvoidingView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useUser } from "@/contexts/UserContext";

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const { createProfile } = useUser();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | null>(null);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 0 && name.trim()) {
      setStep(1);
    }
  };

  const handleGenderSelect = (g: "male" | "female" | "other") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setGender(g);
  };

  const handleFinish = async () => {
    if (!gender) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await createProfile(name.trim(), gender);
    router.replace("/(tabs)");
  };

  const webTopPadding = Platform.OS === "web" ? 67 : 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={isDark ? ["#0A0A1A", "#0D1A2E", "#0A0A1A"] : ["#F5F5FA", "#E8F5F0", "#F5F5FA"]}
        style={[styles.container, { paddingTop: insets.top + webTopPadding + 40, paddingBottom: insets.bottom + 20 }]}
      >
        <View style={styles.header}>
          <Text style={[styles.logo, { color: Colors.primary }]}>STRONG</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Your fitness journey starts here
          </Text>
        </View>

        {step === 0 ? (
          <View style={styles.content}>
            <Text style={[styles.question, { color: theme.text }]}>What's your name?</Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="person-outline" size={20} color={theme.textMuted} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Enter your name"
                placeholderTextColor={theme.textMuted}
                value={name}
                onChangeText={setName}
                autoFocus
                returnKeyType="next"
                onSubmitEditing={handleNext}
              />
            </View>
            <Pressable
              onPress={handleNext}
              disabled={!name.trim()}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: name.trim() ? Colors.primary : theme.surfaceLight, opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Text style={[styles.buttonText, { color: name.trim() ? "#fff" : theme.textMuted }]}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color={name.trim() ? "#fff" : theme.textMuted} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.content}>
            <Text style={[styles.question, { color: theme.text }]}>
              Hi {name}! Select your gender
            </Text>
            <Text style={[styles.hint, { color: theme.textSecondary }]}>
              This helps us personalize your experience
            </Text>

            <View style={styles.genderGrid}>
              {([
                { key: "male" as const, icon: "male" as const, label: "Male" },
                { key: "female" as const, icon: "female" as const, label: "Female" },
                { key: "other" as const, icon: "body" as const, label: "Other" },
              ]).map((g) => (
                <Pressable
                  key={g.key}
                  onPress={() => handleGenderSelect(g.key)}
                  style={({ pressed }) => [
                    styles.genderCard,
                    {
                      backgroundColor: gender === g.key ? Colors.primary + "20" : theme.surface,
                      borderColor: gender === g.key ? Colors.primary : theme.border,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  <Ionicons
                    name={g.icon}
                    size={32}
                    color={gender === g.key ? Colors.primary : theme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.genderLabel,
                      { color: gender === g.key ? Colors.primary : theme.text },
                    ]}
                  >
                    {g.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={handleFinish}
              disabled={!gender}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: gender ? Colors.primary : theme.surfaceLight, opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Text style={[styles.buttonText, { color: gender ? "#fff" : theme.textMuted }]}>Get Started</Text>
              <Ionicons name="fitness" size={20} color={gender ? "#fff" : theme.textMuted} />
            </Pressable>
          </View>
        )}

        <View style={styles.dots}>
          {[0, 1].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: step === i ? Colors.primary : theme.border },
              ]}
            />
          ))}
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  logo: {
    fontSize: 42,
    fontFamily: "Outfit_700Bold",
    letterSpacing: 6,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    marginTop: 8,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    gap: 20,
  },
  question: {
    fontSize: 28,
    fontFamily: "Outfit_700Bold",
    textAlign: "center",
  },
  hint: {
    fontSize: 15,
    fontFamily: "Outfit_400Regular",
    textAlign: "center",
    marginTop: -8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    gap: 12,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontFamily: "Outfit_500Medium",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    height: 56,
    marginTop: 12,
  },
  buttonText: {
    fontSize: 17,
    fontFamily: "Outfit_600SemiBold",
  },
  genderGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  genderCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 24,
    gap: 8,
  },
  genderLabel: {
    fontSize: 15,
    fontFamily: "Outfit_600SemiBold",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
