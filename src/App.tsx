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
  LogOut,
  MapPin,
  Share2,
  Calendar,
  Hash,
  Plus,
  Trash2
} from 'lucide-react';
import CameraCapture from './components/CameraCapture';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';

type AppState = 'INPUT_PERTAMA' | 'CAPTURE_PERTAMA' | 'INPUT_KEDUA' | 'CAPTURE_KEDUA' | 'REVIEW' | 'SIGNED';

export default function App() {
  const [step, setStep] = useState<AppState>('INPUT_PERTAMA');
  
  // Pihak Pertama State
  const [namesPertama, setNamesPertama] = useState<string[]>(['']);
  const [stNumber, setStNumber] = useState('');
  const [stDate, setStDate] = useState('');
  const [currentCaptureIndex, setCurrentCaptureIndex] = useState(0);

  // Pihak Kedua State
  const [namesKedua, setNamesKedua] = useState<string[]>(['']);
  const [agency, setAgency] = useState('');
  const [location, setLocation] = useState('Palembang');
  const [photosKedua, setPhotosKedua] = useState<(string | null)[]>([]);
  const [photosPertama, setPhotosPertama] = useState<(string | null)[]>([]);
  const [timestamp, setTimestamp] = useState('');
  const [certId, setCertId] = useState('');
  const [isExporting, setIsExporting] = useState(false);

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
    if (step === 'INPUT_PERTAMA') {
      if (namesPertama.some(n => !n) || !stNumber || !stDate) return;
      setStep('CAPTURE_PERTAMA');
      setCurrentCaptureIndex(0);
      setPhotosPertama(new Array(namesPertama.length).fill(null));
    } else if (step === 'CAPTURE_PERTAMA') {
      if (!photosPertama[currentCaptureIndex]) return;
      
      if (currentCaptureIndex < namesPertama.length - 1) {
        setCurrentCaptureIndex(prev => prev + 1);
      } else {
        setStep('INPUT_KEDUA');
      }
    } else if (step === 'INPUT_KEDUA') {
      if (namesKedua.some(n => !n) || !agency) return;
      setStep('CAPTURE_KEDUA');
      setCurrentCaptureIndex(0);
      setPhotosKedua(new Array(namesKedua.length).fill(null));
    } else if (step === 'CAPTURE_KEDUA') {
      if (!photosKedua[currentCaptureIndex]) return;
      
      if (currentCaptureIndex < namesKedua.length - 1) {
        setCurrentCaptureIndex(prev => prev + 1);
      } else {
        setStep('REVIEW');
      }
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
    setStep('INPUT_PERTAMA');
    setNamesKedua(['']);
    setAgency('');
    setNamesPertama(['']);
    setStNumber('');
    setStDate('');
    setCurrentCaptureIndex(0);
    setPhotosKedua([]);
    setPhotosPertama([]);
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

    // Header Section with Logo
    const logoUrl = '/kemenkeu-bw.png'; 
      
    // Helper to fetch and convert logo using Image element for better CORS handling
    const getBase64ImageFromUrl = (imageUrl: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.setAttribute('crossOrigin', 'anonymous');
        img.src = imageUrl;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          } else {
            reject(new Error('Canvas context failed'));
          }
        };
        img.onerror = () => reject(new Error('Image load failed'));
      });
    };

    try {
      const logoData = await getBase64ImageFromUrl(logoUrl);
      // Logo on the left, max width 150px (~40mm)
      // Maintaining aspect ratio (Kemenkeu logo is roughly square)
      doc.addImage(logoData, 'PNG', margin + 3, 12, 25, 25);
    } catch (e) {
      console.warn('Logo could not be loaded from primary URL, trying fallback', e);
      try {
        const fallbackUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Ministry_of_Finance_of_the_Republic_of_Indonesia_logo.svg/512px-Ministry_of_Finance_of_the_Republic_of_Indonesia_logo.svg.png';
        const logoData = await getBase64ImageFromUrl(fallbackUrl);
        doc.addImage(logoData, 'PNG', margin + 3, 12, 25, 25);
      } catch (e2) {
        console.warn('Fallback logo also failed', e2);
      }
    }

    // Header Text - Adjusted position to accommodate logo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    const headerX = pageWidth / 2 + 10;
    doc.text('KEMENTERIAN KEUANGAN REPUBLIK INDONESIA', headerX, 18, { align: 'center' });
    doc.text('DIREKTORAT JENDERAL KEKAYAAN NEGARA', headerX, 24, { align: 'center' });
    doc.setFontSize(9);
    doc.text('KANTOR WILAYAH DJKN SUMATERA SELATAN JAMBI DAN BANGKA BELITUNG', headerX, 29, { align: 'center' });
    doc.setFontSize(11);
    doc.text('KANTOR PELAYANAN KEKAYAAN NEGARA DAN LELANG', headerX, 35, { align: 'center' });
    doc.text('PALEMBANG', headerX, 41, { align: 'center' });

    // Address & Line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('GEDUNG KEUANGAN NEGARA (GKN) BLOK C LANTAI 1-2, JALAN KAPTEN A. RIVAI NOMOR 4 PALEMBANG', pageWidth / 2, 50, { align: 'center' });
    doc.text('TELEPON (0711) 352574; FAKSIMILE (0711) 350801; LAMAN www.djkn.kemenkeu.go.id', pageWidth / 2, 54, { align: 'center' });

    doc.setLineWidth(0.8);
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
    
    // Format ST date for Pasal 1 (e.g., 05 Mei 2026)
    const stObj = stDate ? new Date(stDate) : today;
    const stYear = stObj.getFullYear();
    const formattedStDateOnly = stObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const fullStNumber = `ST-${stNumber}/KNL.0402/${stYear}`;
    
    doc.text(`Pada hari ini, ${dateStr} kami yang bertandatangan di bawah ini:`, margin, y);
    y += 7;
    
    const formatPartyNames = (names: string[], org?: string) => {
      if (names.length === 0) return org ? org.toUpperCase() : '';
      const upperNames = names.map(n => n.toUpperCase());
      let namesDisplay = '';
      if (upperNames.length === 1) {
        namesDisplay = upperNames[0];
      } else {
        const allButLast = upperNames.slice(0, -1).join(', ');
        namesDisplay = `${allButLast} dan ${upperNames[upperNames.length - 1]}`;
      }
      return org ? `${namesDisplay} (${org.toUpperCase()})` : namesDisplay;
    };

    doc.setFont('helvetica', 'bold');
    const firstPartyDisplay = formatPartyNames(namesPertama, 'KPKNL PALEMBANG');
    doc.text(`1. ${firstPartyDisplay},`, margin, y, { maxWidth: contentWidth });
    doc.setFont('helvetica', 'normal');
    const p1Desc = "bertindak untuk dan atas nama Jabatan, selanjutnya disebut sebagai PIHAK PERTAMA;";
    const p1Lines = doc.splitTextToSize(p1Desc, contentWidth - 5);
    doc.text(p1Lines, margin + 5, y + 5);
    y += (p1Lines.length * 5) + 7;

    doc.setFont('helvetica', 'bold');
    const secondPartyDisplay = formatPartyNames(namesKedua, agency);
    doc.text(`2. ${secondPartyDisplay},`, margin, y, { maxWidth: contentWidth });
    doc.setFont('helvetica', 'normal');
    const p2Desc = `bertindak untuk dan atas nama sendiri / instansi, selanjutnya disebut sebagai PIHAK KEDUA.`;
    const p2Lines = doc.splitTextToSize(p2Desc, contentWidth - 5);
    doc.text(p2Lines, margin + 5, y + 5);
    y += (p2Lines.length * 5) + 9;

    const midText = "telah melakukan kesepakatan dalam suatu PAKTA INTEGRITAS berkenaan dengan pelaksanaan tugas di lingkungan Kementerian Keuangan oleh PIHAK KEDUA kepada PIHAK PERTAMA, dengan ketentuan sebagai berikut:";
    const splitMid = doc.splitTextToSize(midText, contentWidth);
    doc.text(splitMid, margin, y, { align: 'justify', maxWidth: contentWidth });
    y += (splitMid.length * 5) + 4;

    // Articles
    const articles = [
      { t: 'PASAL 1', c: `PIHAK PERTAMA menjalankan tugas sesuai Surat Tugas Kepala KPKNL Palembang Nomor ${fullStNumber} tanggal ${formattedStDateOnly} dengan menjunjung tinggi Nilai-Nilai Kementerian Keuangan, serta nilai independensi dan objektivitas.` },
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

    // Footer / Signature Proof Section
    let footerY = y;
    if (footerY > 210) { doc.addPage(); footerY = 20; }

    const sigY = footerY;
    const sigX = margin;
    const boxWidth = contentWidth;
    
    doc.setDrawColor(240, 240, 240);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(sigX, sigY, boxWidth, 38, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 58, 138); // Kemenkeu Navy
    doc.text('DITANDATANGANI SECARA DIGITAL', sigX + 5, sigY + 8);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    
    const signatories = [
      `PIHAK PERTAMA: ${formatPartyNames(namesPertama)}`,
      `PIHAK KEDUA: ${formatPartyNames(namesKedua)}`,
      `Waktu: ${timestamp}`,
      `ID Sertifikat: ${certId}`
    ];

    signatories.forEach((text, i) => {
      doc.text(text, sigX + 5, sigY + 14 + (i * 4.5), { maxWidth: boxWidth - 10 });
    });
    
    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);
    const biometrikY = sigY + 42;
    doc.text('Verifikasi Biometrik: Identitas telah diverifikasi melalui pengenalan wajah pada saat penandatanganan.', margin, biometrikY);
    doc.text('Dokumen ini sah dan terverifikasi secara elektronik melalui Sistem Biometrik Pakta Integritas KPKNL Palembang.', margin, biometrikY + 4);

    // Photos - Start well after the signature box and biometrik text
    y = biometrikY + 12; 

    const renderBottomPhotos = (photos: (string | null)[], names: string[], title: string) => {
      if (y > 230) { doc.addPage(); y = 20; }
      const photoWidth = 25;
      const photoHeight = 33;
      const spacing = 5;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(title, pageWidth / 2, y, { align: 'center' });
      y += 5;
      
      const rowWidth = (photoWidth * photos.length) + (spacing * (photos.length - 1));
      let startX = (pageWidth - rowWidth) / 2;
      
      photos.forEach((photo, idx) => {
        if (photo) {
          doc.addImage(photo, 'JPEG', startX, y, photoWidth, photoHeight);
          doc.setFontSize(6);
          doc.setFont('helvetica', 'normal');
          doc.text(names[idx] || '', startX + (photoWidth / 2), y + photoHeight + 3, { align: 'center', maxWidth: photoWidth });
        }
        startX += photoWidth + spacing;
      });
      
      y += photoHeight + 12;
    };

    renderBottomPhotos(photosPertama, namesPertama, 'FOTO PIHAK PERTAMA (KPKNL PALEMBANG)');
    renderBottomPhotos(photosKedua, namesKedua, `FOTO PIHAK KEDUA (${agency.toUpperCase()})`);

    return doc.output('blob');
  };

  const downloadPdf = async () => {
    setIsExporting(true);
    try {
      const blob = await generatePdfBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const participantName = namesKedua[0].replace(/\s+/g, '_');
      link.download = `Pakta_Integritas_${participantName}.pdf`;
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
      const participantName = namesKedua[0].replace(/\s+/g, '_');
      const file = new File([blob], `Pakta_Integritas_${participantName}.pdf`, { type: 'application/pdf' });
      
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
          {step === 'INPUT_PERTAMA' && (
            <motion.div
              key="step-input-pertama"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-2xl shadow-slate-200 border border-slate-100 space-y-8 sm:space-y-10 relative overflow-hidden">
                <div className="flex justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
                    <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-kemenkeu-navy" />
                  </div>
                </div>

                <div className="text-center space-y-2 sm:space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-kemenkeu-navy uppercase">
                    PAKTA INTEGRITAS ONLINE
                  </h2>
                  <p className="text-slate-400 text-[10px] sm:text-sm max-w-sm mx-auto uppercase tracking-widest font-bold">
                    Petugas KPKNL Palembang
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                         Daftar Nama Petugas (Pihak I)
                      </label>
                    </div>
                    
                    {namesPertama.map((name, index) => (
                      <div key={index} className="relative group flex gap-2 items-center">
                        <div className="relative flex-1 group">
                          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-kemenkeu-navy transition-colors">
                            <User className="w-5 h-5" />
                          </div>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                              const newNames = [...namesPertama];
                              newNames[index] = e.target.value;
                              setNamesPertama(newNames);
                            }}
                            placeholder={`Nama Petugas ${index + 1}`}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 sm:py-4 pl-12 pr-4 focus:bg-white focus:border-kemenkeu-navy focus:ring-4 focus:ring-kemenkeu-navy/5 outline-none transition-all text-slate-700 font-medium text-sm sm:text-base"
                          />
                        </div>
                        <div className="flex gap-2">
                          {namesPertama.length > 1 && (
                            <button 
                              onClick={() => {
                                const newNames = namesPertama.filter((_, i) => i !== index);
                                setNamesPertama(newNames);
                              }}
                              className="p-3 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 rounded-xl border border-slate-200"
                              title="Hapus"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                          {index === namesPertama.length - 1 && (
                            <button 
                              onClick={() => setNamesPertama([...namesPertama, ''])}
                              className="p-3 bg-amber-50 text-kemenkeu-navy border border-amber-200 rounded-xl hover:bg-amber-100 transition-all shadow-sm"
                              title="Tambah Petugas"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                       Nomor Surat Tugas (Hanya Angka)
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-kemenkeu-navy transition-colors">
                        <Hash className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        value={stNumber}
                        onChange={(e) => setStNumber(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="Contoh: 1234"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 sm:py-4 pl-12 pr-4 focus:bg-white focus:border-kemenkeu-navy focus:ring-4 focus:ring-kemenkeu-navy/5 outline-none transition-all text-slate-700 font-medium text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                       Tanggal Surat Tugas
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-kemenkeu-navy transition-colors">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <input
                        type="date"
                        value={stDate}
                        onChange={(e) => setStDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 sm:py-4 pl-12 pr-4 focus:bg-white focus:border-kemenkeu-navy focus:ring-4 focus:ring-kemenkeu-navy/5 outline-none transition-all text-slate-700 font-medium text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={namesPertama.some(n => !n) || !stNumber || !stDate}
                    className="w-full bg-kemenkeu-navy text-white rounded-xl py-4 sm:py-5 flex items-center justify-center gap-3 font-bold text-base sm:text-lg hover:shadow-2xl hover:shadow-kemenkeu-navy/20 transition-all disabled:opacity-30 disabled:grayscale"
                  >
                    Selanjutnya
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
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
                <h3 className="text-xl font-bold text-slate-800">Verifikasi Petugas ({currentCaptureIndex + 1}/{namesPertama.length})</h3>
                <p className="text-kemenkeu-navy font-bold text-lg uppercase tracking-tight">{namesPertama[currentCaptureIndex]}</p>
                <p className="text-slate-400 text-xs font-medium">Petugas ke-{currentCaptureIndex + 1} diharapkan melakukan verifikasi biometrik.</p>
              </div>

              <CameraCapture 
                key={`capture-pertama-${currentCaptureIndex}`}
                onCapture={(img) => {
                  const newPhotos = [...photosPertama];
                  newPhotos[currentCaptureIndex] = img;
                  setPhotosPertama(newPhotos);
                }} 
                savedImage={photosPertama[currentCaptureIndex]} 
              />

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    if (currentCaptureIndex > 0) {
                      setCurrentCaptureIndex(currentCaptureIndex - 1);
                    } else {
                      setStep('INPUT_PERTAMA');
                    }
                  }}
                  className="flex-1 px-8 py-4 rounded-xl bg-white border border-slate-200 font-bold hover:bg-slate-50 transition-colors text-slate-600 uppercase text-[10px] tracking-widest"
                >
                  {currentCaptureIndex > 0 ? 'Kembali ke Petugas Sebelumnya' : 'Kembali ke Input'}
                </button>
                <button
                  onClick={handleNext}
                  disabled={!photosPertama[currentCaptureIndex]}
                  className="flex-[2] bg-kemenkeu-navy text-white rounded-xl py-4 px-8 font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all disabled:opacity-20 shadow-lg shadow-kemenkeu-navy/10 uppercase text-[10px] tracking-widest"
                >
                  {currentCaptureIndex < namesPertama.length - 1 ? 'Lanjut ke Petugas Berikutnya' : 'Lanjut ke Data Stakeholder'}
                  <ArrowRight className="w-4 h-4 text-kemenkeu-gold" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'INPUT_KEDUA' && (
            <motion.div
              key="step-input-kedua"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-2xl shadow-slate-200 border border-slate-100 space-y-8 sm:space-y-10 relative overflow-hidden">
                <div className="flex justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-kemenkeu-navy" />
                  </div>
                </div>

                <div className="text-center space-y-2 sm:space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 uppercase">
                    INPUT DATA PIHAK KEDUA
                  </h2>
                  <p className="text-slate-400 text-[10px] sm:text-sm max-w-sm mx-auto uppercase tracking-widest font-bold">
                    Data Penerima Persetujuan / Stakeholder
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                         Daftar Nama Pihak Kedua (Penerima)
                      </label>
                    </div>
                    
                    {namesKedua.map((name, index) => (
                      <div key={index} className="relative group flex gap-2 items-center">
                        <div className="relative flex-1 group">
                          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-kemenkeu-navy transition-colors">
                            <User className="w-5 h-5" />
                          </div>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                              const newNames = [...namesKedua];
                              newNames[index] = e.target.value;
                              setNamesKedua(newNames);
                            }}
                            placeholder={`Nama Pihak Kedua ${index + 1}`}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 sm:py-4 pl-12 pr-4 focus:bg-white focus:border-kemenkeu-navy focus:ring-4 focus:ring-kemenkeu-navy/5 outline-none transition-all text-slate-700 font-medium text-sm sm:text-base"
                          />
                        </div>
                        <div className="flex gap-2">
                          {namesKedua.length > 1 && (
                            <button 
                              onClick={() => {
                                const newNames = namesKedua.filter((_, i) => i !== index);
                                setNamesKedua(newNames);
                              }}
                              className="p-3 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 rounded-xl border border-slate-200"
                              title="Hapus"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                          {index === namesKedua.length - 1 && (
                            <button 
                              onClick={() => setNamesKedua([...namesKedua, ''])}
                              className="p-3 bg-blue-50 text-kemenkeu-navy border border-blue-200 rounded-xl hover:bg-blue-100 transition-all shadow-sm"
                              title="Tambah Orang"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
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
                    disabled={namesKedua.some(n => !n) || !agency}
                    className="w-full bg-kemenkeu-navy text-white rounded-xl py-4 sm:py-5 flex items-center justify-center gap-3 font-bold text-base sm:text-lg hover:shadow-2xl hover:shadow-kemenkeu-navy/20 transition-all disabled:opacity-30 disabled:grayscale"
                  >
                    Selanjutnya
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
                <h3 className="text-xl font-bold text-slate-800">Verifikasi Pihak Kedua ({currentCaptureIndex + 1}/{namesKedua.length})</h3>
                <p className="text-kemenkeu-navy font-bold text-lg uppercase tracking-tight">{namesKedua[currentCaptureIndex]}</p>
                <p className="text-slate-400 text-xs font-medium">Pihak kedua ke-{currentCaptureIndex + 1} diharapkan melakukan verifikasi biometrik.</p>
              </div>

              <CameraCapture 
                key={`capture-kedua-${currentCaptureIndex}`}
                onCapture={(img) => {
                  const newPhotos = [...photosKedua];
                  newPhotos[currentCaptureIndex] = img;
                  setPhotosKedua(newPhotos);
                }} 
                savedImage={photosKedua[currentCaptureIndex]} 
              />

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    if (currentCaptureIndex > 0) {
                      setCurrentCaptureIndex(currentCaptureIndex - 1);
                    } else {
                      setStep('INPUT_KEDUA');
                    }
                  }}
                  className="flex-1 px-8 py-4 rounded-xl bg-white border border-slate-200 font-bold hover:bg-slate-50 transition-colors text-slate-600 uppercase text-[10px] tracking-widest"
                >
                  {currentCaptureIndex > 0 ? 'Kembali ke Orang Sebelumnya' : 'Kembali ke Data'}
                </button>
                <button
                  onClick={handleNext}
                  disabled={!photosKedua[currentCaptureIndex]}
                  className="flex-[2] bg-kemenkeu-navy text-white rounded-xl py-4 px-8 font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all disabled:opacity-20 shadow-lg shadow-kemenkeu-navy/10 uppercase text-[10px] tracking-widest"
                >
                  {currentCaptureIndex < namesKedua.length - 1 ? 'Lanjut ke Orang Berikutnya' : 'Lihat Konfirmasi Akhir'}
                  <ArrowRight className="w-4 h-4 text-kemenkeu-gold" />
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
                  <div className="space-y-10">
                    <p className="text-slate-400 italic text-[10px] sm:text-sm uppercase tracking-widest font-bold text-center">Identitas Keduabelah Pihak:</p>
                    
                    {/* Pihak I Section */}
                    <div className="space-y-6">
                      <div className="flex flex-col items-center gap-2 text-center">
                         <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-100">Pihak I</span>
                         <span className="text-sm sm:text-lg font-bold text-slate-900 border-b-2 border-kemenkeu-gold pb-1 px-4">
                            {namesPertama.length > 1 
                              ? namesPertama.slice(0, -1).map(n => n.toUpperCase()).join(', ') + ' dan ' + namesPertama[namesPertama.length - 1].toUpperCase()
                              : namesPertama[0].toUpperCase()
                            } (KPKNL PALEMBANG)
                          </span>
                      </div>
                      <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
                         {photosPertama.map((photo, idx) => (
                           <div key={idx} className="space-y-1 text-center w-[100px] sm:w-[130px]">
                              <div className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-slate-100 bg-slate-50 shadow-sm">
                                 {photo && <img src={photo} className="w-full h-full object-cover" alt={`Selfie Pihak I - ${idx + 1}`} />}
                              </div>
                              <span className="text-[8px] text-slate-400 font-bold uppercase truncate block w-full">{namesPertama[idx]}</span>
                           </div>
                         ))}
                      </div>
                    </div>

                    {/* Pihak II Section */}
                    <div className="space-y-6">
                      <div className="flex flex-col items-center gap-2 text-center">
                         <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Pihak II</span>
                         <span className="text-sm sm:text-lg font-bold text-slate-900 border-b-2 border-kemenkeu-navy pb-1 px-4 truncate max-w-full uppercase tracking-tight">
                           {namesKedua.length > 1 
                             ? namesKedua.slice(0, -1).map(n => n.toUpperCase()).join(', ') + ' dan ' + namesKedua[namesKedua.length - 1].toUpperCase()
                             : namesKedua[0].toUpperCase()
                           } ({agency})
                         </span>
                      </div>
                      <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
                         {photosKedua.map((photo, idx) => (
                           <div key={idx} className="space-y-1 text-center w-[100px] sm:w-[130px]">
                              <div className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-slate-100 bg-slate-50 shadow-sm">
                                 {photo && <img src={photo} className="w-full h-full object-cover" alt={`Selfie Pihak II - ${idx + 1}`} />}
                              </div>
                              <span className="text-[8px] text-slate-400 font-bold uppercase truncate block w-full">{namesKedua[idx]}</span>
                           </div>
                         ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 sm:space-y-8">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-lg uppercase tracking-wider border-b pb-2 text-center font-sans">Komitmen Bersama:</h3>
                    <div className="space-y-6 sm:space-y-8">
                       {[
                         { title: 'PASAL 1', text: `PIHAK PERTAMA menjalankan tugas sesuai Surat Tugas Kepala KPKNL Palembang Nomor ST-${stNumber}/KNL.0402/${stDate ? new Date(stDate).getFullYear() : new Date().getFullYear()} tanggal ${stDate ? new Date(stDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : ''} dengan menjunjung tinggi Nilai-Nilai Kementerian Keuangan, serta nilai independensi dan objektivitas.` },
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
                      { 
                        label: 'Penandatangan', 
                        value: namesKedua.length > 1 
                          ? namesKedua.map(n => n.toUpperCase()).join(', ')
                          : namesKedua[0].toUpperCase() 
                      },
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
