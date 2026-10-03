import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AudioPlayerState } from '../types';

interface AudioPlayerContextType extends AudioPlayerState {
  playAudio: (id: string, url: string, initialDuration?: number) => void;
  pauseAudio: () => void;
  toggleAudio: (id: string, url: string, initialDuration?: number) => void;
  replayAudio: () => void;
  seekTo: (percent: number) => void;
  stopAudio: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [currentTrackUrl, setCurrentTrackUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Singleton HTMLAudioElement
    const audio = new Audio();
    audioRef.current = audio;

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      setError('Unable to playback audio resource');
    };

    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audioRef.current = null;
    };
  }, []);

  const playAudio = (id: string, url: string, initialDuration?: number) => {
    if (!audioRef.current) return;
    setError(null);

    // If changing track
    if (currentTrackId !== id || currentTrackUrl !== url) {
      setCurrentTrackId(id);
      setCurrentTrackUrl(url);
      setCurrentTime(0);
      setDuration(initialDuration || 0);
      setIsLoading(true);
      
      audioRef.current.src = url;
      audioRef.current.load();
    }

    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn('Playback notice:', err);
        setIsPlaying(false);
        setIsLoading(false);
      });
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleAudio = (id: string, url: string, initialDuration?: number) => {
    if (currentTrackId === id && isPlaying) {
      pauseAudio();
    } else {
      playAudio(id, url, initialDuration);
    }
  };

  const replayAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const seekTo = (percent: number) => {
    if (!audioRef.current || !duration) return;
    const clampedPercent = Math.max(0, Math.min(1, percent));
    const targetTime = clampedPercent * duration;
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTrackId(null);
    setCurrentTrackUrl(null);
    setCurrentTime(0);
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrackId,
        currentTrackUrl,
        isPlaying,
        currentTime,
        duration,
        isLoading,
        error,
        playAudio,
        pauseAudio,
        toggleAudio,
        replayAudio,
        seekTo,
        stopAudio,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};
