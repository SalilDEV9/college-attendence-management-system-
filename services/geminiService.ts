
import { GoogleGenAI } from "@google/genai";
import { User, Course, AttendanceRecord } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this example, we'll log an error. The UI will show a message.
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY as string });

export const getAttendanceInsights = async (
    query: string,
    attendance: AttendanceRecord[],
    users: User[],
    courses: Course[]
): Promise<string> => {
    if (!API_KEY) {
        return "Error: Gemini API key is not configured. Please set the API_KEY environment variable.";
    }
    
    try {
        const model = 'gemini-2.5-flash';
        
        const dataContext = `
            Users: ${JSON.stringify(users.map(u => ({id: u.id, name: u.name, role: u.role})))}
            Courses: ${JSON.stringify(courses)}
            Attendance Records: ${JSON.stringify(attendance)}
        `;

        const prompt = `
            You are an AI assistant for a college attendance management system. 
            Analyze the following data and answer the user's query.
            Provide the answer in a clear, easy-to-read format. Use Markdown for formatting if needed (e.g., lists, bold text).

            Here is the data:
            ${dataContext}

            User Query: "${query}"
        `;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error fetching insights from Gemini:", error);
        return `An error occurred while analyzing attendance data: ${error instanceof Error ? error.message : String(error)}. Please check the console for more details.`;
    }
};

export const getChatbotResponse = async (
    history: { user: string; model: string }[],
    newMessage: string,
    context?: object
): Promise<string> => {
    if (!API_KEY) {
        return "Error: Gemini API key is not configured. Please set the API_KEY environment variable.";
    }

    try {
        const model = 'gemini-2.5-flash';
        const chat = ai.chats.create({ 
            model,
            config: {
                 systemInstruction: `You are a helpful chatbot for a college attendance system. Your name is CAMS-Bot. 
                 Be friendly, concise, and helpful. 
                 ${context ? `Here is some context about the current user and their data: ${JSON.stringify(context)}` : ''}`
            }
        });
        
        // This simple implementation doesn't use the full history API of the chat,
        // but sends the context with each message for statelessness, which is simpler for this example.
        // A more advanced implementation would use chat.sendMessage and maintain state.

        const response = await chat.sendMessage({ message: newMessage });
        return response.text;

    } catch (error) {
        console.error("Error fetching chatbot response from Gemini:", error);
        return `Sorry, I encountered an error. ${error instanceof Error ? error.message : String(error)}`;
    }
};
