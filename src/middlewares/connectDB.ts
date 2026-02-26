import mongoose, { Connection, ConnectOptions } from 'mongoose'
import { DB_URLS, DBKey } from './_use'

const CONNECT_OPTIONS: ConnectOptions = {
  bufferCommands: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}

// ─────────────────────────────────────────────────
// DB별 독립 Connection 캐시
// 새 DB는 _use.ts의 DB_URLS에만 추가하면 자동으로 관리됩니다.
// ─────────────────────────────────────────────────
const cache: Partial<Record<DBKey, Connection>> = {}
const pending: Partial<Record<DBKey, Promise<Connection>>> = {}

async function connectDB(dbKey: DBKey = 'default'): Promise<Connection> {
  // 이미 연결된 경우 바로 반환
  const cached = cache[dbKey]
  if (cached?.readyState === 1) return cached

  // 중복 연결 방지 — 같은 DB에 동시 요청이 와도 Promise 하나만 실행
  if (!pending[dbKey]) {
    const envKey = DB_URLS[dbKey]
    const uri = process.env[envKey]
    if (!uri) throw new Error(`환경 변수가 설정되지 않았습니다: ${envKey}`)

    pending[dbKey] = mongoose
      .createConnection(uri, CONNECT_OPTIONS)
      .asPromise()
      .then((conn) => {
        cache[dbKey] = conn
        delete pending[dbKey]
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ [${dbKey}] MongoDB 연결 성공`)
        }
        return conn
      })
      .catch((err) => {
        delete pending[dbKey]
        if (process.env.NODE_ENV === 'development') {
          console.error(`❌ [${dbKey}] MongoDB 연결 실패:`, err)
        }
        throw err
      })
  }

  return pending[dbKey]!
}

export default connectDB
