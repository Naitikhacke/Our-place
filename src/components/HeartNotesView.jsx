import React, { useState } from 'react';
import { FileText, Plus, Lock, Heart, Check, Trash2, Filter } from 'lucide-react';
import { deleteHeartNoteFromSupabase } from '../services/supabase';

export default function HeartNotesView({
  notes = [],
  currentPartner,
  onOpenNewThought,
  onOpenRitual,
  onMarkNoteSeen,
  onDeleteNote
}) {
  const [filter, setFilter] = useState('All');
  const recipientName = currentPartner === 'Naitik' ? 'Raj' : 'Naitik';

  const isUnreadForCurrent = (n) => !n.seenBy || !n.seenBy.includes(currentPartner);

  const filteredNotes = notes.filter((n) => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return isUnreadForCurrent(n);
    if (filter === 'Resolved') return n.status === 'resolved';
    return true;
  });

  const handleDeleteNoteAction = async (noteId, noteAuthor) => {
    if (noteAuthor !== currentPartner) return;
    if (onDeleteNote) {
      await onDeleteNote(noteId, noteAuthor);
    } else {
      await deleteHeartNoteFromSupabase(noteId);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={26} color="#EE7B7B" />
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: '#3D2C2E', fontWeight: 700 }}>
              Heart Notes
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: '#8C7A7C', marginTop: '4px' }}>
            Private thoughts & feelings shared between Naitik & Raj
          </p>
        </div>

        <button
          onClick={onOpenNewThought}
          style={{
            padding: '10px 20px', borderRadius: '20px',
            backgroundColor: '#3D2C2E', border: 'none',
            color: '#FFF', fontSize: '13px', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Plus size={16} /> Write Note as {currentPartner}
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {['All', 'Unread', 'Resolved'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 18px', borderRadius: '18px',
              border: 'none',
              backgroundColor: filter === f ? '#3D2C2E' : '#FFF9F4',
              color: filter === f ? '#FFF' : '#8C7A7C',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer'
            }}
          >
            {f} Notes ({notes.filter(n => f === 'All' ? true : f === 'Unread' ? isUnreadForCurrent(n) : n.status === 'resolved').length})
          </button>
        ))}
      </div>

      {/* Notes List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredNotes.length === 0 ? (
          <div style={{
            backgroundColor: '#FFF9F4', borderRadius: '24px', padding: '40px',
            textAlign: 'center', border: '1px solid #E0D4C5'
          }}>
            <span style={{ fontSize: '36px' }}>🌸</span>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: '#3D2C2E', marginTop: '10px' }}>
              No heart notes in this section
            </h3>
            <p style={{ fontSize: '13px', color: '#8C7A7C', marginTop: '4px' }}>
              Whenever you feel happy, hurt, or anxious, write a note to {recipientName}.
            </p>
          </div>
        ) : (
          filteredNotes.map((n) => {
            const canDelete = n.author === currentPartner;
            const unread = isUnreadForCurrent(n);

            return (
              <div
                key={n.id}
                onClick={() => {
                  if (unread && onMarkNoteSeen) onMarkNoteSeen(n.id, currentPartner);
                }}
                style={{
                  backgroundColor: '#FFF',
                  borderRadius: '24px',
                  padding: '20px 24px',
                  border: unread ? '1.5px solid #EE7B7B' : '1px solid #EBE0D3',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  cursor: unread ? 'pointer' : 'default'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                  <div style={{
                    width: '50px', height: '50px', borderRadius: '50%',
                    backgroundColor: n.mood === 'happy' ? '#FFF4CC' : n.mood === 'hurt' ? '#D9EBF7' : '#EBE4F7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '26px', flexShrink: 0
                  }}>
                    {n.mood === 'happy' ? '😊' : n.mood === 'hurt' ? '🥺' : '😔'}
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'var(--font-handwriting)', fontSize: '20px', color: '#3D2C2E', lineHeight: 1.4 }}>
                      "{n.text}"
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#EE7B7B', fontWeight: 700 }}>
                        From {n.author} for {n.recipient}
                      </span>
                      <span style={{ fontSize: '11px', backgroundColor: '#FDE8E8', color: '#EE7B7B', padding: '2px 10px', borderRadius: '10px', fontWeight: 600 }}>
                        Need: {n.need}
                      </span>
                      {unread && (
                        <span style={{ fontSize: '10px', backgroundColor: '#EE7B7B', color: '#FFF', padding: '2px 8px', borderRadius: '8px', fontWeight: 700 }}>
                          UNREAD FOR YOU
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '12px', color: '#8C7A7C' }}>{n.timestamp}</span>

                  {unread && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onMarkNoteSeen) onMarkNoteSeen(n.id, currentPartner);
                      }}
                      style={{
                        backgroundColor: '#EE7B7B', border: 'none', borderRadius: '12px',
                        padding: '6px 12px', color: '#FFF', fontSize: '11px', fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Mark Seen
                    </button>
                  )}
                  
                  {/* AUTHOR-ONLY DELETION BUTTON */}
                  {canDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNoteAction(n.id, n.author);
                      }}
                      title={`Delete note written by you (${currentPartner})`}
                      style={{
                        backgroundColor: '#FDE8E8', border: 'none', borderRadius: '10px',
                        padding: '8px', color: '#EE7B7B', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
