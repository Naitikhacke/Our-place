import React, { useState } from 'react';
import { X, Flame, Heart, Sparkles, Check, ArrowRight } from 'lucide-react';
import { playChime, playMagicBell } from '../utils/audio';
import confetti from 'canvas-confetti';

export default function EveningRitualModal({ isOpen, onClose, notes = [], onResolveNotes, currentPartner }) {
  if (!isOpen) return null;

  const [step, setStep] = useState(1);
  const [currentNoteIdx, setCurrentNoteIdx] = useState(0);

  const otherPartner = currentPartner === 'Naitik' ? 'Raj' : 'Naitik';
  const activeNotesList = notes;
  const currentNote = activeNotesList[currentNoteIdx];

  const handleNextNote = () => {
    playMagicBell();
    if (currentNoteIdx < activeNotesList.length - 1) {
      setCurrentNoteIdx(currentNoteIdx + 1);
    } else {
      setStep(3);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#EE7B7B', '#FFB347', '#D4C5F9']
      });
    }
  };

  const handleCompleteRitual = () => {
    onResolveNotes();
    onClose();
    setStep(1);
    setCurrentNoteIdx(0);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 20, 40, 0.9)',
      backdropFilter: 'blur(12px)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: '#1E243B',
        borderRadius: '32px',
        border: '1px solid rgba(255,255,255,0.15)',
        padding: '32px',
        width: '100%',
        maxWidth: '440px',
        color: '#F5E6CC',
        position: 'relative',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        textAlign: 'center'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '20px', right: '20px',
            width: '36px', height: '36px', borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.1)', border: 'none',
            color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* STEP 1: Welcome */}
        {step === 1 && (
          <div>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              backgroundColor: 'rgba(255, 179, 71, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: '32px'
            }}>
              💬
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: '#F5E6CC', marginBottom: '8px' }}>
              Let's Talk 💕
            </h2>
            <p style={{ fontSize: '13px', color: '#A3ADC2', lineHeight: '1.4', marginBottom: '24px' }}>
              A quiet space for <strong>Naitik & Raj</strong> to share thoughts and listen with open hearts.
            </p>

            {activeNotesList.length === 0 ? (
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.06)', padding: '20px', borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px'
              }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFB347', display: 'block', marginBottom: '4px' }}>
                  No active heart notes right now 🌸
                </span>
                <span style={{ fontSize: '12px', color: '#A3ADC2' }}>
                  Write a heart note anytime to start a talk with {otherPartner}.
                </span>
              </div>
            ) : (
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.06)', padding: '16px', borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px'
              }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#FFB347' }}>
                  {activeNotesList.length} thoughts waiting to be read together
                </span>
              </div>
            )}

            {activeNotesList.length > 0 && (
              <button
                onClick={() => { playChime(); setStep(2); }}
                style={{
                  width: '100%', height: '50px', borderRadius: '25px',
                  backgroundColor: 'var(--brand-primary)', border: 'none',
                  color: '#FFF', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                  boxShadow: 'var(--shadow-pink)'
                }}
              >
                Open Thoughts Together 💌
              </button>
            )}
          </div>
        )}

        {/* STEP 2: Reading Notes */}
        {step === 2 && currentNote && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', color: '#FFB347', fontWeight: 600 }}>
                Thought {currentNoteIdx + 1} of {activeNotesList.length}
              </span>
              <span style={{ fontSize: '11px', backgroundColor: 'rgba(238,123,123,0.2)', color: '#EE7B7B', padding: '3px 10px', borderRadius: '10px', fontWeight: 600 }}>
                Need: {currentNote.need}
              </span>
            </div>

            <div className="parchment-card" style={{ padding: '24px', textAlign: 'left', marginBottom: '24px', color: '#3D2C2E' }}>
              <div style={{ fontSize: '12px', color: '#EE7B7B', fontWeight: 700, marginBottom: '8px' }}>
                Written by {currentNote.author} for {currentNote.recipient}
              </div>
              <p style={{ fontFamily: 'var(--font-handwriting)', fontSize: '22px', lineHeight: '1.4', color: '#3D2C2E' }}>
                "{currentNote.text}"
              </p>
            </div>

            <button
              onClick={handleNextNote}
              style={{
                width: '100%', height: '50px', borderRadius: '25px',
                backgroundColor: 'var(--brand-primary)', border: 'none',
                color: '#FFF', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              {currentNoteIdx < activeNotesList.length - 1 ? 'Next Thought' : 'Complete Discussion 💕'}
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 3: Talk Resolved & Planted */}
        {step === 3 && (
          <div>
            <div style={{ fontSize: '48px', marginBottom: '14px' }}>
              🌸
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: '#F5E6CC', marginBottom: '8px' }}>
              We Talked 💕
            </h2>
            <p style={{ fontSize: '13px', color: '#A3ADC2', lineHeight: '1.4', marginBottom: '24px' }}>
              These thoughts have been planted as blooming flowers in <strong>Naitik & Raj's Garden</strong>!
            </p>

            <button
              onClick={handleCompleteRitual}
              style={{
                width: '100%', height: '50px', borderRadius: '25px',
                backgroundColor: 'var(--brand-primary)', border: 'none',
                color: '#FFF', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                boxShadow: 'var(--shadow-pink)'
              }}
            >
              Return to Our Place 💖
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
