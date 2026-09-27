/**
 * Comprehensive Nigerian Curriculum Master Subjects Catalog
 * Covers WAEC, NECO, JAMB, BECE, National Primary, and Trade/Vocational Subjects
 */

export const SUBJECT_CATEGORIES = [
  "All",
  "Sciences",
  "Commercial",
  "Arts & Humanities",
  "Junior Secondary (BECE)",
  "Primary Education",
  "Trade & Vocational",
  "Nigerian Languages",
];

export const MASTER_NIGERIAN_SUBJECTS = [
  // Core General (Senior Secondary)
  { name: "English Language", category: "Core General", level: "Senior Secondary", code: "ENG" },
  { name: "Mathematics", category: "Sciences", level: "Senior Secondary", code: "MTH" },
  { name: "Civic Education", category: "Core General", level: "Senior Secondary", code: "CIV" },
  { name: "Computer Studies", category: "Sciences", level: "Senior Secondary", code: "CSC" },
  { name: "Data Processing", category: "Trade & Vocational", level: "Senior Secondary", code: "DPR" },

  // Sciences (Senior Secondary - WAEC/NECO/JAMB)
  { name: "Physics", category: "Sciences", level: "Senior Secondary", code: "PHY" },
  { name: "Chemistry", category: "Sciences", level: "Senior Secondary", code: "CHM" },
  { name: "Biology", category: "Sciences", level: "Senior Secondary", code: "BIO" },
  { name: "Further Mathematics", category: "Sciences", level: "Senior Secondary", code: "FMTH" },
  { name: "Agricultural Science", category: "Sciences", level: "Senior Secondary", code: "AGR" },
  { name: "Physical Education", category: "Sciences", level: "Senior Secondary", code: "PHE" },
  { name: "Health Science", category: "Sciences", level: "Senior Secondary", code: "HSC" },
  { name: "Technical Drawing", category: "Trade & Vocational", level: "Senior Secondary", code: "TDR" },

  // Commercial / Business (Senior Secondary)
  { name: "Economics", category: "Commercial", level: "Senior Secondary", code: "ECO" },
  { name: "Financial Accounting", category: "Commercial", level: "Senior Secondary", code: "ACC" },
  { name: "Commerce", category: "Commercial", level: "Senior Secondary", code: "COM" },
  { name: "Book Keeping", category: "Commercial", level: "Senior Secondary", code: "BKP" },
  { name: "Marketing", category: "Commercial", level: "Senior Secondary", code: "MKT" },
  { name: "Office Practice", category: "Commercial", level: "Senior Secondary", code: "OFP" },
  { name: "Store Management", category: "Commercial", level: "Senior Secondary", code: "STM" },
  { name: "Insurance", category: "Commercial", level: "Senior Secondary", code: "INS" },

  // Arts & Humanities (Senior Secondary)
  { name: "Literature in English", category: "Arts & Humanities", level: "Senior Secondary", code: "LIT" },
  { name: "Government", category: "Arts & Humanities", level: "Senior Secondary", code: "GOV" },
  { name: "Christian Religious Studies (CRS)", category: "Arts & Humanities", level: "Senior Secondary", code: "CRS" },
  { name: "Islamic Religious Studies (IRS)", category: "Arts & Humanities", level: "Senior Secondary", code: "IRS" },
  { name: "Geography", category: "Arts & Humanities", level: "Senior Secondary", code: "GEO" },
  { name: "History", category: "Arts & Humanities", level: "Senior Secondary", code: "HIS" },
  { name: "Visual Arts", category: "Arts & Humanities", level: "Senior Secondary", code: "ART" },
  { name: "Music", category: "Arts & Humanities", level: "Senior Secondary", code: "MUS" },
  { name: "French", category: "Arts & Humanities", level: "Senior Secondary", code: "FRE" },
  { name: "Arabic", category: "Arts & Humanities", level: "Senior Secondary", code: "ARB" },

  // Nigerian Indigenous Languages
  { name: "Yoruba Language", category: "Nigerian Languages", level: "Senior Secondary", code: "YOR" },
  { name: "Igbo Language", category: "Nigerian Languages", level: "Senior Secondary", code: "IGB" },
  { name: "Hausa Language", category: "Nigerian Languages", level: "Senior Secondary", code: "HAU" },

  // Trade & Vocational (WAEC / NECO National Curriculum)
  { name: "Catering Craft Practice", category: "Trade & Vocational", level: "Senior Secondary", code: "CCP" },
  { name: "Food & Nutrition", category: "Trade & Vocational", level: "Senior Secondary", code: "FDN" },
  { name: "Clothing & Textiles", category: "Trade & Vocational", level: "Senior Secondary", code: "CLT" },
  { name: "Dyeing & Bleaching", category: "Trade & Vocational", level: "Senior Secondary", code: "DYB" },
  { name: "Electrical Installation", category: "Trade & Vocational", level: "Senior Secondary", code: "ELI" },
  { name: "Auto Mechanics", category: "Trade & Vocational", level: "Senior Secondary", code: "AUM" },
  { name: "Woodwork", category: "Trade & Vocational", level: "Senior Secondary", code: "WDW" },
  { name: "Building Construction", category: "Trade & Vocational", level: "Senior Secondary", code: "BDC" },
  { name: "Animal Husbandry", category: "Trade & Vocational", level: "Senior Secondary", code: "ANH" },
  { name: "Fisheries", category: "Trade & Vocational", level: "Senior Secondary", code: "FSH" },
  { name: "Salesmanship", category: "Trade & Vocational", level: "Senior Secondary", code: "SLM" },
  { name: "Cosmetology", category: "Trade & Vocational", level: "Senior Secondary", code: "COS" },

  // Junior Secondary (BECE / Basic 7 - 9)
  { name: "Basic Science", category: "Junior Secondary (BECE)", level: "Junior Secondary", code: "BSC" },
  { name: "Basic Technology", category: "Junior Secondary (BECE)", level: "Junior Secondary", code: "BTECH" },
  { name: "Social Studies", category: "Junior Secondary (BECE)", level: "Junior Secondary", code: "SOS" },
  { name: "Business Studies", category: "Junior Secondary (BECE)", level: "Junior Secondary", code: "BST" },
  { name: "Home Economics", category: "Junior Secondary (BECE)", level: "Junior Secondary", code: "HEC" },
  { name: "Cultural & Creative Arts (CCA)", category: "Junior Secondary (BECE)", level: "Junior Secondary", code: "CCA" },
  { name: "Physical & Health Education (PHE)", category: "Junior Secondary (BECE)", level: "Junior Secondary", code: "PHE-J" },
  { name: "French (Junior)", category: "Junior Secondary (BECE)", level: "Junior Secondary", code: "FRE-J" },

  // Primary Education (Basic 1 - 6)
  { name: "Quantitative Reasoning", category: "Primary Education", level: "Primary", code: "QTR" },
  { name: "Verbal Reasoning", category: "Primary Education", level: "Primary", code: "VRB" },
  { name: "Primary Mathematics", category: "Primary Education", level: "Primary", code: "PMTH" },
  { name: "English Grammar & Composition", category: "Primary Education", level: "Primary", code: "PE-ENG" },
  { name: "Basic Science & Technology (Primary)", category: "Primary Education", level: "Primary", code: "PBST" },
  { name: "National Values Education", category: "Primary Education", level: "Primary", code: "NVE" },
];

/**
 * Normalizes subject names for fuzzy matching and API queries
 */
export const normalizeSubjectName = (name = "") => {
  return name.trim().toLowerCase();
};

/**
 * Filter subjects by keyword matching name, code, or category
 */
export const filterSubjects = (list, query = "") => {
  if (!query || !query.trim()) return list;
  const q = query.trim().toLowerCase();
  return list.filter((s) => {
    const sName = s.name.toLowerCase();
    const sCode = (s.code || "").toLowerCase();
    const sCat = (s.category || "").toLowerCase();
    return sName.includes(q) || sCode.includes(q) || sCat.includes(q);
  });
};
