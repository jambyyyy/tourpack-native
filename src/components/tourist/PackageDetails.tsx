import { View, Text, ScrollView, Pressable, Image, Alert } from "react-native";
import type { PackageWithItinerary } from "../common/itinerary";
import { PillButton } from "../common/UI";
import styles from "./PackageDetails.styles";

interface PackageDetailsProps {
  pkg: PackageWithItinerary;
  goBack: () => void;
}

export default function PackageDetails({ pkg, goBack }: PackageDetailsProps) {
  const itinerary = pkg.itinerary ?? [];
  const initial = (pkg.guide || "G").charAt(0).toUpperCase();

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Pressable onPress={goBack}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>

        {pkg.imageUrl ? (
          <Image source={{ uri: pkg.imageUrl }} style={styles.hero} resizeMode="cover" />
        ) : (
          <View style={[styles.hero, styles.heroPlaceholder]}>
            <Text style={styles.heroIcon}>📍</Text>
          </View>
        )}

        <Text style={styles.name}>{pkg.name}</Text>
        <Text style={styles.meta}>
          {pkg.date} · {pkg.duration}
        </Text>

        <View style={styles.guideRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View>
            <Text style={styles.guideName}>{pkg.guide}</Text>
            <Text style={styles.guideSub}>{pkg.toursGuided} tours guided</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.slots}>{pkg.pax} slots left</Text>
          <Text style={styles.price}>₱{pkg.price}/pax</Text>
        </View>

        <Text style={styles.sectionLabel}>Itinerary</Text>
        {itinerary.length === 0 ? (
          <Text style={styles.empty}>The guide hasn't added an itinerary yet.</Text>
        ) : (
          <View style={styles.itineraryCard}>
            {itinerary.map((item, i) => (
              <View
                key={i}
                style={[styles.itineraryRow, i === itinerary.length - 1 && styles.lastRow]}
              >
                <Text style={styles.itTime}>{item.time}</Text>
                <Text style={styles.itActivity}>{item.activity}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bookWrap}>
          <PillButton onPress={() => Alert.alert("Coming soon", "Booking isn't built yet.")}>
            Book
          </PillButton>
        </View>
      </ScrollView>
    </View>
  );
}