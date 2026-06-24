import { useEffect } from "react";
import type { ImageSourcePropType } from "react-native";
import { Image, StyleSheet, Text, View } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { Baby } from "lucide-react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";

type OnboardingSlideProps = {
  image: ImageSourcePropType | null;
  title: string;
  description?: string;
  index?: number;
};

function MaternalArtwork() {
  return (
    <View style={styles.maternalCard}>
      <View style={styles.maternalRibbon}>
        <Text style={styles.maternalRibbonText}>First 1,000 Days</Text>
      </View>
      <View style={styles.maternalBadge}>
        <Baby color={COLORS.white} size={56} strokeWidth={1.6} />
      </View>
      <Text style={styles.maternalHeading}>Mother &amp; Baby</Text>
      <View style={styles.nutrientRow}>
        {[
          { label: "Iron", color: COLORS.primary },
          { label: "Folate", color: COLORS.secondary },
          { label: "Protein", color: "#E05D8B" },
        ].map((nutrient) => (
          <View key={nutrient.label} style={styles.nutrientPill}>
            <View style={[styles.nutrientDot, { backgroundColor: nutrient.color }]} />
            <Text style={styles.nutrientPillText}>{nutrient.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

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
        <View style={styles.scanLabelDot} />
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
        <View style={styles.chartSealBar} />
        <View style={[styles.chartSealBar, { height: 14 }]} />
        <View style={[styles.chartSealBar, { height: 10 }]} />
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
          <View style={styles.ticketLeafMark} />
          <Text style={styles.ticketTitle}>NutriPadi</Text>
        </View>
        <Text style={styles.ticketMeal}>Eat Smarter</Text>
        <Text style={styles.ticketMeta}>track • learn • grow</Text>
        <View style={styles.ticketFooter}>
          <View style={styles.ticketFooterDot} />
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
    entrance.value = withTiming(1, {
      duration: 540,
      easing: Easing.out(Easing.cubic),
    });
  }, [entrance, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [
      { translateY: (1 - entrance.value) * 16 },
      { scale: 0.985 + entrance.value * 0.015 },
    ],
  }));

  const artwork = [
    <MealTicketArtwork key="ticket" />,
    <ScanArtwork key="scan" />,
    <NutritionLabelArtwork key="label" />,
    <MaternalArtwork key="maternal" />,
  ][index] ?? <MealTicketArtwork key="ticket-fallback" />;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {image ? (
        <View style={[styles.imageWrapper, styles.image]}>
          <ExpoImage transition={160} source={image} contentFit="contain" style={{ width: "100%", height: "100%" }} />
        </View>
      ) : (
        <View style={styles.artBoard}>{artwork}</View>
      )}

      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
  },
  imageWrapper: {
    overflow: "hidden",
  },
  image: {
    width: "100%",
    maxWidth: 340,
    height: 340,
    borderRadius: 24,
    marginBottom: 34,
    backgroundColor: COLORS.softGreen,
  },
  artBoard: {
    width: "88%",
    maxWidth: 322,
    aspectRatio: 1.03,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 34,
  },
  maternalCard: {
    width: "92%",
    height: "88%",
    borderRadius: 24,
    backgroundColor: COLORS.softGreen,
    borderColor: "#000",
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  maternalRibbon: {
    position: "absolute",
    top: -12,
    backgroundColor: COLORS.white,
    borderColor: "#000",
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  maternalRibbonText: {
    color: "#000",
    fontSize: 12,
    fontFamily: FONTS.extraBold,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  maternalBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    borderColor: "#000",
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  maternalHeading: {
    color: "#000",
    fontSize: 18,
    fontFamily: FONTS.extraBold,
  },
  nutrientRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  nutrientPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.white,
    borderColor: "#000",
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  nutrientDot: { width: 8, height: 8, borderRadius: 4, borderColor: "#000", borderWidth: 1 },
  nutrientPillText: { color: "#000", fontSize: 12, fontFamily: FONTS.extraBold },
  scanFrame: {
    width: "92%",
    height: "88%",
    borderRadius: 24,
    backgroundColor: COLORS.softGreen,
    borderColor: "#000",
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  cornerTopLeft: {
    position: "absolute", left: 18, top: 18, width: 34, height: 34,
    borderLeftWidth: 4, borderTopWidth: 4, borderColor: "#000", borderTopLeftRadius: 10,
  },
  cornerTopRight: {
    position: "absolute", right: 18, top: 18, width: 34, height: 34,
    borderRightWidth: 4, borderTopWidth: 4, borderColor: "#000", borderTopRightRadius: 10,
  },
  cornerBottomLeft: {
    position: "absolute", left: 18, bottom: 18, width: 34, height: 34,
    borderLeftWidth: 4, borderBottomWidth: 4, borderColor: "#000", borderBottomLeftRadius: 10,
  },
  cornerBottomRight: {
    position: "absolute", right: 18, bottom: 18, width: 34, height: 34,
    borderRightWidth: 4, borderBottomWidth: 4, borderColor: "#000", borderBottomRightRadius: 10,
  },
  plateOuter: {
    width: 150, height: 150, borderRadius: 75, borderWidth: 4,
    borderColor: "#000", alignItems: "center", justifyContent: "center",
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  plateInner: {
    width: 100, height: 100, borderRadius: 50, alignItems: "center",
    justifyContent: "center", backgroundColor: COLORS.softOrange,
    borderColor: "#000", borderWidth: 3,
  },
  foodCluster: { width: 66, height: 54 },
  foodLeaf: {
    position: "absolute", left: 2, top: 8, width: 40, height: 20,
    borderTopLeftRadius: 20, borderBottomRightRadius: 20,
    backgroundColor: COLORS.primary, transform: [{ rotate: "-18deg" }],
    borderColor: "#000", borderWidth: 2,
  },
  foodDot: {
    position: "absolute", right: 6, top: 0, width: 24, height: 24,
    borderRadius: 12, backgroundColor: COLORS.secondary,
    borderColor: "#000", borderWidth: 2,
  },
  foodBlock: {
    position: "absolute", right: 2, bottom: 4, width: 40, height: 22,
    borderRadius: 11, backgroundColor: "#F6D9A8",
    borderColor: "#000", borderWidth: 2,
  },
  scanLabel: {
    position: "absolute", bottom: 28, flexDirection: "row", alignItems: "center", gap: 7,
    borderRadius: 999, backgroundColor: COLORS.white, borderColor: "#000",
    borderWidth: 2, paddingHorizontal: 13, paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  scanLabelDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary, borderColor: "#000", borderWidth: 1,
  },
  scanLabelText: {
    color: "#000", fontSize: 12, fontFamily: FONTS.extraBold, textTransform: "uppercase",
  },
  labelSheet: {
    width: "84%", minHeight: "88%", borderRadius: 18, backgroundColor: COLORS.white,
    borderColor: "#000", borderWidth: 3, padding: 18,
    shadowColor: "#000", shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1, shadowRadius: 0,
  },
  labelTitle: { color: "#000", fontSize: 24, fontFamily: FONTS.extraBold },
  thickRule: { height: 8, backgroundColor: "#000", marginTop: 10, marginBottom: 12 },
  metricRow: { alignItems: "flex-end", flexDirection: "row", justifyContent: "space-between" },
  metricName: { color: "#000", fontSize: 17, fontFamily: FONTS.extraBold },
  metricValue: { color: "#000", fontSize: 36, fontFamily: FONTS.extraBold },
  thinRule: { height: 3, backgroundColor: "#000", marginVertical: 12 },
  barRow: { marginBottom: 13 },
  barLabel: { color: "#000", fontSize: 12, fontFamily: FONTS.extraBold, marginBottom: 5 },
  barTrack: { height: 12, borderRadius: 6, backgroundColor: COLORS.white, borderColor: "#000", borderWidth: 2, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 0, backgroundColor: COLORS.primary, borderRightWidth: 2, borderColor: "#000" },
  chartSeal: {
    position: "absolute", right: 16, bottom: 14, width: 42, height: 42,
    borderRadius: 21, alignItems: "flex-end", justifyContent: "flex-end",
    backgroundColor: COLORS.white, flexDirection: "row", gap: 3,
    paddingHorizontal: 8, paddingBottom: 10,
    borderColor: "#000", borderWidth: 2,
    shadowColor: "#000", shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
  },
  chartSealBar: {
    width: 5, height: 18, borderRadius: 3, backgroundColor: COLORS.primary, borderColor: "#000", borderWidth: 1,
  },
  ticketStack: { width: "88%", height: "86%", justifyContent: "center" },
  backTicket: {
    position: "absolute", left: 18, right: 0, top: 18, bottom: 0,
    borderRadius: 24, backgroundColor: COLORS.softGreen, transform: [{ rotate: "5deg" }],
    borderColor: "#000", borderWidth: 3,
  },
  frontTicket: {
    borderRadius: 24, backgroundColor: COLORS.softOrange, padding: 22,
    minHeight: 230, justifyContent: "space-between", transform: [{ rotate: "-3deg" }],
    borderColor: "#000", borderWidth: 3,
    shadowColor: "#000", shadowOffset: { width: 6, height: 6 }, shadowOpacity: 1, shadowRadius: 0,
  },
  ticketHeader: { alignItems: "center", flexDirection: "row", gap: 10 },
  ticketLeafMark: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: COLORS.primary,
    borderColor: "#000", borderWidth: 2,
  },
  ticketTitle: {
    color: "#000", fontSize: 13, fontFamily: FONTS.extraBold, textTransform: "uppercase",
  },
  ticketMeal: {
    color: "#000", fontSize: 34, fontFamily: FONTS.extraBold, lineHeight: 39, marginTop: 26,
  },
  ticketMeta: { color: "#000", fontSize: 14, fontFamily: FONTS.extraBold, marginTop: 7 },
  ticketFooter: {
    alignItems: "center", alignSelf: "flex-start", flexDirection: "row", gap: 8,
    borderRadius: 999, backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 8,
    borderColor: "#000", borderWidth: 2,
    shadowColor: "#000", shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0,
  },
  ticketFooterDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.secondary, borderColor: "#000", borderWidth: 1,
  },
  ticketFooterText: { color: "#000", fontSize: 12, fontFamily: FONTS.extraBold },
  title: {
    color: COLORS.primary, fontSize: 30, fontFamily: FONTS.extraBold, lineHeight: 37, textAlign: "center",
  },
  description: {
    color: COLORS.textMuted,
    fontSize: 15,
    fontFamily: FONTS.regular,
    lineHeight: 23,
    textAlign: "center",
    marginTop: 14,
    maxWidth: 330,
    alignSelf: "center",
  },
});
