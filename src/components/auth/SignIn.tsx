import { useState } from "react";
import { View, Text, Pressable, Alert, ScrollView } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import type { FirebaseError } from "firebase/app";
import { auth } from "../../firebaseConfig";
import type { AppUser, Role } from "../../types";
import { PillInput, PillButton, ScreenHeader } from "../common/UI";
import styles from "./SignIn.styles";

interface SignInProps {
  onSignIn: (info: AppUser) => void;
  goToSignUp: () => void;
  goToAdminSignIn: () => void;
}

export default function SignIn({ onSignIn, goToSignUp, goToAdminSignIn }: SignInProps) {
  const [role, setRole] = useState<Role>("guide");
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
      onSignIn({
        uid: result.user.uid,
        email: result.user.email,
        fullName: result.user.displayName,
        role,
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
      <ScreenHeader label="Sign in" />
      <Text style={styles.title}>TourPack</Text>

      <View style={styles.roleToggle}>
        <Pressable
          style={[styles.roleToggleBtn, role === "guide" && styles.roleToggleBtnActive]}
          onPress={() => setRole("guide")}
        >
          <Text style={[styles.roleToggleText, role === "guide" && styles.roleToggleTextActive]}>
            Guide
          </Text>
        </Pressable>
        <Pressable
          style={[styles.roleToggleBtn, role === "tourist" && styles.roleToggleBtnActive]}
          onPress={() => setRole("tourist")}
        >
          <Text style={[styles.roleToggleText, role === "tourist" && styles.roleToggleTextActive]}>
            Tourist
          </Text>
        </Pressable>
      </View>

      <View style={styles.form}>
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
        <View style={styles.submitWrap}>
          <PillButton onPress={handleSubmit} disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </PillButton>
        </View>
      </View>

      <Text style={styles.footer}>
        Don't have an account yet?{" "}
        <Text style={styles.link} onPress={goToSignUp}>
          Sign up
        </Text>
      </Text>

      <Text style={styles.footer}>
        <Text style={styles.link} onPress={goToAdminSignIn}>
          Sign in as admin
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