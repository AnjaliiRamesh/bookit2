'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Calendar, MapPin, Clock, ArrowLeft, ShieldCheck, Bookmark, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../../lib/api';

interface EventDetail {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  venue: string;
  price: number;
  seatsRemaining: number;
  isSoldOut: boolean;
  organizer: { name: string; email: string };
}

export default function PublicEventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const res = await api.get(`/events/${params.id}`); // Hits backend getEventDetails /api/v1/events/:idOrSlug
        setEvent(res.data);
      } catch (err) {
        console.error(err);
      } {
        setLoading(false);
      }
    };
    if (params.id) fetchEventDetails();
  }, [params.id]);

  const handleSeatBookingAction = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    
    setBookingStatus('PROCESSING');
    try {
      // Hits backend createBooking controller via /api/v1/bookings
      await api.post('/bookings', { eventId: event?.id });
      setBookingStatus('SUCCESS');
    } catch (err) {
      setBookingStatus('ERROR');
    }
  };

  if (loading) return <div className="py-20 text-center text-xs font-mono font-bold text-slate-400 animate-pulse">QUERYING DETAIL SPECIFICATIONS FOR ID: {params.id}...</div>;
  if (!event) return <div className="py-20 text-center text-xs font-bold text-slate-400">Target event was not found on this platform configuration track.</div>;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased flex flex-col">
      
      {/* HEADER */}
      <header className="h-[72px] border-b border-slate-100 px-12 flex items-center justify-between bg-white select-none shrink-0">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
          <div className="h-8 w-8 rounded-lg bg-[#6D5DFC] flex items-center justify-center text-white font-bold text-sm">B</div>
          <span className="font-bold text-lg tracking-tight">BookIt</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 bg-[url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256')] bg-cover bg-center" />
          ) : (
            <button onClick={() => router.push('/auth')} className="bg-[#6D5DFC] hover:bg-[#5b4ee3] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-2xs">Get Access</button>
          )}
        </div>
      </header>

      {/* BODY GRAPHIC GRID CONFIGURATION */}
      <main className="max-w-5xl w-full mx-auto px-12 py-10 flex-1 space-y-8 animate-fade-in text-left">
        
        <button onClick={() => router.back()} className="text-xs font-bold text-slate-400 hover:text-slate-900 flex items-center gap-1 select-none">
          <ArrowLeft className="h-4 w-4" /> Back to events
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          
          {/* Left Text Block info split */}
          <div className="md:col-span-7 space-y-6">
            <div className="space-y-3">
              <span className="bg-indigo-50 border border-indigo-100 text-[#6D5DFC] text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md font-mono">{event.seatsRemaining} Seats Left</span>
              <h1 className="text-3xl font-black tracking-tight leading-tight text-slate-900">{event.title}</h1>
            </div>

            <div className="space-y-3.5 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-slate-400" /> <span>{new Date(event.dateTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-slate-400" /> <span>10:00 AM - 5:00 PM</span></div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" /> <span>{event.venue}</span></div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">About This Event</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">{event.description}</p>
            </div>
          </div>

          {/* Right Core Action checkout slot panel box */}
          <div className="md:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6">
            <div className="aspect-[16/10] w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
              <img src="https://images.unsplash.com/photo-1540574467063-178a50c2df87?q=80&w=600" alt="Cover" className="w-full h-full object-cover" />
            </div>

            <div className="flex items-baseline justify-between select-none">
              <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">Pass Ticket Rate</span>
              <span className="text-2xl font-black text-slate-900 font-mono">₹{event.price}</span>
            </div>

            {/* STATE TRANSITION BOOKING MACHINE */}
            {bookingStatus === 'SUCCESS' ? (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" /> Seat transaction completed! Ticket allocation locked.
              </div>
            ) : (
              <div className="space-y-3">
                {bookingStatus === 'ERROR' && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-[11px] font-medium rounded-xl flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 shrink-0" /> Multi-race seat conflict or payment engine exception.
                  </div>
                )}
                <button 
                  onClick={handleSeatBookingAction}
                  disabled={bookingStatus === 'PROCESSING' || event.isSoldOut}
                  className="w-full bg-[#6D5DFC] hover:bg-[#5b4ee3] disabled:opacity-50 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-md shadow-[#6D5DFC]/10 flex items-center justify-center cursor-pointer"
                >
                  {bookingStatus === 'PROCESSING' ? 'Locking your allocation allocation...' : event.isSoldOut ? 'Sold Out' : user ? 'Book Now' : 'Sign in to Book Passes'}
                </button>
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}