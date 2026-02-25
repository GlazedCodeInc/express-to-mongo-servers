/**
 * AI 응답에서 불필요한 마크다운/특수문자를 정리합니다.
 */
export function cleanAIResponse(content: string): string {
    return content.trim()
}

/**
 * 프롬프트 문자열을 정리합니다. (줄바꿈 → 공백, 연속 공백 제거)
 */
export function cleanPrompt(text: string): string {
    if (!text) return ''
    return text
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}
