import React, { useState, useRef, useEffect } from 'react';
import { Star, Plus, X, Volume2, Play, Pause, Image as ImageIcon, Mic, Square, Music, Calendar, Clock, Sparkles, Trash2 } from 'lucide-react';
import { playMagicBell } from '../utils/audio';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export default function MemoriesScreen({ gardenItems = [], onAddGardenItem, onDeleteGardenItem, currentPartner }) {
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [filter, setFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for Add Memory
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Memories');
  const [selectedEmoji, setSelectedEmoji] = useState('🌟');
  
  const [memoryDate, setMemoryDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [includeTime, setIncludeTime] = useState(false);
  const [memoryTime, setMemoryTime] = useState('19:30');

  // Media attachments
  const [attachedPhoto, setAttachedPhoto] = useState('');
  const [attachedVoiceUrl, setAttachedVoiceUrl] = useState('');
  const [attachedSong, setAttachedSong] = useState('');
  const [isClassifyingAI, setIsClassifyingAI] = useState(false);

  // MediaRecorder Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [micPermissionError, setMicPermissionError] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Categories
  const categories = ['All', 'Photos', 'Voice', 'Songs', 'Dates', 'Trips', 'Milestones'];

  // Filter real memories from gardenItems (zero fake data!)
  const realMemories = gardenItems.filter(item => 
    !item.category || item.category === 'Memories' || item.category === 'Photos' || item.category === 'Voice' || item.category === 'Songs' || item.category === 'Dates' || item.category === 'Trips' || item.category === 'Milestones' || item.category === 'Timeline'
  );

  const filteredMemories = realMemories.filter((m) => {
    if (filter === 'All') return true;
    return m.category === filter;
  });

  const getSupportedMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/aac',
      ''
    ];
    for (const t of types) {
      if (!t || (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t))) {
        return t;
      }
    }
    return '';
  };

  // Start Live Audio Recording
  const startVoiceRecording = async () => {
    setMicPermissionError('');
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : undefined;
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalMime = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: finalMime });
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setAttachedVoiceUrl(reader.result);
          }
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach(track => track.stop());
        clearInterval(timerRef.current);
        setIsRecording(false);
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone permission error:', err);
      setMicPermissionError('Microphone permission denied or not supported on this device.');
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Native Image File Upload Handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveMemory = () => {
    if (!newTitle.trim()) return;
    playMagicBell();

    const formattedDate = includeTime ? `${memoryDate} at ${memoryTime}` : memoryDate;

    const newMemoryItem = {
      id: Date.now().toString(),
      author: currentPartner || 'Naitik',
      type: 'flower',
      category: selectedCategory || 'Memories',
      emoji: selectedEmoji || '🌟',
      title: newTitle.trim(),
      text: newDesc.trim(),
      date: formattedDate,
      photoUrl: attachedPhoto,
      voiceUrl: attachedVoiceUrl,
      song: attachedSong
    };

    if (onAddGardenItem) {
      onAddGardenItem(newMemoryItem);
    }

    // Reset Form
    setNewTitle('');
    setNewDesc('');
    setAttachedPhoto('');
    setAttachedVoiceUrl('');
    setAttachedSong('');
    setIsAddModalOpen(false);
  };

  const formatSecs = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={26} color="#EE7B7B" />
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: '#3D2C2E', fontWeight: 700 }}>
              Our Memories 💕
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: '#8C7A7C', marginTop: '2px' }}>
            Moments, photos, voice notes & trips saved by Naitik & Raj
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          style={{
            padding: '10px 20px', borderRadius: '20px',
            backgroundColor: 'var(--brand-primary)', border: 'none',
            color: '#FFF', fontSize: '13px', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '6px',
            cursor: 'pointer', boxShadow: '0 4px 14px rgba(238,123,123,0.3)'
          }}
        >
          <Plus size={16} /> Add New Memory
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '20px' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: '8px 16px', borderRadius: '18px',
              border: 'none',
              backgroundColor: filter === cat ? '#3D2C2E' : '#FFF9F4',
              color: filter === cat ? '#FFF' : '#8C7A7C',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
            }}
          >
            {cat} ({cat === 'All' ? realMemories.length : realMemories.filter(m => m.category === cat).length})
          </button>
        ))}
      </div>

      {/* Memories Polaroid Grid */}
      {filteredMemories.length === 0 ? (
        <div style={{
          backgroundColor: '#FFF9F4',
          borderRadius: '24px',
          padding: '40px',
          textAlign: 'center',
          border: '1px dashed #EE7B7B'
        }}>
          <span style={{ fontSize: '36px' }}>📸</span>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: '#3D2C2E', marginTop: '10px' }}>
            No memories saved in this category
          </h3>
          <p style={{ fontSize: '13px', color: '#8C7A7C', marginTop: '4px' }}>
            Click "+ Add New Memory" to record photos, voice notes, or trip memories!
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {filteredMemories.map((m) => (
            <div
              key={m.id}
              onClick={() => setSelectedMemory(m)}
              style={{
                backgroundColor: '#FFF',
                borderRadius: '20px',
                padding: '16px',
                border: '1px solid #E0D4C5',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div>
                {/* Photo or Emoji Hero */}
                {m.photoUrl ? (
                  <div style={{ width: '100%', height: '160px', borderRadius: '14px', overflow: 'hidden', marginBottom: '12px' }}>
                    <img src={m.photoUrl} alt={m.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{
                    width: '100%', height: '120px', borderRadius: '14px',
                    backgroundColor: '#FFF7F0', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '42px', marginBottom: '12px'
                  }}>
                    {m.emoji || '📸'}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '10px', color: '#EE7B7B', fontWeight: 700, backgroundColor: '#FFF0F0', padding: '2px 8px', borderRadius: '8px' }}>
                    {m.category || 'Memories'}
                  </span>
                  <span style={{ fontSize: '10px', color: '#8C7A7C' }}>
                    {m.date || 'Recently'}
                  </span>
                </div>

                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 700, color: '#3D2C2E' }}>
                  {m.title}
                </h3>

                {m.text && (
                  <p style={{ fontSize: '12px', color: '#6A5658', marginTop: '4px', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    "{m.text}"
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #F0E4D8' }}>
                <span style={{ fontSize: '11px', color: '#EE7B7B', fontWeight: 600 }}>
                  Saved by {m.author}
                </span>

                {onDeleteGardenItem && m.author === currentPartner && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteGardenItem(m.id);
                    }}
                    title="Delete Memory"
                    style={{ backgroundColor: '#FDE8E8', border: 'none', borderRadius: '8px', padding: '4px 8px', color: '#EE7B7B', cursor: 'pointer' }}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Selected Memory Modal */}
      {selectedMemory && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 20, 40, 0.75)', backdropFilter: 'blur(8px)',
          zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFF', borderRadius: '28px', padding: '28px',
            width: '100%', maxWidth: '480px', maxHeight: '85vh', overflowY: 'auto',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)', position: 'relative'
          }}>
            <button
              onClick={() => setSelectedMemory(null)}
              style={{
                position: 'absolute', top: '20px', right: '20px',
                width: '34px', height: '34px', borderRadius: '50%',
                backgroundColor: '#F0E4D8', border: 'none', color: '#3D2C2E',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '28px' }}>{selectedMemory.emoji || '📸'}</span>
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: '#3D2C2E', fontWeight: 700 }}>
                  {selectedMemory.title}
                </h2>
                <span style={{ fontSize: '11px', color: '#EE7B7B', fontWeight: 600 }}>
                  Saved by {selectedMemory.author} • {selectedMemory.date}
                </span>
              </div>
            </div>

            {selectedMemory.photoUrl && (
              <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', margin: '14px 0', maxHeight: '280px' }}>
                <img src={selectedMemory.photoUrl} alt={selectedMemory.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            {selectedMemory.text && (
              <p style={{ fontSize: '14px', color: '#3D2C2E', lineHeight: 1.45, fontStyle: 'italic', backgroundColor: '#FFF7F0', padding: '14px', borderRadius: '14px', marginBottom: '14px' }}>
                "{selectedMemory.text}"
              </p>
            )}

            {selectedMemory.voiceUrl && (
              <div style={{ backgroundColor: '#FFF0F0', padding: '12px', borderRadius: '14px', border: '1px solid #EE7B7B', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Volume2 size={20} color="#EE7B7B" />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#3D2C2E' }}>Voice Recording:</span>
                <audio src={selectedMemory.voiceUrl} controls style={{ height: '34px', flex: 1 }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add New Memory Modal */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 20, 40, 0.75)', backdropFilter: 'blur(8px)',
          zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFF', borderRadius: '28px', padding: '28px',
            width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)', position: 'relative'
          }}>
            <button
              onClick={() => setIsAddModalOpen(false)}
              style={{
                position: 'absolute', top: '20px', right: '20px',
                width: '34px', height: '34px', borderRadius: '50%',
                backgroundColor: '#F0E4D8', border: 'none', color: '#3D2C2E',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: '#3D2C2E', marginBottom: '4px' }}>
              Add New Memory 💕
            </h2>
            <p style={{ fontSize: '12px', color: '#8C7A7C', marginBottom: '20px' }}>
              Save a special memory, photo, or voice note to your shared world
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#3D2C2E', display: 'block', marginBottom: '6px' }}>
                  Memory Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sunset Walk by the Lake"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #E0D4C5', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#3D2C2E', display: 'block', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #E0D4C5', fontSize: '13px', outline: 'none' }}
                >
                  {['Memories', 'Photos', 'Voice', 'Songs', 'Dates', 'Trips', 'Milestones'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#3D2C2E', display: 'block', marginBottom: '6px' }}>
                  Memory Date
                </label>
                <input
                  type="date"
                  value={memoryDate}
                  onChange={(e) => setMemoryDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #E0D4C5', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#3D2C2E', display: 'block', marginBottom: '6px' }}>
                  Story / Details
                </label>
                <textarea
                  rows={3}
                  placeholder="What made this moment special..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #E0D4C5', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Photo Upload Picker */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#3D2C2E', display: 'block', marginBottom: '6px' }}>
                  📷 Attach Photo (Upload from Device)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ fontSize: '12px', color: '#3D2C2E' }}
                />
                {attachedPhoto && (
                  <div style={{ marginTop: '8px', position: 'relative', width: '100px', height: '100px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #EE7B7B' }}>
                    <img src={attachedPhoto} alt="Memory Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => setAttachedPhoto('')}
                      style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', color: '#FFF', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer' }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Live MediaRecorder Voice Note */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#3D2C2E', display: 'block', marginBottom: '6px' }}>
                  🎙️ Record Voice Note Live
                </label>

                {micPermissionError && (
                  <p style={{ fontSize: '11px', color: '#E53935', marginBottom: '4px' }}>{micPermissionError}</p>
                )}

                {!isRecording && !attachedVoiceUrl && (
                  <button
                    type="button"
                    onClick={startVoiceRecording}
                    style={{
                      padding: '8px 16px', borderRadius: '16px',
                      backgroundColor: '#EE7B7B', border: 'none', color: '#FFF',
                      fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
                    }}
                  >
                    <Mic size={14} /> Start Voice Recording
                  </button>
                )}

                {isRecording && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#FFF0F0', padding: '8px 12px', borderRadius: '12px', border: '1px solid #EE7B7B' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#E53935' }} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#E53935' }}>
                      Recording: {formatSecs(recordingTime)}
                    </span>
                    <button
                      type="button"
                      onClick={stopVoiceRecording}
                      style={{ padding: '4px 10px', borderRadius: '10px', backgroundColor: '#E53935', border: 'none', color: '#FFF', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Square size={10} /> Stop
                    </button>
                  </div>
                )}

                {attachedVoiceUrl && !isRecording && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <audio src={attachedVoiceUrl} controls style={{ height: '34px', flex: 1 }} />
                    <button
                      type="button"
                      onClick={() => setAttachedVoiceUrl('')}
                      style={{ padding: '4px 8px', borderRadius: '8px', backgroundColor: '#FDE8E8', border: 'none', color: '#EE7B7B', fontSize: '11px', cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleSaveMemory}
                style={{
                  marginTop: '10px', width: '100%', height: '46px', borderRadius: '23px',
                  backgroundColor: 'var(--brand-primary)', border: 'none', color: '#FFF',
                  fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow-pink)'
                }}
              >
                Save Memory 💕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
