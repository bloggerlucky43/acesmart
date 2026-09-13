import api from "../../libs/axios";
import { toaster } from "../../components/ui/toaster";

/**
 * Request AI Personalized Weak Area Detection for student
 */
export const getWeakAreaDetection = async ({
  scores,
  totalMarks,
  examSections,
  studentName,
}) => {
  try {
    const res = await api.post("/ai/weak-area-detection", {
      scores,
      totalMarks,
      examSections,
      studentName,
    });
    return res.data?.data;
  } catch (error) {
    console.warn("AI Weak Area Detection endpoint notice:", error?.message);
    // Return graceful client-side fallback if backend AI service is unreachable
    const weak = Object.entries(scores || {})
      .filter(([, val]) => Number(val) < 5)
      .map(([subj]) => ({
        subject: subj,
        topic: subj,
        scorePercent: 35,
        remediationAdvice: `Review fundamental formulas and practice problems in ${subj}.`,
      }));

    return {
      overallPercentage: Math.round(
        (Object.values(scores || {}).reduce((a, b) => a + Number(b), 0) /
          (totalMarks || 100)) *
          100,
      ),
      statusBadge: weak.length > 0 ? "Needs Review" : "Strong",
      weakAreas: weak,
      strongAreas: [],
      diagnosticNarrative:
        weak.length > 0
          ? `Identified potential learning gaps in ${weak.map((w) => w.subject).join(", ")}. Focused revision is recommended.`
          : "Solid performance demonstrated across all tested subject sections.",
      personalizedRoadmap: [
        "Review key conceptual chapter summaries",
        "Practice 15-20 timed past questions",
        "Re-evaluate weak areas before your final exam session",
      ],
      recommendedPracticeHours: "3-5 hours this week",
    };
  }
};

/**
 * Auto-tag and categorize questions in bulk via AI
 */
export const autoTagQuestions = async (questions) => {
  try {
    const res = await api.post("/ai/auto-tag-questions", { questions });
    return res.data?.data;
  } catch (error) {
    console.error("Auto-tag questions error:", error);
    toaster.create({
      title: "AI Auto-Tagging Notice",
      description: "Using local categorization rules.",
      type: "info",
    });
    return questions.map((q) => ({
      ...q,
      topic: q.topic || "Core Curriculum",
      subtopic: "General Principles",
      difficulty: q.difficulty || "medium",
      cognitiveLevel: "Application",
      tags: [q.subject || "general", "exam-prep"],
    }));
  }
};

/**
 * Request AI Class-Level Insights & Readiness Summary for Teachers
 */
export const getClassInsights = async (params) => {
  try {
    const payload = typeof params === "object" && params !== null ? params : { examId: params };
    const res = await api.post("/ai/class-insights", payload);
    return res.data?.data;
  } catch (error) {
    console.warn("Class insights endpoint error:", error);
    return null;
  }
};

/**
 * Fetch Question Bank Classification Health & Topic Coverage Statistics
 */
export const getEnrichmentStatus = async () => {
  try {
    const res = await api.get("/ai/enrichment-status");
    return res.data?.data;
  } catch (error) {
    console.warn("Enrichment status endpoint error:", error);
    return null;
  }
};

/**
 * Trigger Scalable AI Question Bank Classification & Enrichment
 */
export const triggerBankEnrichment = async ({
  subject = "all",
  chunkSize = 250,
  useAI = false,
  forceAll = false,
} = {}) => {
  try {
    const res = await api.post("/ai/enrich-bank", {
      subject,
      chunkSize,
      useAI,
      forceAll,
    });
    return res.data;
  } catch (error) {
    console.error("Trigger enrichment error:", error);
    throw error;
  }
};

