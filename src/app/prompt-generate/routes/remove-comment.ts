import mongoose from "mongoose";
import getCommentsModel from "../schemas/comments";

async function handler(req: any, res: any) {
  try {
    const { commentId } = req.body;

    if (!commentId) {
      return res.status(400).json({
        success: false,
        message: "댓글 ID가 필요합니다.",
      });
    }

    if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).json({
        success: false,
        message: "유효하지 않은 댓글 ID 형식입니다.",
      });
    }

    const Comments = getCommentsModel(req.db);
    const deleted = await Comments.findByIdAndDelete(commentId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "해당 댓글을 찾을 수 없습니다.",
      });
    }

    res.status(200).json({
      success: true,
      message: "댓글이 삭제되었습니다.",
    });
  } catch (error: any) {
    console.error("댓글 삭제 실패:", error);
    res.status(500).json({
      success: false,
      message: "댓글 삭제에 실패했습니다.",
    });
  }
}

export default handler;
