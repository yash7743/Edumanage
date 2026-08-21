const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/x-pdf',
  'application/acrobat',
  'applications/pdf',
  'text/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'application/octet-stream',
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.doc', '.docx', '.ppt', '.pptx']);

const makeStorage = (subfolder) => {
  const uploadDir = path.resolve(__dirname, '..', 'uploads', subfolder);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Randomized server-side filename
      const randomName = crypto.randomBytes(24).toString('hex');
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${randomName}${ext}`);
    },
  });
};

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(
      new Error('Unsupported file extension. Allowed: PDF, DOC, DOCX, PPT, PPTX.'),
      false
    );
  }

  cb(null, true);
};

const maxSize = (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 25) * 1024 * 1024;

const createUploader = (subfolder) =>
  multer({
    storage: makeStorage(subfolder),
    fileFilter,
    limits: { fileSize: maxSize, files: 1 },
  });

module.exports = { createUploader };