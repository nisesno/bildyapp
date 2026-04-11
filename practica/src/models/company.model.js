import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    cif: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    address: {
      street: { type: String, default: '' },
      number: { type: Number, default: 0 },
      postal: { type: String, default: '' },
      city: { type: String, default: '' },
      province: { type: String, default: '' },
    },
    logo: {
      type: String,
      default: null,
    },
    // si es autonomo la "company" es realmente el propio usuario
    isFreelance: {
      type: Boolean,
      default: false,
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
  },
);

// cif ya lleva unique:true arriba
companySchema.index({ owner: 1 });
companySchema.index({ deleted: 1 });

export default mongoose.model('Company', companySchema);
