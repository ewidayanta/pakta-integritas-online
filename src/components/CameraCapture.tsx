import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CameraCaptureProps {
  onCapture: (image: string) => void;
  savedImage?: string | null;
}

export default function CameraCapture({ onCapture, savedImage }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!savedImage) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [savedImage]);

  const startCamera = async () => {
    try {
      const constraints = {
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setIsReady(true);
      setError(null);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Gagal mengakses kamera. Pastikan izin kamera telah diberikan.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(dataUrl);
        stopCamera();
      }
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-4">
      <div className="relative aspect-square bg-slate-900 rounded-3xl overflow-hidden border-4 border-white shadow-2xl shadow-slate-200">
        <AnimatePresence mode="wait">
          {savedImage ? (
            <motion.img
              key="captured"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              src={savedImage}
              alt="Selfie Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <motion.div
              key="video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full relative"
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              
              {/* Selfie Frame Guide */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                 <div className="w-[80%] h-[80%] border-2 border-white/30 border-dashed rounded-full" />
              </div>
              
              {!isReady && !error && (
                <div className="absolute inset-0 flex items-center justify-center text-white bg-slate-900/50 backdrop-blur-sm">
                  <RefreshCw className="w-8 h-8 animate-spin text-kemenkeu-gold" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute top-4 right-4 z-10">
          <div className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest backdrop-blur-md border ${savedImage ? 'bg-green-500/20 text-green-200 border-green-500/30' : 'bg-kemenkeu-navy/40 text-white border-white/20'}`}>
            {savedImage ? 'Verified' : 'Live Feed'}
          </div>
        </div>

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-red-900/80 p-6 text-center space-y-2">
            <AlertCircle className="w-10 h-10" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex justify-center gap-3 px-1">
        {!savedImage ? (
          <button
            onClick={capturePhoto}
            disabled={!isReady}
            className="flex items-center gap-2 px-6 py-4 bg-kemenkeu-navy text-white rounded-xl font-bold transition-all hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            id="btn-capture"
          >
            <Camera className="w-5 h-5 text-kemenkeu-gold" />
            Ambil Selfie
          </button>
        ) : (
          <button
            onClick={() => {
              onCapture('');
              setTimeout(startCamera, 100);
            }}
            className="flex items-center gap-2 px-6 py-4 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold transition-all hover:bg-slate-50 shadow-sm"
            id="btn-retake"
          >
            <RefreshCw className="w-5 h-5 text-kemenkeu-navy" />
            Ulang Foto
          </button>
        )}
      </div>
      
      {!savedImage && isReady && (
        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Posisikan wajah di tengah area kamera
        </p>
      )}
    </div>
  );
}
