import { usePagination } from "../../../hooks/usePagination";
import { maskIP } from "../../../utils/getUserIp";
import { normalizeCountryName } from "../../../utils/getUserCountry";
import getCommentModel from "../schemas/comment";

async function handler(req: any, res: any) {
  const { pageId, page } = req.body;

  try {
    const Comment = getCommentModel(req.db);

    const { skip, pageCount } = usePagination({
      page: page || 1,
      itemsCountPerPage: 20,
    });

    const filter = { isDeleted: false, pageId };
    const sortOption = { createdAt: -1 as const };

    const [commentList, totalCount] = await Promise.all([
      Comment.find(filter).sort(sortOption).skip(skip).limit(pageCount).lean(),
      Comment.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / pageCount);
    const currentPage = Math.floor(skip / pageCount) + 1;

    const maskedComments = commentList.map((comment: any) => {
      return {
        ...comment,
        userIp: maskIP(comment.userIp || ""),
        country: comment.country
          ? { ...comment.country, countryKoreanName: normalizeCountryName(comment.country.countryKoreanName) }
          : comment.country,
      };
    });

    res.status(200).json({
      success: true,
      message: "성공",
      data: maskedComments ?? [],
      pagination: {
        currentPage,
        totalPages,
        totalCount,
        pageCount,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
      },
    });
  } catch (error: any) {
    console.error("댓글 목록 조회 실패:", error);
    res.status(500).json({ success: false, error: "댓글 목록을 불러오는데 실패했습니다." });
  }
}

export default handler;
