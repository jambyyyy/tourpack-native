import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
  Modal,
  Animated,
  useWindowDimensions,
  type ListRenderItemInfo,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import type { AppUser, TourPackage } from "../../types";
import styles from "./ExplorerDashboard.styles";
import { colors } from "../../theme";

interface ExplorerDashboardProps {
  user: AppUser | null;
  onSignOut: () => void;
  onOpenPackage: (pkg: TourPackage) => void;
  onOpenBookings: () => void;
}

export default function ExplorerDashboard({
  user,
  onSignOut,
  onOpenPackage,
  onOpenBookings,
}: ExplorerDashboardProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(280, width * 0.75);

  const [search, setSearch] = useState("");
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const slide = useRef(new Animated.Value(-drawerWidth)).current;

  useEffect(() => {
    async function fetchPackages() {
      try {
        const snapshot = await getDocs(collection(db, "packages"));
        const results = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as TourPackage,
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
    (pkg.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  function openMenu() {
    slide.setValue(-drawerWidth);
    setMenuOpen(true);
    Animated.timing(slide, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }

  function closeMenu(after?: () => void) {
    Animated.timing(slide, {
      toValue: -drawerWidth,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setMenuOpen(false);
      if (after) after();
    });
  }

  function renderPackage({ item }: ListRenderItemInfo<TourPackage>) {
    return (
      <Pressable style={styles.card} onPress={() => onOpenPackage(item)}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
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
        <Pressable onPress={openMenu} hitSlop={12}>
          <Text style={styles.menuIcon}>☰</Text>
        </Pressable>
      </View>

      <Modal
        visible={menuOpen}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => closeMenu()}
      >
        <View style={styles.drawerRoot}>
          <Animated.View
            style={[
              styles.drawer,
              {
                width: drawerWidth,
                paddingTop: insets.top + 24,
                paddingBottom: insets.bottom + 24,
                transform: [{ translateX: slide }],
              },
            ]}
          >
            <Text style={styles.drawerTitle}>TourPack</Text>

            <Pressable
              style={styles.drawerItem}
              onPress={() => closeMenu(onOpenBookings)}
            >
              <Text style={styles.drawerItemText}>My bookings</Text>
            </Pressable>

            <View style={styles.drawerSpacer} />

            <Pressable
              style={styles.drawerItem}
              onPress={() => closeMenu(onSignOut)}
            >
              <Text style={styles.drawerItemTextDanger}>Sign out</Text>
            </Pressable>
          </Animated.View>

          <Pressable
            style={styles.drawerBackdrop}
            onPress={() => closeMenu()}
          />
        </View>
      </Modal>

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
        <ActivityIndicator
          size="large"
          color={colors.green}
          style={{ marginTop: 32 }}
        />
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
