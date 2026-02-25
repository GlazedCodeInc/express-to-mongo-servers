/**
 * Google Places API 유틸리티
 *
 * 주요 기능:
 * - 주소를 GPS 좌표로 변환 (Geocoding)
 * - 장소 검색 (카페, 레스토랑 등)
 * - 거리 계산
 * - 사진 URL 생성
 */

// ==================== 설정 ====================

/** API 키 가져오기 (환경변수에서) */
const getApiKey = (): string => {
  const key = process.env.GOOGLE_API_KEY;

  if (!key) {
    throw new Error("Google API Key가 설정되지 않았습니다. GOOGLE_API_KEY 환경변수를 확인하세요.");
  }

  return key;
};

/** 기본 검색 설정 */
const DEFAULT_CONFIG = {
  SEARCH_RADIUS_LOCAL: 2000, // 특정 지역 검색 반경 (2km)
  SEARCH_RADIUS_WIDE: 10000, // 전체 지역 검색 반경 (10km)
  MAX_DISTANCE_LOCAL: 3000, // 특정 지역 최대 거리 (3km)
  MAX_DISTANCE_WIDE: 10000, // 전체 지역 최대 거리 (10km)
  MAX_PHOTOS: 5, // 최대 사진 개수
  MAX_REVIEWS: 5, // 최대 리뷰 개수
  PHOTO_WIDTH: 800, // 사진 너비 (픽셀)
} as const;

// ==================== 타입 정의 ====================

/** GPS 좌표 정보 */
export interface Location {
  lat: number;
  lng: number;
  address: string;
}

/** 장소 검색 옵션 */
export interface SearchOptions {
  location: Location;
  city: string;
  district: string;
  keywords?: string[]; // 검색 키워드 배열
  types?: string[]; // 선택 기준
  atmosphere?: string;
  purpose?: string;
  maxResults?: number;
}

/** 리뷰 정보 */
export interface Review {
  author: string;
  rating: number;
  text: string;
  time: string;
}

/** 장소 검색 결과 */
export interface Place {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance: number;
  rating: number;
  reviewCount: number;
  types: string[];
  hours: string[];
  summary: string;
  reviews: Review[];
  shopImages: string[];
  reviewImages: string[];
  mapsUrl: string;
  priceLevel: string;
}

// ==================== 거리 계산 ====================

/**
 * 두 지점 간 거리 계산 (Haversine 공식)
 * @param lat1 지점1 위도
 * @param lon1 지점1 경도
 * @param lat2 지점2 위도
 * @param lon2 지점2 경도
 * @returns 거리 (미터)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const EARTH_RADIUS = 6371e3; // 지구 반경 (미터)

  // 도를 라디안으로 변환
  const toRadian = (degree: number) => (degree * Math.PI) / 180;

  const φ1 = toRadian(lat1);
  const φ2 = toRadian(lat2);
  const Δφ = toRadian(lat2 - lat1);
  const Δλ = toRadian(lon2 - lon1);

  // Haversine 공식
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(EARTH_RADIUS * c);
}

// ==================== Geocoding (주소 → 좌표) ====================

/**
 * 주소를 GPS 좌표로 변환
 * @param city 도시 (예: "서울특별시")
 * @param district 구/군 (예: "강남구") 또는 "전체"
 * @returns GPS 좌표 정보
 */
export async function getLocation(
  city: string,
  district: string
): Promise<Location> {
  const apiKey = getApiKey();

  // "전체" 선택 시 도시만 사용
  const searchAddress = district === "전체" ? city : `${city} ${district}`;

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    searchAddress
  )}&key=${apiKey}&language=ko&region=kr`;

  console.log(`📍 주소 검색: ${searchAddress}`);

  try {
    const response = await fetch(url);
    const data = await response.json() as any;

    // 권한 오류
    if (data.status === "REQUEST_DENIED") {
      throw new Error(
        `API 권한 오류: ${data.error_message || "API 키를 확인하세요"}`
      );
    }

    // 결과 없음
    if (data.status !== "OK" || !data.results?.[0]) {
      throw new Error(`주소를 찾을 수 없습니다: ${searchAddress}`);
    }

    const location = data.results[0].geometry.location;
    console.log(`✅ 좌표 발견: ${location.lat}, ${location.lng}`);

    return {
      lat: location.lat,
      lng: location.lng,
      address: data.results[0].formatted_address,
    };
  } catch (error: any) {
    console.error("❌ Geocoding 실패:", error.message);
    throw error;
  }
}

// ==================== Places Search ====================

/**
 * 검색 키워드 생성 (향상된 버전)
 */
function buildSearchKeywords(
  keywords: string[] = [],
  district: string,
  types: string[] = [],
  atmosphere?: string,
  purpose?: string
): string {
  // keywords가 제공된 경우 우선 사용
  if (keywords.length > 0) {
    return keywords.join(" ");
  }

  // 기본 키워드 생성 로직 (기존 방식)
  const defaultKeywords: string[] = ["카페"];

  // 지역 추가 (전체가 아닐 때만)
  if (district !== "전체") {
    defaultKeywords.push(district);
  }

  // 선택 기준 추가
  if (types.length > 0) {
    defaultKeywords.push(...types);
  }

  // 분위기 추가
  if (atmosphere) {
    defaultKeywords.push(atmosphere);
  }

  // 방문 목적에 따른 키워드
  if (purpose) {
    const purposeKeywords: Record<string, string[]> = {
      데이트: ["데이트하기 좋은", "분위기 좋은"],
      소개팅: ["조용한", "프라이빗한"],
      "단체 미팅": ["넓은", "단체석"],
    };
    defaultKeywords.push(...(purposeKeywords[purpose] || []));
  }

  return defaultKeywords.join(" ");
}

/**
 * 사진 URL 생성
 */
function buildPhotoUrls(photos: any[], maxCount: number = 5): string[] {
  if (!photos?.length) return [];

  const apiKey = getApiKey();
  const urls: string[] = [];

  for (const photo of photos.slice(0, maxCount)) {
    const name = photo.name.startsWith("places/")
      ? photo.name
      : `places/${photo.name}`;
    urls.push(
      `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${DEFAULT_CONFIG.PHOTO_WIDTH}&key=${apiKey}`
    );
  }

  return urls;
}

/**
 * 리뷰 사진 URL 생성
 */
function buildReviewPhotoUrls(reviews: any[], maxCount: number = 5): string[] {
  const apiKey = getApiKey();
  const urls: string[] = [];

  for (const review of reviews) {
    if (urls.length >= maxCount) break;

    const photos = review.photos || [];
    for (const photo of photos) {
      if (urls.length >= maxCount) break;

      const name = photo.name.startsWith("places/")
        ? photo.name
        : `places/${photo.name}`;
      urls.push(
        `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${DEFAULT_CONFIG.PHOTO_WIDTH}&key=${apiKey}`
      );
    }
  }

  return urls;
}

/**
 * 장소가 카페인지 확인
 */
function isCafe(types: string[]): boolean {
  const lowerTypes = types.map((t) => t.toLowerCase());
  return lowerTypes.includes("cafe") || lowerTypes.includes("coffee_shop");
}

/**
 * 장소가 올바른 지역에 있는지 확인
 */
function isInCorrectArea(
  address: string,
  city: string,
  district: string
): boolean {
  if (district === "전체") {
    return address.includes(city);
  }
  return address.includes(district);
}

/**
 * 검색 결과를 Place 객체로 변환
 */
function mapToPlace(
  raw: any,
  userLocation: Location,
  city: string,
  district: string
): Place | null {
  // 거리 계산
  const distance = raw.location
    ? calculateDistance(
        userLocation.lat,
        userLocation.lng,
        raw.location.latitude,
        raw.location.longitude
      )
    : 999999;

  const address = raw.formattedAddress || "";
  const types = raw.types || [];

  // 필터링: 카페가 아니거나 지역이 맞지 않으면 제외
  if (!isCafe(types)) {
    console.log(`⚠️ 제외 (카페 아님): ${raw.displayName?.text}`);
    return null;
  }

  if (!isInCorrectArea(address, city, district)) {
    console.log(`⚠️ 제외 (지역 불일치): ${raw.displayName?.text}`);
    return null;
  }

  // 거리 필터링
  const maxDistance =
    district === "전체"
      ? DEFAULT_CONFIG.MAX_DISTANCE_WIDE
      : DEFAULT_CONFIG.MAX_DISTANCE_LOCAL;

  if (distance > maxDistance) {
    console.log(`⚠️ 제외 (거리 초과): ${raw.displayName?.text} (${distance}m)`);
    return null;
  }

  // 리뷰 추출
  const reviews: Review[] = (raw.reviews || [])
    .slice(0, DEFAULT_CONFIG.MAX_REVIEWS)
    .map((r: any) => ({
      author: r.authorAttribution?.displayName || "익명",
      rating: r.rating || 0,
      text: r.text?.text || r.originalText?.text || "",
      time: r.relativePublishTimeDescription || "",
    }));

  return {
    id: raw.id,
    name: raw.displayName?.text || "",
    address,
    lat: raw.location?.latitude || 0,
    lng: raw.location?.longitude || 0,
    distance,
    rating: raw.rating || 0,
    reviewCount: raw.userRatingCount || 0,
    types,
    hours:
      raw.currentOpeningHours?.weekdayDescriptions ||
      raw.regularOpeningHours?.weekdayDescriptions ||
      [],
    summary: raw.editorialSummary?.text || raw.editorialSummary?.overview || "",
    reviews,
    shopImages: buildPhotoUrls(raw.photos, DEFAULT_CONFIG.MAX_PHOTOS),
    reviewImages: buildReviewPhotoUrls(raw.reviews || [], DEFAULT_CONFIG.MAX_PHOTOS),
    mapsUrl: raw.googleMapsUri || "",
    priceLevel: raw.priceLevel || "",
  };
}

/**
 * 카페 검색 (향상된 버전)
 * @param options 검색 옵션
 * @returns 카페 목록 (거리순 정렬)
 */
export async function searchCafes(options: SearchOptions): Promise<Place[]> {
  const apiKey = getApiKey();
  const {
    location,
    city,
    district,
    keywords = [],
    types = [],
    atmosphere,
    purpose,
    maxResults = 20,
  } = options;

  // 검색 키워드 생성 (keywords 우선)
  const textQuery = buildSearchKeywords(keywords, district, types, atmosphere, purpose);

  // 검색 반경 결정
  const radius =
    district === "전체"
      ? DEFAULT_CONFIG.SEARCH_RADIUS_WIDE
      : DEFAULT_CONFIG.SEARCH_RADIUS_LOCAL;

  console.log(`🔍 카페 검색: "${textQuery}" (반경 ${radius}m)`);

  try {
    // Google Places API 호출
    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types,places.regularOpeningHours,places.currentOpeningHours,places.editorialSummary,places.reviews,places.photos,places.googleMapsUri,places.priceLevel",
        },
        body: JSON.stringify({
          textQuery,
          locationBias: {
            circle: {
              center: {
                latitude: location.lat,
                longitude: location.lng,
              },
              radius,
            },
          },
          languageCode: "ko",
          maxResultCount: maxResults,
        }),
      }
    );

    // 에러 처리
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API 오류 (${response.status}):`, errorText);
      return [];
    }

    const data = await response.json() as any;

    // 결과 없음
    if (!data.places?.length) {
      console.log("⚠️ 검색 결과 없음");
      return [];
    }

    console.log(`✅ ${data.places.length}개 장소 발견`);

    // 결과 변환 및 필터링
    const places = data.places
      .map((raw: any) => mapToPlace(raw, location, city, district))
      .filter((place: Place | null): place is Place => place !== null);

    // 정렬: 평점과 거리를 조합한 점수
    const sorted = places.sort((a: Place, b: Place) => {
      const scoreA = a.rating >= 4.0 ? a.rating * 1000 - a.distance : -a.distance;
      const scoreB = b.rating >= 4.0 ? b.rating * 1000 - b.distance : -b.distance;
      return scoreB - scoreA;
    });

    console.log(`✅ ${sorted.length}개 카페 필터링 완료`);
    return sorted;
  } catch (error: any) {
    console.error("❌ 검색 실패:", error.message);
    return [];
  }
}

// ==================== 유틸리티 ====================

/**
 * 가격대 텍스트 변환
 */
export function getPriceText(priceLevel: string): string {
  const priceMap: Record<string, string> = {
    PRICE_LEVEL_FREE: "무료",
    PRICE_LEVEL_INEXPENSIVE: "저렴",
    PRICE_LEVEL_MODERATE: "보통",
    PRICE_LEVEL_EXPENSIVE: "비쌈",
    PRICE_LEVEL_VERY_EXPENSIVE: "매우 비쌈",
  };

  return priceMap[priceLevel] || "정보 없음";
}

/**
 * 사진 URL 직접 생성 (개별 사진용)
 */
export function getPhotoUrl(photoName: string, width: number = 800): string {
  const apiKey = getApiKey();
  const name = photoName.startsWith("places/")
    ? photoName
    : `places/${photoName}`;
  return `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${width}&key=${apiKey}`;
}
