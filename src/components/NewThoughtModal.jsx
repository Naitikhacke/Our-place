import React, { useState } from 'react';
import { X, Feather, Send, Check, Calendar, Clock } from 'lucide-react';
import { playChime } from '../utils/audio';

export default function NewThoughtModal({ isOpen, onClose, onSendNote, currentPartner }) {
  if (!isOpen) return null;

  const recipientName = currentPartner === 'Naitik' ? 'Raj' : 'Naitik';

  const [noteText, setNoteText] = useState('');
  const [selectedMood, setSelectedMood] = useState('hurt');
  const [selectedNeed, setSelectedNeed] = useState('Reassurance');
  const [isFlying, setIsFlying] = useState(false);

  // Date & Time lock option for notes
  const [lockType, setLockType] = useState('now'); // 'now' or 'timed'
  const [unlockDate, setUnlockDate] = useState('');
  const [unlockTime, setUnlockTime] = useState('20:00');

  const moods = [
    { id: 'happy', label: 'Happy', emoji: '😊', bg: '#FFF4CC', border: '#FCE38A' },
    { id: 'hurt', label: 'Hurt', emoji: '🥺', bg: '#D9EBF7', border: '#A8D8EA' },
    { id: 'anxious', label: 'Anxious', emoji: '😔', bg: '#EBE4F7', border: '#E8DFF5' },
    { id: 'frustrated', label: 'Frustrated', emoji: '😡', bg: '#FCD9D9', border: '#FFB6B6' }
  ];

  const needs = [
    'Reassurance', 'Hug', 'Talk', 'Space', 'Understanding', 'No solution needed'
  ];

  const handleSend = () => {
    if (!noteText.trim()) return;
    setIsFlying(true);
    playChime();

    let targetTimestamp = null;
    if (lockType === 'timed' && unlockDate) {
      targetTimestamp = new Date(`${unlockDate}T${unlockTime || '00:00'}`).getTime();
    }

    setTimeout(() => {
      onSendNote({
        id: Date.now().toString(),
        author: currentPartner,
        recipient: recipientName,
        text: noteText,
        mood: selectedMood,
        need: selectedNeed,
        timestamp: 'Just now',
        status: 'unread',
        unlockTimestamp: targetTimestamp
      });
      setIsFlying(false);
      setNoteText('');
      onClose();
    }, 1100);
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 20, 40, 0.65)',
      backdropFilter: 'blur(8px)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '100%',
        maxHeight: '92%',
        backgroundColor: '#FDF8F2',
        borderTopLeftRadius: '32px',
        borderTopRightRadius: '32px',
        padding: '24px 22px 30px',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
        animation: 'slideUp 0.35s var(--ease-gentle)'
      }}>
        {/* Top Handle & Close */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <button
            onClick={onClose}
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              backgroundColor: '#F4ECE1', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#3D2C2E'
            }}
          >
            <X size={20} />
          </button>
          <div style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '18px',
            fontWeight: 600,
            color: '#3D2C2E',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <span>🌸</span> Note for {recipientName}
          </div>
          <div style={{ width: '36px' }} />
        </div>

        {/* Paper Airplane Flying Overlay */}
        {isFlying && (
          <div style={{
            position: 'absolute',
            top: '40%', left: '40%',
            zIndex: 300,
            pointerEvents: 'none'
          }} className="animate-paper-airplane">
            <div style={{
              fontSize: '60px',
              filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))'
            }}>
              🕊️
            </div>
          </div>
        )}

        {/* Input Field 1: What's on your mind? */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#3D2C2E',
            display: 'block',
            marginBottom: '8px'
          }}>
            What's on your mind, {currentPartner}?
          </label>
          <div className="parchment-card" style={{ padding: '16px 18px', borderRadius: '20px' }}>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={`Write whatever you're feeling for ${recipientName}...`}
              rows={4}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontFamily: 'var(--font-handwriting)',
                fontSize: '20px',
                color: '#3D2C2E',
                resize: 'none',
                lineHeight: '1.4'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <Feather size={18} color="#8C7A7C" style={{ opacity: 0.6 }} />
            </div>
          </div>
        </div>

        {/* Field 2: How are you feeling? */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#3D2C2E',
            display: 'block',
            marginBottom: '10px'
          }}>
            How are you feeling right now?
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {moods.map((m) => {
              const isSelected = selectedMood === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMood(m.id)}
                  style={{
                    backgroundColor: m.bg,
                    border: isSelected ? `2px solid #3D2C2E` : `1px solid ${m.border}`,
                    borderRadius: '16px',
                    padding: '12px 6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{m.emoji}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#3D2C2E' }}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Field 3: What do you need? */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#3D2C2E',
            display: 'block',
            marginBottom: '10px'
          }}>
            What do you need from {recipientName}?
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {needs.map((need) => {
              const isSelected = selectedNeed === need;
              return (
                <button
                  key={need}
                  onClick={() => setSelectedNeed(need)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: isSelected ? 'none' : '1px solid #E0D4C5',
                    backgroundColor: isSelected ? '#FAD4D4' : '#FFF9F4',
                    color: isSelected ? '#3D2C2E' : '#8C7A7C',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isSelected && <Check size={14} color="#EE7B7B" />}
                  {need}
                </button>
              );
            })}
          </div>
        </div>

        {/* Field 4: Unlock Date & Time */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#8C7A7C',
            display: 'block',
            marginBottom: '8px'
          }}>
            REVEAL TIME (WHEN CAN {recipientName.toUpperCase()} OPEN THIS?)
          </label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <button
              type="button"
              onClick={() => setLockType('now')}
              style={{
                flex: 1, padding: '8px', borderRadius: '12px',
                border: lockType === 'now' ? '2px solid var(--brand-primary)' : '1px solid #E0D4C5',
                backgroundColor: lockType === 'now' ? '#FFF9F4' : '#FFF',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer'
              }}
            >
              Open Tonight 🌙
            </button>
            <button
              type="button"
              onClick={() => setLockType('timed')}
              style={{
                flex: 1, padding: '8px', borderRadius: '12px',
                border: lockType === 'timed' ? '2px solid var(--brand-primary)' : '1px solid #E0D4C5',
                backgroundColor: lockType === 'timed' ? '#FFF9F4' : '#FFF',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer'
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

        {/* Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleSend}
            disabled={!noteText.trim() || isFlying}
            style={{
              width: '100%',
              height: '54px',
              borderRadius: '28px',
              backgroundColor: noteText.trim() ? 'var(--brand-primary)' : '#E6D8D8',
              border: 'none',
              color: '#FFF',
              fontFamily: 'var(--font-sans)',
              fontSize: '16px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: noteText.trim() ? 'pointer' : 'not-allowed',
              boxShadow: noteText.trim() ? 'var(--shadow-pink)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Send to {recipientName} 🕊️
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none',
              color: '#8C7A7C', fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', textAlign: 'center', padding: '6px'
            }}
          >
            Save as draft
          </button>
        </div>
      </div>
    </div>
  );
}
