import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env or .env.local
const envPath = path.resolve(process.cwd(), '.env');
const envLocalPath = path.resolve(process.cwd(), '.env.local');

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
}

async function listModels() {
    const key = process.env.VITE_GEMINI_API_KEY;
    if (!key) {
        console.error("❌ No API Key found in .env or .env.local");
        return;
    }

    console.log("🔑 Using API Key:", key.substring(0, 8) + "...");

    const genAI = new GoogleGenerativeAI(key);

    try {
        console.log("📡 Fetching available models...");
        // For identifying models, we use a basic client if possible, 
        // but the SDK doesn't expose listModels directly on the main class easily in all versions.
        // We will try to just print the error if it fails, or use the model endpoint.
        // Actually, getGenerativeModel doesn't list.
        // We need to use the ModelService if exposed, or just rely on the error message which sometimes lists them.
        // Wait, the SDK has a model manager? No.
        // Let's rely on a known 'gemini-1.5-flash' and see if it works, or fallback to 'gemini-pro'.

        // Actually, detailed error in the previous turn SAID: "Call ListModels to see...".
        // The SDK might not expose it easily in node without using the specialized ModelServiceClient.
        // Let's try to make a raw REST call which is 100% reliable.

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("\n✅ Available Models:");
            data.models.forEach(m => {
                if (m.name.includes('gemini')) {
                    console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
                }
            });
        } else {
            console.error("❌ Error listing models:", JSON.stringify(data, null, 2));
        }

    } catch (e) {
        console.error("❌ Fatal Error:", e);
    }
}

listModels();
