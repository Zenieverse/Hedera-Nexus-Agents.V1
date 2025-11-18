import { GoogleGenAI, Type } from "@google/genai";
import type { TaskStep } from '../types.ts';

export async function generateTaskWorkflow(taskDescription: string): Promise<Omit<TaskStep, 'status' | 'transactionId'>[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  const prompt = `You are an AI agent coordinator for the Hedera-Nexus platform. A user has submitted a high-level task. Break it down into a sequence of 3 to 5 smaller, verifiable steps that an autonomous agent would execute on the Hedera network. For each step, provide a name, a concise past-tense description, a type, and an estimated HBAR cost for the transaction. The type must be one of: 'Verification', 'Smart Contract', 'Token Service', or 'HCS'. The cost should be a small, realistic fractional number (e.g., 0.0025). Task: "${taskDescription}"`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            steps: {
              type: Type.ARRAY,
              description: "The sequence of steps for the agent to execute.",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: {
                    type: Type.STRING,
                    description: "The name of the task step, e.g., 'Verify Asset Ownership'",
                  },
                  description: {
                    type: Type.STRING,
                    description: "A concise, past-tense statement confirming the step's completion.",
                  },
                  type: {
                      type: Type.STRING,
                      description: "The category of the step. Must be one of: 'Verification', 'Smart Contract', 'Token Service', 'HCS'.",
                  },
                  cost: {
                      type: Type.NUMBER,
                      description: "The estimated transaction cost in HBAR for this step.",
                  }
                },
                required: ["name", "description", "type", "cost"],
              },
            },
          },
          required: ["steps"],
        },
      },
    });
    
    let jsonString = response.text.trim();
    
    if (jsonString.startsWith("```json")) {
        jsonString = jsonString.slice(7, -3).trim();
    } else if (jsonString.startsWith("```")) {
        jsonString = jsonString.slice(3, -3).trim();
    }

    if (!jsonString) {
      throw new Error("Received empty response from AI.");
    }

    const parsedResponse = JSON.parse(jsonString);

    if (parsedResponse && Array.isArray(parsedResponse.steps)) {
        return parsedResponse.steps;
    } else {
        throw new Error("Invalid response format from AI. Expected a 'steps' array.");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to communicate with the AI Coordinator.");
  }
}
