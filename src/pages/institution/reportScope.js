export function academicSessionOptions(currentSession, selectedSession) {
  const sessions = new Set([currentSession, selectedSession].filter(Boolean));
  const match = String(currentSession || "").match(/^(\d{4})\/(\d{4})$/);
  const year = match ? Number(match[1]) : new Date().getFullYear();
  for (let start = year - 4; start <= year + 2; start += 1) {
    sessions.add(`${start}/${start + 1}`);
  }
  return [...sessions].sort().reverse();
}

export function defaultAcademicSession() {
  const year = new Date().getFullYear();
  return `${year}/${year + 1}`;
}

export function displayScore(value, suffix = "") {
  return value == null ? "-" : `${value}${suffix}`;
}

export function annualRowComplete(row) {
  return row.annualComplete === true;
}

export function savedPromotionEligible(row) {
  return annualRowComplete(row) && row.hasSavedPromotion === true && !row.isRolledOver &&
    ["promoted", "promoted_on_trial"].includes(row.promotionStatus);
}

export function scoreRowEditable(row) {
  return row.canEditScores !== false;
}

export function promotionLabel(row, annual) {
  if (!annual) return "-";
  if (!annualRowComplete(row)) return "INCOMPLETE";
  return row.promotionStatus ? row.promotionStatus.replace(/_/g, " ").toUpperCase() : "-";
}

export function assignedSubjectNames(assignments, classId, session) {
  return [...new Set(assignments.filter((assignment) =>
    String(assignment.classArmId) === String(classId) &&
    (!assignment.session || assignment.session === session),
  ).map((assignment) => assignment.Subject?.name).filter(Boolean))];
}
