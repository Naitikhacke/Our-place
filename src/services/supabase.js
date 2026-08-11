// Supabase Real-Time Client Service for Between Us
// Connected Live for Naitik & Raj

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pundnwezscwdmzwevzhh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Dw8Tv6Ht-Z_0yByF_FmwkQ_Uc8rFudY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// AUTOMATIC SANCTUARY SESSION MANAGEMENT FOR CROSS-DEVICE SYNC
export async function ensureSanctuaryAuthSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) return session;

    const email = 'sanctuary.naitik.raj@ourplace.app';
    const password = 'SanctuaryLove2026!';

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const signUpRes = await supabase.auth.signUp({ email, password });
      return signUpRes.data?.session || null;
    }
    return data.session;
  } catch (err) {
    console.log('Sanctuary auth session note:', err);
    return null;
  }
}

// 1. REAL-TIME HEART NOTES SUBSCRIPTION & DELETION
export function subscribeToHeartNotes(onNotesUpdated) {
  ensureSanctuaryAuthSession().then(() => {
    fetchHeartNotes().then(onNotesUpdated);
  });

  const channelId = 'heart-notes-' + Math.random().toString(36).substring(2, 9);
  const channel = supabase
    .channel(channelId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'heart_notes' }, () => {
      fetchHeartNotes().then(onNotesUpdated);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export async function fetchHeartNotes() {
  try {
    const { data, error } = await supabase
      .from('heart_notes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      await ensureSanctuaryAuthSession();
      const retry = await supabase.from('heart_notes').select('*').order('created_at', { ascending: false });
      return retry.data || [];
    }
    return data || [];
  } catch (err) {
    return [];
  }
}

export async function sendHeartNoteToSupabase(note) {
  try {
    await ensureSanctuaryAuthSession();
    const { data, error } = await supabase
      .from('heart_notes')
      .insert([{
        author: note.author,
        recipient: note.recipient,
        text: note.text,
        mood: note.mood,
        need: note.need,
        status: 'unread',
        seen_by: note.seenBy || [note.author],
        unlock_timestamp: note.unlockTimestamp ? new Date(note.unlockTimestamp).toISOString() : null
      }]);
    return data;
  } catch (err) {
    console.log('Supabase insert note error:', err);
  }
}

export async function updateHeartNoteSeenInSupabase(noteId, seenByArray) {
  try {
    await supabase.from('heart_notes').update({ seen_by: seenByArray }).eq('id', noteId);
  } catch (err) {
    console.log('Supabase update note seen error:', err);
  }
}

export async function deleteHeartNoteFromSupabase(noteId) {
  try {
    await supabase.from('heart_notes').delete().eq('id', noteId);
  } catch (err) {
    console.log('Supabase delete note error:', err);
  }
}

// 2. REAL-TIME GARDEN & MEMORIES SUBSCRIPTION & DELETION
export function subscribeToGarden(onGardenUpdated) {
  ensureSanctuaryAuthSession().then(() => {
    fetchGarden().then(onGardenUpdated);
  });

  const channelId = 'garden-' + Math.random().toString(36).substring(2, 9);
  const channel = supabase
    .channel(channelId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'garden_items' }, () => {
      fetchGarden().then(onGardenUpdated);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export async function fetchGarden() {
  try {
    const { data, error } = await supabase.from('garden_items').select('*').order('created_at', { ascending: false });
    if (error) {
      await ensureSanctuaryAuthSession();
      const retry = await supabase.from('garden_items').select('*').order('created_at', { ascending: false });
      return retry.data || [];
    }
    return data || [];
  } catch (err) {
    return [];
  }
}

export async function addGardenItemToSupabase(item) {
  try {
    await ensureSanctuaryAuthSession();
    await supabase.from('garden_items').insert([{
      author: item.author,
      type: item.type || 'flower',
      category: item.category || 'Memories',
      emoji: item.emoji || '🌸',
      title: item.title,
      text: item.text,
      date: item.date,
      photo_url: item.photoUrl || '',
      voice_url: item.voiceUrl || ''
    }]);
  } catch (err) {
    console.log('Supabase add garden item info:', err);
  }
}

export async function deleteGardenItemFromSupabase(itemId) {
  try {
    await ensureSanctuaryAuthSession();
    await supabase.from('garden_items').delete().eq('id', itemId);
  } catch (err) {
    console.log('Supabase delete garden item error:', err);
  }
}

// 3. REAL-TIME LETTERS SUBSCRIPTION & DELETION
export function subscribeToLetters(onLettersUpdated) {
  ensureSanctuaryAuthSession().then(() => {
    fetchLetters().then(onLettersUpdated);
  });

  const channelId = 'letters-' + Math.random().toString(36).substring(2, 9);
  const channel = supabase
    .channel(channelId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'letters' }, () => {
      fetchLetters().then(onLettersUpdated);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export async function fetchLetters() {
  try {
    const { data, error } = await supabase.from('letters').select('*').order('created_at', { ascending: false });
    if (error) {
      await ensureSanctuaryAuthSession();
      const retry = await supabase.from('letters').select('*').order('created_at', { ascending: false });
      return retry.data || [];
    }
    return data || [];
  } catch (err) {
    return [];
  }
}

export async function sendLetterToSupabase(letter) {
  try {
    await ensureSanctuaryAuthSession();
    await supabase.from('letters').insert([{
      author: letter.author,
      recipient: letter.recipient,
      title: letter.title,
      body: letter.body,
      color: letter.color,
      border: letter.border,
      seen_by: letter.seenBy || [letter.author],
      unlock_timestamp: letter.unlockTimestamp ? new Date(letter.unlockTimestamp).toISOString() : null
    }]);
  } catch (err) {
    console.log('Supabase insert letter info:', err);
  }
}

export async function updateLetterSeenInSupabase(letterId, seenByArray) {
  try {
    await ensureSanctuaryAuthSession();
    await supabase.from('letters').update({ seen_by: seenByArray }).eq('id', letterId);
  } catch (err) {
    console.log('Supabase update letter seen error:', err);
  }
}

export async function deleteLetterFromSupabase(letterId) {
  try {
    await ensureSanctuaryAuthSession();
    await supabase.from('letters').delete().eq('id', letterId);
  } catch (err) {
    console.log('Supabase delete letter error:', err);
  }
}

// 4. REAL-TIME PARTNER MOODS SUBSCRIPTION
export function subscribeToPartnerMoods(onMoodsUpdated) {
  ensureSanctuaryAuthSession().then(() => {
    fetchPartnerMoods().then(onMoodsUpdated);
  });

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
    };
  }
}

export async function updatePartnerMoodInSupabase(partner, moodEmoji, moodNote = '') {
  localStorage.setItem(`bu_mood_${partner}`, moodEmoji);
  localStorage.setItem(`bu_mood_note_${partner}`, moodNote);
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  try {
    await ensureSanctuaryAuthSession();
    await supabase.from('garden_items').insert([{
      author: partner,
      type: 'mood',
      category: 'Moods',
      emoji: moodEmoji,
      title: `${partner}'s mood: ${moodEmoji}`,
      text: moodNote || `Feeling ${moodEmoji}`,
      date: timeStr
    }]);
  } catch (err) {
    console.log('Mood update error:', err);
  }
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
      text: `${song.artist} • ${song.note || ''} | link:${song.link || ''}`,
      date: new Date().toLocaleDateString()
    }]);
  } catch (err) {
    console.log('Supabase song insert error:', err);
  }
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
  ensureSanctuaryAuthSession().then(() => {
    fetchSanctuarySettings().then(onSettingsUpdated);
  });

  const channelId = 'settings-' + Math.random().toString(36).substring(2, 9);
  const channel = supabase
    .channel(channelId)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'garden_items' }, (payload) => {
      if (payload && payload.new && payload.new.category === 'SanctuarySettings') {
        fetchSanctuarySettings().then(onSettingsUpdated);
      } else {
        fetchSanctuarySettings().then(onSettingsUpdated);
      }
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

    if (error) {
      await ensureSanctuaryAuthSession();
      const retry = await supabase.from('garden_items').select('*').eq('category', 'SanctuarySettings').order('id', { ascending: false }).limit(1);
      if (!retry.data || retry.data.length === 0) {
        return {
          couplesNames: localStorage.getItem('bu_couples_names') || 'Naitik & Raj',
          anniversaryDate: localStorage.getItem('bu_anniversary_date') || '2024-03-24',
          favoriteSong: localStorage.getItem('bu_favorite_song') || 'Perfect - Ed Sheeran',
          theme: localStorage.getItem('bu_active_theme') || ''
        };
      }
      const row = retry.data[0];
      let parsed = {};
      if (row.text && row.text.startsWith('{')) {
        try { parsed = JSON.parse(row.text); } catch (e) {}
      }
      return {
        couplesNames: parsed.couplesNames || localStorage.getItem('bu_couples_names') || 'Naitik & Raj',
        anniversaryDate: parsed.anniversaryDate || localStorage.getItem('bu_anniversary_date') || '2024-03-24',
        favoriteSong: parsed.favoriteSong || localStorage.getItem('bu_favorite_song') || 'Perfect - Ed Sheeran',
        theme: parsed.theme || localStorage.getItem('bu_active_theme') || ''
      };
    }

    if (!data || data.length === 0) {
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
    await ensureSanctuaryAuthSession();
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

