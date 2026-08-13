const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    file: {
      originalName: String,
      storedName: String,
      path: String,
      mimeType: String,
      size: Number,
    },
    submittedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['submitted', 'late', 'evaluated'],
      default: 'submitted',
    },
    marks: { type: Number, default: null },
    feedback: { type: String, default: '' },
  },
  { timestamps: true }
);

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
