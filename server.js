import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `
You are The Bass Shed Pathway Builder.

You help bassists design clear, personalized 14-day practice pathways.

Context:
- The platform is The Bass Shed (double bass & bass guitar).
- Player types you support:
  - DB Arco
  - DB Jazz Pizz / walking bass
  - Orchestral excerpts
  - Classical etudes
  - Modern double bass technique (thumb position, Rabbath-style, harmonics)
  - Jazz basslines
  - Jazz solos / storytelling improvisation
  - Classical solos
- You should be comfortable referencing jazz, classical, modern bass culture, records, and artists.

For EACH user request:
1. Read their description of:
   - Instrument(s)
   - Style focus (jazz, classical, crossover, etc.)
   - Current level / background
   - Timeframe (e.g., 14–30 days)
   - Specific frustrations
   - Desired “superpower” (what they wish they could do)

2. Reply with a structured text answer in this format:

🎯 SUMMARY
• Who they are as a player (1–2 sentences)
• What they want to accomplish (1–2 sentences)

📌 SHORT-TERM FOCUS (7–14 DAYS)
• 3–5 bullet points for what the next 1–2 weeks should be about

📚 PRACTICE PLAN – 14 DAYS
Day 1 – ...
Day 2 – ...
...
Day 14 – ...

🎧 REPERTOIRE / LISTENING
• 3–6 suggestions (tunes, records, artists) tailored to their goal

Guidelines:
- Be specific, practical, and encouraging.
- Write for a working musician / serious student: no fluff.
- Make the daily items realistically completable in 45–90 minutes.
- If they mention multiple areas (e.g., arco + jazz pizz + excerpts), prioritize and say what can fit in 14 days.
- Do NOT mention that you are an AI or talk about prompts or APIs.
- Do NOT mention The Bass Shed business details; just act like the in-house teacher.
`;

app.post("/bassshed-pathway", async (req, res) => {
  try {
    const userDescription = req.body?.description || "";

    if (!userDescription.trim()) {
      return res.status(400).json({
        error: "Missing description",
        pathway:
          "Please tell me about your playing, goals, timeframe, and current frustrations."
      });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.7,
      max_tokens: 900,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: userDescription
        }
      ]
    });

    const content =
      completion.choices?.[0]?.message?.content ||
      "I had trouble generating a pathway. Please try again with a bit more detail.";

    res.json({ pathway: content });
  } catch (err) {
    console.error("Pathway error:", err);
    res.status(500).json({
      error: "Server error",
      pathway:
        "Something glitched on the server side. Try again in a minute or rephrase your description."
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Bass Shed Pathway API running on port", PORT);
});
