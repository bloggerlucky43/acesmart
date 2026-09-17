export const statusTone = (status) => {
  switch (status) {
    case "resolved":
    case "cleared":
      return { bg: "#ECFDF5", color: "#065F46" };
    case "in_progress":
    case "partial":
      return { bg: "#EEF2FF", color: "#4338CA" };
    case "closed":
      return { bg: "#F1F5F9", color: "#475569" };
    case "absent":
      return { bg: "#FEF2F2", color: "#991B1B" };
    case "late":
      return { bg: "#FEF3C7", color: "#92400E" };
    case "excused":
      return { bg: "#EFF6FF", color: "#1D4ED8" };
    default:
      return { bg: "#FEF3C7", color: "#92400E" };
  }
};
