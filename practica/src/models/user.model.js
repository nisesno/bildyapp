import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      default: '',
      trim: true,
    },
    lastName: {
      type: String,
      default: '',
      trim: true,
    },
    nif: {
      type: String,
      default: '',
      uppercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'guest'],
      default: 'admin',
    },
    status: {
      type: String,
      enum: ['pending', 'verified'],
      default: 'pending',
    },
    verificationCode: {
      type: String,
      select: false,
    },
    verificationAttempts: {
      type: Number,
      default: 3,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
    address: {
      street: { type: String, default: '' },
      number: { type: Number, default: 0 },
      postal: { type: String, default: '' },
      city: { type: String, default: '' },
      province: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ company: 1 });
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });

export default mongoose.model('User', userSchema);
