// ============================================
// 내부 패턴 정의
// ============================================

/** AI 거부 메시지 패턴 (문장 단위 - 마침표 기준) */
const AI_REJECTION_PATTERNS_SENTENCE = [
  /I'm sorry[^.]*?\./gi,
  /I cannot fulfill[^.]*?\./gi,
  /I am prohibited[^.]*?\./gi,
  /I am programmed[^.]*?\./gi,
  /I am unable[^.]*?\./gi,
  /I apologize[^.]*?\./gi,
  /I can't[^.]*?\./gi,
  /but I cannot[^.]*?\./gi,
  /My safety guidelines[^.]*?\./gi,
  /prohibit me from[^.]*?\./gi,
  /generating sexually explicit[^.]*?\./gi,
  /including detailed descriptions[^.]*?\./gi,
  /or prompts for[^.]*?\./gi,
  /adult sexual acts[^.]*?\./gi,
  /cannot fulfill this request[^.]*?\./gi,
];

/** AI 거부 메시지 패턴 (키워드 단위 - 쉼표 기준) */
const AI_REJECTION_PATTERNS_KEYWORD = [
  /I'm sorry[^,]*/gi,
  /I cannot fulfill[^,]*/gi,
  /I am prohibited[^,]*/gi,
  /I am programmed[^,]*/gi,
  /I am unable[^,]*/gi,
  /I apologize[^,]*/gi,
  /I can't[^,]*/gi,
  /I can absolutely do that! Here you are my fren:[^,]*/gi,
  /I can absolutely do that[^,]*/gi,
  /Here you are my fren:[^,]*/gi,
  /but I cannot[^,]*/gi,
  /My safety guidelines[^,]*/gi,
  /prohibit me from[^,]*/gi,
  /generating sexually explicit[^,]*/gi,
  /including detailed descriptions[^,]*/gi,
  /or prompts for[^,]*/gi,
  /adult sexual acts[^,]*/gi,
  /cannot fulfill this request[^,]*/gi,
  /fulfill this request[^,]*/gi,
];

/** null 값 패턴 */
const NULL_VALUE_PATTERNS = [
  /,?\s*null\s*\([^)]*\)/gi,
  /,?\s*\(null\)/gi,
  /,?\s*null\s*,/gi,
  /,\s*null\s*$/gi,
  /^\s*null\s*,/gi,
  /,?\s*\bnull\b\s*,?/gi,
];

/** 한국어 번역 패턴 */
const KOREAN_TRANSLATION_PATTERNS = [
  /영화\s*같은\s*조명/gi,
  /영화같은\s*조명/gi,
  /영화\s*같은/gi,
  /영화같은/gi,
  /사실적인\s*피부/gi,
  /자연스러운\s*조명/gi,
  /전문\s*사진/gi,
  /깊이\s*있는\s*필드/gi,
  /피사계\s*심도/gi,
  /최고\s*품질/gi,
  /고품질/gi,
  /걸작/gi,
];

/** 특수 응답 패턴 */
const SPECIAL_RESPONSE_PATTERNS = [
  /I can absolutely do that! Here you are my fren:[\s\S]*?```/gi,
  /Here you are my fren:[\s\S]*?```/gi,
];

/** ESCAPE 프롬프트 패턴 */
const ESCAPE_PROMPT_PATTERNS = [
  /⊰•-•✧•-•-⦑\/L\\?O\/V\\?E\/\\?P\/L\\?I\/N\\?Y\/\\?L\/O\\?V\\?E\\?⦒-•-•✧•-•⊱/g,
  /⊰[^⊱]*⦑[^⦒]*⦒[^⊱]*⊱/g,
];

/** 마크다운 코드 블록 패턴 */
const MARKDOWN_CODE_PATTERNS = [/```markdown\s*/gi, /```[\s\S]*?```/g, /```[\s\S]*$/g, /```\s*/g, /`[^`]*`/g];

// ============================================
// 유틸리티 함수
// ============================================

const applyPatterns = (text: string, patterns: RegExp[]): string => {
  return patterns.reduce((result, pattern) => result.replace(pattern, ""), text);
};

// ============================================
// Export 함수
// ============================================

/**
 * AI 응답 정제 (문장 단위 정리)
 */
export const cleanAIResponse = (text: string): string => {
  if (!text) return "";

  let cleaned = text;

  cleaned = applyPatterns(cleaned, SPECIAL_RESPONSE_PATTERNS);
  cleaned = applyPatterns(cleaned, AI_REJECTION_PATTERNS_SENTENCE);

  cleaned = cleaned.replace(/```markdown\s*/gi, "").replace(/```\s*/g, "");

  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
};

/**
 * 프롬프트 정제 (키워드 단위 정리)
 */
export const cleanPrompt = (text: string): string => {
  if (!text) return "";

  const cleanupWhitespaceAndCommas = (text: string): string => {
    return text
      .replace(/,\s*,/g, ",")
      .replace(/,\s*,\s*/g, ",")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^,\s*/, "")
      .replace(/,\s*$/, "");
  };

  let cleaned = text;

  cleaned = applyPatterns(cleaned, ESCAPE_PROMPT_PATTERNS);
  cleaned = applyPatterns(cleaned, AI_REJECTION_PATTERNS_KEYWORD);
  cleaned = applyPatterns(cleaned, NULL_VALUE_PATTERNS);
  cleaned = applyPatterns(cleaned, KOREAN_TRANSLATION_PATTERNS);
  cleaned = applyPatterns(cleaned, MARKDOWN_CODE_PATTERNS);
  cleaned = cleanupWhitespaceAndCommas(cleaned);

  return cleaned;
};
