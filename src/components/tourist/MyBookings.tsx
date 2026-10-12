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
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import type { AppUser, Booking, BookingStatus } from "../../types";
import { ScreenHeader } from "../common/UI";
import { colors } from "../../theme";

interface MyBookingsProps {
  user: AppUser | null;
  goBack: () => void;
}

const statusStyle: Record<
  BookingStatus,
  { label: string; bg: string; fg: string }
> = {
  pending: { label: "Waiting for guide", bg: "#fef3c7", fg: "#92400e" },
  confirmed: { label: "Confirmed", bg: "#d1fae5", fg: "#065f46" },
  declined: { label: "Declined", bg: "#fee2e2", fg: "#991b1b" },
};

export default function MyBookings({ user, goBack }: MyBookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const q = query(
          collection(db, "bookings"),
          where("touristId", "==", user.uid),
        );
        const snapshot = await getDocs(q);
        const results = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }) as Booking)
          .sort((a, b) => b.createdAt - a.createdAt);
        setBookings(results);
      } catch (err) {
        Alert.alert("Error", "Couldn't load your bookings.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  function renderBooking({ item }: { item: Booking }) {
    const s = statusStyle[item.status] ?? statusStyle.pending;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.name}>{item.packageName}</Text>
          <View style={[styles.badge, { backgroundColor: s.bg }]}>
            <Text style={[styles.badgeText, { color: s.fg }]}>{s.label}</Text>
          </View>
        </View>
        <Text style={styles.meta}>Guide: {item.guideName}</Text>
        <Text style={styles.meta}>{item.packageDate}</Text>
        <Text style={styles.meta}>
          {item.guests} guest{item.guests === 1 ? "" : "s"} · ₱{item.total}
        </Text>
        {item.notes ? <Text style={styles.notes}>“{item.notes}”</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader label="My bookings" />
      <Text style={styles.title}>My Bookings</Text>

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
            <Text style={styles.empty}>You haven't booked anything yet.</Text>
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
    marginBottom: 16,
  },
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
  back: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: colors.grayText,
    paddingVertical: 12,
  },
});
