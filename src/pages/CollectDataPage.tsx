import React, { useState, useEffect } from 'react';
import { Language, Dataset, AudioItem, DatasetRecord, CollectionStep } from '../types';
import { api } from '../services/api';
import { LanguageSelector } from '../components/CollectData/LanguageSelector';
import { TextInputArea } from '../components/CollectData/TextInputArea';
import { AudioUploadBox } from '../components/CollectData/AudioUploadBox';
import { AudioPreviewCard } from '../components/CollectData/AudioPreviewCard';
import { CollectionSuccessCard } from '../components/CollectData/CollectionSuccessCard';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { Sparkles, Mic, ArrowLeft } from 'lucide-react';

interface CollectDataPageProps {
  onNavigateToDatasets: () => void;
}

export const CollectDataPage: React.FC<CollectDataPageProps> = ({ onNavigateToDatasets }) => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState<string | number>('');
  
  const [text, setText] = useState<string>('');
  const [finalText, setFinalText] = useState<string>('');
  const [showUploadBox, setShowUploadBox] = useState<boolean>(false);
  const [audioItem, setAudioItem] = useState<AudioItem | null>(null);

  const [stepState, setStepState] = useState<CollectionStep>('empty');
  const [savedRecord, setSavedRecord] = useState<DatasetRecord | null>(null);

  const [isLoadingLangs, setIsLoadingLangs] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [apiError, setApiError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'generate' | 'upload' | 'save' | 'load' | null>(null);

  useEffect(() => {
    loadPrerequisites();
  }, []);

  const loadPrerequisites = async () => {
    setIsLoadingLangs(true);
    setApiError(null);
    try {
      const [langs, dsList] = await Promise.all([api.getLanguages(), api.getDatasets()]);
      setLanguages(langs);
      setDatasets(dsList);
      
      // Auto-select the first active language if not set
      if (langs.length > 0 && !selectedLanguageId) {
        setSelectedLanguageId(langs[0].id);
      }
    } catch (err) {
      setApiError('Unable to load languages.');
      setErrorType('load');
    } finally {
      setIsLoadingLangs(false);
    }
  };

  const selectedLanguage = languages.find(
    (l) => String(l.id) === String(selectedLanguageId)
  );

  // Audio Generation Flow from Original Text
  const handleGenerateAudio = async () => {
    if (!text.trim() || !selectedLanguage) return;

    setIsGenerating(true);
    setStepState('generating');
    setApiError(null);

    try {
      const result = await api.generateAudio(text, selectedLanguage.id, selectedLanguage.name);
      setAudioItem({
        url: result.audio_url,
        filename: result.filename,
        duration: result.duration,
        source: 'generated',
      });
      // Initialize Final Text with the original text (user can edit independently)
      setFinalText(text);
      setStepState('generated');
    } catch (err: any) {
      setApiError('Audio generation failed.');
      setErrorType('generate');
      setStepState('empty');
    } finally {
      setIsGenerating(false);
    }
  };

  // Regeneration Flow from Current Final Text (Original Text remains unchanged and locked)
  const handleRegenerateAudio = async () => {
    if (!finalText.trim() || !selectedLanguage) return;

    setIsRegenerating(true);
    setApiError(null);

    try {
      const result = await api.generateAudio(finalText, selectedLanguage.id, selectedLanguage.name);
      setAudioItem({
        url: result.audio_url,
        filename: result.filename,
        duration: result.duration,
        source: 'generated',
      });
      // Audio preview is updated with new speech; user can listen and then approve
      setStepState('generated');
    } catch (err: any) {
      setApiError('Audio regeneration failed.');
      setErrorType('generate');
    } finally {
      setIsRegenerating(false);
    }
  };

  // When Final Text is edited, if previously approved, reset to generated state
  const handleFinalTextChange = (newFinalText: string) => {
    setFinalText(newFinalText);
    if (stepState === 'approved') {
      setStepState('generated');
    }
  };

  // Audio Upload Flow
  const handleFileUpload = async (file: File) => {
    if (!selectedLanguage) return;

    setIsUploading(true);
    setApiError(null);

    try {
      const result = await api.uploadAudio(file, selectedLanguage.id);
      setAudioItem({
        url: result.audio_url,
        filename: result.filename,
        duration: result.duration,
        source: 'uploaded',
      });
      setShowUploadBox(false);
      // Initialize Final Text with file name or existing text
      setFinalText(text.trim() ? text : file.name.replace(/\.[^/.]+$/, ''));
      setStepState('uploaded');
    } catch (err: any) {
      setApiError('Unable to upload audio.');
      setErrorType('upload');
      setStepState('empty');
    } finally {
      setIsUploading(false);
    }
  };

  // Approval Step (Does NOT save to dataset, only transitions to APPROVED state)
  const handleApprove = () => {
    if (!audioItem || !selectedLanguage) return;
    setStepState('approved');
    setApiError(null);
  };

  // Submission Step (The ONLY action that saves to dataset)
  const handleSubmitToDataset = async () => {
    if (!audioItem || !selectedLanguage) return;

    setIsSubmitting(true);
    setStepState('submitting');
    setApiError(null);

    // Target dataset based on language or default first dataset
    const targetDataset =
      datasets.find((d) => String(d.language_id) === String(selectedLanguage.id)) ||
      datasets[0] || { id: 'DS-001' };

    try {
      const response = await api.saveRecordToDataset(targetDataset.id, {
        text: finalText.trim() || text.trim() || `Audio sample (${audioItem.filename})`,
        audio_url: audioItem.url,
        language_id: selectedLanguage.id,
        language_name: selectedLanguage.name,
        duration: audioItem.duration,
      });

      setSavedRecord(response.record);
      setStepState('saved');
    } catch (err: any) {
      setApiError('Unable to save audio to dataset.');
      setErrorType('save');
      setStepState('approved');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    setAudioItem(null);
    setFinalText('');
    setStepState('empty');
    setApiError(null);
  };

  const handleResetForNext = () => {
    setText('');
    setFinalText('');
    setAudioItem(null);
    setSavedRecord(null);
    setShowUploadBox(false);
    setStepState('empty');
    setApiError(null);
  };

  // Original Text is locked once audio has been generated or uploaded
  const isOriginalLocked = !!audioItem || isGenerating || stepState === 'generated' || stepState === 'uploaded' || stepState === 'approved' || stepState === 'submitting' || stepState === 'saved';

  return (
    <div className="page-content">
      <div className="collect-container">
        {/* Banner */}
        <div className="collect-flow-banner">
          <div>
            <h2 className="collect-header-title">Collect Data</h2>
            <p className="collect-header-subtitle">
              Collect, synthesize, annotate, and approve speech samples
            </p>
          </div>
          <div style={{ zIndex: 2 }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600 }}>
              End-to-End Collection Flow
            </span>
          </div>
        </div>

        {/* Section 6: Language Selection */}
        <LanguageSelector
          languages={languages}
          selectedLanguageId={selectedLanguageId}
          onSelectLanguage={(id) => {
            setSelectedLanguageId(id);
            setAudioItem(null);
            setFinalText('');
            setSavedRecord(null);
            setStepState('empty');
            setApiError(null);
          }}
          isLoading={isLoadingLangs}
        />

        {/* Error Feedback Banner with Try Again */}
        {apiError && (
          <ErrorBanner
            message={apiError}
            retryText="Try Again"
            onRetry={() => {
              if (errorType === 'generate') handleGenerateAudio();
              else if (errorType === 'save') handleSubmitToDataset();
              else if (errorType === 'load') loadPrerequisites();
            }}
          />
        )}

        {/* Section 7, 8, 9, 10, 11: Main Collection Workspace Area */}
        {selectedLanguage && (
          <div className="text-audio-card">
            <div className="selected-badge-pill">
              <Mic size={15} />
              <span>Selected Language: {selectedLanguage.name}</span>
            </div>

            {/* Saved State Result */}
            {stepState === 'saved' && savedRecord ? (
              <CollectionSuccessCard
                record={savedRecord}
                datasetId={savedRecord.dataset_id || (datasets[0]?.id || 'DS-001')}
                onCollectAnother={handleResetForNext}
                onViewDatasets={onNavigateToDatasets}
              />
            ) : (
              <>
                {/* Text input and actions (Original Text - Locked after generation) */}
                <TextInputArea
                  text={text}
                  onTextChange={setText}
                  onGenerate={handleGenerateAudio}
                  onUploadClick={() => setShowUploadBox(!showUploadBox)}
                  onFileSelected={handleFileUpload}
                  isGenerating={isGenerating}
                  isUploading={isUploading}
                  isLocked={isOriginalLocked}
                  selectedLanguageName={selectedLanguage.name}
                />

                {/* Upload File Box Dropzone */}
                {showUploadBox && !audioItem && (
                  <AudioUploadBox
                    onFileSelected={handleFileUpload}
                    isUploading={isUploading}
                    error={apiError}
                  />
                )}

                {/* Section 10: Audio Preview, Final Text & Approval/Submit */}
                {audioItem && (stepState === 'generated' || stepState === 'uploaded' || stepState === 'approved' || stepState === 'submitting') && (
                  <AudioPreviewCard
                    audioItem={audioItem}
                    finalText={finalText}
                    onFinalTextChange={handleFinalTextChange}
                    isApproved={stepState === 'approved' || stepState === 'submitting'}
                    onApprove={handleApprove}
                    onSubmit={handleSubmitToDataset}
                    onDiscard={handleDiscard}
                    onRegenerate={handleRegenerateAudio}
                    isRegenerating={isRegenerating}
                    isSubmitting={isSubmitting}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
