/**
 * 비회원 서비스 운영을 위한 사용자 IP 주소 추출 유틸리티
 * 다양한 프록시, CDN, 로드밸런서 환경에서 실제 클라이언트 IP를 정확하게 추출
 */

export async function getUserIP(req: Request | any): Promise<string> {
    // Next.js NextApiRequest와 표준 Request 모두 지원
    let headers: Record<string, string | string[] | undefined>

    if (req.headers && typeof req.headers.entries === 'function') {
        // 표준 Web API Request 객체
        headers = Object.fromEntries(req.headers.entries())
    } else if (req.headers && typeof req.headers === 'object') {
        // Next.js NextApiRequest 또는 Node.js IncomingMessage
        headers = req.headers as Record<string, string | string[] | undefined>
    } else {
        // headers가 없는 경우
        headers = {}
    }

    // 우선순위 기반 간단한 IP 추출
    const priorityHeaders = ['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip', 'x-vercel-forwarded-for']

    for (const header of priorityHeaders) {
        const headerValue = headers[header]
        if (headerValue) {
            // string[] 타입도 처리
            const headerString = Array.isArray(headerValue) ? headerValue[0] : headerValue
            if (headerString) {
                const ips = headerString.split(',').map((ip) => ip.trim())
                for (const candidateIp of ips) {
                    if (isValidPublicIP(candidateIp)) {
                        return candidateIp
                    }
                }
            }
        }
    }

    // 개발환경용 랜덤 IP 주소 생성 xxx.xxx.xxx.xxx
    function generateRandomIP(): string {
        const firstOctet = Math.floor(Math.random() * 100) + 100 // 100-199 (xxx)
        const secondOctet = Math.floor(Math.random() * 100) + 100 // 100-199 (xxx)
        const thirdOctet = Math.floor(Math.random() * 156) + 100 // 100-255 (xxx)
        const fourthOctet = Math.floor(Math.random() * 156) + 100 // 100-255 (xxx)

        return `${firstOctet}.${secondOctet}.${thirdOctet}.${fourthOctet}`
    }

    // 개발환경 로컬 IP (랜덤 생성)
    if (process.env.NODE_ENV === 'development') return generateRandomIP()

    return 'unknown'
}

// 유효한 공인 IP인지 확인 (자체 구현)
function isValidPublicIP(ip: string): boolean {
    if (!ip) return false

    // IP 형식 검증
    if (!isValidIPv4(ip) && !isValidIPv6(ip)) return false

    // 로컬/내부 IP 제외
    if (isLocalIP(ip)) return false

    return true
}

// IPv4 주소 검증
function isValidIPv4(ip: string): boolean {
    if (!ip) return false

    // 기본 IPv4 패턴 체크
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipv4Regex.test(ip)) return false

    // 각 옥텟 범위 검증
    const parts = ip.split('.')
    return (
        parts.length === 4 &&
        parts.every((part) => {
            const num = parseInt(part, 10)
            return !isNaN(num) && num >= 0 && num <= 255
        })
    )
}

// IPv6 주소 검증 (기본적인 형태)
function isValidIPv6(ip: string): boolean {
    if (!ip) return false

    // 기본 IPv6 패턴들
    const ipv6Patterns = [
        /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/, // 전체 형태
        /^([0-9a-fA-F]{1,4}:)*::([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/, // 축약 형태
        /^::$/, // ::
        /^::1$/, // localhost
        /^::ffff:[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/, // IPv4-mapped
    ]

    return ipv6Patterns.some((pattern) => pattern.test(ip))
}

// 로컬/내부 IP인지 확인 (개선된 버전)
function isLocalIP(ip: string): boolean {
    if (!ip) return true

    // IPv4 로컬/내부 IP 범위
    const ipv4LocalRanges = [
        '127.', // 127.0.0.0/8 (localhost)
        '192.168.', // 192.168.0.0/16 (private)
        '10.', // 10.0.0.0/8 (private)
        '169.254.', // 169.254.0.0/16 (link-local)
        '0.0.0.0', // invalid
    ]

    // IPv4 172.16.0.0/12 private range (172.16.0.0 ~ 172.31.255.255)
    const ipParts = ip.split('.')
    if (ipParts.length === 4) {
        const secondOctet = parseInt(ipParts[1])
        if (ipParts[0] === '172' && secondOctet >= 16 && secondOctet <= 31) {
            return true
        }
    }

    // IPv4 로컬 범위 체크
    for (const range of ipv4LocalRanges) {
        if (ip.startsWith(range)) return true
    }

    // IPv6 로컬/내부 주소
    const ipv6LocalRanges = [
        '::1', // localhost
        '::ffff:', // IPv4-mapped IPv6
        'fe80:', // link-local
        'fc00:', // unique local
        'fd00:', // unique local
        'ff00:', // multicast
    ]

    for (const range of ipv6LocalRanges) {
        if (ip.startsWith(range)) return true
    }

    return false
}

/**
 * 비회원 사용자 식별을 위한 IP 기반 해시 생성
 *
 * @description
 * IP 주소와 User-Agent를 조합하여 비회원 사용자를 고유하게 식별할 수 있는 해시값을 생성합니다.
 * SHA-256 암호화 알고리즘을 사용하여 보안성을 보장하며, 동일한 IP와 User-Agent는 항상 동일한 해시를 생성합니다.
 * @returns 16자리 16진수 문자열 (예: "a3f5c8b2e1d4f6a9", "7f2e9d1a4c6b8e3f")
 *
 * // 기본 사용
 * const hash1 = generateGuestUserHash("192.168.1.100");
 * // => "a3f5c8b2e1d4f6a9"
 *
 * // User-Agent 포함
 * const hash2 = generateGuestUserHash(
 *   "192.168.1.100",
 *   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"
 * );
 * // => "7f2e9d1a4c6b8e3f"
 *
 */
export function generateGuestUserHash(ip: string, userAgent?: string): string {
    const crypto = require('crypto')
    const data = `${ip}_${userAgent || 'unknown'}_${process.env.APP_SECRET || 'default'}`
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16)
}

/**
 * IP 주소 마스킹 (개인정보보호 강화)
 *
 * @description
 * IP 주소의 각 옥텟을 다른 패턴으로 마스킹하여 개인정보를 보호하면서도
 * 대략적인 지역 정보는 유지합니다.
 *
 * @example
 * IPv4: 123.178.234.159 -> 12*.*78.***. 15*
 * - 1번째 옥텟: 처음 두 자리만 남기고 나머지 * (예: 123 -> 12*)
 * - 2번째 옥텟: 마지막 두 자리만 남김 (예: 178 -> *78)
 * - 3번째 옥텟: 전체 *** (예: 234 -> ***)
 * - 4번째 옥텟: 처음 두 자리만 남기고 나머지 * (예: 159 -> 15*)
 *
 * IPv6: 2001:0db8:85a3:0000:0000:8a2e:0370:7334 -> 2001:0db8:****:****:****:****:****:****
 */
function isIPv6(ip: string): boolean {
    return isValidIPv6(ip)
}

export function maskIP(ip: string): string {
    if (!ip || ip === 'unknown') return 'unknown'

    if (isIPv6(ip)) {
        // IPv6는 앞 2개 그룹만 표시하고 나머지 마스킹
        const groups = ip.split(':')
        if (groups.length >= 2) {
            const visibleParts = groups.slice(0, 2).join(':')
            const maskedParts = new Array(Math.max(8 - 2, 1)).fill('****').join(':')
            return `${visibleParts}:${maskedParts}`
        }
        return '****:****:****:****:****:****:****:****'
    } else {
        // IPv4 강화된 마스킹
        const parts = ip.split('.')
        if (parts.length === 4) {
            // 각 옥텟에 다른 마스킹 패턴 적용
            const masked = [
                maskOctet(parts[0], 'first'), // 처음 두 자리 남김: 123 -> 12*
                maskOctet(parts[1], 'second'), // 마지막 두 자리 남김: 178 -> *78
                maskOctet(parts[2], 'third'), // 전체 마스킹: 234 -> ***
                maskOctet(parts[3], 'fourth'), // 처음 두 자리 남김: 159 -> 15*
            ]
            return masked.join('.')
        }
    }

    return ip
}

/**
 * 옥텟 마스킹 헬퍼 함수
 */
function maskOctet(octet: string, position: 'first' | 'second' | 'third' | 'fourth'): string {
    const length = octet.length

    switch (position) {
        case 'first':
            // 처음 두 자리 남기고 나머지 *
            // 1 -> 1, 12 -> 12, 123 -> 12*, 255 -> 25*
            if (length <= 2) return octet
            return octet.substring(0, 2) + '*'.repeat(length - 2)

        case 'second':
            // 마지막 두 자리만 남기고 앞을 *
            // 1 -> 1, 12 -> 12, 123 -> *23, 178 -> *78
            if (length <= 2) return octet
            return '*'.repeat(length - 2) + octet.substring(length - 2)

        case 'third':
            // 전체 마스킹
            // 1 -> *, 12 -> **, 123 -> ***, 234 -> ***
            return '*'.repeat(Math.max(length, 1))

        case 'fourth':
            // 처음 두 자리 남기고 나머지 *
            // 1 -> 1, 12 -> 12, 123 -> 12*, 159 -> 15*
            if (length <= 2) return octet
            return octet.substring(0, 2) + '*'.repeat(length - 2)

        default:
            return '***'
    }
}
