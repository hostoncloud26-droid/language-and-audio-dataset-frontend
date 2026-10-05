import { Language, Dataset, DatasetRecord, User } from '../types';
import { createPlayableWavUrl, getAudioDuration } from './audioService';

const STORAGE_KEYS = {
  TOKEN: 'vdf_auth_token',
  USER: 'vdf_auth_user',
  DATASET_RECORDS: 'vdf_demo_dataset_records',
};

// FastAPI Backend URL configuration
export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string) || 'http://localhost:8000';
export const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000/api';

/**
 * Ensures audio URLs served by the FastAPI server (/media/...) are resolved to absolute backend URLs
 */
export function resolveAudioUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('/')) {
    return `${BACKEND_URL}${url}`;
  }
  return `${BACKEND_URL}/${url}`;
}

export const INITIAL_DEMO_LANGUAGES: Language[] = [
  { id: 1, name: 'English', status: 'Active' },
  { id: 2, name: 'Tamil', status: 'Active' },
  { id: 3, name: 'Hindi', status: 'Active' },
];

export const INITIAL_DEMO_DATASETS: Dataset[] = [
  {
    id: 'DS-001',
    name: 'Multi-Language Speech Dataset 2026',
    language_id: 1,
    language_name: 'English',
    record_count: 3,
    created_at: '2026-10-01T08:00:00Z',
  },
  {
    id: 'DS-002',
    name: 'Tamil Conversational Speech',
    language_id: 2,
    language_name: 'Tamil',
    record_count: 1,
    created_at: '2026-10-01T08:30:00Z',
  },
  {
    id: 'DS-003',
    name: 'Hindi Acoustic Voice Records',
    language_id: 3,
    language_name: 'Hindi',
    record_count: 1,
    created_at: '2026-10-01T09:00:00Z',
  },
];

const DEFAULT_DEMO_RECORDS: DatasetRecord[] = [
  {
    id: 'AUD-001',
    dataset_id: 'DS-001',
    text: 'Hello, welcome to the dataset platform.',
    audio_url: createPlayableWavUrl(440, 4.0),
    language_id: 1,
    language_name: 'English',
    duration: 4.0,
    created_at: '2026-10-01T09:15:00Z',
  },
  {
    id: 'AUD-002',
    dataset_id: 'DS-001',
    text: 'வணக்கம், இது ஒரு தமிழ் ஆடியோ தரவுத்தொகுப்பு.',
    audio_url: createPlayableWavUrl(520, 4.5),
    language_id: 2,
    language_name: 'Tamil',
    duration: 4.5,
    created_at: '2026-10-01T09:30:00Z',
  },
  {
    id: 'AUD-003',
    dataset_id: 'DS-001',
    text: 'नमस्ते, यह एक हिंदी ऑडियो डेटासेट है।',
    audio_url: createPlayableWavUrl(480, 4.2),
    language_id: 3,
    language_name: 'Hindi',
    duration: 4.2,
    created_at: '2026-10-01T09:45:00Z',
  },
];

// Local state fallback
let activeRecords: DatasetRecord[] = [...DEFAULT_DEMO_RECORDS];

try {
  const cached = localStorage.getItem(STORAGE_KEYS.DATASET_RECORDS);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (Array.isArray(parsed) && parsed.length > 0) {
      activeRecords = parsed.map((item, idx) => ({
        ...item,
        audio_url: resolveAudioUrl(item.audio_url || createPlayableWavUrl(400 + (idx * 50) % 300, item.duration || 4.0)),
      }));
    }
  }
} catch {
  // Use default
}

function persistRecords() {
  try {
    localStorage.setItem(STORAGE_KEYS.DATASET_RECORDS, JSON.stringify(activeRecords));
  } catch {
    // ignore
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

export function getStoredUser(): User | null {
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string, user: User) {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
}

export const api = {
  /**
   * Login with FastAPI backend
   */
  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setStoredAuth(data.token, data.user);
        return data;
      } else {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || 'Invalid username or password');
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('NetworkError') && !err.message.includes('Failed to fetch')) {
        throw err;
      }
      throw new Error('Unable to connect to the backend server. Please verify backend is running at ' + API_BASE);
    }
  },

  /**
   * Send a 6-digit OTP verification code to user email
   */
  async sendOtp(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        return await res.json();
      } else {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || 'Failed to send verification code.');
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('NetworkError') && !err.message.includes('Failed to fetch')) {
        throw err;
      }
      throw new Error('Unable to connect to the backend server. Please verify backend is running at ' + API_BASE);
    }
  },

  /**
   * Register a new user with FastAPI backend (enforcing OTP verification)
   */
  async register(
    username: string,
    password: string,
    name?: string,
    role?: string,
    otp?: string
  ): Promise<{ token: string; user: User }> {
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, name, role, otp }),
      });
      if (res.ok) {
        const data = await res.json();
        setStoredAuth(data.token, data.user);
        return data;
      } else {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || 'Failed to register account');
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('NetworkError') && !err.message.includes('Failed to fetch')) {
        throw err;
      }
      throw new Error('Unable to connect to the backend server. Please verify backend is running at ' + API_BASE);
    }
  },

  /**
   * Get Languages from FastAPI / PostgreSQL
   */
  async getLanguages(): Promise<Language[]> {
    try {
      const res = await fetch(`${API_BASE}/languages`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch {
      // Fallback
    }
    return [...INITIAL_DEMO_LANGUAGES];
  },

  /**
   * Add a new Language to FastAPI / PostgreSQL
   */
  async createLanguage(name: string, code?: string, status: string = 'Active'): Promise<Language> {
    try {
      const res = await fetch(`${API_BASE}/languages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code, status }),
      });
      if (res.ok) {
        return await res.json();
      } else {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || 'Failed to create language');
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) throw err;
      const newLang: Language = {
        id: Date.now(),
        name,
        code: code || name.slice(0, 3).toLowerCase(),
        status,
      };
      INITIAL_DEMO_LANGUAGES.push(newLang);
      return newLang;
    }
  },

  /**
   * Update or toggle status of a Language
   */
  async updateLanguage(id: string | number, data: { name?: string; code?: string; status?: string }): Promise<Language> {
    try {
      const res = await fetch(`${API_BASE}/languages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      } else {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || 'Failed to update language');
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) throw err;
      const lang = INITIAL_DEMO_LANGUAGES.find((l) => String(l.id) === String(id));
      if (lang) {
        if (data.name) lang.name = data.name;
        if (data.code) lang.code = data.code;
        if (data.status) lang.status = data.status;
        return lang;
      }
      throw new Error('Language not found');
    }
  },

  /**
   * Delete a Language from FastAPI / PostgreSQL
   */
  async deleteLanguage(id: string | number): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/languages/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        return await res.json();
      } else {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || 'Failed to delete language');
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) throw err;
      const idx = INITIAL_DEMO_LANGUAGES.findIndex((l) => String(l.id) === String(id));
      if (idx !== -1) {
        INITIAL_DEMO_LANGUAGES.splice(idx, 1);
        return { success: true, message: 'Language deleted' };
      }
      throw new Error('Language not found');
    }
  },

  /**
   * Get Datasets from FastAPI / PostgreSQL
   */
  async getDatasets(): Promise<Dataset[]> {
    try {
      const res = await fetch(`${API_BASE}/datasets`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch {
      // Fallback
    }
    return [...INITIAL_DEMO_DATASETS];
  },

  /**
   * Create a new Dataset in FastAPI / PostgreSQL
   */
  async createDataset(name: string, languageId: number | string, description?: string): Promise<Dataset> {
    try {
      const res = await fetch(`${API_BASE}/datasets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          language_id: Number(languageId),
          description: description || '',
        }),
      });
      if (res.ok) {
        return await res.json();
      } else {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || 'Failed to create dataset');
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) throw err;
      const newDs: Dataset = {
        id: `DS-${(INITIAL_DEMO_DATASETS.length + 1).toString().padStart(3, '0')}`,
        name,
        language_id: languageId,
        language_name: 'Language',
        record_count: 0,
        created_at: new Date().toISOString(),
      };
      INITIAL_DEMO_DATASETS.unshift(newDs);
      return newDs;
    }
  },

  /**
   * Delete a Dataset from FastAPI / PostgreSQL
   */
  async deleteDataset(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/datasets/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        return await res.json();
      } else {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || 'Failed to delete dataset');
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) throw err;
      const idx = INITIAL_DEMO_DATASETS.findIndex((d) => d.id === id);
      if (idx !== -1) {
        INITIAL_DEMO_DATASETS.splice(idx, 1);
        return { success: true, message: 'Dataset deleted' };
      }
      throw new Error('Dataset not found');
    }
  },

  /**
   * Get Dataset by ID from FastAPI / PostgreSQL
   */
  async getDatasetById(id: string): Promise<{ dataset: Dataset; records: DatasetRecord[] }> {
    try {
      const res = await fetch(`${API_BASE}/datasets/${id}`);
      if (res.ok) {
        const data = await res.json();
        const dataset = data.dataset;
        const records = (data.records || []).map((r: DatasetRecord) => ({
          ...r,
          audio_url: resolveAudioUrl(r.audio_url),
        }));
        return { dataset, records };
      }
    } catch {
      // Fallback
    }

    const dataset = INITIAL_DEMO_DATASETS.find((d) => d.id === id) || INITIAL_DEMO_DATASETS[0];
    const records = activeRecords.filter((r) => !r.dataset_id || r.dataset_id === id);
    return { dataset, records };
  },

  /**
   * Get Dataset Records with optional filters
   */
  async getDatasetRecords(datasetId?: string, languageId?: string | number): Promise<DatasetRecord[]> {
    try {
      const params = new URLSearchParams();
      if (datasetId) params.append('dataset_id', datasetId);
      if (languageId) params.append('language_id', String(languageId));

      const res = await fetch(`${API_BASE}/records?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          return data.map((r: DatasetRecord) => ({
            ...r,
            audio_url: resolveAudioUrl(r.audio_url),
          }));
        }
      }
    } catch {
      // Fallback
    }

    let result = [...activeRecords];
    if (datasetId) {
      result = result.filter((r) => r.dataset_id === datasetId);
    }
    if (languageId) {
      result = result.filter((r) => String(r.language_id) === String(languageId));
    }
    return result;
  },

  /**
   * Audio Upload via FastAPI -> uploaded to remote Chibisafe server
   */
  async uploadAudio(file: File, languageId: string | number): Promise<{ audio_url: string; filename: string; duration: number; uuid?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language_id', String(languageId));

      const res = await fetch(`${API_BASE}/audio/upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        return {
          audio_url: resolveAudioUrl(data.audio_url),
          filename: data.filename,
          duration: data.duration,
          uuid: data.uuid,
        };
      }
    } catch {
      // Fallback to local audio
    }

    const duration = await getAudioDuration(file);
    const audio_url = URL.createObjectURL(file);
    return {
      audio_url,
      filename: file.name,
      duration,
    };
  },

  /**
   * Speech Generation Preview via OmniVoice API + Chibisafe Remote Server Upload
   */
  async generateAudio(
    text: string,
    languageId: string | number,
    languageName?: string,
    langCode?: string,
    refAudio?: string
  ): Promise<{ audio_url: string; filename: string; duration: number; engine?: string; lang_code?: string }> {
    try {
      const res = await fetch(`${API_BASE}/audio/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language_id: languageId,
          language_name: languageName,
          lang_code: langCode,
          ref_audio: refAudio || 'reference.mp3',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          audio_url: resolveAudioUrl(data.audio_url),
          filename: data.filename,
          duration: data.duration,
          engine: data.engine,
          lang_code: data.lang_code,
        };
      }
    } catch {
      // Fallback to local audio synthesis
    }

    await new Promise((resolve) => setTimeout(resolve, 600));
    const words = text.trim().split(/\s+/).filter(Boolean);
    const duration = Math.min(12, Math.max(3.0, words.length * 0.5));
    const freq = Number(languageId) === 2 ? 520 : Number(languageId) === 3 ? 480 : 440;
    const audio_url = createPlayableWavUrl(freq, duration);

    return {
      audio_url,
      filename: `${(languageName || 'audio').toLowerCase()}_sample_${Date.now().toString().slice(-4)}.wav`,
      duration: parseFloat(duration.toFixed(1)),
      engine: 'local_preview',
    };
  },

  /**
   * Approve & Save Record to Dataset (Approve = Save) via FastAPI & PostgreSQL
   */
  async saveRecordToDataset(
    datasetId: string,
    record: {
      text: string;
      audio_url: string;
      language_id: string | number;
      language_name?: string;
      duration?: number;
    }
  ): Promise<{ id: string; success: boolean; record: DatasetRecord }> {
    try {
      const res = await fetch(`${API_BASE}/datasets/${datasetId}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: record.text,
          audio_url: record.audio_url,
          language_id: record.language_id,
          language_name: record.language_name,
          duration: record.duration,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const savedRec = {
          ...data.record,
          audio_url: resolveAudioUrl(data.record.audio_url),
        };
        return {
          id: data.id,
          success: true,
          record: savedRec,
        };
      }
    } catch {
      // Fallback
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
    const nextNumber = activeRecords.length + 1;
    const newId = `AUD-${nextNumber.toString().padStart(3, '0')}`;

    const newRecord: DatasetRecord = {
      id: newId,
      dataset_id: datasetId,
      text: record.text,
      audio_url: record.audio_url || createPlayableWavUrl(440, record.duration || 4.0),
      language_id: record.language_id,
      language_name: record.language_name || 'English',
      duration: record.duration || 4.0,
      created_at: new Date().toISOString(),
    };

    activeRecords.unshift(newRecord);
    persistRecords();

    const targetDs = INITIAL_DEMO_DATASETS.find((d) => d.id === datasetId);
    if (targetDs) {
      targetDs.record_count = (targetDs.record_count || 0) + 1;
    }

    return {
      id: newId,
      success: true,
      record: newRecord,
    };
  },

  /**
   * Delete a Record from Dataset in FastAPI / PostgreSQL and Chibisafe server
   */
  async deleteRecord(recordId: string, datasetId?: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/records/${recordId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        activeRecords = activeRecords.filter((r) => r.id !== recordId);
        persistRecords();
        return await res.json();
      } else {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || 'Failed to delete record');
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) throw err;
      activeRecords = activeRecords.filter((r) => r.id !== recordId);
      persistRecords();
      return { success: true, message: 'Record deleted' };
    }
  },

  /**
   * Update a Record transcript and details in FastAPI / PostgreSQL and Server
   */
  async updateRecord(
    recordId: string,
    dataOrText: string | { text?: string; audio_url?: string; language_id?: any; language_name?: string }
  ): Promise<DatasetRecord> {
    const payload = typeof dataOrText === 'string' ? { text: dataOrText } : dataOrText;
    try {
      const res = await fetch(`${API_BASE}/records/${recordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        const updatedRec = {
          ...data,
          audio_url: resolveAudioUrl(data.audio_url),
        };
        // Also update local cache
        const idx = activeRecords.findIndex((r) => r.id === recordId);
        if (idx !== -1) {
          activeRecords[idx] = updatedRec;
          persistRecords();
        }
        return updatedRec;
      } else {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || 'Failed to update record');
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) throw err;
      const rec = activeRecords.find((r) => r.id === recordId);
      if (rec) {
        if (payload.text !== undefined) rec.text = payload.text;
        if (payload.audio_url !== undefined) rec.audio_url = payload.audio_url;
        if (payload.language_id !== undefined) rec.language_id = payload.language_id;
        if (payload.language_name !== undefined) rec.language_name = payload.language_name;
        persistRecords();
        return rec;
      }
      throw new Error('Record not found');
    }
  },

  /**
   * Check Database Connection Status from Backend
   */
  async getDbStatus() {
    try {
      const res = await fetch(`${API_BASE}/db/status`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend not running
    }
    return {
      connected: false,
      error: 'FastAPI backend is offline',
    };
  },

  /**
   * Retrieve external server connection health for Chibisafe & OmniVoice
   */
  async getExternalApisStatus(): Promise<{
    chibisafe: { online: boolean; base_url?: string; version?: string; album_name?: string; total_albums?: number; error?: string };
    omnivoice: { online: boolean; base_url?: string; status_code?: number; info?: any; error?: string };
  }> {
    try {
      const res = await fetch(`${API_BASE}/external/status`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend not running
    }
    return {
      chibisafe: { online: false, error: 'FastAPI backend offline' },
      omnivoice: { online: false, error: 'FastAPI backend offline' },
    };
  },

  /**
   * Health check specifically for OmniVoice (mirrors GET /api/system-info)
   */
  async testOmniVoiceHealth(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/system-info`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return { online: false, error: 'OmniVoice endpoint not responding' };
  },
};

