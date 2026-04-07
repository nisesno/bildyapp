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
    isFreelance: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

companySchema.index({ cif: 1 });
companySchema.index({ owner: 1 });

export default mongoose.model('Company', companySchema);
