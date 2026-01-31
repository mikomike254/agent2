'use client';

import { useState, useRef } from 'react';
import { Camera, X, Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface AvatarUploadProps {
    currentAvatar?: string;
    userName: string;
    onUploadSuccess?: (avatarUrl: string) => void;
    size?: 'sm' | 'md' | 'lg';
}

export default function AvatarUpload({
    currentAvatar,
    userName,
    onUploadSuccess,
    size = 'md'
}: AvatarUploadProps) {
    const [avatar, setAvatar] = useState(currentAvatar);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sizeClasses = {
        sm: 'w-12 h-12 text-lg',
        md: 'w-24 h-24 text-3xl',
        lg: 'w-32 h-32 text-4xl'
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload file
        handleUpload(file);
    };

    const handleUpload = async (file: File) => {
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const res = await fetch('/api/profile/avatar', {
                method: 'POST',
                body: formData
            });

            const result = await res.json();

            if (result.success) {
                setAvatar(result.data.avatar_url);
                setPreviewUrl(null);
                onUploadSuccess?.(result.data.avatar_url);
                // Force page refresh to update avatar everywhere
                window.location.reload();
            } else {
                alert(result.message || 'Upload failed');
                setPreviewUrl(null);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload avatar');
            setPreviewUrl(null);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async () => {
        if (!confirm('Remove your profile picture?')) return;

        setUploading(true);

        try {
            const res = await fetch('/api/profile/avatar', {
                method: 'DELETE'
            });

            const result = await res.json();

            if (result.success) {
                setAvatar(undefined);
                setPreviewUrl(null);
                onUploadSuccess?.('');
                window.location.reload();
            } else {
                alert(result.message || 'Failed to remove avatar');
            }
        } catch (error) {
            console.error('Remove error:', error);
            alert('Failed to remove avatar');
        } finally {
            setUploading(false);
        }
    };

    const displayAvatar = previewUrl || avatar;

    return (
        <div className="relative group">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Avatar Display */}
            <div className={`${sizeClasses[size]} rounded-full relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold`}>
                {displayAvatar ? (
                    <img
                        src={displayAvatar}
                        alt={userName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span>{userName.charAt(0).toUpperCase()}</span>
                )}

                {/* Upload Overlay */}
                {!uploading && (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    >
                        <Camera className="w-6 h-6 text-white" />
                    </div>
                )}

                {/* Loading Overlay */}
                {uploading && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            {size !== 'sm' && !uploading && (
                <div className="mt-3 flex gap-2">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        {avatar ? 'Change' : 'Upload'}
                    </button>
                    {avatar && (
                        <button
                            onClick={handleRemove}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}

            {/* File Size Hint */}
            {size !== 'sm' && (
                <p className="mt-2 text-xs text-gray-500 text-center">
                    Max 5MB • JPG, PNG, WebP, GIF
                </p>
            )}
        </div>
    );
}
