import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  ArrowLeft01Icon, 
  ImageAdd01Icon, 
  Cancel01Icon, 
  SparklesIcon, 
  Tick02Icon, 
  Briefcase01Icon,
  Location01Icon
} from '@hugeicons/core-free-icons';
import { toast } from 'sonner';

import api from '@/api/api';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Schema validation using Zod
const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(300, 'Bio must be under 300 characters').optional().or(z.literal('')),
  city: z.string().min(1, 'Please select a city'),
  state: z.string().optional().or(z.literal('')),
  workMode: z.enum(['remote', 'hybrid', 'onsite']),
  expectedSalary: z.number().min(3).max(100),
  educationLevel: z.enum(['12th', 'diploma', 'btech', 'mtech', 'mba', 'phd']),
  fieldOfStudy: z.string().min(1, 'Please enter field of study'),
  institutionName: z.string().min(1, 'Please enter institution name'),
  graduationYear: z.coerce.number().min(1900, 'Invalid year').max(2100, 'Invalid year'),
  linkedinUrl: z.string().url('Please enter a valid URL').or(z.literal('')),
  githubUrl: z.string().url('Please enter a valid URL').or(z.literal('')),
});

// Canvas Cropping Helper
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (err) => reject(err));
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg');
  });
}

export default function EditProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Location detection states
  const [isDetecting, setIsDetecting] = useState(false);
  const [availableCities, setAvailableCities] = useState([
    'Hyderabad', 'Bangalore', 'Mumbai', 'Pune', 'Noida', 'Gurgaon', 'Delhi', 'Chennai', 'Remote'
  ]);

  // 1. Fetch current profile details
  const { data: user, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => api.get('/users/me'),
  });

  // React Hook Form initialization
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      bio: '',
      city: 'Hyderabad',
      state: '',
      workMode: 'remote',
      expectedSalary: 15,
      educationLevel: 'btech',
      fieldOfStudy: '',
      institutionName: '',
      graduationYear: new Date().getFullYear(),
      linkedinUrl: '',
      githubUrl: '',
    },
  });

  // Reset fields when profile details load
  useEffect(() => {
    if (user) {
      const userCity = user.profile?.city || 'Hyderabad';
      setAvailableCities(prev => {
        if (userCity && !prev.includes(userCity)) {
          return [...prev, userCity];
        }
        return prev;
      });
      reset({
        fullName: user.full_name || '',
        bio: user.profile?.bio || '',
        city: userCity,
        state: user.profile?.state || '',
        workMode: user.profile?.preferred_work_mode || 'remote',
        expectedSalary: Math.round((user.profile?.expected_salary_min || 1500000) / 100000),
        educationLevel: user.profile?.education_level || 'btech',
        fieldOfStudy: user.profile?.field_of_study || '',
        institutionName: user.profile?.institution_name || '',
        graduationYear: user.profile?.graduation_year || new Date().getFullYear(),
        linkedinUrl: user.profile?.linkedin_url || '',
        githubUrl: user.profile?.github_url || '',
      });
    }
  }, [user, reset]);

  // Auto-detect location logic using IP lookup + HTML5 Geolocation fallback
  const handleAutoDetectLocation = async () => {
    setIsDetecting(true);
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) throw new Error('IP geocoding failed');
      const data = await response.json();
      
      const detectedCity = data.city;
      const detectedState = data.region;
      
      if (detectedCity) {
        setAvailableCities(prev => {
          const match = prev.find(c => c.toLowerCase() === detectedCity.toLowerCase());
          if (match) {
            setValue('city', match);
            return prev;
          } else {
            setValue('city', detectedCity);
            return [...prev, detectedCity];
          }
        });
      }
      
      if (detectedState) {
        setValue('state', detectedState);
      }
      
      if (detectedCity) {
        toast.success(`Location auto-detected: ${detectedCity}, ${detectedState || ''}`);
      } else {
        throw new Error('City empty in geocoding');
      }
    } catch (error) {
      console.warn('IP geocoding failed, trying HTML5 Geolocation...', error);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
              if (!res.ok) throw new Error('OSM geocoding failed');
              const geoData = await res.json();
              
              const city = geoData.address.city || geoData.address.town || geoData.address.village;
              const state = geoData.address.state;
              
              if (city) {
                setAvailableCities(prev => {
                  const match = prev.find(c => c.toLowerCase() === city.toLowerCase());
                  if (match) {
                    setValue('city', match);
                    return prev;
                  } else {
                    setValue('city', city);
                    return [...prev, city];
                  }
                });
              }
              
              if (state) {
                setValue('state', state);
              }
              
              if (city) {
                toast.success(`Location auto-detected: ${city}, ${state || ''}`);
              } else {
                toast.error('Could not determine city from GPS coordinates.');
              }
            } catch (err) {
              toast.error('Failed to resolve coordinates to location.');
            }
          },
          (err) => {
            toast.error('Location access denied or unavailable.');
          }
        );
      } else {
        toast.error('Location detection is not supported by your browser.');
      }
    } finally {
      setIsDetecting(false);
    }
  };

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (payload) => api.put('/users/me', payload),
    onSuccess: () => {
      toast.success('Professional profile details updated!');
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      navigate('/profile');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update profile.');
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (blob) => {
      const formData = new FormData();
      formData.append('file', blob, 'avatar.jpg');
      return api.post('/users/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: () => {
      toast.success('Profile avatar updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setIsCropOpen(false);
      setImageSrc(null);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to upload cropped photo.');
    },
  });

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result);
        setIsCropOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropSubmit = async () => {
    try {
      setIsUploading(true);
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      await uploadAvatarMutation.mutateAsync(croppedImageBlob);
      setIsUploading(false);
    } catch (e) {
      setIsUploading(false);
      toast.error('Failed to generate cropped selection.');
    }
  };

  const onSubmit = (data) => {
    updateProfileMutation.mutate({
      full_name: data.fullName,
      bio: data.bio,
      city: data.city,
      state: data.state,
      preferred_work_mode: data.workMode,
      expected_salary: data.expectedSalary * 100000,
      education_level: data.educationLevel,
      field_of_study: data.fieldOfStudy,
      institution_name: data.institutionName,
      graduation_year: data.graduationYear,
      linkedin_url: data.linkedinUrl || null,
      github_url: data.githubUrl || null,
    });
  };

  const bioText = watch('bio') || '';

  if (isLoadingProfile) {
    return (
      <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col gap-6 pb-20 select-none">
        <Skeleton className="h-6 w-32 bg-white/5 rounded-sm animate-pulse" />
        <Skeleton className="h-96 w-full bg-white/5 rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col gap-6 pb-20 select-none">
      {/* Sci-Fi Ambient Glow and grid overlays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-violet-600/[0.04] blur-[130px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[50%] h-[50%] rounded-full bg-cyan-600/[0.04] blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 select-none">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-xs font-mono text-[#A2A0C2] hover:text-white transition-colors cursor-pointer"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          <span>Back to Profile</span>
        </button>
      </nav>

      {/* Page Header */}
      <header className="relative z-10 w-full select-none bg-white/[0.01] border border-white/5 backdrop-blur-2xl rounded-3xl p-6 flex items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <span className="text-[10px] font-bold font-mono text-violet-400 uppercase tracking-widest">
            Profile Settings
          </span>
          <h1 
            className="text-xl md:text-2xl font-black text-white leading-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Edit Professional Profile
          </h1>
        </div>
        <div className="shrink-0 p-2.5 bg-white/5 border border-white/5 text-[#22D3EE] rounded-xl">
          <HugeiconsIcon icon={Briefcase01Icon} className="size-6 text-[#A78BFA]" />
        </div>
      </header>

      {/* Editor Layout Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Avatar & Professional Links */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Avatar Identity Card */}
            <div className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-lg text-center flex flex-col items-center justify-center gap-5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3 w-full">
                Avatar Identity
              </h4>

              <div className="relative group size-32 rounded-full overflow-hidden bg-white/5 border border-white/10 shadow-inner">
                {user?.file_url ? (
                  <img
                    src={`http://localhost:8000/static/avatars/user_${user.user_id}.jpg`}
                    alt="Profile Avatar"
                    className="size-full object-cover rounded-full"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="size-full flex items-center justify-center text-4xl font-mono text-cyan-400 bg-white/5">
                    {(user?.full_name || 'U').substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <input
                type="file"
                id="cropper-file-input"
                className="hidden"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
              />

              <Button
                type="button"
                onClick={() => document.getElementById('cropper-file-input').click()}
                className="bg-white/5 border border-white/15 text-white hover:bg-white/10 text-xs font-mono font-bold rounded-xl py-3 px-4 flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <HugeiconsIcon icon={ImageAdd01Icon} className="size-4" />
                <span>Change Photo</span>
              </Button>
            </div>

            {/* Professional Links Card */}
            <div className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 pb-8 shadow-lg space-y-6">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3 w-full">
                Professional Links
              </h4>

              <div className="flex flex-col font-mono text-xs">
                <label className="block mb-1.5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                  LinkedIn Profile URL
                </label>
                <input
                  type="text"
                  placeholder="https://linkedin.com/in/username"
                  {...register('linkedinUrl')}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 outline-none text-xs h-[44px]"
                />
                {errors.linkedinUrl && (
                  <p className="text-rose-400 text-[10px] mt-1">{errors.linkedinUrl.message}</p>
                )}
              </div>

              <div className="flex flex-col font-mono text-xs">
                <label className="block mb-1.5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                  GitHub Profile URL
                </label>
                <input
                  type="text"
                  placeholder="https://github.com/username"
                  {...register('githubUrl')}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 outline-none text-xs h-[44px]"
                />
                {errors.githubUrl && (
                  <p className="text-rose-400 text-[10px] mt-1">{errors.githubUrl.message}</p>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Preferences, Location, Education */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Details Config / Preferences Card */}
            <div className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 pb-8 shadow-lg space-y-6">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3 w-full">
                Details & Location
              </h4>

              {/* Full Name */}
              <div className="flex flex-col font-mono text-xs">
                <label className="block mb-1.5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                  Full Name
                </label>
                <input
                  type="text"
                  {...register('fullName')}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 outline-none text-xs h-[44px]"
                />
                {errors.fullName && (
                  <p className="text-rose-400 text-[10px] mt-1">{errors.fullName.message}</p>
                )}
              </div>

              {/* Bio with counter */}
              <div className="flex flex-col font-mono text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                    Professional Bio
                  </label>
                  <span className="text-[9px] text-[#5C5A78]">
                    {bioText.length} / 300
                  </span>
                </div>
                <textarea
                  {...register('bio')}
                  maxLength={300}
                  placeholder="Write a brief professional summary about your background..."
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 min-h-[90px] resize-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 outline-none text-xs"
                />
                {errors.bio && (
                  <p className="text-rose-400 text-[10px] mt-1">{errors.bio.message}</p>
                )}
              </div>

              {/* Location (City & State) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col font-mono text-xs">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                      City
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoDetectLocation}
                      disabled={isDetecting}
                      className="flex items-center gap-1 text-[9px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider cursor-pointer font-mono disabled:opacity-50"
                    >
                      <HugeiconsIcon icon={Location01Icon} className={`size-3 ${isDetecting ? 'animate-pulse text-cyan-400' : ''}`} />
                      <span>{isDetecting ? 'Detecting...' : 'Auto Detect'}</span>
                    </button>
                  </div>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full !h-[44px] bg-white/5 border-white/10 rounded-xl px-3 text-white text-xs text-left focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 focus-visible:ring-1 focus-visible:ring-violet-500/20 focus-visible:border-violet-500">
                          <SelectValue placeholder="Select a city" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0b0b14] border border-white/10 text-white rounded-xl shadow-2xl">
                          {availableCities.map((c) => (
                            <SelectItem key={c} value={c} className="text-white hover:bg-white/5 focus:bg-white/5 cursor-pointer rounded-lg py-2">
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.city && (
                    <p className="text-rose-400 text-[10px] mt-1">{errors.city.message}</p>
                  )}
                </div>

                <div className="flex flex-col font-mono text-xs">
                  <label className="block mb-1.5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                    State / Region
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Telangana"
                    {...register('state')}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 outline-none text-xs h-[44px]"
                  />
                  {errors.state && (
                    <p className="text-rose-400 text-[10px] mt-1">{errors.state.message}</p>
                  )}
                </div>
              </div>

              {/* Preferred Work Mode */}
              <div className="flex flex-col font-mono text-xs">
                <label className="block mb-1.5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                  Preferred Work Mode
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['remote', 'hybrid', 'onsite'].map((mode) => (
                    <label
                      key={mode}
                      className={`p-3 border rounded-xl flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer capitalize transition-all select-none ${
                        watch('workMode') === mode
                          ? 'bg-violet-500/10 border-violet-500/40 text-violet-400'
                          : 'bg-white/5 border-white/5 text-[#A2A0C2] hover:bg-white/10'
                      }`}
                    >
                      <input
                        type="radio"
                        value={mode}
                        {...register('workMode')}
                        className="hidden"
                      />
                      <span className="text-xs font-bold font-sans">{mode === 'onsite' ? 'On-site' : mode}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Expected Salary Slider */}
              <div className="flex flex-col font-mono text-xs pb-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                    Expected Salary (CTC)
                  </label>
                  <span className="text-xs font-bold text-cyan-400 font-sans">
                    ₹{watch('expectedSalary')}L / annum
                  </span>
                </div>
                <Controller
                  name="expectedSalary"
                  control={control}
                  render={({ field }) => (
                    <Slider
                      defaultValue={[field.value]}
                      min={3}
                      max={100}
                      step={1}
                      onValueChange={(val) => field.onChange(val[0])}
                      className="cursor-pointer py-4 [&>[data-slot=slider-track]>[data-slot=slider-range]]:bg-gradient-to-r [&>[data-slot=slider-track]>[data-slot=slider-range]]:from-[#6D28D9] [&>[data-slot=slider-track]>[data-slot=slider-range]]:to-[#A78BFA] [&>[data-slot=slider-thumb]]:border-[#8B5CF6] [&>[data-slot=slider-thumb]]:bg-[#060608] [&>[data-slot=slider-thumb]]:ring-[#8B5CF6]/30 [&>[data-slot=slider-thumb]]:scale-125"
                    />
                  )}
                />
              </div>

            </div>

            {/* Academic Background section */}
            <div className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 pb-8 shadow-lg space-y-6">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono border-b border-white/5 pb-3 w-full">
                Academic History
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col font-mono text-xs">
                  <label className="block mb-1.5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                    Education Level
                  </label>
                  <Controller
                    name="educationLevel"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full !h-[44px] bg-white/5 border-white/10 rounded-xl px-3 text-white text-xs text-left focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 focus-visible:ring-1 focus-visible:ring-violet-500/20 focus-visible:border-violet-500">
                          <SelectValue placeholder="Select education level" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0b0b14] border border-white/10 text-white rounded-xl shadow-2xl">
                          <SelectItem value="12th" className="text-white hover:bg-white/5 focus:bg-white/5 cursor-pointer rounded-lg py-2">High School (12th)</SelectItem>
                          <SelectItem value="diploma" className="text-white hover:bg-white/5 focus:bg-white/5 cursor-pointer rounded-lg py-2">Diploma</SelectItem>
                          <SelectItem value="btech" className="text-white hover:bg-white/5 focus:bg-white/5 cursor-pointer rounded-lg py-2">B.Tech / B.E.</SelectItem>
                          <SelectItem value="mtech" className="text-white hover:bg-white/5 focus:bg-white/5 cursor-pointer rounded-lg py-2">M.Tech / M.E.</SelectItem>
                          <SelectItem value="mba" className="text-white hover:bg-white/5 focus:bg-white/5 cursor-pointer rounded-lg py-2">M.B.A.</SelectItem>
                          <SelectItem value="phd" className="text-white hover:bg-white/5 focus:bg-white/5 cursor-pointer rounded-lg py-2">Ph.D</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.educationLevel && (
                    <p className="text-rose-400 text-[10px] mt-1">{errors.educationLevel.message}</p>
                  )}
                </div>

                <div className="flex flex-col font-mono text-xs">
                  <label className="block mb-1.5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                    Field of Study
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    {...register('fieldOfStudy')}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 outline-none text-xs h-[44px]"
                  />
                  {errors.fieldOfStudy && (
                    <p className="text-rose-400 text-[10px] mt-1">{errors.fieldOfStudy.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col font-mono text-xs">
                  <label className="block mb-1.5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                    Institution Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IIT Hyderabad"
                    {...register('institutionName')}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 outline-none text-xs h-[44px]"
                  />
                  {errors.institutionName && (
                    <p className="text-rose-400 text-[10px] mt-1">{errors.institutionName.message}</p>
                  )}
                </div>

                <div className="flex flex-col font-mono text-xs">
                  <label className="block mb-1.5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2024"
                    {...register('graduationYear')}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 outline-none text-xs h-[44px]"
                  />
                  {errors.graduationYear && (
                    <p className="text-rose-400 text-[10px] mt-1">{errors.graduationYear.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-center justify-center gap-1.5 cursor-pointer font-mono"
            >
              <HugeiconsIcon icon={SparklesIcon} className="size-4 text-[#22D3EE] animate-pulse" />
              <span>{updateProfileMutation.isPending ? 'Saving Config...' : 'Save Configuration'}</span>
            </button>

          </div>

        </div>
      </form>

      {/* react-easy-crop Image Cropper Modal */}
      <AnimatePresence>
        {isCropOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0a0f] border border-white/10 rounded-3xl p-6 w-full max-w-lg relative shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-extrabold text-white">Crop Avatar Selection</h4>
                <button
                  onClick={() => setIsCropOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/5 text-[#5C5A78] hover:text-white transition-all cursor-pointer"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-4.5" />
                </button>
              </div>

              {/* Crop Container */}
              <div className="relative w-full h-[300px] rounded-2xl bg-black/40 overflow-hidden border border-white/5">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  cropShape="round"
                  showGrid={false}
                />
              </div>

              {/* Zoom control slider */}
              <div className="space-y-1.5 font-mono text-xs">
                <label className="text-[10px] text-[#A2A0C2] uppercase">Zoom Scale</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full bg-white/5 rounded-lg h-2 cursor-pointer accent-violet-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCropOpen(false)}
                  className="px-4 py-2 border border-white/5 bg-white/5 rounded-xl text-[#A2A0C2] hover:text-white cursor-pointer font-mono text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCropSubmit}
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.25)] cursor-pointer font-mono text-xs"
                >
                  {isUploading ? 'Uploading...' : 'Save Selection'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
