import mongoose, { Model, Schema } from 'mongoose'

interface CountryInfo {
    countryCode: string // ISO 3166-1 alpha-2 (예: KR, US, JP)
    countryName: string // 국가명 영문 (예: South Korea)
    countryKoreanName: string // 국가명 한국어 (예: 대한민국)
    continent: string // 대륙 코드 (예: AS, EU, NA)
    timezone?: string[] // 타임존 배열 (예: ["Asia/Seoul"])
    isValid: boolean // 조회 성공 여부
}

type Types = {
    type: 'comment' | 'reply'
    menu: 'ssul' | 'dating' | 'feed'
    text: string
    isGuest: boolean
    userIp: string
    country?: CountryInfo
    createUserId: any
    pageId: string
    isDeleted: boolean
}

const CommentSchema = new Schema<Types>(
    {
        type: { type: String, required: true },
        menu: { type: String, required: true },
        text: { type: String, required: true },
        isGuest: { type: Boolean, default: true },
        userIp: { type: String, required: true, default: null },
        country: {
            countryCode: { type: String }, // ISO 3166-1 alpha-2 (예: KR, US, JP)
            countryName: { type: String }, // 국가명 영문 (예: South Korea)
            countryKoreanName: { type: String }, // 국가명 한국어 (예: 대한민국)
            continent: { type: String }, // 대륙 코드 (예: AS, EU, NA)
            timezone: { type: [String] }, // 타임존 배열 (예: ["Asia/Seoul"])
            isValid: { type: Boolean }, // 조회 성공 여부
        },
        createUserId: {
            type: Schema.Types.ObjectId,
            ref: 'AppUser',
            default: null,
        },
        pageId: { type: String, required: true },
        isDeleted: { type: Boolean, default: false },
    },
    {
        collection: 'comments',
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
        versionKey: false,
        timestamps: true,
    },
)

let Comments: Model<Types>

try {
    Comments = mongoose.model<Types>('SemosoComment')
} catch (error) {
    Comments = mongoose.model<Types>('SemosoComment', CommentSchema)
}

export default Comments
