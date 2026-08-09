import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Heart, Plus, X, Trash2, Mic, Square, Image as ImageIcon, Volume2, Sparkles, Play, Pause } from 'lucide-react';
import { getRelationshipTime } from '../utils/dateCalculator';
import { playMagicBell } from '../utils/audio';

export default function TimelineView({ gardenItems = [], onAddGardenItem, onDeleteGardenItem, currentPartner }) {
  const relTime = getRelationshipTime();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().split('T')[0]);
  const [timeStr, setTimeStr] = useState('12:00');
  const [includeTime, setIncludeTime] = useState(false);
  const [emoji, setEmoji] = useState('✨');
  const [photoUrl, setPhotoUrl] = useState('');
  const [voiceUrl, setVoiceUrl] = useState('');

  // MediaRecorder Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [micPermissionError, setMicPermissionError] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const emojiOptions = ['✨', '🌅', '🌊', '🌸', '🍁', '✈️', '🎵', '📸', '💖', '🕯️', '🍷', '💍'];

  // Filter Memories & Timeline items
  const timelineEvents = gardenItems.filter(item => 
    !item.category || item.category === 'Memories' || item.category === 'Timeline' || item.category === 'Milestones' || item.type === 'flower'
  );

  // Start Live Audio Recording with browser microphone permission
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
          setVoiceUrl(reader.result);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all mic tracks
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

  // Native Image File Picker Handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveTimelineMoment = () => {
    if (!title.trim()) return;
    playMagicBell();

    const formattedDate = includeTime ? `${dateStr} at ${timeStr}` : dateStr;

    const newMoment = {
      id: Date.now().toString(),
      author: currentPartner || 'Naitik',
      type: 'flower',
      category: 'Timeline',
      emoji: emoji || '✨',
      title: title.trim(),
      text: desc.trim(),
      date: formattedDate,
      photoUrl: photoUrl,
      voiceUrl: voiceUrl
    };

    if (onAddGardenItem) {
      onAddGardenItem(newMoment);
    }

    // Reset Form
    setTitle('');
    setDesc('');
    setPhotoUrl('');
    setVoiceUrl('');
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
            <Calendar size={24} color="#EE7B7B" />
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', color: '#3D2C2E', fontWeight: 700 }}>
              Our Timeline
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: '#8C7A7C', marginTop: '2px' }}>
            Together since <strong>21 June, 5:16 AM</strong> • Total: <strong>{relTime.totalDays} days</strong>
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
          <Plus size={16} /> Add Timeline Moment
        </button>
      </div>

      {/* Timeline Chain */}
      {timelineEvents.length === 0 ? (
        <div style={{
          backgroundColor: '#FFF9F4',
          borderRadius: '24px',
          padding: '40px',
          textAlign: 'center',
          border: '1px dashed #EE7B7B'
        }}>
          <span style={{ fontSize: '36px' }}>✨</span>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: '#3D2C2E', marginTop: '10px' }}>
            No timeline moments added yet
          </h3>
          <p style={{ fontSize: '13px', color: '#8C7A7C', marginTop: '4px' }}>
            Click "+ Add Timeline Moment" above to document your first special milestone together!
          </p>
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '24px', borderLeft: '2px solid #EE7B7B' }}>
          {timelineEvents.map((evt, idx) => (
            <div
              key={evt.id || idx}
              style={{
                position: 'relative',
                marginBottom: '28px',
                paddingLeft: '20px'
              }}
            >
              {/* Timeline Dot */}
              <div style={{
                position: 'absolute',
                left: '-33px',
                top: '4px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: '#EE7B7B',
                border: '3px solid #FFF',
                boxShadow: '0 0 10px rgba(238,123,123,0.5)'
              }} />

              <div style={{
                backgroundColor: '#FFF',
                borderRadius: '20px',
                padding: '20px 24px',
                border: '1px solid #E0D4C5',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#EE7B7B' }}>
                      {evt.date || 'Special Moment'}
                    </span>
                    <span style={{ fontSize: '10px', backgroundColor: '#FFF0F0', color: '#EE7B7B', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                      By {evt.author || 'Us'}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>{evt.emoji || '✨'}</span>
                    {onDeleteGardenItem && evt.author === currentPartner && (
                      <button
                        onClick={() => onDeleteGardenItem(evt.id)}
                        title="Delete moment"
                        style={{
                          backgroundColor: '#FDE8E8', border: 'none', borderRadius: '8px',
                          padding: '6px', color: '#EE7B7B', cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 700, color: '#3D2C2E' }}>
                  {evt.title}
                </h3>
                
                {evt.text && (
                  <p style={{ fontSize: '13px', color: '#5C4033', marginTop: '6px', lineHeight: 1.4, fontStyle: 'italic' }}>
                    "{evt.text}"
                  </p>
                )}

                {/* Attached Photo Display */}
                {evt.photoUrl && (
                  <div style={{ marginTop: '12px', borderRadius: '14px', overflow: 'hidden', maxHeight: '240px' }}>
                    <img src={evt.photoUrl} alt="Timeline Moment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                {/* Attached Voice Note Display */}
                {evt.voiceUrl && (
                  <div style={{ marginTop: '12px', backgroundColor: '#FFF7F0', padding: '10px 14px', borderRadius: '14px', border: '1px solid #FFAAAA', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Volume2 size={18} color="#EE7B7B" />
                    <span style={{ fontSize: '12px', color: '#3D2C2E', fontWeight: 600 }}>Voice Recording:</span>
                    <audio src={evt.voiceUrl} controls style={{ height: '32px', flex: 1 }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Timeline Moment Modal */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 20, 40, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 300,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFF',
            borderRadius: '28px',
            padding: '28px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            position: 'relative'
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
              Add Timeline Moment ✨
            </h2>
            <p style={{ fontSize: '12px', color: '#8C7A7C', marginBottom: '20px' }}>
              Document a milestone or memory for Naitik & Raj
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#3D2C2E', display: 'block', marginBottom: '6px' }}>
                  Moment Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Our First Trip to the Mountains"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '14px',
                    border: '1px solid #E0D4C5', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#3D2C2E', display: 'block', marginBottom: '6px' }}>
                  Date & Time
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="date"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    style={{
                      flex: 1, padding: '10px 14px', borderRadius: '14px',
                      border: '1px solid #E0D4C5', fontSize: '13px', outline: 'none'
                    }}
                  />
                  {includeTime && (
                    <input
                      type="time"
                      value={timeStr}
                      onChange={(e) => setTimeStr(e.target.value)}
                      style={{
                        padding: '10px 14px', borderRadius: '14px',
                        border: '1px solid #E0D4C5', fontSize: '13px', outline: 'none'
                      }}
                    />
                  )}
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#8C7A7C', marginTop: '6px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={includeTime} onChange={(e) => setIncludeTime(e.target.checked)} />
                  Include exact time
                </label>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#3D2C2E', display: 'block', marginBottom: '6px' }}>
                  Choose Sticker Emoji
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {emojiOptions.map((em) => (
                    <button
                      key={em}
                      onClick={() => setEmoji(em)}
                      style={{
                        fontSize: '20px', padding: '6px 10px', borderRadius: '12px',
                        border: emoji === em ? '2px solid #EE7B7B' : '1px solid #E0D4C5',
                        backgroundColor: emoji === em ? '#FFF0F0' : '#FFF', cursor: 'pointer'
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#3D2C2E', display: 'block', marginBottom: '6px' }}>
                  Memory Description / Story
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe this special moment..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '14px',
                    border: '1px solid #E0D4C5', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Native Photo Upload Picker */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#3D2C2E', display: 'block', marginBottom: '6px' }}>
                  Attach Photo (Upload from Device) 📸
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ fontSize: '12px', color: '#3D2C2E' }}
                />
                {photoUrl && (
                  <div style={{ marginTop: '8px', position: 'relative', width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #EE7B7B' }}>
                    <img src={photoUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      onClick={() => setPhotoUrl('')}
                      style={{
                        position: 'absolute', top: '4px', right: '4px', backgroundColor: 'rgba(0,0,0,0.6)',
                        border: 'none', color: '#FFF', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer'
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Live MediaRecorder Voice Note */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#3D2C2E', display: 'block', marginBottom: '6px' }}>
                  Record Voice Note 🎙️
                </label>

                {micPermissionError && (
                  <p style={{ fontSize: '11px', color: '#E53935', marginBottom: '6px' }}>{micPermissionError}</p>
                )}

                {!isRecording && !voiceUrl && (
                  <button
                    onClick={startVoiceRecording}
                    style={{
                      padding: '10px 18px', borderRadius: '20px',
                      backgroundColor: '#EE7B7B', border: 'none', color: '#FFF',
                      fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                    }}
                  >
                    <Mic size={16} /> Start Recording Voice
                  </button>
                )}

                {isRecording && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#FFF0F0', padding: '10px 14px', borderRadius: '14px', border: '1px solid #EE7B7B' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#E53935', animation: 'pulse 1s infinite' }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#E53935' }}>
                      Recording: {formatSecs(recordingTime)}
                    </span>
                    <button
                      onClick={stopVoiceRecording}
                      style={{
                        padding: '6px 12px', borderRadius: '12px',
                        backgroundColor: '#E53935', border: 'none', color: '#FFF',
                        fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      <Square size={12} /> Stop
                    </button>
                  </div>
                )}

                {voiceUrl && !isRecording && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <audio src={voiceUrl} controls style={{ height: '36px', flex: 1 }} />
                    <button
                      onClick={() => setVoiceUrl('')}
                      style={{ padding: '6px 10px', borderRadius: '10px', backgroundColor: '#FDE8E8', border: 'none', color: '#EE7B7B', fontSize: '11px', cursor: 'pointer' }}
                    >
                      Re-record
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleSaveTimelineMoment}
                style={{
                  marginTop: '10px', width: '100%', height: '48px', borderRadius: '24px',
                  backgroundColor: 'var(--brand-primary)', border: 'none', color: '#FFF',
                  fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow-pink)'
                }}
              >
                Save Timeline Moment 💕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
