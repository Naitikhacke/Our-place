import React, { useState } from 'react';
import { Heart, Sparkles, Check, ArrowRight } from 'lucide-react';
import { playChime } from '../utils/audio';
import { getRelationshipTime } from '../utils/dateCalculator';
import { updatePartnerMoodInSupabase } from '../services/supabase';

export default function PartnerSelectModal({ 
  currentPartner, 
  partnerMoods = {}, 
  onSelectPartner, 
  onClose,
  authUser,
  onGoogleSignIn,
  onSignOut
}) {
  const [step, setStep] = useState(1);
  const [selectedPartner, setSelectedPartner] = useState(currentPartner || 'Naitik');

  const getPartnerEmoji = (partner) => {
    const val = partnerMoods[partner];
    if (!val) return localStorage.getItem(`bu_mood_${partner}`) || '😊';
    if (typeof val === 'string') return val;
    return val.emoji || '😊';
  };

  const getPartnerNote = (partner) => {
    const val = partnerMoods[partner];
    if (!val) return localStorage.getItem(`bu_mood_note_${partner}`) || '';
    if (typeof val === 'string') return localStorage.getItem(`bu_mood_note_${partner}`) || '';
    return val.note || '';
  };

  const [selectedMood, setSelectedMood] = useState(() => getPartnerEmoji(currentPartner || 'Naitik'));
  const [moodNote, setMoodNote] = useState(() => getPartnerNote(currentPartner || 'Naitik'));

  const relTime = getRelationshipTime();

  const moodOptions = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '😐', label: 'Okay' },
    { emoji: '🥺', label: 'Needing love' },
    { emoji: '😔', label: 'Low energy' },
    { emoji: '😡', label: 'Upset' }
  ];

  const handleChoosePartner = (partnerId) => {
    playChime();
    setSelectedPartner(partnerId);
    setSelectedMood(getPartnerEmoji(partnerId));
    setMoodNote(getPartnerNote(partnerId));
    setStep(2);
  };

  const handleSaveMoodAndEnter = async () => {
    playChime();
    // Persist and sync mood live via Supabase
    await updatePartnerMoodInSupabase(selectedPartner, selectedMood, moodNote);
    // Pass mood emoji & note back so App.jsx updates dashboard instantly
    onSelectPartner(selectedPartner, selectedMood, moodNote);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 20, 40, 0.88)',
      backdropFilter: 'blur(12px)',
      zIndex: 300,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="parchment-card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '36px 32px',
        textAlign: 'center',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        border: '1px solid #E0D4C5'
      }}>
        {/* STEP 1: Select Profile */}
        {step === 1 && (
          <div>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              backgroundColor: '#FDE8E8', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: '32px'
            }}>
              💖
            </div>

            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', color: '#3D2C2E', marginBottom: '6px' }}>
              Welcome to Our Place
            </h2>
            <p style={{ fontSize: '13px', color: '#8C7A7C', lineHeight: '1.4', marginBottom: '20px' }}>
              Together for <strong>{relTime.totalDays} days</strong> ✨ • Who is entering right now?
            </p>

            {/* CLOUD DATABASE SYNC BADGE */}
            <div style={{
              backgroundColor: authUser ? '#E8F5E9' : '#FFF9F4',
              border: authUser ? '1px solid #81C784' : '1px solid #E0D4C5',
              borderRadius: '16px',
              padding: '10px 14px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                <span style={{ fontSize: '16px' }}>{authUser ? '☁️' : '✨'}</span>
                <div>
                  <div style={{ fontSize: '11px', color: authUser ? '#2E7D32' : '#8C7A7C', fontWeight: 700 }}>
                    {authUser ? 'SANCTUARY CLOUD SYNC ACTIVE' : 'PRIVATE SANCTUARY FOR NAITIK & RAJ'}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#3D2C2E' }}>
                    {authUser ? (authUser.email || 'Connected across all devices') : 'Sync live across all your devices'}
                  </div>
                </div>
              </div>
              {onGoogleSignIn && (
                <button
                  type="button"
                  onClick={onGoogleSignIn}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '12px',
                    backgroundColor: authUser ? '#E8F5E9' : '#FDE8E8',
                    border: authUser ? '1px solid #4CAF50' : '1px solid #EE7B7B',
                    color: authUser ? '#2E7D32' : '#EE7B7B',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {authUser ? 'Cloud Connected ✓' : 'Pair Cloud Sync'}
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div
                onClick={() => handleChoosePartner('Naitik')}
                style={{
                  backgroundColor: selectedPartner === 'Naitik' ? '#FFF9F4' : '#FFF',
                  border: selectedPartner === 'Naitik' ? '2px solid #EE7B7B' : '1px solid #E0D4C5',
                  borderRadius: '24px',
                  padding: '20px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedPartner === 'Naitik' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <div style={{
                  width: '60px', height: '60px', borderRadius: '50%',
                  backgroundColor: '#FFD9C0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '32px', marginBottom: '10px'
                }}>
                  🐰
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#3D2C2E' }}>Naitik</h3>
                <span style={{ fontSize: '11px', color: '#EE7B7B', fontWeight: 600, marginTop: '2px' }}>
                  Tap to Enter
                </span>
              </div>

              <div
                onClick={() => handleChoosePartner('Raj')}
                style={{
                  backgroundColor: selectedPartner === 'Raj' ? '#FFF9F4' : '#FFF',
                  border: selectedPartner === 'Raj' ? '2px solid #EE7B7B' : '1px solid #E0D4C5',
                  borderRadius: '24px',
                  padding: '20px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedPartner === 'Raj' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <div style={{
                  width: '60px', height: '60px', borderRadius: '50%',
                  backgroundColor: '#C6E2FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '32px', marginBottom: '10px'
                }}>
                  🐱
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#3D2C2E' }}>Raj</h3>
                <span style={{ fontSize: '11px', color: '#EE7B7B', fontWeight: 600, marginTop: '2px' }}>
                  Tap to Enter
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: How's Today's Mood? */}
        {step === 2 && (
          <div>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              backgroundColor: '#FDE8E8', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px', fontSize: '36px'
            }}>
              {selectedPartner === 'Naitik' ? '🐰' : '🐱'}
            </div>

            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: '#3D2C2E', marginBottom: '6px' }}>
              How is your mood today, {selectedPartner}?
            </h2>
            <p style={{ fontSize: '13px', color: '#8C7A7C', marginBottom: '20px' }}>
              Let your partner know how you are feeling right now.
            </p>

            {/* Mood Options */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '20px' }}>
              {moodOptions.map((opt) => (
                <button
                  key={opt.emoji}
                  type="button"
                  onClick={() => setSelectedMood(opt.emoji)}
                  style={{
                    flex: 1, padding: '12px 6px', borderRadius: '18px',
                    border: selectedMood === opt.emoji ? '2px solid #EE7B7B' : '1px solid #E0D4C5',
                    backgroundColor: selectedMood === opt.emoji ? '#FDE8E8' : '#FFF',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '26px' }}>{opt.emoji}</span>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: '#3D2C2E' }}>{opt.label}</span>
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Add a quick note about your mood (optional)..."
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '14px',
                border: '1px solid #E0D4C5', marginBottom: '20px',
                fontFamily: 'var(--font-sans)', fontSize: '13px', outline: 'none'
              }}
            />

            <button
              onClick={handleSaveMoodAndEnter}
              style={{
                width: '100%', height: '50px', borderRadius: '25px',
                backgroundColor: 'var(--brand-primary)', border: 'none',
                color: '#FFF', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: 'var(--shadow-pink)'
              }}
            >
              Enter Sanctuary as {selectedPartner} <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
