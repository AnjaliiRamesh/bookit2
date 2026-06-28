

// 'use client';

// import React, { useState, useEffect, Suspense } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { useAuth } from '../../context/AuthContext';
// import { Search, Calendar, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
// import api from '../../lib/api';

// interface DatabaseEvent {
//   id: string;
//   title: string;
//   slug: string;
//   description: string;
//   dateTime: string;
//   venue: string;
//   price: number;
//   seatsRemaining: number;
//   isSoldOut: boolean;
//   organizerName: string;
// }

// function MarketplaceContent() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { user } = useAuth();

//   const [events, setEvents] = useState<DatabaseEvent[]>([]);
//   const [loading, setLoading] = useState(true);
  
//   const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
//   const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || '');
//   const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All Categories');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   const categoriesList = ['All Categories', 'Tech', 'Music', 'Business', 'Sports', 'Art'];

//   useEffect(() => {
//     const fetchMarketplaceRecords = async () => {
//       setLoading(true);
//       try {
//         // Build the precise payload parameters expected by event.controller.ts
//         const queryPayload: Record<string, any> = { page: currentPage, limit: 10 };
//         if (searchQuery.trim()) queryPayload.search = searchQuery.trim();
//         if (selectedDate) queryPayload.date = selectedDate;
        
//         const res = await api.get('/events', { params: queryPayload });
//         setEvents(res.data.data || []);
//         setTotalPages(res.data.pagination?.totalPages || 1);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchMarketplaceRecords();
//   }, [searchQuery, selectedDate, currentPage]);

//   // CLIENT-SIDE FILTER MACHINE FOR CATEGORY ALIGNMENT
//   const filteredEvents = events.filter((event) => {
//     if (selectedCategory === 'All Categories') return true;
    
//     // Scans titles and description summaries matching your Prisma database fields
//     const contentPayload = `${event.title} ${event.description}`.toLowerCase();
//     return contentPayload.includes(selectedCategory.toLowerCase());
//   });

//   return (
//     <div className="min-h-screen bg-white text-slate-900 font-sans antialiased flex flex-col">
      
//       {/* NAVBAR */}
//       <header className="h-[72px] border-b border-slate-100 px-12 flex items-center justify-between bg-white select-none shrink-0">
//         <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
//           <div className="h-8 w-8 rounded-lg bg-[#6D5DFC] flex items-center justify-center text-white font-bold text-sm">B</div>
//           <span className="font-bold text-lg tracking-tight">BookIt</span>
//         </div>

//         <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-500">
//           <button onClick={() => router.push('/events')} className="text-[#6D5DFC] font-bold">Events</button>
//           <button onClick={() => router.push(user ? (user.role === 'ORGANIZER' ? '/organizer/dashboard' : '/dashboard/bookings') : '/auth')} className="hover:text-slate-900 transition-colors">My Bookings</button>
//           <button onClick={() => router.push(user?.role === 'ORGANIZER' ? '/organizer/dashboard' : '/auth')} className="hover:text-slate-900 transition-colors">Organizer</button>
//           <button className="hover:text-slate-900 transition-colors">About</button>
//         </nav>

//         <div className="flex items-center gap-4">
//           {user ? (
//             <div 
//               onClick={() => router.push(user.role === 'ORGANIZER' ? '/organizer/dashboard' : '/dashboard')}
//               className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 bg-[url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256')] bg-cover bg-center cursor-pointer" 
//             />
//           ) : (
//             <>
//               <button onClick={() => router.push('/auth')} className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer">Log in</button>
//               <button onClick={() => router.push('/auth')} className="bg-[#6D5DFC] hover:bg-[#5b4ee3] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-2xs">Sign up</button>
//             </>
//           )}
//         </div>
//       </header>

//       {/* FILTER CONTROLS */}
//       <div className="bg-slate-50/50 border-b border-slate-100 py-6 px-12">
//         <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
//           <div className="space-y-0.5 text-left">
//             <h1 className="text-xl font-bold tracking-tight">All Events</h1>
//             <p className="text-slate-400 text-xs font-medium">Find your next experience</p>
//           </div>
//           <div className="flex flex-wrap items-center gap-3">
//             <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-medium w-full sm:w-64">
//               <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
//               <input 
//                 type="text" 
//                 value={searchQuery}
//                 onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
//                 placeholder="Search events..." 
//                 className="w-full bg-transparent outline-none text-slate-900 placeholder-slate-400 font-medium" 
//               />
//             </div>
//             <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-medium">
//               <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
//               <input 
//                 type="date" 
//                 value={selectedDate}
//                 onChange={(e) => { setSelectedDate(e.target.value); setCurrentPage(1); }}
//                 className="bg-transparent outline-none font-semibold text-slate-600 cursor-pointer" 
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* MAIN LAYOUT */}
//       <main className="max-w-5xl w-full mx-auto px-12 py-8 flex flex-col md:flex-row gap-12 flex-1">
        
//         {/* SIDEBAR NAVIGATION */}
//         <aside className="w-full md:w-44 shrink-0 flex flex-row md:flex-col overflow-x-auto gap-1 select-none border-b md:border-b-0 md:border-r border-slate-100 pr-0 md:pr-4 pb-2 md:pb-0">
//           {categoriesList.map((cat) => (
//             <button
//               key={cat}
//               onClick={() => setSelectedCategory(cat)}
//               className={`text-left px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide shrink-0 transition-all cursor-pointer ${
//                 selectedCategory === cat ? 'bg-[#6D5DFC]/5 text-[#6D5DFC]' : 'text-slate-500 hover:bg-slate-50'
//               }`}
//             >
//               {cat}
//             </button>
//           ))}
//         </aside>

//         {/* DYNAMIC FEED DISPLAY */}
//         <div className="flex-1 flex flex-col justify-between space-y-8">
//           {loading ? (
//             <div className="py-20 text-center text-xs font-semibold text-slate-400 tracking-wider font-mono animate-pulse">
//               SYNCING WITH DATABASE CHANNELS...
//             </div>
//           ) : filteredEvents.length === 0 ? (
//             <div className="border border-dashed border-slate-200 rounded-2xl p-16 text-center text-xs font-semibold text-slate-400 select-none">
//               No results found matching this active category context layer.
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {filteredEvents.map((event) => (
//                 <div 
//                   key={event.id}
//                   onClick={() => router.push(`/events/${event.id}`)}
//                   className="flex items-center bg-white border border-slate-100 p-4 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_24px_rgba(109,93,252,0.04)] transition-all cursor-pointer group"
//                 >
//                   <div className="h-20 w-32 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 relative">
//                     <img src="https://images.unsplash.com/photo-1540574467063-178a50c2df87?q=80&w=600" alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-101" />
//                   </div>

//                   <div className="flex-1 min-w-0 px-6 flex flex-col justify-center space-y-1.5 text-left">
//                     <h3 className="font-bold text-base text-slate-900 group-hover:text-[#6D5DFC] transition-colors truncate tracking-tight">{event.title}</h3>
//                     <div className="flex flex-col text-xs text-slate-500 space-y-0.5 font-medium">
//                       <span className="flex items-center gap-1">📍 {event.venue}</span>
//                       <span className="text-[#6D5DFC] font-semibold tracking-wide flex items-center gap-1">
//                         <Clock className="h-3.5 w-3.5 text-indigo-400" /> {new Date(event.dateTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="flex flex-col items-end justify-between h-20 shrink-0 pl-2 py-1">
//                     {event.isSoldOut ? (
//                       <span className="text-[10px] font-bold tracking-wide text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md uppercase">Sold Out</span>
//                     ) : (
//                       <span className="text-[10px] font-bold tracking-wide text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase font-mono">{event.seatsRemaining} Seats Left</span>
//                     )}
//                     <span className="font-extrabold text-base text-slate-900 font-mono">₹{event.price}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* PAGINATION CONTROLS */}
//           {totalPages > 1 && (
//             <div className="flex items-center justify-center gap-1 pt-6 border-t border-slate-100 select-none">
//               <button 
//                 disabled={currentPage === 1}
//                 onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                 className="h-8 w-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
//               >
//                 <ChevronLeft className="h-4 w-4" />
//               </button>
//               {[...Array(totalPages)].map((_, idx) => (
//                 <button
//                   key={idx}
//                   onClick={() => setCurrentPage(idx + 1)}
//                   className={`h-8 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
//                     currentPage === idx + 1
//                       ? 'bg-[#6D5DFC] border-[#6D5DFC] text-white shadow-sm'
//                       : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
//                   }`}
//                 >
//                   {idx + 1}
//                 </button>
//               ))}
//               <button 
//                 disabled={currentPage === totalPages}
//                 onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                 className="h-8 w-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
//               >
//                 <ChevronRight className="h-4 w-4" />
//               </button>
//             </div>
//           )}
//         </div>

//       </main>
//     </div>
//   );
// }

// export default function AllEventsPage() {
//   return (
//     <Suspense fallback={<div className="text-center py-20 text-xs font-mono text-slate-400">Loading Module Engine context...</div>}>
//       <MarketplaceContent />
//     </Suspense>
//   );
// }



'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Search, Calendar, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';

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

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [events, setEvents] = useState<DatabaseEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All Categories');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(20); // Hardcoded to 20 or driven by backend meta response

  const categoriesList = ['All Categories', 'Tech', 'Music', 'Business', 'Sports', 'Art'];

  useEffect(() => {
    const fetchMarketplaceRecords = async () => {
      setLoading(true);
      try {
        const queryPayload: Record<string, any> = { page: currentPage, limit: 4 };
        if (searchQuery.trim()) queryPayload.search = searchQuery.trim();
        if (selectedDate) queryPayload.date = selectedDate;
        
        const res = await api.get('/events', { params: queryPayload });
        setEvents(res.data.data || []);
        if (res.data.pagination?.totalPages) {
          setTotalPages(res.data.pagination.totalPages);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketplaceRecords();
  }, [searchQuery, selectedDate, currentPage]);

  const filteredEvents = events.filter((event) => {
    if (selectedCategory === 'All Categories') return true;
    const contentPayload = `${event.title} ${event.description}`.toLowerCase();
    return contentPayload.includes(selectedCategory.toLowerCase());
  });

  // PAGINATION RENDER ENGINE: Builds <- 1 2 3 ... 20 -> format dynamically
  const renderPaginationElements = () => {
    const pages = [];
    
    // Always render page 1, 2, 3
    pages.push(1);
    if (totalPages >= 2) pages.push(2);
    if (totalPages >= 3) pages.push(3);

    // Add ellipsis break if the total page volume is high
    if (totalPages > 4) {
      pages.push('...');
      pages.push(totalPages);
    } else if (totalPages === 4) {
      pages.push(4);
    }

    return pages.map((p, idx) => (
      <button
        key={idx}
        disabled={p === '...'}
        onClick={() => typeof p === 'number' && setCurrentPage(p)}
        className={`h-8 min-w-[32px] px-2 text-xs font-bold rounded-xl transition-all ${
          currentPage === p
            ? 'bg-[#6D5DFC] text-white shadow-xs'
            : p === '...'
            ? 'text-slate-300 cursor-default border-transparent'
            : 'text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer'
        }`}
      >
        {p}
      </button>
    ));
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased flex flex-col">
      
      {/* NAVBAR */}
      <header className="h-[72px] border-b border-slate-100 px-12 flex items-center justify-between bg-white select-none shrink-0">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
          <div className="h-8 w-8 rounded-lg bg-[#6D5DFC] flex items-center justify-center text-white font-bold text-sm">B</div>
          <span className="font-bold text-lg tracking-tight">BookIt</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-500">
          <button onClick={() => router.push('/events')} className="text-[#6D5DFC] font-bold">Events</button>
          <button onClick={() => router.push(user ? (user.role === 'ORGANIZER' ? '/organizer/dashboard' : '/dashboard/bookings') : '/auth')} className="hover:text-slate-900 transition-colors">My Bookings</button>
          <button onClick={() => router.push(user?.role === 'ORGANIZER' ? '/organizer/dashboard' : '/auth')} className="hover:text-slate-900 transition-colors">Organizer</button>
          <button className="hover:text-slate-900 transition-colors">About</button>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div 
              onClick={() => router.push(user.role === 'ORGANIZER' ? '/organizer/dashboard' : '/dashboard')}
              className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 bg-[url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256')] bg-cover bg-center cursor-pointer" 
            />
          ) : (
            <>
              <button onClick={() => router.push('/auth')} className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer">Log in</button>
              <button onClick={() => router.push('/auth')} className="bg-[#6D5DFC] hover:bg-[#5b4ee3] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-2xs">Sign up</button>
            </>
          )}
        </div>
      </header>

      {/* FILTER CONTROLS */}
      <div className="bg-slate-50/50 border-b border-slate-100 py-6 px-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5 text-left">
            <h1 className="text-xl font-bold tracking-tight">All Events</h1>
            <p className="text-slate-400 text-xs font-medium">Find your next experience</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-medium w-full sm:w-64">
              <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search events..." 
                className="w-full bg-transparent outline-none text-slate-900 placeholder-slate-400 font-medium" 
              />
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-medium">
              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => { setSelectedDate(e.target.value); setCurrentPage(1); }}
                className="bg-transparent outline-none font-semibold text-slate-600 cursor-pointer" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* CORE CONTENT GRID */}
      <main className="max-w-5xl w-full mx-auto px-12 py-8 flex flex-col md:flex-row gap-12 flex-1">
        
        <aside className="w-full md:w-44 shrink-0 flex flex-row md:flex-col overflow-x-auto gap-1 select-none border-b md:border-b-0 md:border-r border-slate-100 pr-0 md:pr-4 pb-2 md:pb-0">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-left px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat ? 'bg-[#6D5DFC]/5 text-[#6D5DFC]' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </aside>

        <div className="flex-1 flex flex-col justify-between space-y-8">
          {loading ? (
            <div className="py-20 text-center text-xs font-semibold text-slate-400 tracking-wider font-mono animate-pulse">
              SYNCING WITH DATABASE CHANNELS...
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-2xl p-16 text-center text-xs font-semibold text-slate-400 select-none">
              No results found matching this active category context layer.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div 
                  key={event.id}
                  onClick={() => router.push(`/events/${event.id}`)}
                  className="flex items-center bg-white border border-slate-100 p-4 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_24px_rgba(109,93,252,0.04)] transition-all cursor-pointer group"
                >
                  <div className="h-20 w-32 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 relative">
                    <img src="https://images.unsplash.com/photo-1540574467063-178a50c2df87?q=80&w=600" alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-101" />
                  </div>

                  <div className="flex-1 min-w-0 px-6 flex flex-col justify-center space-y-1.5 text-left">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-[#6D5DFC] transition-colors truncate tracking-tight">{event.title}</h3>
                    <div className="flex flex-col text-xs text-slate-500 space-y-0.5 font-medium">
                      <span className="flex items-center gap-1">📍 {event.venue}</span>
                      <span className="text-[#6D5DFC] font-semibold tracking-wide flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-indigo-400" /> {new Date(event.dateTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between h-20 shrink-0 pl-2 py-1">
                    {event.isSoldOut ? (
                      <span className="text-[10px] font-bold tracking-wide text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md uppercase">Sold Out</span>
                    ) : (
                      <span className="text-[10px] font-bold tracking-wide text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase font-mono">{event.seatsRemaining} Seats Left</span>
                    )}
                    <span className="font-extrabold text-base text-slate-900 font-mono">₹{event.price}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DYNAMIC COMPONENT PAGINATION FOOTER */}
          <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-100 select-none">
            {/* CLICKABLE PREVIOUS ARROW BUTTON */}
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="h-8 w-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="flex items-center gap-1">
              {renderPaginationElements()}
            </div>

            {/* CLICKABLE NEXT ARROW BUTTON */}
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="h-8 w-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}

export default function AllEventsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs font-mono text-slate-400">Loading Module Engine context...</div>}>
      <MarketplaceContent />
    </Suspense>
  );
}