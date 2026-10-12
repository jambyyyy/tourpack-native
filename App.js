import { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./src/firebaseConfig";
import SignUp from "./src/components/auth/SignUp";
import SignIn from "./src/components/auth/SignIn";
import AdminSignIn from "./src/components/auth/AdminSignIn";
import PendingApproval from "./src/components/auth/PendingApproval";
import ExplorerDashboard from "./src/components/tourist/ExplorerDashboard";
import GuideDashboard from "./src/components/guide/GuideDashboard";
import MyPackages from "./src/components/guide/MyPackages";
import PackageDetails from "./src/components/tourist/PackageDetails";
import AdminDashboard from "./src/components/admin/AdminDashboard";
import styles from "./App.styles";
import { colors } from "./src/theme";

const bg = { backgroundColor: "#F4F6F8" };

const authScreens = ["signup", "signin", "adminSignin"];

async function loadProfile(uid) {
  let role = "tourist";
  let status;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      const data = snap.data();
      role = data.role || "tourist";
      status = data.status;
    }
  } catch (e) {}
  return { role, status };
}

function screenFor(role, status) {
  if (role === "admin") return "adminDashboard";
  if (role === "guide") {
    return status === "verified" ? "guideDashboard" : "pendingApproval";
  }
  return "dashboard";
}

function AppContent() {
  const [screen, setScreen] = useState("signup");
  const [user, setUser] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const { role, status } = await loadProfile(firebaseUser.uid);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: firebaseUser.displayName,
          role,
          status,
        });
        setScreen(screenFor(role, status));
      } else {
        setUser(null);
        setScreen((prev) => (authScreens.includes(prev) ? prev : "signin"));
      }
      setCheckingAuth(false);
    });
    return unsubscribe;
  }, []);

  function handleSignUp(newUser) {
    setUser(newUser);
    setScreen(newUser.role === "guide" ? screenFor("guide", newUser.status) : "signin");
  }

  async function handleSignIn(loginInfo) {
    const { role, status } = await loadProfile(loginInfo.uid);
    setUser((prev) => ({ ...prev, ...loginInfo, role, status }));
    setScreen(screenFor(role, status));
  }

  async function refreshStatus() {
    if (!user) return;
    const { role, status } = await loadProfile(user.uid);
    setUser((prev) => ({ ...prev, role, status }));
    setScreen(screenFor(role, status));
  }

  async function handleSignOut() {
    await signOut(auth);
    setUser(null);
    setScreen("signin");
  }

  if (checkingAuth) {
    return (
      <View style={[styles.root, bg]}>
        <SafeAreaView style={[styles.safe, bg, { alignItems: "center", justifyContent: "center" }]}>
          <ActivityIndicator size="large" color={colors.green} />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.root, bg]}>
      <SafeAreaView style={[styles.safe, bg]}>
        <StatusBar style="dark" />
        <View style={[styles.card, bg]}>
          {screen === "signup" && (
            <SignUp onSignUp={handleSignUp} goToSignIn={() => setScreen("signin")} />
          )}
          {screen === "signin" && (
            <SignIn
              onSignIn={handleSignIn}
              goToSignUp={() => setScreen("signup")}
              goToAdminSignIn={() => setScreen("adminSignin")}
            />
          )}
          {screen === "adminSignin" && (
            <AdminSignIn onSignIn={handleSignIn} goBack={() => setScreen("signin")} />
          )}
          {screen === "pendingApproval" && user?.role === "guide" && (
            <PendingApproval
              status={user.status}
              onRefresh={refreshStatus}
              onSignOut={handleSignOut}
            />
          )}
          {screen === "dashboard" && (
            <ExplorerDashboard
              user={user}
              onSignOut={handleSignOut}
              onOpenPackage={(pkg) => {
                setSelectedPackage(pkg);
                setScreen("packageDetails");
              }}
            />
          )}
          {screen === "packageDetails" && selectedPackage && (
            <PackageDetails pkg={selectedPackage} goBack={() => setScreen("dashboard")} />
          )}
          {screen === "guideDashboard" && user?.status === "verified" && (
            <GuideDashboard
              user={user}
              onSignOut={handleSignOut}
              onOpenPackages={() => setScreen("myPackages")}
            />
          )}
          {screen === "myPackages" && user?.status === "verified" && (
            <MyPackages user={user} goBack={() => setScreen("guideDashboard")} />
          )}
          {screen === "adminDashboard" && user?.role === "admin" && (
            <AdminDashboard user={user} onSignOut={handleSignOut} />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}