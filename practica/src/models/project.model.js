import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    projectCode: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      street: { type: String, default: '' },
      number: { type: Number, default: 0 },
      postal: { type: String, default: '' },
      city: { type: String, default: '' },
      province: { type: String, default: '' },
    },
    email: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
    active: {
      type: Boolean,
      default: true,
    },
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

// codigo de proyecto unico por compañia
projectSchema.index({ company: 1, projectCode: 1 }, { unique: true });
projectSchema.index({ company: 1, deleted: 1 });
projectSchema.index({ client: 1 });

export default mongoose.model('Project', projectSchema);
