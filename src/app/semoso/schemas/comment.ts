import { Connection, Model, Schema } from 'mongoose'
import { CountryInfo } from '@/utils/getUserCountry'

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
            countryCode: { type: String },
            countryName: { type: String },
            countryKoreanName: { type: String },
            continent: { type: String },
            timezone: { type: [String] },
            isValid: { type: Boolean },
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

export default function getCommentModel(conn: Connection): Model<Types> {
    return (conn.models['SemosoComment'] as Model<Types>) ?? conn.model<Types>('SemosoComment', CommentSchema)
}
