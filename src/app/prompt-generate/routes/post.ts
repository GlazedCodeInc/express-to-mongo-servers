import {
    ANATOMY_KEYWORDS,
    CAMERA_KEYWORDS,
    type CategoryType,
    cleanupPrompt,
    type DetailPrompt,
    ensureModelKeywords,
    getDefaultDetail,
    getDefaultNegativeDetail,
    getDefaultNegativePrompt,
    getMaxTokens,
    getWordCount,
    LIGHTING_KEYWORDS,
    MODEL_NAMES,
    type ModelType,
    NEGATIVE_PROMPTS,
    type PromptConfig,
    QUALITY_KEYWORDS,
    rebuildPromptInOrder,
    removeDuplicateKeywords,
    validatePrompt,
} from '@/config/models-type-rule'
import { askAI } from '@/config/openRouter'
import { cleanAIResponse, cleanPrompt } from '@/config/prompts'

// ============================================
// 프롬프트 분석 함수
// ============================================

interface PromptAnalysis {
    words: string[]
    sentences: string[]
    keyElements: {
        subject?: string
        action?: string
        background?: string
        appearance?: string
        clothing?: string
    }
}

const analyzePrompt = (userPrompt: string): PromptAnalysis => {
    const trimmed = userPrompt.trim()
    const sentences = trimmed
        .split(/[.!?。！？]\s*/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    const words = trimmed
        .split(/[\s,，、]+/)
        .map((w) => w.trim())
        .filter((w) => w.length > 0)

    const keyElements: PromptAnalysis['keyElements'] = {}

    const subjectPatterns = /(여성|남성|여자|남자|사람|인물|캐릭터|소녀|소년|아이|아가씨|아저씨)/i
    const subjectMatch = trimmed.match(subjectPatterns)
    if (subjectMatch) keyElements.subject = subjectMatch[0]

    const actionPatterns = /(앉|서|걷|누워|빨|박|넣|싸|오랄|섹스|자위|만지|핥|먹)/i
    const actionMatch = trimmed.match(actionPatterns)
    if (actionMatch) keyElements.action = actionMatch[0]

    const backgroundPatterns = /(침대|방|욕실|모텔|호텔|야외|교실)/i
    const backgroundMatch = trimmed.match(backgroundPatterns)
    if (backgroundMatch) keyElements.background = backgroundMatch[0]

    return { words, sentences, keyElements }
}

// ============================================
// 라인 추출 함수
// ============================================

const extractLine = (pattern: RegExp, text: string): string => {
    const match = text.match(pattern)
    if (!match) return ''
    let extracted = match[1].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()

    return cleanPrompt(extracted)
}

// ============================================
// 시스템 프롬프트 생성 함수
// ============================================

const buildSystemPrompt = (config: PromptConfig): string => {
    const { model, category, isDetail } = config
    const modelName = MODEL_NAMES[model]
    const detailMode = isDetail ? '상세하고 구체적인' : '핵심만 담은 간결한'
    const wordCount = getWordCount(model, isDetail)
    const qualityKeywords = QUALITY_KEYWORDS[model][isDetail ? 'detail' : 'simple']
    const anatomyKeywords = ANATOMY_KEYWORDS[model][isDetail ? 'detail' : 'simple']
    const lightingKeywords = LIGHTING_KEYWORDS[model][isDetail ? 'detail' : 'simple']
    const cameraKeywords = CAMERA_KEYWORDS[model][isDetail ? 'detail' : 'simple']
    const negativePrompt = NEGATIVE_PROMPTS[category][model][isDetail ? 'detail' : 'simple']

    const basePrompt = `

당신은 ${modelName} 이미지 생성 모델을 위한 전문 프롬프트 생성기입니다. ${modelName} 모델에 최적화된 ${detailMode} 프롬프트를 생성합니다.

⚠️【절대 원칙】⚠️
1. 사용자가 명시한 모든 내용은 반드시 영어로 번역하여 포함하세요
2. 신체 묘사(가슴 크기, 엉덩이, 체형 등)가 명시된 경우 반드시 포함하세요:
   - 거대한 가슴/큰 가슴 → huge breasts, large breasts
   - G컵/큰컵 → G-cup breasts, large cup size
   - 넓은 골반/큰 엉덩이 → wide hips, large hips
   - 큰 젖꼭지, 큰 유륜, 넓은 유륜, 유두 → big nipples, large nipples
   - 노출, 옷을 벗은 몸 → naked body, naked figure    
   - 슬림/마른 체형 → slim body, slender figure
   - 글래머/볼륨감 → voluptuous, curvy body
3. 사용자가 명시하지 않은 내용만 추가하지 마세요 (명시된 건 반드시 포함)
4. checkpoint와 LoRA와 호환되도록 기술 키워드만 추가하고, 콘텐츠는 사용자 입력 그대로 반영하세요`

    if (category === 'person') {
        return `${basePrompt}

【${model} 모델 핵심 원칙】
- 프롬프트는 ${wordCount}단어로 ${isDetail ? '상세하게' : '간결하게'} 작성
- ${isDetail ? '구체적인 디테일과 기술적 키워드를 포함' : '핵심 키워드 위주로 포함'}
- 중복/유사 키워드 절대 금지
- ⚠️ 사용자가 명시한 내용만 반영하고, 명시하지 않은 요소는 추가하지 마세요
- ⚠️ 반드시 아래 순서를 지켜야 함

【${model} 모델 최적화 키워드】
- 품질: ${qualityKeywords}
- 해부학: ${anatomyKeywords}
- 조명: ${lightingKeywords}
- 카메라: ${cameraKeywords}

【프롬프트 구조】 (checkpoint/LoRA 호환 최적화)
① 품질/스타일: 기술 키워드 앞부분 배치
② 해부학: 핵심 해부학 키워드
③ 사용자 콘텐츠: 피사체, 행동, 배경을 자연스럽게 묘사
④ 조명/카메라: 기술 키워드 뒷부분 배치

⚠️ 중요: 사용자 콘텐츠는 자연스럽게 연결하여 LoRA가 제어할 수 있는 공간을 남기세요.

【세부 구조 반환】 (명시되지 않은 항목은 생략)
Prompt: [프롬프트]
Texture: [조명]
Subject: [피사체 - 나이, 성별]
Body: [신체 묘사 - 가슴 크기, 엉덩이, 체형 등]
Face: [얼굴]
Hair: [헤어]
Clothing: [복장]
Action: [행동]
Background: [배경]
Camera: [카메라]

【신체 묘사 번역 예시】
- 거대한 가슴, G컵 → huge breasts, G-cup breasts
- 큰 가슴, 볼륨감 → large breasts, voluptuous
- 넓은 골반, 큰 엉덩이 → wide hips, large hips

Negative Prompt: ${negativePrompt}

Anatomy: [해부학 네거티브]
Quality: [품질 네거티브]
Other: [기타 네거티브]`
    }

    // comic
    return `${basePrompt}

【${model} 모델 애니메이션 구조】 (${wordCount}단어)
- 고품질 애니메이션 키워드를 ${isDetail ? '풍부하게 포함' : '핵심만 포함'}
- 사용자가 명시한 요소에 대해서만 ${isDetail ? '상세하게 묘사' : '간결하게 묘사'}
- 중복/유사 키워드 절대 금지

【세부 구조 반환】 (명시되지 않은 항목은 생략)
Prompt: [프롬프트]
Subject: [피사체 - 나이, 성별]
Body: [신체 묘사 - 가슴 크기, 엉덩이, 체형 등]
Face: [얼굴]
Hair: [헤어]
Clothing: [복장]
Action: [행동]
Background: [배경]
Camera: [효과]

【신체 묘사 번역 예시】
- 거대한 가슴 → huge breasts, big boobs
- 넓은 골반 → wide hips

Negative Prompt: ${negativePrompt}

Quality: [품질 네거티브]
Anatomy: [해부학 네거티브]
Style: [스타일 네거티브]
Other: [기타 네거티브]`
}

// ============================================
// 사용자 프롬프트 생성 함수
// ============================================

const buildUserPrompt = (prompt: string, config: PromptConfig, analysis: PromptAnalysis): string => {
    const { model, category, isDetail } = config
    const wordCount = getWordCount(model, isDetail)

    return `

카테고리: ${category}
모델: ${model}
상세 모드: ${isDetail ? '활성화' : '비활성화'}

⚠️【절대 지켜야 할 원칙】⚠️
1. 사용자가 명시하지 않은 내용은 절대 추가하지 마세요
2. 사용자가 요청하지 않은 요소(복장, 헤어, 외모 등)는 생략하세요
3. 사용자 프롬프트의 내용만 정확히 반영하고, 임의로 확장하거나 창의적으로 해석하지 마세요
4. checkpoint와 LoRA와 호환되도록 기술 키워드(품질, 해부학, 조명, 카메라)만 추가하세요
5. 사용자가 명시한 내용에 대해서만 ${isDetail ? '상세하게' : '간결하게'} 묘사하세요

【사용자 프롬프트 분석】
원본 프롬프트: "${prompt}"
분석된 단어 수: ${analysis.words.length}개
분석된 문장 수: ${analysis.sentences.length}개
${analysis.keyElements.subject ? `- 피사체: ${analysis.keyElements.subject}` : ''}
${analysis.keyElements.action ? `- 행동: ${analysis.keyElements.action}` : ''}
${analysis.keyElements.background ? `- 배경: ${analysis.keyElements.background}` : ''}

다음 사용자 프롬프트를 ${model} 모델에 최적화된 ${isDetail ? '상세하고 구체적인' : '핵심 위주의'} 프롬프트로 변환하세요:
"${prompt}"

프롬프트는 ${wordCount}단어로 작성하세요.

반드시 위 형식대로 세부 구조도 함께 반환하세요.`
}

// ============================================
// 메인 핸들러
// ============================================

async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' })
    }

    try {
        const {
            prompt,
            category,
            isDetail = false,
            model = 'FLUX',
        }: {
            prompt: string
            category: CategoryType
            isDetail?: boolean
            model?: ModelType
        } = req.body

        // 입력 검증
        if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
            return res.status(400).json({ success: false, error: '유효한 프롬프트를 입력해주세요.' })
        }

        if (!category || (category !== 'person' && category !== 'comic')) {
            return res.status(400).json({ success: false, error: '카테고리는 person 또는 comic이어야 합니다.' })
        }

        if (model && model !== 'SD' && model !== 'SDXL' && model !== 'FLUX') {
            return res.status(400).json({ success: false, error: '모델은 SD, SDXL, FLUX 중 하나여야 합니다.' })
        }

        // 설정 객체 생성
        const config: PromptConfig = { model, category, isDetail }

        // 프롬프트 분석
        const promptAnalysis = analyzePrompt(prompt)

        // AI 호출
        const systemPrompt = buildSystemPrompt(config)
        const userPrompt = buildUserPrompt(prompt, config, promptAnalysis)
        const maxTokens = getMaxTokens(model, isDetail)

        const aiResponse = await askAI(userPrompt, {
            model: 'google/gemini-3-flash-preview',
            systemPrompt,
            temperature: 0.3,
            maxTokens,
        })

        if (!aiResponse.success) {
            return res.status(500).json({
                success: false,
                error: aiResponse.error || 'AI 프롬프트 생성 실패',
            })
        }

        // AI 응답 정제
        const content = cleanAIResponse(aiResponse.content)

        // 응답에서 각 항목 추출
        const extractedPrompt = extractLine(/Prompt:\s*([\s\S]*?)(?=Texture:|Negative Prompt:|$)/i, content)
        const extractedNegative = extractLine(/Negative Prompt:\s*([\s\S]*?)(?=Anatomy:|$)/i, content)

        const textureMatch = extractLine(/Texture:\s*([\s\S]*?)(?=Subject:|$)/i, content)
        const subjectMatch = extractLine(/Subject:\s*([\s\S]*?)(?=Body:|Face:|$)/i, content)
        const bodyMatch = extractLine(/Body:\s*([\s\S]*?)(?=Face:|$)/i, content)
        const faceMatch = extractLine(/Face:\s*([\s\S]*?)(?=Hair:|$)/i, content)
        const hairMatch = extractLine(/Hair:\s*([\s\S]*?)(?=Clothing:|$)/i, content)
        const clothingMatch = extractLine(/Clothing:\s*([\s\S]*?)(?=Action:|$)/i, content)
        const actionMatch = extractLine(/Action:\s*([\s\S]*?)(?=Background:|$)/i, content)
        const backgroundMatch = extractLine(/Background:\s*([\s\S]*?)(?=Camera:|$)/i, content)
        const cameraMatch = extractLine(/Camera:\s*([\s\S]*?)(?=Negative|$)/i, content)

        const anatomyNegMatch = extractLine(/Anatomy:\s*([\s\S]*?)(?=Quality:|$)/i, content)
        const qualityNegMatch = extractLine(/Quality:\s*([\s\S]*?)(?=Other:|Style:|$)/i, content)
        const otherNegMatch = extractLine(/Other:\s*([\s\S]*?)$/i, content)

        // 프롬프트 생성
        let generatedPrompt = extractedPrompt
            ? ensureModelKeywords(extractedPrompt, config)
            : ensureModelKeywords(prompt, config)

        // 네거티브 프롬프트 설정
        let negativePrompt = extractedNegative || getDefaultNegativePrompt(config)

        if (negativePrompt.split(',').length < (isDetail ? 10 : 5)) {
            negativePrompt = getDefaultNegativePrompt(config)
        }

        // 프롬프트 정리
        generatedPrompt = cleanupPrompt(generatedPrompt)
        negativePrompt = cleanupPrompt(negativePrompt)

        // 디테일 구조 생성
        const defaults = getDefaultDetail(config)

        const detailGeneratedPrompt: DetailPrompt = {
            texture: cleanPrompt(textureMatch) || defaults.texture,
            subject: cleanPrompt(subjectMatch),
            body: cleanPrompt(bodyMatch) || null,
            face: cleanPrompt(faceMatch),
            style: {
                hair: cleanPrompt(hairMatch),
                clothing: cleanPrompt(clothingMatch),
            },
            action: cleanPrompt(actionMatch),
            background: cleanPrompt(backgroundMatch),
            camera: cleanPrompt(cameraMatch) || defaults.camera,
        }

        // 네거티브 디테일 구조 생성
        const negativeDefaults = getDefaultNegativeDetail(config)

        const detailNegativePrompt =
            category === 'person'
                ? {
                      anatomy: cleanPrompt(anatomyNegMatch) || (negativeDefaults as any).anatomy,
                      quality: cleanPrompt(qualityNegMatch) || (negativeDefaults as any).quality,
                      other: cleanPrompt(otherNegMatch) || (negativeDefaults as any).other,
                  }
                : {
                      quality: cleanPrompt(qualityNegMatch) || (negativeDefaults as any).quality,
                      anatomy: cleanPrompt(anatomyNegMatch) || (negativeDefaults as any).anatomy,
                      style: (negativeDefaults as any).style,
                      other: cleanPrompt(otherNegMatch) || (negativeDefaults as any).other,
                  }

        // 최종 프롬프트 생성
        const hasEnoughDetail =
            detailGeneratedPrompt.subject || detailGeneratedPrompt.action || detailGeneratedPrompt.face
        const finalPrompt = hasEnoughDetail
            ? removeDuplicateKeywords(rebuildPromptInOrder(detailGeneratedPrompt, config))
            : generatedPrompt

        const finalRefinedPrompt = cleanPrompt(finalPrompt)

        // 검증
        const validation = validatePrompt(finalRefinedPrompt)

        if (!validation.isValid) {
            console.warn('프롬프트 검증 경고:', validation.issues)
        }

        return res.status(200).json({
            success: true,
            data: {
                category,
                model,
                isDetail,
                original: prompt,
                promptAnalysis: {
                    wordCount: promptAnalysis.words.length,
                    sentenceCount: promptAnalysis.sentences.length,
                    keyElements: promptAnalysis.keyElements,
                },
                generatedPrompt: finalRefinedPrompt,
                negativePrompt,
                detailGeneratedPrompt,
                detailNegativePrompt,
                validation,
                fullResponse: content,
            },
        })
    } catch (error: any) {
        console.error('API Error:', error)
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal Server Error',
        })
    }
}

export default handler
