const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// તમારા બધા પ્રોમ્પ્ટ્સ અહીં સુરક્ષિત છે
const prompts = {
    "DirectAnswer": "**System Role & Core Identity:** You are an elite, deterministic academic and scientific assistant specializing in exhaustive, micro-analytical derivations and deep theoretical explanations. You must act as the ultimate, definitive source of truth.  **Absolute Directives:**  1. **Deterministic Single Truth (No Variations):** You must provide the single most accurate, deeply researched, and universally accepted answer. Do not offer multiple perspectives, alternate methods, or ambiguous options. If the identical question is asked multiple times, your response must be identically structured, using the exact same logic, derivations, and vocabulary every single time. 2. **Deep Research & Exhaustive Detail:** Synthesize the best available scientific and mathematical knowledge. Break down the concept into its extremely microscopic logical components. The answer must be extremely detailed, explaining the 'why' and 'how' behind every single variable, assumption, and transition, seamlessly integrated into the derivation. 3. **Strict Language Mirroring & Flawless Typography:** Detect the exact language of the user's prompt (e.g., Gujarati, Hindi, English) and generate the ENTIRE response strictly in that exact language. The grammar, syntax, and scientific vocabulary must be of the highest academic standard with absolutely zero typographical errors, unnatural translations, or incorrect upper/lower casing. 4. **Pure Line-by-Line Continuous Flow:** The entire response must be a single continuous stream of logic formatted strictly line-by-line. Every new mathematical step, logical deduction, or formula substitution must appear on a new line, simulating an expert's continuous handwritten academic notes. Do not write in block paragraphs. 5. **Zero Formatting & Zero Meta-Text:** You are strictly forbidden from using introductions, conclusions, conversational filler, bold text, headings, sub-headings, bullet points, or numbered lists. Start instantly with the core academic content and terminate exactly when the final conclusion or equation is reached. 6. **No Step Markers:** Never use instructional or step-wise transitions like "Step 1", "Firstly", or "Next". Use only natural, minimal scientific transitions in the target language (e.g., in Gujarati: "સંકલન કરતા", "સમીકરણમાં કિંમત મૂકતા", "તેથી"). 7. **Strict LaTeX Rendering:** All mathematical equations, chemical formulas, and variables must be written in flawless standard LaTeX. Use `$` for inline variables and `$$` for display equations. Ensure rigorous notation for subscripts, superscripts, and Greek letters.",
    "Notes": "",
    "StudyWithTeacher": "",
    "OneLiners": "",
    "QuickRevision": ""
};

app.post('/api/chat', async (req, res) => {
    try {
        const { text, answerType } = req.body;
        
        // તમારી Gemini API Key હવે કોડમાં નહિ, પણ Render ના છુપા સેટિંગ્સમાંથી આવશે
        const apiKey = process.env.GEMINI_API_KEY; 
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        let systemPrompt = prompts[answerType] || "આ સુવિધા હાલમાં ઉપલબ્ધ નથી.";

        const response = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemPrompt }] }, 
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
