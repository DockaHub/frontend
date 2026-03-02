import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
// In a real app, we would handle missing keys gracefully in the UI.
// For this demo, we assume the environment is set up correctly or fail silently.

let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateEmailDraft = async (prompt: string, context?: string): Promise<string> => {
  if (!ai) return "AI Service Unavailable: Missing API Key.";

  try {
    const fullPrompt = `
      You are an AI assistant inside a professional corporate email client called "Docka".
      
      Context (previous email if any): ${context || 'None'}
      
      User Task: Write a professional, concise email draft based on the following instruction: "${prompt}".
      
      Return ONLY the body of the email. No subject line, no placeholders like [Your Name] if possible (sign off as Alex). Keep it clean and modern.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: fullPrompt,
    });
    
    return response.text || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating draft. Please try again.";
  }
};

export const summarizeEmail = async (emailBody: string): Promise<string> => {
  if (!ai) return "AI Service Unavailable.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize this email in one short sentence (max 15 words):\n\n${emailBody}`,
    });
    return response.text || "";
  } catch (error) {
    return "Could not summarize.";
  }
};
