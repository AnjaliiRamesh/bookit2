'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck, Ticket, Layers, Users, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const { login, signup } = useAuth();
  
  // Interface Configuration States
  const [isLoginView, setIsLoginView] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Controlled Form Inputs Data Slots
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'USER' | 'ORGANIZER'>('USER'); // Defaults to standard attendee 'USER'
  
  // State Error Tracking Elements
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (isLoginView) {
        // Direct Action Trigger to auth.controller.ts via custom AuthContext pipeline
        await login(email, password);
      } else {
        // Registration Client-side Parameter Verification Guards
        if (password !== confirmPassword) {
          throw new Error("Password entries do not match. Please verify.");
        }
        if (password.length < 6) {
          throw new Error("Security password must contain at least 6 characters.");
        }
        
        // Triggers creation workflow mapping fields exactly down to backend /signup route
        await signup(name, email, password, selectedRole);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected validation exception has occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-stretch font-sans select-none antialiased">
      
      {/* LEFT COLUMN PANEL: ILLUSTRATIVE VALUE-PROPS CAROUSEL FRAME */}
      <div className="hidden lg:flex lg:w-[42%] bg-gradient-to-br from-slate-900 via-indigo-950 to-[#2e1a4a] text-white p-12 flex-col justify-between relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200')] bg-cover bg-center mix-blend-overlay opacity-20 pointer-events-none" />
        
        {/* Brand Core Identity Banner Row */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-indigo-600/30">
            B
          </div>
          <span className="font-extrabold text-xl tracking-tight">BookIt</span>
        </div>

        {/* Feature Value Props Stacks matching Image Blueprint Text labels */}
        <div className="space-y-8 my-auto relative z-10 max-w-sm">
          <h2 className="text-4xl font-extrabold tracking-tight leading-[1.15]">
            {isLoginView ? "Book events that inspire you" : "Create events. Inspire people."}
          </h2>
          <p className="text-slate-400 text-xs font-medium leading-relaxed">
            {isLoginView 
              ? "Discover and book amazing events happening around you. Secure tickets within seconds cleanly."
              : "Join thousands of organizers and attendees on BookIt. Build, track, and publish your experiences effortlessly."
            }
          </p>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100">Find Amazing Events</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Explore local summits, live concerts, business meetups, and creative classes.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0">
                <Ticket className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100">Easy Booking Channels</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Reserve seat allocations seamlessly with transactional inventory race-guards.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100">Organize & Scale Portals</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Launch registration pipelines, monitor revenue analytics, and export logs instantly.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Static Block Quote Footer Signoff */}
        <div className="relative z-10 select-none bg-white/5 border border-white/10 p-4 rounded-xl max-w-sm backdrop-blur-xs">
          <p className="text-[11px] font-medium italic text-slate-300">
            "The system is built extremely clean, and data synchronization between transactional rows responds beautifully."
          </p>
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono mt-2">— Platform Verification Team</span>
        </div>
      </div>

      {/* RIGHT COLUMN PANEL: DATA PROCESSING ENTRY CANVAS */}
      <div className="flex-1 bg-white flex flex-col justify-center items-center px-6 py-12 md:px-16 overflow-y-auto">
        <div className="w-full max-w-[400px] space-y-6 animate-fade-in">
          
          {/* Headline Message Segment Block */}
          <div className="space-y-1 text-left select-none">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {isLoginView ? "Welcome back 👋" : "Create your account ✨"}
            </h1>
            <p className="text-slate-400 text-xs font-medium">
              {isLoginView ? "Sign in to your account to continue" : "Sign up to start your journey tracking experiences"}
            </p>
          </div>

          {/* Core Processing Errors Alert Box */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* MASTER CONTROLLABLE AUTH SUBMISSION INPUT DECK */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            {/* Conditional Input Slot: Complete User Name (Only displayed during Sign Up lifecycle) */}
            {!isLoginView && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Full Name</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3.5 py-2.5 rounded-xl text-sm focus-within:border-indigo-600 focus-within:bg-white transition-all">
                  <User className="h-4 w-4 text-slate-400 shrink-0" />
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name" 
                    className="w-full bg-transparent outline-none text-slate-900 placeholder-slate-400 text-xs font-medium"
                  />
                </div>
              </div>
            )}

            {/* Input Slot: Communication Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Email address</label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3.5 py-2.5 rounded-xl text-sm focus-within:border-indigo-600 focus-within:bg-white transition-all">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" 
                  className="w-full bg-transparent outline-none text-slate-900 placeholder-slate-400 text-xs font-medium"
                />
              </div>
            </div>

            {/* Input Slot: Verification Hashed Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600">Password</label>
                {isLoginView && <button type="button" className="text-xs font-semibold text-indigo-600 hover:underline">Forgot password?</button>}
              </div>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3.5 py-2.5 rounded-xl text-sm focus-within:border-indigo-600 focus-within:bg-white transition-all">
                <Lock className="h-4 w-4 text-slate-400 shrink-0" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLoginView ? "Enter your password" : "Create a password"} 
                  className="w-full bg-transparent outline-none text-slate-900 placeholder-slate-400 text-xs font-medium font-mono"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600 shrink-0">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Conditional Input Slot: Secondary Password Match Verification (Sign Up only) */}
            {!isLoginView && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Confirm password</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3.5 py-2.5 rounded-xl text-sm focus-within:border-indigo-600 focus-within:bg-white transition-all">
                  <Lock className="h-4 w-4 text-slate-400 shrink-0" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password" 
                    className="w-full bg-transparent outline-none text-slate-900 placeholder-slate-400 text-xs font-medium font-mono"
                  />
                </div>
              </div>
            )}

            {/* Conditional Input Row Section: Dual-Role Action Button Selectors (Sign Up only matching image reference mockup boxes) */}
            {!isLoginView && (
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-slate-600">I am joining as</label>
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Option Block A: Attendee Choice Mode Mapping role enum target to database "USER" profile row constraint */}
                  <div 
                    onClick={() => setSelectedRole('USER')}
                    className={`border p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                      selectedRole === 'USER' 
                        ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600' 
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <User className={`h-4 w-4 ${selectedRole === 'USER' ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-800">Attendee</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Book & visit events</p>
                      </div>
                    </div>
                    <input type="radio" checked={selectedRole === 'USER'} readOnly className="accent-indigo-600 h-3.5 w-3.5" />
                  </div>

                  {/* Option Block B: Organizer Choice Mode Mapping role enum target exactly to database "ORGANIZER" row model constraint */}
                  <div 
                    onClick={() => setSelectedRole('ORGANIZER')}
                    className={`border p-3.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                      selectedRole === 'ORGANIZER' 
                        ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600' 
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className={`h-4 w-4 ${selectedRole === 'ORGANIZER' ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-800">Organizer</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Manage & list events</p>
                      </div>
                    </div>
                    <input type="radio" checked={selectedRole === 'ORGANIZER'} readOnly className="accent-indigo-600 h-3.5 w-3.5" />
                  </div>

                </div>
              </div>
            )}

            {/* Checkbox Policy Agreement Acceptance Node Label Bar */}
            {isLoginView ? (
              <div className="flex items-center gap-2 py-1">
                <input type="checkbox" id="remember" className="accent-indigo-600 h-3.5 w-3.5 cursor-pointer rounded" />
                <label htmlFor="remember" className="text-xs font-medium text-slate-500 cursor-pointer select-none">Remember me</label>
              </div>
            ) : (
              <div className="flex items-start gap-2 py-1 select-none">
                <input type="checkbox" required id="terms" className="accent-indigo-600 h-3.5 w-3.5 cursor-pointer rounded mt-0.5" />
                <label htmlFor="terms" className="text-xs font-medium text-slate-500 leading-tight cursor-pointer">
                  I agree to the <span className="text-indigo-600 hover:underline font-semibold">Terms of Service</span> and <span className="text-indigo-600 hover:underline font-semibold">Privacy Policy</span>
                </label>
              </div>
            )}

            {/* Central Call-To-Action Operations Execution Submission Trigger Node */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs py-3 rounded-xl transition-all shadow-md shadow-indigo-600/10 mt-2 cursor-pointer"
            >
              {isSubmitting ? "Processing Request..." : isLoginView ? "Sign in" : "Sign up"}
            </button>
          </form>

          {/* Separator Accent Ribbon Bar Line */}
          <div className="flex items-center my-4 select-none">
            <div className="flex-1 border-t border-slate-200" />
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">or continue with</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Social Authenticator Third-Party Integration Matrix Mocks */}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="flex items-center justify-center gap-2 border border-slate-200 rounded-xl py-2 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-3.5 w-3.5" /> Google
            </button>
            <button type="button" className="flex items-center justify-center gap-2 border border-slate-200 rounded-xl py-2 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
              <img src="https://www.svgrepo.com/show/475636/apple-color.svg" alt="Apple" className="h-3.5 w-3.5" /> Apple
            </button>
          </div>

          {/* Bottom Flip Link Tracking Node */}
          <p className="text-center text-xs text-slate-500 pt-4 font-medium select-none">
            {isLoginView ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              onClick={() => { setIsLoginView(!isLoginView); setErrorMessage(null); }}
              className="text-indigo-600 font-bold hover:underline cursor-pointer ml-0.5"
            >
              {isLoginView ? "Sign up" : "Sign in"}
            </button>
          </p>

        </div>
      </div>

    </div>
  );
}