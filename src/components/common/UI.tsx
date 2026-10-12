import type { ReactNode } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  type TextInputProps,
  type PressableProps,
} from "react-native";
import styles from "./UI.styles";
import { colors } from "../../theme";

// Small reusable pieces shared by SignUp, SignIn, and the Dashboards.
// Built from React Native's core TextInput / Pressable / Text / View,
// styled with StyleSheet instead of CSS.

export function PillInput({ value, onChangeText, ...props }: TextInputProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      style={styles.pillInput}
      placeholderTextColor={colors.grayText}
      {...props}
    />
  );
}

interface PillButtonProps extends Omit<PressableProps, "children"> {
  children: ReactNode;
}

export function PillButton({ children, disabled, onPress, ...props }: PillButtonProps) {
  return (
    <Pressable
      style={[styles.pillButton, disabled && styles.pillButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
      {...props}
    >
      <Text style={styles.pillButtonText}>{children}</Text>
    </Pressable>
  );
}

export function ScreenHeader({ label }: { label: string }) {
  return (
    <View style={styles.screenHeader}>
      <Text style={styles.screenHeaderLabel}>{label}</Text>
      <Text style={styles.screenHeaderIcon}>◇</Text>
    </View>
  );
}
