import { GoogleGenAI, Type } from "@google/genai";
import type { TaskStep } from '../types.ts';

export async function generateTaskWorkflow(taskDescription: string): Promise<Omit<TaskStep, 'status' | 'transactionId' | 'assetTransfers'>[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  const prompt = `You are an AI agent coordinator for the Hedera-Nexus platform. A user has submitted a high-level task. Break it down into a sequence of 3 to 5 smaller, verifiable steps for an autonomous agent.

The platform has these capabilities:
1.  **Oracle:** The agent can query real-time data. To do this, create a step with type 'Oracle' and specify an 'oracleKey'. Available keys are 'hbarPrice' (number) and 'marketSentiment' (string). The agent stores the result in its memory.
2.  **Conditional Logic:** The step immediately following an Oracle query can be made conditional. To do this, add a 'condition' object to the step. The condition checks if a memory key is 'gt' (greater than) or 'lt' (less than) a numerical value. If the condition fails, the step is skipped. Give this step type 'Conditional'.
3.  **HCS (Hive-Mind):** The agent can broadcast a message to all other agents. Create a step with type 'HCS' and provide the 'message' string. You can include data from memory using placeholders like {{hbarPrice}}.
4.  **Token Service:** The agent can 'mint_nft' or 'transfer_ft'. For transfers, you MUST use the placeholder "ANOTHER_AGENT" as the target.
5.  **Standard Types:** 'Verification', 'Smart Contract'.

For each step, provide:
- A 'name' (concise action, e.g., "Query HBAR Price"), a 'description' (past-tense, e.g., "Queried the Oracle for the latest HBAR price."), and a 'type'.
- An estimated HBAR 'cost' (a small, realistic fractional number).
- For conditional steps, provide the 'condition' object { "key": "hbarPrice", "operator": "lt", "value": 0.08 }.
- For Oracle steps, provide the 'oracleKey'.
- For HCS steps, provide the 'message'.
- For Token Service steps, provide 'tokenAction' and related details.

User Task: "${taskDescription}"`;

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
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING },
                  cost: { type: Type.NUMBER },
                  tokenAction: { type: Type.STRING, description: "Action for Token Service: 'mint_nft' or 'transfer_ft'." },
                  assetId: { type: Type.STRING, description: "ID of the asset for the token action." },
                  assetAmount: { type: Type.INTEGER, description: "Amount for FT transfer." },
                  targetAgent: { type: Type.STRING, description: "Target for FT transfer. Use 'ANOTHER_AGENT'." },
                  oracleKey: { type: Type.STRING, description: "Key to query from the oracle, e.g., 'hbarPrice'."},
                  message: { type: Type.STRING, description: "Message to broadcast on HCS."},
                  condition: {
                    type: Type.OBJECT,
                    description: "Condition to execute the step.",
                    properties: {
                        key: { type: Type.STRING },
                        operator: { type: Type.STRING },
                        value: { type: Type.NUMBER },
                    },
                  },
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
