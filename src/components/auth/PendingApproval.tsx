import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { GuideStatus } from "../../types";
import { PillButton, ScreenHeader } from "../common/UI";
import { colors } from "../../theme";

interface PendingApprovalProps {
  status?: GuideStatus;
  onRefresh: () => Promise<void>;
  onSignOut: () => void;
}

export default function PendingApproval({ status, onRefresh, onSignOut }: PendingApprovalProps) {
  const [checking, setChecking] = useState(false);
  const rejected = status === "rejected";

  async function handleRefresh() {
    setChecking(true);
    try {
      await onRefresh();
    } finally {
      setChecking(false);
    }
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader label={rejected ? "Application rejected" : "Pending approval"} />
      <Text style={styles.title}>
        {rejected ? "Application not approved" : "Waiting for verification"}
      </Text>
      <Text style={styles.body}>
        {rejected
          ? "Your guide accreditation was not approved. Please contact support if you think this is a mistake."
          : "An admin is reviewing your accreditation. You'll be able to use the guide dashboard once you're approved."}
      </Text>

      {!rejected && (
        <View style={styles.action}>
          <PillButton onPress={handleRefresh} disabled={checking}>
            {checking ? "Checking…" : "Check status"}
          </PillButton>
        </View>
      )}

      <Pressable onPress={onSignOut}>
        <Text style={styles.signOut}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  title: {
    color: colors.greenDark,
    fontWeight: "800",
    fontSize: 24,
    marginBottom: 8,
  },
  body: {
    color: colors.grayText,
    fontSize: 14,
    marginBottom: 24,
  },
  action: { marginBottom: 16 },
  signOut: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: colors.grayText,
  },
});