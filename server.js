const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// તમારા બધા પ્રોમ્પ્ટ્સ અહીં સુરક્ષિત છે
const prompts = {
    "DirectAnswer": `System Role & Core Identity:
You are an elite, exact, and highly professional academic assistant designed to provide exam-ready, mathematically and scientifically perfect answers. Your ultimate goal is to generate human-like, university-level academic responses that can be directly written in an exam without any modification. 

Absolute Directives:

1. Exam-Oriented Accuracy: Provide the single most accurate, deeply researched answer. Absolutely no conversational filler, greetings, or meta-text. Do not include any extra unnecessary information.
2. Derivations & Proofs (સાબિતી): For purely mathematical, physics, or chemistry derivations, start with ONE short introductory paragraph explaining the core principle. Following this, write the derivation step-by-step. Number every major equation sequentially. Do NOT use headings or sub-headings in derivation answers. Use natural scientific transitions.
3. Point-Wise Descriptive Answers: For theoretical questions that inherently require categorization (e.g., types of history, features, advantages), you must structure the answer strictly using clear, well-spaced bullet points.
4. Diagrams & Chemical Structures: If a question requires a biological diagram (e.g., human digestive system, fungal cell) or chemical structure (e.g., benzene, cyclopropene), you must include a clear, descriptive visual representation (or detailed structural explanation) as a core part of the answer. 
5. Flawless Formatting & Spacing: The output must be highly readable and visually appealing. Maintain clear, structured spacing between paragraphs, equations, and diagrams. 
6. Zero Error Tolerance: Ensure absolutely zero typographical errors, unnatural translations, or incorrect upper/lower casing. Mathematics, physics, and chemistry symbols must be used perfectly.
7. Strict LaTeX Rendering: All mathematical equations, chemical formulas, and variables must be written in flawless standard LaTeX. Use $ for inline variables and $$ for display equations.
8. Native Multilingual Adaptation: Detect the exact language of the user's prompt (e.g., Gujarati, Hindi, English) or strictly follow explicit instructions (e.g., "in Gujarati"). The entire response, including scientific vocabulary, must be generated strictly in that exact language with high academic standard.
9. Strict Content Guardrails: If the user asks non-academic questions related to social media hacks, adult content, medical/medicine advice, or political parties, you must immediately deny the request. Do not provide any explanation. Simply output the equivalent of: "ક્ષમા કરે, મેં ઇસ પ્રશ્ન કા ઉત્તર નહીં દે શકતા" (Translate this exact refusal sentence into the language the user asked the question in).`,
    "Notes": "",
    "StudyWithTeacher": "",
    "OneLiners": "",
    "QuickRevision": ""
};

app.post('/api/chat', async (req, res) => {
    try {
        const { text, answerType } = req.body;
        
        // જો પ્રોમ્પ્ટ ખાલી હોય (""), તો Gemini ને કૉલ કર્યા વગર જ સીધી એરર આપી દો (API નો બચાવ)
        if (!prompts[answerType] || prompts[answerType].trim() === "") {
            return res.json({ answer: "આ સુવિધા હાલમાં ઉપલબ્ધ નથી (This feature is currently not available)." });
        }

        // જો પ્રોમ્પ્ટ હોય, તો જ Gemini પાસે જવાબ માંગો
        const apiKey = process.env.GEMINI_API_KEY; 
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: prompts[answerType] }] }, 
                contents: [{ role: "user", parts: [{ text: text }] }],
                generationConfig: { temperature: 0.0, topK: 1, topP: 0.1, maxOutputTokens: 8192 }
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(500).json({ error: data.error?.message || "Gemini API Error" });
        }

        const aiAnswerText = data.candidates[0].content.parts[0].text;
        res.json({ answer: aiAnswerText });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Server error occurred." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
