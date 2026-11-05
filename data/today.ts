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
  weightTargetKg: number;
  weightHistory: {
    week: { label: string; kg: number }[];
    month: { label: string; kg: number }[];
    year: { label: string; kg: number }[];
  };
  steps: number | null;
  stepsGoal: number;
  caloriesBurned: number;
  caloriesBurnGoal: number;
  workoutMinutes: number;
  moveHistory: {
    week: { label: string; steps: number; burn: number }[];
    month: { label: string; steps: number; burn: number }[];
    year: { label: string; steps: number; burn: number }[];
  };
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
  weightKg: 73.4,
  weightTargetKg: 72,
  // shortcut: seed UI for weight line chart, replace with API series
  weightHistory: {
    week: [
      { label: "M", kg: 73.9 },
      { label: "T", kg: 73.7 },
      { label: "W", kg: 73.8 },
      { label: "T", kg: 73.5 },
      { label: "F", kg: 73.6 },
      { label: "S", kg: 73.3 },
      { label: "S", kg: 73.4 },
    ],
    month: [
      { label: "W1", kg: 74.2 },
      { label: "W2", kg: 73.9 },
      { label: "W3", kg: 73.6 },
      { label: "W4", kg: 73.4 },
    ],
    year: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"].map(
      (label, i) => ({
        label,
        kg: 75.2 - i * 0.15 + ((i % 3) - 1) * 0.12,
      }),
    ),
  },
  steps: 6420,
  stepsGoal: 10000,
  caloriesBurned: 310,
  caloriesBurnGoal: 500,
  workoutMinutes: 0,
  // shortcut: seed UI for expand charts, replace with API aggregates
  moveHistory: {
    week: [
      { label: "M", steps: 8200, burn: 420 },
      { label: "T", steps: 6100, burn: 290 },
      { label: "W", steps: 9400, burn: 510 },
      { label: "T", steps: 4300, burn: 180 },
      { label: "F", steps: 7800, burn: 360 },
      { label: "S", steps: 11200, burn: 640 },
      { label: "S", steps: 6420, burn: 310 },
    ],
    month: [
      { label: "W1", steps: 7200, burn: 340 },
      { label: "W2", steps: 8100, burn: 390 },
      { label: "W3", steps: 6900, burn: 320 },
      { label: "W4", steps: 7600, burn: 350 },
    ],
    year: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"].map(
      (label, i) => ({
        label,
        steps: 5000 + ((i * 37) % 4000),
        burn: 250 + ((i * 19) % 200),
      }),
    ),
  },
  alcoholServings: 0,
  alcoholEthanolG: 0,
  cigarettes: 0,
  entries: [],
  week: buildWeek(),
  insight: null,
};
