// Supabase Real-Time Client Service for Between Us
// Connected Live for Naitik & Raj

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pundnwezscwdmzwevzhh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Dw8Tv6Ht-Z_0yByF_FmwkQ_Uc8rFudY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Broadcast Channel for Multi-Tab Local Instant Sync
const broadcastSyncChannel = typeof window !== 'undefined' && window.BroadcastChannel ? new BroadcastChannel('our_place_live_sync') : null;

export function broadcastLocalStateChange(type, data) {
  if (broadcastSyncChannel) {
    try {
      broadcastSyncChannel.postMessage({ type, data, timestamp: Date.now() });
    } catch (e) {}
  }
}

// 1. REAL-TIME HEART NOTES SUBSCRIPTION & WRITES
export function subscribeToHeartNotes(onNotesUpdated) {
  fetchHeartNotes().then(onNotesUpdated);

  const channelId = 'heart-notes-' + Math.random().toString(36).substring(2, 9);
  const channel = supabase
    .channel(channelId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'heart_notes' }, () => {
      fetchHeartNotes().then(onNotesUpdated);
    })
    .subscribe();

  if (broadcastSyncChannel) {
    broadcastSyncChannel.onmessage = (event) => {
      if (event.data?.type === 'HEART_NOTES_UPDATED') {
        fetchHeartNotes().then(onNotesUpdated);
      }
    };
  }

  return () => supabase.removeChannel(channel);
}

export async function fetchHeartNotes() {
  try {
    const { data, error } = await supabase
      .from('heart_notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return JSON.parse(localStorage.getItem('bu_local_heart_notes') || '[]');

    const notes = data.map(n => {
      let parsedMeta = {};
      let actualText = n.text || '';
      if (typeof actualText === 'string' && actualText.startsWith('{')) {
        try {
          parsedMeta = JSON.parse(actualText);
          actualText = parsedMeta.text || actualText;
        } catch (e) {}
      }

      return {
        id: String(n.id),
        author: n.author || 'Naitik',
        recipient: n.recipient || 'Raj',
        text: actualText,
        mood: n.mood || 'happy',
        need: n.need || 'hug',
        status: n.status || 'unread',
        seen_by: parsedMeta.seenBy || (n.seen_by ? (Array.isArray(n.seen_by) ? n.seen_by : [n.seen_by]) : [n.author || 'Naitik']),
        unlock_timestamp: parsedMeta.unlockTimestamp || n.unlock_timestamp || null,
        created_at: n.created_at
      };
    });

    localStorage.setItem('bu_local_heart_notes', JSON.stringify(notes));
    return notes;
  } catch (err) {
    return JSON.parse(localStorage.getItem('bu_local_heart_notes') || '[]');
  }
}

export async function sendHeartNoteToSupabase(note) {
  try {
    const textPayload = JSON.stringify({
      text: note.text,
      seenBy: note.seenBy || [note.author || 'Naitik'],
      unlockTimestamp: note.unlockTimestamp || null
    });

    const { data } = await supabase.from('heart_notes').insert([{
      author: note.author || 'Naitik',
      recipient: note.recipient || 'Raj',
      text: textPayload,
      mood: note.mood || 'happy',
      need: note.need || 'hug',
      status: 'unread'
    }]).select();

    fetchHeartNotes();
    return data;
  } catch (err) {
    console.log('Heart note insert note:', err);
  }
}

export async function updateHeartNoteSeenInSupabase(noteId, seenByArray) {
  try {
    const textPayload = JSON.stringify({ seenBy: seenByArray });
    await supabase.from('heart_notes').update({ text: textPayload }).eq('id', noteId);
    fetchHeartNotes();
  } catch (err) {}
}

export async function deleteHeartNoteFromSupabase(noteId) {
  try {
    await supabase.from('heart_notes').delete().eq('id', noteId);
    fetchHeartNotes();
  } catch (err) {}
}

// 2. REAL-TIME GARDEN & MEMORIES SUBSCRIPTION
export function subscribeToGarden(onGardenUpdated) {
  fetchGarden().then(onGardenUpdated);

  const channelId = 'garden-' + Math.random().toString(36).substring(2, 9);
  const channel = supabase
    .channel(channelId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'garden_items' }, () => {
      fetchGarden().then(onGardenUpdated);
    })
    .subscribe();

  if (broadcastSyncChannel) {
    broadcastSyncChannel.onmessage = (event) => {
      if (event.data?.type === 'GARDEN_UPDATED') {
        fetchGarden().then(onGardenUpdated);
      }
    };
  }

  return () => supabase.removeChannel(channel);
}

export async function fetchGarden() {
  try {
    const { data, error } = await supabase
      .from('garden_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return JSON.parse(localStorage.getItem('bu_local_garden_items') || '[]');

    const gardenItems = data
      .filter(g => g.category !== 'Letters' && g.category !== 'SanctuarySettings' && g.category !== 'Moods')
      .map(g => {
        let meta = {};
        let textContent = g.text || '';
        if (typeof textContent === 'string' && textContent.startsWith('{')) {
          try {
            meta = JSON.parse(textContent);
            textContent = meta.text || textContent;
          } catch (e) {}
        }
        return {
          id: String(g.id),
          author: g.author,
          type: g.type,
          category: g.category,
          emoji: g.emoji,
          title: g.title,
          text: textContent,
          date: meta.date || 'Recently',
          photoUrl: meta.photoUrl || '',
          voiceUrl: meta.voiceUrl || '',
          created_at: g.created_at
        };
      });

    localStorage.setItem('bu_local_garden_items', JSON.stringify(gardenItems));
    return gardenItems;
  } catch (err) {
    return JSON.parse(localStorage.getItem('bu_local_garden_items') || '[]');
  }
}

export async function addGardenItemToSupabase(item) {
  try {
    const payload = JSON.stringify({
      text: item.text,
      date: item.date || new Date().toLocaleDateString(),
      photoUrl: item.photoUrl || '',
      voiceUrl: item.voiceUrl || ''
    });

    await supabase.from('garden_items').insert([{
      author: item.author || 'Naitik',
      type: item.type || 'flower',
      category: item.category || 'Memories',
      emoji: item.emoji || '🌸',
      title: item.title || 'Memory',
      text: payload
    }]);

    fetchGarden();
  } catch (err) {
    console.log('Add garden item note:', err);
  }
}

export async function deleteGardenItemFromSupabase(itemId) {
  try {
    await supabase.from('garden_items').delete().eq('id', itemId);
    fetchGarden();
  } catch (err) {}
}

// 3. REAL-TIME LETTERS SUBSCRIPTION & WRITES
export function subscribeToLetters(onLettersUpdated) {
  fetchLetters().then(onLettersUpdated);

  const channelId = 'letters-' + Math.random().toString(36).substring(2, 9);
  const channel = supabase
    .channel(channelId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'letters' }, () => {
      fetchLetters().then(onLettersUpdated);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'garden_items' }, () => {
      fetchLetters().then(onLettersUpdated);
    })
    .subscribe();

  if (broadcastSyncChannel) {
    broadcastSyncChannel.onmessage = (event) => {
      if (event.data?.type === 'LETTERS_UPDATED') {
        fetchLetters().then(onLettersUpdated);
      }
    };
  }

  return () => supabase.removeChannel(channel);
}

export async function fetchLetters() {
  try {
    // 1. Fetch from letters table
    const { data: lettersData } = await supabase
      .from('letters')
      .select('*')
      .order('created_at', { ascending: false });

    // 2. Fetch from garden_items fallback
    const { data: gardenData } = await supabase
      .from('garden_items')
      .select('*')
      .eq('category', 'Letters')
      .order('created_at', { ascending: false });

    const nativeLetters = (lettersData || []).map(l => ({
      id: String(l.id),
      author: l.author || 'Naitik',
      recipient: l.recipient || 'Raj',
      title: l.title || 'Untitled Letter',
      body: l.body || '',
      color: l.color || '#FFD9D9',
      border: l.border || '#FFAAAA',
      seen_by: l.seen_by ? (Array.isArray(l.seen_by) ? l.seen_by : [l.seen_by]) : [l.author || 'Naitik'],
      unlock_timestamp: l.unlock_timestamp || null,
      created_at: l.created_at
    }));

    const fallbackLetters = (gardenData || []).map(l => {
      let meta = {};
      let bodyText = l.text || '';
      if (typeof bodyText === 'string' && bodyText.startsWith('{')) {
        try {
          meta = JSON.parse(bodyText);
          bodyText = meta.body || meta.text || bodyText;
        } catch (e) {}
      }
      return {
        id: String(l.id),
        author: l.author || 'Naitik',
        recipient: meta.recipient || 'Raj',
        title: l.title || 'Untitled Letter',
        body: bodyText,
        color: meta.color || '#FFD9D9',
        border: meta.border || '#FFAAAA',
        seen_by: meta.seenBy || [l.author || 'Naitik'],
        unlock_timestamp: meta.unlockTimestamp || null,
        created_at: l.created_at
      };
    });

    const combined = [...nativeLetters];
    fallbackLetters.forEach(fl => {
      if (!combined.some(c => String(c.id) === String(fl.id))) {
        combined.push(fl);
      }
    });

    localStorage.setItem('bu_local_letters', JSON.stringify(combined));
    return combined;
  } catch (err) {
    return JSON.parse(localStorage.getItem('bu_local_letters') || '[]');
  }
}

export async function sendLetterToSupabase(letter) {
  try {
    // Write directly to native letters table
    await supabase.from('letters').insert([{
      author: letter.author || 'Naitik',
      recipient: letter.recipient || 'Raj',
      title: letter.title || 'Untitled Letter',
      body: letter.body || '',
      color: letter.color || '#FFD9D9',
      border: letter.border || '#FFAAAA',
      seen_by: letter.seenBy || [letter.author || 'Naitik'],
      unlock_timestamp: letter.unlockTimestamp ? new Date(letter.unlockTimestamp).toISOString() : null
    }]);

    // Also write to garden_items for legacy compatibility
    const payload = JSON.stringify({
      recipient: letter.recipient || 'Raj',
      body: letter.body,
      color: letter.color || '#FFD9D9',
      border: letter.border || '#FFAAAA',
      seenBy: letter.seenBy || [letter.author || 'Naitik'],
      unlockTimestamp: letter.unlockTimestamp || null
    });

    await supabase.from('garden_items').insert([{
      author: letter.author || 'Naitik',
      type: 'letter',
      category: 'Letters',
      emoji: '💌',
      title: letter.title || 'Untitled Letter',
      text: payload
    }]);

    fetchLetters();
  } catch (err) {
    console.log('Send letter note:', err);
  }
}

export async function updateLetterSeenInSupabase(letterId, seenByArray) {
  try {
    await supabase.from('letters').update({ seen_by: seenByArray }).eq('id', letterId);
    fetchLetters();
  } catch (err) {}
}

export async function deleteLetterFromSupabase(letterId) {
  try {
    await supabase.from('letters').delete().eq('id', letterId);
    await supabase.from('garden_items').delete().eq('id', letterId);
    fetchLetters();
  } catch (err) {}
}

// 4. REAL-TIME PARTNER MOODS SUBSCRIPTION
export function subscribeToPartnerMoods(onMoodsUpdated) {
  fetchPartnerMoods().then(onMoodsUpdated);

  const channelId = 'moods-' + Math.random().toString(36).substring(2, 9);
  const channel = supabase
    .channel(channelId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'garden_items' }, () => {
      fetchPartnerMoods().then(onMoodsUpdated);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export async function fetchPartnerMoods() {
  try {
    const { data, error } = await supabase
      .from('garden_items')
      .select('*')
      .eq('category', 'Moods')
      .order('created_at', { ascending: false });

    const defaultNaitikEmoji = localStorage.getItem('bu_mood_Naitik') || '😊';
    const defaultNaitikNote = localStorage.getItem('bu_mood_note_Naitik') || '';
    const defaultRajEmoji = localStorage.getItem('bu_mood_Raj') || '😊';
    const defaultRajNote = localStorage.getItem('bu_mood_note_Raj') || '';

    if (error || !data || data.length === 0) {
      return {
        Naitik: { emoji: defaultNaitikEmoji, note: defaultNaitikNote, date: '' },
        Raj: { emoji: defaultRajEmoji, note: defaultRajNote, date: '' }
      };
    }

    const naitikItem = data.find(i => i.author === 'Naitik');
    const rajItem = data.find(i => i.author === 'Raj');

    return {
      Naitik: {
        emoji: naitikItem ? naitikItem.emoji : defaultNaitikEmoji,
        note: naitikItem ? (naitikItem.text && !naitikItem.text.startsWith('Feeling ') ? naitikItem.text : defaultNaitikNote) : defaultNaitikNote,
        date: naitikItem ? (naitikItem.created_at || '') : ''
      },
      Raj: {
        emoji: rajItem ? rajItem.emoji : defaultRajEmoji,
        note: rajItem ? (rajItem.text && !rajItem.text.startsWith('Feeling ') ? rajItem.text : defaultRajNote) : defaultRajNote,
        date: rajItem ? (rajItem.created_at || '') : ''
      }
    };
  } catch (err) {
    return {
      Naitik: { emoji: localStorage.getItem('bu_mood_Naitik') || '😊', note: localStorage.getItem('bu_mood_note_Naitik') || '', date: '' },
      Raj: { emoji: localStorage.getItem('bu_mood_Raj') || '😊', note: localStorage.getItem('bu_mood_note_Raj') || '', date: '' }
    };
  }
}

export async function updatePartnerMoodInSupabase(partner, moodEmoji, moodNote = '') {
  localStorage.setItem(`bu_mood_${partner}`, moodEmoji);
  localStorage.setItem(`bu_mood_note_${partner}`, moodNote);
  try {
    await supabase.from('garden_items').insert([{
      author: partner,
      type: 'mood',
      category: 'Moods',
      emoji: moodEmoji,
      title: `${partner}'s mood: ${moodEmoji}`,
      text: moodNote || `Feeling ${moodEmoji}`
    }]);
    fetchPartnerMoods();
  } catch (err) {}
}

// 5. REAL-TIME PLAYLIST SUBSCRIPTION
export function subscribeToPlaylist(onPlaylistUpdated) {
  fetchPlaylist().then(onPlaylistUpdated);

  const channelId = 'playlist-' + Math.random().toString(36).substring(2, 9);
  const channel = supabase
    .channel(channelId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'garden_items' }, () => {
      fetchPlaylist().then(onPlaylistUpdated);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export async function fetchPlaylist() {
  try {
    const { data, error } = await supabase
      .from('garden_items')
      .select('*')
      .eq('category', 'Playlist')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data;
  } catch (err) {
    return [];
  }
}

export async function addSongToSupabase(song) {
  try {
    await supabase.from('garden_items').insert([{
      author: song.author || 'Naitik',
      type: 'song',
      category: 'Playlist',
      emoji: '🎵',
      title: song.title,
      text: `${song.artist} • ${song.note || ''} | link:${song.link || ''}`
    }]);
    fetchPlaylist();
  } catch (err) {}
}

// 6. SANCTUARY SETTINGS & PROFILE REAL-TIME SYNC
export function subscribeToSanctuarySettings(onSettingsUpdated) {
  fetchSanctuarySettings().then(onSettingsUpdated);

  const channelId = 'settings-' + Math.random().toString(36).substring(2, 9);
  const channel = supabase
    .channel(channelId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'garden_items' }, () => {
      fetchSanctuarySettings().then(onSettingsUpdated);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export async function fetchSanctuarySettings() {
  try {
    const { data, error } = await supabase
      .from('garden_items')
      .select('*')
      .eq('category', 'SanctuarySettings')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return {
        couplesNames: localStorage.getItem('bu_couples_names') || 'Naitik & Raj',
        anniversaryDate: localStorage.getItem('bu_anniversary_date') || '2024-03-24',
        favoriteSong: localStorage.getItem('bu_favorite_song') || 'Perfect - Ed Sheeran',
        theme: localStorage.getItem('bu_active_theme') || ''
      };
    }

    const row = data[0];
    let parsed = {};
    if (row.text && row.text.startsWith('{')) {
      try { parsed = JSON.parse(row.text); } catch (e) {}
    }

    const settings = {
      couplesNames: parsed.couplesNames || localStorage.getItem('bu_couples_names') || 'Naitik & Raj',
      anniversaryDate: parsed.anniversaryDate || localStorage.getItem('bu_anniversary_date') || '2024-03-24',
      favoriteSong: parsed.favoriteSong || localStorage.getItem('bu_favorite_song') || 'Perfect - Ed Sheeran',
      theme: parsed.theme || localStorage.getItem('bu_active_theme') || ''
    };

    if (settings.couplesNames) localStorage.setItem('bu_couples_names', settings.couplesNames);
    if (settings.anniversaryDate) localStorage.setItem('bu_anniversary_date', settings.anniversaryDate);
    if (settings.favoriteSong) localStorage.setItem('bu_favorite_song', settings.favoriteSong);
    if (settings.theme) localStorage.setItem('bu_active_theme', settings.theme);

    return settings;
  } catch (err) {
    return {
      couplesNames: localStorage.getItem('bu_couples_names') || 'Naitik & Raj',
      anniversaryDate: localStorage.getItem('bu_anniversary_date') || '2024-03-24',
      favoriteSong: localStorage.getItem('bu_favorite_song') || 'Perfect - Ed Sheeran',
      theme: localStorage.getItem('bu_active_theme') || ''
    };
  }
}

export async function updateSanctuarySettingsInSupabase(newSettings) {
  if (newSettings.couplesNames) localStorage.setItem('bu_couples_names', newSettings.couplesNames);
  if (newSettings.anniversaryDate) localStorage.setItem('bu_anniversary_date', newSettings.anniversaryDate);
  if (newSettings.favoriteSong) localStorage.setItem('bu_favorite_song', newSettings.favoriteSong);
  if (newSettings.theme) localStorage.setItem('bu_active_theme', newSettings.theme);

  try {
    const payload = JSON.stringify({
      couplesNames: newSettings.couplesNames,
      anniversaryDate: newSettings.anniversaryDate,
      favoriteSong: newSettings.favoriteSong,
      theme: newSettings.theme,
      updatedAt: new Date().toISOString()
    });

    await supabase.from('garden_items').insert([{
      author: 'SanctuarySystem',
      type: 'settings',
      category: 'SanctuarySettings',
      emoji: '💍',
      title: 'Sanctuary Settings Update',
      text: payload
    }]);

    fetchSanctuarySettings();
  } catch (err) {
    console.log('Update settings error:', err);
  }
}

// 7. GOOGLE & AUTH HELPERS
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: { prompt: 'select_account' },
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Google Sign-In error:', err);
  }
}

export async function signOutFromSupabase() {
  try {
    await supabase.auth.signOut();
  } catch (err) {}
}

export function subscribeToAuthStatus(onAuthChanged) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    onAuthChanged(session?.user || null, session);
  });
  return () => subscription?.unsubscribe();
}
