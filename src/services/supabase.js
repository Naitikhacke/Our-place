// Supabase Real-Time Client Service for Between Us
// Connected Live for Naitik & Raj

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pundnwezscwdmzwevzhh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Dw8Tv6Ht-Z_0yByF_FmwkQ_Uc8rFudY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 1. REAL-TIME HEART NOTES SUBSCRIPTION & DELETION
export function subscribeToHeartNotes(onNotesUpdated) {
  fetchHeartNotes().then(onNotesUpdated);

  const channel = supabase
    .channel('public:heart_notes')
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
    if (error) return [];
    return data || [];
  } catch (err) {
    return [];
  }
}

export async function sendHeartNoteToSupabase(note) {
  try {
    const { data, error } = await supabase
      .from('heart_notes')
      .insert([{
        author: note.author,
        recipient: note.recipient,
        text: note.text,
        mood: note.mood,
        need: note.need,
        status: 'unread',
        unlock_timestamp: note.unlockTimestamp ? new Date(note.unlockTimestamp).toISOString() : null
      }]);
    return data;
  } catch (err) {
    console.log('Supabase insert note error:', err);
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
  fetchGarden().then(onGardenUpdated);

  const channel = supabase
    .channel('public:garden_items')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'garden_items' }, () => {
      fetchGarden().then(onGardenUpdated);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export async function fetchGarden() {
  try {
    const { data, error } = await supabase.from('garden_items').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  } catch (err) {
    return [];
  }
}

export async function addGardenItemToSupabase(item) {
  try {
    await supabase.from('garden_items').insert([{
      author: item.author,
      type: item.type,
      category: item.category,
      emoji: item.emoji,
      title: item.title,
      text: item.text,
      date: item.date
    }]);
  } catch (err) {
    console.log('Supabase add garden item info:', err);
  }
}

export async function deleteGardenItemFromSupabase(itemId) {
  try {
    await supabase.from('garden_items').delete().eq('id', itemId);
  } catch (err) {
    console.log('Supabase delete garden item error:', err);
  }
}

// 3. REAL-TIME LETTERS SUBSCRIPTION & DELETION
export function subscribeToLetters(onLettersUpdated) {
  fetchLetters().then(onLettersUpdated);

  const channel = supabase
    .channel('public:letters')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'letters' }, () => {
      fetchLetters().then(onLettersUpdated);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export async function fetchLetters() {
  try {
    const { data, error } = await supabase.from('letters').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  } catch (err) {
    return [];
  }
}

export async function sendLetterToSupabase(letter) {
  try {
    await supabase.from('letters').insert([{
      author: letter.author,
      recipient: letter.recipient,
      title: letter.title,
      body: letter.body,
      color: letter.color,
      border: letter.border,
      unlock_timestamp: letter.unlockTimestamp ? new Date(letter.unlockTimestamp).toISOString() : null
    }]);
  } catch (err) {
    console.log('Supabase insert letter info:', err);
  }
}

export async function deleteLetterFromSupabase(letterId) {
  try {
    await supabase.from('letters').delete().eq('id', letterId);
  } catch (err) {
    console.log('Supabase delete letter error:', err);
  }
}

// 4. REAL-TIME PARTNER MOODS SUBSCRIPTION
export function subscribeToPartnerMoods(onMoodsUpdated) {
  fetchPartnerMoods().then(onMoodsUpdated);

  const channel = supabase
    .channel('public:partner_moods')
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
    
    if (error || !data) return { Naitik: '😊', Raj: '😊' };

    const naitikItem = data.find(i => i.author === 'Naitik');
    const rajItem = data.find(i => i.author === 'Raj');

    return {
      Naitik: naitikItem ? naitikItem.emoji : (localStorage.getItem('bu_mood_Naitik') || '😊'),
      Raj: rajItem ? rajItem.emoji : (localStorage.getItem('bu_mood_Raj') || '😊')
    };
  } catch (err) {
    return {
      Naitik: localStorage.getItem('bu_mood_Naitik') || '😊',
      Raj: localStorage.getItem('bu_mood_Raj') || '😊'
    };
  }
}

export async function updatePartnerMoodInSupabase(partner, moodEmoji, moodNote) {
  localStorage.setItem(`bu_mood_${partner}`, moodEmoji);
  try {
    await supabase.from('garden_items').insert([{
      author: partner,
      type: 'mood',
      category: 'Moods',
      emoji: moodEmoji,
      title: `${partner}'s mood: ${moodEmoji}`,
      text: moodNote || `Feeling ${moodEmoji}`,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  } catch (err) {
    console.log('Mood update error:', err);
  }
}

// 5. REAL-TIME PLAYLIST SUBSCRIPTION
export function subscribeToPlaylist(onPlaylistUpdated) {
  fetchPlaylist().then(onPlaylistUpdated);

  const channel = supabase
    .channel('public:playlist')
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
