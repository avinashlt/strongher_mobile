import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  USER_PROFILE: "strong_user_profile",
  FOOD_LOG: "strong_food_log",
  STEP_DATA: "strong_step_data",
  CYCLE_DATA: "strong_cycle_data",
  PREMIUM_STATUS: "strong_premium",
};

export interface UserProfile {
  id: string;
  name: string;
  gender: "male" | "female" | "other";
  isPremium: boolean;
  dailyCalorieGoal: number;
  dailyStepGoal: number;
  createdAt: string;
}

export interface FoodEntry {
  id: string;
  imageUri: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  timestamp: string;
}

export interface StepDay {
  date: string;
  steps: number;
  goal: number;
}

export interface CycleEntry {
  id: string;
  startDate: string;
  endDate?: string;
  symptoms: string[];
  notes: string;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
  return data ? JSON.parse(data) : null;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
}

export async function getFoodLog(): Promise<FoodEntry[]> {
  const data = await AsyncStorage.getItem(KEYS.FOOD_LOG);
  return data ? JSON.parse(data) : [];
}

export async function saveFoodEntry(entry: FoodEntry): Promise<void> {
  const log = await getFoodLog();
  log.unshift(entry);
  await AsyncStorage.setItem(KEYS.FOOD_LOG, JSON.stringify(log));
}

export async function deleteFoodEntry(id: string): Promise<void> {
  const log = await getFoodLog();
  const filtered = log.filter((e) => e.id !== id);
  await AsyncStorage.setItem(KEYS.FOOD_LOG, JSON.stringify(filtered));
}

export async function getStepData(): Promise<StepDay[]> {
  const data = await AsyncStorage.getItem(KEYS.STEP_DATA);
  return data ? JSON.parse(data) : [];
}

export async function saveStepDay(day: StepDay): Promise<void> {
  const data = await getStepData();
  const idx = data.findIndex((d) => d.date === day.date);
  if (idx >= 0) {
    data[idx] = day;
  } else {
    data.unshift(day);
  }
  await AsyncStorage.setItem(KEYS.STEP_DATA, JSON.stringify(data));
}

export async function getCycleData(): Promise<CycleEntry[]> {
  const data = await AsyncStorage.getItem(KEYS.CYCLE_DATA);
  return data ? JSON.parse(data) : [];
}

export async function saveCycleEntry(entry: CycleEntry): Promise<void> {
  const data = await getCycleData();
  const idx = data.findIndex((e) => e.id === entry.id);
  if (idx >= 0) {
    data[idx] = entry;
  } else {
    data.unshift(entry);
  }
  await AsyncStorage.setItem(KEYS.CYCLE_DATA, JSON.stringify(data));
}

export async function deleteCycleEntry(id: string): Promise<void> {
  const data = await getCycleData();
  const filtered = data.filter((e) => e.id !== id);
  await AsyncStorage.setItem(KEYS.CYCLE_DATA, JSON.stringify(filtered));
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}
