import { useEffect, useState } from 'react';
import { subscribeSpeechState, type SpeechState } from '@/utils/speech';

export function useSpeechState(): SpeechState {
  const [state, setState] = useState<SpeechState>('idle');

  useEffect(() => {
    const unsub = subscribeSpeechState(setState);
    return unsub;
  }, []);

  return state;
}
