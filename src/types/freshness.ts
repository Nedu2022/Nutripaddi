export type FreshnessTone = "good" | "caution" | "risk";

export type FreshnessEstimate = {
  score: number;
  label: string;
  tone: FreshnessTone;
  summary: string;
  signals: string[];
  storageTip: string;
  disclaimer: string;
};
