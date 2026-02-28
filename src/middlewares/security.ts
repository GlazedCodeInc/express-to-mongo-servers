import cors, { CorsOptions } from "cors";
import mongoSanitize from "express-mongo-sanitize";
import { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import { ALLOW_CORS_URLS } from "./_use";

// ─────────────────────────────────────────────────
// 1. CORS — 허용된 도메인만 접근 가능
// ─────────────────────────────────────────────────
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const isDev = process.env.NODE_ENV === "development";

    // 서버-서버 요청 (origin 없음) 허용
    if (!origin) return callback(null, true);

    // 허용된 도메인 목록
    if (ALLOW_CORS_URLS.includes(origin)) return callback(null, true);

    // 개발 환경: localhost 전체 허용
    if (isDev && (origin.includes("localhost") || origin.includes("127.0.0.1"))) {
      return callback(null, true);
    }

    callback(new Error("CORS 정책에 의해 차단되었습니다."));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ─────────────────────────────────────────────────
// 2. Rate Limiting — IP당 요청 횟수 제한
//    : 15분 동안 IP당 최대 100회, 초과 시 429 에러
// ─────────────────────────────────────────────────
const rateLimitOptions = {
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "요청이 너무 많습니다. 잠시 후 다시 시도하세요." },
};

// ─────────────────────────────────────────────────
// 보안 미들웨어 모음 (index.ts에서 순서대로 적용)
// ─────────────────────────────────────────────────
export const security = {
  /** HTTP 보안 헤더 설정 (XSS, clickjacking 등 방지) */
  headers: helmet({ contentSecurityPolicy: false }),

  /** CORS — 허용된 도메인만 응답 */
  cors: cors(corsOptions),

  /** Rate Limiting — 과도한 요청 차단 */
  rateLimit: rateLimit(rateLimitOptions),

  /** NoSQL 인젝션 방지 — $, . 문자 제거
   *  Express 5에서 req.query는 getter-only라 mongoSanitize() 직접 사용 불가
   *  body, params만 sanitize하는 커스텀 미들웨어로 대체 */
  noSqlSanitize: (req: Request, _res: Response, next: NextFunction) => {
    if (req.body) req.body = mongoSanitize.sanitize(req.body)
    if (req.params) req.params = mongoSanitize.sanitize(req.params)
    next()
  },

  /** HTTP 파라미터 오염 방지 */
  parameterPollution: hpp(),
};
