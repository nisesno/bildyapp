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
      select: false, // no lo devolvemos nunca por defecto
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
    // verificacion de email por codigo
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
      default: 3, // intentos restantes
    },
    // guardamos el refresh token activo para poder revocarlo en el logout.
    // si esta a null, los refresh tokens viejos no valen.
    refreshToken: {
      type: String,
      default: null,
      select: false,
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
    // soft delete
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// virtual: nombre completo
userSchema.virtual('fullName').get(function () {
  return `${this.name} ${this.lastName}`.trim();
});

// no devolver campos sensibles al serializar
userSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.password;
  delete obj.verificationCode;
  delete obj.refreshToken;
  delete obj.__v;
  return obj;
};

// email ya lleva unique:true arriba
userSchema.index({ company: 1 });
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });

export default mongoose.model('User', userSchema);
