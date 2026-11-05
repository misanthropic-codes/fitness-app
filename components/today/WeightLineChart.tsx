import { useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../../constants/theme";

type Point = { label: string; kg: number };

type Props = {
  points: Point[];
  targetKg?: number;
};

export function WeightLineChart({ points, targetKg }: Props) {
  const [size, setSize] = useState({ w: 0, h: 140 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
  };

  if (points.length === 0) return null;

  const values = points.map((p) => p.kg);
  if (targetKg != null) values.push(targetKg);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const pad = Math.max(0.4, (rawMax - rawMin) * 0.2);
  const min = rawMin - pad;
  const max = rawMax + pad;
  const span = max - min || 1;

  const plotH = size.h - 22;
  const coords = points.map((p, i) => {
    const t = points.length === 1 ? 0.5 : i / (points.length - 1);
    return {
      x: t * size.w,
      y: 8 + (1 - (p.kg - min) / span) * (plotH - 8),
      label: p.label,
      kg: p.kg,
    };
  });

  const targetY =
    targetKg != null ? 8 + (1 - (targetKg - min) / span) * (plotH - 8) : null;

  return (
    <View style={styles.wrap}>
      <View style={styles.plot} onLayout={onLayout}>
        {targetY != null && size.w > 0 ? (
          <View style={[styles.targetLine, { top: targetY }]} />
        ) : null}

        {size.w > 0
          ? coords.slice(1).map((c, i) => {
              const prev = coords[i]!;
              const dx = c.x - prev.x;
              const dy = c.y - prev.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
              return (
                <View
                  key={`seg-${i}`}
                  style={[
                    styles.seg,
                    {
                      left: (prev.x + c.x) / 2 - len / 2,
                      top: (prev.y + c.y) / 2 - 1.25,
                      width: len,
                      transform: [{ rotate: `${angle}deg` }],
                    },
                  ]}
                />
              );
            })
          : null}

        {size.w > 0
          ? coords.map((c, i) => (
              <View
                key={`dot-${i}`}
                style={[styles.dot, { left: c.x - 4, top: c.y - 4 }]}
              />
            ))
          : null}
      </View>

      <View style={styles.labels}>
        {points.map((p, i) => (
          <Text key={`${p.label}-${i}`} style={styles.label}>
            {p.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 4,
  },
  plot: {
    height: 148,
    width: "100%",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.55)",
    overflow: "hidden",
  },
  targetLine: {
    position: "absolute",
    left: 8,
    right: 8,
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: colors.accent,
    opacity: 0.55,
  },
  seg: {
    position: "absolute",
    height: 2.5,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  dot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: "#F7F2E9",
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 2,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.textMuted,
  },
});
