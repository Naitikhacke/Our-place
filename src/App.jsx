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
  subscribeToGarden, 
  addGardenItemToSupabase,
  subscribeToLetters,
  subscribeToPartnerMoods
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
  
  // Automatic time-based theme
  const [theme, setTheme] = useState(() => getAutoTimeTheme());

  useEffect(() => {
    const timer = setInterval(() => {
      setTheme(getAutoTimeTheme());
    }, 60000); // Check every minute
    return () => clearInterval(timer);
  }, []);

  // Active Partner Profile (Naitik or Raj)
  const [currentPartner, setCurrentPartner] = useState(() => {
    return localStorage.getItem('bu_current_partner') || 'Naitik';
  });

  // Always show entry popup on website load or refresh
  const [isPartnerSelectOpen, setIsPartnerSelectOpen] = useState(true);

  // App State Data
  const [couplesNames, setCouplesNames] = useState('Naitik & Raj ♡');
  const [anniversaryDate, setAnniversaryDate] = useState(() => {
    return localStorage.getItem('bu_anniversary') || '21 June 2026, 5:16 AM';
  });
  const [favoriteSong, setFavoriteSong] = useState(() => {
    return localStorage.getItem('bu_favorite_song') || 'Yellow - Coldplay';
  });



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
      if (remoteNotes) {
        setNotes(remoteNotes.map(n => ({
          id: n.id,
          author: n.author,
          recipient: n.recipient,
          text: n.text,
          mood: n.mood,
          need: n.need,
          timestamp: new Date(n.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: n.status || 'unread',
          unlockTimestamp: n.unlock_timestamp ? new Date(n.unlock_timestamp).getTime() : null
        })));
      }
    });

    const unsubGarden = subscribeToGarden((remoteGarden) => {
      if (remoteGarden) {
        setGardenItems(remoteGarden.map(g => ({
          id: g.id,
          author: g.author,
          type: g.type,
          category: g.category,
          emoji: g.emoji,
          title: g.title,
          text: g.text,
          date: g.date || 'Recently'
        })));
      }
    });

    const unsubLetters = subscribeToLetters((remoteLetters) => {
      if (remoteLetters) {
        setLetters(remoteLetters.map(l => ({
          id: l.id,
          author: l.author,
          recipient: l.recipient,
          title: l.title,
          body: l.body,
          color: l.color || '#FFD9D9',
          border: l.border || '#FFAAAA',
          createdDate: l.created_at || new Date().toISOString(),
          unlockTimestamp: l.unlock_timestamp ? new Date(l.unlock_timestamp).getTime() : null
        })));
      }
    });

    const unsubMoods = subscribeToPartnerMoods((remoteMoods) => {
      if (remoteMoods) {
        setPartnerMoods(remoteMoods);
      }
    });

    return () => {
      if (unsubNotes) unsubNotes();
      if (unsubGarden) unsubGarden();
      if (unsubLetters) unsubLetters();
      if (unsubMoods) unsubMoods();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('bu_current_partner', currentPartner);
  }, [currentPartner]);

  const handleSelectPartner = (partnerId, moodEmoji, moodNote) => {
    setCurrentPartner(partnerId);
    // Instantly update mood & note in local state so dashboard reflects it right away
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
    setNotes([newNote, ...notes]);
    sendHeartNoteToSupabase(newNote);
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
      {/* Entry Partner & Mood Popup (Opens automatically on website load or refresh) */}
      {isPartnerSelectOpen && (
        <PartnerSelectModal
          currentPartner={currentPartner}
          partnerMoods={partnerMoods}
          onSelectPartner={handleSelectPartner}
          onClose={() => setIsPartnerSelectOpen(false)}
        />
      )}

      {/* Fixed Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentPartner={currentPartner}
        onOpenPartnerSelect={() => setIsPartnerSelectOpen(true)}
        theme={theme}
        onSelectTheme={setTheme}
        notesCount={notes.length}
        unreadLettersCount={letters.filter(l => l.recipient === currentPartner && (!l.unlockTimestamp || Date.now() >= l.unlockTimestamp)).length}
      />

      {/* Main Content Area */}
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
          />
        )}

        {activeTab === 'ritual' && (
          <EveningRitualModal
            isOpen={true}
            onClose={() => setActiveTab('home')}
            notes={notes}
            onResolveNotes={handleResolveNotes}
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
          <LettersScreen currentPartner={currentPartner} theme={theme} />
        )}

        {activeTab === 'memories' && (
          <MemoriesScreen currentPartner={currentPartner} />
        )}

        {activeTab === 'timeline' && (
          <TimelineView currentPartner={currentPartner} />
        )}

        {activeTab === 'playlist' && (
          <PlaylistView currentPartner={currentPartner} />
        )}

        {activeTab === 'settings' && (
          <ProfileScreen
            theme={theme}
            onSelectTheme={setTheme}
            couplesNames={couplesNames}
            onUpdateNicknames={setCouplesNames}
            anniversaryDate={anniversaryDate}
            onUpdateAnniversary={setAnniversaryDate}
            favoriteSong={favoriteSong}
            onUpdateFavoriteSong={setFavoriteSong}
            isBiometricLocked={isBiometricLocked}
            onToggleBiometric={() => setIsBiometricLocked(!isBiometricLocked)}
          />
        )}
      </main>

      {/* Write Heart Note Modal */}
      <NewThoughtModal
        isOpen={isNewThoughtOpen}
        onClose={() => setIsNewThoughtOpen(false)}
        onSendNote={handleSendNote}
        currentPartner={currentPartner}
      />
    </div>
  );
}
