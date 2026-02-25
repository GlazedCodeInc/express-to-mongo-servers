/**
 * IP 주소 기반 국가 정보 조회 유틸리티
 * geoip-lite를 사용하여 로컬 GeoIP 데이터베이스에서 국가 정보 추출
 */

import { getUserIP } from './getUserIp'

// geoip-lite를 안전하게 로드 (Vercel 환경에서 데이터 파일 누락 시 대응)
let geoip: any = null
try {
    geoip = require('geoip-lite')
    console.log('[getUserCountry] geoip-lite 로드 성공')
} catch (error) {
    console.error('[getUserCountry] ⚠️ geoip-lite 로드 실패 - 기본값 사용:', error)
}

/**
 * 국가 정보 인터페이스
 */
export interface CountryInfo {
    /** ISO 3166-1 alpha-2 국가 코드 (예: KR, US, JP) */
    countryCode: string
    /** 국가명 (영문) */
    countryName: string
    /** 국가명 (한국어) */
    countryKoreanName: string
    /** 대륙 코드 (AS, EU, NA, SA, AF, OC, AN) */
    continent: string
    /** 타임존 배열 */
    timezone?: string[]
    /** 조회 성공 여부 */
    isValid: boolean
}

/**
 * 국가 코드별 국가명 매핑 (영문)
 */
const COUNTRY_NAMES: Record<string, string> = {
    KR: 'South Korea',
    US: 'United States',
    JP: 'Japan',
    CN: 'China',
    GB: 'United Kingdom',
    DE: 'Germany',
    FR: 'France',
    CA: 'Canada',
    AU: 'Australia',
    IN: 'India',
    BR: 'Brazil',
    RU: 'Russia',
    IT: 'Italy',
    ES: 'Spain',
    MX: 'Mexico',
    ID: 'Indonesia',
    NL: 'Netherlands',
    SA: 'Saudi Arabia',
    TR: 'Turkey',
    CH: 'Switzerland',
    PL: 'Poland',
    SE: 'Sweden',
    BE: 'Belgium',
    AR: 'Argentina',
    NO: 'Norway',
    AT: 'Austria',
    IL: 'Israel',
    SG: 'Singapore',
    TH: 'Thailand',
    VN: 'Vietnam',
    MY: 'Malaysia',
    PH: 'Philippines',
}

/**
 * 국가 코드별 국가명 매핑 (한국어)
 */
const COUNTRY_KOREAN_NAMES: Record<string, string> = {
    // 아시아
    KR: '한국',
    JP: '일본',
    CN: '중국',
    IN: '인도',
    ID: '인도네시아',
    TH: '태국',
    VN: '베트남',
    MY: '말레이시아',
    PH: '필리핀',
    SG: '싱가포르',
    BD: '방글라데시',
    PK: '파키스탄',
    IR: '이란',
    IQ: '이라크',
    SA: '사우디아라비아',
    AE: '아랍에미리트',
    IL: '이스라엘',
    TR: '튀르키예',
    KZ: '카자흐스탄',
    UZ: '우즈베키스탄',
    MM: '미얀마',
    KH: '캄보디아',
    LA: '라오스',
    NP: '네팔',
    LK: '스리랑카',
    AF: '아프가니스탄',
    JO: '요르단',
    SY: '시리아',
    LB: '레바논',
    YE: '예멘',
    OM: '오만',
    KW: '쿠웨이트',
    QA: '카타르',
    BH: '바레인',
    MN: '몽골',
    TW: '대만',
    HK: '홍콩',
    MO: '마카오',

    // 유럽
    GB: '영국',
    DE: '독일',
    FR: '프랑스',
    IT: '이탈리아',
    ES: '스페인',
    NL: '네덜란드',
    BE: '벨기에',
    CH: '스위스',
    AT: '오스트리아',
    SE: '스웨덴',
    NO: '노르웨이',
    DK: '덴마크',
    FI: '핀란드',
    PL: '폴란드',
    GR: '그리스',
    PT: '포르투갈',
    CZ: '체코',
    RO: '루마니아',
    HU: '헝가리',
    BG: '불가리아',
    SK: '슬로바키아',
    HR: '크로아티아',
    SI: '슬로베니아',
    LT: '리투아니아',
    LV: '라트비아',
    EE: '에스토니아',
    IE: '아일랜드',
    RS: '세르비아',
    UA: '우크라이나',
    BY: '벨라루스',
    BA: '보스니아 헤르체고비나',
    AL: '알바니아',
    MK: '북마케도니아',
    MD: '몰도바',
    IS: '아이슬란드',
    LU: '룩셈부르크',
    MT: '몰타',
    CY: '키프로스',
    ME: '몬테네그로',
    XK: '코소보',
    RU: '러시아',

    // 북미
    US: '미국',
    CA: '캐나다',
    MX: '멕시코',
    GT: '과테말라',
    CU: '쿠바',
    DO: '도미니카 공화국',
    HT: '아이티',
    HN: '온두라스',
    NI: '니카라과',
    SV: '엘살바도르',
    CR: '코스타리카',
    PA: '파나마',
    JM: '자메이카',
    TT: '트리니다드 토바고',
    BS: '바하마',
    BZ: '벨리즈',
    BB: '바베이도스',
    LC: '세인트루시아',
    GD: '그레나다',
    VC: '세인트빈센트 그레나딘',
    AG: '앤티가 바부다',
    DM: '도미니카',
    KN: '세인트키츠 네비스',

    // 남미
    BR: '브라질',
    AR: '아르헨티나',
    CO: '콜롬비아',
    PE: '페루',
    VE: '베네수엘라',
    CL: '칠레',
    EC: '에콰도르',
    BO: '볼리비아',
    PY: '파라과이',
    UY: '우루과이',
    GY: '가이아나',
    SR: '수리남',
    GF: '프랑스령 기아나',

    // 아프리카
    ZA: '남아프리카 공화국',
    EG: '이집트',
    NG: '나이지리아',
    KE: '케냐',
    GH: '가나',
    TZ: '탄자니아',
    UG: '우간다',
    DZ: '알제리',
    MA: '모로코',
    AO: '앙골라',
    SD: '수단',
    ET: '에티오피아',
    CD: '콩고 민주 공화국',
    CM: '카메룬',
    CI: '코트디부아르',
    MG: '마다가스카르',
    ML: '말리',
    NE: '니제르',
    BF: '부르키나파소',
    MW: '말라위',
    ZM: '잠비아',
    SN: '세네갈',
    SO: '소말리아',
    TD: '차드',
    GN: '기니',
    RW: '르완다',
    BJ: '베냉',
    TN: '튀니지',
    BI: '부룬디',
    SS: '남수단',
    TG: '토고',
    SL: '시에라리온',
    LY: '리비아',
    LR: '라이베리아',
    MR: '모리타니',
    CF: '중앙아프리카 공화국',
    ER: '에리트레아',
    GM: '감비아',
    BW: '보츠와나',
    GA: '가봉',
    GW: '기니비사우',
    GQ: '적도 기니',
    MU: '모리셔스',
    SZ: '에스와티니',
    DJ: '지부티',
    RE: '레위니옹',
    KM: '코모로',
    CV: '카보베르데',
    ST: '상투메 프린시페',
    SC: '세이셸',
    LS: '레소토',

    // 오세아니아
    AU: '호주',
    NZ: '뉴질랜드',
    PG: '파푸아뉴기니',
    FJ: '피지',
    NC: '뉴칼레도니아',
    PF: '프랑스령 폴리네시아',
    WS: '사모아',
    GU: '괌',
    VU: '바누아투',
    TO: '통가',
    KI: '키리바시',
    FM: '미크로네시아',
    SB: '솔로몬 제도',
    PW: '팔라우',
    MH: '마셜 제도',
    NR: '나우루',
    TV: '투발루',
    AS: '아메리칸사모아',
    MP: '북마리아나 제도',
    CK: '쿡 제도',
    WF: '왈리스 푸투나',
    NU: '니우에',
    TK: '토켈라우',
}

/**
 * 대륙 코드별 대륙명
 */
const CONTINENT_NAMES: Record<string, string> = {
    AS: 'Asia',
    EU: 'Europe',
    NA: 'North America',
    SA: 'South America',
    AF: 'Africa',
    OC: 'Oceania',
    AN: 'Antarctica',
}

/**
 * 국가 코드별 대륙 매핑
 * geoip-lite가 continent를 제공하지 않으므로 수동 매핑
 */
const COUNTRY_TO_CONTINENT: Record<string, string> = {
    // Asia
    KR: 'AS',
    JP: 'AS',
    CN: 'AS',
    IN: 'AS',
    ID: 'AS',
    TH: 'AS',
    VN: 'AS',
    MY: 'AS',
    PH: 'AS',
    SG: 'AS',
    BD: 'AS',
    PK: 'AS',
    IR: 'AS',
    IQ: 'AS',
    SA: 'AS',
    AE: 'AS',
    IL: 'AS',
    TR: 'AS',
    KZ: 'AS',
    UZ: 'AS',
    MM: 'AS',
    KH: 'AS',
    LA: 'AS',
    NP: 'AS',
    LK: 'AS',
    AF: 'AS',
    JO: 'AS',
    SY: 'AS',
    LB: 'AS',
    YE: 'AS',
    OM: 'AS',
    KW: 'AS',
    QA: 'AS',
    BH: 'AS',
    MN: 'AS',
    TW: 'AS',
    HK: 'AS',
    MO: 'AS',

    // Europe
    GB: 'EU',
    DE: 'EU',
    FR: 'EU',
    IT: 'EU',
    ES: 'EU',
    NL: 'EU',
    BE: 'EU',
    CH: 'EU',
    AT: 'EU',
    SE: 'EU',
    NO: 'EU',
    DK: 'EU',
    FI: 'EU',
    PL: 'EU',
    GR: 'EU',
    PT: 'EU',
    CZ: 'EU',
    RO: 'EU',
    HU: 'EU',
    BG: 'EU',
    SK: 'EU',
    HR: 'EU',
    SI: 'EU',
    LT: 'EU',
    LV: 'EU',
    EE: 'EU',
    IE: 'EU',
    RS: 'EU',
    UA: 'EU',
    BY: 'EU',
    BA: 'EU',
    AL: 'EU',
    MK: 'EU',
    MD: 'EU',
    IS: 'EU',
    LU: 'EU',
    MT: 'EU',
    CY: 'EU',
    ME: 'EU',
    XK: 'EU',
    RU: 'EU',

    // North America
    US: 'NA',
    CA: 'NA',
    MX: 'NA',
    GT: 'NA',
    CU: 'NA',
    DO: 'NA',
    HT: 'NA',
    HN: 'NA',
    NI: 'NA',
    SV: 'NA',
    CR: 'NA',
    PA: 'NA',
    JM: 'NA',
    TT: 'NA',
    BS: 'NA',
    BZ: 'NA',
    BB: 'NA',
    LC: 'NA',
    GD: 'NA',
    VC: 'NA',
    AG: 'NA',
    DM: 'NA',
    KN: 'NA',

    // South America
    BR: 'SA',
    AR: 'SA',
    CO: 'SA',
    PE: 'SA',
    VE: 'SA',
    CL: 'SA',
    EC: 'SA',
    BO: 'SA',
    PY: 'SA',
    UY: 'SA',
    GY: 'SA',
    SR: 'SA',
    GF: 'SA',

    // Africa
    ZA: 'AF',
    EG: 'AF',
    NG: 'AF',
    KE: 'AF',
    GH: 'AF',
    TZ: 'AF',
    UG: 'AF',
    DZ: 'AF',
    MA: 'AF',
    AO: 'AF',
    SD: 'AF',
    ET: 'AF',
    CD: 'AF',
    CM: 'AF',
    CI: 'AF',
    MG: 'AF',
    ML: 'AF',
    NE: 'AF',
    BF: 'AF',
    MW: 'AF',
    ZM: 'AF',
    SN: 'AF',
    SO: 'AF',
    TD: 'AF',
    GN: 'AF',
    RW: 'AF',
    BJ: 'AF',
    TN: 'AF',
    BI: 'AF',
    SS: 'AF',
    TG: 'AF',
    SL: 'AF',
    LY: 'AF',
    LR: 'AF',
    MR: 'AF',
    CF: 'AF',
    ER: 'AF',
    GM: 'AF',
    BW: 'AF',
    GA: 'AF',
    GW: 'AF',
    GQ: 'AF',
    MU: 'AF',
    SZ: 'AF',
    DJ: 'AF',
    RE: 'AF',
    KM: 'AF',
    CV: 'AF',
    ST: 'AF',
    SC: 'AF',
    LS: 'AF',

    // Oceania
    AU: 'OC',
    NZ: 'OC',
    PG: 'OC',
    FJ: 'OC',
    NC: 'OC',
    PF: 'OC',
    WS: 'OC',
    GU: 'OC',
    VU: 'OC',
    TO: 'OC',
    KI: 'OC',
    FM: 'OC',
    SB: 'OC',
    PW: 'OC',
    MH: 'OC',
    NR: 'OC',
    TV: 'OC',
    AS: 'OC',
    MP: 'OC',
    CK: 'OC',
    WF: 'OC',
    NU: 'OC',
    TK: 'OC',
}

/**
 * Request 객체로부터 사용자 국가 정보 조회
 * Next.js NextApiRequest와 표준 Request 모두 지원
 */
export async function getUserCountry(req: Request | any): Promise<CountryInfo> {
    try {
        // Request에서 IP 추출
        const ip = await getUserIP(req)

        // IP로부터 국가 정보 조회
        return await getCountryFromIP(ip)
    } catch (error) {
        console.error('Failed to get user country from request:', error)
        return getUnknownCountry()
    }
}

/**
 * IP 주소로부터 국가 정보 조회
 */
export async function getCountryFromIP(ip: string): Promise<CountryInfo> {
    // 개발 환경이거나 unknown IP인 경우
    if (!ip || ip === 'unknown' || process.env.NODE_ENV === 'development') {
        return getDevelopmentCountry()
    }

    // 1. geoip-lite 사용 시도 (로컬 환경)
    if (geoip) {
        try {
            const geo = geoip.lookup(ip)
            if (geo && geo.country) {
                const continent = COUNTRY_TO_CONTINENT[geo.country] || 'Unknown'
                const timezones = geo.timezone ? [geo.timezone] : undefined

                return {
                    countryCode: geo.country,
                    countryName: COUNTRY_NAMES[geo.country] || geo.country,
                    countryKoreanName: COUNTRY_KOREAN_NAMES[geo.country] || geo.country,
                    continent: continent,
                    timezone: timezones,
                    isValid: true,
                }
            }
        } catch (error) {
            console.warn('[getCountryFromIP] geoip-lite 조회 실패, 외부 API 사용:', error)
        }
    }

    // 2. 외부 API 사용 (Vercel 환경 또는 geoip-lite 실패 시)
    try {
        const response = await fetch(
            `http://ip-api.com/json/${ip}?fields=status,country,countryCode,timezone,continent,continentCode`,
        )
        if (response.ok) {
            const data = await response.json() as any
            if (data.status === 'success' && data.countryCode) {
                const continent = COUNTRY_TO_CONTINENT[data.countryCode] || data.continentCode || 'Unknown'
                return {
                    countryCode: data.countryCode,
                    countryName: COUNTRY_NAMES[data.countryCode] || data.country || data.countryCode,
                    countryKoreanName: COUNTRY_KOREAN_NAMES[data.countryCode] || data.country || data.countryCode,
                    continent: continent,
                    timezone: data.timezone ? [data.timezone] : undefined,
                    isValid: true,
                }
            }
        }
    } catch (error) {
        console.error(`[getCountryFromIP] 외부 API 조회 실패 (${ip}):`, error)
    }

    // 3. 모든 시도 실패 시 Unknown 반환
    return getUnknownCountry()
}

/**
 * 개발 환경용 기본 국가 정보 (한국)
 */
function getDevelopmentCountry(): CountryInfo {
    return {
        countryCode: 'KR',
        countryName: 'South Korea',
        countryKoreanName: '한국',
        continent: 'AS',
        timezone: ['Asia/Seoul'],
        isValid: true,
    }
}

/**
 * 알 수 없는 국가 정보
 */
function getUnknownCountry(): CountryInfo {
    return {
        countryCode: 'XX',
        countryName: 'Unknown',
        countryKoreanName: '알 수 없음',
        continent: 'Unknown',
        isValid: false,
    }
}

/**
 * 국가 코드가 유효한지 확인
 */
export function isValidCountryCode(countryCode: string): boolean {
    return !!(countryCode && countryCode !== 'XX' && countryCode.length === 2 && /^[A-Z]{2}$/.test(countryCode))
}

/**
 * 대륙 코드로 대륙명 조회
 */
export function getContinentName(continentCode: string): string {
    return CONTINENT_NAMES[continentCode] || 'Unknown'
}

/**
 * 국가 정보 요약 문자열 생성
 * 예: "South Korea (KR, Asia)"
 */
export function formatCountryInfo(info: CountryInfo): string {
    if (!info.isValid) {
        return 'Unknown'
    }

    const continentName = getContinentName(info.continent)
    return `${info.countryName} (${info.countryCode}, ${continentName})`
}

/**
 * 여러 IP의 국가 정보를 일괄 조회
 */
export async function getCountriesFromIPs(ips: string[]): Promise<CountryInfo[]> {
    return await Promise.all(ips.map((ip) => getCountryFromIP(ip)))
}

/**
 * 특정 국가 코드 목록에 속하는지 확인
 */
export function isCountryInList(countryInfo: CountryInfo, allowedCountries: string[]): boolean {
    return allowedCountries.includes(countryInfo.countryCode)
}

/**
 * 특정 대륙에 속하는지 확인
 */
export function isFromContinent(countryInfo: CountryInfo, continent: string): boolean {
    return countryInfo.continent === continent
}

/**
 * 아시아 지역인지 확인
 */
export function isFromAsia(countryInfo: CountryInfo): boolean {
    return isFromContinent(countryInfo, 'AS')
}

/**
 * 유럽 지역인지 확인
 */
export function isFromEurope(countryInfo: CountryInfo): boolean {
    return isFromContinent(countryInfo, 'EU')
}

/**
 * 북미 지역인지 확인
 */
export function isFromNorthAmerica(countryInfo: CountryInfo): boolean {
    return isFromContinent(countryInfo, 'NA')
}

/**
 * GeoIP 데이터베이스 정보 조회 (디버깅용)
 */
export function getGeoIPDatabaseInfo(): {
    totalRecords: number
    lastUpdate: Date | null
} {
    try {
        // geoip-lite의 내부 데이터 확인
        const testIP = '8.8.8.8' // Google DNS
        const result = geoip.lookup(testIP)

        return {
            totalRecords: result ? 1 : 0, // geoip-lite는 레코드 수 조회 API 없음
            lastUpdate: null, // 업데이트 날짜 조회 API 없음
        }
    } catch (error) {
        return {
            totalRecords: 0,
            lastUpdate: null,
        }
    }
}
