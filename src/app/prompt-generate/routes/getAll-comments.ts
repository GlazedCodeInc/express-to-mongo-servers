import Comments from '@/_schemas/all-in-app/comments'
import { usePagination } from '@/hooks/usePagination'
import { maskIP } from '@/utils/getUserIp'

async function handler(req: any, res: any) {
    if (req.method === 'POST') {
        try {
            const { page = 1, limit } = req.body

            // 페이지네이션 설정
            const itemsPerPage = limit || 10
            const { skip, pageCount } = usePagination({
                page,
                itemsCountPerPage: itemsPerPage,
            })

            // 병렬 처리로 성능 향상: 댓글 조회 + 전체 개수 조회
            const [comments, totalCount] = await Promise.all([
                // 페이지네이션 적용된 댓글 조회
                Comments.find()
                    .select({
                        // 필요한 필드만 선택 (성능 최적화)
                        text: 1,
                        imageUrls: 1,
                        country: 1,
                        prompt: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        userIP: 1, // IP는 마스킹 처리 예정
                    })
                    .sort({ createdAt: -1 }) // 최신순 정렬
                    .skip(skip) // 페이지네이션: 건너뛸 개수
                    .limit(pageCount) // 페이지네이션: 가져올 개수
                    .lean() // 성능 향상: plain JavaScript 객체 반환
                    .exec(),

                // 전체 댓글 개수 조회 (페이지 정보 계산용)
                Comments.countDocuments(),
            ])

            // IP 마스킹 처리 (개인정보 보호) + 국가명 정규화
            const maskedComments = comments.map((comment) => {
                const country = comment.country as { countryKoreanName?: string } | undefined
                const normalizedCountryName =
                    country?.countryKoreanName === '대한민국' || country?.countryKoreanName === '한국'
                        ? '한국'
                        : country?.countryKoreanName

                return {
                    ...comment,
                    userIP: maskIP(comment.userIP || ''),
                    country: country ? { ...country, countryKoreanName: normalizedCountryName } : country,
                }
            })

            // 페이지네이션 메타데이터 계산
            const totalPages = Math.ceil(totalCount / pageCount)
            const currentPage = Number(page)
            const hasNextPage = currentPage < totalPages
            const hasPrevPage = currentPage > 1

            // 응답 데이터 구성
            res.status(200).json({
                success: true,
                message: '댓글 목록 조회 성공',
                results: maskedComments,
                pagination: {
                    currentPage,
                    totalPages,
                    totalCount,
                    itemsPerPage: pageCount,
                    hasNextPage,
                    hasPrevPage,
                    nextPage: hasNextPage ? currentPage + 1 : null,
                    prevPage: hasPrevPage ? currentPage - 1 : null,
                },
            })
        } catch (error: any) {
            console.error('댓글 목록 조회 실패:', error)
            res.status(500).json({
                success: false,
                error: '댓글 목록을 불러오는데 실패했습니다.',
                message: error.message,
            })
        }
    } else {
        // 잘못된 HTTP 메서드
        res.status(405).json({
            success: false,
            error: 'Method Not Allowed',
            message: 'POST 메서드만 허용됩니다.',
        })
    }
}

export default handler
