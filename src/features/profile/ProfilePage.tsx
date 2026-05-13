import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { userApi } from '@/services';
import { useAuthStore } from '@/store/authStore';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, MapPin, Upload } from 'lucide-react';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  const { data } = useQuery({ queryKey: ['profile'], queryFn: () => userApi.getProfile() });
  const profile = data?.data?.data;

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    values: { 
      firstName: profile?.firstName || '', 
      lastName: profile?.lastName || '', 
      phone: profile?.phone || '' 
    },
  });

  const mutation = useMutation({
    mutationFn: (d: any) => userApi.updateProfile(d),
    onSuccess: (_, vars) => {
      updateUser(vars);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated!');
    },
    onError: () => toast.error('Update failed'),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => userApi.uploadAvatar(file),
    onSuccess: (res) => {
      updateUser({ avatar: res.data.data.avatar });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Avatar updated');
    },
    onError: () => toast.error('Upload failed'),
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) uploadMutation.mutate(e.target.files[0]);
  };

  return (
    <div className="container py-10 max-w-2xl animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-white mb-8">My Profile</h1>

      <div className="grid gap-6">
        {/* Avatar / info */}
        <div className="glass p-6 rounded-2xl flex items-center gap-6 border border-white/5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-3xl bg-indigo-600/20 flex items-center justify-center overflow-hidden ring-2 ring-white/10 group-hover:ring-indigo-500/50 transition-all">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-indigo-400" />
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 rounded-3xl cursor-pointer transition-opacity">
               <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
               <Upload size={18} className="text-white" />
            </label>
            {uploadMutation.isPending && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-3xl">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-white">{profile?.firstName} {profile?.lastName}</h2>
            <p className="text-slate-400 text-sm mb-2">{profile?.email}</p>
            <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {profile?.role} Account
            </span>
          </div>
        </div>

        {/* Edit form */}
        <div className="glass p-6 rounded-xl">
          <h3 className="font-semibold text-white mb-5">Edit Profile</h3>
          <form onSubmit={handleSubmit((d) => {
            const payload = Object.fromEntries(
              Object.entries(d).filter(([_, v]) => v !== '' && v != null)
            );
            mutation.mutate(payload);
          })} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">First Name</label>
                <input {...register('firstName')} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Last Name</label>
                <input {...register('lastName')} className="input" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone</label>
              <input {...register('phone')} type="tel" placeholder="+91 98765 43210" className="input" />
            </div>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary py-2.5">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Quick links */}
        <div className="glass p-5 rounded-xl">
          <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/profile/addresses" className="btn btn-outline text-sm justify-start gap-2">
              <MapPin size={16} /> Manage Addresses
            </Link>
            <Link to="/orders" className="btn btn-outline text-sm justify-start gap-2">
              📦 My Orders
            </Link>
            <Link to="/wishlist" className="btn btn-outline text-sm justify-start gap-2">
              ❤️ Wishlist
            </Link>
            <Link to="/auth/forgot-password" className="btn btn-outline text-sm justify-start gap-2">
              🔑 Change Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
