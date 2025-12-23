
import { GoogleGenAI, Type } from "@google/genai";

const OFFICIAL_PAYMENT_LINK = "https://buy.stripe.com/test_7sY8wQd2NcVgagTayNcs801";

export async function getDailyMotivation(): Promise<string> {
  const fallbacks = ["A disciplina é a ponte entre o sonho e a faixa preta.", "No tatame da vida, a única derrota é desistir de lutar."];
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Gere uma frase curta e mística de motivação BJJ com gírias de lutador. Máximo 12 palavras.",
    });
    return response.text?.replace(/"/g, '') || fallbacks[0];
  } catch (error) { return fallbacks[0]; }
}

export async function analyzeStorageHealth(dataSummary: string): Promise<{ healthScore: number; recommendations: string; potentialSavings: string }> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise a densidade de objetos deste bucket Google Cloud: ${dataSummary}. Identifique logs obsoletos. Retorne um diagnóstico em JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            healthScore: { type: Type.INTEGER },
            recommendations: { type: Type.STRING },
            potentialSavings: { type: Type.STRING }
          },
          required: ["healthScore", "recommendations", "potentialSavings"],
        },
      },
    });
    return JSON.parse(response.text || '{"healthScore": 100, "recommendations": "GCP estável", "potentialSavings": "0KB"}');
  } catch (error) { return { healthScore: 50, recommendations: "IA em manutenção Cloud.", potentialSavings: "???" }; }
}

export async function moderateAnnouncement(content: string): Promise<{ authorized: boolean; reason: string }> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Modere este aviso de academia: "${content}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            authorized: { type: Type.BOOLEAN },
            reason: { type: Type.STRING },
          },
          required: ["authorized", "reason"],
        },
      },
    });
    return JSON.parse(response.text || '{"authorized": true, "reason": "Aprovado via Cloud Backup"}');
  } catch (error) { return { authorized: true, reason: "Acesso bypass." }; }
}

export async function processFinancialStatus(userName: string, userRole: string, daysDiff: number): Promise<{ message: string; paymentLink: string; action: 'none' | 'warn' | 'block' }> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere diagnóstico financeiro para ${userName} (${userRole}) com ${daysDiff} dias de status. O link de pagamento DEVE ser exatamente: ${OFFICIAL_PAYMENT_LINK}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            paymentLink: { type: Type.STRING },
            action: { type: Type.STRING, enum: ['none', 'warn', 'block'] }
          },
          required: ["message", "paymentLink", "action"]
        }
      }
    });
    const data = JSON.parse(response.text || `{"message": "Análise financeira concluída.", "paymentLink": "${OFFICIAL_PAYMENT_LINK}", "action": "none"}`);
    data.paymentLink = OFFICIAL_PAYMENT_LINK;
    return data;
  } catch (error) { return { message: "Guarda financeira alerta.", paymentLink: OFFICIAL_PAYMENT_LINK, action: daysDiff > 5 ? 'block' : 'warn' }; }
}
