// Web Audio API Sound Synthesizer for Ambient Feedback & Effects

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.type = 'sine';
    osc2.type = 'sine';
    
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.3); // E5
    
    osc2.frequency.setValueAtTime(783.99, now); // G5
    osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.4); // C6
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.85);
    osc2.stop(now + 0.85);
  } catch (e) {
    console.log('Audio disabled:', e);
  }
}

export function playMagicBell() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 987.77, 1046.50]; // Pentatonic arpeggio
    
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + i * 0.08;
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + 0.65);
    });
  } catch (e) {
    console.log('Audio disabled:', e);
  }
}

export function playWaterDrop() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.12);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.16);
  } catch (e) {
    console.log('Audio error:', e);
  }
}

export function playVoiceNotePreview() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Soft soothing warm tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(329.63, now); // E4
    osc.frequency.exponentialRampToValueAtTime(440.00, now + 0.5); // A4
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 1.25);
  } catch (e) {
    console.log('Audio error:', e);
  }
}

let fireNoiseNode = null;
let fireGainNode = null;

export function toggleFireplaceSound(enable) {
  try {
    const ctx = getAudioContext();
    if (enable) {
      if (fireNoiseNode) return;
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      fireNoiseNode = ctx.createBufferSource();
      fireNoiseNode.buffer = buffer;
      fireNoiseNode.loop = true;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 800;
      filter.Q.value = 3.0;
      
      fireGainNode = ctx.createGain();
      fireGainNode.gain.value = 0.03;
      
      fireNoiseNode.connect(filter);
      filter.connect(fireGainNode);
      fireGainNode.connect(ctx.destination);
      
      fireNoiseNode.start();
    } else {
      if (fireNoiseNode) {
        fireNoiseNode.stop();
        fireNoiseNode.disconnect();
        fireNoiseNode = null;
        fireGainNode = null;
      }
    }
  } catch (e) {
    console.log('Fireplace audio error:', e);
  }
}
