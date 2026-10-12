import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
  type ListRenderItemInfo,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import type { AppUser, TourPackage } from "../../types";
import styles from "./ExplorerDashboard.styles";
import { colors } from "../../theme";

interface ExplorerDashboardProps {
  user: AppUser | null;
  onSignOut: () => void;
  onOpenPackage: (pkg: TourPackage) => void;
}

export default function ExplorerDashboard({ user, onSignOut, onOpenPackage }: ExplorerDashboardProps) {
  const [search, setSearch] = useState("");
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPackages() {
      try {
        const snapshot = await getDocs(collection(db, "packages"));
        const results = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as TourPackage
        );
        setPackages(results);
      } catch (err) {
        setError("Couldn't load packages. Pull down to try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchPackages();
  }, []);

  const filtered = packages.filter((pkg) =>
    (pkg.name || "").toLowerCase().includes(search.toLowerCase())
  );

  function renderPackage({ item }: ListRenderItemInfo<TourPackage>) {
    return (
      <Pressable style={styles.card} onPress={() => onOpenPackage(item)}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.image}>
            <Text style={styles.imageIcon}>📍</Text>
          </View>
        )}
        <View style={styles.body}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>
            Guide: {item.guide} · {item.toursGuided} tours guided
          </Text>
          <Text style={[styles.meta, styles.metaLast]}>
            {item.date} · {item.duration}
          </Text>
          <View style={styles.footer}>
            <Text style={styles.footerText}>{item.pax} pax max</Text>
            <Text style={styles.price}>₱{item.price}/pax</Text>
          </View>
        </View>
      </Pressable>
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
        <Text style={styles.greetingName}>{user?.fullName || "Explorer"}</Text>
      </Text>
      <Text style={styles.title}>TourPack</Text>

      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          placeholder="Search destination and guide"
          placeholderTextColor={colors.grayText}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.green} style={{ marginTop: 32 }} />
      ) : error ? (
        <Text style={styles.emptyState}>{error}</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderPackage}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyState}>
              {packages.length === 0
                ? "No packages yet — add some in Firestore."
                : "No packages match your search."}
            </Text>
          }
        />
      )}
    </View>
  );
}