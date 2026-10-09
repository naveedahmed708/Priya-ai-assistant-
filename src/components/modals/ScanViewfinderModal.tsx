import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Camera,
  RefreshCw,
  Sparkles,
  Volume2,
  Upload,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Eye
} from 'lucide-react';
import { PriyaPermissionManager } from '../../services/permissionManager';
import { audioEngineInstance } from '../../services/audioEngine';

interface ScanViewfinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyzeFrame?: (imageDataUrl: string) => void;
}

export const ScanViewfinderModal: React.FC<ScanViewfinderModalProps> = ({
  isOpen,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [lastAudioBase64, setLastAudioBase64] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setAnalysisResult(null);
      setLastAudioBase64(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const pm = PriyaPermissionManager.getInstance();
      const granted = await pm.requestCamera();
      if (!granted) {
        setCameraError('Camera permission is required to scan objects with Priya.');
        return;
      }

      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setStream(media);
      if (videoRef.current) {
        videoRef.current.srcObject = media;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError('Unable to access camera hardware. Try enabling camera permission or upload a photo.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
      await runImageAnalysis(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCapturedImage(dataUrl);
        stopCamera();
        await runImageAnalysis(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const runImageAnalysis = async (imageDataUrl: string, prompt = '') => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageDataUrl,
          userPrompt: prompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Vision analysis failed');
      }

      const data = await response.json();
      setAnalysisResult(data.analysisText);
      setLastAudioBase64(data.audioBase64 || null);

      // Immediately vocalize the visual analysis via Priya audio engine
      if (data.audioBase64) {
        await audioEngineInstance.playAudioBase64(data.audioBase64);
      } else {
        await audioEngineInstance.speakFallback(data.analysisText);
      }
    } catch (err: any) {
      console.error('Error analyzing image:', err);
      const fallbackMsg = 'Main is object ko theek se analyze nahi kar paayi. Kripya thodi roshni mein dobara capture karein.';
      setAnalysisResult(fallbackMsg);
      audioEngineInstance.speakFallback(fallbackMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuery.trim() || !capturedImage || isFollowUpLoading) return;

    setIsFollowUpLoading(true);
    const q = followUpQuery.trim();
    setFollowUpQuery('');

    try {
      await runImageAnalysis(capturedImage, q);
    } finally {
      setIsFollowUpLoading(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setLastAudioBase64(null);
    startCamera();
  };

  const handlePlayVoiceAgain = () => {
    if (lastAudioBase64) {
      audioEngineInstance.playAudioBase64(lastAudioBase64);
    } else if (analysisResult) {
      audioEngineInstance.speakFallback(analysisResult);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between font-sans animate-in fade-in">
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Top Bar */}
      <div className="p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-mono font-bold tracking-widest text-cyan-300">
            PRIYA AI VISION
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Viewfinder / Captured Frame View */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-[#060a12]">
        {capturedImage ? (
          // Captured Preview with Laser Grid
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={capturedImage}
              alt="Scanned Object"
              className="w-full h-full object-contain"
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-4" />
                <div className="px-4 py-2 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-mono tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>ANALYZING WITH GEMINI VISION...</span>
                </div>
              </div>
            )}
          </div>
        ) : cameraError ? (
          // Camera Error View with Photo Upload Fallback
          <div className="p-6 text-center max-w-xs text-white">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
            <h4 className="font-bold text-base mb-1">Camera Unavailable</h4>
            <p className="text-xs text-gray-400 mb-5">{cameraError}</p>

            <div className="space-y-2.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold flex items-center justify-center gap-2 text-white shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Choose Photo to Analyze</span>
              </button>

              <button
                onClick={startCamera}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 text-xs font-semibold text-gray-300 hover:bg-white/15"
              >
                Retry Camera
              </button>
            </div>
          </div>
        ) : (
          // Live Video Feed with Futuristic HUD Reticle
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Futuristic Scanning Reticle */}
            <div className="relative w-64 h-64 border border-cyan-400/40 rounded-3xl flex items-center justify-center pointer-events-none shadow-[0_0_30px_rgba(34,211,238,0.15)]">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl-xl" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr-xl" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl-xl" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br-xl" />

              {/* Sweeping laser line */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

              <span className="absolute bottom-3 text-[10px] font-mono font-bold text-cyan-300 tracking-widest uppercase">
                POINT AT ANY OBJECT
              </span>
            </div>
          </>
        )}
      </div>

      {/* Analysis Result Card or Camera Capture Controls */}
      {capturedImage && analysisResult ? (
        // Results Card
        <div className="p-4 sm:p-5 bg-[#0a1122]/95 border-t border-cyan-500/30 backdrop-blur-xl z-20 animate-in slide-in-from-bottom duration-300 max-h-[48vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300">
                <Eye className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-bold text-cyan-300 tracking-wider">
                PRIYA&apos;S ANALYSIS
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePlayVoiceAgain}
                className="p-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-cyan-300 text-xs flex items-center gap-1 active:scale-95 transition-all"
                title="Listen to Priya speak"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Hear</span>
              </button>

              <button
                onClick={handleRetake}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-gray-300 font-medium active:scale-95 transition-all"
              >
                Scan Another
              </button>
            </div>
          </div>

          {/* Description Text */}
          <div className="p-3.5 rounded-2xl bg-[#0f1930] border border-white/5 text-gray-200 text-xs leading-relaxed mb-3">
            <p className="whitespace-pre-line">{analysisResult}</p>
          </div>

          {/* Follow-up question form */}
          <form onSubmit={handleFollowUpSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={followUpQuery}
              onChange={(e) => setFollowUpQuery(e.target.value)}
              placeholder="Ask Priya a question about this object..."
              disabled={isFollowUpLoading}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#080d19] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={!followUpQuery.trim() || isFollowUpLoading}
              className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white flex items-center justify-center transition-all flex-shrink-0"
            >
              {isFollowUpLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      ) : (
        // Standard Viewfinder Controls
        <div className="p-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex items-center justify-between px-8 z-20">
          {/* Gallery Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
            title="Upload photo from device"
          >
            <Upload className="w-5 h-5 text-gray-300" />
            <span className="text-[9px] text-gray-400">Upload</span>
          </button>

          {/* Big Shutter Shutter Button */}
          <button
            onClick={handleCapture}
            disabled={Boolean(cameraError) || isAnalyzing}
            className="w-18 h-18 rounded-full border-4 border-white/80 p-1 flex items-center justify-center hover:scale-105 active:scale-90 transition-all disabled:opacity-40 shadow-2xl shadow-cyan-500/30"
          >
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center">
              {isAnalyzing ? (
                <RefreshCw className="w-7 h-7 text-black animate-spin" />
              ) : (
                <Camera className="w-7 h-7 text-black stroke-[2.2]" />
              )}
            </div>
          </button>

          {/* Help Tip Button */}
          <div className="w-12 h-12 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-cyan-300 font-mono">GEMINI</span>
            <span className="text-[9px] text-gray-400">Vision</span>
          </div>
        </div>
      )}
    </div>
  );
};
