import { StyleSheet } from "react-native";
import { colors } from "../../theme";

export default StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F4F6F8" },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  menuIcon: { fontSize: 18, color: colors.grayText },
  signOut: { fontSize: 12, fontWeight: "600", color: colors.grayText },
  greeting: { fontSize: 14, marginBottom: 4 },
  greetingHello: { color: colors.greenDark, fontWeight: "600" },
  greetingName: { color: colors.darkText, fontWeight: "700" },
  title: {
    color: colors.greenDark,
    fontWeight: "800",
    fontSize: 24,
    marginBottom: 2,
  },
  subcap: {
    fontSize: 12,
    color: colors.grayText,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.grayText,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  rowLocked: {
    opacity: 0.55,
  },
  rowLabel: { fontSize: 13, fontWeight: "600", color: colors.darkText },
  rowLabelLocked: { color: colors.grayText },
  rowArrow: { fontSize: 14, color: colors.grayText },
  statusBanner: {
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  statusBannerText: {
    fontSize: 12,
    color: "#92400e",
    lineHeight: 17,
  },
  statusBannerRejected: {
    backgroundColor: "#fee2e2",
  },
  statusBannerTextRejected: {
    color: "#991b1b",
  },
});