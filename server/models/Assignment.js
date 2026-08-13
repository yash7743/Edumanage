const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
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
    startDate: { type: Date, required: true },
    deadline: { type: Date, required: true },
    maxMarks: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
