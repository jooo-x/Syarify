import { Volume2, Pause, Play, Square } from 'lucide-react';
import { speak, pauseSpeaking, resumeSpeaking, stopSpeaking } from '@/utils/speech';
import { useSpeechState } from '@/hooks/useSpeechState';
import type { SpeechState } from '@/utils/speech';

interface SpeechButtonProps {
  text: string;
  lang?: string;
  label?: string;
  className?: string;
}

export function SpeechButton({ text, lang = 'id-ID', label, className }: SpeechButtonProps) {
  const state: SpeechState = useSpeechState();

  const handleClick = () => {
    if (state === 'idle') {
      speak(text, lang);
    } else if (state === 'speaking') {
      pauseSpeaking();
    } else if (state === 'paused') {
      resumeSpeaking();
    }
  };

  const handleStop = () => {
    stopSpeaking();
  };

  const isActive = state !== 'idle';

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={handleClick}
        className={className ?? 'w-10 h-10 rounded-xl bg-accent-100 text-accent-500 flex items-center justify-center shrink-0 hover:bg-accent-200 transition-colors active:scale-90'}
        aria-label={
          state === 'speaking' ? 'Jeda pembacaan' :
          state === 'paused' ? 'Lanjutkan pembacaan' :
          (label ?? 'Bacakan materi ini')
        }
        aria-pressed={isActive}
      >
        {state === 'speaking' ? <Pause className="w-5 h-5" aria-hidden="true" /> :
         state === 'paused' ? <Play className="w-5 h-5" aria-hidden="true" /> :
         <Volume2 className="w-5 h-5" aria-hidden="true" />}
      </button>
      {isActive && (
        <button
          onClick={handleStop}
          className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0 hover:bg-gray-200 transition-colors active:scale-90"
          aria-label="Hentikan pembacaan"
        >
          <Square className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
