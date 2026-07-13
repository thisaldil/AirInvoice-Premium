const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { handleOCR } = require('../controllers/ocrController');

const router = express.Router();
const uploadDir = "/tmp/uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const uploadTicket = (req, res, next) => {
  upload.single('ticket')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    next();
  });
};

router.post('/analyze', uploadTicket, handleOCR);

module.exports = router;
