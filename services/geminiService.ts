
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, SearchParams } from "../types";

// Helper to generate a deterministic integer seed from normalized input strings
const generateDeterministicSeed = (exam: string, level: string, subject: string, chapter: string): number => {
  // Use a separator that is unlikely to appear in user input to prevent collision
  // Ensure we are hashing the "Normalized" content.
  const inputString = `${exam}|${level}|${subject}|${chapter}`;
  let hash = 0;
  for (let i = 0; i < inputString.length; i++) {
    const char = inputString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

export const generateAnalysis = async (params: SearchParams): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 1. Normalize Inputs
  // Since we are now using a Taxonomy/Dropdown system, the inputs are already cleaner.
  // However, we still trim/lower to ensure the seed is robust.
  const clean = (str: string) => str ? str.trim().toLowerCase() : "";
  
  const normalizedExam = clean(params.exam);
  const normalizedLevel = clean(params.level);
  const normalizedSubject = clean(params.subject);
  const normalizedChapter = clean(params.chapter);

  // 2. Generate Seed
  // This is the "Analysis Key". Identical normalized input -> Identical Seed.
  const consistencySeed = generateDeterministicSeed(normalizedExam, normalizedLevel, normalizedSubject, normalizedChapter);

  // 3. Construct Strict System Prompt
  const prompt = `
    You are an Exam Trend Analysis Engine, not a creative assistant.
    Your purpose is to produce deterministic, repeatable, and examiner-grade outputs.
    The same input must always generate the same counts, topics, and probabilities.

    CURRENT INPUT CONTEXT (Immutable Keys):
    - Examination: "${normalizedExam}"
    - Level: "${normalizedLevel}"
    - Subject: "${normalizedSubject}"
    - Chapter: "${normalizedChapter}"
    - Year Range: 2017-2024

    DETERMINISTIC PROCESSING RULES:

    Step 1: Data Selection (Deterministic)
    - Simulate fetching PYQs (Past Year Questions) for this exact chapter.
    - The dataset is FIXED. Do not invent new questions for different runs.
    - If you decided there were 3 questions in 2018 for this chapter last time, there must be 3 questions this time.

    Step 2: Topic Classification (Schema-Locked)
    - Map these questions to fixed sub-topics.
    - Never rename topics. If you used "Section 10: Free Consent" before, do not change it to "Free Consent Rules".

    Step 3: Statistical Computation (Formula-Based)
    - Calculate year-wise counts exactly.
    - Calculate Probability using this strict formula:
       * >4 questions in last 7 years = High Probability (>70%)
       * 2-3 questions = Medium Probability (40-69%)
       * <2 questions = Low Probability (<40%)
    
    Step 4: Explanation
    - You may generate natural language text to explain the stats, but the stats themselves are FROZEN.

    OUTPUT SCHEMA REQUIREMENTS:
    - Return strictly valid JSON.
    - "totalQuestionsAnalyzed" must equal the sum of "yearWiseData" counts.
    - "sourceDocuments" should list plausible past paper references for this exam.

    BEHAVIOR IDENTITY:
    "Same syllabus + same past papers = same numbers, always."
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        // CRITICAL: Enforce determinism
        temperature: 0,        // No randomness in token selection
        topP: 0.1,            // Restrict nucleus sampling
        seed: consistencySeed, // Input-based seed forces identical model state
        
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            yearWiseData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  year: { type: Type.INTEGER },
                  questionCount: { type: Type.INTEGER },
                  topics: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                }
              }
            },
            predictions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING },
                  probability: { type: Type.INTEGER, description: "Percentage between 0 and 100" },
                  logic: { type: Type.STRING, description: "Statistical reason based on frequency gaps" },
                  trend: { type: Type.STRING, enum: ["up", "down", "stable"] }
                }
              }
            },
            sourceDocuments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  year: { type: Type.INTEGER },
                  examName: { type: Type.STRING },
                  sourceLabel: { type: Type.STRING },
                  url: { type: Type.STRING }
                }
              }
            },
            totalQuestionsAnalyzed: { type: Type.INTEGER },
            mostFrequentTopic: { type: Type.STRING }
          },
          required: ["yearWiseData", "predictions", "sourceDocuments", "totalQuestionsAnalyzed", "mostFrequentTopic"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from AI");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze trends. Please try again.");
  }
};
