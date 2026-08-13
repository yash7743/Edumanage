const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema(
  {
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    chapterNumber: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    notes: { type: String, default: '' },
    materialFile: {
      originalName: String,
      storedName: String,
      path: String,
      mimeType: String,
      size: Number,
    },
    resourceUrl: { type: String, trim: true, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

chapterSchema.index({ subject: 1, chapterNumber: 1 }, { unique: true });

module.exports = mongoose.model('Chapter', chapterSchema);
