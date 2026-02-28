import dotenv from "dotenv";
import express, { Express, NextFunction, Request, Response } from "express";
import promptGenerate from "./app/prompt-generate";
import semoso from "./app/semoso";
import { security } from "./middlewares/security";

// 환경변수 로드 (가장 먼저 실행)
dotenv.config();

const app: Express = express();
const PORT = 5000;

// CDN/프록시(Cloudflare, nginx) 뒤에서 실제 클라이언트 IP 신뢰
// rate-limit이 CDN IP가 아닌 실제 사용자 IP별로 동작하려면 필수
app.set("trust proxy", 1);

// ─────────────────────────────────────────────────
// 보안 미들웨어 (순서 중요)
// ─────────────────────────────────────────────────
app.use(security.headers); // 1. 보안 헤더 (XSS, clickjacking 방지)
app.use(security.cors); // 2. CORS (허용된 도메인만 접근)
app.use(security.rateLimit); // 3. Rate Limiting (과도한 요청 차단)
app.use(express.json({ limit: "10kb" })); // 4. JSON 파싱 + 크기 제한
app.use(express.urlencoded({ extended: true, limit: "10kb" })); // 5. 폼 데이터 파싱 + 크기 제한
app.use(security.noSqlSanitize); // 6. NoSQL 인젝션 방지
app.use(security.parameterPollution); // 7. HTTP 파라미터 오염 방지

// ─────────────────────────────────────────────────
// 상태 확인
// ─────────────────────────────────────────────────
app.get("/", (_req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ko">
      <head>
        <meta charset="UTF-8" />
        <title>서버 상태</title>
        <style>
          body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f4f8; font-family: sans-serif; }
          .card { background: white; border-radius: 12px; padding: 48px 64px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .dot { width: 16px; height: 16px; background: #22c55e; border-radius: 50%; display: inline-block; margin-right: 8px; animation: pulse 1.5s infinite; }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
         
        </style>
      </head>
      <body>
        <div class="card">
          <span class="dot"></span>
      
        </div>
      </body>
    </html>
  `);
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─────────────────────────────────────────────────
// 플랫폼 라우트
// ─────────────────────────────────────────────────
app.use("/semoso", semoso);
app.use("/prompt-generate", promptGenerate);

// ─────────────────────────────────────────────────
// 404 핸들러 — 등록되지 않은 경로
// ─────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "요청한 경로를 찾을 수 없습니다." });
});

// ─────────────────────────────────────────────────
// 전역 에러 핸들러 — 미들웨어/라우트에서 전파된 에러 처리
// ─────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[Server Error]", err.message);
  res.status(500).json({ success: false, error: "서버 오류가 발생했습니다." });
});

// Vercel 서버리스 환경에서는 listen() 불필요 — export default app으로 요청 처리
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;
