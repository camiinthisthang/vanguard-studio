import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a friendly coding assistant helping kids (ages 8-13) create visual art and games with p5.js.

Your personality:
- Enthusiastic and encouraging
- Use simple words a kid would understand
- Celebrate their creativity!

IMPORTANT: You must ALWAYS respond in this exact format:

EXPLANATION: [1-2 short sentences explaining what you created or changed, written for a kid]

CODE:
[Complete p5.js code here]

Rules for the code:
1. ALWAYS include both setup() and draw() functions
2. Use createCanvas(400, 400) unless they ask for a different size
3. Keep code simple with clear variable names
4. Add brief comments for tricky parts
5. When they ask to modify something, keep ALL the existing features and add the new ones
6. Make things colorful and fun!

If they ask for something inappropriate or that doesn't make sense for visual coding, respond kindly:
EXPLANATION: Hmm, I'm not sure how to make that! How about we try something fun instead? Ask me to make a colorful shape, a bouncing ball, or maybe some falling stars!

CODE:
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  fill(150, 100, 255);
  textSize(20);
  textAlign(CENTER, CENTER);
  text("What would you like to create?", width/2, height/2);
}

Common p5.js patterns to use:
- Bouncing: check if x > width or x < 0, then reverse speed
- Following mouse: use mouseX and mouseY
- Random colors: fill(random(255), random(255), random(255))
- Animation: change variables in draw() to make things move
- Keyboard control: use keyIsPressed and key or keyCode`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, conversationHistory = [], currentCode = "" } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Build messages array for Claude
    const messages: Anthropic.MessageParam[] = [];

    // Add conversation history
    for (const msg of conversationHistory) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    // Build the user message with context
    let userMessage = prompt;
    if (currentCode && currentCode.trim()) {
      userMessage = `Current code:\n\`\`\`javascript\n${currentCode}\n\`\`\`\n\nUser request: ${prompt}`;
    }

    messages.push({
      role: "user",
      content: userMessage,
    });

    // Call Claude API
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: messages,
    });

    // Extract text from response
    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      return NextResponse.json(
        { error: "No text response from AI" },
        { status: 500 }
      );
    }

    const fullResponse = textContent.text;

    // Parse the response to extract explanation and code
    const codeMatch = fullResponse.match(/CODE:\s*\n?([\s\S]*?)$/);
    const explanationMatch = fullResponse.match(/EXPLANATION:\s*(.+?)(?=\n\nCODE:|$)/s);

    const explanation = explanationMatch
      ? explanationMatch[1].trim()
      : "I made something cool for you!";

    let code = codeMatch ? codeMatch[1].trim() : "";

    // Clean up code - remove markdown code blocks if present
    code = code.replace(/^```(?:javascript|js)?\n?/i, "").replace(/\n?```$/i, "");

    return NextResponse.json({
      explanation,
      code,
      fullResponse,
    });
  } catch (error) {
    console.error("Error calling Claude API:", error);

    if (error instanceof Anthropic.APIError) {
      console.error("Anthropic API Error:", error.status, error.message);
      if (error.status === 401) {
        return NextResponse.json(
          { error: "API key is invalid. Please check your ANTHROPIC_API_KEY." },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: `API Error: ${error.message}` },
        { status: error.status }
      );
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Something went wrong: ${errorMessage}` },
      { status: 500 }
    );
  }
}
