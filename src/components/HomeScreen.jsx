import React, { useState, useEffect } from 'react';
import { Music, ChevronDown, Heart, Sparkles, Moon, Sun, Volume2, VolumeX, Users, RefreshCw } from 'lucide-react';

export default function HomeScreen({
  theme,
  onSelectTheme,
  houseLevel,
  unreadNotesCount,
  onOpenRitual,
  onOpenProfile,
  isAudioPlaying,
  onToggleAudio,
  currentPartner,
  onOpenPartnerSelect
}) {
  const isNight = theme === 'night';
  const isSunset = theme === 'sunset';

  const otherPartner = currentPartner === 'Naitik' ? 'Raj' : 'Naitik';
  const partnerEmoji = currentPartner === 'Naitik' ? '🐰' : '🐱';

  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Dynamic Real-Time Greeting Logic (Morning / Afternoon / Evening)
  const getDynamicGreeting = () => {
    if (theme === 'morning') return { text: 'Good morning', emoji: '☀️' };
    if (theme === 'sunset') return { text: 'Good afternoon', emoji: '🌅' };
    if (theme === 'night') return { text: 'Good evening', emoji: '🌙' };

    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', emoji: '☀️' };
    if (hour < 17) return { text: 'Good afternoon', emoji: '🌅' };
    return { text: 'Good evening', emoji: '🌙' };
  };

  const greeting = getDynamicGreeting();

  const skyQuotes = [
    "Every little thing we share, builds us.",
    "In your arms, I found my quiet home.",
    "Distance means so little when someone means so much.",
    "You are my favorite notification.",
    "Naitik & Raj • Made just for us two."
  ];

  const cycleQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % skyQuotes.length);
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflowY: 'auto',
      overflowX: 'hidden',
      paddingBottom: '96px',
      WebkitOverflowScrolling: 'touch'
    }}>
      {/* Dynamic Time-of-Day Sky & Background Elements */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: isNight
          ? 'radial-gradient(circle at 50% 20%, #1A2244 0%, #0F1428 100%)'
          : isSunset
          ? 'linear-gradient(180deg, #FF9E7D 0%, #FF6B8B 50%, #FDF8F2 100%)'
          : 'linear-gradient(180deg, #FDEAD9 0%, #F5E6CC 40%, #FDF8F2 100%)',
        transition: 'background 1.2s ease',
        zIndex: 0
      }} />

      {/* Floating Fireflies & Stars overlay for Night */}
      {isNight && (
        <>
          <div className="firefly" style={{ top: '25%', left: '15%' }} />
          <div className="firefly" style={{ top: '35%', left: '75%', animationDelay: '1.2s' }} />
          <div className="firefly" style={{ top: '55%', left: '40%', animationDelay: '2.1s' }} />
          <div className="twinkle-star" style={{ top: '12%', left: '20%', width: '3px', height: '3px' }} />
          <div className="twinkle-star" style={{ top: '18%', left: '80%', width: '4px', height: '4px', animationDelay: '1.5s' }} />
          <div className="twinkle-star" style={{ top: '28%', left: '60%', width: '2px', height: '2px', animationDelay: '0.8s' }} />
        </>
      )}

      {/* Responsive Top Header Bar */}
      <div style={{
        position: 'relative',
        zIndex: 20,
        padding: '20px 16px 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {/* Place Dropdown & Partner Indicator */}
        <div style={{ position: 'relative', flex: '1 1 auto', minWidth: '140px' }}>
          <div
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            style={{ cursor: 'pointer', display: 'inline-block' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h1 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '20px',
                fontWeight: 600,
                color: isNight ? '#F5E6CC' : '#3D2C2E',
                lineHeight: '1.2'
              }}>
                Our Place
              </h1>
              <ChevronDown size={16} color={isNight ? '#A3ADC2' : '#8C7A7C'} />
            </div>
            <p style={{
              fontSize: '11px',
              color: isNight ? '#A3ADC2' : '#8C7A7C',
              marginTop: '2px',
              fontWeight: 500
            }}>
              Naitik & Raj • Shared Space
            </p>
          </div>

          {/* Quick Theme Switcher Menu */}
          {isThemeMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '42px',
              left: 0,
              backgroundColor: isNight ? '#1E243B' : '#FFF',
              border: isNight ? '1px solid rgba(255,255,255,0.15)' : '1px solid #E0D4C5',
              borderRadius: '16px',
              padding: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              zIndex: 100,
              minWidth: '160px'
            }}>
              {[
                { id: 'night', label: 'Starlight Night 🏕️' },
                { id: 'morning', label: 'Sunrise Cottage 🏡' },
                { id: 'sunset', label: 'Sunset Meadow 🌅' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelectTheme(t.id);
                    setIsThemeMenuOpen(false);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: theme === t.id ? 'var(--brand-primary)' : 'transparent',
                    color: theme === t.id ? '#FFF' : (isNight ? '#F5E6CC' : '#3D2C2E'),
                    fontSize: '12px',
                    fontWeight: 500,
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Header Action Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Sound Toggle Button */}
          <button
            onClick={onToggleAudio}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: isNight ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isNight ? '#F5E6CC' : '#3D2C2E',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              flexShrink: 0
            }}
          >
            {isAudioPlaying ? <Volume2 size={16} color="#EE7B7B" /> : <VolumeX size={16} />}
          </button>

          {/* Switch Partner Profile Button */}
          <div
            onClick={onOpenPartnerSelect}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: isNight ? 'rgba(255,255,255,0.12)' : '#FFF9F4',
              padding: '4px 10px 4px 6px',
              borderRadius: '20px',
              cursor: 'pointer',
              border: isNight ? '1px solid rgba(255,255,255,0.15)' : '1px solid #E0D4C5',
              boxShadow: 'var(--shadow-sm)',
              flexShrink: 0
            }}
            title="Click to switch partner profile"
          >
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              backgroundColor: currentPartner === 'Naitik' ? '#FFD9C0' : '#C6E2FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 'bold'
            }}>
              {partnerEmoji}
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: isNight ? '#F5E6CC' : '#3D2C2E' }}>
              {currentPartner}
            </span>
            <RefreshCw size={11} color={isNight ? '#A3ADC2' : '#8C7A7C'} />
          </div>
        </div>
      </div>

      {/* Floating Italic Sky Quote */}
      <div style={{
        position: 'relative',
        zIndex: 5,
        padding: '0 20px',
        marginTop: '4px',
        marginBottom: '6px'
      }}>
        <div
          onClick={cycleQuote}
          style={{ cursor: 'pointer', display: 'inline-block', maxWidth: '100%' }}
          title="Click to cycle quotes"
        >
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '15px',
            color: isNight ? '#E6D3B4' : '#5C4033',
            maxWidth: '260px',
            lineHeight: '1.35',
            opacity: 0.9,
            textShadow: isNight ? '0 2px 8px rgba(0,0,0,0.5)' : 'none',
            wordBreak: 'break-word'
          }}>
            “{skyQuotes[quoteIndex]}”
          </p>
        </div>
      </div>

      {/* Storybook House Graphic Illustration Canvas */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        flex: '1 1 auto',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 16px',
        margin: 'auto 0'
      }}>
        <div className="floating-element" style={{
          width: '100%',
          maxWidth: '300px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <svg viewBox="0 0 300 230" style={{ width: '100%', height: 'auto', maxHeight: '210px', filter: isNight ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' : 'none' }}>
            <defs>
              <linearGradient id="hillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isNight ? "#1C2B36" : "#A8C3A0"} />
                <stop offset="100%" stopColor={isNight ? "#0F1428" : "#8AA982"} />
              </linearGradient>
              <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8C4A4A" />
                <stop offset="100%" stopColor="#5E2E2E" />
              </linearGradient>
              <radialGradient id="windowGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFF2B2" />
                <stop offset="100%" stopColor="#FFB347" />
              </radialGradient>
            </defs>

            {/* Rolling Green Hill */}
            <ellipse cx="150" cy="210" rx="160" ry="45" fill="url(#hillGrad)" />

            {/* Trees in Background */}
            <path d="M 40 180 L 55 130 L 70 180 Z" fill={isNight ? "#141D2C" : "#5F8756"} />
            <path d="M 230 180 L 245 125 L 260 180 Z" fill={isNight ? "#141D2C" : "#5F8756"} />
            <path d="M 25 185 L 37 145 L 49 185 Z" fill={isNight ? "#121A28" : "#4B6E44"} />

            {/* Base Cozy House Structure */}
            <rect x="95" y="110" width="110" height="75" rx="4" fill={isNight ? "#2C201C" : "#7C5C43"} />

            {/* Roof */}
            <path d="M 85 115 L 150 60 L 215 115 Z" fill="url(#roofGrad)" />
            <path d="M 80 117 L 150 62 L 220 117" stroke="#A65D5D" strokeWidth="4" strokeLinecap="round" />

            {/* Door */}
            <rect x="138" y="145" width="24" height="40" rx="12" fill="#4A3222" />
            <circle cx="157" cy="167" r="2" fill="#FFD56B" />

            {/* Glowing Windows */}
            <rect x="108" y="130" width="22" height="22" rx="4" fill="url(#windowGlow)" />
            <rect x="170" y="130" width="22" height="22" rx="4" fill="url(#windowGlow)" />
            
            {/* Window crosslines */}
            <line x1="119" y1="130" x2="119" y2="152" stroke="#5E2E2E" strokeWidth="1.5" />
            <line x1="108" y1="141" x2="130" y2="141" stroke="#5E2E2E" strokeWidth="1.5" />
            <line x1="181" y1="130" x2="181" y2="152" stroke="#5E2E2E" strokeWidth="1.5" />
            <line x1="170" y1="141" x2="192" y2="141" stroke="#5E2E2E" strokeWidth="1.5" />

            {/* Chimney & Smoke */}
            <rect x="180" y="70" width="14" height="30" fill="#5E2E2E" />
            {isNight && (
              <g opacity="0.6">
                <circle cx="187" cy="60" r="4" fill="#FFF" />
                <circle cx="192" cy="48" r="6" fill="#FFF" />
                <circle cx="198" cy="32" r="8" fill="#FFF" />
              </g>
            )}

            {/* House Level Upgrades */}
            {houseLevel >= 2 && (
              <g>
                <circle cx="105" cy="182" r="5" fill="#EE7B7B" />
                <circle cx="115" cy="184" r="6" fill="#FFB347" />
                <circle cx="185" cy="184" r="5" fill="#D4C5F9" />
                <circle cx="195" cy="182" r="6" fill="#EE7B7B" />
              </g>
            )}

            {houseLevel >= 3 && (
              <g>
                <path d="M 85 115 Q 115 125 150 118 Q 185 125 215 115" fill="none" stroke="#FFD56B" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="100" cy="120" r="2.5" fill="#FFD56B" />
                <circle cx="125" cy="122" r="2.5" fill="#EE7B7B" />
                <circle cx="150" cy="118" r="2.5" fill="#FFD56B" />
                <circle cx="175" cy="122" r="2.5" fill="#B8D8BA" />
                <circle cx="200" cy="119" r="2.5" fill="#FFD56B" />
              </g>
            )}

            {houseLevel >= 4 && (
              <g>
                <path d="M 205 140 L 235 140 L 235 185 L 205 185 Z" fill="rgba(255,255,255,0.25)" stroke="#7C5C43" strokeWidth="2" />
                <circle cx="220" cy="160" r="6" fill="#8AA982" />
              </g>
            )}

            {houseLevel >= 5 && (
              <g>
                <rect x="45" y="115" width="22" height="16" fill="#7C5C43" rx="2" />
                <path d="M 40 115 L 56 100 L 72 115 Z" fill="#8C4A4A" />
                <path d="M 130 190 Q 150 196 170 190" stroke="#8C7A7C" strokeWidth="4" fill="none" />
              </g>
            )}
          </svg>

          {/* Clean House Caption */}
          <div style={{
            fontSize: '11px',
            color: isNight ? '#A3ADC2' : '#8C7A7C',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            marginTop: '6px',
            fontWeight: 600,
            textAlign: 'center'
          }}>
            Naitik & Raj's House • Level {houseLevel} Sanctuary
          </div>
        </div>
      </div>

      {/* Bottom Primary Action Card (Dynamic Time Greeting) */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '0 16px',
        marginTop: 'auto'
      }}>
        <div className="glass-panel" style={{
          borderRadius: 'var(--radius-lg)',
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: isNight ? '0 12px 32px rgba(0,0,0,0.5)' : 'var(--shadow-md)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>{greeting.emoji}</span>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '17px',
                  fontWeight: 600,
                  color: isNight ? '#F5E6CC' : '#3D2C2E',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {greeting.text}, {currentPartner}
                </h3>
              </div>
              <p style={{
                fontSize: '12px',
                color: isNight ? '#A3ADC2' : '#8C7A7C',
                marginTop: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                It's time for your daily ritual with {otherPartner}.
              </p>
            </div>
            {unreadNotesCount > 0 && (
              <span className="pulse-glow" style={{
                backgroundColor: 'var(--brand-primary)',
                color: '#FFF',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 700,
                flexShrink: 0
              }}>
                {unreadNotesCount} new
              </span>
            )}
          </div>

          <button
            onClick={onOpenRitual}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isNight ? '#1E243B' : 'var(--text-primary)',
              border: isNight ? '1px solid rgba(255,255,255,0.15)' : 'none',
              color: '#FFF',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s ease',
              flexShrink: 0
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Let's talk with {otherPartner}
            <Heart size={15} fill="#EE7B7B" color="#EE7B7B" />
          </button>
        </div>
      </div>
    </div>
  );
}
