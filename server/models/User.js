const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    password: { type: String, required: true, minlength: 8, select: false },

    // 'student' or 'admin'
    role: { type: String, enum: ['student', 'admin'], required: true, default: 'student' },

    // Only used when role === 'admin'
    adminRole: {
      type: String,
      enum: ['super_admin', 'content_admin', 'faculty_admin', null],
      default: null,
    },

    // Only used when role === 'student'
    studentId: { type: String, unique: true, sparse: true, trim: true },
    semester: { type: Number, min: 1, max: 12 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
