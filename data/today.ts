/** Placeholder day model until API sync lands. Missing = null / 0, never invented. */
export type TodayLogEntry = {
  id: string;
  kind: "meal" | "weight" | "workout" | "alcohol" | "smoking";
  title: string;
  detail: string;
  time: string;
};

export type WeekDay = {
  key: string;
  label: string;
  /** true = had a training log; null = future / unknown */
  trained: boolean | null;
  isToday?: boolean;
};

export type TodaySnapshot = {
  caloriesTarget: number;
  caloriesLogged: number;
  proteinLogged: number;
  proteinTarget: number;
  carbsLogged: number;
  carbsTarget: number;
  fatLogged: number;
  fatTarget: number;
  weightKg: number | null;
  steps: number | null;
  workoutMinutes: number;
  alcoholServings: number;
  alcoholEthanolG: number;
  cigarettes: number;
  entries: TodayLogEntry[];
  week: WeekDay[];
  insight: {
    title: string;
    body: string;
    confidence: "low" | "moderate" | "high";
  } | null;
};

function buildWeek(): WeekDay[] {
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  const today = new Date();
  const day = (today.getDay() + 6) % 7; // Mon=0
  return labels.map((label, i) => ({
    key: `${label}-${i}`,
    label,
    trained: i > day ? null : false,
    isToday: i === day,
  }));
}

export const emptyToday: TodaySnapshot = {
  caloriesTarget: 2100,
  caloriesLogged: 0,
  proteinLogged: 0,
  proteinTarget: 140,
  carbsLogged: 0,
  carbsTarget: 220,
  fatLogged: 0,
  fatTarget: 70,
  weightKg: null,
  steps: null,
  workoutMinutes: 0,
  alcoholServings: 0,
  alcoholEthanolG: 0,
  cigarettes: 0,
  entries: [],
  week: buildWeek(),
  insight: null,
};
