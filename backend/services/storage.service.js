const AWS = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
require('dotenv').config();

/**
 * Cloudflare R2 Storage Service
 * Handles file uploads to R2 (S3-compatible storage)
 *
 * Environment Variables:
 * - R2_ACCOUNT_ID: Cloudflare Account ID
 * - R2_ACCESS_KEY_ID: R2 API Token Access Key ID
 * - R2_SECRET_ACCESS_KEY: R2 API Token Secret Access Key
 * - R2_BUCKET_NAME: R2 bucket name (e.g., "floraquiz")
 * - R2_PUBLIC_URL: Public URL for accessing files (e.g., "https://storage.floraquiz.com")
 */

class StorageService {
  constructor() {
    const endpoint = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

    this.s3Client = new AWS.S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });

    this.bucketName = process.env.R2_BUCKET_NAME || 'floraquiz';
    this.publicUrl = process.env.R2_PUBLIC_URL || 'https://storage.floraquiz.com';
  }

  /**
   * Generate a unique storage key for a file
   * @param {string} userId - User ID
   * @param {string} filename - Original filename
   * @returns {string} - Storage key in format: notes/userid/timestamp-filename
   */
  generateStorageKey(userId, filename) {
    const timestamp = Date.now();
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '-');
    return `notes/${userId}/${timestamp}-${sanitized}`;
  }

  /**
   * Generate a presigned URL for direct upload to R2
   * Allows client to upload directly to R2 without going through server
   *
   * @param {string} userId - User ID
   * @param {string} filename - Original filename
   * @param {number} expiresIn - URL expiry in seconds (default: 3600)
   * @returns {object} - { url, storageKey }
   */
  async generatePresignedUploadUrl(userId, filename, expiresIn = 3600) {
    try {
      const storageKey = this.generateStorageKey(userId, filename);

      const command = new AWS.PutObjectCommand({
        Bucket: this.bucketName,
        Key: storageKey,
        ContentType: this.getContentType(filename),
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });

      return {
        url,
        storageKey,
        expiresIn,
      };
    } catch (error) {
      console.error('Presigned URL generation error:', error);
      throw new Error('Failed to generate presigned upload URL');
    }
  }

  /**
   * Generate a presigned URL for downloading a file
   * @param {string} storageKey - Storage key of the file
   * @param {number} expiresIn - URL expiry in seconds (default: 3600)
   */
  async generatePresignedDownloadUrl(storageKey, expiresIn = 3600) {
    try {
      const command = new AWS.GetObjectCommand({
        Bucket: this.bucketName,
        Key: storageKey,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      console.error('Presigned download URL generation error:', error);
      throw new Error('Failed to generate presigned download URL');
    }
  }

  /**
   * Get public URL for a file (assuming bucket has public read access)
   * @param {string} storageKey - Storage key of the file
   */
  getPublicUrl(storageKey) {
    return `${this.publicUrl}/${storageKey}`;
  }

  /**
   * Delete a file from R2
   * @param {string} storageKey - Storage key of the file
   */
  async deleteFile(storageKey) {
    try {
      const command = new AWS.DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: storageKey,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      console.error('File deletion error:', error);
      return false;
    }
  }

  /**
   * Delete multiple files
   * @param {string[]} storageKeys - Array of storage keys
   */
  async deleteFiles(storageKeys) {
    try {
      const objects = storageKeys.map((key) => ({ Key: key }));

      const command = new AWS.DeleteObjectsCommand({
        Bucket: this.bucketName,
        Delete: { Objects: objects },
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      console.error('Batch file deletion error:', error);
      return false;
    }
  }

  /**
   * Get file metadata from R2
   * @param {string} storageKey - Storage key of the file
   */
  async getFileMetadata(storageKey) {
    try {
      const command = new AWS.HeadObjectCommand({
        Bucket: this.bucketName,
        Key: storageKey,
      });

      const response = await this.s3Client.send(command);
      return {
        size: response.ContentLength,
        type: response.ContentType,
        lastModified: response.LastModified,
        etag: response.ETag,
      };
    } catch (error) {
      console.error('Get file metadata error:', error);
      return null;
    }
  }

  /**
   * List all files for a user
   * @param {string} userId - User ID
   */
  async listUserFiles(userId) {
    try {
      const command = new AWS.ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: `notes/${userId}/`,
      });

      const response = await this.s3Client.send(command);
      return (response.Contents || []).map((item) => ({
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
      }));
    } catch (error) {
      console.error('List user files error:', error);
      return [];
    }
  }

  /**
   * Determine MIME type from filename
   */
  getContentType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const types = {
      pdf: 'application/pdf',
      txt: 'text/plain',
      md: 'text/markdown',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ppt: 'application/vnd.ms-powerpoint',
    };
    return types[ext] || 'application/octet-stream';
  }

  /**
   * Extract text from uploaded file
   * Supports: PDF, DOCX, TXT, MD, PPTX (Pro/Premium)
   */
  async extractTextFromFile(file) {
    try {
      const ext = file.originalname
        .split('.')
        .pop()
        .toLowerCase();
      const buffer = file.buffer;

      switch (ext) {
        case 'txt':
        case 'md':
          try {
            const text = buffer.toString('utf-8');
            if (!text || text.length < 10) {
              console.error(`⚠️ Text file is empty or too short (${text?.length || 0} chars): ${file.originalname}`);
              throw new Error('File is empty or contains very little text.');
            }
            return text;
          } catch (error) {
            console.error(`❌ Text file parsing failed for ${file.originalname}:`, error.message);
            throw new Error(`Cannot read text file: ${error.message}`);
          }

        case 'pdf':
          try {
            const pdfParse = require('pdf-parse');
            const data = await pdfParse(buffer);
            if (!data.text || data.text.length < 10) {
              console.error(`⚠️ PDF has no readable text (${data.text?.length || 0} chars): ${file.originalname}`);
              throw new Error('PDF contains no readable text. Make sure it\'s not a scanned image.');
            }
            return data.text;
          } catch (error) {
            console.error(`❌ PDF parsing failed for ${file.originalname}:`, error.message);
            throw new Error(`Cannot read PDF: ${error.message}. Make sure it's a text-based PDF, not a scanned image.`);
          }

        case 'docx':
        case 'doc':
          try {
            const mammoth = require('mammoth');
            const result = await mammoth.extractRawText({ buffer });
            if (!result.value || result.value.length < 10) {
              console.error(`⚠️ DOCX has no readable text (${result.value?.length || 0} chars): ${file.originalname}`);
              throw new Error('Document contains no readable text.');
            }
            return result.value;
          } catch (error) {
            console.error(`❌ DOCX parsing failed for ${file.originalname}:`, error.message);
            throw new Error(`Cannot read document: ${error.message}`);
          }

        case 'pptx':
        case 'ppt':
          try {
            const officeParser = require('officeparser');
            // officeParser.parseOfficeAsync accepts a buffer and returns text
            const text = await new Promise((resolve, reject) => {
              officeParser.parseOffice(buffer, (data, err) => {
                if (err) return reject(err);
                resolve(data);
              }, { outputErrorToConsole: false });
            });
            if (!text || text.length < 10) {
              console.error(`⚠️ Presentation has no readable text (${text?.length || 0} chars): ${file.originalname}`);
              throw new Error('Presentation contains no readable text.');
            }
            return text;
          } catch (error) {
            console.error(`❌ Presentation parsing failed for ${file.originalname}:`, error.message);
            throw new Error(`Cannot read presentation: ${error.message}`);
          }

        default:
          return `[File: ${file.originalname}]`;
      }
    } catch (error) {
      console.error('Text extraction error:', error);
      throw error;
    }
  }


  /**
   * Upload file directly (alternative to presigned URLs)
   * Used for server-side file uploads
   */
  async uploadFile(file, key) {
    try {
      const command = new AWS.PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      // Return public URL
      return this.getPublicUrl(key);
    } catch (error) {
      console.error('R2 upload error:', error);
      throw error;
    }
  }

  /**
   * Test R2 connection
   */
  async testConnection() {
    try {
      const command = new AWS.HeadBucketCommand({
        Bucket: this.bucketName,
      });

      await this.s3Client.send(command);
      console.log('✅ R2 connection successful');
      return true;
    } catch (error) {
      console.error('❌ R2 connection failed:', error.message);
      return false;
    }
  }
}

// Singleton instance
const storageService = new StorageService();

module.exports = storageService;
