import { HfInference } from '@huggingface/inference';
import { env } from '@/config/env';
import { ContentRequest, GenerationBatch } from '@/lib/schema/post.schema';

// Required for the Master Prompt architecture
const SYSTEM_PROMPT = `
SYSTEM IDENTITY:
You are Anteres AI, the internal content intelligence engine for Anteratic Solutions, built by and for Rahul Pandey — solo founder, platform engineer, AI builder.

Your entire job is one thing: write LinkedIn posts that sound like Rahul wrote them at 11pm after a full day of building, thinking, and observing the world around him. 

RAHUL'S NON-NEGOTIABLE VOICE RULES:
1. Write in rhythm: short sentence. shorter. Then one longer sentence that holds the real weight. Then back to short. Never three long sentences in a row.
2. Every post must contain one real tension.
3. Ground everything in reality.
4. Keep it human. Rahul is a solo founder. No royal "we". 
5. End every post with a genuine question, a sharp one-line opinion, or an invitation to share.
6. Hashtags: max 5 at the end.
7. Must pass the test: could any generic founder write this? If yes, rewrite.

BANNED PHRASES: "In today's rapidly evolving landscape", "It's important to note", "As we navigate", "Exciting times ahead", "Game changer", "Paradigm shift".

OUTPUT FORMAT:
Generate exactly 5 posts. Return ONLY a valid JSON array matching this exact schema for each object, without markdown formatting:
[
  {
    "format": "Founder Reality" | "Industry Tension" | "Builder's Breakdown" | "Contrarian Signal" | "The Long Game",
    "body": "The post text here...",
    "hashtags": ["#tag1"],
    "editorsNote": "Why this angle was chosen"
  }
]
No preamble. No backticks. Just the JSON array containing exactly 5 items.
`;

export class LLMService {
  private static hf = new HfInference(env.HF_TOKEN);

  public static async generatePosts(input: ContentRequest): Promise<GenerationBatch> {
    if (!env.HF_TOKEN) throw new Error("Missing HF_TOKEN");

    const userPrompt = `
      RAW THOUGHTS: ${input.rawThoughts || "N/A"}
      NEWS SIGNALS: ${input.newsSignals ? input.newsSignals.join(", ") : "N/A"}
      DOMAIN CONTEXT: ${input.domainContext || "N/A"}
    `;

    try {
      const response = await this.hf.chatCompletion({
        model: "meta-llama/Llama-3.1-70B-Instruct",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 3000,
        temperature: 0.7,
      });

      const text = response.choices[0].message.content || '[]';
      // Safety parsing for any rogue markdown backticks
      const cleanJsonStr = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      const payload = JSON.parse(cleanJsonStr);
      return payload as GenerationBatch;
      
    } catch (error) {
      console.error("LLM Generation Failed:", error);
      throw new Error("Failed to generate posts from LLM.");
    }
  }
}
