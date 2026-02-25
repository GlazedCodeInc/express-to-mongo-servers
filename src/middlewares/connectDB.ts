import mongoose, { ConnectOptions } from "mongoose";
import { DB_URLS, DBKey } from "./_use";

const CONNECT_OPTIONS: ConnectOptions = {
  bufferCommands: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// mongoose v8에서 ConnectionStates enum 제거됨 → 숫자 상수로 대체
const RS = { disconnected: 0, connected: 1, connecting: 2, disconnecting: 3 } as const;

interface CacheEntry {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

interface GlobalCache {
  mongooseCache?: Record<string, CacheEntry>;
  currentConnection?: string | null;
}

const globalCache = global as typeof global & GlobalCache;

if (!globalCache.mongooseCache) globalCache.mongooseCache = {};
if (typeof globalCache.currentConnection === "undefined") globalCache.currentConnection = null;

const cached: Record<string, CacheEntry> = globalCache.mongooseCache;

function getDBUrl(dbKey: DBKey): string {
  const envKey = DB_URLS[dbKey as keyof typeof DB_URLS];
  const url = process.env[envKey];
  if (!url) throw new Error(`환경 변수가 설정되지 않았습니다: ${envKey}`);
  return url;
}

const getReadyState = (): number => mongoose.connection.readyState;
const waitFor = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

function resetAllCacheEntries(): void {
  Object.keys(cached).forEach((key) => {
    cached[key].conn = null;
    cached[key].promise = null;
  });
}

async function ensureDisconnected(): Promise<void> {
  if (getReadyState() === RS.disconnected) return;

  try {
    await mongoose.disconnect();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(`[${globalCache.currentConnection ?? "Unknown"}] 연결 해제 오류:`, error);
    }
  }

  while (getReadyState() !== RS.disconnected) {
    await waitFor(50);
  }
}

async function connectDB(dbKey: DBKey = "default"): Promise<typeof mongoose> {
  if (!cached[dbKey]) {
    cached[dbKey] = { conn: null, promise: null };
  }

  if (cached[dbKey].conn && getReadyState() === RS.connected && globalCache.currentConnection === dbKey) {
    return cached[dbKey].conn as typeof mongoose;
  }

  const currentKey = globalCache.currentConnection;
  if (currentKey && currentKey !== dbKey) {
    const previousEntry = cached[currentKey];
    if (previousEntry?.promise) {
      try {
        await previousEntry.promise;
      } catch {
        // Ignore previous connection failures
      }
    }

    await ensureDisconnected();
    globalCache.currentConnection = null;
    resetAllCacheEntries();
  }

  if (getReadyState() === RS.connecting || getReadyState() === RS.disconnecting) {
    while (getReadyState() === RS.connecting || getReadyState() === RS.disconnecting) {
      await waitFor(50);
    }

    if (getReadyState() === RS.connected && globalCache.currentConnection !== dbKey) {
      await ensureDisconnected();
      globalCache.currentConnection = null;
      resetAllCacheEntries();
    }
  }

  if (cached[dbKey].conn && getReadyState() === RS.connected && globalCache.currentConnection === dbKey) {
    return cached[dbKey].conn as typeof mongoose;
  }

  if (!cached[dbKey].promise) {
    const uri = getDBUrl(dbKey);
    cached[dbKey].promise = mongoose
      .connect(uri, CONNECT_OPTIONS)
      .then((mongooseInstance) => {
        globalCache.currentConnection = dbKey;
        cached[dbKey].conn = mongooseInstance;
        if (process.env.NODE_ENV === "development") {
          console.log(`✅ [${dbKey}] MongoDB 연결 성공`);
        }
        return mongooseInstance;
      })
      .catch((error) => {
        if (process.env.NODE_ENV === "development") {
          console.error(`❌ [${dbKey}] MongoDB 연결 실패:`, error);
        }
        cached[dbKey].promise = null;
        cached[dbKey].conn = null;
        if (globalCache.currentConnection === dbKey) {
          globalCache.currentConnection = null;
        }
        throw error;
      });
  }

  const connectionInstance = await cached[dbKey].promise;
  cached[dbKey].conn = connectionInstance;
  return connectionInstance;
}

export default connectDB;
