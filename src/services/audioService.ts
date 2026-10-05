/**
 * Audio Utilities and Browser-Native Audio Generator
 * Creates playable audio WAV blobs and provides duration calculations
 */

/**
 * Generates a playable, browser-native 16-bit PCM WAV audio Blob
 */
export function createPlayableWavBlob(frequency: number = 440, durationSeconds: number = 3.5): Blob {
  const sampleRate = 22050;
  const totalSamples = Math.floor(sampleRate * durationSeconds);
  const buffer = new ArrayBuffer(44 + totalSamples * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length
  view.setUint32(4, 36 + totalSamples * 2, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw PCM)
  view.setUint16(20, 1, true);
  // channel count (mono)
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate
  view.setUint32(28, sampleRate * 2, true);
  // block align
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, totalSamples * 2, true);

  // Write PCM audio wave samples
  let offset = 44;
  for (let i = 0; i < totalSamples; i++, offset += 2) {
    const t = i / sampleRate;
    // Pleasant melodic chime pattern
    const melodyFreq = frequency * (1 + 0.15 * Math.sin(2 * Math.PI * 2 * t));
    const envelope = Math.sin(Math.PI * (i / totalSamples));
    const sample = Math.sin(2 * Math.PI * melodyFreq * t) * envelope * 0.4;
    const s = Math.max(-1, Math.min(1, sample));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Generates a playable, browser-native 16-bit PCM WAV audio Blob URL
 */
export function createPlayableWavUrl(frequency: number = 440, durationSeconds: number = 3.5): string {
  const blob = createPlayableWavBlob(frequency, durationSeconds);
  return URL.createObjectURL(blob);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Calculates audio duration from File or URL using HTMLAudioElement
 */
export function getAudioDuration(fileOrUrl: File | string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);
    
    audio.addEventListener('loadedmetadata', () => {
      const dur = audio.duration;
      resolve(isNaN(dur) || !isFinite(dur) ? 3.5 : parseFloat(dur.toFixed(1)));
    });

    audio.addEventListener('error', () => {
      resolve(3.5);
    });

    audio.src = url;
  });
}

/**
 * Formats seconds into MM:SS format
 */
export function formatDuration(seconds: number | string | undefined): string {
  if (seconds === undefined || seconds === null) return '00:00';
  const num = typeof seconds === 'string' ? parseFloat(seconds) : seconds;
  if (isNaN(num) || num <= 0) return '00:00';
  
  const mins = Math.floor(num / 60);
  const secs = Math.floor(num % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
