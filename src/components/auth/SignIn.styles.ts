import { StyleSheet } from "react-native";
import { colors } from "../../theme";

export default StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingBottom: 32 },
  title: {
    color: colors.greenDark,
    fontWeight: "800",
    fontSize: 30,
    marginBottom: 32,
  },
  roleToggle: {
    flexDirection: "row",
    backgroundColor: colors.grayPill,
    borderRadius: 999,
    padding: 4,
    marginBottom: 24,
  },
  roleToggleBtn: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: "center",
  },
  roleToggleBtnActive: {
    backgroundColor: colors.green,
  },
  roleToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.grayText,
  },
  roleToggleTextActive: {
    color: "#fff",
  },
  form: { gap: 12 },
  submitWrap: { marginTop: 16 },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: colors.grayText,
    marginTop: 16,
  },
  link: {
    color: colors.greenDark,
    fontWeight: "600",
  },
});