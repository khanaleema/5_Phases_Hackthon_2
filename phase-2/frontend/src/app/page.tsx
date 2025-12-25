'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  Shield, 
  Zap, 
  Lock, 
  Database, 
  Smartphone,
  ArrowRight,
  BarChart3,
  Calendar,
  TrendingUp,
  Users,
  Sparkles,
  Target,
  Heart,
  Code,
  Globe,
  Rocket,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
    
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            setVisibleSections((prev) => new Set(prev).add(sectionId));
          }
        });
      },
      { 
        threshold: 0.15,
        rootMargin: '-50px 0px -50px 0px'
      }
    );

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const sections = document.querySelectorAll('section[id]');
      sections.forEach((section) => {
        if (section.id) {
          observer.observe(section);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      const sections = document.querySelectorAll('section[id]');
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <img 
                  src="/image.png" 
                  alt="TaskVault" 
                  className="relative w-10 h-10 object-contain bg-transparent transform group-hover:scale-110 transition-transform" 
                />
            </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TaskVault
              </span>
            </Link>
            
            {/* Center Navigation Links */}
            <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              <Link
                href="#features"
                className="text-sm font-semibold text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 transition-colors relative group"
              >
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link
                href="#about"
                className="text-sm font-semibold text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 transition-colors relative group"
              >
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>
            
            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              <Link href="/signin">
                <Button 
                  variant="ghost"
                  className="text-sm font-semibold text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 hidden sm:block"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/signin">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                Get Started
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 dark:from-zinc-900 dark:via-purple-950 dark:to-zinc-900"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-200 dark:bg-cyan-900/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-full border border-slate-200 dark:border-zinc-800 mb-8 shadow-lg animate-scale-in">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Modern Task Management Platform
                </span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight mb-6 animate-fade-in-up animate-delay-100">
                Stay Organized,
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                  Stay Productive
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed animate-fade-in-up animate-delay-200">
                Experience lightning-fast task management with{' '}
                <span className="font-semibold text-slate-900 dark:text-white">enterprise-grade security</span>.
                Your data is isolated, encrypted, and always accessible.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12 animate-fade-in-up animate-delay-300">
                <Link href="/signin">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 transition-all text-lg px-8 py-6"
                  >
                    Start Free Today
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="px-8 py-6 text-lg font-semibold text-slate-700 dark:text-slate-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 animate-fade-in-up animate-delay-400">
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-zinc-800 shadow-lg transform hover:scale-105 transition-transform">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">100%</div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">Secure</div>
                </div>
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-zinc-800 shadow-lg transform hover:scale-105 transition-transform">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">&lt;100ms</div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">Fast</div>
                </div>
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-zinc-800 shadow-lg transform hover:scale-105 transition-transform">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">24/7</div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">Available</div>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative hidden lg:block animate-fade-in-right animate-delay-200">
              <div className="relative animate-float">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-3xl opacity-30 animate-pulse"></div>
                
                {/* Main Card */}
                <div className="relative bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-zinc-800 transform hover:scale-105 transition-transform duration-500">
                  {/* Logo Section */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                      <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 dark:from-zinc-800 dark:to-zinc-900 p-6 rounded-2xl shadow-xl">
                        <img 
                          src="/image.png" 
                          alt="TaskVault Logo" 
                          className="w-32 h-32 object-contain transform group-hover:scale-110 transition-transform duration-300" 
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Feature Pills */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-950 dark:to-blue-900 rounded-xl p-4 text-center transform hover:scale-105 transition-transform">
                      <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">Task Management</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-950 dark:to-purple-900 rounded-xl p-4 text-center transform hover:scale-105 transition-transform">
                      <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">Analytics</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-950 dark:to-green-900 rounded-xl p-4 text-center transform hover:scale-105 transition-transform">
                      <Calendar className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">Calendar</div>
                    </div>
                    <div className="bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-950 dark:to-pink-900 rounded-xl p-4 text-center transform hover:scale-105 transition-transform">
                      <Shield className="w-6 h-6 text-pink-600 dark:text-pink-400 mx-auto mb-2" />
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">Secure</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-reveal ${visibleSections.has('features') ? 'revealed' : ''}`}>
        <div className={`text-center mb-16 ${visibleSections.has('features') ? 'animate-fade-in-down opacity-100' : 'opacity-0'}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Enterprise Features, Zero Complexity
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Everything you need to manage tasks efficiently and securely
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1: User Isolation */}
          <div className={`p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 hover:shadow-lg transition-all hover:-translate-y-1 ${visibleSections.has('features') ? 'animate-fade-in-up animate-delay-100 opacity-100' : 'opacity-0'}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-950 dark:to-blue-900 rounded-xl flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Complete User Isolation
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Your tasks are completely isolated from other users. Every query filters by your unique user ID for maximum privacy.
            </p>
          </div>

          {/* Feature 2: Fast API */}
          <div className={`p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 hover:shadow-lg transition-all hover:-translate-y-1 ${visibleSections.has('features') ? 'animate-fade-in-up animate-delay-200 opacity-100' : 'opacity-0'}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-950 dark:to-green-900 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Lightning Fast
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Built on FastAPI backend with optimistic UI updates. Changes appear instantly while syncing in the background.
            </p>
          </div>

          {/* Feature 3: Secure Auth */}
          <div className={`p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 hover:shadow-lg transition-all hover:-translate-y-1 ${visibleSections.has('features') ? 'animate-fade-in-up animate-delay-300 opacity-100' : 'opacity-0'}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-950 dark:to-purple-900 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              JWT Authentication
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Stateless JWT tokens with Better Auth. Secure, scalable, and compliant with modern security standards.
            </p>
          </div>

          {/* Feature 4: PostgreSQL */}
          <div className={`p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 hover:shadow-lg transition-all hover:-translate-y-1 ${visibleSections.has('features') ? 'animate-fade-in-up animate-delay-400 opacity-100' : 'opacity-0'}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-950 dark:to-cyan-900 rounded-xl flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Production-Grade Database
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Powered by Neon Serverless PostgreSQL. ACID guarantees, automatic backups, and infinite scalability.
            </p>
          </div>

          {/* Feature 5: Mobile First */}
          <div className={`p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 hover:shadow-lg transition-all hover:-translate-y-1 ${visibleSections.has('features') ? 'animate-fade-in-up animate-delay-500 opacity-100' : 'opacity-0'}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-950 dark:to-orange-900 rounded-xl flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Mobile-First Design
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Beautiful responsive design that works perfectly on any device, from mobile phones to large displays.
            </p>
          </div>

          {/* Feature 6: Analytics */}
          <div className={`p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 hover:shadow-lg transition-all hover:-translate-y-1 ${visibleSections.has('features') ? 'animate-fade-in-up animate-delay-500 opacity-100' : 'opacity-0'}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-950 dark:to-pink-900 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Advanced Analytics
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Track your productivity with detailed analytics, completion rates, and task trends over time.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-reveal ${visibleSections.has('about') ? 'revealed' : ''}`}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className={visibleSections.has('about') ? 'animate-fade-in-left opacity-100' : 'opacity-0'}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-950 rounded-full mb-6">
              <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">About TaskVault</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
              Built for Modern Productivity
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              TaskVault is a modern task management platform designed to help you stay organized and productive. 
              We combine cutting-edge technology with intuitive design to create an experience that just works.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Our mission is to provide a secure, fast, and accessible task management solution that scales with your needs. 
              Whether you're managing personal tasks or coordinating team projects, TaskVault has you covered.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-950 dark:to-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">User-Focused</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Designed with your needs in mind</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-950 dark:to-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Code className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Open Source</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Built on modern, open technologies</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-950 dark:to-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Rocket className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Fast & Reliable</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Lightning-fast performance</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-950 dark:to-cyan-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Accessible</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Works for everyone, everywhere</p>
                </div>
              </div>
            </div>
          </div>
          <div className={`relative ${visibleSections.has('about') ? 'animate-fade-in-right animate-delay-200 opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl blur-3xl animate-pulse"></div>
            <div className="relative bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-slate-200 dark:border-zinc-800 shadow-2xl transform hover:scale-105 transition-transform duration-500">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-950 dark:to-blue-900 rounded-xl flex items-center justify-center">
                    <img src="/image.png" alt="TaskVault" className="w-10 h-10 object-contain" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">TaskVault</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Modern Task Management</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-zinc-800 rounded-xl p-4">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Next.js 15</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Frontend Framework</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-800 rounded-xl p-4">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">FastAPI</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Backend API</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-800 rounded-xl p-4">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">PostgreSQL</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Database</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-800 rounded-xl p-4">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">JWT</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Authentication</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className={`bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 dark:from-zinc-900 dark:via-purple-950 dark:to-zinc-900 py-20 scroll-reveal ${visibleSections.has('how-it-works') ? 'revealed' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 ${visibleSections.has('how-it-works') ? 'animate-fade-in-down opacity-100' : 'opacity-0'}`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Get started in minutes with our simple, intuitive workflow
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className={`text-center ${visibleSections.has('how-it-works') ? 'animate-fade-in-up animate-delay-100 opacity-100' : 'opacity-0'}`}>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform hover:scale-110 transition-transform">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Sign Up</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Create your free account in seconds. No credit card required, no complicated setup.
              </p>
            </div>
            
            <div className={`text-center ${visibleSections.has('how-it-works') ? 'animate-fade-in-up animate-delay-200 opacity-100' : 'opacity-0'}`}>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform hover:scale-110 transition-transform">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Create Tasks</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Add your tasks with titles, descriptions, due dates, priorities, and categories. Organize them your way.
              </p>
            </div>
            
            <div className={`text-center ${visibleSections.has('how-it-works') ? 'animate-fade-in-up animate-delay-300 opacity-100' : 'opacity-0'}`}>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform hover:scale-110 transition-transform">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Stay Productive</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Track your progress with analytics, view your calendar, and achieve your goals faster.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Showcase */}
      <section id="stats" className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-reveal ${visibleSections.has('stats') ? 'revealed' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 ${visibleSections.has('stats') ? 'animate-fade-in-down opacity-100' : 'opacity-0'}`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Powerful Insights at Your Fingertips
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Visualize your productivity with beautiful charts and analytics
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className={`bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 text-center transform hover:scale-105 transition-transform ${visibleSections.has('stats') ? 'animate-fade-in-up animate-delay-100 opacity-100' : 'opacity-0'}`}>
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-950 dark:to-red-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">In Progress</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Active Tasks</div>
            </div>
            
            <div className={`bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 text-center transform hover:scale-105 transition-transform ${visibleSections.has('stats') ? 'animate-fade-in-up animate-delay-200 opacity-100' : 'opacity-0'}`}>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-950 dark:to-green-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Done</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Completed Tasks</div>
            </div>
            
            <div className={`bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 text-center transform hover:scale-105 transition-transform ${visibleSections.has('stats') ? 'animate-fade-in-up animate-delay-300 opacity-100' : 'opacity-0'}`}>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-950 dark:to-blue-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">All Tasks</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Overview</div>
            </div>
            
            <div className={`bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 text-center transform hover:scale-105 transition-transform ${visibleSections.has('stats') ? 'animate-fade-in-up animate-delay-400 opacity-100' : 'opacity-0'}`}>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-950 dark:to-purple-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">This Week</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Weekly Activity</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-reveal ${visibleSections.has('cta') ? 'revealed' : ''}`}>
        <div className={`bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 dark:from-zinc-900 dark:via-purple-950 dark:to-zinc-900 rounded-3xl p-12 md:p-16 text-center shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden relative ${visibleSections.has('cta') ? 'animate-scale-in opacity-100' : 'opacity-0'}`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Ready to Get Organized?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust TaskVault for their daily task management.
              Sign up now and experience the difference.
            </p>
            <Link href="/signin">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-105 transition-all"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/image.png" 
                alt="TaskVault" 
                className="w-8 h-8 object-contain bg-transparent" 
              />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TaskVault
              </span>
            </div>
            <div className="text-center md:text-right text-sm text-slate-600 dark:text-slate-400">
              <p>&copy; 2025 TaskVault. Built with Next.js 15, FastAPI, and PostgreSQL.</p>
              <p className="mt-1">Secure · Fast · Accessible</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
