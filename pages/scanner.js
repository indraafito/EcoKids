import { useCallback, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import withAuth from "../utils/withAuth";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useToast } from "../context/ToastContext";
import { Camera, CheckCircle, Info, RotateCcw, Sparkles, Upload, VideoOff } from 'lucide-react';

function ScannerPage() {
  const { addToast } = useToast();
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('scan.jpg');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
    setCameraStarting(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const attachStreamToVideo = async (stream) => {
    if (!videoRef.current) return;

    videoRef.current.srcObject = stream;
    await videoRef.current.play();
  };

  const startCamera = async () => {
    setResult(null);
    setPhoto(null);
    setCameraError('');
    setCameraStarting(true);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStarting(false);
      setCameraError('Browser belum mendukung kamera. Gunakan upload file.');
      addToast({ message: 'Browser belum mendukung kamera, gunakan upload file.', type: 'error' });
      return;
    }

    stopCamera();
    setCameraStarting(true);
    setCameraActive(true);

    window.requestAnimationFrame(async () => {
      try {
        let stream;

        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        streamRef.current = stream;
        await attachStreamToVideo(stream);
        setCameraStarting(false);
        addToast({ message: 'Kamera aktif! Arahkan ke objek sampah.', type: 'info' });
      } catch (err) {
        console.error("Camera access error:", err);
        stopCamera();
        setCameraError('Kamera tidak bisa dibuka. Izinkan akses kamera di browser, atau gunakan upload file.');
        addToast({ message: 'Gagal mengakses kamera, silakan gunakan upload file.', type: 'error' });
      }
    });
  };

  // Capture Photo
  const capturePhoto = () => {
    if (!videoRef.current || !streamRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/jpeg');
    setPhoto(dataUrl);
    setSelectedFileName('camera-scan.jpg');
    stopCamera();
    
    runAiDetection(dataUrl, 'camera-scan.jpg');
  };

  // Fallback file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast({ message: 'Ukuran file terlalu besar (maksimal 5MB)', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setPhoto(dataUrl);
      setSelectedFileName(file.name || 'upload-scan.jpg');
      stopCamera();
      runAiDetection(dataUrl, file.name || 'upload-scan.jpg');
    };
    reader.readAsDataURL(file);
  };

  const runAiDetection = async (imageDataUrl, fileName) => {
    setLoading(true);
    setResult(null);
    try {
      const uploadData = await uploadImage(imageDataUrl, fileName);
      const detectionResult = await classifyUploadedImage(uploadData.url, fileName);
      setResult(detectionResult);
      addToast({ message: `Ditemukan: ${detectionResult.wasteName}!`, type: 'success' });

      await saveScanToServer(uploadData.url, detectionResult);

    } catch (err) {
      console.error(err);
      addToast({ message: 'Gagal menganalisis gambar', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (base64Image, fileName) => {
    setUploadProgress(true);
    const resBlob = await fetch(base64Image);
    const blob = await resBlob.blob();

    const formData = new FormData();
    formData.append('file', blob, fileName || selectedFileName);

    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    const uploadData = await uploadRes.json();

    if (!uploadRes.ok) {
      throw new Error(uploadData.error || 'Upload error');
    }

    return uploadData;
  };

  const classifyUploadedImage = async (imageUrl, fileName) => {
    const classifyRes = await fetch('/api/classify-scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl, fileName }),
    });
    const classifyData = await classifyRes.json();

    if (!classifyRes.ok) {
      throw new Error(classifyData.error || 'Classification error');
    }

    return classifyData;
  };

  const saveScanToServer = async (imageUrl, detection) => {
    try {
      const saveRes = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          wasteType: detection.wasteType,
          wasteName: detection.wasteName,
          confidence: detection.confidence,
          explanation: detection.explanation,
          recommendation: detection.recommendation
        })
      });

      if (saveRes.ok) {
        addToast({ message: 'Riwayat scan berhasil disimpan di akunmu!', type: 'success' });
      } else {
        throw new Error('Gagal mencatat riwayat scan');
      }

    } catch (err) {
      console.error(err);
      addToast({ message: 'Peringatan: Gagal menyimpan data scan secara permanen.', type: 'error' });
    } finally {
      setUploadProgress(false);
    }
  };

  return (
    <>
      <Head>
        <title>Scanner AI | Smart EcoKids</title>
      </Head>

      <div className="max-w-xl mx-auto space-y-6 select-none">
        <div>
          <h2 className="text-3xl font-nunito font-extrabold text-primary-dark">
            Scanner AI Sampah
          </h2>
          <p className="text-sm font-nunito font-bold text-primary">
            Deteksi jenis sampah sekitarmu secara instan dengan kecerdasan buatan.
          </p>
        </div>

        {/* Camera / Photo Frame */}
        <Card className="p-4 overflow-hidden bg-white relative border-3 border-primary-bg">
          
          {/* Active Camera View */}
          {cameraActive && (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              {/* Target Aim Scanner Graphic */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-4 border-dashed border-primary-hover rounded-3xl opacity-70 animate-pulse" />
              </div>
            </div>
          )}

          {/* Static Image / Capture Preview */}
          {!cameraActive && photo && (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
              <Image
                src={photo}
                alt="Preview scan"
                fill
                sizes="(min-width: 640px) 576px, 100vw"
                unoptimized
                className="object-contain"
              />
              
              {/* Scan laser animation during loading */}
              {loading && (
                <div className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-primary-hover to-transparent animate-bounce top-1/2" />
              )}
            </div>
          )}

          {/* Empty State placeholder */}
          {!cameraActive && !photo && (
            <div className="aspect-video rounded-xl bg-primary-bg/20 border-2 border-dashed border-primary-bg/50 flex flex-col items-center justify-center text-center p-6">
              {cameraError ? (
                <VideoOff className="w-12 h-12 text-rose-400 mb-2" />
              ) : (
                <Camera className="w-12 h-12 text-primary-dark/30 mb-2" />
              )}
              <p className="font-nunito font-bold text-sm text-primary-dark/70">
                {cameraError || 'Kamera belum diaktifkan'}
              </p>
              <p className="text-xs text-gray-400 max-w-xs mt-1">
                Gunakan kamera langsung atau unggah foto sampah untuk dianalisis oleh Eco.
              </p>
            </div>
          )}

          {/* Controls Bar */}
          <div className="flex flex-wrap gap-3 justify-center mt-4">
            {!cameraActive ? (
              <Button onClick={startCamera} variant="primary" disabled={loading || cameraStarting} className="flex items-center gap-2">
                {cameraStarting ? <LoadingSpinner size="sm" /> : <Camera className="w-5 h-5" />}
                {cameraStarting ? 'Membuka Kamera...' : 'Aktifkan Kamera'}
              </Button>
            ) : (
              <Button onClick={capturePhoto} variant="primary" disabled={cameraStarting} className="bg-primary-hover hover:bg-primary flex items-center gap-2 border-none">
                <Camera className="w-5 h-5" />
                Ambil Foto
              </Button>
            )}

            {cameraActive && (
              <Button onClick={stopCamera} variant="secondary" className="flex items-center gap-2">
                <VideoOff className="w-5 h-5" />
                Tutup Kamera
              </Button>
            )}

            <label className="bg-white text-primary border-3 border-primary-bg border-b-6 border-primary-hover/50 hover:bg-primary-bg/10 rounded-2xl py-3 px-6 font-nunito font-extrabold text-lg transition-all active:scale-95 shadow-sm cursor-pointer flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Pilih File
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload}
                disabled={loading}
                className="hidden" 
              />
            </label>

            {photo && !loading && (
              <Button onClick={() => runAiDetection(photo, selectedFileName)} variant="secondary" className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                Analisis Ulang
              </Button>
            )}
          </div>
        </Card>

        {/* AI Loading indicator */}
        {loading && (
          <Card className="p-6 flex flex-col items-center justify-center text-center space-y-4">
            <LoadingSpinner size="lg" />
            <div>
              <p className="font-nunito font-bold text-base text-primary-dark animate-pulse">
                Eco sedang menganalisis objek...
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Mengunggah gambar dan membaca objek utama pada foto.
              </p>
            </div>
          </Card>
        )}

        {/* Detection Result display */}
        {result && (
          <Card className="p-6 space-y-5 animate-fade-in border-3 border-primary-hover/35 shadow-lg">
            
            {/* Top Name Badge */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-nunito font-bold text-primary uppercase tracking-widest block mb-1">
                  Hasil Analisis AI
                </span>
                <h3 className="text-2xl font-nunito font-black text-primary-dark">
                  {result.wasteName}
                </h3>
              </div>
              <Badge color={result.wasteType === 'organic' ? 'organic' : 'inorganic'}>
                {result.wasteType === 'organic' ? 'Organik' : 'Anorganik'}
              </Badge>
            </div>

            {/* Match Rating */}
            <div className="flex items-center gap-2 bg-primary-bg/20 border border-primary-bg/50 rounded-2xl p-3.5">
              <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <span className="text-sm font-nunito font-extrabold text-primary-dark">
                  Tingkat Akurasi: <span className="text-primary">{result.confidence}%</span>
                </span>
            </div>

            {result.source !== 'gemini-vision' && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
                Model visual belum aktif di server. Tambahkan `GEMINI_API_KEY` di `.env.local` agar hasil analisis benar-benar membaca isi gambar.
              </div>
            )}

            {/* Explanations & Advice */}
            <div className="space-y-4 font-sans text-sm leading-relaxed text-gray-700">
              <div className="space-y-1">
                <h4 className="font-nunito font-bold text-sm text-primary-dark flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-primary" />
                  Penjelasan Sampah
                </h4>
                <p className="pl-5.5 text-gray-600">{result.explanation}</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-nunito font-bold text-sm text-primary-hover flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-primary-hover" />
                  Rekomendasi Daur Ulang
                </h4>
                <p className="pl-5.5 text-gray-600">{result.recommendation}</p>
              </div>
            </div>

            {uploadProgress && (
              <div className="flex items-center justify-center gap-2 text-xs font-nunito font-bold text-gray-400 pt-2 animate-pulse border-t border-gray-100">
                <LoadingSpinner size="sm" />
                Sedang menyimpan riwayat ke awan...
              </div>
            )}
          </Card>
        )}
      </div>
    </>
  );
}

// Disable SSR for WebCam/navigator.mediaDevices support
const ScannerPageNoSSR = dynamic(() => Promise.resolve(ScannerPage), {
  ssr: false
});

export default withAuth(ScannerPageNoSSR, { requiredRole: "siswa" });
