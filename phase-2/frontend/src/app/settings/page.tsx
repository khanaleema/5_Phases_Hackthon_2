'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Save, User, Mail, Moon, Sun, Shield, Trash2, Download, ChevronRight, ChevronLeft, Check, Lock, Key, Eye, EyeOff, Globe, Info, HelpCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authClient } from '@/lib/auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Step = 'security' | 'appearance' | 'privacy' | 'about';

const steps: { id: Step; label: string; icon: typeof Shield }[] = [
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Sun },
  { id: 'privacy', label: 'Privacy', icon: Lock },
  { id: 'about', label: 'About', icon: Info },
];


export default function SettingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('security');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Security states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Appearance settings
  const [appearance, setAppearance] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('appearance_settings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Fallback to defaults
        }
      }
    }
    return {
      theme: 'system',
      fontSize: 'medium',
      compactMode: false,
    };
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('privacy_settings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Fallback to defaults
        }
      }
    }
    return {
      profileVisibility: 'public',
      showEmail: true,
      analytics: false,
    };
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, isLoading, router]);


  // Update appearance settings
  const updateAppearance = (key: string, value: any) => {
    const updated = { ...appearance, [key]: value };
    setAppearance(updated);
    localStorage.setItem('appearance_settings', JSON.stringify(updated));
    
    // Apply theme immediately if changed
    if (key === 'theme') {
      if (value === 'dark') {
        document.documentElement.classList.add('dark');
        setDarkMode(true);
        localStorage.setItem('theme', 'dark');
      } else if (value === 'light') {
        document.documentElement.classList.remove('dark');
        setDarkMode(false);
        localStorage.setItem('theme', 'light');
      } else {
        // System theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
          setDarkMode(true);
        } else {
          document.documentElement.classList.remove('dark');
          setDarkMode(false);
        }
        localStorage.removeItem('theme');
      }
    }
    
    // Apply font size immediately
    if (key === 'fontSize') {
      const root = document.documentElement;
      root.style.fontSize = value === 'small' ? '14px' : value === 'large' ? '18px' : '16px';
    }
    
    // Apply compact mode
    if (key === 'compactMode') {
      const root = document.documentElement;
      if (value) {
        root.classList.add('compact-mode');
      } else {
        root.classList.remove('compact-mode');
      }
    }
    
    toast.success('Appearance updated');
  };

  // Update privacy settings
  const updatePrivacy = (key: string, value: any) => {
    const updated = { ...privacy, [key]: value };
    setPrivacy(updated);
    localStorage.setItem('privacy_settings', JSON.stringify(updated));
    toast.success('Privacy setting updated');
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!currentPassword) {
      setErrors({ currentPassword: 'Current password is required' });
      return;
    }

    if (!newPassword) {
      setErrors({ newPassword: 'New password is required' });
      return;
    }

    if (newPassword.length < 8) {
      setErrors({ newPassword: 'Password must be at least 8 characters' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    if (currentPassword === newPassword) {
      setErrors({ newPassword: 'New password must be different from current password' });
      return;
    }

    setLoading(true);
    try {
      // Verify current password first
      const verifyResult = await authClient.signIn.email({
        email: user?.email || '',
        password: currentPassword,
      });

          if (verifyResult.error) {
            toast.error('Current password is incorrect');
            setErrors({ currentPassword: 'Current password is incorrect' });
            setLoading(false);
            return;
          }

          // Update password using Better Auth
          // Note: Better Auth doesn't have a direct changePassword method
          // We'll need to implement a backend API endpoint for password change
          // For now, show a message that password change requires backend implementation
          toast.success('Password verification successful. Password change feature will be available soon.');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
    } catch (error: any) {
      console.error('Change password error:', error);
      toast.error(error?.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleExportData = () => {
    const data = {
      profile: { name: user?.name, email: user?.email },
      appearance,
      privacy,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Settings exported successfully!');
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.error('Account deletion not implemented yet');
    }
  };

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const canGoNext = currentStepIndex < steps.length - 1;
  const canGoPrev = currentStepIndex > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <main className="lg:pl-64 min-h-screen">
        <div className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Settings
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto">
          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = currentStepIndex > index;
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center',
                      isActive
                        ? 'bg-white/20 text-white'
                        : isCompleted
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-200 dark:bg-zinc-700'
                    )}>
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <span className="font-medium hidden sm:inline">{step.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="h-1 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-lg">
            {/* Security Step */}
            {currentStep === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Shield className="w-6 h-6" />
                    Security Settings
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Manage your account security and password
                  </p>
                </div>

                {/* Email Display */}
                <div className="p-5 border border-slate-200 dark:border-zinc-800 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
                      <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Email Address</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {user?.email}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <span className="px-3 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                        Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* Change Password Section */}
                <div className="p-5 border border-slate-200 dark:border-zinc-800 rounded-lg">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Change Password
                  </h3>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="relative">
                      <Input
                        label="Current Password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        error={errors.currentPassword}
                        placeholder="Enter current password"
                        icon={Key}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="relative">
                      <Input
                        label="New Password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        error={errors.newPassword}
                        placeholder="Enter new password (min 8 characters)"
                        icon={Lock}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="relative">
                      <Input
                        label="Confirm New Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={errors.confirmPassword}
                        placeholder="Confirm new password"
                        icon={Lock}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button 
                        type="submit" 
                        loading={loading} 
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Save className="w-4 h-4" />
                        Change Password
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                          setErrors({});
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                  </form>
                </div>

              </div>
            )}

            {/* Appearance Step */}
            {currentStep === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Sun className="w-6 h-6" />
                    Appearance
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Customize the look and feel of your application
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Theme
                    </label>
                    <select
                      value={appearance.theme}
                      onChange={(e) => updateAppearance('theme', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                    >
                      <option value="system">System Default</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Choose your preferred color scheme
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Font Size
                    </label>
                    <select
                      value={appearance.fontSize}
                      onChange={(e) => updateAppearance('fontSize', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-zinc-800 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Compact Mode</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Reduce spacing for a more compact view
                      </p>
                    </div>
                    <button
                      onClick={() => updateAppearance('compactMode', !appearance.compactMode)}
                      className={cn(
                        'relative w-12 h-6 rounded-full transition-colors',
                        appearance.compactMode
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                          : 'bg-slate-300 dark:bg-zinc-700'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm',
                          appearance.compactMode ? 'translate-x-6' : 'translate-x-0'
                        )}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Step */}
            {currentStep === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Lock className="w-6 h-6" />
                    Privacy Settings
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Control your privacy and data sharing preferences
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                      Profile Visibility
                    </label>
                    <select
                      value={privacy.profileVisibility}
                      onChange={(e) => updatePrivacy('profileVisibility', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="friends">Friends Only</option>
                    </select>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Control who can see your profile
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-zinc-800 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Show Email</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Display your email address on profile
                      </p>
                    </div>
                    <button
                      onClick={() => updatePrivacy('showEmail', !privacy.showEmail)}
                      className={cn(
                        'relative w-12 h-6 rounded-full transition-colors',
                        privacy.showEmail
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                          : 'bg-slate-300 dark:bg-zinc-700'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm',
                          privacy.showEmail ? 'translate-x-6' : 'translate-x-0'
                        )}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-zinc-800 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Analytics</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Help improve the app by sharing usage data
                      </p>
                    </div>
                    <button
                      onClick={() => updatePrivacy('analytics', !privacy.analytics)}
                      className={cn(
                        'relative w-12 h-6 rounded-full transition-colors',
                        privacy.analytics
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                          : 'bg-slate-300 dark:bg-zinc-700'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm',
                          privacy.analytics ? 'translate-x-6' : 'translate-x-0'
                        )}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* About Step */}
            {currentStep === 'about' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Info className="w-6 h-6" />
                    About
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Information about the application
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="p-5 border border-slate-200 dark:border-zinc-800 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">TaskVault</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      A modern task management application built with Next.js and FastAPI.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Version</span>
                        <span className="text-slate-900 dark:text-white font-medium">1.0.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Build Date</span>
                        <span className="text-slate-900 dark:text-white font-medium">
                          {new Date().toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 border border-slate-200 dark:border-zinc-800 rounded-lg">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5" />
                      Help & Support
                    </h3>
                    <div className="space-y-3">
                      <a
                        href="#"
                        className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Documentation
                      </a>
                      <a
                        href="#"
                        className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        FAQ
                      </a>
                      <a
                        href="#"
                        className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Contact Support
                      </a>
                    </div>
                  </div>

                  <div className="p-5 border border-slate-200 dark:border-zinc-800 rounded-lg">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Legal</h3>
                    <div className="space-y-3">
                      <a
                        href="#"
                        className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Terms of Service
                      </a>
                      <a
                        href="#"
                        className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Privacy Policy
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Management Step */}
            {currentStep === 'data' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Shield className="w-6 h-6" />
                    Data Management
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Manage your data and account settings
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleExportData}
                    className="w-full flex items-center justify-between p-5 border-2 border-slate-200 dark:border-zinc-800 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/30 rounded-lg flex items-center justify-center">
                        <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-slate-900 dark:text-white">Export Data</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Download your settings and data as JSON
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>

                  <button
                    onClick={handleDeleteAccount}
                    className="w-full flex items-center justify-between p-5 border-2 border-red-200 dark:border-red-900 rounded-lg hover:border-red-400 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-950/30 rounded-lg flex items-center justify-center">
                        <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-red-600 dark:text-red-400">Delete Account</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Permanently delete your account and all data
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-zinc-800">
              <Button
                variant="secondary"
                onClick={() => canGoPrev && setCurrentStep(steps[currentStepIndex - 1].id)}
                disabled={!canGoPrev}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Step {currentStepIndex + 1} of {steps.length}
              </div>
              <Button
                onClick={() => canGoNext && setCurrentStep(steps[currentStepIndex + 1].id)}
                disabled={!canGoNext}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
