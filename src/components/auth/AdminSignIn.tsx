import { useState } from "react";
import { View, Text, Alert, ScrollView } from "react-native";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import type { FirebaseError } from "firebase/app";
import { auth, db } from "../../firebaseConfig";
import type { AppUser } from "../../types";
import { PillInput, PillButton, ScreenHeader } from "../common/UI";
import styles from "./SignIn.styles";

interface AdminSignInProps {
  onSignIn: (info: AppUser) => void;
  goBack: () => void;
}

export default function AdminSignIn({ onSignIn, goBack }: AdminSignInProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!email || !password) {
      Alert.alert("Missing info", "Please enter your email and password.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, "users", result.user.uid));
      const isAdmin = snap.exists() && snap.data().role === "admin";

      if (!isAdmin) {
        await signOut(auth);
        Alert.alert("Access denied", "This account is not an admin account.");
        return;
      }

      onSignIn({
        uid: result.user.uid,
        email: result.user.email,
        fullName: result.user.displayName,
        role: "admin",
      });
    } catch (error) {
      Alert.alert("Sign in failed", firebaseErrorMessage(error));
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
      <ScreenHeader label="Admin sign in" />
      <Text style={styles.title}>TourPack Admin</Text>

      <View style={styles.form}>
        <PillInput
          placeholder="Admin email"
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
        <View style={styles.submitWrap}>
          <PillButton onPress={handleSubmit} disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in as admin"}
          </PillButton>
        </View>
      </View>

      <Text style={styles.footer}>
        <Text style={styles.link} onPress={goBack}>
          Back to guide / tourist sign in
        </Text>
      </Text>
    </ScrollView>
  );
}

function firebaseErrorMessage(error: unknown): string {
  const e = error as FirebaseError;
  switch (e.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/too-many-requests":
      return "Too many attempts — try again in a bit.";
    default:
      return e.message;
  }
}