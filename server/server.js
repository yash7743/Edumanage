require('dotenv').config();
require('dns').setServers(['8.8.8.8', '8.8.4.4']);
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

connectDB();

const app = express();

// --- Security middleware ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use(mongoSanitize()); // strips $ / . operators from req.body/query/params
app.use(xss()); // sanitizes user input to prevent XSS

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
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
app.use('/api', userRoutes); // /api/students, /api/admins, /api/dashboard/stats

app.get('/api/health', (req, res) => res.json({ success: true, message: 'EduManage API is running.' }));

// NOTE: uploaded files are intentionally NOT served via express.static.
// All downloads go through authenticated controller routes (see chapter/
// assignment/submission/labManual controllers) so files require a valid
// session and pass through role checks before being sent.

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`EduManage server running on port ${PORT}`));
