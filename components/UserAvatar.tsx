'use client';

import Image from 'next/image';

interface UserAvatarProps {
    user?: {
        name: string;
        avatar_url?: string;
        role?: string;
    };
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    showName?: boolean;
    showRole?: boolean;
}

export default function UserAvatar({
    user,
    size = 'md',
    showName = false,
    showRole = false
}: UserAvatarProps) {
    if (!user) return null;

    const sizeClasses = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-2xl'
    };

    const initial = user.name?.charAt(0).toUpperCase() || '?';

    return (
        <div className="flex items-center gap-3">
            <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0`}>
                {user.avatar_url ? (
                    <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span>{initial}</span>
                )}
            </div>

            {(showName || showRole) && (
                <div className="flex flex-col">
                    {showName && (
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {user.name}
                        </p>
                    )}
                    {showRole && user.role && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {user.role}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
