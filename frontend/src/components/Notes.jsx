import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import UpgradeQuotaModal from './UpgradeQuotaModal';
import { uploadNote, getNotes, deleteNote, generateQuiz } from '../api';
import { useSubscription } from '../contexts/SubscriptionContext';
import {
  Upload, FileText, Trash2, Sparkles, Loader2,
  Crown, CheckCircle2, ArrowRight
} from 'lucide-react';

// File type icons
const getFileIcon = (filename = '') => {
  const ext = filename.split('.').pop().toLowerCase();
  if (ext === 'pdf') return '📄';
  if (ext === 'pptx' || ext === 'ppt') return '📊';
  if (ext === 'docx' || ext === 'doc') return '📝';
  return '📃';
};

function Notes({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tier } = useSubscription();
  const fileInputRef = useRef(null);

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(null);
  const [questionCount, setQuestionCount] = useState(15);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaError, setQuotaError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const isFree = tier === 'free';
  const isPro = tier === 'pro' || tier === 'premium';
  const noteLimit = isFree ? 3 : Infinity;
  const canUploadMore = notes.length < noteLimit;
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('idle'); // idle | uploading | success
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Accepted file types (PPTX only for pro+)
  const acceptAttr = isPro
    ? '.pdf,.txt,.md,.docx,.doc,.pptx,.ppt'
    : '.pdf,.txt,.md,.docx,.doc';

  useEffect(() => { loadNotes(); }, []);

  const loadNotes = async () => {
    try {
      const response = await getNotes();
      setNotes(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const processFile = async (file) => {
    if (!file) return;

    // Client-side PPTX guard for free tier
    const isPptx = /\.(pptx|ppt)$/i.test(file.name) ||
      file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      file.type === 'application/vnd.ms-powerpoint';

    if (isPptx && isFree) {
      toast('🚀 Upgrade to Pro to upload PowerPoint files!', {
        description: 'PPTX/PPT upload is a Pro feature. Upgrade for unlimited files, AI feedback, and more.',
        action: {
          label: 'Upgrade →',
          onClick: () => window.location.href = '/pricing',
        },
        duration: 6000,
        icon: '👑',
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (!canUploadMore) {
      toast.warning(`You've used all ${noteLimit} free notes. Upgrade to Pro for unlimited uploads! 🚀`, {
        action: { label: 'Upgrade →', onClick: () => window.location.href = '/pricing' },
        duration: 5000,
      });
      return;
    }

    setUploadStage('uploading');
    setUploadedFileName(file.name);
    setUploadProgress(0);
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    // Animate progress bar
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 18 + 5;
      if (prog > 90) prog = 90;
      setUploadProgress(Math.round(prog));
    }, 200);

    try {
      await uploadNote(formData);
      clearInterval(interval);
      setUploadProgress(100);
      setUploadStage('success');
      setTimeout(() => { setUploadStage('idle'); setUploadProgress(0); }, 2200);
      toast.success('Note uploaded successfully! 🎉');
      loadNotes();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      clearInterval(interval);
      setUploadStage('idle');
      setUploadProgress(0);
      if (error.response?.status === 429) {
        const data = error.response.data;
        setQuotaError({ type: 'notes', limit: data.limit || 3, used: data.used || notes.length });
        setShowQuotaModal(true);
      } else if (error.response?.status === 403 || error.response?.data?.requiredTier) {
        const required = error.response?.data?.requiredTier || 'Pro';
        toast('🚀 Upgrade required', {
          description: `This file type requires a ${required} subscription.`,
          action: { label: 'Upgrade →', onClick: () => window.location.href = '/pricing' },
          duration: 6000,
        });
      } else if (error.response?.status === 415) {
        toast('Unsupported file type 📎', {
          description: 'Please upload a PDF, TXT, MD, or DOCX file. Pro users can also upload PPTX.',
          duration: 4000,
        });
      } else {
        const msg = error.response?.data?.error || error.message || 'Upload failed. Please try again.';
        toast.error(msg);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e) => processFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete note');
    }
  };

  const handleGenerateQuiz = async (noteId) => {
    setGeneratingQuiz(noteId);
    try {
      const response = await generateQuiz({ noteId, questionCount });
      if (!response.data?.id) throw new Error('Invalid response from server');
      navigate(`/quiz/${response.data.id}`);
    } catch (error) {
      if (error.response?.status === 429) {
        const data = error.response.data;
        setQuotaError({ type: 'quizzes', limit: data.limit || 5, used: data.used || 5 });
        setShowQuotaModal(true);
      } else {
        toast.error(error.response?.data?.error || error.message || 'Quiz generation failed');
      }
      setGeneratingQuiz(null);
    }
  };

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  };

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-ink">{t('notes.myNotes')}</h1>
            <p className="text-slate font-bold mt-1">Upload a file → generate a quiz instantly</p>
          </div>
          <div className="flex items-center gap-2 bg-white border-2 border-border rounded-2xl px-3 sm:px-5 py-2 sm:py-3 scale-90 sm:scale-100 origin-right">
            {isFree ? (
              <>
                <span className="text-2xl font-black text-ink">{notes.length}<span className="text-muted">/3</span></span>
                <button onClick={() => navigate('/pricing')} className="btn-primary text-xs py-1.5 px-3 ml-2">Upgrade</button>
              </>
            ) : (
              <>
                <span className="text-2xl font-black text-violet-500">∞</span>
                <span className="text-xs font-black text-violet-500 ml-1">Unlimited</span>
              </>
            )}
          </div>
        </motion.div>

        {/* Upload Zone */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className={`relative bg-white rounded-3xl border-2 border-dashed mb-8 transition-all duration-200 overflow-hidden
            ${dragOver ? 'border-violet-500 bg-violet-50/60 scale-[1.01]' : 'border-border hover:border-violet-400'}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {/* === Animated Upload Zone === */}
          <label htmlFor="file-upload" className={`block p-4 sm:p-10 text-center select-none ${uploadStage === 'uploading' ? 'pointer-events-none' : 'cursor-pointer'}`}>
            <input ref={fileInputRef} type="file" accept={acceptAttr} onChange={handleFileInput} disabled={uploading} className="hidden" id="file-upload" />

            <AnimatePresence mode="wait">
              {/* IDLE */}
              {uploadStage === 'idle' && (
                <motion.div key="idle" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
                  <motion.div
                    animate={dragOver ? { scale: 1.1, rotate: -6 } : { scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 ${dragOver ? 'bg-violet-100' : 'bg-violet-50'}`}
                  >
                    <Upload className={`w-9 h-9 ${dragOver ? 'text-violet-600' : 'text-violet-400'}`} />
                  </motion.div>
                  <p className="text-xl font-black text-ink mb-1">
                    {dragOver ? '🎯 Drop it!' : 'Click or drag a file here'}
                  </p>
                  <p className="text-sm font-bold text-muted">
                    PDF, TXT, MD, DOCX
                    {isPro && <span className="ml-2 inline-flex items-center gap-1 text-violet-500"><Crown className="w-3.5 h-3.5" /> PPTX</span>}
                    {!isPro && <span className="ml-2 text-muted/60">— PPTX on Pro</span>}
                  </p>
                </motion.div>
              )}

              {/* UPLOADING */}
              {uploadStage === 'uploading' && (
                <motion.div key="uploading" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="py-2">
                  {/* Animated file icon */}
                  <div className="relative w-20 h-20 mx-auto mb-5">
                    <motion.div
                      className="w-20 h-20 rounded-3xl bg-violet-100 flex items-center justify-center"
                      animate={{ boxShadow: ['0 0 0 0px rgba(124,91,252,0.3)', '0 0 0 12px rgba(124,91,252,0)', '0 0 0 0px rgba(124,91,252,0)'] }}
                      transition={{ repeat: Infinity, duration: 1.6, ease: 'easeOut' }}
                    >
                      <FileText className="w-9 h-9 text-violet-500" />
                    </motion.div>
                    {/* Orbiting dot */}
                    <motion.div
                      className="absolute top-0 right-0 w-5 h-5 rounded-full bg-violet-500 border-2 border-white flex items-center justify-center"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                      style={{ transformOrigin: '-8px 28px' }}
                    >
                      <Loader2 className="w-3 h-3 text-white animate-spin" />
                    </motion.div>
                  </div>

                  <p className="text-lg font-black text-ink mb-1">Uploading your note…</p>
                  <p className="text-xs font-bold text-muted mb-5 truncate max-w-[200px] mx-auto">{uploadedFileName}</p>

                  {/* Progress bar */}
                  <div className="w-full max-w-[280px] mx-auto bg-violet-100 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-violet-400 to-indigo-500 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ ease: 'easeOut', duration: 0.3 }}
                    />
                  </div>
                  <p className="text-xs font-black text-violet-500 mt-2">{uploadProgress}%</p>
                </motion.div>
              )}

              {/* SUCCESS */}
              {uploadStage === 'success' && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }} className="py-2">
                  <motion.div
                    className="w-20 h-20 rounded-3xl bg-green-100 flex items-center justify-center mx-auto mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.4, times: [0, 0.6, 1] }}
                  >
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </motion.div>
                  <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl font-black text-green-600">
                    Note uploaded! 🎉
                  </motion.p>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="text-sm font-bold text-muted mt-1">
                    AI quiz is ready to generate
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </label>

          {/* Pro PPTX badge */}
          {!isPro && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-xs font-black px-3 py-1.5 rounded-full cursor-pointer"
              onClick={() => navigate('/pricing')}>
              <Crown className="w-3 h-3" /> Unlock PPTX
            </div>
          )}
        </motion.div>

        {/* Notes List */}
        <div className="bg-white rounded-3xl border-2 border-border overflow-hidden">
          <div className="px-6 py-5 border-b-2 border-border flex items-center justify-between">
            <h2 className="text-xl font-black text-ink flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-500" />
              {t('notes.myNotes')} ({notes.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-16 text-center">
              <Loader2 className="w-10 h-10 text-violet-400 animate-spin mx-auto" />
              <p className="text-slate font-bold mt-4">{t('common.loading')}</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 rounded-full bg-violet-50 border-2 border-border flex items-center justify-center mx-auto mb-5">
                <FileText className="w-10 h-10 text-violet-300" />
              </div>
              <h3 className="text-xl font-black text-ink mb-2">{t('notes.noNotes')}</h3>
              <p className="text-slate font-bold">{t('notes.createNote')}</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="divide-y-2 divide-border"
            >
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  variants={itemVariants}
                  className="px-6 py-5 hover:bg-violet-50/40 transition-all duration-200 flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                      {getFileIcon(note.filename || note.title)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-ink truncate group-hover:text-violet-600 transition-colors">
                        {note.title}
                      </h3>
                      <p className="text-sm font-bold text-muted mt-0.5">
                        {new Date(note.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Question count slider (Pro only) */}
                    {isPro && (
                      <div className="hidden md:flex items-center gap-2 bg-surface px-3 py-2 rounded-xl border border-border">
                        <span className="text-xs font-black text-ink w-6 text-right">{questionCount}</span>
                        <input
                          type="range" min="5" max="30" value={questionCount}
                          onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                          className="w-20 accent-violet-500"
                        />
                        <span className="text-xs text-muted">Qs</span>
                      </div>
                    )}

                    <button
                      onClick={() => handleGenerateQuiz(note.id)}
                      disabled={!!generatingQuiz}
                      className="btn-primary flex items-center gap-2 text-sm py-2 px-4 whitespace-nowrap"
                    >
                      {generatingQuiz === note.id
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                        : <><Sparkles className="w-4 h-4" /> Quiz it</>
                      }
                    </button>

                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-2.5 rounded-xl text-muted hover:text-heart hover:bg-red-50 transition-all"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {showQuotaModal && quotaError && (
        <UpgradeQuotaModal
          type={quotaError.type}
          limit={quotaError.limit}
          used={quotaError.used}
          onClose={() => setShowQuotaModal(false)}
        />
      )}
    </>
  );
}

export default Notes;
