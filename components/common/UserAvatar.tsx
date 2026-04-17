import React, { useState, useEffect } from 'react';
import { getBackendUrl } from '../../services/api';

interface UserAvatarProps {
    src?: string | null;
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    className?: string;
    priority?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
    src,
    name = 'User',
    size = 'md',
    className = '',
}) => {
    const [error, setError] = useState(false);
    const [imgSrc, setImgSrc] = useState<string | null>(null);

    const sizeClasses = {
        'xs': 'w-5 h-5 text-[8px]',
        'sm': 'w-8 h-8 text-[10px]',
        'md': 'w-10 h-10 text-xs',
        'lg': 'w-12 h-12 text-sm',
        'xl': 'w-16 h-16 text-base',
        '2xl': 'w-24 h-24 text-xl',
        'full': 'w-full h-full text-xl',
    };

    const getAvatarColor = (seed: string) => {
        const colors = [
            'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500',
            'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500',
            'bg-cyan-500', 'bg-orange-500'
        ];
        const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    useEffect(() => {
        setError(false);
        if (src) {
            if (src.startsWith('http') || src.startsWith('data:')) {
                setImgSrc(src);
            } else {
                const apiBase = getBackendUrl();
                const fullUrl = `${apiBase}${src.startsWith('/') ? '' : '/'}${src}`;
                setImgSrc(fullUrl);
            }
        } else {
            setImgSrc(null);
        }
    }, [src]);

    if (!imgSrc || error) {
        const initials = name
            .split(' ')
            .filter(Boolean)
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

        const bgColor = getAvatarColor(name);

        return (
            <div 
                className={`flex items-center justify-center rounded-full ${bgColor} text-white font-bold border border-black/5 shrink-0 ${sizeClasses[size]} ${className}`}
                title={name}
            >
                {initials || '?'}
            </div>
        );
    }

    return (
        <img
            src={imgSrc}
            alt={name}
            onError={() => setError(true)}
            className={`rounded-full object-cover border border-docka-200 dark:border-zinc-700 shadow-sm shrink-0 ${sizeClasses[size]} ${className}`}
        />
    );
};

export default UserAvatar;
