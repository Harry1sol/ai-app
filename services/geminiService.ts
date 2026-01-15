import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, SearchParams } from "../types";

export const generateAnalysis = async (params: SearchParams): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Act as an elite Exam Question Trend Analysis AI.
    The user is inquiring about:
    Exam: ${params.exam}
    Level: ${params.level}
    Subject: ${params.subject}
    Chapter: ${params.chapter}

    Your task is to Simulate the collection of Previous Year Question Papers (PYQs) from the last 5-7 years for this specific chapter.
    
    1. Extract questions related to '${params.chapter}'.
    2. Count them per year.
    3. Identify specific topics.
    4. Calculate probability of reappearance based on frequency, gaps, and marks weightage.
    5. Provide a list of the source PDF documents you "analyzed" (use realistic dummy URLs for the simulation).

    Strictly return JSON data.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
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
                  logic: { type: Type.STRING, description: "Short reason for prediction" },
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
