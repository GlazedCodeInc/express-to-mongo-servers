import getRouters from "@/middlewares/routers";
import createCommentHandler from "./routes/create-comment";
import getAllCommentsHandler from "./routes/getAll-comments";
import postHandler from "./routes/post";
import removeCommentHandler from "./routes/remove-comment";

export default getRouters("default", (router) => {
  router.post("/post", postHandler);
  router.post("/create-comment", createCommentHandler);
  router.post("/getAll-comments", getAllCommentsHandler);
  router.post("/remove-comment", removeCommentHandler);
});
