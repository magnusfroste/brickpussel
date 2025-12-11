import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateVictoryMessage = async (
  gridSize: number, 
  seconds: number, 
  moves: number
): Promise<string> => {
  const client = getClient();
  if (!client) {
    return "Grattis! Du löste pusslet!";
  }

  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      You are a game announcer for a puzzle game called 'MindSlide'.
      The user just solved a ${gridSize}x${gridSize} sliding tile puzzle.
      Time: ${seconds} seconds.
      Moves: ${moves}.
      
      Generate a short, funny, and encouraging victory message in Swedish (Svenska).
      If the grid size is small (2 or 3), tease them slightly but be nice.
      If grid size is large (6+), be very impressed.
      Max 2 sentences.
    `;

    const response = await client.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Bra jobbat! Pusslet är löst.";
  } catch (error) {
    console.error("Gemini API error:", error);
    return "Snyggt jobbat! Du är en pusselmästare!";
  }
};
