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
    // Base types allowed for all tiers
    const baseAllowed = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    // Pro/Premium only types
    const proAllowed = [
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
      'application/vnd.ms-powerpoint', // ppt
    ];

    const userTier = req.user?.subscription_tier || 'free';
    const isPro = userTier === 'pro' || userTier === 'premium';
    const allAllowed = isPro ? [...baseAllowed, ...proAllowed] : baseAllowed;

    if (allAllowed.includes(file.mimetype)) {
      cb(null, true);
    } else if (proAllowed.includes(file.mimetype) && !isPro) {
      cb(new Error('PPTX upload requires a Pro or Premium plan. Upgrade to unlock!'));
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, TXT, MD, DOCX' + (isPro ? ', PPTX' : '')));
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

/**
 * Folders Routes
 * Base: /api/v1/notes/folders
 * (Must be defined before /:id routes so "folders" isn't treated as an ID)
 */
router.post('/folders', authenticateToken, notesController.createFolder);
router.get('/folders', authenticateToken, notesController.getFolders);
router.delete('/folders/:id', authenticateToken, notesController.deleteFolder);

// Get specific note
router.get('/:id', authenticateToken, notesController.getNote);

// Update note (e.g. change folder)
router.patch('/:id', authenticateToken, notesController.updateNote);

// Delete note
router.delete('/:id', authenticateToken, notesController.deleteNote);

module.exports = router;
