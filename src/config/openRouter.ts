interface AskAIOptions {
    model?: string
    systemPrompt?: string
    temperature?: number
    maxTokens?: number
}

interface AskAIResult {
    success: boolean
    content: string
    error?: string
}

export async function askAI(userPrompt: string, options: AskAIOptions = {}): Promise<AskAIResult> {
    const { model = 'google/gemini-flash-1.5', systemPrompt, temperature = 0.7, maxTokens = 1000 } = options

    const apiKey = process.env.OPEN_ROUTER
    if (!apiKey) {
        return { success: false, content: '', error: 'OPEN_ROUTER API key is not set' }
    }

    try {
        const messages: { role: string; content: string }[] = []
        if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })
        messages.push({ role: 'user', content: userPrompt })

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            return { success: false, content: '', error: errorText }
        }

        const data = (await response.json()) as any
        const content: string = data.choices?.[0]?.message?.content || ''
        return { success: true, content }
    } catch (error: any) {
        return { success: false, content: '', error: error.message }
    }
}
