'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Grid, BarChart3, Plus, LogOut, Settings, Users, Edit2, Calendar, MapPin, X, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../../lib/api';
import ProtectedRoute from '../../../components/ProtectedRoute';

interface OrganizerEvent {
  id: string;
  title: string;
  venue: string;
  dateTime: string;
  price: number;
  totalCapacity: number;
  seatsRemaining: number;
  bookingsSold: number;
}

interface AttendeeRow {
  bookingId: string;
  bookedAt: string;
  attendee: { id: string; name: string; email: string; };
}

 function OrganizerDashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Primary Workspace States
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemMessage, setSystemMessage] = useState<{ type: 'SUCCESS' | 'ERROR'; text: string } | null>(null);

  // Attendee Flyout List Drawer States
  const [selectedEventForRoster, setSelectedEventForRoster] = useState<OrganizerEvent | null>(null);
  const [attendees, setAttendees] = useState<AttendeeRow[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  // Edit Form Modal States
  const [editingEvent, setEditingEvent] = useState<OrganizerEvent | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', venue: '', dateTime: '', capacity: '', price: '' });

  const fetchOrganizerDataDeck = async () => {
    setLoading(true);
    try {
      const res = await api.get('/organizer/events'); // Hits /api/v1/organizer/events
      setEvents(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerDataDeck();
  }, []);

  // View Attendee List Core Logic Node
  const handleOpenAttendeeRoster = async (event: OrganizerEvent) => {
    setSelectedEventForRoster(event);
    setLoadingAttendees(true);
    try {
      const res = await api.get(`/organizer/events/${event.id}/attendees`); // Hits /api/v1/organizer/events/:id/attendees
      setAttendees(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAttendees(false);
    }
  };

  // Open Edit Dialog Configuration Guard
  const handleOpenEditModal = (event: OrganizerEvent) => {
    setEditingEvent(event);
    setEditForm({
      title: event.title,
      description: 'Retained event summary logs.',
      venue: event.venue,
      dateTime: new Date(event.dateTime).toISOString().slice(0, 16),
      capacity: event.totalCapacity.toString(),
      price: event.price.toString()
    });
  };

  // Execute Event Modification with Capacity Verification Checks
  const handleUpdateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSystemMessage(null);

    if (!editingEvent) return;

    const inputCapacity = parseInt(editForm.capacity, 10);
    
    // FRONTEND BUSINESS GUARD CHECK RULE
    if (inputCapacity < editingEvent.bookingsSold) {
      setSystemMessage({
        type: 'ERROR',
        text: `Capacity reduction rejected. Cannot scale down below ${editingEvent.bookingsSold} seats already booked by active attendees.` // Matches backend guard precisely
      });
      return;
    }

    try {
      await api.put(`/organizer/events/${editingEvent.id}`, {
        title: editForm.title,
        description: editForm.description,
        venue: editForm.venue,
        dateTime: editForm.dateTime,
        capacity: inputCapacity,
        price: parseFloat(editForm.price) || 0.0
      }); // Hits PUT /api/v1/organizer/events/:id

      setSystemMessage({ type: 'SUCCESS', text: 'Event attributes successfully updated inside database rows.' });
      setEditingEvent(null);
      await fetchOrganizerDataDeck();
    } catch (err: any) {
      setSystemMessage({ type: 'ERROR', text: err.response?.data?.message || 'Error processing record modification.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex text-slate-900 font-sans antialiased">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between p-6 shrink-0 select-none">
        <div className="space-y-8">
          <div className="flex items-center gap-3 pl-2">
            <div className="h-9 w-9 rounded-xl bg-[#6D5DFC] flex items-center justify-center text-white font-bold text-base shadow-xs">B</div>
            <span className="font-bold text-lg tracking-tight">BookIt</span>
          </div>
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl bg-[#6D5DFC]/5 text-[#6D5DFC] text-left cursor-pointer">
              <Grid className="h-4 w-4" /> <span>Dashboard</span>
            </button>
            <button onClick={() => router.push('/organizer/analytics')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 text-left cursor-pointer">
              <BarChart3 className="h-4 w-4" /> <span>Analytics</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 text-left cursor-pointer">
              <Settings className="h-4 w-4" /> <span>Settings</span>
            </button>
          </nav>
        </div>
        <button onClick={() => logout()} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl text-rose-500 hover:bg-rose-50 text-left cursor-pointer transition-colors">
          <LogOut className="h-4 w-4" /> <span>Logout</span>
        </button>
      </aside>

      {/* WORKSPACE CANVAS */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="h-[72px] bg-white border-b border-slate-100 px-10 flex items-center justify-between shrink-0 select-none">
          <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-md uppercase font-mono tracking-wider">Management Control Deck</span>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500">Portal: {user?.name}</span>
            <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-mono text-xs font-bold">Org</div>
          </div>
        </header>

        <main className="p-10 space-y-6 max-w-6xl w-full text-left">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Recent Listings</h1>
              <p className="text-slate-400 text-xs font-medium">Monitor active ticket distributions, adjust capacities, and view rosters</p>
            </div>
            <button 
              onClick={() => router.push('/organizer/create-event')}
              className="bg-[#6D5DFC] hover:bg-[#5b4ee3] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" /> Create Event
            </button>
          </div>

          {systemMessage && (
            <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in ${
              systemMessage.type === 'SUCCESS' ? 'bg-emerald-50 border border-emerald-100 text-emerald-800' : 'bg-rose-50 border border-rose-100 text-rose-700'
            }`}>
              {systemMessage.type === 'SUCCESS' ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-rose-500" />}
              <span>{systemMessage.text}</span>
            </div>
          )}

          {/* MAIN INVENTORY TABLE MATRIX */}
          {loading ? (
            <div className="py-20 text-center text-xs font-bold font-mono text-slate-400 tracking-wider animate-pulse">PULLING OWNED EVENT INVENTORIES...</div>
          ) : events.length === 0 ? (
            <div className="border border-dashed border-slate-200 bg-white rounded-2xl p-16 text-center text-xs font-semibold text-slate-400 select-none">
              No events found registered to your organizer token pipeline.
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold font-mono uppercase tracking-wider select-none">
                      <th className="p-4 pl-6">Event Title & Venue</th>
                      <th className="p-4">Event Date</th>
                      <th className="p-4">Ticket Rate</th>
                      <th className="p-4">Bookings Sold</th>
                      <th className="p-4 text-right pr-6">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                    {events.map((event) => (
                      <tr key={event.id} className="hover:bg-slate-50/40 transition-colors group">
                        <td className="p-4 pl-6 max-w-xs">
                          <p className="font-bold text-slate-900 group-hover:text-[#6D5DFC] transition-colors truncate">{event.title}</p>
                          <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">📍 {event.venue}</p>
                        </td>
                        <td className="p-4 font-mono text-slate-500">{new Date(event.dateTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td className="p-4 font-mono font-bold text-slate-900">₹{event.price}</td>
                        <td className="p-4">
                          <span className="font-mono font-bold text-slate-900">{event.bookingsSold}</span>
                          <span className="text-slate-300 font-normal"> / {event.totalCapacity}</span>
                        </td>
                        <td className="p-4 text-right pr-6 space-x-2 select-none">
                          <button 
                            onClick={() => handleOpenAttendeeRoster(event)}
                            className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer"
                          >
                            <Users className="h-3.5 w-3.5" /> Attendees
                          </button>
                          <button 
                            onClick={() => handleOpenEditModal(event)}
                            className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-[#6D5DFC] hover:bg-indigo-100/60 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" /> Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* FLYOUT ATTENDEE LIST DRAWER */}
      {selectedEventForRoster && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end animate-fade-in">
          <div className="w-full max-w-md bg-white h-full p-6 flex flex-col justify-between shadow-2xl relative text-left">
            <button onClick={() => setSelectedEventForRoster(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex-1 flex flex-col min-h-0 space-y-6">
              <div className="space-y-1 select-none pr-8">
                <h3 className="font-bold text-base tracking-tight text-slate-900">Attendee Roster Log</h3>
                <p className="text-slate-400 text-xs font-medium line-clamp-1">Event: {selectedEventForRoster.title}</p>
              </div>

              {loadingAttendees ? (
                <div className="py-20 text-center text-xs font-bold font-mono text-slate-400 animate-pulse">RETRIEVING LIVE SYSTEM ROSTERS...</div>
              ) : attendees.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-2xl p-12 text-center text-xs font-semibold text-slate-400 select-none">
                  No confirmed bookings found for this allocation slot track.
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                  {attendees.map((row) => (
                    <div key={row.bookingId} className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4 flex flex-col space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{row.attendee.name}</p>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">{row.attendee.email}</p>
                        </div>
                        <span className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md font-mono">Confirmed</span>
                      </div>
                      <p className="text-[10px] font-semibold font-mono text-slate-400 pt-1.5 border-t border-slate-200/60">
                        Booking Date: {new Date(row.bookedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setSelectedEventForRoster(null)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl cursor-pointer mt-4">Close Drawer</button>
          </div>
        </div>
      )}

      {/* EDIT CONFIGURATION MODAL DIALOG */}
      {editingEvent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <form onSubmit={handleUpdateEventSubmit} className="bg-white border border-slate-100 max-w-md w-full rounded-3xl p-6 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 select-none">
              <h3 className="font-bold text-sm tracking-tight text-slate-900">Modify Listing Attributes</h3>
              <button type="button" onClick={() => setEditingEvent(null)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
            </div>

            <div className="space-y-3 text-xs font-medium">
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold">Event Title</label>
                <input type="text" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold">Venue Location</label>
                <input type="text" value={editForm.venue} onChange={(e) => setEditForm({...editForm, venue: e.target.value})} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Capacity Limit</label>
                  <input type="number" value={editForm.capacity} onChange={(e) => setEditForm({...editForm, capacity: e.target.value})} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-mono font-bold" />
                  <span className="block text-[10px] text-indigo-500 font-medium mt-0.5">Current Sold: {editingEvent.bookingsSold}</span>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-semibold">Ticket Price (₹)</label>
                  <input type="number" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-mono font-bold" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100 select-none">
              <button type="button" onClick={() => setEditingEvent(null)} className="flex-1 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs py-3 rounded-xl">Cancel</button>
              <button type="submit" className="flex-1 bg-[#6D5DFC] hover:bg-[#5b4ee3] text-white font-bold text-xs py-3 rounded-xl shadow-xs">Save Adjustments</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}



export default function ProtectedOrganizerDashboard() {
  return (
    <ProtectedRoute allowedRole="ORGANIZER">
      <OrganizerDashboardPage />
    </ProtectedRoute>
  );
}
