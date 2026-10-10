import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Download,
  FileAudio,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Radio,
  Volume2
} from 'lucide-react';

interface RecordAudioSectionProps {
  selectedLanguageName: string;
  promptText?: string;
  isUploading: boolean;
  onUploadAudio: (file: File) => Promise<void> | void;
  disabled?: boolean;
}

type RecordTab = 'mic' | 'file';
type RecordingState = 'idle' | 'recording' | 'paused' | 'recorded';

export const RecordAudioSection: React.FC<RecordAudioSectionProps> = ({
  selectedLanguageName,
  promptText,
  isUploading,
  onUploadAudio,
  disabled = false,
}) => {
  const [activeTab, setActiveTab] = useState<RecordTab>('mic');
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordedMimeType, setRecordedMimeType] = useState<string>('audio/webm');
  const [micError, setMicError] = useState<string | null>(null);

  // Audio Playback state for recorded audio preview
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);
  const [playbackCurrentTime, setPlaybackCurrentTime] = useState<number>(0);
  const [playbackDuration, setPlaybackDuration] = useState<number>(0);

  // File dropzone state
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Canvas visualizer refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracksAndContext();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
    };
  }, []);

  const stopTracksAndContext = () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // Live visualizer drawing routine
  const startVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const canvasCtx = canvas.getContext('2d');
      if (!canvasCtx) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.8;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = Math.max(4, (dataArray[i] / 255) * canvas.height * 0.85);

          // Gradient color for bars
          const gradient = canvasCtx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, '#0284c7');
          gradient.addColorStop(0.6, '#38bdf8');
          gradient.addColorStop(1, '#ef4444');

          canvasCtx.fillStyle = gradient;
          canvasCtx.beginPath();
          canvasCtx.roundRect(
            x,
            canvas.height - barHeight,
            Math.max(2, barWidth - 3),
            barHeight,
            [3, 3, 0, 0]
          );
          canvasCtx.fill();

          x += barWidth;
        }
      };

      draw();
    } catch (err) {
      console.warn('Web Audio Visualizer could not be initialized:', err);
    }
  };

  // Detect supported audio mime types
  const getSupportedMimeType = (): string => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/mp4',
      'audio/wav',
    ];
    for (const t of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    }
    return '';
  };

  // Start Recording
  const handleStartRecording = async () => {
    setMicError(null);
    audioChunksRef.current = [];

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicError('Your browser does not support audio recording via microphone.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      audioStreamRef.current = stream;

      const mimeType = getSupportedMimeType();
      setRecordedMimeType(mimeType || 'audio/webm');

      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const finalBlob = new Blob(audioChunksRef.current, {
          type: mimeType || 'audio/webm',
        });
        const url = URL.createObjectURL(finalBlob);

        setRecordedBlob(finalBlob);
        setRecordedUrl(url);
        setRecordingState('recorded');
        stopTracksAndContext();
      };

      mediaRecorder.start(200); // 200ms time slice
      setRecordingState('recording');
      setElapsedSeconds(0);

      // Start timer
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => {
          // Safety cap at 3 minutes (180s)
          if (prev >= 180) {
            handleStopRecording();
            return 180;
          }
          return prev + 1;
        });
      }, 1000);

      // Start Visualizer
      startVisualizer(stream);
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError('Microphone permission was denied. Please allow microphone access in your browser.');
      } else if (err.name === 'NotFoundError') {
        setMicError('No microphone input device detected. Please connect a microphone.');
      } else {
        setMicError(`Unable to start recording: ${err.message || 'Microphone error'}`);
      }
      setRecordingState('idle');
      stopTracksAndContext();
    }
  };

  // Pause Recording
  const handlePauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  // Resume Recording
  const handleResumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
      timerIntervalRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  // Stop Recording
  const handleStopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (
      mediaRecorderRef.current &&
      (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused')
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  // Cancel / Reset
  const handleResetRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    stopTracksAndContext();

    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }

    setRecordingState('idle');
    setElapsedSeconds(0);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setIsPlayingPreview(false);
    setPlaybackCurrentTime(0);
    setPlaybackDuration(0);
    setMicError(null);
  };

  // Format MM:SS
  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Preview Audio Player Handlers
  const handleTogglePlayPreview = () => {
    if (!audioPlayerRef.current) return;
    if (isPlayingPreview) {
      audioPlayerRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPlayerRef.current.play().catch(() => {});
      setIsPlayingPreview(true);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioPlayerRef.current) {
      setPlaybackCurrentTime(audioPlayerRef.current.currentTime);
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioPlayerRef.current) {
      const dur = audioPlayerRef.current.duration;
      setPlaybackDuration(isFinite(dur) && !isNaN(dur) ? dur : elapsedSeconds);
    }
  };

  const handleAudioEnded = () => {
    setIsPlayingPreview(false);
    setPlaybackCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.currentTime = time;
      setPlaybackCurrentTime(time);
    }
  };

  // Upload Recorded Audio to Server
  const handleUploadRecordedAudio = async () => {
    if (!recordedBlob) return;

    // Determine extension based on mimeType
    const ext = recordedMimeType.includes('ogg')
      ? '.ogg'
      : recordedMimeType.includes('wav')
      ? '.wav'
      : recordedMimeType.includes('mp4')
      ? '.m4a'
      : '.webm';

    const filename = `recording_${selectedLanguageName.toLowerCase()}_${Date.now()}${ext}`;
    const file = new File([recordedBlob], filename, {
      type: recordedBlob.type || 'audio/webm',
    });

    await onUploadAudio(file);
  };

  // Download Recorded Audio
  const handleDownloadRecordedAudio = () => {
    if (!recordedUrl || !recordedBlob) return;
    const ext = recordedMimeType.includes('ogg')
      ? '.ogg'
      : recordedMimeType.includes('wav')
      ? '.wav'
      : recordedMimeType.includes('mp4')
      ? '.m4a'
      : '.webm';
    const a = document.createElement('a');
    a.href = recordedUrl;
    a.download = `voice_recording_${Date.now()}${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // File Dropzone handlers
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file) {
        onUploadAudio(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file) {
        onUploadAudio(file);
      }
    }
  };

  return (
    <div className="record-audio-section">
      {/* Section Header */}
      <div className="record-section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="record-header-icon-box">
            <Mic size={20} color="var(--primary)" />
          </div>
          <div>
            <h3 className="record-section-title">Record Audio</h3>
            <p className="record-section-subtitle">
              Record speech via microphone or upload an audio file for{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{selectedLanguageName}</strong>
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div>
          {recordingState === 'recording' && (
            <span className="record-status-pill recording">
              <span className="record-live-dot" />
              Recording Active
            </span>
          )}
          {recordingState === 'paused' && (
            <span className="record-status-pill paused">
              <Pause size={12} /> Recording Paused
            </span>
          )}
          {recordingState === 'recorded' && (
            <span className="record-status-pill recorded">
              <CheckCircle2 size={13} color="#16a34a" /> Voice Captured
            </span>
          )}
          {recordingState === 'idle' && (
            <span className="record-status-pill idle">
              <Radio size={13} /> Ready to Record
            </span>
          )}
        </div>
      </div>

      {/* Option Tabs: Record Audio vs Upload Audio */}
      <div className="record-options-tabs">
        <button
          type="button"
          className={`record-tab-btn ${activeTab === 'mic' ? 'active' : ''}`}
          onClick={() => setActiveTab('mic')}
          disabled={recordingState === 'recording' || recordingState === 'paused' || isUploading}
        >
          <Mic size={16} />
          <span>Record from Microphone</span>
        </button>

        <button
          type="button"
          className={`record-tab-btn ${activeTab === 'file' ? 'active' : ''}`}
          onClick={() => setActiveTab('file')}
          disabled={recordingState === 'recording' || recordingState === 'paused' || isUploading}
        >
          <Upload size={16} />
          <span>Upload Audio File</span>
        </button>
      </div>

      {/* Error Banner */}
      {micError && (
        <div className="record-error-alert">
          <AlertCircle size={18} color="var(--danger)" />
          <div style={{ flex: 1, fontSize: '0.88rem', color: '#991b1b' }}>{micError}</div>
          <button
            type="button"
            className="btn-retry-record"
            onClick={handleStartRecording}
          >
            Retry
          </button>
        </div>
      )}

      {/* TAB 1: RECORD FROM MICROPHONE */}
      {activeTab === 'mic' && (
        <div className="record-studio-card">
          {/* Reference Prompt display if user entered or picked text */}
          {promptText && promptText.trim().length > 0 && (
            <div className="record-prompt-banner">
              <div className="record-prompt-label">
                <span>Reading Prompt for {selectedLanguageName}:</span>
              </div>
              <p className="record-prompt-text">"{promptText}"</p>
            </div>
          )}

          {/* STATE 1: IDLE */}
          {recordingState === 'idle' && (
            <div className="record-idle-view">
              <div className="record-mic-glow-wrapper">
                <button
                  type="button"
                  className="btn-start-record-main"
                  onClick={handleStartRecording}
                  disabled={disabled || isUploading}
                  title="Click to start live voice recording"
                >
                  <Mic size={32} />
                </button>
              </div>

              <div className="record-idle-text-block">
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Click to Start Recording
                </h4>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                  Speak clearly into your microphone in {selectedLanguageName}. High-fidelity noise suppression is enabled.
                </p>
              </div>

              <div className="record-specs-row">
                <span className="spec-pill">High-Fidelity Audio</span>
                <span className="spec-pill">Auto Gain Control</span>
                <span className="spec-pill">Echo Cancellation</span>
              </div>
            </div>
          )}

          {/* STATE 2: RECORDING OR PAUSED */}
          {(recordingState === 'recording' || recordingState === 'paused') && (
            <div className="record-active-view">
              {/* Digital Timer */}
              <div className="record-timer-container">
                <span className="record-timer-digit">{formatTime(elapsedSeconds)}</span>
                <span className="record-timer-max">/ 03:00 Max</span>
              </div>

              {/* Real-time Web Audio Visualizer Canvas */}
              <div className="record-visualizer-box">
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={56}
                  className="record-canvas-visualizer"
                />
              </div>

              {/* Action Buttons Row */}
              <div className="record-controls-row">
                {recordingState === 'recording' ? (
                  <button
                    type="button"
                    className="btn-record-control pause"
                    onClick={handlePauseRecording}
                    title="Pause recording"
                  >
                    <Pause size={17} />
                    <span>Pause</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-record-control resume"
                    onClick={handleResumeRecording}
                    title="Resume recording"
                  >
                    <Play size={17} />
                    <span>Resume</span>
                  </button>
                )}

                <button
                  type="button"
                  className="btn-record-control stop"
                  onClick={handleStopRecording}
                  title="Stop recording and review"
                >
                  <Square size={17} />
                  <span>Stop & Review</span>
                </button>

                <button
                  type="button"
                  className="btn-record-control cancel"
                  onClick={handleResetRecording}
                  title="Discard and cancel recording"
                >
                  <RotateCcw size={16} />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: RECORDED (PREVIEW & UPLOAD) */}
          {recordingState === 'recorded' && recordedUrl && (
            <div className="record-playback-view">
              {/* Hidden native audio element for preview */}
              <audio
                ref={audioPlayerRef}
                src={recordedUrl}
                onTimeUpdate={handleAudioTimeUpdate}
                onLoadedMetadata={handleAudioLoadedMetadata}
                onEnded={handleAudioEnded}
              />

              <div className="record-preview-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Volume2 size={18} color="var(--primary)" />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    Recording Preview
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="record-stat-chip">
                    Duration: {formatTime(playbackDuration || elapsedSeconds)}
                  </span>
                  <span className="record-stat-chip">
                    Size: {recordedBlob ? `${Math.round(recordedBlob.size / 1024)} KB` : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Wave & Playback Progress Bar */}
              <div className="record-preview-player-bar">
                <button
                  type="button"
                  className="btn-preview-play-toggle"
                  onClick={handleTogglePlayPreview}
                  title={isPlayingPreview ? 'Pause playback' : 'Play recorded audio'}
                >
                  {isPlayingPreview ? <Pause size={18} /> : <Play size={18} />}
                </button>

                <div className="preview-scrubber-wrapper">
                  <input
                    type="range"
                    min={0}
                    max={playbackDuration || elapsedSeconds || 1}
                    step={0.05}
                    value={playbackCurrentTime}
                    onChange={handleSeek}
                    className="preview-range-slider"
                  />
                  <div className="preview-times-row">
                    <span>{formatTime(playbackCurrentTime)}</span>
                    <span>{formatTime(playbackDuration || elapsedSeconds)}</span>
                  </div>
                </div>
              </div>

              {/* Upload Option & Record Again */}
              <div className="record-upload-actions-row">
                {/* Upload Button (Primary Action in Record Section) */}
                <button
                  type="button"
                  className="btn-upload-recording-main"
                  onClick={handleUploadRecordedAudio}
                  disabled={isUploading}
                  title="Upload this recording to the platform server"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={18} className="spin-icon" />
                      <span>Uploading Recording...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      <span>Upload Recording</span>
                    </>
                  )}
                </button>

                {/* Re-record Button */}
                <button
                  type="button"
                  className="btn-rerecord-secondary"
                  onClick={handleResetRecording}
                  disabled={isUploading}
                  title="Discard current take and record again"
                >
                  <RotateCcw size={16} />
                  <span>Record Again</span>
                </button>

                {/* Download Local Copy */}
                <button
                  type="button"
                  className="btn-download-record-ghost"
                  onClick={handleDownloadRecordedAudio}
                  title="Download recording to your computer"
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: UPLOAD AUDIO FILE */}
      {activeTab === 'file' && (
        <div
          className={`record-dropzone-box ${dragActive ? 'drag-active' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="audio/*,.wav,.mp3,.m4a,.ogg,.webm,.aac"
            style={{ display: 'none' }}
          />

          <div className="dropzone-inner-content">
            <div className="dropzone-icon-circle">
              {isUploading ? (
                <Loader2 size={24} className="spin-icon" color="var(--primary)" />
              ) : (
                <FileAudio size={26} color="var(--primary)" />
              )}
            </div>

            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {isUploading ? 'Uploading audio to server...' : 'Upload Audio File'}
              </p>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                Drag and drop your audio file here, or click to browse
              </p>
            </div>

            <div className="dropzone-formats-tag">
              Supports WAV, MP3, M4A, OGG, WEBM (Max 50MB)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
