import React from 'react';
import { Calendar, Heart, Clock, Sparkles, MapPin, Music } from 'lucide-react';
import { getRelationshipTime } from '../utils/dateCalculator';

export default function TimelineView({ currentPartner }) {
  const relTime = getRelationshipTime();

  const timelineEvents = [
    {
      date: '21 June 2024 • 5:16 AM',
      title: 'Our Sanctuary Began 💕',
      emoji: '🌅',
      desc: 'The exact moment Naitik & Raj officially started their journey together.',
      color: '#FFD9D9'
    },
    {
      date: '14 August 2024',
      title: 'First Sunset Beach Walk',
      emoji: '🌊',
      desc: 'Held hands along the shore as the sky turned warm pink and orange.',
      color: '#EAE4F7'
    },
    {
      date: '02 October 2024',
      title: 'Stargazing Wish Night',
      emoji: '✨',
      desc: 'Counted shooting stars from the hood of the car and made three secret wishes.',
      color: '#DCEBF7'
    },
    {
      date: '12 December 2024',
      title: 'First Anniversary Mountain Trip',
      emoji: '🍁',
      desc: 'Planted our memory tree under the clear mountain stars.',
      color: '#FFF4CC'
    }
  ];

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={24} color="#EE7B7B" />
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', color: '#3D2C2E' }}>
            Our Timeline
          </h1>
        </div>
        <p style={{ fontSize: '13px', color: '#8C7A7C', marginTop: '2px' }}>
          Together since <strong>21 June, 5:16 AM</strong> • Total: <strong>{relTime.totalDays} days</strong>
        </p>
      </div>

      {/* Timeline Chain */}
      <div style={{ position: 'relative', paddingLeft: '24px', borderLeft: '2px stroke #EE7B7B' }}>
        {timelineEvents.map((evt, idx) => (
          <div
            key={idx}
            style={{
              position: 'relative',
              marginBottom: '24px',
              paddingLeft: '20px'
            }}
          >
            {/* Timeline Dot */}
            <div style={{
              position: 'absolute',
              left: '-29px',
              top: '4px',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: '#EE7B7B',
              border: '3px solid #FFF',
              boxShadow: '0 0 10px rgba(238,123,123,0.5)'
            }} />

            <div style={{
              backgroundColor: '#FFF',
              borderRadius: '20px',
              padding: '18px 20px',
              border: '1px solid #E0D4C5',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#EE7B7B' }}>
                  {evt.date}
                </span>
                <span style={{ fontSize: '22px' }}>{evt.emoji}</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '17px', fontWeight: 600, color: '#3D2C2E' }}>
                {evt.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#5C4033', marginTop: '4px', lineHeight: 1.4 }}>
                "{evt.desc}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
