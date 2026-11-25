export function reportClassId(value) {
  const id = value && typeof value === "object" ? value.id ?? value._id : value;
  return typeof id === "string" || typeof id === "number" ? String(id).trim() : "";
}

export function reportClassAssignments(response, session, isSchoolAdmin = false) {
  const formClasses = (isSchoolAdmin ? response.data : response.data?.classes) || [];
  const classes = new Map();
  const formClassIds = [];
  for (const classArm of Array.isArray(formClasses) ? formClasses : []) {
    const id = reportClassId(classArm);
    if (!id) continue;
    if (!classes.has(id)) formClassIds.push(id);
    classes.set(id, { ...classArm, id });
  }
  const subjectAssignments = [];
  for (const assignment of isSchoolAdmin ? [] : response.data?.subjectAssignments || []) {
    if (assignment?.session !== session) continue;
    const classArmId = reportClassId(assignment.classArmId) || reportClassId(assignment.ClassArm);
    if (!classArmId || !assignment.Subject?.name) continue;
    const associationId = reportClassId(assignment.ClassArm);
    if (associationId && associationId !== classArmId) continue;
    subjectAssignments.push({ ...assignment, classArmId });
    // Subject associations must not overwrite authoritative class-teacher rows.
    if (!classes.has(classArmId) && associationId) {
      classes.set(classArmId, { ...assignment.ClassArm, id: classArmId });
    }
  }
  const institutionId = reportClassId(response.data?.institutionId);
  const catalog = Array.isArray(response.data?.subjects) ? response.data.subjects : [];
  const formSubjects = !isSchoolAdmin && formClassIds.length ? [...new Set(catalog.filter((subject) =>
    reportClassId(subject) && subject.isActive === true && typeof subject.name === "string" && subject.name.trim() &&
    (subject.isGlobal === true || (institutionId && reportClassId(subject.institutionId) === institutionId)),
  ).map((subject) => subject.name))].sort((a, b) => a.localeCompare(b)) : [];
  return { classes: [...classes.values()], formClassIds: isSchoolAdmin ? [] : formClassIds, subjectAssignments, formSubjects };
}
