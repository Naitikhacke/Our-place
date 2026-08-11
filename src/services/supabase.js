// Supabase Real-Time Client Service for Between Us
// Connected Live for Naitik & Raj

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pundnwezscwdmzwevzhh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Dw8Tv6Ht-Z_0yByF_FmwkQ_Uc8rFudY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Broadcast Channel for Instant Multi-Tab Local Fallback Sync
const broadcastSyncChannel = typeof window !== 'undefined' && window.BroadcastChannel ? new BroadcastChannel('our_place_live_sync') : null;

export function broadcastLocalStateChange(type, data) {
  if (broadcastSyncChannel) {
    try {
      broadcastSyncChannel.postMessage({ type, data, timestamp: Date.now() });
    } catch (e) {}
  }
}

// AUTOMATIC SANCTUARY SESSION MANAGEMENT FOR CROSS-DEVICE SYNC
export async function ensureSanctuaryAuthSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) return session;
    return null;
  } catch (err) {
    return null;
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
      .order('id', { ascending: false });

    const localCached = JSON.parse(localStorage.getItem('bu_local_heart_notes') || '[]');
    if (error || !data) return localCached;

    const remoteNotes = data.map(n => {
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
        seen_by: parsedMeta.seenBy || [n.author || 'Naitik'],
        unlock_timestamp: parsedMeta.unlockTimestamp || null,
        created_at: n.created_at
      };
    });

    const merged = [...remoteNotes];
    localCached.forEach(lc => {
      if (!merged.some(m => String(m.id) === String(lc.id))) {
        merged.push(lc);
      }
    });

    localStorage.setItem('bu_local_heart_notes', JSON.stringify(merged));
    return merged;
  } catch (err) {
    return JSON.parse(localStorage.getItem('bu_local_heart_notes') || '[]');
  }
}

export async function sendHeartNoteToSupabase(note) {
  const localCached = JSON.parse(localStorage.getItem('bu_local_heart_notes') || '[]');
  const noteWithId = {
    id: note.id || String(Date.now()),
    author: note.author || 'Naitik',
    recipient: note.recipient || 'Raj',
    text: note.text,
    mood: note.mood || 'happy',
    need: note.need || 'hug',
    status: note.status || 'unread',
    seen_by: note.seenBy || [note.author || 'Naitik'],
    unlock_timestamp: note.unlockTimestamp || null,
    created_at: new Date().toISOString()
  };

  const updatedLocal = [noteWithId, ...localCached.filter(n => String(n.id) !== String(noteWithId.id))];
  localStorage.setItem('bu_local_heart_notes', JSON.stringify(updatedLocal));
  broadcastLocalStateChange('HEART_NOTES_UPDATED', updatedLocal);

  try {
    const textPayload = JSON.stringify({
      text: note.text,
      seenBy: note.seenBy || [note.author || 'Naitik'],
      unlockTimestamp: note.unlockTimestamp || null
    });

    await supabase.from('heart_notes').insert([{
      author: note.author || 'Naitik',
      recipient: note.recipient || 'Raj',
      text: textPayload,
      mood: note.mood || 'happy',
      need: note.need || 'hug',
      status: 'unread'
    }]);
  } catch (err) {
    console.log('Heart note insert note:', err);
  }
}

export async function updateHeartNoteSeenInSupabase(noteId, seenByArray) {
  const localCached = JSON.parse(localStorage.getItem('bu_local_heart_notes') || '[]');
  const updatedLocal = localCached.map(n => String(n.id) === String(noteId) ? { ...n, seen_by: seenByArray } : n);
  localStorage.setItem('bu_local_heart_notes', JSON.stringify(updatedLocal));
  broadcastLocalStateChange('HEART_NOTES_UPDATED', updatedLocal);

  try {
    const textPayload = JSON.stringify({ seenBy: seenByArray });
    await supabase.from('heart_notes').update({ text: textPayload }).eq('id', noteId);
  } catch (err) {}
}

export async function deleteHeartNoteFromSupabase(noteId) {
  const localCached = JSON.parse(localStorage.getItem('bu_local_heart_notes') || '[]');
  const updatedLocal = localCached.filter(n => String(n.id) !== String(noteId));
  localStorage.setItem('bu_local_heart_notes', JSON.stringify(updatedLocal));
  broadcastLocalStateChange('HEART_NOTES_UPDATED', updatedLocal);

  try {
    await supabase.from('heart_notes').delete().eq('id', noteId);
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
      .order('id', { ascending: false });

    const localCached = JSON.parse(localStorage.getItem('bu_local_garden_items') || '[]');
    if (error || !data) return localCached;

    const remoteGarden = data
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
          voiceUrl: meta.voiceUrl || ''
        };
      });

    const merged = [...remoteGarden];
    localCached.forEach(lc => {
      if (!merged.some(m => String(m.id) === String(lc.id))) {
        merged.push(lc);
      }
    });

    localStorage.setItem('bu_local_garden_items', JSON.stringify(merged));
    return merged;
  } catch (err) {
    return JSON.parse(localStorage.getItem('bu_local_garden_items') || '[]');
  }
}

export async function addGardenItemToSupabase(item) {
  const localCached = JSON.parse(localStorage.getItem('bu_local_garden_items') || '[]');
  const itemWithId = {
    ...item,
    id: item.id || String(Date.now())
  };
  const updatedLocal = [itemWithId, ...localCached.filter(i => String(i.id) !== String(itemWithId.id))];
  localStorage.setItem('bu_local_garden_items', JSON.stringify(updatedLocal));
  broadcastLocalStateChange('GARDEN_UPDATED', updatedLocal);

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
  } catch (err) {
    console.log('Add garden item note:', err);
  }
}

export async function deleteGardenItemFromSupabase(itemId) {
  const localCached = JSON.parse(localStorage.getItem('bu_local_garden_items') || '[]');
  const updatedLocal = localCached.filter(i => String(i.id) !== String(itemId));
  localStorage.setItem('bu_local_garden_items', JSON.stringify(updatedLocal));
  broadcastLocalStateChange('GARDEN_UPDATED', updatedLocal);

  try {
    await supabase.from('garden_items').delete().eq('id', itemId);
  } catch (err) {}
}

// 3. REAL-TIME LETTERS SUBSCRIPTION (STORED SAFELY IN GARDEN_ITEMS CATEGORY 'Letters')
export function subscribeToLetters(onLettersUpdated) {
  fetchLetters().then(onLettersUpdated);

  const channelId = 'letters-' + Math.random().toString(36).substring(2, 9);
  const channel = supabase
    .channel(channelId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'garden_items' }, (payload) => {
      if (payload && payload.new && payload.new.category === 'Letters') {
        fetchLetters().then(onLettersUpdated);
      } else {
        fetchLetters().then(onLettersUpdated);
      }
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
    const { data, error } = await supabase
      .from('garden_items')
      .select('*')
      .eq('category', 'Letters')
      .order('id', { ascending: false });

    const localCached = JSON.parse(localStorage.getItem('bu_local_letters') || '[]');
    if (error || !data) return localCached;

    const remoteLetters = data.map(l => {
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

    const merged = [...remoteLetters];
    localCached.forEach(lc => {
      if (!merged.some(m => String(m.id) === String(lc.id))) {
        merged.push(lc);
      }
    });

    localStorage.setItem('bu_local_letters', JSON.stringify(merged));
    return merged;
  } catch (err) {
    return JSON.parse(localStorage.getItem('bu_local_letters') || '[]');
  }
}

export async function sendLetterToSupabase(letter) {
  const localCached = JSON.parse(localStorage.getItem('bu_local_letters') || '[]');
  const letterWithId = {
    ...letter,
    id: letter.id || String(Date.now())
  };
  const updatedLocal = [letterWithId, ...localCached.filter(l => String(l.id) !== String(letterWithId.id))];
  localStorage.setItem('bu_local_letters', JSON.stringify(updatedLocal));
  broadcastLocalStateChange('LETTERS_UPDATED', updatedLocal);

  try {
    const payload = JSON.stringify({
      recipient: letter.recipient || 'Raj',
      body: letter.body,
      color: letter.color || '#FFD9D9',
      border: letter.border || '#FFAAAA',
      seenBy: letter.seenBy || [letter.author || 'Naitik'],
      unlockTimestamp: letter.unlockTimestamp || null,
      fontFamily: letter.fontFamily || 'Dancing Script',
      mood: letter.mood || '💖 Romantic',
      sticker: letter.sticker || '🌸 Rose',
      photoUrl: letter.photoUrl || '',
      voiceNote: letter.voiceNote || '',
      songLink: letter.songLink || ''
    });

    await supabase.from('garden_items').insert([{
      author: letter.author || 'Naitik',
      type: 'letter',
      category: 'Letters',
      emoji: '💌',
      title: letter.title || 'Untitled Letter',
      text: payload
    }]);
  } catch (err) {
    console.log('Send letter note:', err);
  }
}

export async function updateLetterSeenInSupabase(letterId, seenByArray) {
  const localCached = JSON.parse(localStorage.getItem('bu_local_letters') || '[]');
  const updatedLocal = localCached.map(l => String(l.id) === String(letterId) ? { ...l, seen_by: seenByArray } : l);
  localStorage.setItem('bu_local_letters', JSON.stringify(updatedLocal));
  broadcastLocalStateChange('LETTERS_UPDATED', updatedLocal);

  try {
    const { data } = await supabase.from('garden_items').select('*').eq('id', letterId);
    if (data && data[0]) {
      let meta = {};
      try { meta = JSON.parse(data[0].text); } catch (e) {}
      meta.seenBy = seenByArray;
      await supabase.from('garden_items').update({ text: JSON.stringify(meta) }).eq('id', letterId);
    }
  } catch (err) {}
}

export async function deleteLetterFromSupabase(letterId) {
  const localCached = JSON.parse(localStorage.getItem('bu_local_letters') || '[]');
  const updatedLocal = localCached.filter(l => String(l.id) !== String(letterId));
  localStorage.setItem('bu_local_letters', JSON.stringify(updatedLocal));
  broadcastLocalStateChange('LETTERS_UPDATED', updatedLocal);

  try {
    await supabase.from('garden_items').delete().eq('id', letterId);
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
      .order('id', { ascending: false });

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
        date: naitikItem ? (naitikItem.date || '') : ''
      },
      Raj: {
        emoji: rajItem ? rajItem.emoji : defaultRajEmoji,
        note: rajItem ? (rajItem.text && !rajItem.text.startsWith('Feeling ') ? rajItem.text : defaultRajNote) : defaultRajNote,
        date: rajItem ? (rajItem.date || '') : ''
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
      .order('id', { ascending: false });

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
  } catch (err) {}
}

// 6. GOOGLE AUTHENTICATION WITH FORCED ACCOUNT PICKER
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          prompt: 'select_account',
          access_type: 'offline',
        },
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Google Sign-In error:', err);
    throw err;
  }
}

export async function signOutFromSupabase() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error('Sign out error:', err);
  }
}

export function subscribeToAuthStatus(onAuthChanged) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    onAuthChanged(session?.user || null, session);
  });
  return () => subscription?.unsubscribe();
}

// 7. REAL-TIME SANCTUARY SETTINGS & PROFILE SYNC
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
      .order('id', { ascending: false })
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
  } catch (err) {
    console.log('Update settings error:', err);
  }
}
