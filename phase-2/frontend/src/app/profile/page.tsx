'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, User, Mail, Camera, Save, Upload, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authClient } from '@/lib/auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user) {
      // Get name from user object, with fallback to email prefix
      const userName = (user as any).name || user.email?.split('@')[0] || '';
      setName(userName);
      setEmail(user.email || '');
      // Load profile image from localStorage
      const savedImage = localStorage.getItem(`profile_image_${user.id}`);
      if (savedImage) {
        setProfileImage(savedImage);
      }
    }
  }, [user]);

  // Listen for user updates (when name is changed)
  useEffect(() => {
    const handleUserUpdate = () => {
      if (user) {
        const userName = (user as any).name || user.email?.split('@')[0] || '';
        setName(userName);
      }
    };
    
    // Listen for custom event when user is updated
    window.addEventListener('userUpdated', handleUserUpdate);
    return () => window.removeEventListener('userUpdated', handleUserUpdate);
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setProfileImage(imageUrl);
      // Save to localStorage
      if (user?.id) {
        localStorage.setItem(`profile_image_${user.id}`, imageUrl);
        // Dispatch custom event to update sidebar
        window.dispatchEvent(new Event('profileImageUpdated'));
      }
      toast.success('Profile image updated!');
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    if (user?.id) {
      localStorage.removeItem(`profile_image_${user.id}`);
      // Dispatch custom event to update sidebar
      window.dispatchEvent(new Event('profileImageUpdated'));
    }
    toast.success('Profile image removed');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!name.trim()) {
      setErrors({ name: 'Name is required' });
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.updateUser({
        name: name.trim(),
      });

      if (result.error) {
        toast.error(result.error.message || 'Failed to update profile');
        return;
      }

      // Update local state with new name
      setName(name.trim());
      
      // Refresh session to get updated user data
      await authClient.getSession();
      
      // Dispatch event to update sidebar and other components
      window.dispatchEvent(new Event('userUpdated'));
      
      toast.success('Profile updated successfully! 🎉');
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error(error?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
                Profile
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Manage your profile information
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-lg">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center mb-8 pb-8 border-b border-slate-200 dark:border-zinc-800">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden border-4 border-white dark:border-zinc-900 shadow-xl">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-white" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transform transition-all hover:scale-110 group-hover:opacity-100 opacity-0"
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
                {profileImage && (
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-0 right-0 w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-lg transform transition-all hover:scale-110"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="mt-4 text-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  {profileImage ? 'Change Photo' : 'Upload Photo'}
                </button>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  JPG, PNG or GIF. Max size 5MB
                </p>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <User className="w-6 h-6" />
                  Profile Information
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Update your personal information and profile details
                </p>
              </div>

              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                placeholder="Enter your full name"
                icon={User}
                required
              />

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                placeholder="Enter your email"
                icon={Mail}
                required
                disabled
                helperText="Email cannot be changed"
              />

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  loading={loading} 
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    const userName = (user as any)?.name || user?.email?.split('@')[0] || '';
                    setName(userName);
                    setErrors({});
                  }}
                >
                  Reset
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

