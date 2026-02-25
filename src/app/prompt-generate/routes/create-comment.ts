import Comments from "@/_schemas/all-in-app/comments";
import { getUserCountry } from "@/utils/getUserCountry";
import { getUserIP } from "@/utils/getUserIp";

async function handler(req: any, res: any) {
  const { text, imageUrls, prompt } = req.body;

  if (req.method === "POST") {
    try {
      const userIP = await getUserIP(req);
      const country = await getUserCountry(req);
      const comment = await Comments.create({ userIP, text, imageUrls, country, prompt });
      res.status(200).send({ success: true, message: "성공", results: comment });
    } catch (error: any) {
      res.status(500).send(error);
      console.log(error);
    }
  }
}

export default handler;
