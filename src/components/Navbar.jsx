import React from 'react';
import { Home, Flower2, Heart, Mail, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenNewThought, unreadCount }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'garden', label: 'Garden', icon: Flower2 },
    { id: 'new', label: 'New', icon: Heart, isCentral: true },
    { id: 'letters', label: 'Letters', icon: Mail },
    { id: 'memories', label: 'Memories', icon: Sparkles }
  ];

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      right: '20px',
      height: '64px',
      borderRadius: '32px',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '0 8px'
    }} className="glass-panel">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        if (item.isCentral) {
          return (
            <button
              key={item.id}
              onClick={onOpenNewThought}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-primary)',
                border: 'none',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-pink)',
                cursor: 'pointer',
                transition: 'transform 0.2s var(--ease-bounce)',
                marginTop: '-24px',
                position: 'relative'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Heart size={26} fill="#FFF" />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--amber-glow)',
                  color: '#3D2C2E',
                  fontSize: '11px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #FFF'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: isActive ? 'var(--brand-primary)' : 'var(--text-subtle)',
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '16px',
              transition: 'all 0.2s ease'
            }}
          >
            <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
            <span style={{
              fontSize: '11px',
              fontWeight: isActive ? 600 : 400
            }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
