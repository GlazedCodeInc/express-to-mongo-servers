/**
 * 비회원 서비스 운영을 위한 사용자 IP 주소 추출 유틸리티
 * 다양한 프록시, CDN, 로드밸런서 환경에서 실제 클라이언트 IP를 정확하게 추출
 */

/**
 * IPv6-mapped IPv4 주소 정규화
 * ::ffff:1.2.3.4 → 1.2.3.4 (geoip-lite 및 isLocalIP 호환)
 */
export function normalizeIP(ip: string): string {
    if (!ip) return ip
    if (ip.toLowerCase().startsWith('::ffff:')) {
        return ip.slice(7)
    }
    return ip
}

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
        headers = {}
    }

    // CDN/프록시 특화 헤더 우선순위 (신뢰도 높은 순)
    // ※ 각 헤더는 해당 CDN 뒤에 배포했을 때만 신뢰 가능
    const priorityHeaders = [
        'cf-connecting-ip',       // Cloudflare: 실제 클라이언트 IP (단일값, 위조 불가)
        'true-client-ip',         // Cloudflare Enterprise / Akamai
        'x-real-ip',              // nginx (관리자 직접 설정)
        'fastly-client-ip',       // Fastly CDN
        'x-client-ip',            // Apache mod_remoteip
        'x-vercel-forwarded-for', // Vercel
        'x-forwarded-for',        // 표준 (쉼표 구분 체인, 첫 번째가 원본 클라이언트)
    ]

    for (const header of priorityHeaders) {
        const headerValue = headers[header]
        if (headerValue) {
            const headerString = Array.isArray(headerValue) ? headerValue[0] : headerValue
            if (headerString) {
                // ::ffff: 접두사 정규화 후 공인 IP 여부 확인
                const ips = headerString.split(',').map((ip) => normalizeIP(ip.trim()))
                for (const candidateIp of ips) {
                    if (isValidPublicIP(candidateIp)) {
                        return candidateIp
                    }
                }
            }
        }
    }

    // 소켓 직접 연결 IP (프록시 없는 로컬/직접 연결 환경 폴백)
    const socketIp = (req as any).ip ?? req.socket?.remoteAddress
    if (socketIp) {
        const normalizedSocketIp = normalizeIP(socketIp)
        // 로컬 IP는 랜덤 IP로 대체 (개인 식별 방지)
        return isLocalIP(normalizedSocketIp) ? generateRandomIP() : normalizedSocketIp
    }

    return 'unknown'
}

// 로컬 환경용 랜덤 공인 IP 생성 (100~255 범위: 사설 IP 범위 회피)
function generateRandomIP(): string {
    const o = () => Math.floor(Math.random() * 156) + 100
    return `${o()}.${o()}.${o()}.${o()}`
}

// 유효한 공인 IP인지 확인
function isValidPublicIP(ip: string): boolean {
    if (!ip) return false
    if (!isValidIPv4(ip) && !isValidIPv6(ip)) return false
    if (isLocalIP(ip)) return false
    return true
}

// IPv4 주소 검증
function isValidIPv4(ip: string): boolean {
    if (!ip) return false
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipv4Regex.test(ip)) return false
    const parts = ip.split('.')
    return (
        parts.length === 4 &&
        parts.every((part) => {
            const num = parseInt(part, 10)
            return !isNaN(num) && num >= 0 && num <= 255
        })
    )
}

// IPv6 주소 검증
function isValidIPv6(ip: string): boolean {
    if (!ip) return false
    const ipv6Patterns = [
        /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
        /^([0-9a-fA-F]{1,4}:)*::([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/,
        /^::$/,
        /^::1$/,
        /^::ffff:[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/,
    ]
    return ipv6Patterns.some((pattern) => pattern.test(ip))
}

/**
 * 로컬/내부 IP인지 확인
 *
 * ::ffff:x.x.x.x 형식은 IPv4 부분만 추출하여 판단
 * (::ffff:8.8.8.8 같은 공인 IPv6-mapped 주소를 로컬로 잘못 분류하지 않음)
 */
export function isLocalIP(ip: string): boolean {
    if (!ip) return true

    // IPv6-mapped IPv4 정규화 후 재귀 판단
    // ::ffff:127.0.0.1 → local, ::ffff:8.8.8.8 → public
    const normalized = normalizeIP(ip)
    if (normalized !== ip) return isLocalIP(normalized)

    // IPv4 사설/로컬 범위
    const ipv4LocalPrefixes = [
        '127.',     // 127.0.0.0/8 (localhost)
        '192.168.', // 192.168.0.0/16 (private)
        '10.',      // 10.0.0.0/8 (private)
        '169.254.', // 169.254.0.0/16 (link-local)
        '0.0.0.0',  // invalid
    ]

    // 172.16.0.0/12 private range (172.16 ~ 172.31)
    const ipParts = ip.split('.')
    if (ipParts.length === 4) {
        const secondOctet = parseInt(ipParts[1])
        if (ipParts[0] === '172' && secondOctet >= 16 && secondOctet <= 31) {
            return true
        }
    }

    for (const prefix of ipv4LocalPrefixes) {
        if (ip.startsWith(prefix)) return true
    }

    // IPv6 로컬 주소 (::ffff: 제외 — 위에서 normalizeIP로 이미 처리됨)
    const ipv6LocalPrefixes = [
        '::1',   // localhost
        'fe80:', // link-local
        'fc00:', // unique local
        'fd00:', // unique local
        'ff00:', // multicast
    ]

    for (const prefix of ipv6LocalPrefixes) {
        if (ip.toLowerCase().startsWith(prefix)) return true
    }

    return false
}

/**
 * IP 기반 비회원 해시 생성 (SHA-256, 16자리)
 */
export function generateGuestUserHash(ip: string, userAgent?: string): string {
    const crypto = require('crypto')
    const data = `${ip}_${userAgent || 'unknown'}_${process.env.APP_SECRET || 'default'}`
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16)
}

/**
 * IP 주소 마스킹 (개인정보보호)
 *
 * IPv4: 123.178.234.159 → 12*.*78.***.15*
 * IPv6: 앞 2그룹만 표시, 나머지 마스킹
 */
export function maskIP(ip: string): string {
    if (!ip || ip === 'unknown') return 'unknown'

    if (isValidIPv6(ip)) {
        const groups = ip.split(':')
        if (groups.length >= 2) {
            const visibleParts = groups.slice(0, 2).join(':')
            const maskedParts = new Array(Math.max(8 - 2, 1)).fill('****').join(':')
            return `${visibleParts}:${maskedParts}`
        }
        return '****:****:****:****:****:****:****:****'
    }

    const parts = ip.split('.')
    if (parts.length === 4) {
        const masked = [
            maskOctet(parts[0], 'first'),
            maskOctet(parts[1], 'second'),
            maskOctet(parts[2], 'third'),
            maskOctet(parts[3], 'fourth'),
        ]
        return masked.join('.')
    }

    return ip
}

function maskOctet(octet: string, position: 'first' | 'second' | 'third' | 'fourth'): string {
    const length = octet.length
    switch (position) {
        case 'first':
            if (length <= 2) return octet
            return octet.substring(0, 2) + '*'.repeat(length - 2)
        case 'second':
            if (length <= 2) return octet
            return '*'.repeat(length - 2) + octet.substring(length - 2)
        case 'third':
            return '*'.repeat(Math.max(length, 1))
        case 'fourth':
            if (length <= 2) return octet
            return octet.substring(0, 2) + '*'.repeat(length - 2)
        default:
            return '***'
    }
}
