import { GoogleGenAI, Type } from "@google/genai";
import type { TaskStep } from '../types';

export async function generateTaskWorkflow(taskDescription: string): Promise<Omit<TaskStep, 'status'>[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  const prompt = `You are an AI agent coordinator for the Hedera-Nexus platform. A user has submitted a high-level task. Break it down into a sequence of 3 to 5 smaller, verifiable steps that an autonomous agent would execute on the Hedera network. The description for each step should be a concise, past-tense statement confirming completion, like 'Asset ownership verified via Smart Contract 0.0.12345.' or 'Secure HCS transaction executed.' Task: "${taskDescription}"`;

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
                },
                required: ["name", "description"],
              },
            },
          },
          required: ["steps"],
        },
      },
    });
    
    let jsonString = response.text.trim();
    
    // The Gemini API may wrap the JSON in markdown code fences.
    // This removes them if they exist to ensure reliable parsing.
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
