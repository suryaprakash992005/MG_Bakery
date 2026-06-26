import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '../../utils/supabase';

interface ImageUploaderProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  maxDimension?: number; // max width/height to resize to
  quality?: number; // 0.1 to 1.0 compression quality
  bucket?: string; // Optional Supabase Storage bucket name
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = 'Upload Image',
  maxDimension = 800,
  quality = 0.7,
  bucket,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress image helper using Canvas
  const compressAndConvertToBase64 = (file: File) => {
    setError(null);
    setUploadProgress(0);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize logic keeping aspect ratio
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setError('Failed to compress image.');
          setUploadProgress(null);
          return;
        }

        // Draw image to canvas (this compresses it)
        ctx.drawImage(img, 0, 0, width, height);

        if (bucket) {
          // Upload to Supabase Storage
          canvas.toBlob(async (blob) => {
            if (!blob) {
              setError('Failed to compress image.');
              setUploadProgress(null);
              return;
            }

            try {
              setUploadProgress(25);
              const cleanName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
              const filePath = cleanName;
              
              setUploadProgress(50);
              const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, blob, {
                  contentType: 'image/jpeg',
                  upsert: false
                });

              if (uploadError) {
                throw uploadError;
              }

              setUploadProgress(85);
              const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

              setUploadProgress(100);
              setTimeout(() => {
                onChange(publicUrl);
                setUploadProgress(null);
              }, 300);
            } catch (err: any) {
              console.error('Storage upload error:', err);
              setError(err.message || 'Failed to upload image to Supabase.');
              setUploadProgress(null);
            }
          }, 'image/jpeg', quality);
        } else {
          // Convert to Base64 data URL
          const base64Url = canvas.toDataURL('image/jpeg', quality);

          // Simulate progress bar for a premium feel
          let progress = 10;
          const interval = setInterval(() => {
            progress += 20;
            setUploadProgress(progress);
            if (progress >= 100) {
              clearInterval(interval);
              setTimeout(() => {
                onChange(base64Url);
                setUploadProgress(null);
              }, 300);
            }
          }, 80);
        }
      };

      img.onerror = () => {
        setError('Failed to load image file.');
        setUploadProgress(null);
      };
    };

    reader.onerror = () => {
      setError('Failed to read file.');
      setUploadProgress(null);
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!validateFile(file)) return;
      compressAndConvertToBase64(file);
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a JPG, PNG, or WEBP image file.');
      return false;
    }
    return true;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (!validateFile(file)) return;
      compressAndConvertToBase64(file);
    }
  };

  const triggerSelectFile = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2 select-none">
      <span className="text-[10px] font-bold text-slate-550 uppercase tracking-widest block">
        {label}
      </span>

      {value ? (
        // Preview State
        <div className="relative w-full aspect-video rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shadow-inner group">
          <img
            src={value}
            alt="Upload preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={triggerSelectFile}
              className="px-4 py-2 bg-white/95 text-slate-800 text-xs font-semibold rounded-full hover:scale-105 transition-all shadow-md cursor-pointer border-none"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={removeImage}
              className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-all hover:scale-105 cursor-pointer shadow-md border-none"
              title="Remove image"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        // Upload Action Dropzone State
        <div
          onClick={triggerSelectFile}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 relative overflow-hidden ${
            isDragOver
              ? 'border-brand-gold-500 bg-brand-gold-50/10 scale-[0.99]'
              : 'border-slate-350 bg-slate-50/50 hover:bg-slate-55 hover:border-slate-400'
          }`}
        >
          {uploadProgress !== null ? (
            // Uploading progress UI
            <div className="flex flex-col items-center justify-center space-y-3 w-full px-6 animate-pulse">
              <Loader2 className="w-8 h-8 text-brand-gold-600 animate-spin" />
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden max-w-xs shadow-inner">
                <div
                  className="bg-brand-gold-600 h-1.5 rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Compressing & Uploading {uploadProgress}%
              </span>
            </div>
          ) : (
            // Dropzone Default UI
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-450 shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5 text-slate-500" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-750">
                  Drag & Drop or Click to Upload
                </p>
                <p className="text-[10px] text-slate-400 font-light">
                  Supports JPG, PNG, WEBP files
                </p>
              </div>
              <span className="inline-block px-3 py-1 bg-white border border-slate-200 rounded-full text-[9px] font-bold text-brand-gold-700 shadow-xs hover:border-slate-300">
                Browse Files
              </span>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-[10px] font-semibold text-red-500 flex items-center gap-1 mt-1">
          <span className="w-1 h-1 rounded-full bg-red-500 inline-block"></span>
          {error}
        </p>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />
    </div>
  );
};
