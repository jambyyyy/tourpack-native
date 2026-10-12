import { StyleSheet } from "react-native";
import { colors } from "../../theme";

export default StyleSheet.create({
  pillInput: {
    width: "100%",
    backgroundColor: colors.grayPill,
    color: "#374151",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 14,
  },
  pillButton: {
    width: "100%",
    backgroundColor: colors.green,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  pillButtonDisabled: {
    opacity: 0.6,
  },
  pillButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  screenHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  screenHeaderLabel: {
    color: colors.grayTextLight,
    fontSize: 14,
  },
  screenHeaderIcon: {
    color: "#d1d5db",
    fontSize: 16,
  },
});
