import mongoose, { Model, Schema } from 'mongoose'

/**
 * CountryInfo 타입 정의
 */
interface CountryInfo {
    countryCode: string // ISO 3166-1 alpha-2 (예: KR, US, JP)
    countryName: string // 국가명 영문 (예: South Korea)
    countryKoreanName: string // 국가명 한국어 (예: 대한민국)
    continent: string // 대륙 코드 (예: AS, EU, NA)
    timezone?: string[] // 타임존 배열 (예: ["Asia/Seoul"])
    isValid: boolean // 조회 성공 여부
}

/**
 * Comment 문서 타입 정의
 */
interface CommentDocument {
    userIP: string
    text: string
    imageUrls?: string[]
    country?: CountryInfo
    prompt: string
    createdAt?: Date
    updatedAt?: Date
}

type Types = CommentDocument

const CommentsSchema = new Schema<Types>(
    {
        userIP: { type: String },
        text: { type: String },
        prompt: { type: String },
        imageUrls: { type: [String], default: [] },
        country: {
            countryCode: { type: String }, // ISO 3166-1 alpha-2 (예: KR, US, JP)
            countryName: { type: String }, // 국가명 영문 (예: South Korea)
            countryKoreanName: { type: String }, // 국가명 한국어 (예: 대한민국)
            continent: { type: String }, // 대륙 코드 (예: AS, EU, NA)
            timezone: { type: [String] }, // 타임존 배열 (예: ["Asia/Seoul"])
            isValid: { type: Boolean }, // 조회 성공 여부
        },
    },
    {
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
        versionKey: false,
        timestamps: true,
    },
)

// 성능 최적화를 위한 인덱스 생성
// createdAt 내림차순 인덱스 (최신순 정렬 성능 향상)
CommentsSchema.index({ createdAt: -1 })

// 국가별 조회를 위한 복합 인덱스 (선택사항)
CommentsSchema.index({ 'country.countryCode': 1, createdAt: -1 })

let Comments: Model<Types>

try {
    Comments = mongoose.model<Types>('Comments')
} catch (error) {
    Comments = mongoose.model<Types>('Comments', CommentsSchema)
}

export default Comments
