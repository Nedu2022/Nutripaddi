import { StyleSheet, Text, View } from "react-native";
import {
  Activity,
  Database,
  Gauge,
  HardDrive,
  ShieldCheck,
  Star,
} from "lucide-react-native";

import AppHeader from "@/components/AppHeader";
import ScreenWrapper from "@/components/ScreenWrapper";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import { RESEARCH_METRICS } from "@/data/research";

const metricIcons = [Activity, Gauge, HardDrive, ShieldCheck, Star, Star];

export default function ResearchSummaryScreen() {
  return (
    <ScreenWrapper scroll>
      <AppHeader
        showBack
        title="Research Summary"
        subtitle="Prototype evaluation snapshot"
      />

      <View style={styles.heroCard}>
        <View style={styles.heroIcon}>
          <Database color={COLORS.white} size={24} />
        </View>
        <Text style={styles.heroTitle}>NutriPadi evaluation focus</Text>
        <Text style={styles.heroText}>
          This screen keeps the academic measures visible: recognition accuracy,
          inference speed, model size, offline support, usefulness, and ease of
          use.
        </Text>
      </View>

      <View style={styles.metricGrid}>
        {RESEARCH_METRICS.map((metric, index) => {
          const Icon = metricIcons[index] ?? Activity;
          return (
            <View key={metric.label} style={styles.metricCard}>
              <View style={styles.metricIcon}>
                <Icon color={COLORS.primary} size={20} />
              </View>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={styles.metricNote}>{metric.note}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>Research note</Text>
        <Text style={styles.noteText}>
          These values are placeholders for the current prototype. Replace them
          with measured results after model testing and user evaluation.
        </Text>
      </View>

      <View style={{ height: 24 }} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontFamily: FONTS.extraBold,
  },
  heroText: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 13,
    fontFamily: FONTS.medium,
    lineHeight: 20,
    marginTop: 8,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    width: "48%",
    minHeight: 178,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  metricIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.softGreen,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  metricValue: {
    color: COLORS.text,
    fontSize: 24,
    fontFamily: FONTS.extraBold,
  },
  metricLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontFamily: FONTS.bold,
    marginTop: 4,
  },
  metricNote: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.medium,
    lineHeight: 16,
    marginTop: 6,
  },
  noteCard: {
    backgroundColor: COLORS.softYellow,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  noteTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
  noteText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.medium,
    lineHeight: 20,
    marginTop: 6,
  },
});
