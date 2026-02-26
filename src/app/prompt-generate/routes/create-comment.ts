import getCommentsModel from "../schemas/comments";
import { getUserCountry } from "@/utils/getUserCountry";
import { getUserIP } from "@/utils/getUserIp";

async function handler(req: any, res: any) {
  const { text, imageUrls, prompt } = req.body;

  try {
    const Comments = getCommentsModel(req.db);
    const userIP = await getUserIP(req);
    const country = await getUserCountry(req);
    const comment = await Comments.create({ userIP, text, imageUrls, country, prompt });
    res.status(200).json({ success: true, message: "성공", results: comment });
  } catch (error: any) {
    console.error("댓글 생성 실패:", error);
    res.status(500).json({ success: false, error: "댓글 작성에 실패했습니다." });
  }
}

export default handler;
