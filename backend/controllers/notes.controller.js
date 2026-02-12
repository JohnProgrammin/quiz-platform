const { v4: uuidv4 } = require('uuid');
const { sql } = require('../config/database.serverless');
const storageService = require('../services/storage.service');
const aiService = require('../services/ai.service');

/**
 * Upload a note file
 * Extracts text content and stores in R2
 */
exports.uploadNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const userId = req.user.id;
    const noteId = uuidv4();
    const file = req.file;

    // Extract text from file
    let contentText = '';
    try {
      // Use storage service to extract text based on file type
      contentText = await storageService.extractTextFromFile(file);
    } catch (error) {
      console.warn('Text extraction failed:', error);
      contentText = `[File: ${file.originalname}]`;
    }

    // Upload to R2
    let fileUrl = '';
    try {
      fileUrl = await storageService.uploadFile(
        file,
        `notes/${userId}/${noteId}/${file.originalname}`
      );
    } catch (storageError) {
      console.error('R2 Storage error:', storageError.message);
      // If R2 fails, use temporary URL - R2 may not be configured
      fileUrl = `file://${file.originalname}`;
    }

    // Save to database using Neon serverless syntax
    const result = await sql`
      INSERT INTO notes (id, user_id, title, filename, file_size, file_type, storage_key, storage_url, content, content_length, word_count, created_at, updated_at)
      VALUES (
        ${noteId},
        ${userId},
        ${file.originalname},
        ${file.originalname},
        ${file.size || 0},
        ${file.mimetype || 'text/plain'},
        ${'notes/' + userId + '/' + noteId + '/' + file.originalname},
        ${fileUrl},
        ${contentText},
        ${contentText.length},
        ${contentText.split(/\s+/).length},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    res.status(201).json({
      message: 'Note uploaded successfully',
      data: result[0],
      remainingQuota: req.remainingNotes,
    });
  } catch (error) {
    console.error('Upload note error:', error);
    const errorMessage = error.message || 'Failed to upload note';
    const statusCode = error.status || 500;
    res.status(statusCode).json({ error: errorMessage });
  }
};

/**
 * Get all notes for user
 */
exports.getNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const userTier = req.user?.subscription_tier || 'free';

    // Get notes for user using Neon serverless syntax
    const notes = await sql`
      SELECT id, title, filename, storage_url, content, created_at
      FROM notes
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    res.status(200).json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to get notes' });
  }
};

/**
 * Get specific note
 */
exports.getNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await sql`
      SELECT * FROM notes
      WHERE id = ${id} AND user_id = ${userId}
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ data: result[0] });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ error: 'Failed to get note' });
  }
};

/**
 * Delete note
 */
exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get note to find file URL using Neon serverless syntax
    const result = await sql`
      SELECT storage_url FROM notes
      WHERE id = ${id} AND user_id = ${userId}
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const fileUrl = result[0].storage_url;

    // Delete from R2
    try {
      await storageService.deleteFile(fileUrl);
    } catch (error) {
      console.warn('R2 deletion failed:', error);
    }

    // Delete from database using Neon serverless syntax
    await sql`
      DELETE FROM notes
      WHERE id = ${id} AND user_id = ${userId}
    `;

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
};
