import getCommentsModel from "../schemas/comments";
import { usePagination } from "@/hooks/usePagination";
import { maskIP } from "@/utils/getUserIp";
import { normalizeCountryName } from "@/utils/getUserCountry";

async function handler(req: any, res: any) {
  try {
    const Comments = getCommentsModel(req.db);
    const { page = 1, limit } = req.body;

    const itemsPerPage = limit || 10;
    const { skip, pageCount } = usePagination({
      page,
      itemsCountPerPage: itemsPerPage,
    });

    const [comments, totalCount] = await Promise.all([
      Comments.find()
        .select({
          text: 1,
          imageUrls: 1,
          country: 1,
          prompt: 1,
          createdAt: 1,
          updatedAt: 1,
          userIP: 1,
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageCount)
        .lean()
        .exec(),
      Comments.countDocuments(),
    ]);

    const maskedComments = comments.map((comment) => {
      const country = comment.country as { countryKoreanName?: string } | undefined;

      return {
        ...comment,
        userIP: maskIP(comment.userIP || ""),
        country: country
          ? { ...country, countryKoreanName: normalizeCountryName(country.countryKoreanName) }
          : country,
      };
    });

    const totalPages = Math.ceil(totalCount / pageCount);
    const currentPage = Number(page);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    res.status(200).json({
      success: true,
      message: "댓글 목록 조회 성공",
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
    });
  } catch (error: any) {
    console.error("댓글 목록 조회 실패:", error);
    res.status(500).json({
      success: false,
      error: "댓글 목록을 불러오는데 실패했습니다.",
    });
  }
}

export default handler;
