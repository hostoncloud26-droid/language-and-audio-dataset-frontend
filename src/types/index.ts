export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Language {
  id: string | number;
  name: string;
  code?: string;
  status: 'Active' | 'Inactive' | string;
}

export interface Dataset {
  id: string;
  name: string;
  language_id: string | number;
  language_name?: string;
  record_count: number;
  created_at: string;
}

export interface DatasetRecord {
  id: string;
  dataset_id?: string;
  text: string;
  audio_url: string;
  language_id: string | number;
  language_name?: string;
  duration?: number | string;
  created_at: string;
}

export type CollectionStep = 
  | 'empty' 
  | 'generating' 
  | 'generated' 
  | 'uploaded' 
  | 'recorded'
  | 'approved'
  | 'submitting' 
  | 'saved';

export interface AudioItem {
  url: string;
  blob?: Blob;
  filename: string;
  duration: number;
  source: 'generated' | 'uploaded' | 'recorded';
}

export interface AudioPlayerState {
  currentTrackUrl: string | null;
  currentTrackId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  error: string | null;
}
