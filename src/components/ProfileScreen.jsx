import React, { useState } from 'react';
import { Home, Heart, Music, Calendar, ShieldCheck, ChevronRight, Edit3, X, Check } from 'lucide-react';

export default function ProfileScreen({
  theme,
  onSelectTheme,
  couplesNames,
  onUpdateNicknames,
  anniversaryDate,
  onUpdateAnniversary,
  favoriteSong,
  onUpdateFavoriteSong,
  isBiometricLocked,
  onToggleBiometric
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [tempNames, setTempNames] = useState(couplesNames);
  const [tempAnniversary, setTempAnniversary] = useState(anniversaryDate);
  const [tempSong, setTempSong] = useState(favoriteSong);

  const houseThemes = [
    { id: 'morning', name: 'Storybook Cottage', emoji: '🏡', desc: 'Warm wood cabin & green hills' },
    { id: 'sunset', name: 'Sunset Meadow', emoji: '🌅', desc: 'Pastel sky & wildflowers' },
    { id: 'night', name: 'Starlight Sanctuary', emoji: '🏕️', desc: 'Serene lake & glowing stars' }
  ];

  const handleSaveProfile = () => {
    onUpdateNicknames(tempNames);
    onUpdateAnniversary(tempAnniversary);
    onUpdateFavoriteSong(tempSong);
    setIsEditModalOpen(false);
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      backgroundColor: '#FAF6F0',
      paddingBottom: '60px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '24px',
            fontWeight: 600,
            color: '#3D2C2E'
          }}>
            Our Place Settings
          </h1>
          <p style={{ fontSize: '13px', color: '#8C7A7C', marginTop: '2px' }}>
            Only Naitik & Raj belong here 💕
          </p>
        </div>

        <button
          onClick={() => setIsEditModalOpen(true)}
          style={{
            padding: '8px 16px', borderRadius: '18px',
            backgroundColor: '#FFF9F4', border: '1px solid #E0D4C5',
            color: '#3D2C2E', fontSize: '13px', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
          }}
        >
          <Edit3 size={14} /> Edit Profile
        </button>
      </div>

      {/* Theme Selection Section */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#3D2C2E', marginBottom: '12px' }}>
          Theme Atmosphere
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {houseThemes.map((t) => {
            const isSelected = theme === t.id;
            return (
              <div
                key={t.id}
                onClick={() => onSelectTheme(t.id)}
                style={{
                  backgroundColor: isSelected ? '#FFF9F4' : '#FFF',
                  border: isSelected ? '2px solid var(--brand-primary)' : '1px solid #E0D4C5',
                  borderRadius: '20px',
                  padding: '16px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: isSelected ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <span style={{ fontSize: '32px', marginBottom: '6px' }}>{t.emoji}</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#3D2C2E' }}>{t.name}</span>
                <span style={{ fontSize: '11px', color: '#8C7A7C', marginTop: '2px' }}>{t.desc}</span>
                {isSelected && (
                  <span style={{
                    marginTop: '10px', fontSize: '10px', backgroundColor: 'var(--brand-primary)',
                    color: '#FFF', padding: '2px 10px', borderRadius: '10px', fontWeight: 700
                  }}>
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Nicknames */}
        <div
          onClick={() => setIsEditModalOpen(true)}
          style={{
            backgroundColor: '#FFF', borderRadius: '20px', padding: '18px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)', cursor: 'pointer', border: '1px solid #E0D4C5'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '24px' }}>💍</span>
            <div>
              <span style={{ fontSize: '11px', color: '#8C7A7C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sanctuary Profiles</span>
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#3D2C2E' }}>{couplesNames}</h4>
            </div>
          </div>
          <ChevronRight size={18} color="#8C7A7C" />
        </div>

        {/* Anniversary */}
        <div
          onClick={() => setIsEditModalOpen(true)}
          style={{
            backgroundColor: '#FFF', borderRadius: '20px', padding: '18px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)', cursor: 'pointer', border: '1px solid #E0D4C5'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '24px' }}>🗓️</span>
            <div>
              <span style={{ fontSize: '11px', color: '#8C7A7C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Together Since</span>
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#3D2C2E' }}>{anniversaryDate}</h4>
            </div>
          </div>
          <ChevronRight size={18} color="#8C7A7C" />
        </div>

        {/* Favorite Song */}
        <div
          onClick={() => setIsEditModalOpen(true)}
          style={{
            backgroundColor: '#FFF', borderRadius: '20px', padding: '18px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)', cursor: 'pointer', border: '1px solid #E0D4C5'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '24px' }}>🎵</span>
            <div>
              <span style={{ fontSize: '11px', color: '#8C7A7C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Our Anthem</span>
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#3D2C2E' }}>{favoriteSong}</h4>
            </div>
          </div>
          <ChevronRight size={18} color="#8C7A7C" />
        </div>

        {/* Security Lock Toggle */}
        <div
          onClick={onToggleBiometric}
          style={{
            backgroundColor: '#FFF', borderRadius: '20px', padding: '18px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)', cursor: 'pointer', border: '1px solid #E0D4C5'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <ShieldCheck size={24} color={isBiometricLocked ? "#8AA982" : "#8C7A7C"} />
            <div>
              <span style={{ fontSize: '11px', color: '#8C7A7C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Security</span>
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#3D2C2E' }}>
                Biometric Lock ({isBiometricLocked ? 'On' : 'Off'})
              </h4>
            </div>
          </div>
          <div style={{
            width: '46px', height: '26px', borderRadius: '13px',
            backgroundColor: isBiometricLocked ? '#8AA982' : '#E0D4C5',
            position: 'relative', transition: 'background-color 0.2s ease'
          }}>
            <div style={{
              width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#FFF',
              position: 'absolute', top: '2px', left: isBiometricLocked ? '22px' : '2px',
              transition: 'left 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          </div>
        </div>
      </div>

      {/* Edit Sanctuary Profile Modal */}
      {isEditModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="parchment-card" style={{ width: '100%', maxWidth: '360px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: '#3D2C2E' }}>
                Edit Sanctuary Profile 💍
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#3D2C2E" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#8C7A7C' }}>NAMES</label>
                <input
                  type="text"
                  value={tempNames}
                  onChange={(e) => setTempNames(e.target.value)}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '10px',
                    border: '1px solid #E0D4C5', marginTop: '4px', outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#8C7A7C' }}>TOGETHER SINCE</label>
                <input
                  type="text"
                  value={tempAnniversary}
                  onChange={(e) => setTempAnniversary(e.target.value)}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '10px',
                    border: '1px solid #E0D4C5', marginTop: '4px', outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#8C7A7C' }}>OUR ANTHEM</label>
                <input
                  type="text"
                  value={tempSong}
                  onChange={(e) => setTempSong(e.target.value)}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '10px',
                    border: '1px solid #E0D4C5', marginTop: '4px', outline: 'none'
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              style={{
                width: '100%', height: '48px', borderRadius: '24px',
                backgroundColor: 'var(--brand-primary)', border: 'none',
                color: '#FFF', fontSize: '15px', fontWeight: 600, cursor: 'pointer'
              }}
            >
              Save Profile Changes 💕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
