import { Router } from 'express'
import connectDB from './connectDB'
import { DBKey } from './_use'

type RouterSetup = (router: Router) => void

export default function getRouters(dbKey: DBKey, setup: RouterSetup) {
  const router = Router()

  // DB 연결 후 Connection을 req.db에 첨부 — 라우트 핸들러에서 모델 바인딩에 사용
  router.use(async (req: any, _res, next) => {
    req.db = await connectDB(dbKey)
    next()
  })

  setup(router)
  return router
}
