type SpeechState = 'idle' | 'speaking' | 'paused';

let currentState: SpeechState = 'idle';
let currentUtterance: SpeechSynthesisUtterance | null = null;
let listeners: Set<(state: SpeechState) => void> = new Set();
let cachedText = '';
let cachedLang = 'id-ID';

function setState(state: SpeechState) {
  currentState = state;
  listeners.forEach((fn) => fn(state));
}

function createUtterance(text: string, lang: string): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.95;
  utterance.pitch = 1;

  const voices = window.speechSynthesis.getVoices();
  const idVoice = voices.find((v) => v.lang.startsWith('id'));
  if (idVoice) utterance.voice = idVoice;

  utterance.onend = () => {
    if (currentState !== 'paused') {
      currentUtterance = null;
      cachedText = '';
      setState('idle');
    }
  };

  utterance.onerror = () => {
    currentUtterance = null;
    cachedText = '';
    setState('idle');
  };

  return utterance;
}

export function speak(text: string, lang = 'id-ID') {
  if (!('speechSynthesis' in window)) {
    return false;
  }
  window.speechSynthesis.cancel();
  cachedText = text;
  cachedLang = lang;
  currentUtterance = createUtterance(text, lang);
  window.speechSynthesis.speak(currentUtterance);
  setState('speaking');
  return true;
}

export function pauseSpeaking() {
  if (!('speechSynthesis' in window)) return;
  if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
    window.speechSynthesis.pause();
    setState('paused');
  }
}

export function resumeSpeaking() {
  if (!('speechSynthesis' in window)) return;
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    setState('speaking');
  }
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
  cachedText = '';
  setState('idle');
}

export function toggleSpeech(text?: string, lang = 'id-ID') {
  if (currentState === 'speaking') {
    pauseSpeaking();
  } else if (currentState === 'paused') {
    resumeSpeaking();
  } else if (text) {
    speak(text, lang);
  }
}

export function getSpeechState(): SpeechState {
  return currentState;
}

export function subscribeSpeechState(fn: (state: SpeechState) => void): () => void {
  listeners.add(fn);
  fn(currentState);
  return () => listeners.delete(fn);
}

export function isSpeaking() {
  return currentState === 'speaking';
}

export type { SpeechState };
