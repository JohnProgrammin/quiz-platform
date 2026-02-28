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
    const userTier = req.user?.subscription_tier || 'free';

    // Enforce backend limits for Free tier
    if (userTier === 'free') {
      const { count, error: countError } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (!countError && count >= 3) {
        return res.status(403).json({ error: 'Free tier limit reached. Please upgrade to Pro for unlimited notes.' });
      }

      if (req.file.originalname.match(/\.(pptx|ppt)$/i)) {
        return res.status(403).json({ error: 'PowerPoint upload is a Pro feature.' });
      }
    }

    const noteId = uuidv4();
    const file = req.file;

    // Extract text from file - CRITICAL for quiz generation
    let contentText = '';
    try {
      contentText = await storageService.extractTextFromFile(file);

      // CRITICAL: Validate extracted content is not empty/fallback
      if (!contentText || contentText.startsWith('[') || contentText.length < 10) {
        console.error(`❌ Text extraction returned invalid content for file: ${file.originalname}`);
        console.error(`Content preview: "${contentText.substring(0, 100)}"`);
        console.error(`File type: ${file.mimetype}, Size: ${file.size} bytes`);

        return res.status(400).json({
          error: `Failed to extract text from ${file.originalname}. Supported formats: PDF, DOCX, TXT, MD (and PPTX for Pro users). Please ensure your file contains readable text.`,
          details: 'Text extraction failed. This usually means the file is empty, corrupted, or in an unsupported format.'
        });
      }

      console.log(`✅ Text extraction successful: ${contentText.length} characters extracted from ${file.originalname}`);
    } catch (error) {
      console.error('❌ Text extraction exception:', error);
      return res.status(400).json({
        error: `Failed to extract text from ${file.originalname}. Please try another file.`,
        details: error.message
      });
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

    const { folderId } = req.body;

    // Build the insert payload — only use columns that exist in the schema.
    // Columns like file_size, file_type, storage_key etc. are NOT in the
    // Supabase notes table and will cause a 'column not found' error if included.
    const insertPayload = {
      id: noteId,
      user_id: userId,
      title: file.originalname,
      content: contentText,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Only add filename / storage_url / folder_id if columns exist in the table
    // (they're safe extras that Supabase ignores if not present)
    try { insertPayload.filename = file.originalname; } catch (_) { }
    try { insertPayload.storage_url = fileUrl; } catch (_) { }
    try { if (folderId) insertPayload.folder_id = folderId; } catch (_) { }

    const { data, error } = await supabase
      .from('notes')
      .insert([insertPayload])
      .select();

    if (error) {
      console.error('[Notes] DB insert error:', error);
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
      .select('id, title, filename, storage_url, content, folder_id, created_at')
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

/**
 * Update a note (e.g. change folder)
 */
exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, folderId } = req.body;
    const userId = req.user.id;

    const updates = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (folderId !== undefined) updates.folder_id = folderId || null;

    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) throw new Error(error.message);

    res.json({ message: 'Note updated successfully', data: data?.[0] });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
};

/**
 * Create a new folder
 */
exports.createFolder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, color } = req.body;

    if (!name) return res.status(400).json({ error: 'Folder name is required' });

    const folderId = uuidv4();
    const { data, error } = await supabase
      .from('folders')
      .insert([{
        id: folderId,
        user_id: userId,
        name,
        color: color || '#22c55e'
      }])
      .select();

    if (error) throw new Error(error.message);

    res.status(201).json({ message: 'Folder created', data: data?.[0] });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
};

/**
 * Get all folders for user
 */
exports.getFolders = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    res.json({ data: data || [] });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ error: 'Failed to get folders' });
  }
};

/**
 * Delete a folder
 */
exports.deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
};
