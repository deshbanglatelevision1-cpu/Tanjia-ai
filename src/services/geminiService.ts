import { GoogleGenAI } from "@google/genai";

// Lazy initialization of Gemini API
let genAI: GoogleGenAI | null = null;

export const getGemini = () => {
    if (!genAI) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not defined in environment variables.");
        }
        genAI = new GoogleGenAI({ apiKey });
    }
    return genAI;
};

const SYSTEM_INSTRUCTION = "You are TANJIA AI, a premium and high-precision artificial intelligence created by তানজিয়া. Your name is TANJIA AI. NEVER refer to yourself as Gemini, Google, or a large language model. You provide sophisticated, insightful, and helpful responses. Your personality is elegant and professional. All your responses should be formatted beautifully using markdown with clear headings and bullet points. Your aesthetic is Pink-Blue-Violet Glassmorphism.";

export const chatWithGeminiStream = async (prompt: string, history: any[] = []) => {
    const ai = getGemini();
    
    const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
            systemInstruction: SYSTEM_INSTRUCTION
        },
        history: history.length > 0 ? history : undefined
    });

    const result = await chat.sendMessageStream({
        message: prompt
    });
    
    return result;
};

export const generateImageWithGemini = async (prompt: string) => {
    const ai = getGemini();
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [
            {
                role: 'user',
                parts: [
                    { text: `Create a high-quality, professional image of: ${prompt}. Style: Elegant, sophisticated, match the Pink-Blue-Violet Glassmorphism aesthetic where appropriate.` }
                ]
            }
        ],
        config: {
            imageConfig: {
                aspectRatio: "1:1"
            }
        }
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    
    throw new Error("No image data found in response");
};

export const processImageWithGeminiStream = async (prompt: string, base64Image: string, mimeType: string) => {
    const ai = getGemini();
    
    const result = await ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents: [
            {
                role: 'user',
                parts: [
                    { text: prompt },
                    { inlineData: { data: base64Image, mimeType } }
                ]
            }
        ],
        config: {
            systemInstruction: SYSTEM_INSTRUCTION
        }
    });

    return result;
};
