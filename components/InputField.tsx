import { useState } from "react";
import {
  KeyboardTypeOptions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";

type InputFieldProps = {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  error?: string;
  autoCapitalize?: TextInputProps["autoCapitalize"];
};

const webInputReset =
  Platform.OS === "web"
    ? ({
        outlineStyle: "none",
      } as any)
    : null;

export default function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = "default",
  error,
  autoCapitalize = "none",
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrap, error && styles.inputError]}>
        <TextInput
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          secureTextEntry={secureTextEntry && !showPassword}
          style={[styles.input, webInputReset]}
          value={value}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={10}
            style={styles.eyeBtn}
          >
            {showPassword ? (
              <EyeOff color={COLORS.textMuted} size={20} />
            ) : (
              <Eye color={COLORS.textMuted} size={20} />
            )}
          </Pressable>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 54,
    borderWidth: 0,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    fontFamily: FONTS.regular,
    paddingVertical: 14,
  },
  eyeBtn: {
    paddingLeft: 10,
  },
  error: {
    color: COLORS.error,
    fontSize: 13,
    fontFamily: FONTS.medium,
    marginTop: 6,
  },
});
