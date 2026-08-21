require('dotenv').config();
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const chapterRoutes = require('./routes/chapterRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const labManualRoutes = require('./routes/labManualRoutes');
const userRoutes = require('./routes/userRoutes');

// Ensure upload folders exist
const uploadDirs = [
  path.join(__dirname, 'uploads'),
  path.join(__dirname, 'uploads', 'materials'),
  path.join(__dirname, 'uploads', 'labmanuals'),
  path.join(__dirname, 'uploads', 'submissions'),
  path.join(__dirname, 'uploads', 'assignments'),
];

uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

connectDB();

const app = express();

app.set('trust proxy', 1);

// Permissive Helmet headers for cross-origin file embedding
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);

// Bulletproof CORS: Reflects origin dynamically to satisfy credentials: true
const corsOptions = {
  origin: (origin, callback) => {
    // Allows all incoming origins while supporting credentials
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Range',
    'Origin',
  ],
  exposedHeaders: [
    'Content-Disposition',
    'Content-Length',
    'Content-Type',
    'Accept-Ranges',
  ],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Explicit fallback header injector for all routes & files
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

// Static file access
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Parsers & Sanitization
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/lab-manuals', labManualRoutes);
app.use('/api', userRoutes);

app.get('/api/health', (req, res) =>
  res.json({ success: true, message: 'EduManage API is running.' })
);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});