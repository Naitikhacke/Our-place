import React from 'react';
import { 
  Home, 
  FileText, 
  MessageCircle, 
  Flower2, 
  Mail, 
  Sparkles, 
  Calendar, 
  Music, 
  Settings, 
  Heart, 
  Sun, 
  Moon, 
  Sunset,
  ChevronDown
} from 'lucide-react';
import { getRelationshipTime } from '../utils/dateCalculator';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  currentPartner, 
  onOpenPartnerSelect, 
  theme, 
  onSelectTheme,
  notesCount 
}) {
  const isNight = theme === 'night';
  const relTime = getRelationshipTime();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'notes', label: 'Heart Notes', icon: FileText, badge: notesCount },
    { id: 'ritual', label: "Let's Talk", icon: MessageCircle },
    { id: 'garden', label: 'Garden', icon: Flower2 },
    { id: 'letters', label: 'Letters', icon: Mail },
    { id: 'memories', label: 'Memories', icon: Sparkles },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'playlist', label: 'Playlist', icon: Music },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside style={{
      width: '260px',
      height: '100vh',
      backgroundColor: isNight ? '#151A2E' : '#FFF9F4',
      borderRight: isNight ? '1px solid rgba(255,255,255,0.08)' : '1px solid #F0E4D8',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 18px',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 100,
      overflowY: 'auto',
      color: isNight ? '#F5E6CC' : '#3D2C2E',
      transition: 'background-color 0.4s ease'
    }}>
      {/* Brand Header */}
      <div style={{ marginBottom: '18px', paddingLeft: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '22px',
            fontWeight: 700,
            color: isNight ? '#F5E6CC' : '#3D2C2E',
            lineHeight: 1
          }}>
            Our Place
          </h1>
          <Heart size={16} fill="#EE7B7B" color="#EE7B7B" />
        </div>
        <p style={{
          fontSize: '12px',
          color: isNight ? '#A3ADC2' : '#8C7A7C',
          marginTop: '4px',
          fontWeight: 500
        }}>
          Just the two of us
        </p>

        {/* FANCY PINTEREST STICKER / BADGE */}
        <div style={{
          marginTop: '10px',
          display: 'inline-block',
          backgroundColor: '#FDE8E8',
          border: '1.5px dashed #EE7B7B',
          borderRadius: '16px',
          padding: '4px 12px',
          boxShadow: '0 4px 12px rgba(238,123,123,0.15)',
          transform: 'rotate(-2deg)'
        }}>
          <span style={{
            fontFamily: 'var(--font-handwriting)',
            fontSize: '17px',
            fontWeight: 700,
            color: '#EE7B7B',
            letterSpacing: '1px'
          }}>
            ✨ I LOVE USS 💕
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: isActive
                  ? (isNight ? 'rgba(238, 123, 123, 0.18)' : '#FDE8E8')
                  : 'transparent',
                color: isActive
                  ? '#EE7B7B'
                  : (isNight ? '#A3ADC2' : '#5C4033'),
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <IconComponent size={18} color={isActive ? '#EE7B7B' : (isNight ? '#A3ADC2' : '#8C7A7C')} />
                <span>{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span style={{
                  backgroundColor: '#EE7B7B',
                  color: '#FFF',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Partner Profile Card (Naitik & Raj) */}
      <div
        onClick={onOpenPartnerSelect}
        style={{
          backgroundColor: isNight ? 'rgba(255,255,255,0.05)' : '#FDF3E9',
          borderRadius: '20px',
          padding: '14px 16px',
          marginTop: '16px',
          cursor: 'pointer',
          border: isNight ? '1px solid rgba(255,255,255,0.1)' : '1px solid #EBE0D3',
          transition: 'transform 0.2s ease'
        }}
        title="Click to switch active profile"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              backgroundColor: '#FFD9C0', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', zIndex: 2, border: '2px solid #FFF'
            }}>
              🐰
            </div>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              backgroundColor: '#C6E2FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', marginLeft: '-10px', zIndex: 1, border: '2px solid #FFF'
            }}>
              🐱
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: isNight ? '#F5E6CC' : '#3D2C2E', lineHeight: 1.2 }}>
              Naitik & Raj
            </h4>
            <span style={{ fontSize: '11px', color: '#EE7B7B', fontWeight: 600, display: 'block', marginTop: '2px' }}>
              Together for {relTime.totalDays} days ✨
            </span>
          </div>
        </div>
      </div>

      {/* Quote Box Card */}
      <div style={{
        backgroundColor: isNight ? 'rgba(255,255,255,0.03)' : '#FAF1E8',
        borderRadius: '16px',
        padding: '12px 14px',
        marginTop: '12px',
        fontSize: '11px',
        color: isNight ? '#A3ADC2' : '#8C7A7C',
        lineHeight: 1.4,
        textAlign: 'center'
      }}>
        “Little things, when shared, become big things in a relationship. 💕”
      </div>

      {/* Theme Switcher Button */}
      <div style={{ marginTop: '14px', position: 'relative' }}>
        <button
          onClick={() => {
            const nextTheme = theme === 'morning' ? 'sunset' : theme === 'sunset' ? 'night' : 'morning';
            onSelectTheme(nextTheme);
          }}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '16px',
            border: isNight ? '1px solid rgba(255,255,255,0.12)' : '1px solid #E0D4C5',
            backgroundColor: isNight ? 'rgba(255,255,255,0.06)' : '#FFF',
            color: isNight ? '#F5E6CC' : '#3D2C2E',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {theme === 'night' && <Moon size={14} color="#FFB347" />}
            {theme === 'sunset' && <Sunset size={14} color="#EE7B7B" />}
            {theme === 'morning' && <Sun size={14} color="#FFB347" />}
            <span style={{ textTransform: 'capitalize' }}>{theme} Mode</span>
          </div>
          <ChevronDown size={14} color="#8C7A7C" />
        </button>
      </div>
    </aside>
  );
}
