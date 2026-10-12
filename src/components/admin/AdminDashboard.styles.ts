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
  listContent: { gap: 16, paddingBottom: 8 },
  emptyState: {
    color: colors.grayTextLight,
    fontSize: 14,
    textAlign: "center",
    marginTop: 32,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: { fontWeight: "700", fontSize: 14, color: colors.darkText },
  pendingBadge: {
    backgroundColor: "#fef3c7",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  pendingBadgeText: {
    color: "#92400e",
    fontWeight: "600",
    fontSize: 11,
  },
  meta: { fontSize: 12, color: colors.grayText, marginBottom: 2 },
  metaLast: { marginBottom: 10 },
  licenseImage: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    marginBottom: 12,
  },
  licenseImagePlaceholder: {
    width: "100%",
    height: 100,
    borderRadius: 12,
    backgroundColor: colors.grayPill,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  licenseImagePlaceholderText: {
    fontSize: 12,
    color: colors.grayText,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtnWrap: { flex: 1 },
  rejectBtn: {
    width: "100%",
    backgroundColor: colors.grayPill,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  rejectBtnText: {
    color: colors.grayText,
    fontWeight: "600",
    fontSize: 14,
  },
});