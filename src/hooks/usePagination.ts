//
// 인피니티 스크롤 페이지 토큰 핸들러

type NextPageTokenParams = { data: any; pageToken: number; limit?: number }

export function useNextPageToken({ data, pageToken, limit = 10 }: NextPageTokenParams) {
    const nextPageToken = data.length === limit ? pageToken + limit : -1

    return { nextPageToken }
}

//
// 페이지네이션 핸들러

type PaginationParams = { page?: string | number; itemsCountPerPage?: number }

export function usePagination({ page: pageEl, itemsCountPerPage }: PaginationParams) {
    const payloadPage = typeof pageEl === 'string' ? parseInt(pageEl, 10) : pageEl
    const page = (pageEl && payloadPage) || 1
    const pageCount = Number(itemsCountPerPage) ?? 10 // 페이지 당 사용자 수
    const skip = (page - 1) * pageCount

    return { skip, pageCount }
}
