import React, { useState } from 'react';
import { 
  Heart, 
  Bell, 
  Plus, 
  Sparkles, 
  MessageCircle, 
  Flower2, 
  ArrowRight, 
  Lock, 
  CloudSun, 
  Smile, 
  Volume2,
  Calendar,
  Clock,
  Mail,
  EyeOff,
  UserCheck,
  PenTool
} from 'lucide-react';
import { getRelationshipTime } from '../utils/dateCalculator';
import { updatePartnerMoodInSupabase } from '../services/supabase';

export default function DashboardView({
  theme,
  currentPartner,
  notes = [],
  gardenItems = [],
  letters = [],
  partnerMoods = { Naitik: '😊', Raj: '😊' },
  onOpenNewThought,
  onOpenRitual,
  onNavigateTab,
  onUpdateMood
}) {
  const isNight = theme === 'night';
  const otherPartner = currentPartner === 'Naitik' ? 'Raj' : 'Naitik';
  const relTime = getRelationshipTime();

  const handleUpdateCurrentMood = async (newMood) => {
    // Instantly update local state
    if (onUpdateMood) onUpdateMood(currentPartner, newMood);
    await updatePartnerMoodInSupabase(currentPartner, newMood);
  };

  // Dynamic Real Counts from database (zero fake data!)
  const conversationsCount = gardenItems.filter(i => i.category === 'Resolved').length;
  const appreciationsCount = gardenItems.filter(i => i.category === 'Appreciations').length;
  const realMemories = gardenItems.filter(i => i.category === 'Memories');
  const memoriesCount = realMemories.length;
  const lettersCount = letters.length;

  // Check if there is an unread sealed letter waiting
  const sealedLetter = letters.find(l => l.unlockTimestamp && Date.now() < l.unlockTimestamp);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      paddingBottom: '60px'
    }}>
      {/* 1. Hero Top Header Card */}
      <div style={{
        position: 'relative',
        borderRadius: '28px',
        overflow: 'hidden',
        minHeight: '340px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '28px 32px',
        boxShadow: isNight ? '0 16px 40px rgba(0,0,0,0.5)' : 'var(--shadow-md)',
        backgroundImage: 'url(/assets/storybook_cottage_hero.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {/* Soft Warm Overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.45) 100%)',
          pointerEvents: 'none', zIndex: 1
        }} />

        {/* Top Header Row with ACTIVE PROFILE BADGE */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 10
        }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '32px',
              fontWeight: 700,
              color: '#FFF',
              textShadow: '0 2px 12px rgba(0,0,0,0.5)'
            }}>
              Welcome to Our Place 💖
            </h1>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.95)',
              marginTop: '4px',
              fontWeight: 500,
              textShadow: '0 1px 6px rgba(0,0,0,0.5)'
            }}>
              Sanctuary for Naitik & Raj • Open anytime for us two
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* PROMINENT TOP ACTIVE PROFILE BADGE */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              padding: '6px 14px 6px 10px',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              border: '1px solid rgba(255,255,255,0.8)'
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                backgroundColor: currentPartner === 'Naitik' ? '#FFD9C0' : '#C6E2FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px'
              }}>
                {currentPartner === 'Naitik' ? '🐰' : '🐱'}
              </div>

              <div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#3D2C2E', lineHeight: 1, display: 'block' }}>
                  {currentPartner}
                </span>
                <span style={{ fontSize: '10px', color: '#EE7B7B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ● Active Profile
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('letters')}
              title={letters.filter(l => l.recipient === currentPartner && (!l.unlockTimestamp || Date.now() >= l.unlockTimestamp)).length > 0 ? "You have unread letters! Click to view 💌" : "Notifications"}
              style={{
                width: '42px', height: '42px', borderRadius: '50%',
                backgroundColor: letters.filter(l => l.recipient === currentPartner && (!l.unlockTimestamp || Date.now() >= l.unlockTimestamp)).length > 0 ? '#4CAF50' : 'rgba(255,255,255,0.25)', 
                backdropFilter: 'blur(10px)',
                border: letters.filter(l => l.recipient === currentPartner && (!l.unlockTimestamp || Date.now() >= l.unlockTimestamp)).length > 0 ? '2px solid #FFF' : '1px solid rgba(255,255,255,0.3)', 
                color: '#FFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: letters.filter(l => l.recipient === currentPartner && (!l.unlockTimestamp || Date.now() >= l.unlockTimestamp)).length > 0 ? '0 4px 14px rgba(76,175,80,0.5)' : 'none'
              }}
            >
              <Bell size={18} />
            </button>

            <button
              onClick={onOpenNewThought}
              style={{
                height: '42px', padding: '0 20px', borderRadius: '21px',
                backgroundColor: 'var(--brand-primary)', border: 'none',
                color: '#FFF', fontSize: '14px', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '8px',
                cursor: 'pointer', boxShadow: '0 8px 20px rgba(238,123,123,0.4)'
              }}
            >
              <Plus size={16} /> Write a Heart Note
            </button>
          </div>
        </div>

        {/* Real Dynamic Stats Box with PINTEREST I LOVE USS STAMP */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          width: 'fit-content',
          backgroundColor: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          padding: '16px 24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
          border: '1px solid rgba(255,255,255,0.6)',
          marginTop: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px'
        }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#3D2C2E', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Our little world is <em>growing beautifully</em> <Heart size={14} fill="#EE7B7B" color="#EE7B7B" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '20px' }}>🌸</span>
                <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#3D2C2E', lineHeight: 1.1 }}>{conversationsCount}</h4>
                <span style={{ fontSize: '11px', color: '#8C7A7C' }}>Conversations</span>
              </div>

              <div style={{ width: '1px', height: '24px', backgroundColor: '#E0D4C5' }} />

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '20px' }}>🦋</span>
                <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#3D2C2E', lineHeight: 1.1 }}>{appreciationsCount}</h4>
                <span style={{ fontSize: '11px', color: '#8C7A7C' }}>Appreciations</span>
              </div>

              <div style={{ width: '1px', height: '24px', backgroundColor: '#E0D4C5' }} />

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '20px' }}>🌳</span>
                <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#3D2C2E', lineHeight: 1.1 }}>{memoriesCount}</h4>
                <span style={{ fontSize: '11px', color: '#8C7A7C' }}>Memories</span>
              </div>

              <div style={{ width: '1px', height: '24px', backgroundColor: '#E0D4C5' }} />

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '20px' }}>🕯️</span>
                <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#3D2C2E', lineHeight: 1.1 }}>{lettersCount}</h4>
                <span style={{ fontSize: '11px', color: '#8C7A7C' }}>Letters</span>
              </div>
            </div>
          </div>

          {/* FANCY PINTEREST STICKER STAMP */}
          <div style={{
            backgroundColor: '#FFF0F0',
            border: '2px dashed #EE7B7B',
            borderRadius: '20px',
            padding: '10px 18px',
            transform: 'rotate(3deg)',
            boxShadow: '0 6px 16px rgba(238,123,123,0.2)'
          }}>
            <span style={{
              fontFamily: 'var(--font-handwriting)',
              fontSize: '22px',
              fontWeight: 700,
              color: '#EE7B7B',
              letterSpacing: '1px',
              display: 'block'
            }}>
              I LOVE USS! 💖
            </span>
            <span style={{ fontSize: '10px', color: '#8C7A7C', fontWeight: 600, display: 'block', textAlign: 'center' }}>
              Naitik & Raj Forever
            </span>
          </div>
        </div>
      </div>

      {/* Sealed Letter Teaser Banner */}
      {sealedLetter && (
        <div
          onClick={() => onNavigateTab('letters')}
          style={{
            backgroundColor: '#FFF9F4',
            borderRadius: '20px',
            padding: '16px 20px',
            border: '1.5px solid #FFAAAA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%',
              backgroundColor: '#FAD4D4', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Lock size={20} color="#EE7B7B" />
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#3D2C2E' }}>
                {sealedLetter.author} wrote a sealed letter for you! 🗝️
              </h4>
              <span style={{ fontSize: '12px', color: '#8C7A7C' }}>
                Title & content are hidden until set date & time. Tap to view.
              </span>
            </div>
          </div>

          <button style={{
            padding: '6px 14px', borderRadius: '14px',
            backgroundColor: 'var(--brand-primary)', border: 'none',
            color: '#FFF', fontSize: '12px', fontWeight: 600
          }}>
            View Teaser →
          </button>
        </div>
      )}

      {/* 2. Main Dashboard Grid (Row 1: Today's Heart Notes & Cozy Campfire Card) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Column: Today's Heart Notes */}
        <div style={{
          backgroundColor: '#FFF9F4',
          borderRadius: '28px',
          padding: '24px',
          border: '1px solid #F0E4D8',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, color: '#3D2C2E' }}>
                    Today's Heart Notes
                  </h3>
                  <span style={{
                    backgroundColor: 'var(--brand-primary)', color: '#FFF',
                    fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px'
                  }}>
                    {notes.length} new
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#8C7A7C', marginTop: '2px' }}>
                  💭 Thoughts waiting to be read together
                </p>
              </div>

              <button
                onClick={onOpenRitual}
                style={{
                  padding: '8px 16px', borderRadius: '20px',
                  backgroundColor: '#EE7B7B', border: 'none',
                  color: '#FFF', fontSize: '12px', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '6px',
                  cursor: 'pointer', boxShadow: '0 4px 12px rgba(238,123,123,0.3)'
                }}
              >
                <MessageCircle size={14} /> Let's Talk 💕
              </button>
            </div>

            {/* Notes Stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notes.length === 0 ? (
                <div style={{
                  backgroundColor: '#FFF', borderRadius: '20px', padding: '24px',
                  textAlign: 'center', border: '1px solid #EBE0D3'
                }}>
                  <p style={{ fontSize: '13px', color: '#8C7A7C' }}>
                    No unread heart notes right now. Click "+ Write a Heart Note" above to share a thought with {otherPartner}.
                  </p>
                </div>
              ) : (
                notes.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      backgroundColor: '#FFF',
                      borderRadius: '20px',
                      padding: '14px 18px',
                      border: '1px solid #EBE0D3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '14px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '50%',
                        backgroundColor: n.mood === 'happy' ? '#FFF4CC' : n.mood === 'hurt' ? '#D9EBF7' : '#EBE4F7',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '22px', flexShrink: 0
                      }}>
                        {n.mood === 'happy' ? '😊' : n.mood === 'hurt' ? '🥺' : '😔'}
                      </div>

                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '13px', color: '#3D2C2E', lineHeight: 1.35 }}>
                          "{n.text}"
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <span style={{ fontSize: '10px', color: '#EE7B7B', fontWeight: 600 }}>
                            By {n.author}
                          </span>
                          <span style={{ fontSize: '10px', backgroundColor: '#FDE8E8', color: '#EE7B7B', padding: '2px 8px', borderRadius: '8px', fontWeight: 600 }}>
                            Need: {n.need}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#8C7A7C' }}>{n.timestamp}</span>
                      <Lock size={14} color="#EE7B7B" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('notes')}
            style={{
              background: 'none', border: 'none', color: '#EE7B7B',
              fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
              cursor: 'pointer', marginTop: '16px', alignSelf: 'center'
            }}
          >
            See all heart notes <ArrowRight size={14} />
          </button>
        </div>

        {/* Right Column: Cozy Campfire Card */}
        <div style={{
          borderRadius: '28px',
          padding: '24px',
          color: '#F5E6CC',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
          backgroundImage: 'url(/assets/campfire_cozy_card.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          {/* Overlay */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(180deg, rgba(15,20,40,0.6) 0%, rgba(15,20,40,0.85) 100%)',
            pointerEvents: 'none', zIndex: 1
          }} />

          <div style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, color: '#F5E6CC' }}>
                Let's Talk
              </h3>
              <span style={{ fontSize: '20px' }}>💬</span>
            </div>
            <p style={{ fontSize: '12px', color: '#A3ADC2' }}>
              Open anytime for Naitik & Raj.
            </p>

            <div style={{
              height: '130px',
              borderRadius: '20px',
              margin: '18px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '44px', filter: 'drop-shadow(0 0 15px #FFB347)' }}>🔥</span>
              <span style={{ fontSize: '12px', color: '#FFB347', fontWeight: 600, marginTop: '6px' }}>
                {notes.length} heart notes waiting for us
              </span>
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={onOpenRitual}
              style={{
                width: '100%', height: '46px', borderRadius: '23px',
                backgroundColor: 'var(--brand-primary)', border: 'none',
                color: '#FFF', fontSize: '14px', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                cursor: 'pointer', boxShadow: 'var(--shadow-pink)'
              }}
            >
              Let's Talk Now <Heart size={14} fill="#FFF" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Row 2: Our Garden Banner & REAL-TIME MOOD TRACKER */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left: Our Garden Panoramic Meadow Banner */}
        <div style={{
          borderRadius: '28px',
          padding: '24px',
          border: '1px solid #F0E4D8',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '220px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundImage: 'url(/assets/garden_meadow_banner.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(180deg, rgba(255,249,244,0.85) 0%, rgba(255,249,244,0.95) 100%)',
            pointerEvents: 'none', zIndex: 1
          }} />

          <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, color: '#3D2C2E' }}>
                Our Garden
              </h3>
              <p style={{ fontSize: '12px', color: '#8C7A7C', marginTop: '2px' }}>
                Every conversation we've had, makes our garden bloom.
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('garden')}
              style={{
                padding: '8px 16px', borderRadius: '20px',
                backgroundColor: '#FFF', border: '1px solid #E0D4C5',
                color: '#3D2C2E', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Visit Garden →
            </button>
          </div>

          {/* Plant Stats Chips */}
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', gap: '12px', marginTop: '24px' }}>
            <div style={{
              backgroundColor: '#FFF',
              padding: '10px 16px', borderRadius: '16px',
              border: '1px solid #E0D4C5', display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <span style={{ fontSize: '20px' }}>🌸</span>
              <div>
                <h5 style={{ fontSize: '12px', fontWeight: 700, color: '#3D2C2E' }}>Flowers</h5>
                <span style={{ fontSize: '10px', color: '#8C7A7C' }}>{conversationsCount} flowers planted</span>
              </div>
            </div>

            <div style={{
              backgroundColor: '#FFF',
              padding: '10px 16px', borderRadius: '16px',
              border: '1px solid #E0D4C5', display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <span style={{ fontSize: '20px' }}>🦋</span>
              <div>
                <h5 style={{ fontSize: '12px', fontWeight: 700, color: '#3D2C2E' }}>Butterflies</h5>
                <span style={{ fontSize: '10px', color: '#8C7A7C' }}>{appreciationsCount} appreciations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: REAL-TIME NAITIK & RAJ MOOD TRACKER CARD */}
        {(() => {
          const naitikMoodData = typeof partnerMoods.Naitik === 'object' && partnerMoods.Naitik
            ? partnerMoods.Naitik 
            : { emoji: partnerMoods.Naitik || '😊', note: '', date: '' };

          const rajMoodData = typeof partnerMoods.Raj === 'object' && partnerMoods.Raj
            ? partnerMoods.Raj 
            : { emoji: partnerMoods.Raj || '😊', note: '', date: '' };

          return (
            <div style={{
              backgroundColor: '#FFF9F4',
              borderRadius: '28px',
              padding: '24px',
              border: '1px solid #F0E4D8',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#3D2C2E' }}>
                  How We are Feeling Today
                </h4>
                <p style={{ fontSize: '11px', color: '#8C7A7C', marginTop: '2px' }}>
                  Synced live between Naitik & Raj ✨
                </p>

                {/* NAITIK'S MOOD ROW */}
                <div style={{ marginTop: '16px', backgroundColor: '#FFF', padding: '12px', borderRadius: '16px', border: '1px solid #EBE0D3' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#3D2C2E', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      🐰 Naitik's Mood {currentPartner === 'Naitik' && <span style={{ fontSize: '10px', color: '#EE7B7B' }}>(You)</span>}
                    </span>
                    <span style={{ fontSize: '22px' }}>{naitikMoodData.emoji || '😊'}</span>
                  </div>

                  {naitikMoodData.note && (
                    <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#6A5658', backgroundColor: '#FFF7F0', padding: '6px 10px', borderRadius: '10px', marginBottom: '8px', borderLeft: '3px solid #EE7B7B' }}>
                      💬 "{naitikMoodData.note}"
                    </div>
                  )}

                  {currentPartner === 'Naitik' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2px' }}>
                      {['😡', '😔', '🥺', '😐', '😊'].map((em) => (
                        <button
                          key={em}
                          onClick={() => handleUpdateCurrentMood(em)}
                          style={{
                            fontSize: '16px', padding: '4px 6px', borderRadius: '10px',
                            border: naitikMoodData.emoji === em ? '2px solid #EE7B7B' : '1px solid transparent',
                            backgroundColor: naitikMoodData.emoji === em ? '#FDE8E8' : 'transparent',
                            cursor: 'pointer'
                          }}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* RAJ'S MOOD ROW */}
                <div style={{ marginTop: '10px', backgroundColor: '#FFF', padding: '12px', borderRadius: '16px', border: '1px solid #EBE0D3' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#3D2C2E', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      🐱 Raj's Mood {currentPartner === 'Raj' && <span style={{ fontSize: '10px', color: '#EE7B7B' }}>(You)</span>}
                    </span>
                    <span style={{ fontSize: '22px' }}>{rajMoodData.emoji || '😊'}</span>
                  </div>

                  {rajMoodData.note && (
                    <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#6A5658', backgroundColor: '#FFF7F0', padding: '6px 10px', borderRadius: '10px', marginBottom: '8px', borderLeft: '3px solid #C6E2FF' }}>
                      💬 "{rajMoodData.note}"
                    </div>
                  )}

                  {currentPartner === 'Raj' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2px' }}>
                      {['😡', '😔', '🥺', '😐', '😊'].map((em) => (
                        <button
                          key={em}
                          onClick={() => handleUpdateCurrentMood(em)}
                          style={{
                            fontSize: '16px', padding: '4px 6px', borderRadius: '10px',
                            border: rajMoodData.emoji === em ? '2px solid #EE7B7B' : '1px solid transparent',
                            backgroundColor: rajMoodData.emoji === em ? '#FDE8E8' : 'transparent',
                            cursor: 'pointer'
                          }}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
          );
        })()}

          <div style={{
            backgroundColor: '#FDE8E8', padding: '10px 14px', borderRadius: '14px',
            fontSize: '12px', fontStyle: 'italic', color: '#EE7B7B', marginTop: '14px', textAlign: 'center'
          }}>
            “Thank you for being my safe place. I LOVE USS! 💕”
          </div>
        </div>
      </div>

      {/* 4. Row 3: LETTERS SECTION (PLACED DIRECTLY BELOW GARDEN ON DASHBOARD) */}
      <div style={{
        backgroundColor: '#FFF9F4',
        borderRadius: '28px',
        padding: '24px',
        border: '1px solid #F0E4D8'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={22} color="#EE7B7B" />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, color: '#3D2C2E' }}>
                Letters for Naitik & Raj 💌
              </h3>
            </div>
            <p style={{ fontSize: '12px', color: '#8C7A7C', marginTop: '2px' }}>
              Written envelopes & sealed messages
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('letters')}
            style={{
              padding: '8px 16px', borderRadius: '20px',
              backgroundColor: '#EE7B7B', border: 'none',
              color: '#FFF', fontSize: '12px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
            }}
          >
            Open Letters Page →
          </button>
        </div>

        {letters.length === 0 ? (
          <div style={{
            backgroundColor: '#FFF', borderRadius: '20px', padding: '24px',
            textAlign: 'center', border: '1px solid #EBE0D3'
          }}>
            <p style={{ fontSize: '13px', color: '#8C7A7C' }}>
              No letters written yet. Go to the Letters page to send your first letter!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {letters.slice(0, 3).map((l) => (
              <div
                key={l.id}
                onClick={() => onNavigateTab('letters')}
                style={{
                  backgroundColor: l.color || '#FFD9D9',
                  border: `1.5px solid ${l.border || '#FFAAAA'}`,
                  borderRadius: '20px',
                  padding: '16px',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <Mail size={18} color="#EE7B7B" />
                  <span style={{ fontSize: '10px', color: '#EE7B7B', fontWeight: 700 }}>
                    From {l.author}
                  </span>
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#3D2C2E' }}>
                  {l.title}
                </h4>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Row 4: Real Memories Polaroid Grid */}
      <div style={{
        backgroundColor: '#FFF9F4',
        borderRadius: '28px',
        padding: '24px',
        border: '1px solid #F0E4D8'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, color: '#3D2C2E' }}>
              Recent Memories 💕
            </h3>
            <p style={{ fontSize: '12px', color: '#8C7A7C', marginTop: '2px' }}>
              Moments saved by Naitik & Raj
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('memories')}
            style={{ background: 'none', border: 'none', color: '#EE7B7B', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
          >
            View all memories →
          </button>
        </div>

        {/* Real Memories Gallery Cards Grid */}
        {realMemories.length === 0 ? (
          <div style={{
            backgroundColor: '#FFF', borderRadius: '20px', padding: '24px',
            textAlign: 'center', border: '1px solid #EBE0D3'
          }}>
            <p style={{ fontSize: '13px', color: '#8C7A7C' }}>
              No saved memories yet. Visit the Memories tab to add your first memory together!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px' }}>
            {realMemories.map((m, idx) => (
              <div
                key={m.id || idx}
                style={{
                  backgroundColor: '#FFF', borderRadius: '14px', padding: '6px 6px 10px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)', cursor: 'pointer', textAlign: 'center'
                }}
              >
                <div style={{
                  height: '110px', backgroundColor: '#FDE8E8', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px'
                }}>
                  {m.emoji || '📸'}
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#3D2C2E', marginTop: '6px', display: 'block' }}>
                  {m.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
