'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Grid, Ticket, Settings as SettingsIcon, LogOut, Calendar, MapPin, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../../lib/api';

interface BookingRecord {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'; // Maps to backend BookingStatus enum
  createdAt: string;
  event: {
    title: string;
    date: string;
    location: string;
    price: number;
  };
}

export default function AttendeeBookingsPage() {
  const router = useRouter();
  const { logout } = useAuth();

  // Component Data Arrays Trackers
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST' | 'CANCELLED'>('UPCOMING');
  const [actionMessage, setActionMessage] = useState<{ type: 'SUCCESS' | 'ERROR'; text: string } | null>(null);

  const fetchUserBookingsList = async () => {
    setLoading(true);
    try {
      // Queries GET /api/v1/bookings/my-bookings directly
      const response = await api.get('/bookings/my-bookings');
      setBookings(response.data.data || []);
    } catch (err) {
      console.error('Failed pulling ticket allocations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserBookingsList();
  }, []);

  // Triggers PATCH /api/v1/bookings/:id/cancel down to backend controller
  /*
  const handleCancelTicketClick = async (bookingId: string) => {
    setActionMessage(null);
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      setActionMessage({ type: 'SUCCESS', text: 'Ticket successfully cancelled. Inventory slot restored.' });
      await fetchUserBookingsList(); // Live refresh array values
    } catch (error: any) {
      setActionMessage({ 
        type: 'ERROR', 
        text: error.response?.data?.message || 'Failed to cancel ticket allocation rules.' 
      });
    }
  };
*/

// Overwrite ONLY this function inside frontend/app/dashboard/bookings/page.tsx
 const handleCancelTicketClick = async (bookingId: string) => {
    setActionMessage(null);
    try {
      // Ensure the slash string structure matches the exact PATCH route mapping format 
      const response = await api.patch(`/bookings/${bookingId}/cancel`);
      
      setActionMessage({ 
        type: 'SUCCESS', 
        text: response.data?.message || 'Ticket successfully cancelled. Inventory slot restored.' 
      });
      
      // Instantly run the fetch refresher to update data metrics smoothly on screen
      await fetchUserBookingsList(); 
    } catch (error: any) {
      console.error("Axios Error Core Properties:", {
        message: error.message,
        code: error.code,
        request: error.request
      });
      
      setActionMessage({ 
        type: 'ERROR', 
        text: error.response?.data?.message || 'Network communication error or invalid ticket assignment identifier.' 
      });
    }
  };
  // Sort and filter dataset buckets dynamically based on status logs and timeline comparisons
  const filteredBookings = bookings.filter((item) => {
    const isEventPast = new Date(item.event.date).getTime() < new Date().getTime();
    
    if (activeTab === 'CANCELLED') return item.status === 'CANCELLED';
    if (item.status === 'CANCELLED') return false; // Filter out cancelled ones from main screens
    
    if (activeTab === 'PAST') return isEventPast;
    return !isEventPast; // Default 'UPCOMING'
  });

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex text-slate-900 font-sans antialiased">
      
      {/* SIDEBAR PANEL */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between p-6 shrink-0 select-none">
        <div className="space-y-8">
          <div className="flex items-center gap-3 pl-2" onClick={() => router.push('/')}>
            <div className="h-9 w-9 rounded-xl bg-[#6D5DFC] flex items-center justify-center text-white font-bold text-base shadow-xs">B</div>
            <span className="font-bold text-lg tracking-tight text-slate-900">BookIt</span>
          </div>

          <nav className="space-y-1">
            <button onClick={() => router.push('/dashboard')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 text-left cursor-pointer">
              <Grid className="h-4 w-4" /> <span>Events</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl bg-[#6D5DFC]/5 text-[#6D5DFC] text-left cursor-pointer">
              <Ticket className="h-4 w-4" /> <span>My Bookings</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 text-left cursor-pointer">
              <SettingsIcon className="h-4 w-4" /> <span>Settings</span>
            </button>
          </nav>
        </div>

        <button onClick={() => logout()} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl text-rose-500 hover:bg-rose-50 text-left cursor-pointer transition-colors">
          <LogOut className="h-4 w-4" /> <span>Logout</span>
        </button>
      </aside>

      {/* INNER CANVAS GRID */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <main className="p-10 max-w-4xl w-full mx-auto space-y-6 text-left">
          
          <div className="space-y-1 select-none">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Bookings</h1>
            <p className="text-slate-400 text-xs font-medium">Review and manage your pass allocations logs</p>
          </div>

          {actionMessage && (
            <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in ${
              actionMessage.type === 'SUCCESS' ? 'bg-emerald-50 border border-emerald-100 text-emerald-800' : 'bg-rose-50 border border-rose-100 text-rose-700'
            }`}>
              {actionMessage.type === 'SUCCESS' ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-rose-500" />}
              <span>{actionMessage.text}</span>
            </div>
          )}

          {/* TAB STRIP FILTER ALIGNMENT AS DETAILED IN IMAGE DETAILED MOCKUPS */}
          <div className="flex items-center gap-6 border-b border-slate-100 select-none pb-1 text-xs font-bold">
            <button 
              onClick={() => setActiveTab('UPCOMING')}
              className={`pb-2.5 transition-all cursor-pointer border-b-2 tracking-wide ${activeTab === 'UPCOMING' ? 'border-[#6D5DFC] text-[#6D5DFC]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Upcoming
            </button>
            <button 
              onClick={() => setActiveTab('PAST')}
              className={`pb-2.5 transition-all cursor-pointer border-b-2 tracking-wide ${activeTab === 'PAST' ? 'border-b-[#6D5DFC] text-[#6D5DFC]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Past
            </button>
            <button 
              onClick={() => setActiveTab('CANCELLED')}
              className={`pb-2.5 transition-all cursor-pointer border-b-2 tracking-wide ${activeTab === 'CANCELLED' ? 'border-b-[#6D5DFC] text-[#6D5DFC]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Cancelled
            </button>
          </div>

          {/* DYNAMIC CARD ITEMS MATRIX LIST */}
          {loading ? (
            <div className="py-20 text-center text-xs font-bold font-mono text-slate-400 tracking-wider animate-pulse">SYNCHRONIZING TICKET FEED REGISTRIES...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="border border-dashed border-slate-200 bg-white rounded-2xl p-14 text-center text-xs font-semibold text-slate-400 select-none">
              No booking records mapped inside this individual tracking segment view.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white border border-slate-100 p-4 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex items-center justify-between group animate-fade-in"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-14 w-20 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                      <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400" alt="Thumb" className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="min-w-0 space-y-1">
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#6D5DFC] transition-colors truncate tracking-tight">{item.event.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1 font-semibold text-[#6D5DFC] font-mono"><Calendar className="h-3 w-3 text-indigo-400" /> {new Date(item.event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} • 10:00 AM</span>
                        <span>📍 {item.event.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Alignment Details Meta Actions */}
                  <div className="flex items-center gap-6 shrink-0 select-none pl-4">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase font-mono tracking-wider ${
                      item.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.status}
                    </span>
                    
                    {activeTab === 'UPCOMING' && item.status === 'CONFIRMED' && (
                      <button 
                        onClick={() => handleCancelTicketClick(item.id)}
                        className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
                      >
                        Cancel Ticket
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Captions Line */}
          <p className="text-center text-[11px] text-slate-400 font-semibold select-none pt-4">
            Can't find your booking confirmation? <span className="text-[#6D5DFC] hover:underline cursor-pointer font-bold">Contact support channels</span>
          </p>

        </main>
      </div>

    </div>
  );
}