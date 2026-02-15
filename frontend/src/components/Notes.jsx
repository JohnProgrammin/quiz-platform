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
      setNotes(response.data.data || response.data || []);
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
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-ink leading-tight mb-2">
              {t('notes.myNotes')}
            </h1>
            <p className="text-lg text-slate font-semibold">{t('notes.dragDropFile')}</p>
          </div>
          {isFree && (
            <div className="bg-white border border-gray-300 rounded-lg px-6 py-4 text-right shadow-sm hidden sm:block">
              <p className="font-black text-ink text-lg">{notes.length}/3</p>
              <p className="text-xs font-semibold text-slate mt-1">{t('subscription.free')} {t('subscription.plan')}</p>
            </div>
          )}
        </div>

        {/* Tier Limits Banner */}
        {!canUploadMore && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-6 mb-10 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-black text-danger text-lg">{t('notes.maxNotesReached')}</p>
                <p className="text-sm font-semibold text-slate mt-1">{t('subscription.unlimitedNotes')} with a Pro subscription.</p>
              </div>
              <button
                onClick={() => navigate('/pricing')}
                className= disabled:opacity-50"inline-flex items-center px-6 py-3 bg-brand-500 text-white font-black rounded-lg hover:bg-brand-600 transition-colors whitespace-nowrap"
              >
                {t('subscription.upgrade')}
              </button>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white border border-gray-300 rounded-lg p-8 mb-10 shadow-sm">
          {uploadMessage && (
            <div
              className={`mb-6 p-4 rounded-xl font-bold text-sm text-center border-2 ${
                uploadMessage.includes('success')
                  ? 'bg-green-50 text-brand-600 border-brand-300'
                  : 'bg-red-50 text-danger border-red-300'
              }`}
            >
              {uploadMessage}
            </div>
          )}

          <label
            htmlFor="file-upload"
            className="block border-2 border-dashed border-gray-400 rounded-lg p-12 text-center cursor-pointer hover:border-brand-500 hover:bg-green-50 transition-all duration-300"
          >
            <input
              type="file"
              accept=".pdf,.txt,.md"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="file-upload"
            />
            <div className="w-16 h-16 rounded-lg bg-brand-50 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-brand-500" />
            </div>
            <span className="text-2xl font-black text-ink block mb-2">
              {uploading ? t('common.loading') : 'Click or drag files here'}
            </span>
            <span className="text-sm font-semibold text-slate">Supported: PDF, TXT, or Markdown</span>
          </label>
        </div>

        {/* Notes List */}
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-8 py-7 border-b border-gray-200 bg-white">
            <h2 className="text-2xl font-black text-ink">{t('notes.myNotes')} ({notes.length})</h2>
          </div>

          {/* Content */}
          {loading ? (
            <div className="p-16 text-center">
              <Loader className="w-10 h-10 text-brand-500 animate-spin mx-auto" />
              <p className="text-slate font-bold mt-4">{t('common.loading')}</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6 border border-gray-300">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-black text-ink mb-3">{t('notes.noNotes')}</h3>
              <p className="text-slate font-semibold">{t('notes.createNote')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="px-8 py-6 hover:bg-green-50 transition-all duration-200 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 rounded-lg bg-brand-50 flex items-center justify-center group-hover:shadow-md transition-all">
                      <FileText className="w-7 h-7 text-brand-500" />
                    </div>
                    <div>
                      <h3 className="font-black text-ink text-lg group-hover:text-brand-500 transition-colors">
                        {note.title}
                      </h3>
                      <p className="text-sm font-semibold text-slate mt-1">
                        {new Date(note.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-4 flex-wrap justify-end gap-y-3 sm:gap-y-0">
                    {!isFree && (
                      <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl">
                        <span className="text-sm font-semibold text-slate">{questionCount}</span>
                        <input
                          type="range"
                          min="10"
                          max="30"
                          value={questionCount}
                          onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                          className="w-20"
                        />
                      </div>
                    )}
                    <button
                      onClick={() => handleGenerateQuiz(note.id)}
                      disabled={generatingQuiz === note.id}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-brand-500 text-white font-black rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50 whitespace-nowrap"
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
                      className="p-2 text-slate hover:text-danger hover:bg-red-50 rounded-xl transition-all duration-200"
                      title="Delete note"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
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
