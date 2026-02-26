# 프로젝트 코딩 규칙

## 1. 코드 작성 스타일
- 초보자도 쉽게 이해할 수 있는 클린코드 및 가독성 좋은 코드를 최우선으로 한다.
- 반복되는 기능 및 코드는 재사용 가능한 함수 형태로 분리하고, 구조분해로 가독성 있게 관리한다.

## 2. 수정 원칙
- 요청하지 않은 코드 변경은 반드시 이유를 설명하고 사용자에게 먼저 확인한다.
- `src/config/openRouter.ts`의 `BASE_MODEL`, `ESCAPE_PROMPT`는 절대 수정하지 않는다.
- `src/config/openRouter.ts` 전체는 사용자가 직접 수정을 요청하지 않는 한 수정하지 않는다.
- `src/config/googlePlace.ts` 전체는 사용자가 직접 수정을 요청하지 않는 한 수정하지 않는다.

## 3. API 설계
- 모든 CRUD 서버 코드는 POST 방식으로 작성한다.
- 라우트 핸들러 내부에서 `req.method` 체크 금지 — `router.post()` 등록으로 이미 메서드가 보장된다.
- 라우트 핸들러는 `try/catch`로 감싸고, catch 블록에서 `error.message`나 에러 객체를 응답에 직접 포함하지 않는다.
  - 올바른 형식: `res.status(500).json({ success: false, error: '고정 문자열' })`
  - 금지: `res.status(500).send(error)`, `res.json({ error: error.message })`

## 4. DB 설계 우선순위
MongoDB / Mongoose 설계 시 아래 순서를 반드시 지킨다:
1. 호출 누수 방지 (불필요한 쿼리 최소화)
2. 비용 누수 방지 (인덱스 최적화, 과도한 read/write 방지)
3. 성능 개선 (lean(), select(), 페이지네이션 등 적극 활용)

단, 클린코드 원칙은 위 모든 항목보다 항상 지켜져야 한다.

## 5. 멀티 DB 아키텍처
이 프로젝트는 플랫폼별 독립 MongoDB 연결을 사용한다. 반드시 아래 패턴을 따른다.

### DB 추가 방법
새 DB가 필요할 때 `src/middlewares/_use.ts`의 `DB_URLS`에만 키를 추가한다. 다른 파일은 수정 불필요.
```typescript
export const DB_URLS = {
  default: 'MONGODB_ALLINAPP',
  semoso:  'MONGODB_SEMOSO',
  // 여기에만 추가
}
```

### 스키마 팩토리 패턴 (필수)
스키마는 반드시 `conn: Connection`을 받는 팩토리 함수로 작성한다.
`mongoose.model()` 직접 사용 금지.
```typescript
// 올바른 패턴
import { Connection, Model, Schema } from 'mongoose'
export default function getXxxModel(conn: Connection): Model<Types> {
  return (conn.models['Xxx'] as Model<Types>) ?? conn.model<Types>('Xxx', XxxSchema)
}

// 금지
const Xxx = mongoose.model('Xxx', XxxSchema) // ← race condition 유발
```

### 라우터/핸들러 패턴
- 라우터 생성: `getRouters(dbKey, setup)` 사용
- 핸들러에서 DB 접근: `req.db`로 Connection 사용 후 팩토리 함수로 모델 획득
```typescript
// use.ts
export default getRouters('semoso', (router) => {
  router.post('/comments', commentsHandler)
})

// handler 내부
const Comment = getCommentModel(req.db)
```

## 6. 보안 원칙

### ObjectId 검증
DB에서 `findById`, `findByIdAndDelete` 등 호출 전 반드시 검증한다.
```typescript
if (!mongoose.isValidObjectId(id)) {
  return res.status(400).json({ success: false, message: '유효하지 않은 ID 형식입니다.' })
}
```

### NoSQL Sanitize
`mongoSanitize.sanitize()` 결과는 반드시 재할당한다.
```typescript
// 올바른 사용
req.body = mongoSanitize.sanitize(req.body)
req.params = mongoSanitize.sanitize(req.params)

// 버그 — 결과를 버림
mongoSanitize.sanitize(req.body) // ← 무효
```

### DB 저장 전 입력값 검증 순서
ObjectId 유효성 검증 → DB 쿼리 순서를 반드시 지킨다.
DB 저장 후 유효성 오류가 발견되면 데이터 불일치가 발생한다.

## 7. IP / 국가 정보 수집

### 사용 원칙
- IP 추출: 항상 `getUserIP(req)` 사용. `req.ip`를 직접 사용하면 CDN/프록시 환경에서 실제 IP를 놓친다.
- 국가 정보: 항상 `getUserCountry(req)` 사용.
- IPv6-mapped IPv4(`::ffff:x.x.x.x`) 처리: `normalizeIP(ip)` 사용.
- 한국 국가명 정규화(`"대한민국"` → `"한국"`): `normalizeCountryName(name)` 사용.

### 로컬 개발 환경 처리
- 개발 머신(localhost)에서 요청 시 IP는 `generateRandomIP()`로 랜덤 대체된다 (개인 식별 방지).
- 국가는 한국으로 고정 반환된다.
- 컨테이너/LB 사설 IP(10.x, 172.x, 192.168.x)는 로컬로 처리하지 않는다 — CDN 헤더에서 실제 IP를 추출한다.

### 외부 API 캐싱
반복 호출되는 외부 API (ip-api.com 등)는 TTL 기반 메모리 캐시를 적용한다.
동일 IP는 1시간 동안 재호출하지 않는다.

## 8. 공통 유틸리티 위치
아래 유틸리티는 이미 구현되어 있으므로 중복 구현 금지.

| 함수 | 파일 | 용도 |
|------|------|------|
| `getUserIP(req)` | `src/utils/getUserIp.ts` | CDN/프록시 환경 포함 실제 클라이언트 IP 추출 |
| `getUserCountry(req)` | `src/utils/getUserCountry.ts` | IP 기반 국가 정보 조회 (캐시 포함) |
| `getCountryFromIP(ip)` | `src/utils/getUserCountry.ts` | IP 문자열로 국가 정보 직접 조회 |
| `normalizeIP(ip)` | `src/utils/getUserIp.ts` | `::ffff:x.x.x.x` → IPv4 정규화 |
| `isLocalIP(ip)` | `src/utils/getUserIp.ts` | 사설/로컬 IP 여부 확인 |
| `maskIP(ip)` | `src/utils/getUserIp.ts` | IP 마스킹 (응답에 노출 시 사용) |
| `normalizeCountryName(name)` | `src/utils/getUserCountry.ts` | `"대한민국"` → `"한국"` 정규화 |
| `generateGuestUserHash(ip, ua)` | `src/utils/getUserIp.ts` | 비회원 식별 해시 생성 |
| `usePagination(params)` | `src/hooks/usePagination.ts` | 페이지네이션 skip/pageCount 계산 |
