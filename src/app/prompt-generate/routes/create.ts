import { generateJSON } from "../../../config/openRouter";
import { AngleKeys } from "../docs/angles";
import { LightingKeys, MoodKeys } from "../docs/lighting";
import { systemPrompt } from "../docs/system-prompt";

// ============================================
// 시스템 프롬프트
// ============================================

const buildUserPrompt = ({ prompt, category, lighting, mood, angle }: PostRequest): string => {
  return [
    `prompt: ${prompt}`,
    `category: ${category}`,
    `lighting: ${lighting || ""}`,
    `mood: ${mood || ""}`,
    `angle: ${angle || ""}`,
  ].join("\n");
};

// ============================================
// 타입 정의
// ============================================

type PostRequest = {
  prompt: string;
  category: "photo" | "comic";
  lighting: LightingKeys;
  mood: MoodKeys;
  angle: AngleKeys;
};

interface GeneratedPrompt {
  prompt: string;
  negative_prompt: string;
}

// ============================================
// 핸들러
// ============================================

async function handler(req: any, res: any) {
  try {
    const { prompt, category, lighting, mood, angle }: PostRequest = req.body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ success: false, error: "유효한 프롬프트를 입력해주세요." });
    }

    if (!category || !["photo", "comic"].includes(category)) {
      return res.status(400).json({ success: false, error: "category는 photo 또는 comic이어야 합니다." });
    }

    const SYSTEM_PROMPT = systemPrompt({ lighting, mood, angle, category, prompt });
    const userPrompt = buildUserPrompt({ prompt, category, lighting, mood, angle });

    const aiResponse = await generateJSON<GeneratedPrompt>(userPrompt, {
      systemPrompt: SYSTEM_PROMPT,
      maxTokens: 800,
      temperature: 0.4,
    });

    if (!aiResponse.success || !aiResponse.data) {
      return res.status(500).json({
        success: false,
        error: aiResponse.error || "AI 프롬프트 생성 실패",
      });
    }

    const { prompt: generatedPrompt, negative_prompt: negativePrompt } = aiResponse.data;

    if (!generatedPrompt) {
      return res.status(500).json({
        success: false,
        error: "AI가 유효한 프롬프트를 생성하지 못했습니다.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        category,
        original: prompt,
        generatedPrompt,
        negativePrompt: negativePrompt || "",
      },
    });
  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
}

export default handler;
