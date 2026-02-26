import { Connection, Model, Schema } from 'mongoose'
import { CountryInfo } from '@/utils/getUserCountry'

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
            countryCode: { type: String },
            countryName: { type: String },
            countryKoreanName: { type: String },
            continent: { type: String },
            timezone: { type: [String] },
            isValid: { type: Boolean },
        },
    },
    {
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
        versionKey: false,
        timestamps: true,
    },
)

// createdAt 내림차순 인덱스 (최신순 정렬 성능 향상)
CommentsSchema.index({ createdAt: -1 })

// 국가별 조회를 위한 복합 인덱스
CommentsSchema.index({ 'country.countryCode': 1, createdAt: -1 })

export default function getCommentsModel(conn: Connection): Model<Types> {
    return (conn.models['Comments'] as Model<Types>) ?? conn.model<Types>('Comments', CommentsSchema)
}
