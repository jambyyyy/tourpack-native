import { View, Text, Pressable, Alert } from "react-native";
import type { AppUser } from "../../types";
import styles from "./GuideDashboard.styles";

interface GuideDashboardProps {
  user: AppUser | null;
  onSignOut: () => void;
  onOpenPackages: () => void;
  onOpenBookings: () => void;
}

export default function GuideDashboard({
  user,
  onSignOut,
  onOpenPackages,
  onOpenBookings,
}: GuideDashboardProps) {
  function comingSoon() {
    Alert.alert("Coming soon", "This section isn't built yet.");
  }

  const status = user?.status;
  const isPending = status === "pending_verification";
  const isRejected = status === "rejected";
  const isLocked = isPending || isRejected;

  function lockedTap() {
    Alert.alert(
      isRejected ? "Accreditation not approved" : "Pending verification",
      isRejected
        ? "Your guide accreditation wasn't approved. Contact support if you think this is a mistake."
        : "Your account is still waiting on accreditation review. This usually doesn't take long — check back soon.",
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.menuRow}>
        <Text style={styles.menuIcon}>☰</Text>
        <Pressable onPress={onSignOut}>
          <Text style={styles.signOut}>Sign out</Text>
        </Pressable>
      </View>

      <Text style={styles.greeting}>
        <Text style={styles.greetingHello}>Hello, </Text>
        <Text style={styles.greetingName}>{user?.fullName || "Guide"}</Text>
      </Text>
      <Text style={styles.title}>TourPack</Text>
      <Text style={styles.subcap}>Guide Dashboard</Text>

      {isPending && (
        <View style={styles.statusBanner}>
          <Text style={styles.statusBannerText}>
            ⏳ Your accreditation is pending review. You'll be able to list
            packages once an admin confirms it.
          </Text>
        </View>
      )}
      {isRejected && (
        <View style={[styles.statusBanner, styles.statusBannerRejected]}>
          <Text
            style={[styles.statusBannerText, styles.statusBannerTextRejected]}
          >
            ⚠ Your guide accreditation wasn't approved. Contact support for
            details.
          </Text>
        </View>
      )}

      <Text style={styles.sectionLabel}>Manage</Text>
      <Pressable
        style={[styles.row, isLocked && styles.rowLocked]}
        onPress={isLocked ? lockedTap : onOpenPackages}
      >
        <Text style={[styles.rowLabel, isLocked && styles.rowLabelLocked]}>
          My Packages
        </Text>
        <Text style={styles.rowArrow}>{isLocked ? "🔒" : "→"}</Text>
      </Pressable>
      <Pressable
        style={[styles.row, isLocked && styles.rowLocked]}
        onPress={isLocked ? lockedTap : onOpenBookings}
      >
        <Text style={[styles.rowLabel, isLocked && styles.rowLabelLocked]}>
          Booking Requests
        </Text>
        <Text style={styles.rowArrow}>{isLocked ? "🔒" : "→"}</Text>
      </Pressable>
      <Pressable
        style={[styles.row, isLocked && styles.rowLocked]}
        onPress={isLocked ? lockedTap : comingSoon}
      >
        <Text style={[styles.rowLabel, isLocked && styles.rowLabelLocked]}>
          Earnings
        </Text>
        <Text style={styles.rowArrow}>{isLocked ? "🔒" : "→"}</Text>
      </Pressable>
    </View>
  );
}
