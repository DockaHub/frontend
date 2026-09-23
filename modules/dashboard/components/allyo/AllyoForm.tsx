import React from 'react';

const CONTROL = 'mt-2 h-11 w-full rounded-[10px] border border-[#dedede] bg-white px-3 text-sm text-black outline-none transition focus:border-[#9db669] focus:ring-2 focus:ring-[#9db669]/20 disabled:cursor-not-allowed disabled:bg-[#f5f5f2] disabled:text-[#999] dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:disabled:bg-zinc-800';

export const AllyoField = ({ label, required = false, hint, children, className = '' }: { label: string; required?: boolean; hint?: string; children: React.ReactNode; className?: string }) => (
    <label className={`block text-xs font-semibold text-[#252525] dark:text-zinc-200 ${className}`}>
        <span>{label}{required && <span className="ml-1 text-[#739044]">*</span>}</span>
        {hint && <span className="ml-1 font-normal text-[#999]">{hint}</span>}
        {children}
    </label>
);

export const AllyoInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} className={`${CONTROL} ${props.className || ''}`} />;

export const AllyoSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...props} className={`${CONTROL} appearance-none bg-[linear-gradient(45deg,transparent_50%,#999_50%),linear-gradient(135deg,#999_50%,transparent_50%)] bg-[position:calc(100%-16px)_18px,calc(100%-11px)_18px] bg-[size:5px_5px,5px_5px] bg-no-repeat pr-9 ${props.className || ''}`} />;

export const AllyoTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} className={`mt-2 min-h-24 w-full resize-y rounded-[10px] border border-[#dedede] bg-white px-3 py-3 text-sm text-black outline-none transition focus:border-[#9db669] focus:ring-2 focus:ring-[#9db669]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white ${props.className || ''}`} />;

export const AllyoToggle = ({ checked, onChange, label, description }: { checked: boolean; onChange: (checked: boolean) => void; label: string; description?: string }) => (
    <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-start justify-between gap-4 rounded-[12px] border border-[#e5e5e5] p-3 text-left dark:border-zinc-800">
        <span><strong className="block text-xs font-semibold text-black dark:text-white">{label}</strong>{description && <span className="mt-1 block text-[11px] leading-4 text-[#858585] dark:text-zinc-400">{description}</span>}</span>
        <span className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-[#9db669]' : 'bg-[#dedede] dark:bg-zinc-700'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${checked ? 'left-6' : 'left-1'}`} /></span>
    </button>
);

export const AllyoPrimaryButton = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props} className={`inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#0d1e1d] px-5 text-xs font-semibold text-white transition hover:bg-[#1d3432] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#9db669] dark:text-[#0d1e1d] ${props.className || ''}`}>{children}</button>
);

export const AllyoSecondaryButton = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props} className={`inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#d7d7d7] px-5 text-xs font-semibold text-black transition hover:border-[#9db669] hover:bg-[#f6f8f1] dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800 ${props.className || ''}`}>{children}</button>
);
