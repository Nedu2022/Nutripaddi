import * as Speech from "expo-speech";

export function speak(text: string) {
  try {
    Speech.stop();
    Speech.speak(text, { rate: 1.0, pitch: 1.0 });
  } catch {
  }
}

export function stopSpeaking() {
  try {
    Speech.stop();
  } catch {
  }
}
