import React from 'react';

interface ManySpaceLogoProps {
  variant?: 'full' | 'icon';
  className?: string;
}

const ManySpaceLogo: React.FC<ManySpaceLogoProps> = ({ variant = 'full', className = "h-8" }) => {
  if (variant === 'icon') {
    return (
      <svg viewBox="0 0 40 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect opacity="0.2" x="4" y="13" width="32" height="32" rx="6" fill="currentColor"/>
        <rect width="40" height="40" rx="8" fill="currentColor"/>
        <path d="M34.3704 33.6496V34.6249H5.59999V33.6496H34.3704Z" fill="white" className="dark:fill-zinc-900"/>
        <path d="M30.1921 27.2694L30.4445 28.2114L6.90722 34.5182L6.6548 33.5762L30.1921 27.2694Z" fill="white" className="dark:fill-zinc-900"/>
        <path d="M24.7894 22.9656L25.277 23.8102L7.11543 34.2958L6.6278 33.4512L24.7894 22.9656Z" fill="white" className="dark:fill-zinc-900"/>
        <path d="M18.9506 20.8487L19.6403 21.5383L6.84869 34.3299L6.15907 33.6402L18.9506 20.8487Z" fill="white" className="dark:fill-zinc-900"/>
        <path d="M13.4071 20.8095L14.2517 21.2972L6.77129 34.2537L5.92668 33.766L13.4071 20.8095Z" fill="white" className="dark:fill-zinc-900"/>
        <path d="M8.79206 22.5166L9.7341 22.769L6.66855 34.2098L5.72651 33.9574L8.79206 22.5166Z" fill="white" className="dark:fill-zinc-900"/>
        <path d="M5.59999 25.2784L6.57526 25.2784L6.57526 34.6082L5.59999 34.6082L5.59999 25.2784Z" fill="white" className="dark:fill-zinc-900"/>
      </svg>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <svg viewBox="0 0 40 45" className="h-8 w-auto shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect opacity="0.2" x="4" y="13" width="32" height="32" rx="6" fill="currentColor"/>
        <rect width="40" height="40" rx="8" fill="currentColor"/>
        <path d="M34.3704 33.6496V34.6249H5.59999V33.6496H34.3704Z" fill="white" className="dark:fill-zinc-900"/>
        <path d="M30.1921 27.2694L30.4445 28.2114L6.90722 34.5182L6.6548 33.5762L30.1921 27.2694Z" fill="white" className="dark:fill-zinc-900"/>
        <path d="M24.7894 22.9656L25.277 23.8102L7.11543 34.2958L6.6278 33.4512L24.7894 22.9656Z" fill="white" className="dark:fill-zinc-900"/>
        <path d="M18.9506 20.8487L19.6403 21.5383L6.84869 34.3299L6.15907 33.6402L18.9506 20.8487Z" fill="white" className="dark:fill-zinc-900"/>
        <path d="M13.4071 20.8095L14.2517 21.2972L6.77129 34.2537L5.92668 33.766L13.4071 20.8095Z" fill="white" className="dark:fill-zinc-900"/>
        <path d="M8.79206 22.5166L9.7341 22.769L6.66855 34.2098L5.72651 33.9574L8.79206 22.5166Z" fill="white" className="dark:fill-zinc-900"/>
        <path d="M5.59999 25.2784L6.57526 25.2784L6.57526 34.6082L5.59999 34.6082L5.59999 25.2784Z" fill="white" className="dark:fill-zinc-900"/>
      </svg>
      <span className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-black dark:text-white tracking-tight">ManySpace</span>
    </div>
  );
};

export default ManySpaceLogo;
