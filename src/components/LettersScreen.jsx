import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, 
  Lock, 
  Heart, 
  X, 
  PenTool, 
  Trash2,
  Mic,
  Square,
  Volume2,
  Image as ImageIcon,
  Music,
  Clock,
  Sparkles
} from 'lucide-react';
import { subscribeToLetters, sendLetterToSupabase, deleteLetterFromSupabase } from '../services/supabase';
import { playChime, playMagicBell } from '../utils/audio';

// Safe date formatter
const formatDateSafe = (dateVal) => {
  if (!dateVal) return 'Today';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'Today';
    return d.toLocaleDateString();
  } catch (err) {
    return 'Today';
  }
};

export default function LettersScreen({
  letters = [],
  currentPartner = 'Naitik',
  theme = 'morning',
  onSendLetter,
  onDeleteLetter,
  onMarkLetterSeen
}) {
  const isNight = theme === 'night';
  const recipientName = currentPartner === 'Naitik' ? 'Raj' : 'Naitik';

  // Filters & State
  const [filter, setFilter] = useState('All');
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [lockedLetterAlert, setLockedLetterAlert] = useState(null);
  const [isWriting, setIsWriting] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [fontFamily, setFontFamily] = useState('Dancing Script');
  const [mood, setMood] = useState('💖 Romantic');
  const [coverColor, setCoverColor] = useState('#FFD9D9');
  const [sticker, setSticker] = useState('🌸 Rose');
  const [photoUrl, setPhotoUrl] = useState('');
  const [voiceNote, setVoiceNote] = useState('');
  const [songLink, setSongLink] = useState('');

  // MediaRecorder Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [micPermissionError, setMicPermissionError] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const startVoiceRecording = async () => {
    setMicPermissionError('');
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setVoiceNote(reader.result);
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach(track => track.stop());
        clearInterval(timerRef.current);
        setIsRecording(false);
      };

      recorder.start();
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

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  // Lock System
  const [lockType, setLockType] = useState('anytime');
  const [unlockDate, setUnlockDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [unlockTime, setUnlockTime] = useState('20:00');

  const filters = ['All', 'Today', 'Past Archive'];
  const colorOptions = [
    { name: 'Cozy Pink', hex: '#FFD9D9', border: '#FFAAAA' },
    { name: 'Cream Vintage', hex: '#FFF3E0', border: '#FFE0B2' },
    { name: 'Lavender Mist', hex: '#E8DFF5', border: '#D1C4E9' },
    { name: 'Soft Mint', hex: '#E2F0D9', border: '#C8E6C9' },
    { name: 'Sky Blue', hex: '#D9EBF7', border: '#BBDEFB' }
  ];

  const moodOptions = ['💖 Romantic', '😊 Happy', '🥺 Tender', '😔 Comforting', '✨ Celebration'];
  const stickerOptions = ['🌸 Rose', '🪻 Lavender', '🌾 Daisy', '🎀 Ribbon', '💌 Wax Seal'];
  const fontOptions = ['Dancing Script', 'Caveat', 'Sacramento', 'Playfair Display'];

  const handleCreateLetter = async () => {
    if (!newTitle.trim() || !newBody.trim()) return;
    playMagicBell();

    let targetTimestamp = null;
    if (lockType === 'timed') {
      const validDate = unlockDate || new Date().toISOString().split('T')[0];
      const validTime = unlockTime || '20:00';
      const parsedDate = new Date(`${validDate}T${validTime}`);
      if (!isNaN(parsedDate.getTime())) {
        targetTimestamp = parsedDate.getTime();
      }
    }

    const selectedColorObj = colorOptions.find(c => c.hex === coverColor) || colorOptions[0];

    const metadataPayload = JSON.stringify({
      text: newBody,
      fontFamily,
      mood,
      sticker,
      photoUrl,
      voiceNote,
      songLink,
      color: selectedColorObj.hex,
      border: selectedColorObj.border
    });

    const newId = Date.now().toString();
    const newLetterItem = {
      id: newId,
      author: currentPartner || 'Naitik',
      recipient: recipientName || 'Raj',
      title: newTitle,
      body: newBody,
      fontFamily,
      mood,
      sticker,
      photoUrl,
      voiceNote,
      songLink,
      color: selectedColorObj.hex,
      border: selectedColorObj.border,
      createdDate: new Date().toISOString(),
      unlockTimestamp: targetTimestamp,
      seenBy: [currentPartner || 'Naitik']
    };

    if (onSendLetter) {
      await onSendLetter(newLetterItem);
    } else {
      await sendLetterToSupabase({
        ...newLetterItem,
        body: metadataPayload
      });
    }

    // Reset Form
    setIsWriting(false);
    setNewTitle('');
    setNewBody('');
    setPhotoUrl('');
    setVoiceNote('');
    setSongLink('');
    setLockType('anytime');
  };

  // INSTANT REMOVAL FUNCTION
  const handleDeleteLetter = async (e, letterId, letterAuthor) => {
    e.stopPropagation();
    if (letterAuthor !== currentPartner) return;
    
    if (onDeleteLetter) {
      await onDeleteLetter(letterId, letterAuthor);
    } else {
      await deleteLetterFromSupabase(letterId);
    }
  };

  const isLetterUnlocked = (letter) => {
    if (!letter || !letter.unlockTimestamp || isNaN(letter.unlockTimestamp)) return true;
    return Date.now() >= letter.unlockTimestamp;
  };

  const isWrittenToday = (letter) => {
    if (!letter || !letter.createdDate) return true;
    try {
      const created = new Date(letter.createdDate);
      if (isNaN(created.getTime())) return true;
      const today = new Date();
      return created.getDate() === today.getDate() &&
             created.getMonth() === today.getMonth() &&
             created.getFullYear() === today.getFullYear();
    } catch (err) {
      return true;
    }
  };

  const getUnlockStatusText = (letter) => {
    if (!letter || !letter.unlockTimestamp || isNaN(letter.unlockTimestamp) || Date.now() >= letter.unlockTimestamp) {
      return 'Open Anytime 🕊️';
    }
    try {
      const d = new Date(letter.unlockTimestamp);
      if (isNaN(d.getTime())) return 'Open Anytime 🕊️';
      return `Sealed until ${d.toLocaleDateString()} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (err) {
      return 'Open Anytime 🕊️';
    }
  };

  const filteredLetters = (letters || []).filter((letter) => {
    if (!letter) return false;
    try {
      if (filter === 'Today') return isWrittenToday(letter);
      if (filter === 'Past Archive') return !isWrittenToday(letter);
      return true;
    } catch (err) {
      return true;
    }
  });

  const handleLetterClick = (letter) => {
    if (!letter) return;
    if (isLetterUnlocked(letter)) {
      playChime();
      setSelectedLetter(letter);
      if (onMarkLetterSeen) {
        onMarkLetterSeen(letter.id, currentPartner);
      }
    } else {
      setLockedLetterAlert(letter);
    }
  };

  const getSpotifyEmbed = (url) => {
    if (!url || typeof url !== 'string') return null;
    if (url.includes('spotify.com/track/')) {
      const trackId = url.split('track/')[1]?.split('?')[0];
      if (trackId) return `https://open.spotify.com/embed/track/${trackId}`;
    }
    return null;
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: isNight ? '#0F1428' : '#FAF6F0',
      color: isNight ? '#F5E6CC' : '#3D2C2E',
      paddingBottom: '60px'
    }}>
      {/* Mailbox Atmosphere Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={26} color="#EE7B7B" />
                <h1 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '28px',
                  fontWeight: 700,
                  color: isNight ? '#F5E6CC' : '#3D2C2E'
                }}>
                  Mailbox of Love 💌
                </h1>
              </div>

              {/* FANCY PINTEREST STICKER STAMP */}
              <div style={{
                backgroundColor: '#FDE8E8',
                border: '1.5px dashed #EE7B7B',
                borderRadius: '16px',
                padding: '4px 14px',
                transform: 'rotate(-3deg)',
                boxShadow: '0 4px 12px rgba(238,123,123,0.2)'
              }}>
                <span style={{
                  fontFamily: 'var(--font-handwriting)',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#EE7B7B',
                  letterSpacing: '1px'
                }}>
                  ✨ I LOVE USS 💖
                </span>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: isNight ? '#A3ADC2' : '#8C7A7C', marginTop: '4px' }}>
              Timeless letters, pressed flowers, and sealed envelopes for Naitik & Raj
            </p>
          </div>

          <button
            onClick={() => setIsWriting(true)}
            style={{
              padding: '12px 24px', borderRadius: '24px',
              backgroundColor: 'var(--brand-primary)', border: 'none',
              color: '#FFF', fontSize: '14px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '8px',
              cursor: 'pointer', boxShadow: 'var(--shadow-pink)'
            }}
          >
            <PenTool size={16} /> Write a Letter as {currentPartner}
          </button>
        </div>

        {/* Filter Chips */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 18px',
                borderRadius: '18px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                backgroundColor: filter === f ? (isNight ? '#FDE8E8' : '#3D2C2E') : (isNight ? 'rgba(255,255,255,0.08)' : '#FFF9F4'),
                color: filter === f ? (isNight ? '#3D2C2E' : '#FFF') : (isNight ? '#A3ADC2' : '#8C7A7C'),
                cursor: 'pointer',
                boxShadow: filter === f ? 'var(--shadow-sm)' : 'none'
              }}
            >
              {f === 'All' ? 'All Letters 💌' : f === 'Today' ? "Today's Letters 💌" : 'Past Archive 📁'}
            </button>
          ))}
        </div>
      </div>

      {/* Wooden Table Mailbox Display Canvas */}
      {filteredLetters.length === 0 ? (
        <div style={{
          backgroundColor: isNight ? 'rgba(255,255,255,0.04)' : '#FFF9F4',
          borderRadius: '28px', padding: '50px',
          textAlign: 'center', border: isNight ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E0D4C5'
        }}>
          <span style={{ fontSize: '42px' }}>💌</span>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: isNight ? '#F5E6CC' : '#3D2C2E', marginTop: '12px' }}>
            No letters written yet
          </h3>
          <p style={{ fontSize: '13px', color: isNight ? '#A3ADC2' : '#8C7A7C', marginTop: '6px' }}>
            Click "Write a Letter as {currentPartner}" to seal your first handwritten letter for {recipientName}.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '22px' }}>
          {filteredLetters.map((letter) => {
            const unlocked = isLetterUnlocked(letter);
            const today = isWrittenToday(letter);
            const canDelete = letter.author === currentPartner;

            return (
              <div
                key={letter.id}
                onClick={() => handleLetterClick(letter)}
                style={{
                  backgroundColor: letter.color || '#FFD9D9',
                  border: `2px solid ${letter.border || '#FFAAAA'}`,
                  borderRadius: '26px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                  position: 'relative',
                  transition: 'transform 0.2s ease, boxShadow 0.2s ease',
                  minHeight: '170px'
                }}
              >
                {/* Top Envelope Bar */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      backgroundColor: '#FFF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                      {unlocked ? (
                        <Heart size={22} fill="#EE7B7B" color="#EE7B7B" />
                      ) : (
                        <Lock size={22} color="#EE7B7B" />
                      )}
                    </div>

                    <span style={{
                      fontSize: '11px', fontWeight: 700,
                      backgroundColor: '#FFF', color: '#3D2C2E',
                      padding: '4px 10px', borderRadius: '12px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                    }}>
                      {letter.sticker || '🌸 Rose'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, backgroundColor: '#FFF', color: '#3D2C2E', padding: '3px 8px', borderRadius: '10px' }}>
                      {today ? 'Today' : 'Archive'}
                    </span>

                    {/* AUTHOR-ONLY INSTANT DELETION BUTTON */}
                    {canDelete && (
                      <button
                        onClick={(e) => handleDeleteLetter(e, letter.id, letter.author)}
                        title={`Delete letter written by you (${currentPartner})`}
                        style={{
                          backgroundColor: '#FFF', border: 'none', borderRadius: '50%',
                          width: '32px', height: '32px', color: '#EE7B7B', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Envelope Title & Details */}
                <div style={{ marginTop: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#3D2C2E' }}>
                      {unlocked ? letter.title : 'Sealed Letter 🗝️'}
                    </h3>
                    <span style={{ fontSize: '12px' }}>{typeof letter.mood === 'string' ? letter.mood.split(' ')[0] : '💖'}</span>
                  </div>

                  <p style={{ fontSize: '12px', color: '#5C4033' }}>
                    {unlocked ? `From ${letter.author} for ${letter.recipient}` : `Written by ${letter.author}`}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                    <span style={{ fontSize: '11px', color: '#EE7B7B', fontWeight: 600 }}>
                      {getUnlockStatusText(letter)}
                    </span>
                    <span style={{ fontSize: '10px', color: '#8C7A7C' }}>
                      {formatDateSafe(letter.createdDate)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RICH LETTER CREATOR MODAL */}
      {isWriting && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
          zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="parchment-card" style={{
            width: '100%', maxWidth: '520px', padding: '32px',
            maxHeight: '90vh', overflowY: 'auto', borderRadius: '32px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: '#3D2C2E' }}>
                Write Handwritten Letter to {recipientName} 💌
              </h3>
              <button onClick={() => setIsWriting(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#3D2C2E" />
              </button>
            </div>

            {/* 1. Title Input */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#8C7A7C' }}>LETTER TITLE *</label>
              <input
                type="text"
                placeholder="e.g. For when you need a gentle hug..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '12px',
                  border: '1px solid #E0D4C5', marginTop: '4px', outline: 'none', fontSize: '14px'
                }}
              />
            </div>

            {/* 2. Letter Content Textarea with Custom Font Selection */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#8C7A7C' }}>LETTER CONTENT *</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  style={{
                    fontSize: '11px', padding: '3px 8px', borderRadius: '8px',
                    border: '1px solid #E0D4C5', outline: 'none', background: '#FFF'
                  }}
                >
                  {fontOptions.map(f => <option key={f} value={f}>Font: {f}</option>)}
                </select>
              </div>

              <textarea
                placeholder={`Write your letter to ${recipientName} from the heart...`}
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                rows={6}
                style={{
                  width: '100%', padding: '16px', borderRadius: '14px',
                  border: '1px solid #E0D4C5',
                  fontFamily: fontFamily === 'Dancing Script' ? 'var(--font-handwriting)' : fontFamily,
                  fontSize: '22px', outline: 'none', resize: 'none', lineHeight: '1.4',
                  backgroundColor: '#FFFDF9'
                }}
              />
            </div>

            {/* 3. Mood & Sticker Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#8C7A7C' }}>MOOD SELECTION</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '10px',
                    border: '1px solid #E0D4C5', marginTop: '4px', outline: 'none', fontSize: '13px'
                  }}
                >
                  {moodOptions.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#8C7A7C' }}>PRESSED STICKER</label>
                <select
                  value={sticker}
                  onChange={(e) => setSticker(e.target.value)}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '10px',
                    border: '1px solid #E0D4C5', marginTop: '4px', outline: 'none', fontSize: '13px'
                  }}
                >
                  {stickerOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* 4. Cover Color Selection */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#8C7A7C', display: 'block', marginBottom: '6px' }}>
                ENVELOPE COVER COLOR
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {colorOptions.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setCoverColor(c.hex)}
                    style={{
                      width: '34px', height: '34px', borderRadius: '50%',
                      backgroundColor: c.hex,
                      border: coverColor === c.hex ? '3px solid #3D2C2E' : `1.5px solid ${c.border}`,
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 5. Optional Media Attachments */}
            <div style={{ backgroundColor: '#FFF9F4', padding: '14px', borderRadius: '16px', border: '1px solid #E0D4C5', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#8C7A7C', display: 'block', marginBottom: '10px' }}>
                OPTIONAL ATTACHMENTS (PHOTO, LIVE VOICE NOTE, MUSIC)
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Photo Upload Picker */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#3D2C2E', display: 'block', marginBottom: '4px' }}>
                    📷 Upload Photo from Device:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ fontSize: '12px', color: '#3D2C2E' }}
                  />
                  {photoUrl && (
                    <div style={{ marginTop: '6px', position: 'relative', width: '90px', height: '90px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #EE7B7B' }}>
                      <img src={photoUrl} alt="Letter attachment preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        style={{
                          position: 'absolute', top: '2px', right: '2px', backgroundColor: 'rgba(0,0,0,0.6)',
                          border: 'none', color: '#FFF', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                {/* Live MediaRecorder Voice Note */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#3D2C2E', display: 'block', marginBottom: '4px' }}>
                    🎙️ Record Live Voice Note:
                  </label>
                  {micPermissionError && (
                    <p style={{ fontSize: '10px', color: '#E53935', marginBottom: '4px' }}>{micPermissionError}</p>
                  )}
                  {!isRecording && !voiceNote && (
                    <button
                      type="button"
                      onClick={startVoiceRecording}
                      style={{
                        padding: '6px 12px', borderRadius: '14px',
                        backgroundColor: '#EE7B7B', border: 'none', color: '#FFF',
                        fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
                      }}
                    >
                      <Mic size={14} /> Start Voice Recording
                    </button>
                  )}

                  {isRecording && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#FFF0F0', padding: '6px 10px', borderRadius: '10px', border: '1px solid #EE7B7B' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#E53935' }} />
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#E53935' }}>
                        Recording: {recordingTime}s
                      </span>
                      <button
                        type="button"
                        onClick={stopVoiceRecording}
                        style={{
                          padding: '4px 8px', borderRadius: '8px',
                          backgroundColor: '#E53935', border: 'none', color: '#FFF',
                          fontSize: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                        }}
                      >
                        <Square size={10} /> Stop
                      </button>
                    </div>
                  )}

                  {voiceNote && !isRecording && (
                    <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <audio src={voiceNote} controls style={{ height: '32px', flex: 1 }} />
                      <button
                        type="button"
                        onClick={() => setVoiceNote('')}
                        style={{ padding: '4px 8px', borderRadius: '8px', backgroundColor: '#FDE8E8', border: 'none', color: '#EE7B7B', fontSize: '10px', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="🎵 Spotify song link / URL (optional background music)"
                  value={songLink}
                  onChange={(e) => setSongLink(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #E0D4C5', fontSize: '12px' }}
                />
              </div>
            </div>

            {/* 6. Lock System Options */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#8C7A7C', display: 'block', marginBottom: '8px' }}>
                WHEN CAN {recipientName.toUpperCase()} OPEN THIS LETTER?
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <button
                  type="button"
                  onClick={() => setLockType('anytime')}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '12px',
                    border: lockType === 'anytime' ? '2px solid var(--brand-primary)' : '1px solid #E0D4C5',
                    backgroundColor: lockType === 'anytime' ? '#FFF9F4' : '#FFF',
                    fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: '#3D2C2E'
                  }}
                >
                  Open Anytime 🕊️
                </button>
                <button
                  type="button"
                  onClick={() => setLockType('timed')}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '12px',
                    border: lockType === 'timed' ? '2px solid var(--brand-primary)' : '1px solid #E0D4C5',
                    backgroundColor: lockType === 'timed' ? '#FFF9F4' : '#FFF',
                    fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: '#3D2C2E'
                  }}
                >
                  Set Date & Time ⏳
                </button>
              </div>

              {lockType === 'timed' && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '10px', color: '#8C7A7C' }}>UNLOCK DATE</label>
                    <input
                      type="date"
                      value={unlockDate}
                      onChange={(e) => setUnlockDate(e.target.value)}
                      style={{
                        width: '100%', padding: '8px', borderRadius: '10px',
                        border: '1px solid #E0D4C5', outline: 'none', fontSize: '12px'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '10px', color: '#8C7A7C' }}>TIME</label>
                    <input
                      type="time"
                      value={unlockTime}
                      onChange={(e) => setUnlockTime(e.target.value)}
                      style={{
                        width: '100%', padding: '8px', borderRadius: '10px',
                        border: '1px solid #E0D4C5', outline: 'none', fontSize: '12px'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleCreateLetter}
              disabled={!newTitle.trim() || !newBody.trim()}
              style={{
                width: '100%', height: '50px', borderRadius: '25px',
                backgroundColor: 'var(--brand-primary)', border: 'none',
                color: '#FFF', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                boxShadow: 'var(--shadow-pink)'
              }}
            >
              Seal Handwritten Letter 💌
            </button>
          </div>
        </div>
      )}

      {/* Sealed Teaser Alert Modal */}
      {lockedLetterAlert && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="parchment-card" style={{ width: '100%', maxWidth: '320px', padding: '24px', textAlign: 'center' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              backgroundColor: '#FAD4D4', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <Lock size={28} color="#EE7B7B" />
            </div>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: '#3D2C2E', marginBottom: '8px' }}>
              Letter is Sealed 🗝️
            </h3>

            <p style={{ fontSize: '13px', color: '#5C4033', lineHeight: '1.4', marginBottom: '16px' }}>
              <strong>{lockedLetterAlert.author}</strong> wrote a letter for you! The title and contents are hidden until:
            </p>

            <div style={{
              backgroundColor: '#FFF9F4', padding: '10px 14px', borderRadius: '14px',
              border: '1px solid #E0D4C5', fontSize: '13px', fontWeight: 600, color: '#EE7B7B',
              marginBottom: '20px'
            }}>
              {getUnlockStatusText(lockedLetterAlert)}
            </div>

            <button
              onClick={() => setLockedLetterAlert(null)}
              style={{
                width: '100%', height: '44px', borderRadius: '22px',
                backgroundColor: '#3D2C2E', border: 'none',
                color: '#FFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
              }}
            >
              I will wait patiently 💕
            </button>
          </div>
        </div>
      )}

      {/* RICH UNLOCKED LETTER READER MODAL */}
      {selectedLetter && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="parchment-card" style={{
            width: '100%', maxWidth: '440px', padding: '32px',
            maxHeight: '85vh', overflowY: 'auto', borderRadius: '28px',
            backgroundColor: selectedLetter.color || '#FFFDF9',
            border: `2px solid ${selectedLetter.border || '#FFAAAA'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, backgroundColor: '#FFF', color: '#3D2C2E', padding: '4px 10px', borderRadius: '12px' }}>
                  From {selectedLetter.author} for {selectedLetter.recipient}
                </span>
                <span style={{ fontSize: '12px' }}>{selectedLetter.sticker || '🌸 Rose'}</span>
              </div>
              <button onClick={() => setSelectedLetter(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#3D2C2E" />
              </button>
            </div>

            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: '#3D2C2E', marginBottom: '8px' }}>
              {selectedLetter.title}
            </h2>

            <span style={{ fontSize: '11px', color: '#EE7B7B', fontWeight: 600, display: 'block', marginBottom: '16px' }}>
              {selectedLetter.mood || '💖 Romantic'} • Written on {formatDateSafe(selectedLetter.createdDate)}
            </span>

            {/* Letter Content in Selected Handwritten Font */}
            <p style={{
              fontFamily: selectedLetter.fontFamily === 'Dancing Script' ? 'var(--font-handwriting)' : selectedLetter.fontFamily,
              fontSize: '24px', lineHeight: '1.45', color: '#3D2C2E',
              backgroundColor: 'rgba(255,255,255,0.6)', padding: '18px', borderRadius: '16px',
              border: '1px solid rgba(0,0,0,0.06)', marginBottom: '18px'
            }}>
              "{selectedLetter.body}"
            </p>

            {/* Attached Photo Frame */}
            {selectedLetter.photoUrl && (
              <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                <img
                  src={selectedLetter.photoUrl}
                  alt="Attached Letter Memory"
                  style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}
                />
              </div>
            )}

            {/* Embedded Spotify Song Player */}
            {selectedLetter.songLink && getSpotifyEmbed(selectedLetter.songLink) && (
              <div style={{ marginBottom: '16px', borderRadius: '16px', overflow: 'hidden' }}>
                <iframe
                  src={getSpotifyEmbed(selectedLetter.songLink)}
                  width="100%"
                  height="80"
                  frameBorder="0"
                  allow="encrypted-media"
                  title="Letter Background Song"
                />
              </div>
            )}

            {/* Voice Note Audio Preview */}
            {selectedLetter.voiceNote && (
              <div style={{
                padding: '12px', borderRadius: '14px', backgroundColor: '#FFF',
                border: '1px solid #E0D4C5', display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                <Mic size={18} color="#EE7B7B" />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#3D2C2E' }}>
                  Voice note: {selectedLetter.voiceNote}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
