import { askAI } from '@/config/openRouter'
import { cleanAIResponse } from '@/config/prompts'

// ============================================
// 시스템 프롬프트 생성 함수 — 직접 작성
// ============================================

const buildSystemPrompt = (): string => {
    return ``
}

// ============================================
// 유저 프롬프트 생성 함수 — 직접 작성
// ============================================

const buildUserPrompt = (prompt: string): string => {
    return `${prompt}`
}

// ============================================
// 메인 핸들러
// ============================================

async function handler(req: any, res: any) {
    try {
        const { prompt } = req.body

        if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
            return res.status(400).json({ success: false, error: '유효한 프롬프트를 입력해주세요.' })
        }

        const aiResponse = await askAI(buildUserPrompt(prompt), {
            systemPrompt: buildSystemPrompt(),
        })

        if (!aiResponse.success) {
            return res.status(500).json({
                success: false,
                error: aiResponse.error || 'AI 프롬프트 생성 실패',
            })
        }

        const content = cleanAIResponse(aiResponse.content)

        return res.status(200).json({
            success: true,
            data: {
                original: prompt,
                content,
            },
        })
    } catch (error: any) {
        console.error('API Error:', error)
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
        })
    }
}

export default handler
