import { useEffect, useRef, useState } from "react";
import { Text, type StyleProp, type TextStyle } from "react-native";

type Props = {
  text: string;
  style?: StyleProp<TextStyle>;
  charsPerTick?: number;
  intervalMs?: number;
  onTick?: () => void;
  onDone?: () => void;
};

export default function StreamingText({
  text,
  style,
  charsPerTick = 2,
  intervalMs = 16,
  onTick,
  onDone,
}: Props) {
  const [shown, setShown] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    setShown(0);
    doneRef.current = false;
  }, [text]);

  useEffect(() => {
    if (shown >= text.length) {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone?.();
      }
      return;
    }
    const id = setTimeout(() => {
      setShown((current) => Math.min(current + charsPerTick, text.length));
      onTick?.();
    }, intervalMs);
    return () => clearTimeout(id);
  }, [shown, text, charsPerTick, intervalMs, onTick, onDone]);

  return <Text style={style}>{text.slice(0, shown)}</Text>;
}
