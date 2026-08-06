import React, { useState } from 'react';
import { Sparkles, Flower2, X, Plus, Droplets, User, Trash2 } from 'lucide-react';
import { playWaterDrop } from '../utils/audio';
import confetti from 'canvas-confetti';
import { deleteGardenItemFromSupabase } from '../services/supabase';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export default function GardenScreen({ resolvedCount, gardenItems = [], onAddGardenItem, currentPartner }) {
  const [filter, setFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [waterCount, setWaterCount] = useState(0);
  const [isWatering, setIsWatering] = useState(false);
  const [isPlantModalOpen, setIsPlantModalOpen] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [newType, setNewType] = useState('flower');
  const [selectedEmoji, setSelectedEmoji] = useState('🌸');
  const [isClassifyingAI, setIsClassifyingAI] = useState(false);

  const filters = ['All', 'Resolved', 'Memories', 'Appreciations'];

  // Clean real garden items (0 sample fake data!)
  const allItems = gardenItems;

  // Background Gemini AI Classifier for Garden Items
  const classifyGardenWithAI = async (title, text) => {
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
                  text: `Analyze this garden item title: "${title}" and text: "${text}". Return ONLY a valid JSON object with keys "type" (one of: flower, butterfly, tree) and "emoji" (single best storybook flower/butterfly/tree emoji).`
                }]
              }]
            })
          }
        );
        const data = await response.json();
        const resText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = resText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.type) setNewType(parsed.type);
          if (parsed.emoji) setSelectedEmoji(parsed.emoji);
          setIsClassifyingAI(false);
          return;
        }
      } catch (err) {
        console.log('Gemini API fallback for garden classifier:', err);
      }
    }

    const combined = (title + ' ' + text).toLowerCase();
    let t = 'flower';
    let em = '🌸';

    if (combined.includes('love') || combined.includes('coffee') || combined.includes('note') || combined.includes('thank')) {
      t = 'butterfly'; em = '🦋';
    } else if (combined.includes('trip') || combined.includes('year') || combined.includes('anniversary') || combined.includes('memory')) {
      t = 'tree'; em = '🌳';
    }

    setNewType(t);
    setSelectedEmoji(em);
    setIsClassifyingAI(false);
  };

  const filteredItems = allItems.filter((item) => {
    if (filter === 'All') return true;
    if (filter === 'Resolved') return item.type === 'flower' || item.category === 'Resolved';
    if (filter === 'Memories') return item.type === 'tree' || item.category === 'Memories';
    if (filter === 'Appreciations') return item.type === 'butterfly' || item.category === 'Appreciations';
    return true;
  });

  const handleWaterPlants = () => {
    setIsWatering(true);
    playWaterDrop();
    setWaterCount((prev) => prev + 1);

    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.8 },
      colors: ['#A8C8A0', '#B4DAA2', '#8AA982']
    });

    setTimeout(() => {
      setIsWatering(false);
    }, 800);
  };

  const handlePlantSubmit = () => {
    if (!newTitle.trim() || !newText.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      author: currentPartner,
      type: newType,
      category: newType === 'tree' ? 'Memories' : newType === 'butterfly' ? 'Appreciations' : 'Resolved',
      emoji: selectedEmoji,
      title: newTitle,
      date: 'Just now',
      text: newText
    };

    onAddGardenItem(newItem);
    setIsPlantModalOpen(false);
    setNewTitle('');
    setNewText('');
  };

  const handleDeleteGardenItem = async (itemId, itemAuthor) => {
    if (itemAuthor !== currentPartner) return;
    await deleteGardenItemFromSupabase(itemId);
    setSelectedItem(null);
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
      {/* Top Header */}
      <div style={{ padding: '0 0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '22px' }}>🌸</span>
              <h1 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '24px',
                fontWeight: 600,
                color: '#3D2C2E'
              }}>
                Our Garden
              </h1>
            </div>
            <p style={{ fontSize: '13px', color: '#8C7A7C', marginTop: '2px' }}>
              Planted together by Naitik & Raj
            </p>
          </div>

          <button
            onClick={() => setIsPlantModalOpen(true)}
            style={{
              padding: '8px 16px', borderRadius: '20px',
              backgroundColor: 'var(--brand-primary)', border: 'none',
              color: '#FFF', fontSize: '13px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
              boxShadow: 'var(--shadow-pink)'
            }}
          >
            <Plus size={14} /> Plant as {currentPartner}
          </button>
        </div>

        {/* Category Filter Chips */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
          {filters.map((f) => {
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: 'none',
                  backgroundColor: isActive ? '#3D2C2E' : '#FFF9F4',
                  color: isActive ? '#FFF' : '#8C7A7C',
                  cursor: 'pointer',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
                }}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Storybook Garden Canvas Visual */}
      <div style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EBF4E8',
        borderRadius: '28px',
        padding: '24px',
        minHeight: '340px',
        border: '1px solid #D4E4CE'
      }}>
        {/* Water animation overlay */}
        {isWatering && (
          <div style={{ position: 'absolute', top: '20%', zIndex: 30, display: 'flex', gap: '20px' }}>
            <Droplets size={28} color="#70A6FF" className="firefly" />
            <Droplets size={24} color="#70A6FF" className="firefly" style={{ animationDelay: '0.2s' }} />
            <Droplets size={30} color="#70A6FF" className="firefly" style={{ animationDelay: '0.4s' }} />
          </div>
        )}

        <svg viewBox="0 0 320 280" style={{ width: '100%', height: '100%', maxHeight: '320px' }}>
          <defs>
            <linearGradient id="meadowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FDF8F2" />
              <stop offset="30%" stopColor="#E2F0D9" />
              <stop offset="100%" stopColor="#B4DAA2" />
            </linearGradient>
          </defs>

          {/* Background Meadow */}
          <rect x="0" y="0" width="320" height="280" fill="url(#meadowGrad)" rx="20" />

          {/* Cobblestone Winding Pathway */}
          <path
            d="M 160 280 Q 150 220 170 160 Q 185 110 160 80"
            fill="none" stroke="#E6D8C6" strokeWidth="28" strokeLinecap="round"
          />
          <path
            d="M 160 280 Q 150 220 170 160 Q 185 110 160 80"
            fill="none" stroke="#F4ECE1" strokeWidth="20" strokeLinecap="round" strokeDasharray="6 8"
          />

          {/* Storybook Central Oak Tree */}
          <rect x="148" y="70" width="24" height="60" fill="#7C5C43" rx="4" />
          <circle cx="160" cy="65" r="45" fill="#8AA982" />
          <circle cx="135" cy="75" r="35" fill="#789A70" />
          <circle cx="185" cy="75" r="35" fill="#98B890" />
          <circle cx="160" cy="45" r="30" fill="#A8C8A0" />

          {/* Interactive Blooming Flowers with Author Tags */}
          {filteredItems.map((item, idx) => {
            const positions = [
              { x: 90, y: 180 },
              { x: 220, y: 190 },
              { x: 110, y: 230 },
              { x: 210, y: 240 },
              { x: 70, y: 130 },
              { x: 240, y: 120 }
            ];
            const pos = positions[idx % positions.length];

            return (
              <g
                key={item.id || idx}
                onClick={() => setSelectedItem(item)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={pos.x} cy={pos.y} r="18" fill="rgba(255,255,255,0.85)" />
                <text x={pos.x - 10} y={pos.y + 7} fontSize="20">{item.emoji}</text>
              </g>
            );
          })}
        </svg>

        {filteredItems.length === 0 && (
          <p style={{ fontSize: '13px', color: '#5C7A50', marginTop: '12px', fontWeight: 600 }}>
            Our garden is fresh & clear. Click "Plant as {currentPartner}" to bloom your first flower 🌱
          </p>
        )}
      </div>

      {/* Plant New Item Modal with Gemini AI Auto-Classification */}
      {isPlantModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="parchment-card" style={{ width: '100%', maxWidth: '340px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: '#3D2C2E' }}>
                Planting as {currentPartner} 🌸
              </h3>
              <button onClick={() => setIsPlantModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#3D2C2E" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Title..."
              value={newTitle}
              onChange={(e) => {
                setNewTitle(e.target.value);
                if (e.target.value.length > 3) classifyGardenWithAI(e.target.value, newText);
              }}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px',
                border: '1px solid #E0D4C5', marginBottom: '10px',
                fontFamily: 'var(--font-sans)', fontSize: '14px', outline: 'none'
              }}
            />

            <textarea
              placeholder="What made this special?"
              value={newText}
              onChange={(e) => {
                setNewText(e.target.value);
                if (newTitle.length > 3) classifyGardenWithAI(newTitle, e.target.value);
              }}
              rows={3}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px',
                border: '1px solid #E0D4C5', marginBottom: '12px',
                fontFamily: 'var(--font-handwriting)', fontSize: '18px', outline: 'none',
                resize: 'none'
              }}
            />

            {/* AI Classification Preview */}
            <div style={{
              backgroundColor: '#FFF9F4', padding: '10px 12px', borderRadius: '14px',
              border: '1px solid #E0D4C5', marginBottom: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#8C7A7C', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={12} color="#FFB347" /> AI CLASSIFICATION & FLOWER TYPE
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
                  <span style={{ fontSize: '11px', color: '#3D2C2E', fontWeight: 600 }}>
                    Type: {newType === 'tree' ? 'Memory Tree' : newType === 'butterfly' ? 'Appreciation Butterfly' : 'Resolved Flower'}
                  </span>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px', overflowX: 'auto' }}>
                    {['🌸', '🌼', '🌻', '🌺', '🦋', '🌳', '🍀', '💐'].map((em) => (
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

            <button
              onClick={handlePlantSubmit}
              disabled={!newTitle.trim() || !newText.trim()}
              style={{
                width: '100%', height: '48px', borderRadius: '24px',
                backgroundColor: 'var(--brand-primary)', border: 'none',
                color: '#FFF', fontSize: '15px', fontWeight: 600, cursor: 'pointer'
              }}
            >
              Plant as {currentPartner} 🌱
            </button>
          </div>
        </div>
      )}

      {/* Item Detail Pop-up Modal showing Author + Deletion Option */}
      {selectedItem && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 150,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="parchment-card" style={{
            width: '100%',
            maxWidth: '320px',
            padding: '24px',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedItem(null)}
              style={{
                position: 'absolute', top: '12px', right: '12px',
                background: 'none', border: 'none', cursor: 'pointer'
              }}
            >
              <X size={18} color="#8C7A7C" />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '32px' }}>{selectedItem.emoji}</span>
              <span style={{
                fontSize: '11px', fontWeight: 700,
                backgroundColor: '#FAD4D4', color: '#3D2C2E',
                padding: '4px 10px', borderRadius: '12px'
              }}>
                Planted by {selectedItem.author || 'Partner'}
              </span>
            </div>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: '#3D2C2E' }}>
              {selectedItem.title}
            </h3>
            <span style={{ fontSize: '12px', color: '#8C7A7C', display: 'block', margin: '4px 0 12px' }}>
              Planted {selectedItem.date}
            </span>
            <p style={{ fontSize: '14px', lineHeight: '1.4', color: '#3D2C2E', marginBottom: '16px' }}>
              "{selectedItem.text}"
            </p>

            {/* AUTHOR-ONLY DELETION BUTTON */}
            {selectedItem.author === currentPartner && (
              <button
                onClick={() => handleDeleteGardenItem(selectedItem.id, selectedItem.author)}
                style={{
                  width: '100%', padding: '8px', borderRadius: '14px',
                  backgroundColor: '#FDE8E8', border: 'none', color: '#EE7B7B',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <Trash2 size={14} /> Remove Item (Planted by you)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Interactive Stats */}
      <div style={{ padding: '16px 0 10px', zIndex: 10 }}>
        <div className="glass-panel" style={{
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FFF9F4'
        }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#3D2C2E' }}>
              Planted <strong style={{ color: 'var(--brand-primary)', fontSize: '17px' }}>{gardenItems.length}</strong> flowers together
            </p>
            <p style={{ fontSize: '12px', color: '#8C7A7C', marginTop: '2px' }}>
              Naitik & Raj's living bond
            </p>
          </div>

          <button
            onClick={handleWaterPlants}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '32px',
              cursor: 'pointer',
              transform: isWatering ? 'rotate(-20deg) scale(1.1)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
            title="Tap to water garden"
          >
            🚿
          </button>
        </div>
      </div>
    </div>
  );
}
