// 'use client';

// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Search, Calendar, MapPin, ArrowRight, Sparkles, SlidersHorizontal } from 'lucide-react';

// export default function PublicLandingPage() {
//   const router = useRouter();
//   const [searchVal, setSearchVal] = useState('');

//   const handleHeroSearchSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (searchVal.trim()) {
//       router.push(`/events?search=${encodeURIComponent(searchVal.trim())}`);
//     } else {
//       router.push('/events');
//     }
//   };

//   const trendingCategories = ['Tech', 'Music', 'Business', 'Sports', 'Art'];

//   return (
//     <div className="min-h-screen bg-white text-slate-900 font-sans antialiased flex flex-col">
      
//       {/* PUBLIC HEADBAR */}
//       <header className="h-[72px] border-b border-slate-100/80 px-8 md:px-16 flex items-center justify-between bg-white select-none">
//         <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
//           <div className="h-8 w-8 rounded-lg bg-[#6D5DFC] flex items-center justify-center text-white font-bold text-sm shadow-xs">B</div>
//           <span className="font-extrabold text-lg tracking-tight text-slate-900">BookIt</span>
//         </div>
        
//         <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-500">
//           <button onClick={() => router.push('/events')} className="hover:text-slate-900 transition-colors cursor-pointer">Explore Events</button>
//           <button onClick={() => router.push('/auth')} className="hover:text-slate-900 transition-colors cursor-pointer">List an Event</button>
//         </nav>

//         <div className="flex items-center gap-3">
//           <button onClick={() => router.push('/auth')} className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2 cursor-pointer">Sign In</button>
//           <button onClick={() => router.push('/auth')} className="bg-[#6D5DFC] hover:bg-[#5b4ee3] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer">Get Started</button>
//         </div>
//       </header>

//       {/* HERO SECTION CONTAINER */}
//       <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto pt-16 pb-20 space-y-8 animate-fade-in">
        
//         {/* Decorative Badge */}
//         <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[11px] text-[#6D5DFC] font-bold tracking-wide select-none">
//           <Sparkles className="h-3 w-3" /> Real-time Event Concurrency Guards Active
//         </div>

//         {/* Master Copy Text */}
//         <div className="space-y-4">
//           <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.08] max-w-3xl">
//             Book events that <span className="text-[#6D5DFC]">inspire</span> your journey.
//           </h1>
//           <p className="text-slate-400 text-sm md:text-base font-medium max-w-xl mx-auto leading-relaxed">
//             Discover corporate keynotes, open-source tech panels, design classes, and music live sessions backed by high-velocity concurrency systems.
//           </p>
//         </div>

//         {/* CENTRALIZED INTERACTIVE FILTER INPUT DECK */}
//         <form onSubmit={handleHeroSearchSubmit} className="w-full max-w-2xl bg-white border border-slate-200/80 p-2 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-stretch gap-2">
//           <div className="flex-1 flex items-center gap-2 px-3 bg-slate-50 border border-slate-100 rounded-xl">
//             <Search className="h-4 w-4 text-slate-400 shrink-0" />
//             <input 
//               type="text"
//               value={searchVal}
//               onChange={(e) => setSearchVal(e.target.value)}
//               placeholder="Search topics, workshop names, venues..."
//               className="w-full bg-transparent py-3 text-xs font-medium outline-none placeholder-slate-400 text-slate-900"
//             />
//           </div>
//           <button 
//             type="submit" 
//             className="bg-[#6D5DFC] hover:bg-[#5b4ee3] text-white text-xs font-bold px-6 py-3 sm:py-auto rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
//           >
//             Find Experience <ArrowRight className="h-3.5 w-3.5" />
//           </button>
//         </form>

//         {/* QUICK CATEGORY CHIPS LAYOUT */}
//         <div className="space-y-3 select-none">
//           <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Popular Filters</span>
//           <div className="flex flex-wrap items-center justify-center gap-2">
//             {trendingCategories.map((cat) => (
//               <button
//                 key={cat}
//                 onClick={() => router.push(`/events?category=${cat}`)}
//                 className="bg-white border border-slate-200 text-xs font-semibold px-4 py-1.5 rounded-xl text-slate-600 hover:border-[#6D5DFC] hover:text-[#6D5DFC] transition-all cursor-pointer shadow-2xs"
//               >
//                 {cat}
//               </button>
//             ))}
//           </div>
//         </div>

//       </main>
//     </div>
//   );
// }


'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import api from '../lib/api';

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

export default function PublicLandingPage() {
  const router = useRouter();
  
  // Dynamic Content Data Hooks
  const [masterEvents, setMasterEvents] = useState<DatabaseEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Tech', 'Music', 'Business', 'Sports', 'Art', 'Health'];

  // Load events initially on render
  useEffect(() => {
    const fetchLandingEventsData = async () => {
      try {
        const response = await api.get('/events', { params: { limit: 10 } });
        setMasterEvents(response.data.data || []);
      } catch (err) {
        console.error('Failed fetching marketplace data rows:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLandingEventsData();
  }, []);

  // CLIENT SIDE INLINE FILTER EXTRACTOR PIPELINE
  const displayCards = masterEvents.filter((event) => {
    const matchCat = selectedCategory === 'All' || event.title.toLowerCase().includes(selectedCategory.toLowerCase()) || event.description.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased flex flex-col">
      
      {/* 1. UNIVERSAL NAVBAR AS SPECIFIED IN REFERENCE IMAGE */}
      <header className="h-[72px] border-b border-slate-100 px-12 flex items-center justify-between bg-white select-none shrink-0">
        
        {/* Left Side Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
          <div className="h-8 w-8 rounded-lg bg-[#6D5DFC] flex items-center justify-center text-white font-bold text-sm shadow-sm">B</div>
          <span className="font-bold text-lg tracking-tight">BookIt</span>
        </div>

        {/* Center Anchored Primary Links Menu */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-500">
          <button onClick={() => router.push('/events')} className="hover:text-slate-900 transition-colors cursor-pointer">Events</button>
          <button onClick={() => router.push('/auth')} className="hover:text-slate-900 transition-colors cursor-pointer">My Bookings</button>
          <button onClick={() => router.push('/auth')} className="hover:text-slate-900 transition-colors cursor-pointer">Organizer</button>
          <button className="hover:text-slate-900 transition-colors cursor-pointer">About</button>
        </nav>

        {/* Right Corner Buttons */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/auth')} className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer">Log in</button>
          <button onClick={() => router.push('/auth')} className="bg-[#6D5DFC] hover:bg-[#5b4ee3] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-2xs">Sign up</button>
        </div>
      </header>

      {/* 2. MAIN HERO FRAME SECTION */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-12 py-10 space-y-12">
        <div className="relative rounded-[32px] bg-gradient-to-r from-slate-50 via-white to-slate-50/50 border border-slate-100 p-12 flex justify-between items-center overflow-hidden">
          <div className="space-y-6 max-w-xl relative z-10 text-left">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-[1.1]">
              Discover events.<br />
              <span className="text-[#6D5DFC]">Book effortlessly.</span>
            </h1>
            <p className="text-slate-400 text-xs font-medium max-w-sm leading-relaxed">
              Find and book amazing events around you. From tech conferences to live concerts.
            </p>

            {/* Input Filter Bar Wrapper */}
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm p-1.5 w-full max-w-md">
              <div className="flex items-center gap-2 px-3 flex-1">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events, concerts, workshops..." 
                  className="w-full text-xs bg-transparent outline-none text-slate-900 placeholder-slate-400 font-medium" 
                />
              </div>
              <div className="h-6 w-[1px] bg-slate-200" />
              <div className="flex items-center gap-2 px-4 text-slate-400 text-xs font-semibold shrink-0 cursor-pointer hover:text-slate-600">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Select date</span>
              </div>
              <button onClick={() => router.push('/events')} className="bg-[#6D5DFC] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer">Search</button>
            </div>
          </div>
          <div className="hidden md:block w-[320px] h-[200px] bg-gradient-to-br from-[#6D5DFC]/5 to-[#8B5CF6]/10 rounded-3xl border border-dashed border-slate-200/80 animate-pulse" />
        </div>

        {/* 3. POPULAR CATEGORIES CHIPS (INLINE FILTER GATE) */}
        <div className="space-y-3 text-left">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Popular Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)} 
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer bg-white ${
                  selectedCategory === cat 
                    ? 'bg-[#6D5DFC]/5 border-[#6D5DFC] text-[#6D5DFC]' 
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 4. FEATURED EVENTS MATRIX SECTION */}
        <div className="space-y-4 pt-2 text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Featured Events</h2>
            <button onClick={() => router.push('/events')} className="text-xs font-bold text-[#6D5DFC] flex items-center gap-1 cursor-pointer">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-semibold text-slate-400 tracking-wider font-mono animate-pulse">
              LOADING live MARKETPLACE DECK ROWS...
            </div>
          ) : displayCards.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-2xl p-12 text-center text-xs text-slate-400 font-medium">
              No matching events found in this track.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayCards.map((event) => (
                <div 
                  key={event.id} 
                  onClick={() => router.push(`/events/${event.id}`)} // TARGET DIRECT EMBED PATH
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_24px_rgba(109,93,252,0.04)] hover:border-slate-200/60 transition-all duration-300 flex flex-col group cursor-pointer"
                >
                  <div className="aspect-[14/10] w-full overflow-hidden bg-slate-50 relative">
                    <img 
                      src="https://images.unsplash.com/photo-1540574467063-178a50c2df87?q=80&w=600" 
                      alt={event.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-101" 
                    />
                    <div className="absolute top-2.5 left-2.5">
                      {event.seatsRemaining <= 0 ? (
                        <span className="bg-rose-50 text-rose-600 text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md font-mono">Sold Out</span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md font-mono">{event.seatsRemaining} Seats Left</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#6D5DFC] transition-colors line-clamp-1 tracking-tight">{event.title}</h4>
                      <div className="flex flex-col gap-0.5 text-[11px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3 shrink-0" /> {event.venue}</span>
                        <span className="flex items-center gap-1 font-mono text-[#6D5DFC] mt-0.5"><Clock className="h-3 w-3 shrink-0 text-indigo-400" /> {new Date(event.dateTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <span className="font-extrabold text-sm text-slate-900 font-mono">{event.price === 0 ? 'Free' : `₹${event.price}`}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}