import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import DateTimePicker from "@react-native-community/datetimepicker";
import { db } from "../../firebaseConfig";
import type { AppUser } from "../../types";
import type { ItineraryItem, PackageWithItinerary } from "../common/itinerary";
import { PillInput, PillButton } from "../common/UI";
import styles from "./MyPackages.styles";
import { colors } from "../../theme";

// Keep well under Firestore's 1 MB document limit.
const MAX_IMAGE_CHARS = 700_000;

interface MyPackagesProps {
  user: AppUser;
  goBack: () => void;
}

export default function MyPackages({ user, goBack }: MyPackagesProps) {
  const [packages, setPackages] = useState<PackageWithItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [duration, setDuration] = useState("");
  const [pax, setPax] = useState("");
  const [price, setPrice] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageChanged, setImageChanged] = useState(false);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  async function loadPackages() {
    setLoading(true);
    try {
      const q = query(collection(db, "packages"), where("guideId", "==", user.uid));
      const snapshot = await getDocs(q);
      setPackages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as PackageWithItinerary));
    } catch (err) {
      Alert.alert("Error", "Couldn't load your packages.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPackages();
  }, []);

  function resetForm() {
    setName("");
    setDate(new Date());
    setDuration("");
    setPax("");
    setPrice("");
    setImageUri(null);
    setImageChanged(false);
    setItinerary([]);
    setEditingId(null);
  }

  function closeForm() {
    resetForm();
    setShowForm(false);
  }

  function startEdit(item: PackageWithItinerary) {
    setEditingId(item.id);
    setName(item.name || "");
    const parsed = new Date(item.date);
    setDate(isNaN(parsed.getTime()) ? new Date() : parsed);
    setDuration(item.duration || "");
    setPax(String(item.pax ?? ""));
    setPrice(String(item.price ?? ""));
    setImageUri(item.imageUrl || null);
    setImageChanged(false);
    setItinerary(item.itinerary ?? []);
    setShowForm(true);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  function addItineraryRow() {
    setItinerary((rows) => [...rows, { time: "", activity: "" }]);
  }

  function updateItinerary(index: number, field: keyof ItineraryItem, value: string) {
    setItinerary((rows) => rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  function removeItinerary(index: number) {
    setItinerary((rows) => rows.filter((_, i) => i !== index));
  }

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow photo access to add a cover image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.6,
      aspect: [16, 9],
      allowsEditing: true,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setImageChanged(true);
    }
  }

  function onDateChange(selectedDate: Date) {
    setDate(selectedDate);
    if (Platform.OS !== "ios") setShowDatePicker(false);
  }

  function formattedDate() {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  async function imageToDataUri(uri: string) {
    const context = ImageManipulator.manipulate(uri);
    context.resize({ width: 800 });
    const rendered = await context.renderAsync();
    const result = await rendered.saveAsync({
      format: SaveFormat.JPEG,
      compress: 0.5,
      base64: true,
    });
    if (!result.base64) throw new Error("Couldn't process the image.");
    if (result.base64.length > MAX_IMAGE_CHARS) {
      throw new Error("That photo is too large. Please pick a smaller one.");
    }
    return `data:image/jpeg;base64,${result.base64}`;
  }

  async function handleSavePackage() {
    if (!name || !duration || !pax || !price) {
      Alert.alert("Missing info", "Please fill out all fields.");
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl: string | null = imageUri;
      if (imageUri && imageChanged) {
        imageUrl = await imageToDataUri(imageUri);
      }
      const cleanItinerary = itinerary
        .map((r) => ({ time: r.time.trim(), activity: r.activity.trim() }))
        .filter((r) => r.time || r.activity);

      const fields = {
        name,
        date: formattedDate(),
        duration,
        pax: Number(pax),
        price: Number(price),
        imageUrl,
        itinerary: cleanItinerary,
      };

      if (editingId) {
        await updateDoc(doc(db, "packages", editingId), fields);
      } else {
        await addDoc(collection(db, "packages"), {
          ...fields,
          guide: user.fullName,
          guideId: user.uid,
          toursGuided: 0,
        });
      }
      const wasEditing = !!editingId;
      closeForm();
      await loadPackages();
      Alert.alert(
        wasEditing ? "Saved" : "Added",
        wasEditing ? "Your package was updated." : "Your package is now live on the tourist dashboard."
      );
    } catch (err) {
      console.error("Save package failed:", err);
      const code = (err as { code?: string }).code ?? "unknown";
      const message = err instanceof Error ? err.message : String(err);
      Alert.alert("Couldn't save the package", `${code}\n${message}`);
    } finally {
      setSubmitting(false);
    }
  }

  function renderPackage(item: PackageWithItinerary) {
    return (
      <Pressable key={item.id} style={styles.card} onPress={() => startEdit(item)}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Text style={styles.cardImagePlaceholderIcon}>📍</Text>
          </View>
        )}
        <View style={styles.cardBody}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>
            {item.date} · {item.duration}
          </Text>
          <View style={styles.footer}>
            <Text style={styles.footerText}>{item.pax} pax max</Text>
            <Text style={styles.price}>₱{item.price}/pax</Text>
          </View>
          <Text style={styles.manageHint}>
            {item.itinerary?.length ?? 0} itinerary stops · Tap to manage
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={goBack}>
            <Text style={styles.back}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>My Packages</Text>
          <Pressable onPress={() => (showForm ? closeForm() : setShowForm(true))}>
            <Text style={styles.addToggle}>{showForm ? "Cancel" : "+ Add"}</Text>
          </Pressable>
        </View>

        {showForm && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>{editingId ? "Edit Package" : "New Package"}</Text>
            <Pressable style={styles.imagePicker} onPress={pickImage}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              ) : (
                <Text style={styles.imagePickerText}>📷 Add cover photo</Text>
              )}
            </Pressable>

            <PillInput placeholder="Package Name" value={name} onChangeText={setName} />

            <Pressable style={styles.dateField} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateFieldText}>{formattedDate()}</Text>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                minimumDate={new Date()}
                onValueChange={(_event, selectedDate) => onDateChange(selectedDate)}
                onDismiss={() => setShowDatePicker(false)}
              />
            )}

            <PillInput
              placeholder="Duration (e.g. Full day)"
              value={duration}
              onChangeText={setDuration}
            />
            <PillInput
              placeholder="Max Pax"
              value={pax}
              onChangeText={setPax}
              keyboardType="numeric"
            />
            <PillInput
              placeholder="Price per pax"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            <Text style={styles.sectionLabel}>Itinerary</Text>
            {itinerary.map((row, index) => (
              <View key={index} style={styles.itineraryRow}>
                <View style={styles.itineraryTime}>
                  <PillInput
                    placeholder="5:00 AM"
                    value={row.time}
                    onChangeText={(v: string) => updateItinerary(index, "time", v)}
                  />
                </View>
                <View style={styles.itineraryActivity}>
                  <PillInput
                    placeholder="Activity"
                    value={row.activity}
                    onChangeText={(v: string) => updateItinerary(index, "activity", v)}
                  />
                </View>
                <Pressable onPress={() => removeItinerary(index)} hitSlop={8}>
                  <Text style={styles.removeText}>✕</Text>
                </Pressable>
              </View>
            ))}
            <Pressable style={styles.addItineraryBtn} onPress={addItineraryRow}>
              <Text style={styles.addItineraryText}>+ Add Itinerary</Text>
            </Pressable>

            <View style={styles.submitWrap}>
              <PillButton onPress={handleSavePackage} disabled={submitting}>
                {submitting ? "Saving…" : editingId ? "Save" : "Add Package"}
              </PillButton>
            </View>
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" color={colors.green} style={{ marginTop: 24 }} />
        ) : packages.length === 0 ? (
          <Text style={styles.emptyState}>
            You haven't added any packages yet — tap "+ Add" to create one.
          </Text>
        ) : (
          <View style={styles.listContent}>{packages.map(renderPackage)}</View>
        )}
      </ScrollView>
    </View>
  );
}