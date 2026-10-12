import { useState } from "react";
import { View, Text, Pressable, Alert, ScrollView, Image } from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import type { FirebaseError } from "firebase/app";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { auth, db } from "../../firebaseConfig";
import type { AppUser, Role } from "../../types";
import { PillInput, PillButton, ScreenHeader } from "../common/UI";
import styles from "./SignUp.styles";

const MAX_IMAGE_CHARS = 700_000;

interface SignUpProps {
  onSignUp: (user: AppUser) => void;
  goToSignIn: () => void;
}

export default function SignUp({ onSignUp, goToSignIn }: SignUpProps) {
  const [role, setRole] = useState<Role>("tourist");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact, setContact] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [accreditationNumber, setAccreditationNumber] = useState("");
  const [licenseImageUri, setLicenseImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isGuide = role === "guide";

  async function pickLicenseImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow photo access to add your guide license.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.6,
      allowsEditing: true,
    });
    if (!result.canceled) {
      setLicenseImageUri(result.assets[0].uri);
    }
  }

  async function imageToDataUri(uri: string) {
    const context = ImageManipulator.manipulate(uri);
    context.resize({ width: 1000 });
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

  async function handleSubmit() {
    if (!fullName || !email || !password || !contact) {
      Alert.alert("Missing info", "Please fill out all fields.");
      return;
    }
    if (isGuide && !specialty) {
      Alert.alert("Missing info", "Please enter your tour specialty.");
      return;
    }
    if (isGuide && !accreditationNumber) {
      Alert.alert("Accreditation required", "Please enter your accreditation number.");
      return;
    }
    if (isGuide && !licenseImageUri) {
      Alert.alert("Accreditation required", "Please add a photo of your guide license.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      let licenseImageUrl: string | undefined;
      if (isGuide && licenseImageUri) {
        licenseImageUrl = await imageToDataUri(licenseImageUri);
      }

      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: fullName });
      await setDoc(doc(db, "users", result.user.uid), {
        fullName,
        email,
        contact,
        role,
        ...(isGuide && {
          specialty,
          accreditationNumber,
          licenseImageUrl,
          status: "pending_verification",
        }),
        createdAt: new Date().toISOString(),
      });
      onSignUp({
        uid: result.user.uid,
        fullName,
        email,
        role,
        ...(isGuide && { status: "pending_verification" }),
      });
    } catch (error) {
      Alert.alert("Sign up failed", firebaseErrorMessage(error));
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
      <ScreenHeader label="Sign up" />
      <Text style={styles.title}>TourPack</Text>

      <View style={styles.roleToggle}>
        <Pressable
          style={[styles.roleToggleBtn, role === "tourist" && styles.roleToggleBtnActive]}
          onPress={() => setRole("tourist")}
        >
          <Text style={[styles.roleToggleText, role === "tourist" && styles.roleToggleTextActive]}>
            Tourist
          </Text>
        </Pressable>
        <Pressable
          style={[styles.roleToggleBtn, role === "guide" && styles.roleToggleBtnActive]}
          onPress={() => setRole("guide")}
        >
          <Text style={[styles.roleToggleText, role === "guide" && styles.roleToggleTextActive]}>
            Guide
          </Text>
        </Pressable>
      </View>

      <View style={styles.form}>
        <PillInput placeholder="Full Name" value={fullName} onChangeText={setFullName} />
        <PillInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <PillInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <PillInput
          placeholder="Contact Number"
          value={contact}
          onChangeText={setContact}
          keyboardType="phone-pad"
        />

        {isGuide && (
          <>
            <PillInput
              placeholder="Tour Specialty (e.g. Canyoneering, Heritage Walks)"
              value={specialty}
              onChangeText={setSpecialty}
            />
            <Text style={styles.accreditationNote}>
              Guides need a valid tourism accreditation to register. This will be verified before your account is approved.
            </Text>
            <PillInput
              placeholder="Accreditation Number"
              value={accreditationNumber}
              onChangeText={setAccreditationNumber}
              autoCapitalize="characters"
            />
            <Pressable style={styles.licensePicker} onPress={pickLicenseImage}>
              {licenseImageUri ? (
                <Image source={{ uri: licenseImageUri }} style={styles.licensePreview} />
              ) : (
                <Text style={styles.licensePickerText}>📄 Add photo of guide license</Text>
              )}
            </Pressable>
          </>
        )}

        <View style={styles.submitWrap}>
          <PillButton onPress={handleSubmit} disabled={submitting}>
            {submitting ? "Creating account…" : isGuide ? "Submit for verification" : "Create account"}
          </PillButton>
        </View>
      </View>

      <Text style={styles.footer}>
        Already had an account?{" "}
        <Text style={styles.link} onPress={goToSignIn}>
          Sign in
        </Text>
      </Text>
    </ScrollView>
  );
}

function firebaseErrorMessage(error: unknown): string {
  const e = error as FirebaseError;
  switch (e.code) {
    case "auth/email-already-in-use":
      return "That email is already registered — try signing in instead.";
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    default:
      return e.message;
  }
}