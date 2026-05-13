import { useEffect } from "react";
import type { ImageSourcePropType } from "react-native";
import { Image, StyleSheet, Text, View } from "react-native";
import { Camera, ChartNoAxesColumn, ChefHat, Sparkles } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";

type OnboardingSlideProps = {
  image: ImageSourcePropType | null;
  title: string;
  description: string;
  index?: number;
};

function ScanArtwork() {
  return (
    <View style={styles.scanFrame}>
      <View style={styles.cornerTopLeft} />
      <View style={styles.cornerTopRight} />
      <View style={styles.cornerBottomLeft} />
      <View style={styles.cornerBottomRight} />
      <View style={styles.plateOuter}>
        <View style={styles.plateInner}>
          <View style={styles.foodCluster}>
            <View style={styles.foodLeaf} />
            <View style={styles.foodDot} />
            <View style={styles.foodBlock} />
          </View>
        </View>
      </View>
      <View style={styles.scanLabel}>
        <Camera color={COLORS.primaryDark} size={15} strokeWidth={2} />
        <Text style={styles.scanLabelText}>meal scan</Text>
      </View>
    </View>
  );
}

function NutritionLabelArtwork() {
  return (
    <View style={styles.labelSheet}>
      <Text style={styles.labelTitle}>Nutrition Facts</Text>
      <View style={styles.thickRule} />
      <View style={styles.metricRow}>
        <Text style={styles.metricName}>Calories</Text>
        <Text style={styles.metricValue}>420</Text>
      </View>
      <View style={styles.thinRule} />
      {[
        { name: "Protein", pct: 72 },
        { name: "Carbs", pct: 56 },
        { name: "Fiber", pct: 44 },
      ].map((item) => (
        <View key={item.name} style={styles.barRow}>
          <Text style={styles.barLabel}>{item.name}</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${item.pct}%` }]} />
          </View>
        </View>
      ))}
      <View style={styles.chartSeal}>
        <ChartNoAxesColumn color={COLORS.primary} size={22} strokeWidth={2} />
      </View>
    </View>
  );
}

function MealTicketArtwork() {
  return (
    <View style={styles.ticketStack}>
      <View style={styles.backTicket} />
      <View style={styles.frontTicket}>
        <View style={styles.ticketHeader}>
          <ChefHat color={COLORS.primary} size={24} strokeWidth={1.8} />
          <Text style={styles.ticketTitle}>NutriPadi</Text>
        </View>
        <Text style={styles.ticketMeal}>Eat Smarter</Text>
        <Text style={styles.ticketMeta}>track • learn • grow</Text>
        <View style={styles.ticketFooter}>
          <Sparkles color={COLORS.secondary} size={16} strokeWidth={2} />
          <Text style={styles.ticketFooterText}>your food companion</Text>
        </View>
      </View>
    </View>
  );
}

export default function OnboardingSlide({
  image,
  title,
  description,
  index = 0,
}: OnboardingSlideProps) {
  const entrance = useSharedValue(0);

  useEffect(() => {
    entrance.value = 0;
    entrance.value = withTiming(1, { duration: 460 });
  }, [entrance, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [{ translateY: (1 - entrance.value) * 18 }],
  }));

  const artwork = [
    <ScanArtwork key="scan" />,
    <NutritionLabelArtwork key="label" />,
    <MealTicketArtwork key="ticket" />,
  ][index % 3];

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {image ? (
        <Image source={image} resizeMode="cover" style={styles.image} />
      ) : (
        <View style={styles.artBoard}>{artwork}</View>
      )}

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
  },
  image: {
    width: "100%",
    maxWidth: 340,
    height: 340,
    borderRadius: 24,
    marginBottom: 34,
  },
  artBoard: {
    width: "88%",
    maxWidth: 322,
    aspectRatio: 1.03,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 34,
  },
  // Scan artwork
  scanFrame: {
    width: "92%",
    height: "88%",
    borderRadius: 24,
    backgroundColor: COLORS.softGreen,
    borderColor: COLORS.border,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  cornerTopLeft: {
    position: "absolute",
    left: 18,
    top: 18,
    width: 34,
    height: 34,
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderColor: COLORS.primary,
    borderTopLeftRadius: 10,
  },
  cornerTopRight: {
    position: "absolute",
    right: 18,
    top: 18,
    width: 34,
    height: 34,
    borderRightWidth: 3,
    borderTopWidth: 3,
    borderColor: COLORS.primary,
    borderTopRightRadius: 10,
  },
  cornerBottomLeft: {
    position: "absolute",
    left: 18,
    bottom: 18,
    width: 34,
    height: 34,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderColor: COLORS.primary,
    borderBottomLeftRadius: 10,
  },
  cornerBottomRight: {
    position: "absolute",
    right: 18,
    bottom: 18,
    width: 34,
    height: 34,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderColor: COLORS.primary,
    borderBottomRightRadius: 10,
  },
  plateOuter: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 12,
    borderColor: COLORS.softGreen,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },
  plateInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softOrange,
  },
  foodCluster: {
    width: 66,
    height: 54,
  },
  foodLeaf: {
    position: "absolute",
    left: 2,
    top: 8,
    width: 40,
    height: 20,
    borderTopLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: COLORS.primary,
    transform: [{ rotate: "-18deg" }],
  },
  foodDot: {
    position: "absolute",
    right: 6,
    top: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
  },
  foodBlock: {
    position: "absolute",
    right: 2,
    bottom: 4,
    width: 40,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#F6D9A8",
  },
  scanLabel: {
    position: "absolute",
    bottom: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  scanLabelText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontFamily: FONTS.extraBold,
    textTransform: "uppercase",
  },
  // Nutrition label
  labelSheet: {
    width: "84%",
    minHeight: "88%",
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderColor: COLORS.text,
    borderWidth: 2,
    padding: 18,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  labelTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontFamily: FONTS.extraBold,
  },
  thickRule: {
    height: 8,
    backgroundColor: COLORS.text,
    marginTop: 10,
    marginBottom: 12,
  },
  metricRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricName: {
    color: COLORS.text,
    fontSize: 17,
    fontFamily: FONTS.bold,
  },
  metricValue: {
    color: COLORS.text,
    fontSize: 36,
    fontFamily: FONTS.extraBold,
  },
  thinRule: {
    height: 2,
    backgroundColor: COLORS.text,
    marginVertical: 12,
  },
  barRow: {
    marginBottom: 13,
  },
  barLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.bold,
    marginBottom: 5,
  },
  barTrack: {
    height: 8,
    borderRadius: 8,
    backgroundColor: COLORS.softGreen,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  chartSeal: {
    position: "absolute",
    right: 16,
    bottom: 14,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softGreen,
  },
  // Meal ticket
  ticketStack: {
    width: "88%",
    height: "86%",
    justifyContent: "center",
  },
  backTicket: {
    position: "absolute",
    left: 18,
    right: 0,
    top: 18,
    bottom: 0,
    borderRadius: 24,
    backgroundColor: COLORS.softGreen,
    transform: [{ rotate: "5deg" }],
  },
  frontTicket: {
    borderRadius: 24,
    backgroundColor: COLORS.text,
    padding: 22,
    minHeight: 230,
    justifyContent: "space-between",
    transform: [{ rotate: "-3deg" }],
  },
  ticketHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  ticketTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontFamily: FONTS.extraBold,
    textTransform: "uppercase",
  },
  ticketMeal: {
    color: COLORS.white,
    fontSize: 34,
    fontFamily: FONTS.extraBold,
    lineHeight: 39,
    marginTop: 26,
  },
  ticketMeta: {
    color: "#9CA3AF",
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    marginTop: 7,
  },
  ticketFooter: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ticketFooterText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },
  // Typography
  title: {
    color: COLORS.text,
    fontSize: 30,
    fontFamily: FONTS.extraBold,
    lineHeight: 37,
    textAlign: "center",
  },
  description: {
    color: COLORS.textMuted,
    fontSize: 15,
    fontFamily: FONTS.regular,
    lineHeight: 23,
    marginTop: 12,
    maxWidth: 320,
    textAlign: "center",
  },
});
