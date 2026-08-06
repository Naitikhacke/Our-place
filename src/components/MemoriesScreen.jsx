import React, { useState } from 'react';
import { Star, Plus, X, Volume2, Play, Pause, Image as ImageIcon, Mic, Music, Calendar, Clock, Sparkles, CheckSquare, Square } from 'lucide-react';
import { playVoiceNotePreview, playChime } from '../utils/audio';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export default function MemoriesScreen({ currentPartner }) {
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [filter, setFilter] = useState('All');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for Add Memory
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🌟');
  
  // Date is ALWAYS required (defaults to today's date YYYY-MM-DD)
  const [memoryDate, setMemoryDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Time is optional via Checkbox
  const [includeTime, setIncludeTime] = useState(false);
  const [memoryTime, setMemoryTime] = useState('19:30');

  // Media attachments
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVoice, setRecordedVoice] = useState(false);
  const [attachedPhoto, setAttachedPhoto] = useState(null);
  const [attachedSong, setAttachedSong] = useState('');
  const [isClassifyingAI, setIsClassifyingAI] = useState(false);

  // Memory Categories (Dynamic)
  const [categories, setCategories] = useState(['All', 'Photos', 'Voice', 'Songs', 'Dates', 'Trips']);

  const [memories, setMemories] = useState([
    {
      id: '1',
      author: 'Raj',
      title: 'Sunset Beach Walk',
      category: 'Photos',
      date: 'Aug 14, 2025 at 7:30 PM',
      emoji: '🌅',
      desc: 'Walking along the shore as the sky turned warm pink and orange. Held hands till the stars came out.',
      bg: 'linear-gradient(135deg, #FF9E7D 0%, #FF6B8B 100%)',
      hasVoice: true,
      song: 'Yellow - Coldplay'
    },
    {
      id: '2',
      author: 'Naitik',
      title: 'Stargazing Night',
      category: 'Dates',
      date: 'Oct 02, 2025',
      emoji: '✨',
      desc: 'Counted shooting stars from the hood of the car. Made three wishes together.',
      bg: 'linear-gradient(135deg, #1C2036 0%, #3D2C2E 100%)',
      hasVoice: false
    },
    {
      id: '3',
      author: 'Raj',
      title: 'Autumn Woods Walk',
      category: 'Trips',
      date: 'Nov 18, 2025 at 4:15 PM',
      emoji: '🍁',
      desc: 'Crisp leaves crackling underfoot. Shared hot chocolate from the thermos.',
      bg: 'linear-gradient(135deg, #E29578 0%, #8338EC 100%)',
      hasVoice: true
    },
    {
      id: '4',
      author: 'Naitik',
      title: 'First Concert Together',
      category: 'Songs',
      date: 'Dec 12, 2025',
      emoji: '🎵',
      desc: 'Sang along to Yellow under yellow confetti rain.',
      bg: 'linear-gradient(135deg, #F4A261 0%, #2A9D8F 100%)',
      hasVoice: false,
      song: 'Yellow - Coldplay'
    }
  ]);

  // Background Gemini AI Auto-Classification Engine
  const classifyWithAI = async (title, desc) => {
    setIsClassifyingAI(true);

    if (GEMINI_API_KEY) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Analyze this couple memory title: "${title}" and description: "${desc}". Return ONLY a valid JSON object with keys "category" (e.g. Photos, Voice, Songs, Dates, Trips, Milestones, Foodie) and "emoji" (single best storybook emoji).`
                }]
              }]
            })
          }
        );
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.category) setSelectedCategory(parsed.category);
          if (parsed.emoji) setSelectedEmoji(parsed.emoji);
          setIsClassifyingAI(false);
          return;
        }
      } catch (err) {
        console.log('Gemini API fallback:', err);
      }
    }

    const combined = (title + ' ' + desc).toLowerCase();
    let cat = 'Photos';
    let em = '🌟';

    if (combined.includes('beach') || combined.includes('sea') || combined.includes('sunset') || combined.includes('ocean')) {
      cat = 'Trips'; em = '🌅';
    } else if (combined.includes('music') || combined.includes('sing') || combined.includes('concert') || combined.includes('song')) {
      cat = 'Songs'; em = '🎵';
    } else if (combined.includes('dinner') || combined.includes('coffee') || combined.includes('food') || combined.includes('eat')) {
      cat = 'Dates'; em = '☕';
    } else if (combined.includes('star') || combined.includes('night') || combined.includes('camp')) {
      cat = 'Dates'; em = '✨';
    } else if (combined.includes('trip') || combined.includes('flight') || combined.includes('travel') || combined.includes('mountain')) {
      cat = 'Trips'; em = '✈️';
    } else if (recordedVoice) {
      cat = 'Voice'; em = '🎙️';
    }

    setSelectedCategory(cat);
    setSelectedEmoji(em);
    setIsClassifyingAI(false);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setRecordedVoice(true);
      playChime();
    }, 2500);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAttachedPhoto(url);
    }
  };

  const handleAddMemorySubmit = () => {
    if (!newTitle.trim() || !newDesc.trim()) return;

    // Date formatting (Always included)
    let formattedDate = '';
    if (memoryDate) {
      const [year, month, day] = memoryDate.split('-');
      const d = new Date(year, month - 1, day);
      formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      // If time checkbox is checked, append time
      if (includeTime && memoryTime) {
        const [h, m] = memoryTime.split(':');
        const timeObj = new Date();
        timeObj.setHours(parseInt(h), parseInt(m));
        const formattedTime = timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        formattedDate += ` at ${formattedTime}`;
      }
    } else {
      formattedDate = 'Just now';
    }

    const cat = selectedCategory || 'Photos';
    if (!categories.includes(cat)) {
      setCategories([...categories, cat]);
    }

    const newMem = {
      id: Date.now().toString(),
      author: currentPartner,
      title: newTitle,
      category: cat,
      date: formattedDate,
      emoji: selectedEmoji,
      desc: newDesc,
      bg: attachedPhoto ? `url(${attachedPhoto}) center/cover` : 'linear-gradient(135deg, #FFB347 0%, #EE7B7B 100%)',
      hasVoice: recordedVoice,
      song: attachedSong
    };

    setMemories([newMem, ...memories]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    setRecordedVoice(false);
    setAttachedPhoto(null);
    setAttachedSong('');
    setIncludeTime(false);
  };

  const handleToggleVoice = () => {
    setIsPlayingAudio(true);
    playVoiceNotePreview();
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 1500);
  };

  const filteredMemories = memories.filter((m) => {
    if (filter === 'All') return true;
    if (filter === 'Voice') return m.hasVoice;
    return m.category === filter;
  });

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      backgroundColor: '#0F1428',
      color: '#F5E6CC',
      paddingBottom: '90px',
      overflow: 'hidden'
    }}>
      {/* Background Twinkling Constellations */}
      <div className="twinkle-star" style={{ top: '10%', left: '15%', width: '3px', height: '3px' }} />
      <div className="twinkle-star" style={{ top: '22%', left: '80%', width: '4px', height: '4px', animationDelay: '1s' }} />
      <div className="twinkle-star" style={{ top: '50%', left: '40%', width: '3px', height: '3px', animationDelay: '1.8s' }} />
      <div className="twinkle-star" style={{ top: '75%', left: '85%', width: '2px', height: '2px', animationDelay: '0.4s' }} />

      {/* Header */}
      <div style={{ padding: '24px 20px 10px', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star size={22} fill="#FFB347" color="#FFB347" />
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '22px',
            fontWeight: 600,
            color: '#F5E6CC'
          }}>
            Memories
          </h1>
        </div>
        <p style={{ fontSize: '12px', color: '#A3ADC2', marginTop: '2px' }}>
          Shared constellation for Naitik & Raj
        </p>

        {/* Dynamic Category Filter Chips */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', overflowX: 'auto' }}>
          {categories.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                backgroundColor: filter === f ? '#FFB347' : 'rgba(255,255,255,0.1)',
                color: filter === f ? '#0F1428' : '#A3ADC2',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Constellation Sky Grid */}
      <div style={{ flex: 1, position: 'relative', padding: '10px 20px', zIndex: 5, overflowY: 'auto' }}>
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <line x1="25%" y1="20%" x2="75%" y2="25%" stroke="rgba(255, 179, 71, 0.4)" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="75%" y1="25%" x2="30%" y2="60%" stroke="rgba(255, 179, 71, 0.4)" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="30%" y1="60%" x2="70%" y2="65%" stroke="rgba(255, 179, 71, 0.4)" strokeWidth="1.5" strokeDasharray="4 4" />
        </svg>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {filteredMemories.map((mem, idx) => (
            <div
              key={mem.id}
              onClick={() => setSelectedMemory(mem)}
              style={{
                backgroundColor: '#FFF',
                borderRadius: '12px',
                padding: '8px 8px 14px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                transform: idx % 2 === 0 ? 'rotate(-3deg)' : 'rotate(3deg)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                height: '175px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{
                flex: 1,
                background: mem.bg,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {mem.emoji}
                {mem.hasVoice && (
                  <span style={{
                    position: 'absolute', top: '6px', right: '6px',
                    backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px', borderRadius: '50%'
                  }}>
                    <Volume2 size={12} color="#FFF" />
                  </span>
                )}
              </div>
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#3D2C2E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {mem.title}
                </h4>
                <span style={{ fontSize: '10px', color: '#EE7B7B', fontWeight: 600, display: 'block' }}>
                  By {mem.author} • {mem.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Memory Modal (Date Always Shown, Time via Checkbox) */}
      {isAddModalOpen && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FDF8F2', borderRadius: '24px', padding: '20px 22px',
            width: '100%', maxWidth: '330px', color: '#3D2C2E', maxHeight: '92%', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600 }}>
                Add Memory as {currentPartner} ⭐
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#3D2C2E" />
              </button>
            </div>

            {/* Inputs */}
            <input
              type="text"
              placeholder="Memory title..."
              value={newTitle}
              onChange={(e) => {
                setNewTitle(e.target.value);
                if (e.target.value.length > 3) classifyWithAI(e.target.value, newDesc);
              }}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '12px',
                border: '1px solid #E0D4C5', marginBottom: '10px',
                fontFamily: 'var(--font-sans)', fontSize: '14px', outline: 'none'
              }}
            />

            <textarea
              placeholder="Describe this special moment..."
              value={newDesc}
              onChange={(e) => {
                setNewDesc(e.target.value);
                if (newTitle.length > 3) classifyWithAI(newTitle, e.target.value);
              }}
              rows={3}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '12px',
                border: '1px solid #E0D4C5', marginBottom: '10px',
                fontFamily: 'var(--font-sans)', fontSize: '14px', outline: 'none',
                resize: 'none'
              }}
            />

            {/* AI Classification Preview */}
            <div style={{
              backgroundColor: '#FFF9F4', padding: '10px 12px', borderRadius: '14px',
              border: '1px solid #E0D4C5', marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#8C7A7C', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={12} color="#FFB347" /> AI CLASSIFICATION & COVER EMOJI
                </span>
                {isClassifyingAI && <span style={{ fontSize: '10px', color: '#EE7B7B' }}>Analyzing...</span>}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  fontSize: '28px', backgroundColor: '#FFF', padding: '4px 10px',
                  borderRadius: '12px', border: '1px solid #E0D4C5'
                }}>
                  {selectedEmoji}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '11px', color: '#3D2C2E', fontWeight: 600 }}>Category: {selectedCategory || 'Photos'}</span>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px', overflowX: 'auto' }}>
                    {['🌅', '✨', '☕', '🎵', '⛺', '✈️', '🕯️', '🌧️'].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setSelectedEmoji(em)}
                        style={{
                          fontSize: '16px', background: 'none', border: 'none', cursor: 'pointer'
                        }}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* DATE (Always Shown) & TIME (Checkbox Toggle) */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#8C7A7C', display: 'block', marginBottom: '4px' }}>
                MEMORY DATE 📅
              </label>
              <input
                type="date"
                value={memoryDate}
                onChange={(e) => setMemoryDate(e.target.value)}
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: '12px',
                  border: '1px solid #E0D4C5', outline: 'none', fontSize: '13px',
                  backgroundColor: '#FFF', marginBottom: '10px'
                }}
              />

              {/* Time Checkbox Toggle */}
              <div
                onClick={() => setIncludeTime(!includeTime)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                  fontSize: '12px', fontWeight: 600, color: '#3D2C2E'
                }}
              >
                {includeTime ? (
                  <CheckSquare size={16} color="var(--brand-primary)" />
                ) : (
                  <Square size={16} color="#8C7A7C" />
                )}
                <span>Include specific time ⏰</span>
              </div>

              {includeTime && (
                <div style={{ marginTop: '8px' }}>
                  <input
                    type="time"
                    value={memoryTime}
                    onChange={(e) => setMemoryTime(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 10px', borderRadius: '12px',
                      border: '1px solid #E0D4C5', outline: 'none', fontSize: '13px',
                      backgroundColor: '#FFF'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Media Attachments */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={handleStartRecording}
                disabled={isRecording}
                style={{
                  flex: 1, padding: '8px', borderRadius: '12px',
                  border: recordedVoice ? '2px solid #8AA982' : '1px solid #E0D4C5',
                  backgroundColor: recordedVoice ? '#E2F0D9' : '#FFF',
                  fontSize: '11px', fontWeight: 600, color: '#3D2C2E',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <Mic size={14} color={isRecording ? '#EE7B7B' : '#3D2C2E'} />
                {isRecording ? 'Recording...' : recordedVoice ? 'Voice Attached ✓' : 'Record Voice'}
              </button>

              <label style={{
                flex: 1, padding: '8px', borderRadius: '12px',
                border: attachedPhoto ? '2px solid #8AA982' : '1px solid #E0D4C5',
                backgroundColor: attachedPhoto ? '#E2F0D9' : '#FFF',
                fontSize: '11px', fontWeight: 600, color: '#3D2C2E',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                cursor: 'pointer'
              }}>
                <ImageIcon size={14} />
                {attachedPhoto ? 'Photo Attached ✓' : 'Attach Photo'}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
            </div>

            <button
              onClick={handleAddMemorySubmit}
              disabled={!newTitle.trim() || !newDesc.trim()}
              style={{
                width: '100%', height: '46px', borderRadius: '23px',
                backgroundColor: 'var(--brand-primary)', border: 'none',
                color: '#FFF', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                boxShadow: 'var(--shadow-pink)'
              }}
            >
              Add Memory to Constellation ✨
            </button>
          </div>
        </div>
      )}

      {/* Memory Expanded Modal */}
      {selectedMemory && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFF', borderRadius: '16px', padding: '16px',
            width: '100%', maxWidth: '310px', boxShadow: '0 15px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{
              height: '180px', background: selectedMemory.bg, borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px',
              position: 'relative'
            }}>
              <button
                onClick={() => setSelectedMemory(null)}
                style={{
                  position: 'absolute', top: '10px', right: '10px',
                  width: '30px', height: '30px', borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.4)', border: 'none',
                  color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
              {selectedMemory.emoji}
            </div>

            <div style={{ marginTop: '16px', color: '#3D2C2E' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600 }}>
                    {selectedMemory.title}
                  </h3>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#EE7B7B' }}>
                    Added by {selectedMemory.author || 'Partner'} • {selectedMemory.category}
                  </span>
                </div>
              </div>

              <span style={{ fontSize: '11px', color: '#8C7A7C', display: 'block', marginTop: '4px' }}>
                📅 {selectedMemory.date}
              </span>

              <p style={{ fontSize: '13px', lineHeight: '1.4', marginTop: '8px', color: '#5C4033' }}>
                "{selectedMemory.desc}"
              </p>

              {/* Voice Note Player */}
              {selectedMemory.hasVoice && (
                <div style={{
                  marginTop: '14px',
                  backgroundColor: '#F5E6CC',
                  padding: '10px 14px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={handleToggleVoice}
                      style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        backgroundColor: '#3D2C2E', border: 'none', color: '#FFF',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      {isPlayingAudio ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#3D2C2E' }}>
                      {selectedMemory.author}'s Voice (0:14)
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                    {[12, 20, 16, 24, 14, 22, 18, 10].map((h, i) => (
                      <div
                        key={i}
                        style={{
                          width: '3px',
                          height: `${isPlayingAudio ? Math.random() * 20 + 8 : h}px`,
                          backgroundColor: '#3D2C2E',
                          borderRadius: '2px',
                          transition: 'height 0.15s ease'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Add Memory Action Button */}
      <div style={{ padding: '0 20px 10px', zIndex: 10, display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={() => setIsAddModalOpen(true)}
          style={{
            padding: '12px 24px', borderRadius: '24px',
            backgroundColor: 'rgba(23, 29, 59, 0.85)',
            border: '1px solid rgba(255, 179, 71, 0.4)',
            color: '#FFB347', fontSize: '14px', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '6px',
            cursor: 'pointer', boxShadow: 'var(--shadow-glow)'
          }}
        >
          <Plus size={16} /> Add Memory as {currentPartner}
        </button>
      </div>
    </div>
  );
}
