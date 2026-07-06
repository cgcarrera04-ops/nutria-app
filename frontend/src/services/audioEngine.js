// Web Audio API Synthesizer Engine for NutrIA
// ─────────────────────────────────────────────────────────────────────────────
// Composición musical generativa con estructura real de canción:
// Reggaetón (Active Mode): Intro -> Verse -> Chorus -> Bridge/Breakdown -> Loop
// Chill (Relaxing Mode): Progresión de acordes pentatónicos lentos con modulación
// Sin música (None Mode): Silencio absoluto respetando el contexto de audio.

let audioCtx = null;
let musicInterval = null;
let reggaetonInterval = null;
let bgMusicNodes = [];
let isMusicPlaying = false;

let currentMusicMode = localStorage.getItem("nutria_musicmode") || "active"; 
let currentBar = 0;
let nextBarTime = 0;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

// ─── SFX TÁCTILES ────────────────────────────────────────────────────────────
export const playClick = () => {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(500, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  } catch (e) {}
};

export const playChime = () => {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
    osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.16); // G5
    osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.24); // C6
    
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch (e) {}
};

export const playPageFlip = () => {
  try {
    initAudio();
    const bufferSize = audioCtx.sampleRate * 0.35;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(900, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.3);
    filter.Q.setValueAtTime(2.5, audioCtx.currentTime);
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.09, audioCtx.currentTime + 0.08); 
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
    
    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    noiseNode.start();
    noiseNode.stop(audioCtx.currentTime + 0.35);
  } catch (e) {}
};

// ─── INSTRUMENTACIÓN REGGAETÓN SINTÉTICO ──────────────────────────────────────
const playKick = (time, vol = 0.18) => {
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.12);
    
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(time);
    osc.stop(time + 0.13);
  } catch (e) {}
};

const playSnare = (time, vol = 0.045) => {
  try {
    // Snap transitorio tonal
    const snap = audioCtx.createOscillator();
    const gainSnap = audioCtx.createGain();
    snap.type = "triangle";
    snap.frequency.setValueAtTime(180, time);
    gainSnap.gain.setValueAtTime(vol * 1.3, time);
    gainSnap.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
    snap.connect(gainSnap);
    gainSnap.connect(audioCtx.destination);
    snap.start(time);
    snap.stop(time + 0.09);
    
    // Ruido blanco filtrado para el golpe de caja
    const bufferSize = audioCtx.sampleRate * 0.12;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1100, time);
    
    const gainNoise = audioCtx.createGain();
    gainNoise.gain.setValueAtTime(vol, time);
    gainNoise.gain.exponentialRampToValueAtTime(0.001, time + 0.11);
    
    noise.connect(filter);
    filter.connect(gainNoise);
    gainNoise.connect(audioCtx.destination);
    
    noise.start(time);
    noise.stop(time + 0.12);
  } catch (e) {}
};

const playHiHat = (time, vol = 0.015) => {
  try {
    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();
    
    osc.type = "square";
    osc.frequency.setValueAtTime(8000, time);
    
    filter.type = "highpass";
    filter.frequency.setValueAtTime(7000, time);
    
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(time);
    osc.stop(time + 0.04);
  } catch (e) {}
};

const playBass = (time, pitch, duration = 0.22, vol = 0.1) => {
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(pitch, time);
    
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(130, time);
    
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(time);
    osc.stop(time + duration + 0.01);
  } catch (e) {}
};

const playMelody = (time, pitch, duration = 0.2, vol = 0.03) => {
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(pitch, time);
    
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, time);
    
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(time);
    osc.stop(time + duration + 0.01);
  } catch (e) {}
};

// ─── CONFIGURACIÓN DE CHILL ──────────────────────────────────────────────────
const PENTATONIC = [196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];

export const getMusicMode = () => currentMusicMode;

export const setMusicMode = (mode) => {
  currentMusicMode = mode;
  localStorage.setItem("nutria_musicmode", mode);
  if (isMusicPlaying) {
    stopBgMusic();
    startBgMusic();
  }
};

export const startBgMusic = () => {
  if (isMusicPlaying) return;
  try {
    initAudio();
    isMusicPlaying = true;
    
    if (currentMusicMode === "active") {
      nextBarTime = audioCtx.currentTime + 0.05;
      currentBar = 0;
      
      const scheduleBar = () => {
        if (!isMusicPlaying) return;
        const stepDuration = 0.155; // ~97 BPM dembow
        const barDuration = stepDuration * 16;
        
        // Alternar entre secciones de alta energía (coro) y media energía (verso)
        // Eliminamos "intro" y "bridge" para ir directo al grano sin silencios ("sin huecos")
        const block = currentBar % 16;
        const isChorus = block >= 8; 

        // Progresión armónica ultra-pegajosa: Lam -> Do -> Sol -> Fa (Am -> C -> G -> F)
        const bassPitches = [55.00, 65.41, 49.00, 43.65];
        const melodyPitches = [
          [220.00, 261.63, 329.63, 440.00], // Am
          [261.63, 329.63, 392.00, 523.25], // C
          [196.00, 246.94, 293.66, 392.00], // G
          [174.61, 220.00, 261.63, 349.23]  // F
        ];
        
        const progressionIdx = Math.floor(block / 2) % 4; // Cambia acorde cada 2 compases
        const bassHz = bassPitches[progressionIdx];
        const melodyChord = melodyPitches[progressionIdx];
        
        for (let step = 0; step < 16; step++) {
          const stepTime = nextBarTime + (step * stepDuration);
          
          // ── BEAT DRUMS (En todo momento, sin pausas) ──
          // Kick en 0 y 8 (golpe fuerte)
          if (step === 0 || step === 8) {
            playKick(stepTime, 0.22);
          }
          // Kick sutil de apoyo para mayor "flow" (dembow moderno)
          if (step === 12) {
            playKick(stepTime, 0.12);
          }

          // Snare sincopada (los característicos golpes del dembow)
          if (step === 3 || step === 6 || step === 11 || step === 14) {
            playSnare(stepTime, isChorus ? 0.055 : 0.045);
          }

          // Hi-Hats rápidos (rellenan la parte alta, "más pista", cero huecos)
          if (step % 2 === 1 || step === 2 || step === 6 || step === 10 || step === 14) {
            playHiHat(stepTime, isChorus ? 0.018 : 0.012);
          }

          // ── BAJO SENSACIONAL (Bombea rítmicamente en cada compás) ──
          if (step === 0 || step === 3 || step === 6 || step === 8 || step === 11 || step === 14) {
            playBass(stepTime, bassHz, 0.24, isChorus ? 0.13 : 0.10);
          }

          // ── ARMONÍA / PISTA DE ACORDES (Llena el espectro medio, "mucha pista") ──
          // Los acordes suenan como "stabs" rítmicos reggaetoneros
          if (step === 0 || step === 3 || step === 8 || step === 11) {
            const note1 = melodyChord[0];
            const note2 = melodyChord[1];
            const note3 = melodyChord[2];
            playMelody(stepTime, note1, 0.2, 0.02);
            playMelody(stepTime, note2, 0.2, 0.02);
            playMelody(stepTime, note3, 0.2, 0.02);
          }

          // ── LEAD SINTETIZADOR DULCE (Solo en el Coro, añade la melodía pegajosa) ──
          if (isChorus) {
            // Melodía principal juguetona
            if (step === 0 || step === 4 || step === 8 || step === 12) {
              const note = melodyChord[(step / 4) % melodyChord.length] * 1.5;
              playMelody(stepTime, note, 0.26, 0.04);
            }
            if (step === 2 || step === 10) {
              // Notas de respuesta rápida
              const note = melodyChord[1] * 2;
              playMelody(stepTime, note, 0.12, 0.025);
            }
          }
        }
        
        nextBarTime += barDuration;
        currentBar++;
      };
      
      scheduleBar();
      reggaetonInterval = setInterval(scheduleBar, 2480);
    } else if (currentMusicMode === "relaxing") {
      // ── MODO RELAJANTE (CHILL): Progresión armónica de acordes largos pentatónicos ──
      const playNote = () => {
        if (!isMusicPlaying) return;
        
        const note = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)];
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(note, audioCtx.currentTime);
        
        // Filtro cálido
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(500, audioCtx.currentTime);
        
        // Ataque y relajación lentos (Ambient Pad)
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.025, audioCtx.currentTime + 1.5);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 4.5);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 4.5);
        
        bgMusicNodes.push({ osc, gain });
        // Limpiar nodos viejos para evitar fuga de memoria
        if (bgMusicNodes.length > 20) {
          bgMusicNodes.shift();
        }
      };
      
      musicInterval = setInterval(playNote, 2200);
      playNote();
      // Nota secundaria para armonizar
      setTimeout(playNote, 1100);
    }
  } catch (e) {
    console.error("Fallo al iniciar el audioEngine:", e);
  }
};

export const stopBgMusic = () => {
  isMusicPlaying = false;
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
  if (reggaetonInterval) {
    clearInterval(reggaetonInterval);
    reggaetonInterval = null;
  }
  bgMusicNodes.forEach(n => {
    try {
      n.osc.stop();
    } catch (e) {}
  });
  bgMusicNodes = [];
};
