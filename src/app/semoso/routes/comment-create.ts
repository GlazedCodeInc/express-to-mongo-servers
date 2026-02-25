import Comment from '@/_schemas/semoso/comment'
import Ssul from '@/_schemas/semoso/ssul'
import { getUserCountry } from '@/utils/getUserCountry'
import { getUserIP } from '@/utils/getUserIp'

async function handler(req: any, res: any) {
    const { type, menu, value, pageId } = req.body

    if (!pageId) {
        return res.status(400).json({
            success: false,
            message: 'pageId가 필요합니다.',
        })
    }

    if (req.method === 'POST') {
        try {
            const userIp = await getUserIP(req)
            const country = await getUserCountry(req)

            const comment = await Comment.create({
                type: type ?? 'comment',
                menu,
                text: value, // 스키마의 text 필드에 맞춤
                isGuest: true,
                userIp,
                country,
                pageId,
            })

            if (!pageId.match(/^[0-9a-fA-F]{24}$/)) {
                console.warn('⚠️ 유효하지 않은 pageId:', pageId)
            } else {
                await Ssul.findByIdAndUpdate(pageId, {
                    $inc: { commentCount: 1 },
                })
            }

            res.status(200).send({
                success: true,
                message: '댓글이 성공적으로 작성되었습니다.',
                comment,
            })
        } catch (error: any) {
            res.status(500).send(error)
            console.log(error)
        }
    }
}

export default handler
