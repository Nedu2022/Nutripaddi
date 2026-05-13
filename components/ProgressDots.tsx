import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { COLORS } from "@/constants/colors";

type ProgressDotsProps = {
  total: number;
  currentIndex: number;
};

export default function ProgressDots({ total, currentIndex }: ProgressDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <Dot key={index} active={index === currentIndex} />
      ))}
    </View>
  );
}

function Dot({ active }: { active: boolean }) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(active ? 28 : 9, { duration: 250 }),
    backgroundColor: withTiming(active ? COLORS.primary : COLORS.border, {
      duration: 250,
    }),
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  dot: {
    height: 9,
    borderRadius: 9,
  },
});
