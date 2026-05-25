import { StyleSheet, View } from "react-native";

type Props = {
  color?: string;
  glowing?: boolean;
};

const FRAME  = 280;
const ARM    = 54;
const THICK  = 4;
const RADIUS = 18;

export default function ScanFrame({
  color   = "rgba(255,255,255,0.90)",
  glowing = false,
}: Props) {
  const shadow = glowing
    ? { shadowColor: color, shadowOpacity: 0.75, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } }
    : {};

  return (
    <View style={styles.frame}>
      {glowing && (
        <View style={[styles.innerGlow, { backgroundColor: "rgba(0,210,106,0.06)" }]} />
      )}
      <View style={[styles.c, styles.tl, { borderColor: color }, shadow]} />
      <View style={[styles.c, styles.tr, { borderColor: color }, shadow]} />
      <View style={[styles.c, styles.bl, { borderColor: color }, shadow]} />
      <View style={[styles.c, styles.br, { borderColor: color }, shadow]} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width:  FRAME,
    height: FRAME,
    alignItems:     "center",
    justifyContent: "center",
  },
  innerGlow: {
    position:     "absolute",
    top: 8, left: 8, right: 8, bottom: 8,
    borderRadius: RADIUS,
  },
  c: {
    position: "absolute",
    width:    ARM,
    height:   ARM,
  },
  tl: {
    top: 0, left: 0,
    borderTopWidth:    THICK,
    borderLeftWidth:   THICK,
    borderColor:       "white",
    borderTopLeftRadius: RADIUS,
  },
  tr: {
    top: 0, right: 0,
    borderTopWidth:     THICK,
    borderRightWidth:   THICK,
    borderColor:        "white",
    borderTopRightRadius: RADIUS,
  },
  bl: {
    bottom: 0, left: 0,
    borderBottomWidth:  THICK,
    borderLeftWidth:    THICK,
    borderColor:        "white",
    borderBottomLeftRadius: RADIUS,
  },
  br: {
    bottom: 0, right: 0,
    borderBottomWidth:  THICK,
    borderRightWidth:   THICK,
    borderColor:        "white",
    borderBottomRightRadius: RADIUS,
  },
});
