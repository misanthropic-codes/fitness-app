import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radii } from "../../constants/theme";

export type CardOrigin = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Props = {
  visible: boolean;
  origin: CardOrigin | null;
  onClose: () => void;
  face: ReactNode;
  children: ReactNode;
};

const OPEN_SPRING = {
  stiffness: Platform.OS === "android" ? 520 : 320,
  damping: Platform.OS === "android" ? 40 : 24,
  mass: Platform.OS === "android" ? 0.7 : 0.85,
  overshootClamping: Platform.OS === "android",
  useNativeDriver: true as const,
};

const CLOSE_SPRING = {
  stiffness: Platform.OS === "android" ? 620 : 420,
  damping: Platform.OS === "android" ? 48 : 36,
  mass: Platform.OS === "android" ? 0.65 : 0.9,
  overshootClamping: true,
  restDisplacementThreshold: 0.5,
  restSpeedThreshold: 0.5,
  useNativeDriver: true as const,
};

export function CardExpandOverlay({
  visible,
  origin,
  onClose,
  face,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const closing = useRef(false);
  const lastOrigin = useRef<CardOrigin | null>(null);
  const targetRef = useRef({ x: 16, y: 80, w: 360, h: 480 });
  if (origin) lastOrigin.current = origin;
  const from = lastOrigin.current;

  useLayoutEffect(() => {
    if (!visible || !origin) return;
    closing.current = false;
    setMounted(true);
    progress.setValue(0);

    const { width: screenW, height: screenH } = Dimensions.get("window");
    const targetH = Math.min(520, screenH - insets.top - insets.bottom - 48);
    targetRef.current = {
      x: 16,
      y: Math.max(
        insets.top + 12,
        Math.min(origin.y - 8, screenH - insets.bottom - targetH - 16),
      ),
      w: screenW - 32,
      h: targetH,
    };

    const id = requestAnimationFrame(() => {
      Animated.spring(progress, { toValue: 1, ...OPEN_SPRING }).start();
    });
    return () => cancelAnimationFrame(id);
  }, [visible, origin, progress, insets.top, insets.bottom]);

  const requestClose = () => {
    if (closing.current) return;
    closing.current = true;
    Animated.spring(progress, { toValue: 0, ...CLOSE_SPRING }).start(
      ({ finished }) => {
        if (!finished) return;
        setMounted(false);
        onClose();
      },
    );
  };

  if (!from || (!visible && !mounted)) return null;

  const target = targetRef.current;
  const scaleX0 = from.width / target.w;
  const scaleY0 = from.height / target.h;
  const tx0 = from.x + from.width / 2 - (target.x + target.w / 2);
  const ty0 = from.y + from.height / 2 - (target.y + target.h / 2);

  const morphStyle = {
    left: target.x,
    top: target.y,
    width: target.w,
    height: target.h,
    // Only fix: hide the overlay before the squash frames; real card sits underneath.
    opacity: progress.interpolate({
      inputRange: [0, 0.22, 0.35, 1],
      outputRange: [0, 0, 1, 1],
      extrapolate: "clamp" as const,
    }),
    transform: [
      {
        translateX: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [tx0, 0],
          extrapolate: "clamp" as const,
        }),
      },
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [ty0, 0],
          extrapolate: "clamp" as const,
        }),
      },
      {
        scaleX: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [scaleX0, 1],
          extrapolate: "clamp" as const,
        }),
      },
      {
        scaleY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [scaleY0, 1],
          extrapolate: "clamp" as const,
        }),
      },
    ],
  };

  return (
    <Modal
      visible={visible || mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      hardwareAccelerated
      onRequestClose={requestClose}
    >
      <View style={styles.root} pointerEvents="box-none">
        <Pressable style={styles.backdropHit} onPress={requestClose}>
          <Animated.View
            style={[
              styles.backdropFill,
              {
                opacity: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                  extrapolate: "clamp",
                }),
              },
            ]}
          />
        </Pressable>

        <Animated.View
          style={[styles.morph, morphStyle]}
          renderToHardwareTextureAndroid
          needsOffscreenAlphaCompositing={Platform.OS === "android"}
        >
          <Animated.View
            style={[
              {
                width: from.width,
                height: from.height,
                opacity: progress.interpolate({
                  inputRange: [0, 0.55, 0.85],
                  outputRange: [1, 0.2, 0],
                  extrapolate: "clamp",
                }),
              },
            ]}
            pointerEvents="none"
          >
            {face}
          </Animated.View>

          <Animated.View
            style={[
              styles.layer,
              styles.detailLayer,
              {
                opacity: progress.interpolate({
                  inputRange: [0.2, 0.65, 1],
                  outputRange: [0, 0.75, 1],
                  extrapolate: "clamp",
                }),
              },
            ]}
            pointerEvents="box-none"
          >
            <Pressable style={styles.closeHit} onPress={requestClose} hitSlop={10}>
              <Text style={styles.close}>Close</Text>
            </Pressable>
            {children}
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdropHit: { ...StyleSheet.absoluteFill },
  backdropFill: {
    flex: 1,
    backgroundColor: "rgba(20,32,27,0.4)",
  },
  morph: {
    position: "absolute",
    overflow: "hidden",
    backgroundColor: "#F7F2E9",
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  layer: { ...StyleSheet.absoluteFill },
  detailLayer: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18,
  },
  closeHit: {
    position: "absolute",
    top: 18,
    right: 18,
    zIndex: 2,
  },
  close: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.primary,
  },
});
