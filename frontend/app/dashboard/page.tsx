'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Calendar, MapPin, Clock, Search, LogOut, Ticket, Grid, Settings as SettingsIcon } from 'lucide-react';
import api from '../../lib/api';
import ProtectedRoute from '../../components/ProtectedRoute';

interface DatabaseEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  dateTime: string;
  venue: string;
  price: number;
  seatsRemaining: number;
  isSoldOut: boolean;
  organizerName: string;
}

function AttendeeDashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [events, setEvents] = useState<DatabaseEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Tech', 'Music', 'Business', 'Sports', 'Art'];

  useEffect(() => {
    const fetchAttendeeMarketplace = async () => {
      try {
        const res = await api.get('/events', { params: { limit: 20 } });
        setEvents(res.data.data || []);
      } catch (err) {
        console.error('Error loading secure marketplace:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendeeMarketplace();
  }, []);

  const displayEvents = events.filter((event) => {
    const matchesCat = selectedCategory === 'All' || event.title.toLowerCase().includes(selectedCategory.toLowerCase()) || event.description.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex text-slate-900 font-sans antialiased">
      
      {/* SIDEBAR COMPONENT PANEL */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between p-6 shrink-0 select-none">
        <div className="space-y-8">
          <div className="flex items-center gap-3 pl-2">
            <div className="h-9 w-9 rounded-xl bg-[#6D5DFC] flex items-center justify-center text-white font-bold text-base shadow-xs">B</div>
            <span className="font-bold text-lg tracking-tight">BookIt</span>
          </div>

          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl bg-[#6D5DFC]/5 text-[#6D5DFC] text-left cursor-pointer">
              <Grid className="h-4 w-4" /> <span>Events</span>
            </button>
            <button onClick={() => router.push('/dashboard/bookings')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 text-left cursor-pointer">
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

      {/* CORE DISPLAY CANVAS */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* TOP PANEL HEADER */}
        <header className="h-[72px] bg-white border-b border-slate-100 px-10 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 px-3.5 py-2 rounded-xl w-72">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search active events..."
              className="w-full bg-transparent outline-none text-xs font-medium text-slate-900 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500">Welcome, {user?.name || 'Attendee'}</span>
            <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 bg-[url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256')] bg-cover bg-center" />
          </div>
        </header>

        {/* FEED INNER SPACE */}
        <main className="p-10 space-y-6 max-w-[1200px] w-full">
          <div className="text-left space-y-1 select-none">
            <h1 className="text-2xl font-bold tracking-tight">Explore Marketplace</h1>
            <p className="text-slate-400 text-xs font-medium">Instantly book verified tickets with absolute seat guarantees</p>
          </div>

          {/* Inline Categories */}
          <div className="flex flex-wrap gap-2 select-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer bg-white ${
                  selectedCategory === cat 
                    ? 'bg-[#6D5DFC]/5 border-[#6D5DFC] text-[#6D5DFC]' 
                    : 'border-slate-100 text-slate-500 hover:border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Events Grid Wrapper */}
          {loading ? (
            <div className="py-20 text-center text-xs font-bold font-mono text-slate-400 tracking-wider animate-pulse">PULLING LIVE MARKETPLACE GRIDS...</div>
          ) : displayEvents.length === 0 ? (
            <div className="border border-dashed border-slate-200 bg-white rounded-2xl p-16 text-center text-xs font-semibold text-slate-400 select-none">
              No live matching events found inside the local database tables.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              {displayEvents.map((event) => (
                <div 
                  key={event.id}
                  onClick={() => router.push(`/events/${event.id}`)}
                  className="bg-white border border-slate-100/80 rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_24px_rgba(109,93,252,0.04)] hover:border-slate-200/60 transition-all flex flex-col justify-between cursor-pointer group animate-fade-in"
                >
                  <div className="space-y-3.5">
                    <div className="aspect-[16/10] w-full rounded-xl bg-slate-50 border border-slate-100 overflow-hidden relative">
                      <img src="https://images.unsplash.com/photo-1540574467063-178a50c2df87?q=80&w=600" alt={event.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2.5 right-2.5">
                        {event.seatsRemaining <= 0 ? (
                          <span className="bg-rose-50 text-rose-600 text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md font-mono">Sold Out</span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md font-mono">{event.seatsRemaining} Seats Left</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1 px-0.5">
                      <h3 className="font-bold text-sm text-slate-900 truncate group-hover:text-[#6D5DFC] transition-colors tracking-tight">{event.title}</h3>
                      <p className="text-[11px] text-slate-400 font-medium line-clamp-2 leading-relaxed">{event.description}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-50 pt-3 mt-4 flex items-center justify-between select-none px-0.5">
                    <div className="space-y-0.5">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">📍 {event.venue}</span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#6D5DFC] font-mono">
                        <Calendar className="h-3 w-3 text-indigo-400" /> {new Date(event.dateTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <span className="text-xs font-black text-slate-800 font-mono">{event.price === 0 ? 'Free' : `₹${event.price}`}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


export default function ProtectedDashboard() {
  return (
    <ProtectedRoute allowedRole="USER">
      <AttendeeDashboardPage />
    </ProtectedRoute>
  );
}