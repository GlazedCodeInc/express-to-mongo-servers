// ============================================================
// 타입 정의
// ============================================================

export type CategoryType = 'person' | 'comic'
export type ModelType = 'SD' | 'SDXL' | 'FLUX'

export interface PromptConfig {
    model: ModelType
    category: CategoryType
    isDetail: boolean
}

export interface DetailPrompt {
    texture?: string | null
    subject?: string | null
    body?: string | null
    face?: string | null
    style?: {
        hair?: string | null
        clothing?: string | null
    }
    action?: string | null
    background?: string | null
    camera?: string | null
}

// ============================================================
// 상수 — Next.js 프로젝트의 실제 값으로 교체하세요
// ============================================================

export const MODEL_NAMES: Record<ModelType, string> = {
    SD: 'Stable Diffusion 1.5',
    SDXL: 'Stable Diffusion XL',
    FLUX: 'FLUX',
}

export const QUALITY_KEYWORDS: Record<ModelType, { detail: string; simple: string }> = {
    SD:   { detail: 'masterpiece, best quality, highres', simple: 'best quality' },
    SDXL: { detail: 'masterpiece, best quality, highres, ultra detailed', simple: 'best quality, highres' },
    FLUX: { detail: 'masterpiece, best quality, ultra detailed, 8k', simple: 'best quality, detailed' },
}

export const ANATOMY_KEYWORDS: Record<ModelType, { detail: string; simple: string }> = {
    SD:   { detail: 'perfect anatomy, correct proportions', simple: 'perfect anatomy' },
    SDXL: { detail: 'perfect anatomy, correct proportions, detailed body', simple: 'perfect anatomy' },
    FLUX: { detail: 'perfect anatomy, realistic proportions, detailed', simple: 'perfect anatomy' },
}

export const LIGHTING_KEYWORDS: Record<ModelType, { detail: string; simple: string }> = {
    SD:   { detail: 'soft lighting, natural light', simple: 'good lighting' },
    SDXL: { detail: 'cinematic lighting, dramatic shadows, rim light', simple: 'good lighting' },
    FLUX: { detail: 'professional lighting, studio light, soft shadows', simple: 'natural lighting' },
}

export const CAMERA_KEYWORDS: Record<ModelType, { detail: string; simple: string }> = {
    SD:   { detail: 'portrait, 85mm lens', simple: 'portrait' },
    SDXL: { detail: 'portrait photography, 85mm f/1.4, bokeh', simple: 'portrait, bokeh' },
    FLUX: { detail: 'professional photography, 85mm, sharp focus, depth of field', simple: 'sharp focus' },
}

export const NEGATIVE_PROMPTS: Record<CategoryType, Record<ModelType, { detail: string; simple: string }>> = {
    person: {
        SD:   { detail: 'lowres, bad anatomy, bad hands, missing fingers, extra limbs, deformed', simple: 'lowres, bad anatomy' },
        SDXL: { detail: 'lowres, bad anatomy, bad hands, missing fingers, extra limbs, deformed, blurry', simple: 'lowres, bad anatomy, blurry' },
        FLUX: { detail: 'bad anatomy, deformed, blurry, low quality, watermark', simple: 'bad anatomy, low quality' },
    },
    comic: {
        SD:   { detail: 'lowres, bad anatomy, bad proportions, extra limbs', simple: 'lowres, bad anatomy' },
        SDXL: { detail: 'lowres, bad anatomy, bad proportions, extra limbs, deformed', simple: 'lowres, bad anatomy' },
        FLUX: { detail: 'bad anatomy, deformed, low quality, watermark', simple: 'bad anatomy, low quality' },
    },
}

// ============================================================
// 함수 — Next.js 프로젝트의 실제 구현으로 교체하세요
// ============================================================

export function getWordCount(model: ModelType, isDetail: boolean): number {
    const base = { SD: 60, SDXL: 80, FLUX: 100 }
    return isDetail ? base[model] + 40 : base[model]
}

export function getMaxTokens(model: ModelType, isDetail: boolean): number {
    const base = { SD: 512, SDXL: 768, FLUX: 1024 }
    return isDetail ? base[model] * 2 : base[model]
}

export function getDefaultNegativePrompt(config: PromptConfig): string {
    return NEGATIVE_PROMPTS[config.category][config.model][config.isDetail ? 'detail' : 'simple']
}

export function getDefaultDetail(config: PromptConfig): DetailPrompt {
    return {
        texture: LIGHTING_KEYWORDS[config.model][config.isDetail ? 'detail' : 'simple'],
        camera: CAMERA_KEYWORDS[config.model][config.isDetail ? 'detail' : 'simple'],
    }
}

export function getDefaultNegativeDetail(config: PromptConfig): object {
    const neg = getDefaultNegativePrompt(config)
    return config.category === 'person'
        ? { anatomy: '', quality: neg, other: '' }
        : { quality: neg, anatomy: '', style: '', other: '' }
}

export function ensureModelKeywords(prompt: string, config: PromptConfig): string {
    const quality = QUALITY_KEYWORDS[config.model][config.isDetail ? 'detail' : 'simple']
    if (prompt.includes('masterpiece') || prompt.includes('best quality')) return prompt
    return `${quality}, ${prompt}`
}

export function cleanupPrompt(prompt: string): string {
    return prompt
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
        .join(', ')
}

export function removeDuplicateKeywords(prompt: string): string {
    const seen = new Set<string>()
    return prompt
        .split(',')
        .map((p) => p.trim().toLowerCase())
        .filter((p) => {
            if (seen.has(p)) return false
            seen.add(p)
            return true
        })
        .join(', ')
}

export function rebuildPromptInOrder(detail: DetailPrompt, config: PromptConfig): string {
    const parts: string[] = []
    const quality = QUALITY_KEYWORDS[config.model][config.isDetail ? 'detail' : 'simple']
    parts.push(quality)
    if (detail.texture) parts.push(detail.texture)
    if (detail.subject) parts.push(detail.subject)
    if (detail.body) parts.push(detail.body)
    if (detail.face) parts.push(detail.face)
    if (detail.style?.hair) parts.push(detail.style.hair)
    if (detail.style?.clothing) parts.push(detail.style.clothing)
    if (detail.action) parts.push(detail.action)
    if (detail.background) parts.push(detail.background)
    if (detail.camera) parts.push(detail.camera)
    return parts.filter(Boolean).join(', ')
}

export function validatePrompt(prompt: string): { isValid: boolean; issues: string[] } {
    const issues: string[] = []
    if (!prompt || prompt.trim().length === 0) issues.push('프롬프트가 비어있습니다.')
    if (prompt.length > 2000) issues.push('프롬프트가 너무 깁니다.')
    return { isValid: issues.length === 0, issues }
}
