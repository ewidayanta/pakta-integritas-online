import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  User, 
  Building2, 
  ArrowRight, 
  RotateCcw, 
  Download,
  CheckCircle2,
  Lock,
  FileText,
  LogOut,
  MapPin,
  Share2
} from 'lucide-react';
import CameraCapture from './components/CameraCapture';
import Certificate from './components/Certificate';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';

type AppState = 'FORM' | 'CAPTURE_KEDUA' | 'CAPTURE_PERTAMA' | 'REVIEW' | 'SIGNED';

export default function App() {
  const [step, setStep] = useState<AppState>('FORM');
  const [name, setName] = useState('');
  const [agency, setAgency] = useState('');
  const [location, setLocation] = useState('Palembang');
  const [photoKedua, setPhotoKedua] = useState<string | null>(null);
  const [photoPertama, setPhotoPertama] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState('');
  const [certId, setCertId] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const generateCertId = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const year = new Date().getFullYear();
    return `${result}/${year}`;
  };

  const handleNext = () => {
    if (step === 'FORM') {
      if (!name || !agency) return;
      setStep('CAPTURE_KEDUA');
    } else if (step === 'CAPTURE_KEDUA') {
      if (!photoKedua) return;
      setStep('CAPTURE_PERTAMA');
    } else if (step === 'CAPTURE_PERTAMA') {
      if (!photoPertama) return;
      setStep('REVIEW');
    } else if (step === 'REVIEW') {
      setTimestamp(new Date().toLocaleString('id-ID', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        timeZoneName: 'short'
      }));
      setCertId(generateCertId());
      setStep('SIGNED');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1e3a8a', '#ffc000', '#ffffff']
      });
    }
  };

  const handleReset = () => {
    setStep('FORM');
    setName('');
    setAgency('');
    setPhotoKedua(null);
    setPhotoPertama(null);
  };

  const generatePdfBlob = async () => {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });

    const margin = 20;
    const pageWidth = 210;
    const contentWidth = pageWidth - (margin * 2);

    // Header Text - Using Helvetica (Arial equivalent)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('KEMENTERIAN KEUANGAN REPUBLIK INDONESIA', pageWidth / 2, 20, { align: 'center' });
    doc.text('DIREKTORAT JENDERAL KEKAYAAN NEGARA', pageWidth / 2, 26, { align: 'center' });
    doc.setFontSize(10);
    doc.text('KANTOR WILAYAH DJKN SUMATERA SELATAN, JAMBI, DAN LAMPUNG', pageWidth / 2, 32, { align: 'center' });
    doc.setFontSize(12);
    doc.text('KANTOR PELAYANAN KEKAYAAN NEGARA DAN LELANG', pageWidth / 2, 38, { align: 'center' });
    doc.text('PALEMBANG', pageWidth / 2, 44, { align: 'center' });

    // Address & Line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Jalan Kapten A. Rivai Nomor 4 Palembang 30121', pageWidth / 2, 49, { align: 'center' });
    doc.text('TELEPON (0711) 352574; FAKSIMILE (0711) 312847; LAMAN www.djkn.kemenkeu.go.id', pageWidth / 2, 53, { align: 'center' });

    doc.setLineWidth(0.6);
    doc.line(margin, 56, pageWidth - margin, 56);
    doc.setLineWidth(0.2);
    doc.line(margin, 57, pageWidth - margin, 57);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('PAKTA INTEGRITAS', pageWidth / 2, 70, { align: 'center' });

    // Intro
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const introText = "Dengan berlandaskan janji Aparatur Sipil Negara (ASN) bahwa seluruh ASN akan mentaati segala peraturan perundang-undangan yang berlaku dan melaksanakan tugas kedinasan yang dipercayakan dengan penuh pengabdian, kesadaran dan tanggung jawab, serta akan senantiasa menjunjung tinggi kehormatan negara, pemerintah dan martabat pegawai negeri, dengan senantiasa mengutamakan kepentingan negara daripada kepentingan sendiri, seseorang, atau golongan, yang semua dilandasi dengan sikap jujur, tertib, cermat, dan bersemangat untuk kepentingan Negara, serta menjunjung tinggi Nilai-Nilai Kementerian Keuangan.";
    const splitIntro = doc.splitTextToSize(introText, contentWidth);
    doc.text(splitIntro, margin, 80, { align: 'justify', maxWidth: contentWidth });

    let y = 80 + (splitIntro.length * 5) + 5;

    // Identity
    const today = new Date();
    const dateStr = today.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    doc.text(`Pada hari ini, ${dateStr} kami yang bertandatangan di bawah ini:`, margin, y);
    y += 7;
    
    doc.setFont('helvetica', 'bold');
    doc.text('1. KANTOR PELAYANAN KEKAYAAN NEGARA DAN LELANG (KPKNL) PALEMBANG,', margin, y);
    doc.setFont('helvetica', 'normal');
    const p1Desc = "bertindak untuk dan atas nama Jabatan, selanjutnya disebut sebagai PIHAK PERTAMA;";
    doc.text(p1Desc, margin + 5, y + 5, { maxWidth: contentWidth - 5 });
    y += 12;

    doc.setFont('helvetica', 'bold');
    doc.text(`2. ${name.toUpperCase()},`, margin, y);
    doc.setFont('helvetica', 'normal');
    const p2Desc = `bertindak untuk dan atas nama sendiri / instansi ${agency}, selanjutnya disebut sebagai PIHAK KEDUA.`;
    doc.text(p2Desc, margin + 5, y + 5, { maxWidth: contentWidth - 5 });
    y += 14;

    const midText = "telah melakukan kesepakatan dalam suatu PAKTA INTEGRITAS berkenaan dengan pelaksanaan tugas di lingkungan Kementerian Keuangan oleh PIHAK KEDUA kepada PIHAK PERTAMA, dengan ketentuan sebagai berikut:";
    const splitMid = doc.splitTextToSize(midText, contentWidth);
    doc.text(splitMid, margin, y, { align: 'justify', maxWidth: contentWidth });
    y += (splitMid.length * 5) + 4;

    // Articles
    const articles = [
      { t: 'PASAL 1', c: `PIHAK PERTAMA menjalankan tugas sesuai Surat Tugas Kepala KPKNL Palembang pada ${dateStr} dengan menjunjung tinggi Nilai-Nilai Kementerian Keuangan, serta nilai independensi dan objektivitas.` },
      { t: 'PASAL 2', c: 'PIHAK KEDUA sebagai pengguna jasa pada KPKNL Palembang akan memastikan bahwa pelaksanaan tugas oleh PIHAK PERTAMA telah sesuai dengan Standar Operating Prosedure (SOP) yang berlaku dan menjunjung tinggi nilai-nilai integritas.' },
      { t: 'PASAL 3', c: 'Dalam pelaksanaan tugas sebagaimana dimaksud dalam Pasal 1, PIHAK PERTAMA tidak akan meminta atau menerima uang, barang, dan/atau janji terkait dengan pelaksanaan tugasnya, dan fasilitas yang tidak ada hubungannya dengan pelaksanaan tugas kedinasan tersebut serta akan melaporkan pelaksanaan tugas secara tertulis kepada Kepala KPKNL Palembang.' },
      { t: 'PASAL 4', c: 'Dalam mendukung pelaksanaan tugas sebagaimana dimaksud dalam Pasal 2, PIHAK KEDUA tidak akan memberi atau menawarkan uang/barang, fasilitas, dan/atau janji yang terkait dengan pelaksanaan tugas PIHAK PERTAMA, serta akan melaporkan secara tertulis kepada atasan PIHAK PERTAMA apabila terjadi pelanggaran yang dilakukan PIHAK PERTAMA terhadap kewajiban pada Pasal 1, 2, dan 3.' },
      { t: 'PASAL 5', c: 'PIHAK PERTAMA akan dikenai sanksi berupa Hukuman Disiplin berdasarkan Peraturan Pemerintah Nomor 53 Tahun 2010, sanksi moral sesuai dengan Kode Etik Pegawai oleh Kepala KPKNL Palembang, dan/atau tuntutan ganti rugi/pidana berdasarkan ketentuan peraturan perundang-undangan yang berlaku apabila terbukti melakukan pelanggaran terhadap pasal-pasal tersebut di atas.' }
    ];

    articles.forEach(art => {
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.text(art.t, pageWidth / 2, y, { align: 'center' });
      y += 5;
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(art.c, contentWidth);
      doc.text(lines, margin, y, { align: 'justify', maxWidth: contentWidth });
      y += (lines.length * 5) + 6;
    });

    if (y > 250) { doc.addPage(); y = 20; }
    doc.text('Demikian kesepakatan ini kami buat untuk dapat dilaksanakan dan ditaati.', margin, y);
    y += 15;

    // Footer / Signature Proof
    if (photoKedua) {
      doc.addImage(photoKedua, 'JPEG', margin, y, 30, 40);
      doc.setFontSize(7);
      doc.text('Foto Pihak Kedua', margin, y + 43);
    }

    if (photoPertama) {
      doc.addImage(photoPertama, 'JPEG', margin + 35, y, 30, 40);
      doc.setFontSize(7);
      doc.text('Foto Pihak Pertama', margin + 35, y + 43);
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('DITANDATANGANI SECARA DIGITAL', margin + 70, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Pihak Pertama: KPKNL Palembang', margin + 70, y + 12);
    doc.text(`Pihak Kedua: ${name}`, margin + 70, y + 17);
    doc.text(`Waktu: ${timestamp}`, margin + 70, y + 22);
    doc.text(`ID Sertifikat: ${certId}`, margin + 70, y + 27);
    doc.text('Status: Terverifikasi Biometrik Ganda', margin + 70, y + 32);
    
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('Dokumen ini sah dan terverifikasi secara elektronik melalui Sistem Biometrik Pakta Integritas KPKNL Palembang.', margin, 275);

    return doc.output('blob');
  };

  const downloadPdf = async () => {
    setIsExporting(true);
    try {
      const blob = await generatePdfBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Pakta_Integritas_${name.replace(/\s+/g, '_')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const sharePdf = async () => {
    setIsExporting(true);
    try {
      const blob = await generatePdfBlob();
      const file = new File([blob], `Pakta_Integritas_${name.replace(/\s+/g, '_')}.pdf`, { type: 'application/pdf' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Pakta Integritas',
          text: 'Berikut adalah dokumen Pakta Integritas saya yang telah ditandatangani secara elektronik.'
        });
      } else {
        alert('Sharing files is not supported in this browser. Downloading instead.');
        downloadPdf();
      }
    } catch (err) {
      console.error('Failed to share PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-kemenkeu-navy selection:text-white font-sans text-slate-900">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-4 sm:px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-kemenkeu-navy rounded flex items-center justify-center text-white">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-kemenkeu-navy uppercase leading-none">KPKNL PALEMBANG</h1>
            </div>
          </div>
          
          <button className="bg-kemenkeu-navy text-white text-[10px] font-bold px-4 py-1.5 rounded uppercase tracking-wider hidden sm:block">
            E-SIGNATURE SYSTEM
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-16">
        <AnimatePresence mode="wait">
          {step === 'FORM' && (
            <motion.div
              key="step-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-2xl shadow-slate-200 border border-slate-100 space-y-8 sm:space-y-10 relative overflow-hidden">
                {/* Decorative Icon */}
                <div className="flex justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                    <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-kemenkeu-navy" />
                  </div>
                </div>

                <div className="text-center space-y-2 sm:space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 uppercase">
                    Data Pihak Kedua
                  </h2>
                  <p className="text-slate-400 text-[10px] sm:text-sm max-w-sm mx-auto uppercase tracking-widest font-bold">
                    Penerima Persetujuan / Stakeholder
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                       Nama Lengkap
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-kemenkeu-navy transition-colors">
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nama Lengkap Penandatangan"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 sm:py-4 pl-12 pr-4 focus:bg-white focus:border-kemenkeu-navy focus:ring-4 focus:ring-kemenkeu-navy/5 outline-none transition-all text-slate-700 font-medium text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                       Instansi / Satker
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-kemenkeu-navy transition-colors">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        value={agency}
                        onChange={(e) => setAgency(e.target.value)}
                        placeholder="Contoh: Instansi ABC"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 sm:py-4 pl-12 pr-4 focus:bg-white focus:border-kemenkeu-navy focus:ring-4 focus:ring-kemenkeu-navy/5 outline-none transition-all text-slate-700 font-medium text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={!name || !agency}
                    className="w-full bg-kemenkeu-navy text-white rounded-xl py-4 sm:py-5 flex items-center justify-center gap-3 font-bold text-base sm:text-lg hover:shadow-2xl hover:shadow-kemenkeu-navy/20 transition-all disabled:opacity-30 disabled:grayscale"
                  >
                    Mulai Verifikasi Wajah
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'CAPTURE_KEDUA' && (
            <motion.div
              key="step-capture-kedua"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl mx-auto space-y-6 sm:space-y-12 px-4"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
                  <User className="w-4 h-4 text-kemenkeu-navy" />
                  <span className="text-[10px] font-bold text-kemenkeu-navy uppercase tracking-widest">Selfie Pihak Kedua</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800">Verifikasi Wajah Stakeholder</h3>
                <p className="text-slate-400 text-xs font-medium">Pastikan wajah terlihat jelas dan berada di area frame.</p>
              </div>

              <CameraCapture onCapture={setPhotoKedua} savedImage={photoKedua} />

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setStep('FORM')}
                  className="flex-1 px-8 py-4 rounded-xl bg-white border border-slate-200 font-bold hover:bg-slate-50 transition-colors text-slate-600 uppercase text-[10px] tracking-widest"
                >
                  Kembali ke Data
                </button>
                <button
                  onClick={handleNext}
                  disabled={!photoKedua}
                  className="flex-[2] bg-kemenkeu-navy text-white rounded-xl py-4 px-8 font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all disabled:opacity-20 shadow-lg shadow-kemenkeu-navy/10 uppercase text-[10px] tracking-widest"
                >
                  Verifikasi Berikutnya
                  <ArrowRight className="w-4 h-4 text-kemenkeu-gold" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'CAPTURE_PERTAMA' && (
            <motion.div
              key="step-capture-pertama"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl mx-auto space-y-6 sm:space-y-12 px-4"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-100">
                  <Building2 className="w-4 h-4 text-kemenkeu-navy" />
                  <span className="text-[10px] font-bold text-kemenkeu-navy uppercase tracking-widest">Selfie Pihak Pertama</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800">Verifikasi Petugas KPKNL</h3>
                <p className="text-slate-400 text-xs font-medium">Petugas KPKNL diharapkan melakukan verifikasi biometrik.</p>
              </div>

              <CameraCapture onCapture={setPhotoPertama} savedImage={photoPertama} />

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setStep('CAPTURE_KEDUA')}
                  className="flex-1 px-8 py-4 rounded-xl bg-white border border-slate-200 font-bold hover:bg-slate-50 transition-colors text-slate-600 uppercase text-[10px] tracking-widest"
                >
                  Kembali ke Pihak Kedua
                </button>
                <button
                  onClick={handleNext}
                  disabled={!photoPertama}
                  className="flex-[2] bg-kemenkeu-navy text-white rounded-xl py-4 px-8 font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all disabled:opacity-20 shadow-lg shadow-kemenkeu-navy/10 uppercase text-[10px] tracking-widest"
                >
                  Lihat Konfirmasi Akhir
                  <CheckCircle2 className="w-4 h-4 text-kemenkeu-gold" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'REVIEW' && (
            <motion.div
              key="step-review"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto px-2 sm:px-4"
            >
              <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
                <div className="bg-kemenkeu-navy p-6 sm:p-10 text-center relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                     <ShieldCheck className="w-24 h-24 sm:w-32 sm:h-32 text-white" />
                   </div>
                   <h2 className="text-white text-xl sm:text-3xl font-bold tracking-widest uppercase mb-1 sm:mb-2">Pakta Integritas</h2>
                   <p className="text-blue-200 text-[10px] sm:text-xs font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase truncate px-4">{agency || 'KPKNL PALEMBANG'}</p>
                </div>
                
                <div className="p-6 sm:p-12 space-y-8 sm:space-y-10">
                  <div className="space-y-4">
                    <p className="text-slate-400 italic text-[10px] sm:text-sm uppercase tracking-widest font-bold text-center">Identitas Keduabelah Pihak:</p>
                    <div className="bg-slate-50/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-100 space-y-6">
                       <div className="flex flex-col items-center gap-2 text-center">
                          <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-100">Pihak I</span>
                          <span className="text-sm sm:text-lg font-bold text-slate-900 border-b-2 border-kemenkeu-gold pb-1 px-4">KPKNL PALEMBANG</span>
                       </div>
                       <div className="flex flex-col items-center gap-2 text-center">
                          <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Pihak II</span>
                          <span className="text-sm sm:text-lg font-bold text-slate-900 border-b-2 border-kemenkeu-navy pb-1 px-4 truncate max-w-full uppercase tracking-tight">{name} ({agency})</span>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selfie Pihak II</span>
                       <div className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-slate-100 bg-slate-50">
                          {photoKedua && <img src={photoKedua} className="w-full h-full object-cover" alt="Selfie Pihak II" />}
                       </div>
                    </div>
                    <div className="space-y-2">
                       <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selfie Pihak I</span>
                       <div className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-slate-100 bg-slate-50">
                          {photoPertama && <img src={photoPertama} className="w-full h-full object-cover" alt="Selfie Pihak I" />}
                       </div>
                    </div>
                  </div>

                  <div className="space-y-6 sm:space-y-8">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-lg uppercase tracking-wider border-b pb-2 text-center font-sans">Komitmen Bersama:</h3>
                    <div className="space-y-6 sm:space-y-8">
                       {[
                         { title: 'PASAL 1', text: `PIHAK PERTAMA menjalankan tugas sesuai Surat Tugas Kepala KPKNL Palembang pada ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} dengan menjunjung tinggi Nilai-Nilai Kementerian Keuangan, serta nilai independensi dan objektivitas.` },
                         { title: 'PASAL 2', text: 'PIHAK KEDUA sebagai pengguna jasa pada KPKNL Palembang akan memastikan bahwa pelaksanaan tugas oleh PIHAK PERTAMA telah sesuai dengan Standar Operating Prosedure (SOP) yang berlaku dan menjunjung tinggi nilai-nilai integritas.' },
                         { title: 'PASAL 3', text: 'Dalam pelaksanaan tugas sebagaimana dimaksud dalam Pasal 1, Pihak Pertama tidak akan meminta atau menerima uang, barang, dan/atau janji terkait dengan pelaksanaan tugasnya.' },
                         { title: 'PASAL 4', text: 'Dalam mendukung pelaksanaan tugas sebagaimana dimaksud dalam Pasal 2, Pihak Kedua tidak akan memberi atau menawarkan uang/barang, fasilitas, dan/atau janji.' },
                         { title: 'PASAL 5', text: 'Sanksi berupa Hukuman Disiplin, sanksi moral sesuai Kode Etik, dan/atau tuntutan pidana apabila terbukti melakukan pelanggaran.' }
                       ].map((art, i) => (
                         <div key={i} className="flex flex-col items-center gap-2 text-center">
                            <span className="inline-flex px-3 py-1 bg-blue-50 text-kemenkeu-navy rounded-full text-[8px] sm:text-[10px] font-bold uppercase tracking-widest border border-blue-100">{art.title}</span>
                            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-serif max-w-lg mx-auto">{art.text}</p>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="bg-amber-50 border-l-4 border-kemenkeu-gold p-4 sm:p-6 rounded-r-xl">
                    <p className="text-kemenkeu-navy italic text-[10px] sm:text-sm leading-relaxed font-bold uppercase tracking-wide">
                      "Dengan konfirmasi ini, PIHAK KEDUA telah melakukan kesepakatan dalam suatu PAKTA INTEGRITAS sesuai yang tercantum dalam komitmen bersama diatas"
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setStep('CAPTURE_PERTAMA')}
                      className="flex-1 px-8 py-4 sm:py-5 rounded-xl border border-slate-200 bg-white font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-[10px] sm:text-sm uppercase tracking-widest text-slate-600"
                    >
                      <RotateCcw className="w-4 h-4" /> Ulangi Selfie
                    </button>
                    <button
                      onClick={handleNext}
                      className="flex-[2] bg-kemenkeu-navy text-white rounded-xl py-4 sm:py-5 px-8 font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-lg text-[10px] sm:text-sm uppercase tracking-[0.2em]"
                    >
                      Konfirmasi & Tanda Tangan
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {step === 'SIGNED' && (
            <motion.div
              key="step-signed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto space-y-8 sm:space-y-12"
            >
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-50 rounded-full border-2 border-green-200 flex items-center justify-center mx-auto mb-4 sm:mb-6 text-green-500">
                  <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-800">Persetujuan Terverifikasi</h2>
                <p className="text-slate-400 text-xs sm:text-sm">Pernyataan komitmen telah ditandatangani secara elektronik</p>
              </div>

              <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col mx-auto w-full max-w-2xl">
                <div className="bg-kemenkeu-navy p-4 sm:p-6 flex items-center justify-between px-6 sm:px-10">
                   <div className="flex items-center gap-2 sm:gap-3 text-white">
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-kemenkeu-gold" />
                      <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-widest">E-Signature Valid</span>
                   </div>
                   <div className="bg-blue-800/50 backdrop-blur-sm text-[8px] sm:text-[9px] text-blue-100 font-bold px-2 sm:px-3 py-1 rounded-full border border-blue-700/50 uppercase">Verified</div>
                </div>
                
                <div className="p-6 sm:p-10 space-y-6 sm:space-y-8">
                  <div className="space-y-4 sm:space-y-6">
                    {[
                      { label: 'Id Sertifikat', value: certId, mono: true },
                      { label: 'Penandatangan', value: name },
                      { label: 'Instansi / Satker', value: agency },
                      { label: 'Waktu Persetujuan', value: timestamp }
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-50 pb-3 sm:pb-4 gap-1 sm:gap-4">
                        <span className="text-slate-400 uppercase text-[8px] sm:text-[10px] font-bold tracking-widest">{item.label}</span>
                        <span className={`text-slate-800 font-bold text-sm sm:text-base ${item.mono ? 'font-mono text-kemenkeu-navy truncate max-w-full' : 'break-words'}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 sm:p-8 rounded-2xl flex flex-col items-center gap-2 sm:gap-4 text-center">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-bold uppercase tracking-widest text-[10px] sm:text-xs">Agreement Recorded</span>
                    </div>
                    <p className="text-[8px] sm:text-[10px] text-slate-400 leading-relaxed uppercase tracking-widest max-w-xs sm:max-w-[500px]">
                      Pernyataan persetujuan ini sah secara hukum dan telah terekam dalam sistem digital
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto px-2">
                <button
                  onClick={handleReset}
                  className="px-6 py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-black transition-all order-3 sm:order-none"
                >
                  <LogOut className="w-4 h-4" /> Keluar
                </button>
                <button
                  onClick={downloadPdf}
                  disabled={isExporting}
                  className="px-6 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
                >
                  {isExporting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-kemenkeu-navy" />}
                  Download PDF
                </button>
                <button
                  onClick={sharePdf}
                  disabled={isExporting}
                  className="px-6 py-4 bg-kemenkeu-navy text-white rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-kemenkeu-navy/20 disabled:opacity-50 group sm:col-span-2 md:col-span-1"
                >
                  {isExporting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4 text-kemenkeu-gold group-hover:scale-110 transition-transform" />}
                  Share Dokumen
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Branding */}
      <footer className="py-12 px-6 bg-transparent">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">KPKNL PALEMBANG</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Jl. Kapten A. Rivai No.4, Palembang</p>
        </div>
      </footer>
    </div>
  );
}
