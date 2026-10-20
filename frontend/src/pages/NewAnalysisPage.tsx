import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  FileText,
  X,
  Layers,
  Satellite
} from 'lucide-react';
import { api } from '../services/api';
import { useCreateJob } from '../hooks/useJobs';
import { PRESET_SAMPLE_SCENES } from '../data/mockJobs';
import { EngineType, SensorType } from '../types/job';

export const NewAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createJobMutation = useCreateJob();

  // Form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [sensor, setSensor] = useState<SensorType>('Sentinel-2');
  const [engine, setEngine] = useState<EngineType>('deep');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Upload progression states
  const [uploadStep, setUploadStep] = useState<'idle' | 'presigning' | 'uploading_s3' | 'creating_job' | 'done'>('idle');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setSelectedPresetId(null);
    setErrorMessage(null);
  };

  const handlePresetSelect = (preset: typeof PRESET_SAMPLE_SCENES[0]) => {
    setSelectedPresetId(preset.id);
    const mockFile = new File(['mock GeoTIFF payload binary bytes'], `${preset.title.replace(/\s+/g, '_')}.tif`, {
      type: 'image/tiff'
    });
    setSelectedFile(mockFile);
    setSensor(preset.sensor as SensorType);
    setEngine(preset.engine);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a sample image or upload a satellite file.');
      return;
    }

    setErrorMessage(null);
    setUploadStep('presigning');
    setUploadProgress(15);

    try {
      // Step 1: GET /uploads/presign
      const presign = await api.getPresignUrl(selectedFile.name);
      setUploadStep('uploading_s3');
      setUploadProgress(40);

      // Step 2: Upload file directly
      await api.uploadFileToS3(presign.upload_url, selectedFile, (pct) => {
        setUploadProgress(40 + Math.round((pct / 100) * 45));
      });

      // Step 3: POST /jobs
      setUploadStep('creating_job');
      setUploadProgress(90);

      const jobRes = await createJobMutation.mutateAsync({
        s3_key: presign.s3_key,
        sensor,
        engine,
        filename: selectedFile.name,
        file_size_mb: Number((selectedFile.size / (1024 * 1024)).toFixed(1)) || 420.5,
      });

      setUploadProgress(100);
      setUploadStep('done');

      setTimeout(() => {
        navigate(`/jobs/${jobRes.job_id}`);
      }, 500);
    } catch (err: any) {
      console.error('Job submission failed:', err);
      setErrorMessage(err?.message || 'Failed to start analysis. Please retry.');
      setUploadStep('idle');
      setUploadProgress(0);
    }
  };

  const isSubmitting = uploadStep !== 'idle';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Upload Satellite Image
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Select a sample scene or upload your own satellite raster to detect clouds and evaluate scene clarity.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quick Test Preset Scenes */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Quick Test with Sample Imagery
            </h2>
          </div>
          <span className="text-xs text-slate-500">1-click ready</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESET_SAMPLE_SCENES.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-300'
                }`}
              >
                <img
                  src={preset.thumbnail}
                  alt={preset.title}
                  className="w-14 h-14 rounded-md object-cover shrink-0 border border-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-xs text-slate-900 truncate">
                      {preset.title.split(' ')[0]} {preset.title.split(' ')[1]}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shrink-0 font-medium">
                      {preset.sensor}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {preset.description}
                  </p>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                    Expected Clarity: {preset.expectedClarity}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Upload Area Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        {/* Drag and Drop Box */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Or Upload Custom File
          </label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-600 bg-emerald-50'
                : selectedFile
                ? 'border-emerald-500 bg-emerald-50/30'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".tif,.tiff,.tar,.zip,.nc,.jp2,.jpg,.png"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelected(e.target.files[0]);
                }
              }}
            />

            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-900 truncate max-w-sm">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for analysis
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setSelectedPresetId(null);
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-2"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-600">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-slate-800">
                  <span className="text-emerald-700 hover:underline">Click to browse</span> or drag and drop
                </div>
                <p className="text-xs text-slate-500">
                  GeoTIFF (.tif, .tiff), Sentinel-2 SAFE / zip, or imagery rasters
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Simple Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          {/* Sensor Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Satellite Sensor
            </label>
            <select
              value={sensor}
              onChange={(e) => setSensor(e.target.value as SensorType)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="Sentinel-2">Sentinel-2 (MSI)</option>
              <option value="Landsat-8/9">Landsat 8/9 (OLI/TIRS)</option>
              <option value="PlanetScope">PlanetScope (SuperDove)</option>
              <option value="WorldView-3">WorldView-3</option>
            </select>
          </div>

          {/* Engine Mode */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Analysis Mode
            </label>
            <select
              value={engine}
              onChange={(e) => setEngine(e.target.value as EngineType)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="deep">High Precision (Deep Cloud & Shadow Segmentation)</option>
              <option value="fast">Fast Standard (Rapid Thresholding)</option>
            </select>
          </div>
        </div>

        {/* Progress Bar during upload */}
        {isSubmitting && (
          <div className="space-y-2 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                {uploadStep === 'presigning' && 'Preparing upload request...'}
                {uploadStep === 'uploading_s3' && 'Uploading satellite raster...'}
                {uploadStep === 'creating_job' && 'Running cloud segmentation...'}
                {uploadStep === 'done' && 'Analysis completed! Redirecting...'}
              </span>
              <span className="font-mono text-emerald-700 font-bold">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedFile || isSubmitting}
            className={`px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              !selectedFile || isSubmitting
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
            }`}
          >
            <span>{isSubmitting ? 'Analyzing Image...' : 'Start Analysis'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
