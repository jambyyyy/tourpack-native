import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import type { AppUser, Booking, BookingStatus } from "../../types";
import { PillButton, ScreenHeader } from "../common/UI";
import { colors } from "../../theme";

interface BookingRequestsProps {
  user: AppUser | null;
  goBack: () => void;
}

const statusStyle: Record<
  BookingStatus,
  { label: string; bg: string; fg: string }
> = {
  pending: { label: "Pending", bg: "#fef3c7", fg: "#92400e" },
  confirmed: { label: "Confirmed", bg: "#d1fae5", fg: "#065f46" },
  declined: { label: "Declined", bg: "#fee2e2", fg: "#991b1b" },
};

export default function BookingRequests({
  user,
  goBack,
}: BookingRequestsProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const q = query(
          collection(db, "bookings"),
          where("guideId", "==", user.uid),
        );
        const snapshot = await getDocs(q);
        const results = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }) as Booking)
          .sort((a, b) => b.createdAt - a.createdAt);
        setBookings(results);
      } catch (err) {
        Alert.alert("Error", "Couldn't load booking requests.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  async function decide(id: string, status: "confirmed" | "declined") {
    setUpdatingId(id);
    try {
      await updateDoc(doc(db, "bookings", id), { status });
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b)),
      );
    } catch (err) {
      Alert.alert("Error", "Couldn't update this booking.");
    } finally {
      setUpdatingId(null);
    }
  }

  function confirmDecline(booking: Booking) {
    Alert.alert(
      "Decline booking",
      `Decline ${booking.touristName || "this tourist"}'s booking?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: () => decide(booking.id, "declined"),
        },
      ],
    );
  }

  function renderBooking({ item }: { item: Booking }) {
    const s = statusStyle[item.status] ?? statusStyle.pending;
    const isUpdating = updatingId === item.id;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.name}>{item.packageName}</Text>
          <View style={[styles.badge, { backgroundColor: s.bg }]}>
            <Text style={[styles.badgeText, { color: s.fg }]}>{s.label}</Text>
          </View>
        </View>
        <Text style={styles.meta}>
          Tourist: {item.touristName || item.touristEmail}
        </Text>
        {item.touristEmail ? (
          <Text style={styles.meta}>{item.touristEmail}</Text>
        ) : null}
        <Text style={styles.meta}>{item.packageDate}</Text>
        <Text style={styles.meta}>
          {item.guests} guest{item.guests === 1 ? "" : "s"} · ₱{item.total}
        </Text>
        {item.notes ? <Text style={styles.notes}>“{item.notes}”</Text> : null}

        {item.status === "pending" && (
          <View style={styles.actionRow}>
            <View style={styles.actionBtnWrap}>
              <PillButton
                onPress={() => decide(item.id, "confirmed")}
                disabled={isUpdating}
              >
                {isUpdating ? "Saving…" : "Confirm"}
              </PillButton>
            </View>
            <View style={styles.actionBtnWrap}>
              <Pressable
                style={styles.declineBtn}
                onPress={() => confirmDecline(item)}
                disabled={isUpdating}
              >
                <Text style={styles.declineText}>Decline</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    );
  }

  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  return (
    <View style={styles.screen}>
      <ScreenHeader label="Booking requests" />
      <Text style={styles.title}>Booking Requests</Text>
      <Text style={styles.subcap}>
        {pendingCount} request{pendingCount === 1 ? "" : "s"} waiting on you
      </Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.green}
          style={{ marginTop: 24 }}
        />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBooking}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.empty}>No booking requests yet.</Text>
          }
        />
      )}

      <Pressable onPress={goBack}>
        <Text style={styles.back}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F4F6F8" },
  title: {
    color: colors.greenDark,
    fontWeight: "800",
    fontSize: 24,
    marginBottom: 2,
  },
  subcap: { fontSize: 12, color: colors.grayText, marginBottom: 20 },
  listContent: { gap: 16, paddingBottom: 8 },
  empty: {
    color: colors.grayTextLight,
    fontSize: 14,
    textAlign: "center",
    marginTop: 32,
  },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 14 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  name: { flex: 1, fontWeight: "700", fontSize: 14, color: colors.darkText },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontWeight: "600", fontSize: 11 },
  meta: { fontSize: 12, color: colors.grayText, marginBottom: 2 },
  notes: {
    fontSize: 12,
    color: colors.grayText,
    fontStyle: "italic",
    marginTop: 6,
  },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  actionBtnWrap: { flex: 1 },
  declineBtn: {
    width: "100%",
    backgroundColor: colors.grayPill,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  declineText: { color: colors.grayText, fontWeight: "600", fontSize: 14 },
  back: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: colors.grayText,
    paddingVertical: 12,
  },
});
