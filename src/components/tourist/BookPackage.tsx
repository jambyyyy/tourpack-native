import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import type { AppUser, TourPackage } from "../../types";
import { PillButton, ScreenHeader } from "../common/UI";
import { colors } from "../../theme";

interface BookPackageProps {
  user: AppUser | null;
  pkg: TourPackage;
  goBack: () => void;
  onBooked: () => void;
}

export default function BookPackage({
  user,
  pkg,
  goBack,
  onBooked,
}: BookPackageProps) {
  const [guests, setGuests] = useState(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const maxGuests = pkg.pax > 0 ? pkg.pax : 1;
  const total = pkg.price * guests;

  async function handleBook() {
    if (!user) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "bookings"), {
        packageId: pkg.id,
        packageName: pkg.name,
        packageDate: pkg.date,
        guideId: pkg.guideId,
        guideName: pkg.guide,
        touristId: user.uid,
        touristName: user.fullName,
        touristEmail: user.email,
        guests,
        pricePerPax: pkg.price,
        total,
        notes: notes.trim(),
        status: "pending",
        createdAt: Date.now(),
      });
      Alert.alert(
        "Request sent",
        "Your booking is waiting for the guide to confirm.",
        [{ text: "OK", onPress: onBooked }],
      );
    } catch (err) {
      Alert.alert(
        "Booking failed",
        "Couldn't send your booking request. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader label="Book" />
      <Text style={styles.title}>{pkg.name}</Text>
      <Text style={styles.meta}>
        Guide: {pkg.guide} · {pkg.date} · {pkg.duration}
      </Text>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Price per pax</Text>
        <Text style={styles.rowValue}>₱{pkg.price}</Text>
      </View>

      <Text style={styles.sectionLabel}>Request custom itinerary</Text>
      <TextInput
        style={styles.notes}
        placeholder="Would love a photo spot recommendation along the trail."
        placeholderTextColor={colors.grayText}
        value={notes}
        onChangeText={setNotes}
        multiline
        textAlignVertical="top"
      />

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Number of guests</Text>
        <View style={styles.stepper}>
          <Pressable
            style={styles.stepBtn}
            onPress={() => setGuests((g) => Math.max(1, g - 1))}
          >
            <Text style={styles.stepText}>−</Text>
          </Pressable>
          <Text style={styles.stepCount}>{guests}</Text>
          <Pressable
            style={styles.stepBtn}
            onPress={() => setGuests((g) => Math.min(maxGuests, g + 1))}
          >
            <Text style={styles.stepText}>+</Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.hint}>Maximum {maxGuests} guests</Text>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Estimated total</Text>
        <Text style={styles.totalValue}>₱{total}</Text>
      </View>

      <View style={styles.action}>
        <PillButton onPress={handleBook} disabled={submitting || !user}>
          {submitting ? "Sending…" : "Book"}
        </PillButton>
      </View>

      <Pressable onPress={goBack}>
        <Text style={styles.back}>Back to package</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F4F6F8" },
  content: { paddingBottom: 32 },
  title: {
    color: colors.greenDark,
    fontWeight: "800",
    fontSize: 24,
    marginBottom: 4,
  },
  meta: { fontSize: 12, color: colors.grayText, marginBottom: 20 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayPill,
  },
  rowLabel: { fontSize: 14, fontWeight: "600", color: colors.darkText },
  rowValue: { fontSize: 14, fontWeight: "700", color: colors.darkText },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.darkText,
    marginTop: 16,
    marginBottom: 8,
  },
  notes: {
    backgroundColor: colors.grayPill,
    borderRadius: 12,
    padding: 12,
    minHeight: 90,
    fontSize: 13,
    color: colors.darkText,
    marginBottom: 8,
  },
  stepper: { flexDirection: "row", alignItems: "center", gap: 14 },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.grayPill,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: { fontSize: 18, fontWeight: "700", color: colors.darkText },
  stepCount: { fontSize: 16, fontWeight: "700", color: colors.darkText },
  hint: { fontSize: 11, color: colors.grayText, marginTop: 6 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  totalLabel: { fontSize: 14, fontWeight: "600", color: colors.darkText },
  totalValue: { fontSize: 18, fontWeight: "800", color: colors.greenDark },
  action: { marginTop: 24, marginBottom: 16 },
  back: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: colors.grayText,
  },
});
