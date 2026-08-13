const mongoose = require('mongoose');

const labManualSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
    description: { type: String, trim: true, default: '' },
    file: {
      originalName: String,
      storedName: String,
      path: String,
      mimeType: String,
      size: Number,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LabManual', labManualSchema);
