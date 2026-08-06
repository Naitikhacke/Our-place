import React, { useState, useEffect } from 'react';
import { Music, Play, Pause, Heart, Plus, X, Disc, ExternalLink, Volume2, Trash2 } from 'lucide-react';
import { playChime, playMagicBell } from '../utils/audio';
import { subscribeToPlaylist, addSongToSupabase, deleteGardenItemFromSupabase } from '../services/supabase';

export default function PlaylistView({ currentPartner = 'Naitik' }) {
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [isAddSongOpen, setIsAddSongOpen] = useState(false);

  // Song Form State
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [note, setNote] = useState('');
  const [link, setLink] = useState('');

  const [tracks, setTracks] = useState([]);

  // Supabase real-time listener for shared playlist
  useEffect(() => {
    const unsub = subscribeToPlaylist((remoteSongs) => {
      if (remoteSongs) {
        const parsed = remoteSongs.map((s) => {
          const parts = (s.text || '').split(' | link:');
          const meta = parts[0] || '';
          const audioLink = parts[1] || '';
          const [artistName, songNote] = meta.split(' • ');

          return {
            id: s.id,
            title: s.title || 'Untitled Song',
            artist: artistName || 'Unknown Artist',
            note: songNote || '',
            link: audioLink,
            author: s.author || 'Naitik',
            duration: '3:30'
          };
        });
        setTracks(parsed);
      }
    });

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const handleAddSong = async () => {
    if (!title.trim() || !artist.trim()) return;

    const newSong = {
      id: Date.now().toString(),
      title,
      artist,
      note,
      link,
      author: currentPartner,
      duration: '3:30'
    };

    setTracks([newSong, ...tracks]);
    await addSongToSupabase(newSong);

    setIsAddSongOpen(false);
    setTitle('');
    setArtist('');
    setNote('');
    setLink('');
  };

  const handleDeleteSong = async (e, songId, songAuthor) => {
    e.stopPropagation();
    if (songAuthor !== currentPartner) return;
    await deleteGardenItemFromSupabase(songId);
  };

  const togglePlay = (id) => {
    playMagicBell();
    setPlayingTrackId(playingTrackId === id ? null : id);
  };

  // Convert Spotify URL to embed URL if provided
  const getSpotifyEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('spotify.com/track/')) {
      const trackId = url.split('track/')[1]?.split('?')[0];
      if (trackId) return `https://open.spotify.com/embed/track/${trackId}`;
    }
    return null;
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Music size={24} color="#EE7B7B" />
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', color: '#3D2C2E' }}>
              Our Shared Playlist
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: '#8C7A7C', marginTop: '2px' }}>
            Songs that remind us of Naitik & Raj • Synced live across both devices
          </p>
        </div>

        <button
          onClick={() => setIsAddSongOpen(true)}
          style={{
            padding: '10px 20px', borderRadius: '20px',
            backgroundColor: 'var(--brand-primary)', border: 'none',
            color: '#FFF', fontSize: '13px', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '6px',
            cursor: 'pointer', boxShadow: 'var(--shadow-pink)'
          }}
        >
          <Plus size={16} /> Add Song to Playlist
        </button>
      </div>

      {/* Playlist Tracks List */}
      {tracks.length === 0 ? (
        <div style={{
          backgroundColor: '#FFF9F4', borderRadius: '24px', padding: '40px',
          textAlign: 'center', border: '1px solid #E0D4C5'
        }}>
          <span style={{ fontSize: '36px' }}>🎵</span>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: '#3D2C2E', marginTop: '10px' }}>
            No songs added to playlist yet
          </h3>
          <p style={{ fontSize: '13px', color: '#8C7A7C', marginTop: '4px' }}>
            Click "Add Song to Playlist" above to add your first favorite song!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {tracks.map((track) => {
            const isPlaying = playingTrackId === track.id;
            const spotifyEmbed = getSpotifyEmbedUrl(track.link);
            const canDelete = track.author === currentPartner;

            return (
              <div
                key={track.id}
                style={{
                  backgroundColor: isPlaying ? '#FFF0F0' : '#FFF',
                  borderRadius: '24px',
                  padding: '18px 22px',
                  border: isPlaying ? '2px solid #EE7B7B' : '1px solid #EBE0D3',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                    <button
                      onClick={() => togglePlay(track.id)}
                      style={{
                        width: '46px', height: '46px', borderRadius: '50%',
                        backgroundColor: isPlaying ? '#EE7B7B' : '#3D2C2E',
                        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#FFF', cursor: 'pointer', flexShrink: 0,
                        boxShadow: isPlaying ? '0 4px 14px rgba(238,123,123,0.5)' : 'none'
                      }}
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
                    </button>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#3D2C2E' }}>
                          {track.title}
                        </h4>
                        {isPlaying && (
                          <span style={{ fontSize: '10px', backgroundColor: '#EE7B7B', color: '#FFF', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                            Playing 🎶
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '13px', color: '#8C7A7C', marginTop: '2px' }}>
                        {track.artist} {track.note ? `• ${track.note}` : ''}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontSize: '11px', color: '#EE7B7B', fontWeight: 600 }}>
                      Added by {track.author}
                    </span>

                    {/* AUTHOR-ONLY DELETION BUTTON */}
                    {canDelete && (
                      <button
                        onClick={(e) => handleDeleteSong(e, track.id, track.author)}
                        title={`Delete song added by you (${currentPartner})`}
                        style={{
                          backgroundColor: '#FDE8E8', border: 'none', borderRadius: '10px',
                          padding: '8px', color: '#EE7B7B', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}

                    <Heart size={18} fill="#EE7B7B" color="#EE7B7B" />
                  </div>
                </div>

                {/* Embedded Spotify Player Widget if link provided */}
                {isPlaying && spotifyEmbed && (
                  <div style={{ marginTop: '16px', borderRadius: '16px', overflow: 'hidden' }}>
                    <iframe
                      src={spotifyEmbed}
                      width="100%"
                      height="80"
                      frameBorder="0"
                      allow="encrypted-media"
                      title={track.title}
                    />
                  </div>
                )}

                {/* Playing Audio Sound Message */}
                {isPlaying && !spotifyEmbed && (
                  <div style={{
                    marginTop: '12px', padding: '10px 14px', borderRadius: '14px',
                    backgroundColor: '#FDE8E8', color: '#EE7B7B', fontSize: '12px',
                    fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                    <Volume2 size={16} /> Playing melody preview sound for "{track.title}" 💕
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Song Modal */}
      {isAddSongOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="parchment-card" style={{ width: '100%', maxWidth: '380px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#3D2C2E' }}>
                Add Song to Our Playlist 🎵
              </h3>
              <button onClick={() => setIsAddSongOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#3D2C2E" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#8C7A7C' }}>SONG TITLE *</label>
                <input
                  type="text"
                  placeholder="e.g. Yellow"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '10px',
                    border: '1px solid #E0D4C5', marginTop: '4px', outline: 'none', fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#8C7A7C' }}>ARTIST NAME *</label>
                <input
                  type="text"
                  placeholder="e.g. Coldplay"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '10px',
                    border: '1px solid #E0D4C5', marginTop: '4px', outline: 'none', fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#8C7A7C' }}>WHY IS THIS SONG SPECIAL TO US?</label>
                <input
                  type="text"
                  placeholder="e.g. Played during our stargazing night"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '10px',
                    border: '1px solid #E0D4C5', marginTop: '4px', outline: 'none', fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#8C7A7C' }}>SPOTIFY / MUSIC LINK (OPTIONAL)</label>
                <input
                  type="text"
                  placeholder="Paste Spotify track link (optional)"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '10px',
                    border: '1px solid #E0D4C5', marginTop: '4px', outline: 'none', fontSize: '13px'
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleAddSong}
              disabled={!title.trim() || !artist.trim()}
              style={{
                width: '100%', height: '48px', borderRadius: '24px',
                backgroundColor: 'var(--brand-primary)', border: 'none',
                color: '#FFF', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                boxShadow: 'var(--shadow-pink)'
              }}
            >
              Add Song to Playlist 💕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
