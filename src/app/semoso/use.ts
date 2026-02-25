import getRouters from "@/middlewares/routers";
import commentCreateHandler from "./routes/comment-create";
import commentRemoveHandler from "./routes/comment-remove";
import commentsHandler from "./routes/comments";

export default getRouters("semoso", (router) => {
  router.post("/comments", commentsHandler);
  router.post("/comment-create", commentCreateHandler);
  router.post("/comment-remove", commentRemoveHandler);
});
