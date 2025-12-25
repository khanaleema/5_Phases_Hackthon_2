'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ListTodo,
  Calendar,
  Settings,
  LogOut,
  Sun,
  Moon,
  Grid3x3,
  X,
  Plus,
  Sparkles,
  User,
} from 'lucide-react';
import { authClient } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onCreateTask?: () => void;
}

export function Sidebar({ sidebarOpen, setSidebarOpen, darkMode, setDarkMode, onCreateTask }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  
  // Get user name from user object or email
  const userName = (user as any)?.name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';

  // Initialize theme from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const theme = localStorage.getItem('theme');
      const isDarkMode = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setIsDark(isDarkMode);
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  // Sync darkMode prop with local state
  useEffect(() => {
    setDarkMode(isDark);
  }, [isDark, setDarkMode]);

  // Load profile image from localStorage
  useEffect(() => {
    if (user?.id && typeof window !== 'undefined') {
      const loadImage = () => {
        const savedImage = localStorage.getItem(`profile_image_${user.id}`);
        if (savedImage) {
          setProfileImage(savedImage);
        } else {
          setProfileImage(null);
        }
      };
      
      // Load initially
      loadImage();
      
      // Listen for storage changes (when profile image is updated)
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === `profile_image_${user.id}`) {
          loadImage();
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      // Also listen for custom event (for same-tab updates)
      const handleCustomStorageChange = () => {
        loadImage();
      };
      
      window.addEventListener('profileImageUpdated', handleCustomStorageChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('profileImageUpdated', handleCustomStorageChange);
      };
    }
  }, [user?.id]);

  // Listen for user updates (when name is changed)
  useEffect(() => {
    const handleUserUpdate = () => {
      // Force re-render to get updated user name
      // The userName will be recalculated from user object
      if (user) {
        // Trigger a re-render by updating a state if needed
        // The userName is computed from user object, so it should update automatically
      }
    };
    
    window.addEventListener('userUpdated', handleUserUpdate);
    return () => window.removeEventListener('userUpdated', handleUserUpdate);
  }, [user]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success('Signed out successfully');
      router.push('/signin');
    } catch (error: any) {
      console.error('Sign out error:', error);
      router.push('/signin');
    }
  };

  const navItems = [
    { href: '/dashboard', icon: Grid3x3, label: 'Dashboard' },
    { href: '/tasks', icon: ListTodo, label: 'Tasks' },
    { href: '/calendar', icon: Calendar, label: 'Calendar' },
    { href: '/profile', icon: User, label: 'Profile' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-zinc-800">
            <Link href="/dashboard" className="flex items-center gap-2">
              <img src="/image.png" alt="TaskVault" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold text-slate-900 dark:text-white">TaskVault</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded transition"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Create Task Button */}
          {onCreateTask && (
            <div className="px-4 pt-4">
              <button
                onClick={() => {
                  onCreateTask();
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium text-sm transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                Quick Add Task
              </button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all transform hover:scale-105',
                    isActive
                      ? 'text-white bg-purple-600 dark:bg-purple-500 shadow-md'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User info & Actions */}
          <div className="p-4 border-t border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-white dark:border-zinc-900 shadow-md">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-white">
                    {userName[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {userName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {userEmail}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => {
                  const newIsDark = !isDark;
                  setIsDark(newIsDark);
                  
                  if (newIsDark) {
                    document.documentElement.classList.add('dark');
                    localStorage.setItem('theme', 'dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    localStorage.setItem('theme', 'light');
                  }
                  
                  setDarkMode(newIsDark);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>Theme</span>
              </button>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

