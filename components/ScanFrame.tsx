import { StyleSheet, View } from "react-native";

type Props = {
  color?: string;
  glowing?: boolean;
  size?: number;
};

const DEFAULT_FRAME = 280;
const THICK  = 4;

export default function ScanFrame({
  color   = "rgba(255,255,255,0.90)",
  glowing = false,
  size    = DEFAULT_FRAME,
}: Props) {
  const arm = Math.max(50, Math.round(size * 0.19));
  const radius = Math.max(16, Math.round(size * 0.065));
  const shadow = glowing
    ? { shadowColor: color, shadowOpacity: 0.75, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } }
    : {};

  return (
    <View style={[styles.frame, { width: size, height: size }]}>
      {glowing && (
        <View
          style={[
            styles.innerGlow,
            { backgroundColor: "rgba(0,210,106,0.06)", borderRadius: radius },
          ]}
        />
      )}
      <View
        style={[
          styles.c,
          styles.tl,
          { borderColor: color, borderTopLeftRadius: radius, width: arm, height: arm },
          shadow,
        ]}
      />
      <View
        style={[
          styles.c,
          styles.tr,
          { borderColor: color, borderTopRightRadius: radius, width: arm, height: arm },
          shadow,
        ]}
      />
      <View
        style={[
          styles.c,
          styles.bl,
          { borderColor: color, borderBottomLeftRadius: radius, width: arm, height: arm },
          shadow,
        ]}
      />
      <View
        style={[
          styles.c,
          styles.br,
          { borderColor: color, borderBottomRightRadius: radius, width: arm, height: arm },
          shadow,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems:     "center",
    justifyContent: "center",
  },
  innerGlow: {
    position:     "absolute",
    top: 8, left: 8, right: 8, bottom: 8,
  },
  c: {
    position: "absolute",
  },
  tl: {
    top: 0, left: 0,
    borderTopWidth:    THICK,
    borderLeftWidth:   THICK,
    borderColor:       "white",
  },
  tr: {
    top: 0, right: 0,
    borderTopWidth:     THICK,
    borderRightWidth:   THICK,
    borderColor:        "white",
  },
  bl: {
    bottom: 0, left: 0,
    borderBottomWidth:  THICK,
    borderLeftWidth:    THICK,
    borderColor:        "white",
  },
  br: {
    bottom: 0, right: 0,
    borderBottomWidth:  THICK,
    borderRightWidth:   THICK,
    borderColor:        "white",
  },
});
