const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },

    // 'student' or 'admin'
    role: {
      type: String,
      enum: {
        values: ['student', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      required: true,
      default: 'student',
    },

    // Only applicable when role === 'admin'
    adminRole: {
      type: String,
      enum: {
        values: ['super_admin', 'content_admin', 'faculty_admin', null],
        message: '{VALUE} is not a valid admin role',
      },
      default: null,
    },

    // Only applicable when role === 'student'
    studentId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    semester: {
      type: Number,
      min: [1, 'Semester cannot be less than 1'],
      max: [12, 'Semester cannot exceed 12'],
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Safe sanitization helper (removes sensitive data)
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);