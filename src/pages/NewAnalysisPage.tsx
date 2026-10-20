import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  FileCheck, 
  Satellite, 
  Zap, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileCode
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
    // Check filename extension (tif, tiff, zip, tar, nc)
    const validExts = ['.tif', '.tiff', '.tar', '.zip', '.nc', '.h5', '.jp2'];
    const isGeo = validExts.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!isGeo) {
      // Still allow for flexibility, but give friendly tip
      console.log('Non-standard raster extension selected:', file.name);
    }
    setSelectedFile(file);
    setErrorMessage(null);
  };

  const handlePresetSelect = (preset: typeof PRESET_SAMPLE_SCENES[0]) => {
    // Create a mock File object from preset
    const mockFile = new File(['mock GeoTIFF payload binary bytes'], `${preset.title.replace(/\s+/g, '_')}.tif`, {
      type: 'image/tiff'
    });
    setSelectedFile(mockFile);
    setSensor(preset.sensor as SensorType);
    setEngine(preset.engine);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please upload a GeoTIFF image file or select a preset scene.');
      return;
    }

    setErrorMessage(null);
    setUploadStep('presigning');
    setUploadProgress(10);

    try {
      // Step 1: GET /uploads/presign
      const presign = await api.getPresignUrl(selectedFile.name);
      setUploadStep('uploading_s3');
      setUploadProgress(25);

      // Step 2: Upload file directly to S3 via presigned URL with progress
      await api.uploadFileToS3(presign.upload_url, selectedFile, (pct) => {
        // Map 0-100% S3 upload to 25%-85% overall progress
        setUploadProgress(25 + Math.round((pct / 100) * 60));
      });

      // Step 3: POST /jobs -> body { s3_key, sensor, engine: "fast"|"deep" }
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

      // Seamless redirect to the job view to see live execution and map
      setTimeout(() => {
        navigate(`/jobs/${jobRes.job_id}`);
      }, 600);
    } catch (err: any) {
      console.error('Job submission failed:', err);
      setErrorMessage(err?.message || 'Upload or job dispatch failed. Please retry.');
      setUploadStep('idle');
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
            Analysis Dispatch
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          New Satellite Cloud-Mask Analysis
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Upload multispectral L1C or L2A GeoTIFF tiles to execute deep neural cloud/shadow segmentation and data-quality grading.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Preset Scenes Picker for Instant Testing */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Quick Test: Pre-Configured Benchmark Scenes
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Click any scene to pre-fill parameters
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_SAMPLE_SCENES.map((scene) => (
            <button
              key={scene.id}
              type="button"
              onClick={() => handlePresetSelect(scene)}
              className="text-left p-3 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {scene.sensor}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {scene.size_mb} MB
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 line-clamp-1 mb-1">
                  {scene.title}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {scene.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                <span>Expected Clarity:</span>
                <span className="font-mono text-emerald-400 font-bold">~{scene.expectedClarity}%</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Drag and Drop Upload Box */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-emerald-400" />
              <span>GeoTIFF Raster Upload</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Direct S3 Presigned Upload
            </span>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
                : selectedFile
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".tif,.tiff,.tar,.zip,.nc"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelected(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div className="font-semibold text-white text-sm">{selectedFile.name}</div>
                <div className="text-xs text-slate-400 font-mono">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for S3 dispatch
                </div>
                <span className="text-xs text-emerald-400 font-medium hover:underline mt-1">
                  Click or drag another file to replace
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6 text-slate-300" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-200">
                    Drag and drop your GeoTIFF or Cloud-Optimized GeoTIFF (COG)
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Supports .tif, .tiff, .jp2, .zip, .tar.gz (up to 4.5 GB)
                  </div>
                </div>
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
                >
                  Browse Local Files
                </button>
              </div>
            )}
          </div>

          {/* S3 Upload Progress Bar */}
          {uploadStep !== 'idle' && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {uploadStep === 'presigning' && 'Generating S3 Secure Presigned Key...'}
                  {uploadStep === 'uploading_s3' && 'Streaming Binary Raster to S3 Bucket...'}
                  {uploadStep === 'creating_job' && 'Enqueuing Inference Job with AI Engine...'}
                  {uploadStep === 'done' && 'Dispatch Complete! Redirecting to Live Viewer...'}
                </span>
                <span className="font-mono text-emerald-400 font-bold">{uploadProgress}%</span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sensor & Engine Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sensor Constellation Selector */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Satellite className="w-4 h-4 text-sky-400" />
              <span>Satellite Sensor Constellation</span>
            </label>
            <p className="text-xs text-slate-400">
              Select the sensor payload profile to tune radiometric atmospheric corrections.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Sentinel-2', desc: 'MSI (10m - 12 bands)' },
                { name: 'Landsat-8/9', desc: 'OLI/TIRS (30m)' },
                { name: 'PlanetScope', desc: 'SuperDove (3m 8-band)' },
                { name: 'WorldView-3', desc: 'Sub-meter (0.3m commercial)' },
              ].map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setSensor(item.name as SensorType)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    sensor === item.name
                      ? 'bg-sky-500/10 border-sky-500/50 text-white shadow-sm ring-1 ring-sky-500/30'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-xs text-white">{item.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Engine Selector */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>AI Cloud-Masking Engine</span>
            </label>
            <p className="text-xs text-slate-400">
              Choose between high-throughput fast spectral indexing or full foundation model transformer.
            </p>

            <div className="space-y-2">
              {/* Deep Engine */}
              <button
                type="button"
                onClick={() => setEngine('deep')}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  engine === 'deep'
                    ? 'bg-purple-500/10 border-purple-500/50 text-white shadow-sm ring-1 ring-purple-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                    <span>Deep Foundation Transformer</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                      Recommended
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-purple-400 font-bold">~45s</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  High-fidelity U-Net transformer model. Accurately disambiguates cirrus clouds from snow/ice and detects cloud cast shadows.
                </div>
              </button>

              {/* Fast Engine */}
              <button
                type="button"
                onClick={() => setEngine('fast')}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  engine === 'fast'
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-sm ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Fast ONNX Spectral Indexer</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">~8s</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Ultra-fast spectral thresholding for high-throughput batch pipelines. Optimized for quick screening.
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>FastAPI REST endpoint: POST /jobs</span>
          </div>

          <button
            type="submit"
            disabled={uploadStep !== 'idle' || !selectedFile}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm transition-all shadow-xl shadow-emerald-600/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>
              {uploadStep === 'idle'
                ? 'Launch Cloud-Mask Analysis'
                : 'Processing Pipeline...'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
