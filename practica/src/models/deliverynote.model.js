import mongoose from 'mongoose';

// trabajadores extra cuando el albaran es de horas con varios curritos
const workerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    hours: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const deliveryNoteSchema = new mongoose.Schema(
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
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    format: {
      type: String,
      enum: ['material', 'hours'],
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    workDate: {
      type: Date,
      default: () => new Date(),
    },
    // material
    material: { type: String, default: '' },
    quantity: { type: Number, default: 0 },
    unit: { type: String, default: '' },
    // horas
    hours: { type: Number, default: 0 },
    workers: [workerSchema],
    // firma
    signed: { type: Boolean, default: false },
    signedAt: { type: Date, default: null },
    signatureUrl: { type: String, default: null },
    pdfUrl: { type: String, default: null },
    // soft delete
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

deliveryNoteSchema.index({ company: 1, deleted: 1 });
deliveryNoteSchema.index({ project: 1 });
deliveryNoteSchema.index({ client: 1 });
deliveryNoteSchema.index({ workDate: -1 });

export default mongoose.model('DeliveryNote', deliveryNoteSchema);
