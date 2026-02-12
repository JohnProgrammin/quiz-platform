const express = require('express');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');
const { checkNoteQuota } = require('../middleware/featureGate');
const notesController = require('../controllers/notes.controller');

const router = express.Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, TXT, MD, DOCX'));
    }
  },
});

/**
 * Notes Routes
 * Base: /api/v1/notes
 */

// Upload a new note
router.post('/', authenticateToken, upload.single('file'), checkNoteQuota, notesController.uploadNote);

// Get all notes for user (with tier-based limits)
router.get('/', authenticateToken, notesController.getNotes);

// Get specific note
router.get('/:id', authenticateToken, notesController.getNote);

// Delete note
router.delete('/:id', authenticateToken, notesController.deleteNote);

module.exports = router;
