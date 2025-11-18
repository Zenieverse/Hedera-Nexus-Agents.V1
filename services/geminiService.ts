
import { GoogleGenAI, Type } from "@google/genai";
import type { TaskStep } from '../types.ts';

export async function generateTaskWorkflow(taskDescription: string): Promise<Omit<TaskStep, 'status' | 'transactionId' | 'assetTransfers'>[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  const prompt = `You are an AI agent coordinator for the Hedera-Nexus platform. A user has submitted a high-level task. Break it down into a sequence of 3 to 6 smaller, verifiable steps for an autonomous agent.

The platform has these capabilities:
1.  **Oracle:** Query real-time data. Type 'Oracle', set 'oracleKey' ('hbarPrice' or 'marketSentiment'). Agent stores result in memory.
2.  **Conditional Logic:** The step following an Oracle query can be conditional. Type 'Conditional', set 'condition' { "key": "hbarPrice", "operator": "lt" | "gt", "value": number }. If condition fails, step is skipped.
3.  **HCS (Hive-Mind):** Broadcast message. Type 'HCS', set 'message'. Use placeholders like {{hbarPrice}}.
4.  **Token Service:** 'mint_nft' or 'transfer_ft'. For transfers, use target "ANOTHER_AGENT".
5.  **Governance (DAO):**
    *   **Stake:** Agent locks NEX-GOV tokens for voting power. Type 'Governance', set 'governanceAction' to 'stake', set 'stakeAmount' (integer, e.g., 500).
    *   **Vote:** Agent votes on the active proposal. Type 'Governance', set 'governanceAction' to 'vote', set 'voteOption' to 'yes' or 'no'. This is often used with Conditional Logic (e.g., if price > 0.10, vote yes).
6.  **Standard:** 'Verification', 'Smart Contract'.

For each step, provide:
- 'name', 'description', 'type'.
- Estimated HBAR 'cost'.
- Specific fields based on type (oracleKey, message, tokenAction, governanceAction, etc.).

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
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING },
                  cost: { type: Type.NUMBER },
                  tokenAction: { type: Type.STRING },
                  assetId: { type: Type.STRING },
                  assetAmount: { type: Type.INTEGER },
                  targetAgent: { type: Type.STRING },
                  oracleKey: { type: Type.STRING },
                  message: { type: Type.STRING },
                  governanceAction: { type: Type.STRING, enum: ["stake", "vote"] },
                  stakeAmount: { type: Type.INTEGER },
                  voteOption: { type: Type.STRING, enum: ["yes", "no"] },
                  condition: {
                    type: Type.OBJECT,
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
    if (jsonString.startsWith("```json")) jsonString = jsonString.slice(7, -3).trim();
    else if (jsonString.startsWith("```")) jsonString = jsonString.slice(3, -3).trim();

    const parsedResponse = JSON.parse(jsonString);
    if (parsedResponse && Array.isArray(parsedResponse.steps)) {
        return parsedResponse.steps;
    } else {
        throw new Error("Invalid response format.");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to communicate with the AI Coordinator.");
  }
}
