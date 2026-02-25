import { Router } from "express";
import connectDB from "./connectDB";
import { DBKey } from "./_use";

type RouterSetup = (router: Router) => void;

export default function getRouters(dbKey: DBKey, setup: RouterSetup) {
  const router = Router();

  // DB 연결 — 이 라우터의 모든 요청에 자동 적용
  router.use(async (_req, _res, next) => {
    await connectDB(dbKey);
    next();
  });

  // 라우트 등록
  setup(router);

  return router;
}
