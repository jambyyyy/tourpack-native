import { useState, useEffect } from "react";
import { View, Text, Pressable, Alert, FlatList, Image, ActivityIndicator } from "react-native";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import type { AppUser, GuideApplicant } from "../../types";
import { PillButton } from "../common/UI";
import styles from "./AdminDashboard.styles";
import { colors } from "../../theme";

interface AdminDashboardProps {
  user: AppUser | null;
  onSignOut: () => void;
}

export default function AdminDashboard({ user, onSignOut }: AdminDashboardProps) {
  const [applicants, setApplicants] = useState<GuideApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadApplicants() {
    setLoading(true);
    try {
      const q = query(
        collection(db, "users"),
        where("role", "==", "guide"),
        where("status", "==", "pending_verification")
      );
      const snapshot = await getDocs(q);
      setApplicants(
        snapshot.docs.map((d) => ({ uid: d.id, ...d.data() }) as GuideApplicant)
      );
    } catch (err) {
      Alert.alert("Error", "Couldn't load guide applications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplicants();
  }, []);

  async function decide(uid: string, status: "verified" | "rejected") {
    setUpdatingId(uid);
    try {
      await updateDoc(doc(db, "users", uid), { status });
      setApplicants((prev) => prev.filter((a) => a.uid !== uid));
    } catch (err) {
      Alert.alert("Error", "Couldn't update this guide's status.");
    } finally {
      setUpdatingId(null);
    }
  }

  function confirmReject(applicant: GuideApplicant) {
    Alert.alert(
      "Reject guide",
      `Reject ${applicant.fullName}'s accreditation?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reject", style: "destructive", onPress: () => decide(applicant.uid, "rejected") },
      ]
    );
  }

  function renderApplicant({ item }: { item: GuideApplicant }) {
    const isUpdating = updatingId === item.uid;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.name}>{item.fullName}</Text>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>Pending</Text>
          </View>
        </View>
        <Text style={styles.meta}>{item.email}</Text>
        {item.contact ? <Text style={styles.meta}>{item.contact}</Text> : null}
        {item.specialty ? <Text style={styles.meta}>{item.specialty}</Text> : null}
        <Text style={[styles.meta, styles.metaLast]}>
          Accreditation #{item.accreditationNumber}
        </Text>

        {item.licenseImageUrl ? (
          <Image source={{ uri: item.licenseImageUrl }} style={styles.licenseImage} />
        ) : (
          <View style={styles.licenseImagePlaceholder}>
            <Text style={styles.licenseImagePlaceholderText}>No license photo</Text>
          </View>
        )}

        <View style={styles.actionRow}>
          <View style={styles.actionBtnWrap}>
            <PillButton onPress={() => decide(item.uid, "verified")} disabled={isUpdating}>
              {isUpdating ? "Saving…" : "Confirm guide"}
            </PillButton>
          </View>
          <View style={styles.actionBtnWrap}>
            <Pressable
              style={styles.rejectBtn}
              onPress={() => confirmReject(item)}
              disabled={isUpdating}
            >
              <Text style={styles.rejectBtnText}>Reject</Text>
            </Pressable>
          </View>
        </View>
      </View>
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
        <Text style={styles.greetingName}>{user?.fullName || "Admin"}</Text>
      </Text>
      <Text style={styles.title}>Guide Verification</Text>
      <Text style={styles.subcap}>
        {applicants.length} guide{applicants.length === 1 ? "" : "s"} waiting on review
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.green} style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={applicants}
          keyExtractor={(item) => item.uid}
          renderItem={renderApplicant}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyState}>No pending guide applications right now.</Text>
          }
        />
      )}
    </View>
  );
}