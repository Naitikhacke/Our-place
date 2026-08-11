import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import HeartNotesView from './components/HeartNotesView';
import GardenScreen from './components/GardenScreen';
import LettersScreen from './components/LettersScreen';
import MemoriesScreen from './components/MemoriesScreen';
import TimelineView from './components/TimelineView';
import PlaylistView from './components/PlaylistView';
import ProfileScreen from './components/ProfileScreen';
import NewThoughtModal from './components/NewThoughtModal';
import EveningRitualModal from './components/EveningRitualModal';
import PartnerSelectModal from './components/PartnerSelectModal';
import { 
  subscribeToHeartNotes, 
  sendHeartNoteToSupabase, 
  deleteHeartNoteFromSupabase,
  updateHeartNoteSeenInSupabase,
  subscribeToGarden, 
  addGardenItemToSupabase,
  deleteGardenItemFromSupabase,
  subscribeToLetters,
  sendLetterToSupabase,
  deleteLetterFromSupabase,
  updateLetterSeenInSupabase,
  subscribeToPartnerMoods,
  signInWithGoogle,
  signOutFromSupabase,
  subscribeToAuthStatus,
  subscribeToSanctuarySettings,
  updateSanctuarySettingsInSupabase
} from './services/supabase';

// Automatic Time-Based Theme Detector
function getAutoTimeTheme() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 17) return 'morning'; // 6 AM - 4:59 PM
  if (hour >= 17 && hour < 20) return 'sunset'; // 5 PM - 7:59 PM
  return 'night'; // 8 PM - 5:59 AM
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentPartner, setCurrentPartner] = useState(() => {
    return localStorage.getItem('bu_current_partner') || 'Naitik';
  });
  const [isPartnerSelectOpen, setIsPartnerSelectOpen] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('bu_active_theme') || getAutoTimeTheme());

  // Personalization & Real-Time Synced State
  const [couplesNames, setCouplesNames] = useState(() => localStorage.getItem('bu_couples_names') || 'Naitik & Raj');
  const [anniversaryDate, setAnniversaryDate] = useState(() => localStorage.getItem('bu_anniversary_date') || '2024-03-24');
  const [favoriteSong, setFavoriteSong] = useState(() => localStorage.getItem('bu_favorite_song') || 'Perfect - Ed Sheeran');
  const [isBiometricLocked, setIsBiometricLocked] = useState(false);
  const [authUser, setAuthUser] = useState(null);

  // Modals
  const [isNewThoughtOpen, setIsNewThoughtOpen] = useState(false);
  const [isRitualOpen, setIsRitualOpen] = useState(false);

  // Notes, Garden items, Letters, Moods from Supabase Real-Time
  const [notes, setNotes] = useState([]);
  const [gardenItems, setGardenItems] = useState([]);
  const [letters, setLetters] = useState([]);
  const [partnerMoods, setPartnerMoods] = useState(() => ({
    Naitik: {
      emoji: localStorage.getItem('bu_mood_Naitik') || '😊',
      note: localStorage.getItem('bu_mood_note_Naitik') || '',
      date: ''
    },
    Raj: {
      emoji: localStorage.getItem('bu_mood_Raj') || '😊',
      note: localStorage.getItem('bu_mood_note_Raj') || '',
      date: ''
    }
  }));

  // Supabase Real-Time Listeners
  useEffect(() => {
    const unsubNotes = subscribeToHeartNotes((remoteNotes) => {
      if (remoteNotes && Array.isArray(remoteNotes)) {
        setNotes(remoteNotes.map(n => {
          let seenBy = [];
          if (Array.isArray(n.seen_by)) {
            seenBy = n.seen_by;
          } else if (typeof n.seen_by === 'string') {
            try { seenBy = JSON.parse(n.seen_by); } catch(e) { seenBy = [n.seen_by]; }
          } else {
            seenBy = [n.author || 'Naitik'];
          }
          return {
            id: String(n.id),
            author: n.author,
            recipient: n.recipient,
            text: n.text,
            mood: n.mood,
            need: n.need,
            timestamp: new Date(n.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: n.status || 'unread',
            seenBy: seenBy,
            unlockTimestamp: n.unlock_timestamp ? new Date(n.unlock_timestamp).getTime() : null
          };
        }));
      }
    });

    const unsubGarden = subscribeToGarden((remoteGarden) => {
      if (remoteGarden) {
        setGardenItems(remoteGarden.map(g => ({
          id: String(g.id),
          author: g.author,
          type: g.type,
          category: g.category,
          emoji: g.emoji,
          title: g.title,
          text: g.text,
          date: g.date || 'Recently',
          photoUrl: g.photo_url || g.photoUrl || '',
          voiceUrl: g.voice_url || g.voiceUrl || ''
        })));
      }
    });

    const unsubLetters = subscribeToLetters((remoteLetters) => {
      if (remoteLetters && Array.isArray(remoteLetters)) {
        const parsed = remoteLetters.map(l => {
          if (!l || typeof l !== 'object') return null;

          let parsedBody = '';
          let meta = {};

          if (l.body && typeof l.body === 'object') {
            meta = l.body;
            parsedBody = String(meta.text || meta.body || '');
          } else if (typeof l.body === 'string') {
            const rawStr = l.body.trim();
            if (rawStr.startsWith('{') && rawStr.endsWith('}')) {
              try {
                meta = JSON.parse(rawStr);
                parsedBody = String(meta.text || meta.body || rawStr);
              } catch (e) {
                parsedBody = rawStr;
              }
            } else {
              parsedBody = rawStr;
            }
          } else {
            parsedBody = String(l.body || '');
          }

          let seenBy = [];
          if (Array.isArray(l.seen_by)) {
            seenBy = l.seen_by;
          } else if (typeof l.seen_by === 'string') {
            try { seenBy = JSON.parse(l.seen_by); } catch(e) { seenBy = [l.seen_by]; }
          } else {
            seenBy = [l.author || 'Naitik'];
          }

          let unlockTs = null;
          if (l.unlock_timestamp) {
            try {
              const parsedTs = new Date(l.unlock_timestamp).getTime();
              if (!isNaN(parsedTs)) unlockTs = parsedTs;
            } catch (e) {}
          }

          return {
            id: String(l.id || Date.now().toString()),
            author: String(l.author || 'Naitik'),
            recipient: String(l.recipient || 'Raj'),
            title: String(l.title || 'Untitled Letter'),
            body: parsedBody,
            fontFamily: String(meta.fontFamily || 'Dancing Script'),
            mood: String(meta.mood || '💖 Romantic'),
            sticker: String(meta.sticker || '🌸 Rose'),
            photoUrl: String(meta.photoUrl || ''),
            voiceNote: String(meta.voiceNote || ''),
            songLink: String(meta.songLink || ''),
            color: String(l.color || meta.color || '#FFD9D9'),
            border: String(l.border || meta.border || '#FFAAAA'),
            createdDate: l.created_at || new Date().toISOString(),
            unlockTimestamp: unlockTs,
            seenBy: seenBy
          };
        }).filter(Boolean);

        setLetters(parsed);
      }
    });

    const unsubMoods = subscribeToPartnerMoods((remoteMoods) => {
      if (remoteMoods) {
        setPartnerMoods(remoteMoods);
      }
    });

    const unsubSettings = subscribeToSanctuarySettings((remoteSettings) => {
      if (remoteSettings) {
        if (remoteSettings.couplesNames) setCouplesNames(remoteSettings.couplesNames);
        if (remoteSettings.anniversaryDate) setAnniversaryDate(remoteSettings.anniversaryDate);
        if (remoteSettings.favoriteSong) setFavoriteSong(remoteSettings.favoriteSong);
        if (remoteSettings.theme && remoteSettings.theme !== '') setTheme(remoteSettings.theme);
      }
    });

    const unsubAuth = subscribeToAuthStatus((user) => {
      setAuthUser(user);
    });

    return () => {
      if (unsubNotes) unsubNotes();
      if (unsubGarden) unsubGarden();
      if (unsubLetters) unsubLetters();
      if (unsubMoods) unsubMoods();
      if (unsubSettings) unsubSettings();
      if (unsubAuth) unsubAuth();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('bu_current_partner', currentPartner);
  }, [currentPartner]);

  const handleUpdateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('bu_active_theme', newTheme);
    updateSanctuarySettingsInSupabase({ couplesNames, anniversaryDate, favoriteSong, theme: newTheme });
  };

  const handleUpdateNicknames = (newNames) => {
    const nameStr = typeof newNames === 'string' ? newNames : (newNames.partner1 && newNames.partner2 ? `${newNames.partner1} & ${newNames.partner2}` : couplesNames);
    setCouplesNames(nameStr);
    updateSanctuarySettingsInSupabase({ couplesNames: nameStr, anniversaryDate, favoriteSong, theme });
  };

  const handleUpdateAnniversary = (newDate) => {
    setAnniversaryDate(newDate);
    updateSanctuarySettingsInSupabase({ couplesNames, anniversaryDate: newDate, favoriteSong, theme });
  };

  const handleUpdateFavoriteSong = (newSong) => {
    setFavoriteSong(newSong);
    updateSanctuarySettingsInSupabase({ couplesNames, anniversaryDate, favoriteSong: newSong, theme });
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error('Google Auth Failed:', e);
    }
  };

  const handleSignOut = async () => {
    await signOutFromSupabase();
    setAuthUser(null);
  };

  const handleSelectPartner = (partnerId, moodEmoji, moodNote) => {
    setCurrentPartner(partnerId);
    if (moodEmoji) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setPartnerMoods(prev => ({
        ...prev,
        [partnerId]: {
          emoji: moodEmoji,
          note: moodNote || '',
          date: timeStr
        }
      }));
    }
    setIsPartnerSelectOpen(false);
  };

  const handleSendNote = (newNote) => {
    const noteWithSeen = {
      ...newNote,
      seenBy: [newNote.author || currentPartner]
    };
    setNotes([noteWithSeen, ...notes]);
    sendHeartNoteToSupabase(noteWithSeen);
  };

  const handleMarkNoteSeen = async (noteId, partner) => {
    const p = partner || currentPartner;
    const target = notes.find(n => n.id === noteId);
    if (!target) return;
    if (target.seenBy && target.seenBy.includes(p)) return;

    const updatedSeenBy = [...(target.seenBy || []), p];
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, seenBy: updatedSeenBy } : n));
    await updateHeartNoteSeenInSupabase(noteId, updatedSeenBy);
  };

  const handleDeleteNote = async (noteId, noteAuthor) => {
    if (noteAuthor !== currentPartner) return;
    setNotes(prev => prev.filter(n => n.id !== noteId));
    await deleteHeartNoteFromSupabase(noteId);
  };

  const handleResolveNotes = () => {
    const newItems = notes.map((n) => ({
      id: n.id,
      author: n.author,
      type: 'flower',
      category: 'Resolved',
      emoji: n.mood === 'happy' ? '🌼' : n.mood === 'hurt' ? '🌸' : '🪻',
      title: n.need + ' resolved',
      date: 'Just now',
      text: n.text
    }));

    newItems.forEach(item => addGardenItemToSupabase(item));
    setGardenItems([...newItems, ...gardenItems]);
    setNotes([]);
  };

  const handleAddGardenItem = (item) => {
    setGardenItems([item, ...gardenItems]);
    addGardenItemToSupabase(item);
  };

  const handleDeleteGardenItem = async (itemId) => {
    setGardenItems(prev => prev.filter(g => String(g.id) !== String(itemId)));
    await deleteGardenItemFromSupabase(itemId);
  };

  const handleSendLetter = async (newLetter) => {
    setLetters(prev => [newLetter, ...prev]);

    const metadataPayload = JSON.stringify({
      text: newLetter.body,
      fontFamily: newLetter.fontFamily,
      mood: newLetter.mood,
      sticker: newLetter.sticker,
      photoUrl: newLetter.photoUrl,
      voiceNote: newLetter.voiceNote,
      songLink: newLetter.songLink,
      color: newLetter.color,
      border: newLetter.border
    });

    await sendLetterToSupabase({
      ...newLetter,
      body: metadataPayload
    });
  };

  const handleDeleteLetter = async (letterId, letterAuthor) => {
    if (letterAuthor && letterAuthor !== currentPartner) return;
    setLetters(prev => prev.filter(l => l.id !== letterId));
    await deleteLetterFromSupabase(letterId);
  };

  const handleMarkLetterSeen = async (letterId, partner) => {
    const p = partner || currentPartner;
    const target = letters.find(l => l.id === letterId);
    if (!target) return;
    if (target.seenBy && target.seenBy.includes(p)) return;

    const updatedSeenBy = [...(target.seenBy || []), p];
    setLetters(prev => prev.map(l => l.id === letterId ? { ...l, seenBy: updatedSeenBy } : l));
    await updateLetterSeenInSupabase(letterId, updatedSeenBy);
  };

  const unreadNotesCount = notes.filter(n => !n.seenBy || !n.seenBy.includes(currentPartner)).length;
  const unreadLettersCount = letters.filter(l => l.recipient === currentPartner && (!l.seenBy || !l.seenBy.includes(currentPartner)) && (!l.unlockTimestamp || Date.now() >= l.unlockTimestamp)).length;

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: theme === 'night' ? '#0F1428' : '#FAF6F0',
      color: theme === 'night' ? '#F5E6CC' : '#3D2C2E',
      transition: 'background-color 0.4s ease',
      display: 'flex',
      position: 'relative'
    }}>
      {isPartnerSelectOpen && (
        <PartnerSelectModal
          currentPartner={currentPartner}
          partnerMoods={partnerMoods}
          onSelectPartner={handleSelectPartner}
          onClose={() => setIsPartnerSelectOpen(false)}
          authUser={authUser}
          onGoogleSignIn={handleGoogleSignIn}
          onSignOut={handleSignOut}
        />
      )}

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentPartner={currentPartner}
        onOpenPartnerSelect={() => setIsPartnerSelectOpen(true)}
        theme={theme}
        onSelectTheme={handleUpdateTheme}
        notesCount={unreadNotesCount}
        unreadLettersCount={unreadLettersCount}
        authUser={authUser}
      />

      <main style={{
        marginLeft: '260px',
        width: 'calc(100% - 260px)',
        padding: '32px 40px',
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}>
        {activeTab === 'home' && (
          <DashboardView
            theme={theme}
            currentPartner={currentPartner}
            notes={notes}
            gardenItems={gardenItems}
            letters={letters}
            partnerMoods={partnerMoods}
            onOpenNewThought={() => setIsNewThoughtOpen(true)}
            onOpenRitual={() => setIsRitualOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onMarkLetterSeen={handleMarkLetterSeen}
            onMarkNoteSeen={handleMarkNoteSeen}
            onUpdateMood={(partner, emoji) => {
              const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              setPartnerMoods(prev => {
                const existing = typeof prev[partner] === 'object' ? prev[partner] : { emoji: prev[partner] || '😊', note: '' };
                return {
                  ...prev,
                  [partner]: {
                    ...existing,
                    emoji: emoji,
                    date: timeStr
                  }
                };
              });
            }}
          />
        )}

        {activeTab === 'notes' && (
          <HeartNotesView
            notes={notes}
            currentPartner={currentPartner}
            onOpenNewThought={() => setIsNewThoughtOpen(true)}
            onOpenRitual={() => setIsRitualOpen(true)}
            onMarkNoteSeen={handleMarkNoteSeen}
            onDeleteNote={handleDeleteNote}
          />
        )}

        {activeTab === 'ritual' && (
          <EveningRitualModal
            isOpen={true}
            onClose={() => setActiveTab('home')}
            notes={notes}
            onResolveNotes={handleResolveNotes}
            onMarkNoteSeen={handleMarkNoteSeen}
            currentPartner={currentPartner}
          />
        )}

        {activeTab === 'garden' && (
          <GardenScreen
            resolvedCount={gardenItems.length}
            gardenItems={gardenItems}
            onAddGardenItem={handleAddGardenItem}
            currentPartner={currentPartner}
          />
        )}

        {activeTab === 'letters' && (
          <LettersScreen
            letters={letters}
            currentPartner={currentPartner}
            theme={theme}
            onSendLetter={handleSendLetter}
            onDeleteLetter={handleDeleteLetter}
            onMarkLetterSeen={handleMarkLetterSeen}
          />
        )}

        {activeTab === 'memories' && (
          <MemoriesScreen
            gardenItems={gardenItems}
            onAddGardenItem={handleAddGardenItem}
            onDeleteGardenItem={handleDeleteGardenItem}
            currentPartner={currentPartner}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineView
            gardenItems={gardenItems}
            onAddGardenItem={handleAddGardenItem}
            onDeleteGardenItem={handleDeleteGardenItem}
            currentPartner={currentPartner}
          />
        )}

        {activeTab === 'playlist' && (
          <PlaylistView currentPartner={currentPartner} />
        )}

        {activeTab === 'settings' && (
          <ProfileScreen
            theme={theme}
            onSelectTheme={handleUpdateTheme}
            couplesNames={couplesNames}
            onUpdateNicknames={handleUpdateNicknames}
            anniversaryDate={anniversaryDate}
            onUpdateAnniversary={handleUpdateAnniversary}
            favoriteSong={favoriteSong}
            onUpdateFavoriteSong={handleUpdateFavoriteSong}
            isBiometricLocked={isBiometricLocked}
            onToggleBiometric={() => setIsBiometricLocked(!isBiometricLocked)}
            authUser={authUser}
            onGoogleSignIn={handleGoogleSignIn}
            onSignOut={handleSignOut}
          />
        )}
      </main>

      <NewThoughtModal
        isOpen={isNewThoughtOpen}
        onClose={() => setIsNewThoughtOpen(false)}
        onSendNote={handleSendNote}
        currentPartner={currentPartner}
      />
    </div>
  );
}
