import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import * as Crypto from "expo-crypto";
import { getUserProfile, saveUserProfile, UserProfile } from "@/lib/storage";

interface UserContextValue {
  profile: UserProfile | null;
  isLoading: boolean;
  isOnboarded: boolean;
  createProfile: (name: string, gender: "male" | "female" | "other") => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  togglePremium: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const p = await getUserProfile();
    setProfile(p);
    setIsLoading(false);
  }

  async function createProfile(name: string, gender: "male" | "female" | "other") {
    const newProfile: UserProfile = {
      id: Crypto.randomUUID(),
      name,
      gender,
      isPremium: false,
      dailyCalorieGoal: 2000,
      dailyStepGoal: 10000,
      createdAt: new Date().toISOString(),
    };
    await saveUserProfile(newProfile);
    setProfile(newProfile);
  }

  async function updateProfile(updates: Partial<UserProfile>) {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    await saveUserProfile(updated);
    setProfile(updated);
  }

  async function togglePremium() {
    if (!profile) return;
    const updated = { ...profile, isPremium: !profile.isPremium };
    await saveUserProfile(updated);
    setProfile(updated);
  }

  const value = useMemo(
    () => ({
      profile,
      isLoading,
      isOnboarded: !!profile,
      createProfile,
      updateProfile,
      togglePremium,
    }),
    [profile, isLoading]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
