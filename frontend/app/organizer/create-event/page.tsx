// 'use client';

// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { ArrowLeft, FileText, MapPin, DollarSign, Layers, AlertCircle } from 'lucide-react';
// import api from '../../../lib/api';

// export default function CreateEventPage() {
//   const router = useRouter();

//   const [form, setForm] = useState({ title: '', description: '', venue: '', dateTime: '', capacity: '', price: '' });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);

//   const handleCreateSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setErrorMessage(null);

//     try {
//       // Maps configuration payload params straight to organizer.controller.ts
//       await api.post('/organizer/events', {
//         title: form.title,
//         description: form.description,
//         venue: form.venue, // Maps cleanly to schema location property
//         dateTime: form.dateTime,
//         capacity: parseInt(form.capacity, 10) || 50,
//         price: parseFloat(form.price) || 0.0
//       }); // Hits POST /api/v1/organizer/events

//       router.push('/organizer/dashboard');
//     } catch (err: any) {
//       setErrorMessage(err.response?.data?.message || 'Error executing persistence write.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#F8F9FC] text-slate-900 font-sans antialiased flex flex-col">
//       <header className="h-[72px] bg-white border-b border-slate-100 px-8 flex items-center justify-between select-none shrink-0">
//         <div className="flex items-center gap-4">
//           <button onClick={() => router.push('/organizer/dashboard')} className="h-9 w-9 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 bg-white transition-all"><ArrowLeft className="h-4 w-4" /></button>
//           <div className="text-left">
//             <h1 className="text-base font-bold tracking-tight">List New Experience</h1>
//             <p className="text-[11px] text-slate-400 font-medium">Publish a fresh event straight down to PostgreSQL blocks</p>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-2xl w-full mx-auto px-6 py-10 flex-1 overflow-y-auto">
//         {errorMessage && (
//           <div className="mb-5 p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-2">
//             <AlertCircle className="h-4 w-4 shrink-0" /> <span>{errorMessage}</span>
//           </div>
//         )}

//         <form onSubmit={handleCreateSubmit} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-5 text-left">
          
//           <div className="space-y-1">
//             <label className="text-xs font-bold text-slate-500 tracking-tight flex items-center gap-1"><FileText className="h-3.5 w-3.5 text-slate-400" /> Event Title</label>
//             <input type="text" required placeholder="e.g., Advanced Next.js Interaction Workshop" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#6D5DFC] transition-all" />
//           </div>

//           <div className="space-y-1">
//             <label className="text-xs font-bold text-slate-500 tracking-tight flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400" /> Venue Location</label>
//             <input type="text" required placeholder="e.g., Hall 4 Innovation Grid, Bengaluru" value={form.venue} onChange={(e) => setForm({...form, venue: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#6D5DFC] transition-all" />
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//             <div className="space-y-1">
//               <label className="text-xs font-bold text-slate-500 tracking-tight flex items-center gap-1">Event Timeline</label>
//               <input type="datetime-local" required value={form.dateTime} onChange={(e) => setForm({...form, dateTime: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-700 outline-none font-mono" />
//             </div>
//             <div className="space-y-1">
//               <label className="text-xs font-bold text-slate-500 tracking-tight flex items-center gap-1"><Layers className="h-3.5 w-3.5 text-slate-400" /> Total Capacity</label>
//               <input type="number" required placeholder="100" value={form.capacity} onChange={(e) => setForm({...form, capacity: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none font-mono font-bold" />
//             </div>
//             <div className="space-y-1">
//               <label className="text-xs font-bold text-slate-500 tracking-tight flex items-center gap-1"><DollarSign className="h-3.5 w-3.5 text-slate-400" /> Ticket Pass (₹)</label>
//               <input type="number" required placeholder="499" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none font-mono font-bold" />
//             </div>
//           </div>

//           <div className="space-y-1">
//             <label className="text-xs font-bold text-slate-500 tracking-tight">Description Summary</label>
//             <textarea rows={4} required placeholder="Share structural timelines, schedules, and topic previews..." value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-medium text-slate-900 outline-none resize-none focus:bg-white focus:border-[#6D5DFC] transition-all leading-relaxed" />
//           </div>

//           <div className="flex gap-4 pt-2 select-none">
//             <button type="button" onClick={() => router.back()} className="flex-1 bg-slate-50 border border-slate-200 text-slate-600 font-bold text-xs py-3 rounded-xl">Cancel</button>
//             <button type="submit" disabled={isSubmitting} className="flex-1 bg-[#6D5DFC] hover:bg-[#5b4ee3] disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition-all">{isSubmitting ? 'Publishing Registry...' : 'Publish Event'}</button>
//           </div>
//         </form>
//       </main>
//     </div>
//   );
// }

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { ArrowLeft, FileText, MapPin, DollarSign, Layers, AlertCircle, ImageIcon } from 'lucide-react';
import api from '../../../lib/api';

function CreateEventFormContent() {
  const router = useRouter();

  // Controlled Data Parameters States
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    venue: '', 
    dateTime: '', 
    capacity: '', 
    price: '',
    img: 'https://images.unsplash.com/photo-1540574467063-178a50c2df87?q=80&w=800' // Default asset image
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    // Business Guard Rule: Front-end client-side validation thresholds
    if (parseInt(form.capacity, 10) <= 0) {
      setErrorMessage("Event capacity must be greater than 0 slots.");
      setIsSubmitting(false);
      return;
    }
    if (parseFloat(form.price) < 0) {
      setErrorMessage("Ticket pass rate configuration cannot be negative values.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Direct POST payload execution straight to organizer.controller.ts route
      await api.post('/organizer/events', {
        title: form.title,
        description: form.description,
        venue: form.venue, // Maps cleanly to schema location property
        dateTime: form.dateTime,
        capacity: parseInt(form.capacity, 10),
        price: parseFloat(form.price) || 0.0,
        img: form.img // Image link asset layer
      });

      router.push('/organizer/dashboard');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Error processing record write down to backend databases.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-slate-900 font-sans antialiased flex flex-col">
      <header className="h-[72px] bg-white border-b border-slate-100 px-8 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => router.push('/organizer/dashboard')} className="h-9 w-9 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 bg-white transition-all cursor-pointer"><ArrowLeft className="h-4 w-4" /></button>
          <div className="text-left">
            <h1 className="text-base font-bold tracking-tight">List New Experience</h1>
            <p className="text-[11px] text-slate-400 font-medium">Publish a fresh event straight down to PostgreSQL blocks</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl w-full mx-auto px-6 py-10 flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {errorMessage && (
          <div className="md:col-span-12 p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" /> <span>{errorMessage}</span>
          </div>
        )}

        {/* LEFT COLUMN: INTERACTIVE IMAGE PREVIEW & UPLOAD PATHWAY CARD */}
        <div className="md:col-span-4 bg-white border border-slate-100 rounded-3xl p-5 shadow-2xs text-left space-y-4">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Image Visual Banner</label>
          
          <div className="aspect-[16/11] w-full bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-2xs relative">
            <img src={form.img} alt="Dynamic Preview" className="w-full h-full object-cover" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5 text-slate-400" /> Image URL Path</label>
            <input 
              type="text" 
              placeholder="Paste external photographic Unsplash image path URL..." 
              value={form.img}
              onChange={(e) => setForm({...form, img: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-mono text-slate-600 focus:bg-white outline-none focus:border-[#6D5DFC]"
            />
          </div>
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">The frontend handles link inputs natively to prevent local multi-part caching drag delays. Paste any standard web graphic image URL path link.</p>
        </div>

        {/* RIGHT COLUMN: CORE CONTROL FIELDS */}
        <form onSubmit={handleCreateSubmit} className="md:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-2xs space-y-5 text-left">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 tracking-tight flex items-center gap-1"><FileText className="h-3.5 w-3.5 text-slate-400" /> Event Title</label>
            <input type="text" required placeholder="e.g., Advanced Next.js Interaction Workshop" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#6D5DFC] transition-all" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 tracking-tight flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400" /> Venue Location</label>
            <input type="text" required placeholder="e.g., Hall 4 Innovation Grid, Bengaluru" value={form.venue} onChange={(e) => setForm({...form, venue: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#6D5DFC] transition-all" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 tracking-tight flex items-center gap-1">Event Timeline</label>
              <input type="datetime-local" required value={form.dateTime} onChange={(e) => setForm({...form, dateTime: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-700 outline-none font-mono cursor-pointer" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 tracking-tight flex items-center gap-1"><Layers className="h-3.5 w-3.5 text-slate-400" /> Total Capacity</label>
              <input type="number" required placeholder="100" value={form.capacity} onChange={(e) => setForm({...form, capacity: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none font-mono font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 tracking-tight flex items-center gap-1"><DollarSign className="h-3.5 w-3.5 text-slate-400" /> Ticket Pass (₹)</label>
              <input type="number" required placeholder="499" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none font-mono font-bold" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 tracking-tight">Description Summary</label>
            <textarea rows={4} required placeholder="Share structural timelines, schedules, and topic previews..." value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-medium text-slate-900 outline-none resize-none focus:bg-white focus:border-[#6D5DFC] transition-all leading-relaxed" />
          </div>

          <div className="flex gap-4 pt-2 select-none">
            <button type="button" onClick={() => router.push('/organizer/dashboard')} className="flex-1 bg-slate-50 border border-slate-200 text-slate-600 font-bold text-xs py-3 rounded-xl cursor-pointer">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-[#6D5DFC] hover:bg-[#5b4ee3] disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition-all cursor-pointer">{isSubmitting ? 'Publishing Registry...' : 'Publish Event'}</button>
          </div>
        </form>
      </main>
    </div>
  );
}

// WRAP COMPLETE ELEMENT TREE UNDER COMPONENT SHIELD FOR HIGHEST SECURITY ASSURANCE
export default function SafeCreateEventPage() {
  return (
    <ProtectedRoute allowedRole="ORGANIZER">
      <CreateEventFormContent />
    </ProtectedRoute>
  );
}