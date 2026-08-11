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

            {/* GOOGLE ACCOUNT SELECTION BOX */}
            <div style={{
              backgroundColor: '#FFF',
              border: '1px solid #E0D4C5',
              borderRadius: '16px',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <div>
                  <div style={{ fontSize: '11px', color: '#8C7A7C', fontWeight: 600 }}>
                    {authUser ? 'SIGNED IN GOOGLE ACCOUNT' : 'GOOGLE PROFILE SYNC'}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#3D2C2E' }}>
                    {authUser ? (authUser.email || authUser.user_metadata?.full_name || 'Google User') : 'Select Google Account'}
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
                    backgroundColor: '#FDE8E8',
                    border: '1px solid #EE7B7B',
                    color: '#EE7B7B',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  title="Force Google to display account selection picker"
                >
                  {authUser ? 'Switch Google Profile' : 'Select Google Account'}
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
