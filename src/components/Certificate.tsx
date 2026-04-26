import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface CertificateProps {
  data: {
    name: string;
    agency: string;
    photo: string;
    timestamp: string;
  };
  exportRef: React.RefObject<HTMLDivElement>;
}

export default function Certificate({ data, exportRef }: CertificateProps) {
  return (
    <div className="w-full max-w-3xl mx-auto py-4 sm:py-8">
      <div
        ref={exportRef}
        className="relative min-h-[1000px] w-full bg-white shadow-2xl flex flex-col items-center overflow-hidden border border-slate-100"
      >
        {/* Header Ribbon */}
        <div className="w-full bg-kemenkeu-navy p-12 text-center relative">
           <div className="absolute top-0 right-0 p-6 opacity-10">
              <ShieldCheck className="w-40 h-40 text-white" />
           </div>
           <h1 className="text-white text-4xl font-bold tracking-[0.2em] uppercase mb-2">Pakta Integritas</h1>
           <p className="text-blue-200 text-sm font-bold tracking-widest uppercase">{data.agency || 'KPKNL PALEMBANG'}</p>
        </div>

        <div className="p-12 sm:p-20 w-full space-y-16">
          {/* Statement Start */}
          <p className="text-slate-500 italic font-serif text-lg">Saya yang bertanda tangan di bawah ini:</p>

          {/* User Data Box */}
          <div className="bg-slate-50/50 rounded-3xl p-10 border border-slate-100 space-y-6">
            <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
               <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nama</span>
               <span className="text-2xl font-bold text-slate-900">: {data.name || '---'}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
               <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Instansi</span>
               <span className="text-2xl font-bold text-slate-900">: {data.agency || '---'}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
               <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Lokasi</span>
               <span className="text-2xl font-bold text-slate-900">: Palembang</span>
            </div>
          </div>

          {/* Commitment Section */}
          <div className="space-y-8">
            <h3 className="font-bold text-slate-900 text-xl font-serif">Menyatakan setuju dan berkomitmen penuh untuk:</h3>
            <ul className="space-y-6">
               {[
                 'Menjaga integritas, kejujuran, dan transparansi dalam pelaksanaan tugas.',
                 'Tidak menerima atau memberi imbalan/gratifikasi dalam bentuk apa pun.',
                 'Memberikan pelayanan terbaik sesuai nilai-nilai Kementerian Keuangan.',
                 'Menjaga kerahasiaan negara dan mencegah segala praktik KKN.'
               ].map((point, i) => (
                 <li key={i} className="flex gap-6 items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-50 text-kemenkeu-navy flex items-center justify-center rounded-full text-sm font-bold border border-blue-100">{i+1}</span>
                    <p className="text-slate-700 leading-relaxed font-serif text-lg">{point}</p>
                 </li>
               ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="bg-blue-50 border-l-8 border-kemenkeu-navy p-8 rounded-r-2xl">
            <p className="text-kemenkeu-navy italic text-base leading-relaxed font-medium">
              "Dengan menekan tombol setuju, saya menyatakan bahwa saya telah membaca, memahami, dan menyetujui seluruh poin Pakta Integritas di atas tanpa paksaan."
            </p>
          </div>

          {/* Verification Footer */}
          <div className="pt-20 border-t border-slate-100 flex justify-between items-end">
            <div className="space-y-4">
              <div className="w-32 h-44 bg-slate-50 border border-slate-100 rounded-xl p-1 shadow-inner overflow-hidden">
                <img src={data.photo} alt="Verification" className="w-full h-full object-cover grayscale" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Biometric Verification Proof</p>
            </div>

            <div className="text-right space-y-2">
              <p className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Digitally Signed By</p>
              <div className="space-y-1">
                <p className="text-xl font-bold font-serif text-kemenkeu-navy underline decoration-kemenkeu-gold decoration-4 underline-offset-8 uppercase">{data.name}</p>
                <p className="text-xs text-slate-400 font-mono mt-4 pt-4">{data.timestamp}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Security watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-12 pointer-events-none select-none">
           <ShieldCheck className="w-[500px] h-[500px]" />
        </div>
      </div>
    </div>
  );
}
