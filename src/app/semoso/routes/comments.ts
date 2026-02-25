import Comment from '@/_schemas/semoso/comment'
import { usePagination } from '@/hooks/usePagination'
import { maskIP } from '@/utils/getUserIp'

async function handler(req: any, res: any) {
    const { pageId, page } = req.body

    if (req.method === 'POST') {
        try {
            const { skip, pageCount } = usePagination({
                page: page || 1,
                itemsCountPerPage: 20,
            })

            // 필터 조건 (기본값: 삭제되지 않은 해당 페이지의 댓글)
            const filter: any = { isDeleted: false, pageId }

            // 정렬 조건 (기본값: 최신순)
            const sortOption: any = { createdAt: -1 }

            // 데이터 조회 + 전체 개수
            const [commentList, totalCount] = await Promise.all([
                Comment.find(filter).sort(sortOption).skip(skip).limit(pageCount).lean(),
                Comment.countDocuments(filter),
            ])

            // 페이지네이션 정보 계산
            const totalPages = Math.ceil(totalCount / pageCount)
            const currentPage = Math.floor(skip / pageCount) + 1

            const maskedComments = commentList.map((comment: any) => {
                const countryName = comment.country?.countryKoreanName
                const normalizedCountry = countryName === '대한민국' || countryName === '한국' ? '한국' : countryName

                return {
                    ...comment,
                    userIp: maskIP(comment.userIp || ''),
                    country: comment.country
                        ? { ...comment.country, countryKoreanName: normalizedCountry }
                        : comment.country,
                }
            })

            res.status(200).send({
                success: true,
                message: '성공',
                data: maskedComments ?? [],
                pagination: {
                    currentPage,
                    totalPages,
                    totalCount,
                    pageCount,
                    hasNext: currentPage < totalPages,
                    hasPrev: currentPage > 1,
                },
            })
        } catch (error: any) {
            res.status(500).send(error)
            console.log(error)
        }
    }
}

export default handler
