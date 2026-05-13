import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '@/services/productService';
import { Upload, Trash2, ArrowLeft, Image as ImageIcon, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ProductMediaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);

  // Queries
  const { data: prodRes, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['admin', 'product', id],
    queryFn: () => productApi.getProductById(id!),
    enabled: !!id,
  });

  const product = prodRes?.data?.data;
  const images = product?.images || [];

  // Mutations
  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => productApi.uploadImages(id!, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', id] });
      toast.success('Images uploaded successfully');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Upload failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (imageId: string) => productApi.deleteImage(id!, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', id] });
      toast.success('Image removed');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Delete failed'),
  });

  // Handlers
  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      toast.error('Only image files are allowed');
      return;
    }
    uploadMutation.mutate(fileArray);
  }, [uploadMutation]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  if (isLoadingProduct) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Loading media workspace...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8 animate-fade-in mb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/admin/products')}
            className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">Media Management</h1>
            <p className="text-slate-400 text-sm mt-1">Managing gallery for <span className="text-indigo-400 font-semibold">{product?.name}</span></p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-full glass border border-white/5 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Storage</span>
            <span className="text-indigo-400 font-mono font-bold">{images.length}/10</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Drop Zone */}
        <div className="lg:col-span-4">
          <div 
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`relative group h-full min-h-[400px] rounded-3xl border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center p-8 text-center cursor-pointer
              ${isDragging 
                ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_40px_rgba(79,70,229,0.2)]' 
                : 'border-white/10 glass hover:border-white/20 hover:bg-white/[0.02]'}`}
          >
            {/* Hidden Input - Ensure it's on top with z-index */}
            <input 
              type="file" 
              multiple 
              className="absolute inset-0 opacity-0 cursor-pointer z-20" 
              onChange={(e) => handleFiles(e.target.files)} 
              accept="image/*"
            />
            
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 ${isDragging ? 'scale-110' : 'group-hover:scale-105'}`}>
              <div className={`absolute inset-0 blur-2xl rounded-full transition-opacity ${isDragging ? 'bg-indigo-500/40' : 'bg-indigo-500/0'}`} />
              <div className={`relative z-10 w-full h-full rounded-2xl flex items-center justify-center glass border border-white/10 ${isDragging ? 'text-indigo-400 border-indigo-500/50' : 'text-slate-400 group-hover:text-indigo-400'}`}>
                {uploadMutation.isPending ? <Loader2 size={32} className="animate-spin" /> : <Upload size={32} />}
              </div>
            </div>

            <h3 className="text-xl font-display font-bold text-white mb-2">
              {isDragging ? 'Drop to Upload' : 'Add New Photos'}
            </h3>
            <p className="text-slate-400 text-sm max-w-[200px] leading-relaxed mb-6">
              Drag and drop your images here, or click anywhere in this zone
            </p>

            <div className="relative z-10 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all duration-300">
              Browse Files
            </div>

            {uploadMutation.isPending && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-8 flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-full text-white text-xs font-bold z-30"
              >
                <Loader2 size={14} className="animate-spin" />
                Uploading Media...
              </motion.div>
            )}
          </div>
        </div>

        {/* Gallery */}
        <div className="lg:col-span-8">
          <div className="glass rounded-[2rem] p-8 border border-white/5 min-h-[400px]">
             <div className="flex items-center justify-between mb-8">
                <h4 className="text-white font-bold flex items-center gap-2">
                  <ImageIcon size={18} className="text-indigo-400" />
                  Product Gallery
                </h4>
                {images.length > 0 && (
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                    {images.length} items total
                  </span>
                )}
             </div>

             {images.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 opacity-40">
                 <ImageIcon size={64} className="text-slate-600 mb-4" />
                 <p className="text-slate-500 font-medium">No images uploaded yet</p>
               </div>
             ) : (
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                 <AnimatePresence>
                   {images.map((img: any, idx: number) => (
                     <motion.div 
                       key={img.id}
                       layout
                       initial={{ opacity: 0, scale: 0.9 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.9 }}
                       transition={{ duration: 0.3, delay: idx * 0.05 }}
                       className="group relative aspect-square rounded-[1.5rem] overflow-hidden glass border border-white/10 shadow-2xl"
                     >
                       <img src={img.url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                       
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                          <div className="flex items-center justify-between gap-2">
                             <button 
                               onClick={() => { if(window.confirm('Remove this image?')) deleteMutation.mutate(img.id) }}
                               disabled={deleteMutation.isPending}
                               className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-500/30"
                             >
                               <Trash2 size={18} />
                             </button>
                             {img.isPrimary ? (
                               <div className="px-3 py-1.5 bg-indigo-600 rounded-lg flex items-center gap-1.5 shadow-lg">
                                 <CheckCircle2 size={12} className="text-white" />
                                 <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Primary</span>
                               </div>
                             ) : (
                               <div className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/10">
                                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-tighter">Gallery</span>
                               </div>
                             )}
                          </div>
                       </div>
                     </motion.div>
                   ))}
                 </AnimatePresence>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
