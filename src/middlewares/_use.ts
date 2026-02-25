// ===================================
// CORS 허용 도메인
// ===================================

export const ALLOW_CORS_URLS = [
  "http://localhost:1111",
  "http://localhost:3333",
  "http://localhost:3000",
  "http://localhost:8089",
  "https://www.all-datingapps.com",
  "https://all-datingapps.com",
];

// ===================================
// MongoDB 데이터베이스 환경변수 키
// ===================================
// 새 DB 추가 시 여기에만 추가하면 됩니다.

export type DBKey = keyof typeof DB_URLS;

export const DB_URLS = {
  default: "MONGODB_ALLINAPP",
  semoso: "MONGODB_SEMOSO",
  madame: "MONGODB_MADAME",
} as const;
