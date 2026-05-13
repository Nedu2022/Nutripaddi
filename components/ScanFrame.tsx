import { StyleSheet, View } from "react-native";

import { COLORS } from "@/constants/colors";

export default function ScanFrame() {
  return (
    <View style={styles.frame}>
      {/* Top-left corner */}
      <View style={[styles.corner, styles.topLeft]} />
      {/* Top-right corner */}
      <View style={[styles.corner, styles.topRight]} />
      {/* Bottom-left corner */}
      <View style={[styles.corner, styles.bottomLeft]} />
      {/* Bottom-right corner */}
      <View style={[styles.corner, styles.bottomRight]} />

      {/* Scan line */}
      <View style={styles.scanLine} />
    </View>
  );
}

const CORNER_SIZE = 40;
const BORDER_WIDTH = 2;

const styles = StyleSheet.create({
  frame: {
    width: "100%",
    aspectRatio: 1,
    maxWidth: 320,
    maxHeight: 320,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  topLeft: {
    top: 16,
    left: 16,
    borderTopWidth: BORDER_WIDTH,
    borderLeftWidth: BORDER_WIDTH,
    borderColor: COLORS.white,
    borderTopLeftRadius: 10,
  },
  topRight: {
    top: 16,
    right: 16,
    borderTopWidth: BORDER_WIDTH,
    borderRightWidth: BORDER_WIDTH,
    borderColor: COLORS.white,
    borderTopRightRadius: 10,
  },
  bottomLeft: {
    bottom: 16,
    left: 16,
    borderBottomWidth: BORDER_WIDTH,
    borderLeftWidth: BORDER_WIDTH,
    borderColor: COLORS.white,
    borderBottomLeftRadius: 10,
  },
  bottomRight: {
    bottom: 16,
    right: 16,
    borderBottomWidth: BORDER_WIDTH,
    borderRightWidth: BORDER_WIDTH,
    borderColor: COLORS.white,
    borderBottomRightRadius: 10,
  },
  scanLine: {
    width: "80%",
    height: 1.5,
    backgroundColor: COLORS.white,
    borderRadius: 1,
    opacity: 0.8,
  },
});
