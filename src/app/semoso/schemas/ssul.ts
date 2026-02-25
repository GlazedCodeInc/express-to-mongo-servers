import mongoose, { Model, Schema } from "mongoose";

type Types = {
  category:
    | "잡담"
    | "일탈"
    | "연애"
    | "사회/정치"
    | "취미"
    | "주식/코인"
    | "게임";
  hashTags: string[];
  title: string;
  description: string;
  imageUrls: string[];
  isGuest: boolean;
  createUserId: any;
  createUserIp: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isDeleted: boolean;
};

const SsulSchema = new Schema<Types>(
  {
    category: { type: String, required: true },
    hashTags: { type: [String], default: [] },
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrls: { type: [String], default: [] },
    isGuest: { type: Boolean, default: false },
    createUserId: {
      type: Schema.Types.ObjectId,
      ref: "AppUser",
      default: null,
    },
    createUserIp: { type: String, required: true },
    viewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    versionKey: false,
    timestamps: true,
  }
);

let Ssul: Model<Types>;

try {
  Ssul = mongoose.model<Types>("Ssul");
} catch (error) {
  Ssul = mongoose.model<Types>("Ssul", SsulSchema);
}

export default Ssul;
