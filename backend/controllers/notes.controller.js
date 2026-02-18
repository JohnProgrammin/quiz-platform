const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../config/database.serverless');
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

    // Save to database using Supabase
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        id: noteId,
        user_id: userId,
        title: file.originalname,
        filename: file.originalname,
        file_size: file.size || 0,
        file_type: file.mimetype || 'text/plain',
        storage_key: 'notes/' + userId + '/' + noteId + '/' + file.originalname,
        storage_url: fileUrl,
        content: contentText,
        content_length: contentText.length,
        word_count: contentText.split(/\s+/).length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      throw new Error(error.message);
    }

    res.status(201).json({
      message: 'Note uploaded successfully',
      data: data?.[0],
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

    // Get notes for user using Supabase
    const { data: notes, error } = await supabase
      .from('notes')
      .select('id, title, filename, storage_url, content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({ data: notes || [] });
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

    const { data: result, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !result) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ data: result });
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

    // Get note to find file URL using Supabase
    const { data: result, error: selectError } = await supabase
      .from('notes')
      .select('storage_url')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (selectError || !result) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const fileUrl = result.storage_url;

    // Delete from R2
    try {
      await storageService.deleteFile(fileUrl);
    } catch (storageError) {
      console.warn('R2 deletion failed:', storageError);
    }

    // Delete from database using Supabase
    const { error: deleteError } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
};
