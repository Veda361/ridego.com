"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import TiltWrapper from "@/components/TiltWrapper";
import { 
  Car, 
  MapPin, 
  Shield, 
  Star, 
  Navigation, 
  ArrowRight, 
  Users, 
  CheckCircle2, 
  Menu, 
  X, 
  Activity, 
  Smartphone, 
  DollarSign, 
  ShieldAlert,
  Zap
} from "lucide-react";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      Promise.resolve().then(() => {
        setUserRole(localStorage.getItem("role"));
      });
    }
  }, [user]);

  const handleGetStarted = () => {
    if (user) {
      if (userRole === "admin") {
        router.push("/admin");
      } else if (userRole === "driver") {
        router.push("/driver");
      } else {
        router.push("/dashboard");
      }
    } else {
      router.push("/login");
    }
  };

  const handleBecomeDriver = () => {
    router.push("/become-driver");
  };

  return (
    <div className="min-h-screen bg-[#070708] text-white selection:bg-brand-red selection:text-white relative">
      {/* Dynamic Background Glowing Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] bg-brand-red/10 rounded-full blur-[150px] animate-pulse-slow"></div>
        <div className="absolute bottom-[20%] right-[-10%] h-[600px] w-[600px] bg-brand-red/5 rounded-full blur-[180px] animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 h-[450px] w-[450px] bg-brand-red/5 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: "1s" }}></div>
      </div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 inset-x-0 glass-nav z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push("/")}>
            <div className="h-10 w-10 rounded-xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-center group-hover:bg-brand-red group-hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(255,51,51,0.15)] group-hover:shadow-[0_0_20px_rgba(255,51,51,0.4)]">
              <Zap size={18} className="text-brand-red group-hover:text-white transition-all duration-300" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-brand-red/90 bg-clip-text text-transparent group-hover:text-white transition-all duration-300">
              RiderGo<span className="text-brand-red">.AI</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#home" className="hover:text-white transition-colors duration-200">Home</a>
            <a href="#services" className="hover:text-white transition-colors duration-200">Services</a>
            <a href="#safety" className="hover:text-white transition-colors duration-200">Safety</a>
            <a href="#testimonials" className="hover:text-white transition-colors duration-200">Reviews</a>
            <a href="/become-driver" className="hover:text-white transition-colors duration-200 text-brand-red/90 hover:text-brand-red">Become a Driver</a>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <div className="h-9 w-20 bg-slate-800 animate-pulse rounded-full"></div>
            ) : user ? (
              <button 
                onClick={handleGetStarted}
                className="px-6 py-2.5 rounded-full bg-brand-red hover:bg-[#e62b1e] text-white font-medium text-sm transition-all duration-300 shadow-[0_0_15px_rgba(255,51,51,0.25)] hover:shadow-[0_0_25px_rgba(255,51,51,0.45)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button 
                  onClick={() => router.push("/login")}
                  className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => router.push("/register")}
                  className="px-5 py-2.5 rounded-full bg-brand-red hover:bg-[#e62b1e] text-white font-medium text-sm transition-all duration-300 shadow-[0_0_15px_rgba(255,51,51,0.25)] hover:shadow-[0_0_25px_rgba(255,51,51,0.45)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  Register
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-nav border-t border-slate-900 absolute top-20 left-0 right-0 py-6 px-6 flex flex-col gap-5 shadow-2xl animate-fade-in">
            <a 
              href="#home" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-white font-medium transition-colors"
            >
              Home
            </a>
            <a 
              href="#services" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-white font-medium transition-colors"
            >
              Services
            </a>
            <a 
              href="#safety" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-white font-medium transition-colors"
            >
              Safety
            </a>
            <a 
              href="#testimonials" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-white font-medium transition-colors"
            >
              Reviews
            </a>
            <a 
              href="/become-driver" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-brand-red font-medium transition-colors"
            >
              Become a Driver
            </a>
            <div className="h-[1px] bg-slate-900 my-1"></div>
            {user ? (
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleGetStarted();
                }}
                className="w-full py-3 rounded-xl bg-brand-red text-white font-semibold text-center transition-colors cursor-pointer"
              >
                Go to Dashboard
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/login");
                  }}
                  className="w-full py-3 rounded-xl border border-slate-800 text-slate-300 font-medium text-center hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/register");
                  }}
                  className="w-full py-3 rounded-xl bg-brand-red text-white font-semibold text-center transition-colors cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Headings & Stats */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/30 text-xs font-semibold text-brand-red mb-6 tracking-wide shadow-[0_0_15px_rgba(255,51,51,0.1)]">
              <Activity size={12} className="animate-pulse" />
              AI-POWERED SPRINT DISPATCH
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-white">
              <span className="block opacity-0 animate-reveal-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
                Your AI Ride
              </span>
              <span className="bg-gradient-to-r from-brand-red via-[#ff6666] to-white bg-clip-text text-transparent neon-text-glow block opacity-0 animate-reveal-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
                Sprint Team
              </span>
              <span className="block opacity-0 animate-reveal-up" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
                On Demand
              </span>
            </h1>
            
            <p className="mt-6 text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl opacity-0 animate-reveal-up" style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}>
              From instant request matching to optimal dispatch routes, we plug you into the most efficient transit grid. Experience smart navigation, dynamic pricing, and elite driver security.
            </p>
            
            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto opacity-0 animate-reveal-up" style={{ animationDelay: '900ms', animationFillMode: 'forwards' }}>
              <button 
                onClick={handleGetStarted}
                className="px-8 py-3.5 rounded-full bg-brand-red hover:bg-[#e62b1e] text-white font-semibold shadow-[0_0_20px_rgba(255,51,51,0.3)] hover:shadow-[0_0_35px_rgba(255,51,51,0.5)] hover:-translate-y-0.5 transition-all duration-300 text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                {user ? "Book a Ride" : "Explore Services"}
                <ArrowRight size={16} />
              </button>
              <button 
                onClick={handleBecomeDriver}
                className="px-8 py-3.5 rounded-full border border-slate-800 hover:border-slate-700 bg-slate-900/30 hover:bg-slate-900/60 text-slate-300 hover:text-white font-semibold transition-all duration-300 text-center cursor-pointer"
              >
                Become a Driver
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="mt-16 grid grid-cols-3 gap-4 w-full max-w-lg opacity-0 animate-reveal-up" style={{ animationDelay: '1100ms', animationFillMode: 'forwards' }}>
              <div className="glass-card rounded-2xl p-4 flex flex-col items-start shadow-md hover:border-brand-red/30 transition-all duration-300">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">3M+</span>
                <span className="text-xs text-slate-500 mt-1">Happy Riders</span>
              </div>
              <div className="glass-card rounded-2xl p-4 flex flex-col items-start shadow-md hover:border-brand-red/30 transition-all duration-300">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">95%</span>
                <span className="text-xs text-slate-500 mt-1">On-Time Matching</span>
              </div>
              <div className="glass-card rounded-2xl p-4 flex flex-col items-start shadow-md hover:border-brand-red/30 transition-all duration-300">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">88%</span>
                <span className="text-xs text-slate-500 mt-1">Rider Retention</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Graphic with 3D Tilt */}
          <div className="lg:col-span-5 relative flex items-center justify-center w-full">
            {/* Background Glow */}
            <div className="absolute h-[350px] w-[350px] bg-brand-red/20 rounded-full blur-[100px] pointer-events-none z-0"></div>
            
            <TiltWrapper className="w-full relative z-10 max-w-[450px]">
              <div className="relative rounded-3xl p-2 bg-gradient-to-br from-brand-red/10 to-transparent border border-white/10 overflow-hidden shadow-2xl animate-float-slow">
                <Image 
                  src="/hero-car.png" 
                  alt="Futuristic Neon Red Ride"
                  width={600}
                  height={600}
                  className="w-full h-auto object-cover rounded-2xl filter drop-shadow-[0_0_30px_rgba(255,51,51,0.3)] hover:scale-105 transition-transform duration-500 ease-out"
                  priority
                />
                
                {/* Overlay Pulse Grid */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#070708]/80 via-transparent to-transparent"></div>
              </div>

              {/* Floating Overlays */}
              <div className="absolute -top-6 -left-6 glass-card rounded-2xl p-4 shadow-xl z-20 flex items-center gap-3 border border-white/10 hover:border-brand-red/30 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red shadow-[0_0_10px_rgba(255,51,51,0.1)]">
                  <Navigation size={18} className="animate-pulse" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Dispatch System</div>
                  <div className="text-sm font-bold text-white">Active in 230+ Cities</div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 glass-card rounded-2xl p-4 shadow-xl z-20 flex items-center gap-3 border border-white/10 hover:border-brand-red/30 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
                  <Star size={18} fill="currentColor" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Driver Rating</div>
                  <div className="text-sm font-bold text-white">4.9★ Average Star</div>
                </div>
              </div>
            </TiltWrapper>
          </div>

        </div>
      </section>

      {/* Scrolling Brand Ticker */}
      <section className="py-10 border-y border-slate-900 bg-slate-950/40 relative z-10">
        <div className="max-w-7xl mx-auto px-6 overflow-hidden">
          <div className="flex gap-16 whitespace-nowrap animate-infinite-scroll text-sm font-semibold tracking-wider text-slate-600 uppercase">
            <span className="hover:text-brand-red transition-colors duration-200">VeloTransit</span>
            <span className="hover:text-brand-red transition-colors duration-200">SprintTaxi</span>
            <span className="hover:text-brand-red transition-colors duration-200">SwiftRide</span>
            <span className="hover:text-brand-red transition-colors duration-200">ApexDrive</span>
            <span className="hover:text-brand-red transition-colors duration-200">MegaCab</span>
            <span className="hover:text-brand-red transition-colors duration-200">HyperDispatch</span>
            {/* Duplicate for infinite loop */}
            <span className="hover:text-brand-red transition-colors duration-200">VeloTransit</span>
            <span className="hover:text-brand-red transition-colors duration-200">SprintTaxi</span>
            <span className="hover:text-brand-red transition-colors duration-200">SwiftRide</span>
            <span className="hover:text-brand-red transition-colors duration-200">ApexDrive</span>
            <span className="hover:text-brand-red transition-colors duration-200">MegaCab</span>
            <span className="hover:text-brand-red transition-colors duration-200">HyperDispatch</span>
          </div>
        </div>
      </section>

      {/* Services/Features Section */}
      <section id="services" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/30 text-xs font-semibold text-brand-red mb-6 tracking-wide">
            PLATFORM CAPABILITIES
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            End-to-End <span className="bg-gradient-to-r from-brand-red to-white bg-clip-text text-transparent neon-text-glow">Smart Services</span>
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            We turn passenger transit logistics into seamless experiences. Fast matching, elite-class comfort, and full security.
          </p>

          {/* Features Grid with 3D Tilt */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <TiltWrapper className="h-full">
              <div className="glass-card rounded-3xl p-8 flex flex-col items-start text-left h-full hover:border-brand-red/30 hover:shadow-[0_0_25px_rgba(255,51,51,0.15)] transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red/5 rounded-full blur-2xl group-hover:bg-brand-red/10 transition-colors pointer-events-none"></div>
                <div className="h-12 w-12 rounded-2xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red mb-6 shadow-[0_0_10px_rgba(255,51,51,0.1)]">
                  <Navigation size={22} className="group-hover:rotate-45 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold text-white">AI Route Match</h3>
                <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                  Advanced predictive matching dispatch connecting you to your driver within 10 seconds, fully optimizing navigation.
                </p>
              </div>
            </TiltWrapper>

            {/* Card 2 */}
            <TiltWrapper className="h-full">
              <div className="glass-card rounded-3xl p-8 flex flex-col items-start text-left h-full hover:border-brand-red/30 hover:shadow-[0_0_25px_rgba(255,51,51,0.15)] transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red/5 rounded-full blur-2xl group-hover:bg-brand-red/10 transition-colors pointer-events-none"></div>
                <div className="h-12 w-12 rounded-2xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red mb-6 shadow-[0_0_10px_rgba(255,51,51,0.1)]">
                  <Car size={22} className="group-hover:-translate-y-1 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold text-white">Elite Fleet Selection</h3>
                <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                  Choose from luxury zero-emission cars, luxury sedans, or utility SUVs. Clean, inspection-verified vehicles.
                </p>
              </div>
            </TiltWrapper>

            {/* Card 3 */}
            <TiltWrapper className="h-full">
              <div className="glass-card rounded-3xl p-8 flex flex-col items-start text-left h-full hover:border-brand-red/30 hover:shadow-[0_0_25px_rgba(255,51,51,0.15)] transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red/5 rounded-full blur-2xl group-hover:bg-brand-red/10 transition-colors pointer-events-none"></div>
                <div className="h-12 w-12 rounded-2xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red mb-6 shadow-[0_0_10px_rgba(255,51,51,0.1)]">
                  <DollarSign size={22} className="group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold text-white">Smart Dynamic Pricing</h3>
                <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                  Transparent, accurate fare estimates computed before booking. No hidden fees or baseline spikes.
                </p>
              </div>
            </TiltWrapper>

            {/* Card 4 */}
            <TiltWrapper className="h-full">
              <div className="glass-card rounded-3xl p-8 flex flex-col items-start text-left h-full hover:border-brand-red/30 hover:shadow-[0_0_25px_rgba(255,51,51,0.15)] transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red/5 rounded-full blur-2xl group-hover:bg-brand-red/10 transition-colors pointer-events-none"></div>
                <div className="h-12 w-12 rounded-2xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red mb-6 shadow-[0_0_10px_rgba(255,51,51,0.1)]">
                  <Shield size={22} className="group-hover:rotate-[360deg] transition-transform duration-700" />
                </div>
                <h3 className="text-xl font-bold text-white">Full Safety Protocols</h3>
                <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                  Background-checked drivers, real-time trip GPS tracking shareable with family, and a 24/7 SOS safety helpline.
                </p>
              </div>
            </TiltWrapper>

          </div>
        </div>
      </section>

      {/* Safety / Globally Active Split Section */}
      <section id="safety" className="py-20 relative z-10 bg-slate-950/30 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Glassmorphic Visual Content */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-red/20 to-transparent rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative glass-card rounded-3xl p-8 md:p-12 overflow-hidden flex flex-col items-start text-left min-h-[400px] justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/20 text-xs font-semibold text-brand-red mb-6">
                  GLOBAL DISPATCH CENTER
                </div>
                <h3 className="text-3xl font-black tracking-tight leading-none text-white">
                  Based in Silicon Valley, <br />
                  <span className="text-brand-red">Active Worldwide.</span>
                </h3>
                <p className="text-slate-400 text-sm mt-4 leading-relaxed max-w-sm">
                  Connecting drivers and riders securely across international city hubs. Optimized for continuous runtime.
                </p>
              </div>
              
              {/* Fake Live Dispatch Grid */}
              <div className="w-full mt-10 rounded-2xl bg-[#09090b] border border-slate-900 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>DISPATCH LOGS</span>
                  <span className="flex items-center gap-1.5 text-green-500">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
                    ALL SYSTEMS OK
                  </span>
                </div>
                
                <div className="flex flex-col gap-3 font-mono text-[11px] text-slate-400">
                  <div className="flex items-center justify-between border-b border-slate-900/50 pb-2">
                    <span className="text-slate-300">RIDE_MATCH_ID_87F</span>
                    <span className="text-brand-red">DISPATCHED</span>
                    <span className="text-slate-500">2s ago</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-900/50 pb-2">
                    <span className="text-slate-300">ROUTE_OPTIMIZATION_OK</span>
                    <span className="text-white">ETA_3_MIN</span>
                    <span className="text-slate-500">9s ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">SECURITY_CHECK_SUCCESS</span>
                    <span className="text-slate-500">SECURE_SSL</span>
                    <span className="text-slate-500">14s ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Info and Testimonial metrics */}
          <div className="flex flex-col items-start text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              We design transport grids with <span className="text-brand-red">people</span> at the core, ensuring maximum security.
            </h3>
            
            <p className="mt-6 text-slate-400 text-sm sm:text-base leading-relaxed">
              Every driver on our platform undergoes a rigorous multi-step safety background check, route optimization test, and vehicle inspection protocol before receiving booking authorizations.
            </p>

            <div className="mt-8 flex flex-col gap-4 w-full">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-brand-red shrink-0" size={18} />
                <span className="text-sm font-semibold text-slate-300">Biometric verification check for drivers</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-brand-red shrink-0" size={18} />
                <span className="text-sm font-semibold text-slate-300">Share ride details instantly with contact groups</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-brand-red shrink-0" size={18} />
                <span className="text-sm font-semibold text-slate-300">24/7 incident tracking and helpline access</span>
              </div>
            </div>

            {/* Micro Client Testimonial */}
            <div className="mt-10 border-t border-slate-900 pt-8 flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-brand-red">
                AC
              </div>
              <div>
                <p className="text-slate-300 text-xs italic">
                  {"\"RiderGo AI is incredibly reliable. Matches are almost instant, and the cars are always clean and comfortable.\""}
                </p>
                <div className="text-[11px] text-slate-500 mt-2 font-bold uppercase">
                  Ava Collins — Passenger & Commuter
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Testimonials Grid */}
      <section id="testimonials" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/30 text-xs font-semibold text-brand-red mb-6 tracking-wide">
            PASSENGER FEEDBACK
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Loved By <span className="bg-gradient-to-r from-brand-red to-white bg-clip-text text-transparent neon-text-glow">Our Riders</span>
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Real stories from riders and drivers using our smart transit platform.
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Testimonial 1 */}
            <TiltWrapper>
              <div className="glass-card rounded-3xl p-8 flex flex-col justify-between h-full hover:border-brand-red/30 hover:shadow-[0_0_20px_rgba(255,51,51,0.1)] transition-all duration-300 relative group">
                <div>
                  <div className="flex gap-1 text-brand-red mb-6">
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {"\"Super clean UI. I was able to book a premium ride in seconds, and my driver was extremely polite and arrived early.\""}
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-900/50">
                  <div className="h-10 w-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-xs text-indigo-400">
                    KP
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Kamlesh Patel</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Corporate Client</p>
                  </div>
                </div>
              </div>
            </TiltWrapper>

            {/* Testimonial 2 */}
            <TiltWrapper>
              <div className="glass-card rounded-3xl p-8 flex flex-col justify-between h-full hover:border-brand-red/30 hover:shadow-[0_0_20px_rgba(255,51,51,0.1)] transition-all duration-300 relative group">
                <div>
                  <div className="flex gap-1 text-brand-red mb-6">
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {"\"Being a driver, the dispatcher matches me with optimal pick-ups, keeping my active wait times down to under 5 minutes!\""}
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-900/50">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-xs text-emerald-400">
                    SJ
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Sarah Jenkins</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Verified Driver Partner</p>
                  </div>
                </div>
              </div>
            </TiltWrapper>

            {/* Testimonial 3 */}
            <TiltWrapper>
              <div className="glass-card rounded-3xl p-8 flex flex-col justify-between h-full hover:border-brand-red/30 hover:shadow-[0_0_20px_rgba(255,51,51,0.1)] transition-all duration-300 relative group">
                <div>
                  <div className="flex gap-1 text-brand-red mb-6">
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {"\"I love the dynamic map. My ride routing dynamically dodged a huge traffic gridlock. It saved me at least 20 minutes!\""}
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-900/50">
                  <div className="h-10 w-10 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center font-bold text-xs text-violet-400">
                    AR
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Alex Rivera</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Product Designer</p>
                  </div>
                </div>
              </div>
            </TiltWrapper>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-10 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-red/35 to-transparent rounded-3xl blur-[120px] opacity-30 -z-10"></div>
          
          <div className="glass-card rounded-3xl p-10 md:p-16 border border-white/10 hover:border-brand-red/30 transition-all duration-300 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Ready for a Premium Travel Experience?</h2>
            <p className="text-slate-400 text-sm md:text-base mt-4 max-w-lg mx-auto">
              Register an account today, and enjoy a seamless travel journey backed by AI dispatch optimization.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleGetStarted}
                className="px-8 py-3.5 rounded-full bg-brand-red hover:bg-[#e62b1e] text-white font-semibold shadow-[0_0_20px_rgba(255,51,51,0.25)] hover:shadow-[0_0_35px_rgba(255,51,51,0.45)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                Book Your Ride
              </button>
              <button 
                onClick={handleBecomeDriver}
                className="px-8 py-3.5 rounded-full border border-slate-800 hover:border-slate-700 bg-slate-900/30 hover:bg-slate-900/60 text-slate-300 hover:text-white font-semibold transition-all duration-300 cursor-pointer"
              >
                Become a Driver Partner
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 relative z-10 py-16 text-left">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12">
          
          {/* Logo & Status */}
          <div className="md:col-span-4 flex flex-col items-start">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-brand-red/10 border border-brand-red/30 flex items-center justify-center">
                <Zap size={16} className="text-brand-red" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                RiderGo<span className="text-brand-red">.AI</span>
              </span>
            </div>
            
            <p className="text-slate-500 text-xs mt-4 leading-relaxed max-w-sm">
              Creating dynamic dispatch algorithms and clean passenger transportation layouts. Optimized globally.
            </p>

            <div className="mt-6 flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              ALL SYSTEMS OPERATIONAL
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-2"></div>

          {/* Links Column 1 */}
          <div className="md:col-span-3 flex flex-col items-start">
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase">Platform</h4>
            <div className="mt-4 flex flex-col gap-3 text-xs text-slate-500 font-medium">
              <a href="#home" className="hover:text-white transition-colors">Book a Ride</a>
              <a href="/become-driver" className="hover:text-white transition-colors">Join as Driver</a>
              <a href="#safety" className="hover:text-white transition-colors">Safety Guidelines</a>
              <a href="/login" className="hover:text-white transition-colors">Sign In Portal</a>
            </div>
          </div>

          {/* Links Column 2 */}
          <div className="md:col-span-3 flex flex-col items-start">
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase">Legal & Help</h4>
            <div className="mt-4 flex flex-col gap-3 text-xs text-slate-500 font-medium">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Incident Support</a>
              <a href="#" className="hover:text-white transition-colors">Contact Relations</a>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-600 font-medium">
          <div>© {new Date().getFullYear()} RiderGo.AI. All rights reserved.</div>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-slate-400 transition-colors">Twitter</a>
            <a href="#" className="hover:text-slate-400 transition-colors">GitHub</a>
            <a href="#" className="hover:text-slate-400 transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}