import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';
import UpgradePrompt from './UpgradePrompt';
import { uploadNote, getNotes, deleteNote, generateQuiz } from '../api';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Upload, FileText, Trash2, Sparkles, Loader, Lock } from 'lucide-react';

function Notes({ user, onLogout }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { subscription, tier } = useSubscription();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [questionCount, setQuestionCount] = useState(15);

  // Tier-based limits
  const isFree = tier === 'free';
  const noteLimit = isFree ? 3 : Infinity;
  const canUploadMore = notes.length < noteLimit;

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const response = await getNotes();
      setNotes(response.data);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check tier limits
    if (!canUploadMore) {
      setUploadMessage(`Note limit reached (${noteLimit} max for ${tier} users). Upgrade to Pro for unlimited notes.`);
      return;
    }

    setUploading(true);
    setUploadMessage('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    try {
      console.log('[Notes] Uploading file:', {
        name: file.name,
        size: file.size,
        type: file.type,
        token: localStorage.getItem('token') ? 'present' : 'missing'
      });
      await uploadNote(formData);
      setUploadMessage('Note uploaded successfully!');
      loadNotes();
      e.target.value = '';
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.details || error.message || 'Unknown error';
      console.error('[Notes] Upload failed:', {
        status: error.response?.status,
        error: errorMsg,
        details: error.response?.data
      });
      setUploadMessage('Error uploading note: ' + errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await deleteNote(id);
      loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleGenerateQuiz = async (noteId) => {
    setGeneratingQuiz(noteId);
    setUploadMessage('');

    try {
      const response = await generateQuiz({ noteId, questionCount });
      if (!response.data || !response.data.id) {
        throw new Error('Invalid response from server');
      }
      // Navigate to new quiz (always a fresh one with unique ID)
      navigate(`/quiz/${response.data.id}`);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
      setUploadMessage('Error generating quiz: ' + errorMsg);
      setGeneratingQuiz(null);
      console.error('Quiz generation failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-ink">{t('notes.myNotes')}</h1>
              <p className="text-slate font-semibold mt-1">{t('notes.dragDropFile')}</p>
            </div>
            {isFree && (
              <div className="bg-amber-50 border-2 border-amber-500 rounded-2xl px-4 py-3 text-right">
                <p className="font-bold text-ink">{notes.length}/3 {t('notes.notes')}</p>
                <p className="text-xs font-semibold text-slate mt-1">{t('subscription.free')} {t('subscription.plan')} {t('common.cancel').toLowerCase()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tier Limits Banner */}
        {!canUploadMore && (
          <div className="card p-6 mb-8 bg-red-50 border-2 border-danger">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-danger">{t('notes.maxNotesReached')}</p>
                <p className="text-sm font-semibold text-slate mt-1">{t('subscription.unlimitedNotes')} on the {t('subscription.free')} plan.</p>
              </div>
              <button
                onClick={() => navigate('/pricing')}
                className="btn-primary text-sm"
              >
                {t('subscription.upgrade')} to Pro
              </button>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="card p-6 mb-8">
          {uploadMessage && (
            <div
              className={`mb-4 p-4 rounded-2xl font-bold text-sm text-center border-2 ${
                uploadMessage.includes('success')
                  ? 'bg-green-50 text-brand-500 border-brand-500'
                  : 'bg-red-50 text-danger border-danger'
              }`}
            >
              {uploadMessage}
            </div>
          )}

          <label
            htmlFor="file-upload"
            className="block border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-all"
          >
            <input
              type="file"
              accept=".pdf,.txt,.md"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="file-upload"
            />
            <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-7 h-7 text-brand-500" />
            </div>
            <span className="text-lg font-extrabold text-ink block mb-1">
              {uploading ? t('common.loading') : t('notes.uploadFile')}
            </span>
            <span className="text-sm font-semibold text-slate">PDF, TXT, or MD {t('common.cancel').toLowerCase()}</span>
          </label>
        </div>

        {/* Notes List */}
        <div className="card">
          <div className="px-6 py-4 border-b-2 border-border">
            <h2 className="text-lg font-extrabold text-ink">{t('notes.myNotes')} ({notes.length})</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader className="w-8 h-8 text-brand-500 animate-spin mx-auto" />
              <p className="text-slate font-bold mt-3">{t('common.loading')}</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-muted" />
              </div>
              <h3 className="text-lg font-extrabold text-ink mb-2">{t('notes.noNotes')}</h3>
              <p className="text-slate font-semibold">{t('notes.createNote')}</p>
            </div>
          ) : (
            <div>
              {notes.map((note) => (
                <div key={note.id} className="px-6 py-4 border-b-2 border-border last:border-0 hover:bg-surface transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-brand-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-ink">{note.title}</h3>
                        <p className="text-sm font-semibold text-slate">
                          {new Date(note.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {!isFree && (
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-semibold text-slate">{t('quiz.question')}:</label>
                          <input
                            type="range"
                            min="10"
                            max="30"
                            value={questionCount}
                            onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                            className="w-24"
                          />
                          <span className="text-sm font-bold text-ink w-8">{questionCount}</span>
                        </div>
                      )}
                      <button
                        onClick={() => handleGenerateQuiz(note.id)}
                        disabled={generatingQuiz === note.id}
                        className="btn-primary text-sm py-2 px-4 flex items-center gap-2 disabled:opacity-50"
                      >
                        {generatingQuiz === note.id ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            {t('common.loading')}
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            {t('notes.generateQuiz')}
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-2 text-slate hover:text-danger hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notes;
