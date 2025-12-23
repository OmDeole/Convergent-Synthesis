import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AuditResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using 'flash' for speed in intermediate steps
const FAST_MODEL = "gemini-3-flash-preview";
// Using 'pro' for complex synthesis and reasoning
const SMART_MODEL = "gemini-3-pro-preview"; 

/**
 * Step 1: Analyze the task and determine 3 diverse perspectives.
 */
export const identifyPerspectives = async (task: string): Promise<{ name: string; description: string }[]> => {
  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "The name of the perspective (e.g., 'Economic', 'Ethical')" },
        description: { type: Type.STRING, description: "A brief one-sentence description of this angle." },
      },
      required: ["name", "description"],
      propertyOrdering: ["name", "description"]
    },
  };

  const prompt = `
  Analyze this complex task: "${task}"
  Identify the 3 most important and distinct perspectives needed to solve it effectively. 
  Avoid generic perspectives; choose specific, high-impact angles.
  `;

  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction: "You are a strategic planning AI. Your job is to break down problems into distinct analytical frameworks.",
    },
  });

  const text = response.text;
  if (!text) throw new Error("No perspectives generated.");
  
  return JSON.parse(text);
};

/**
 * Step 2: Solve the task from a specific perspective.
 */
export const generateThoughtFromPerspective = async (task: string, perspectiveName: string, perspectiveDesc: string): Promise<string> => {
  const prompt = `
  TASK: ${task}
  
  Adopt the following perspective strictly:
  ROLE: ${perspectiveName}
  CONTEXT: ${perspectiveDesc}
  
  Provide a detailed reasoning step or solution proposal from this specific viewpoint. 
  Focus on unique insights that only this perspective would see.
  Keep it concise (approx 150 words) but deep.
  `;

  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: prompt,
  });

  return response.text || "Failed to generate thought.";
};

/**
 * Step 3: Audit the thought (SMART vs DUMB).
 */
export const auditThought = async (task: string, thought: string, perspectiveName: string): Promise<AuditResult> => {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      status: { type: Type.STRING, enum: ["SMART", "DUMB"], description: "SMART if high quality, DUMB if hallucinated, generic, or illogical." },
      reasoning: { type: Type.STRING, description: "A one sentence explanation of the verdict." },
    },
    required: ["status", "reasoning"],
  };

  const prompt = `
  Act as a Critical Auditor.
  Original Task: ${task}
  Perspective: ${perspectiveName}
  Proposed Thought: "${thought}"
  
  Evaluate this reasoning. Check for: Hallucinations, generic filler, logical gaps, or failure to address the prompt.
  `;

  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    }
  });

  const text = response.text;
  if (!text) return { status: "DUMB", reasoning: "Audit failed to return text." };
  
  return JSON.parse(text) as AuditResult;
};

/**
 * Step 4: Refine the thought if it was rejected.
 */
export const refineThought = async (task: string, perspectiveName: string, previousThought: string, critique: string): Promise<string> => {
  const prompt = `
  TASK: ${task}
  PERSPECTIVE: ${perspectiveName}
  
  Your previous attempt was rejected by the auditor.
  PREVIOUS ATTEMPT: "${previousThought}"
  CRITIQUE: "${critique}"
  
  Please try again. Provide a corrected, higher-quality reasoning step that addresses the critique.
  `;

  const response = await ai.models.generateContent({
    model: FAST_MODEL, // Still use flash for speed
    contents: prompt,
  });

  return response.text || "Failed to refine thought.";
};

/**
 * Step 5: Synthesize everything into a Master Solution.
 * Returns a stream.
 */
export const synthesizeConsensus = async (task: string, thoughts: { name: string, content: string }[]) => {
  const context = thoughts.map(t => `PERSPECTIVE [${t.name}]:\n${t.content}`).join("\n\n");
  
  const prompt = `
  TASK: ${task}
  
  I have explored this problem through multiple expert lenses. Here are the findings:
  
  ${context}
  
  Your Goal: Synthesize these different viewpoints into a Master Solution.
  1. Resolve contradictions.
  2. Extract the best unique insights from each path.
  3. Create a unified, actionable conclusion.
  
  Format nicely with Markdown headers/bullet points.
  `;

  // Use the PRO model for the final synthesis to ensure high reasoning quality
  const responseStream = await ai.models.generateContentStream({
    model: SMART_MODEL,
    contents: prompt,
    config: {
        // Thinking budget for deep synthesis if needed, though Pro Preview is quite capable without specific thinking config
        // Using standard config for reliability in this demo.
    }
  });

  return responseStream;
};
