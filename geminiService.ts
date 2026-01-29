
import { GoogleGenAI } from "@google/genai";
import { ChatMessage, FileNode } from "../types";

const SYSTEM_PROMPT = `You are Zerb, an Elite Full-Stack AI Architect.

Behavioral Modes:
1. **General Chat**: If the user is greeting you, asking a general question, or just chatting, respond with simple, friendly, and professional RAW PLAIN TEXT. Do NOT use the planning protocol or XML.
2. **Engineering Task**: If the user asks to build, modify, fix, or architect something:
   - START your response with the exact word "Plan:".
   - List the files and architectural logic.
   - Immediately follow with the XML protocol for the code.

XML Protocol for Code:
<file name="filename.ext" language="lang_id">
[CODE CONTENT]
</file>

Strict Rules for Tasks:
- Use "Plan:" only for actual coding/architectural work.
- For tasks, output COMPLETE file contents.
- Use RAW PLAIN TEXT for all chat components.
- Tech stack: React (TSX), TypeScript, Python, Tailwind, Framer Motion.
- When writing React components, assume they will be rendered in a browser environment with Tailwind support.`;

export interface StreamUpdate {
  chatText: string;
  files: FileNode[];
  completedFiles: string[];
}

export async function* streamZerbResponse(
  prompt: string,
  history: ChatMessage[],
  currentFiles: FileNode[]
): AsyncGenerator<StreamUpdate> {
  // Always create a new instance to ensure we use the most up-to-date key
  const ai = new GoogleGenAI({ apiKey: (process.env.API_KEY as string) });
  
  const fileContext = currentFiles.length > 0 
    ? currentFiles.map(f => `File: ${f.name}\nLanguage: ${f.language}\nContent:\n${f.content}`).join('\n\n')
    : "No files currently in project.";

  const contents = [
    ...history.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    })),
    { 
      role: 'user', 
      parts: [{ text: `Current Project Files:\n${fileContext}\n\nUser Message: ${prompt}` }] 
    }
  ];

  const result = await ai.models.generateContentStream({
    model: "gemini-3-pro-preview",
    contents: contents as any,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.1,
    }
  });

  let fullRawText = "";
  let completedFiles: string[] = [];

  for await (const chunk of result) {
    const chunkText = chunk.text;
    fullRawText += chunkText;

    const files: FileNode[] = [];
    let chatText = fullRawText;

    const fileRegex = /<file\s+name="([^"]+)"\s+language="([^"]+)">([\s\S]*?)(<\/file>|$)/g;
    let match;

    while ((match = fileRegex.exec(fullRawText)) !== null) {
      const fileName = match[1];
      const lang = match[2];
      const content = match[3];
      const isClosed = match[4] === "</file>";

      files.push({
        name: fileName,
        language: lang,
        content: content
      });

      if (isClosed && !completedFiles.includes(fileName)) {
        completedFiles.push(fileName);
      }

      chatText = chatText.replace(match[0], "");
    }

    chatText = chatText
      .replace(/[*_~`]/g, "")
      .replace(/^#+\s/m, "")
      .trim();

    yield {
      chatText,
      files,
      completedFiles
    };
  }
}
