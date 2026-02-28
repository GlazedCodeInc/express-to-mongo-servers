import { getUserCountry } from "../../../utils/getUserCountry";
import { getUserIP } from "../../../utils/getUserIp";
import mongoose from "mongoose";
import getCommentModel from "../schemas/comment";
import getSsulModel from "../schemas/ssul";

async function handler(req: any, res: any) {
  const { type, menu, value, pageId } = req.body;

  if (!pageId) {
    return res.status(400).json({
      success: false,
      message: "pageId가 필요합니다.",
    });
  }

  if (!mongoose.isValidObjectId(pageId)) {
    return res.status(400).json({
      success: false,
      message: "유효하지 않은 pageId 형식입니다.",
    });
  }

  try {
    const Comment = getCommentModel(req.db);
    const Ssul = getSsulModel(req.db);

    const userIp = await getUserIP(req);
    const country = await getUserCountry(req);

    const comment = await Comment.create({
      type: type ?? "comment",
      menu,
      text: value, // 스키마의 text 필드에 맞춤
      isGuest: true,
      userIp,
      country,
      pageId,
    });

    // pageId 유효성은 위에서 검증 완료 — 항상 실행
    await Ssul.findByIdAndUpdate(pageId, {
      $inc: { commentCount: 1 },
    });

    res.status(200).json({
      success: true,
      message: "댓글이 성공적으로 작성되었습니다.",
      comment,
    });
  } catch (error: any) {
    console.error("댓글 생성 실패:", error);
    res.status(500).json({ success: false, error: "댓글 작성에 실패했습니다." });
  }
}

export default handler;
