import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';
import { Smartphone, Mail, Loader2, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

// Asterysko Logo SVG (Figma Group 2)
const AsteryskoLogoSVG = ({ size = 'normal' }: { size?: 'normal' | 'large' }) => (
    <div className="flex items-center gap-2">
        <svg width={size === 'large' ? "36" : "28"} height={size === 'large' ? "36" : "28"} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M29.208 0.974374C28.9702 1.21152 28.779 1.47445 28.6239 1.758L19.6547 13.8217C19.2721 14.2032 19.2721 14.8218 19.6547 15.1982C20.0372 15.5745 20.6576 15.5797 21.035 15.1982L33.1317 6.25352C33.416 6.10402 33.6797 5.90811 33.9175 5.67096C35.2202 4.3718 35.2202 2.26838 33.9175 0.969219C32.6148 -0.329947 30.5056 -0.329947 29.2029 0.969219L29.208 0.974374Z" fill="#1A1FD3" />
            <path d="M35.2461 15.9457C34.9669 15.9457 34.6929 15.987 34.4396 16.0643L21.9758 17.8893C21.5261 17.8893 21.159 18.2553 21.159 18.7039C21.159 19.1524 21.5261 19.5184 21.9758 19.5184L34.4345 21.3847C34.6878 21.462 34.9618 21.5033 35.2409 21.5033C36.7814 21.5033 38.0325 20.2608 38.0325 18.7296C38.0325 17.1985 36.7866 15.9457 35.2513 15.9457H35.2461Z" fill="#1A1FD3" />
            <path d="M29.1356 28.7054C28.9754 28.5456 28.7996 28.4167 28.6083 28.3136L20.518 22.3127C20.2647 22.0549 19.8459 22.0549 19.5926 22.3127C19.3393 22.5704 19.3341 22.9829 19.5926 23.2355L25.5841 31.3243C25.6824 31.5151 25.8116 31.6904 25.9719 31.8502C26.8403 32.7215 28.2568 32.7215 29.1253 31.8502C29.9938 30.9789 29.9989 29.5715 29.1253 28.7054H29.1356Z" fill="#1A1FD3" />
            <path d="M17.9435 32.2936C17.9435 32.1234 17.9177 31.9533 17.8712 31.7986L16.7442 24.1428C16.7442 23.8644 16.5219 23.6428 16.2428 23.6376C15.9636 23.6325 15.7413 23.8593 15.7361 24.1377L14.5833 31.7883C14.5368 31.943 14.511 32.1131 14.511 32.2832C14.511 33.2267 15.2761 33.9948 16.2273 34C17.1733 34 17.9435 33.237 17.9487 32.2884L17.9435 32.2936Z" fill="#1A1FD3" />
            <path d="M9.27418 27.2464C9.3569 27.1639 9.42927 27.066 9.48096 26.968L12.6964 22.6581C12.8308 22.524 12.836 22.3024 12.6964 22.1632C12.5569 22.024 12.3397 22.024 12.2002 22.1632L7.86806 25.3544C7.76467 25.4059 7.67162 25.4781 7.58891 25.5606C7.12364 26.0246 7.12364 26.7773 7.58891 27.2412C8.05417 27.7052 8.80892 27.7052 9.27418 27.2412V27.2464Z" fill="#1A1FD3" />
            <path d="M2.62615 20.4361C2.79674 20.4361 2.96734 20.4103 3.12242 20.3639L10.7941 19.2297C11.0732 19.2297 11.2955 19.0029 11.2955 18.7296C11.2955 18.4564 11.068 18.2296 10.7941 18.2296L3.12242 17.0954C2.96734 17.049 2.79674 17.0232 2.62615 17.0232C1.68012 17.0232 0.909851 17.7914 0.909851 18.7348C0.909851 19.6782 1.68012 20.4464 2.62615 20.4464V20.4361Z" fill="#1A1FD3" />
            <path d="M0.811577 7.2743C1.00802 7.47536 1.23031 7.63518 1.46811 7.75891L11.5746 15.26C11.8951 15.5797 12.4121 15.5797 12.7326 15.26C13.0531 14.9404 13.0531 14.4249 12.7326 14.1052L5.24706 4.00061C5.12299 3.76346 4.95757 3.54177 4.76112 3.34587C3.67551 2.25807 1.90752 2.25807 0.816747 3.34071C-0.274031 4.42335 -0.274031 6.1865 0.811577 7.2743Z" fill="#1A1FD3" />
            <path d="M14.5109 5.16058C14.5109 5.33071 14.5368 5.50083 14.5833 5.6555L15.7206 13.3061C15.7206 13.5845 15.9481 13.8062 16.2221 13.8062C16.4961 13.8062 16.7235 13.5794 16.7235 13.3061L17.8608 5.6555C17.9074 5.50083 17.9332 5.33071 17.9332 5.16058C17.9332 4.21713 17.1629 3.44898 16.2169 3.44898C15.2709 3.44898 14.5006 4.21713 14.5006 5.16058H14.5109Z" fill="#1A1FD3" />
        </svg>
    </div>
);

// Starburst Radial Burst Vector (Figma background decoration)
const AsteryskoBurstSVG = ({ color = '#1A1FD3' }: { color?: string }) => (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[600px] h-[600px] pointer-events-none opacity-20 z-0">
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
                <rect
                    key={i}
                    x="186"
                    y="10"
                    width="28"
                    height="140"
                    rx="14"
                    fill={color}
                    transform={`rotate(${angle} 200 200)`}
                />
            ))}
        </svg>
    </div>
);

const formatPhoneMask = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits ? `(${digits}` : '';
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export const AsteryskoLoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    
    const [loginStep, setLoginStep] = useState<'selection' | 'identifier' | 'otp'>('selection');
    const [loginType, setLoginType] = useState<'phone' | 'email'>('phone');
    
    const [phoneInput, setPhoneInput] = useState('');
    const [emailInput, setEmailInput] = useState('');
    const [sentIdentifier, setSentIdentifier] = useState('');
    
    // 5 OTP digits matching Figma Frames 40:159 & 40:198
    const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '']);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const activeIdentifier = loginType === 'phone' ? phoneInput : emailInput;

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhoneInput(formatPhoneMask(e.target.value));
    };

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!activeIdentifier.trim()) {
            setError(loginType === 'phone' ? 'Informe o número do celular.' : 'Informe seu e-mail.');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/request-otp', { identifier: activeIdentifier });
            setSentIdentifier(activeIdentifier);
            setLoginStep('otp');
            setOtpDigits(['', '', '', '', '']);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Não encontramos este cadastro. Verifique os dados digitados.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpDigitChange = (index: number, value: string) => {
        const char = value.slice(-1);
        const next = [...otpDigits];
        next[index] = char;
        setOtpDigits(next);

        if (char && index < 4) {
            const nextEl = document.getElementById(`otp-box-${index + 1}`);
            if (nextEl) nextEl.focus();
        }

        if (char && index === 4 && next.every(d => d !== '')) {
            submitOtpCode(next.join(''));
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            const prevEl = document.getElementById(`otp-box-${index - 1}`);
            if (prevEl) prevEl.focus();
        }
    };

    const submitOtpCode = async (code: string) => {
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/verify-otp', { identifier: sentIdentifier, code });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            await refreshUser();
            navigate('/portal');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Código de acesso inválido ou expirado.');
        } finally {
            setLoading(false);
        }
    };

    // Background color per Figma step:
    // Frame 17:3, 40:83, 40:136 -> #F3F3F3
    // Frame 40:159 (Email OTP) -> #EAEAFF
    // Frame 40:198 (WhatsApp OTP) -> #EAFFE4
    const pageBgColor = loginStep === 'otp'
        ? (loginType === 'phone' ? 'bg-[#EAFFE4]' : 'bg-[#EAEAFF]')
        : 'bg-[#F3F3F3]';

    const burstColor = loginStep === 'otp'
        ? (loginType === 'phone' ? '#1D8800' : '#1A1FD3')
        : '#1A1FD3';

    return (
        <div className={`min-h-screen ${pageBgColor} flex flex-col items-center justify-between p-6 font-sans text-slate-900 transition-colors duration-300 relative overflow-hidden`}>
            
            {/* Starburst vector decoration on OTP screen */}
            {loginStep === 'otp' && <AsteryskoBurstSVG color={burstColor} />}

            {/* Top Navbar */}
            <div className="w-full max-w-sm flex items-center justify-between pt-4 z-10">
                {loginStep !== 'selection' && (
                    <button
                        onClick={() => {
                            setError('');
                            if (loginStep === 'otp') setLoginStep('identifier');
                            else setLoginStep('selection');
                        }}
                        className="p-2 rounded-xl text-slate-700 hover:bg-black/5 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                    >
                        <ArrowLeft size={16} /> Voltar
                    </button>
                )}
            </div>

            {/* MAIN CONTENT CONTAINER */}
            <main className="w-full max-w-sm my-auto space-y-6 z-10 relative">
                
                {/* STEP 1: Selection Cards (Figma Frame 17:3) */}
                {loginStep === 'selection' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        
                        {/* Logo */}
                        <div className="mb-6">
                            <AsteryskoLogoSVG size="large" />
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-4">Portal do Cliente</h1>
                            <p className="text-xs text-[#797979] mt-1">Escolha como quer acessar sua conta</p>
                        </div>

                        {/* Cards Selection Grid (Figma Frame 17:3) */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Card 1: com WhatsApp */}
                            <button
                                type="button"
                                onClick={() => {
                                    setLoginType('phone');
                                    setError('');
                                    setLoginStep('identifier');
                                }}
                                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#1A1FD3] transition-all flex flex-col items-start gap-4 group cursor-pointer text-left h-36 justify-between"
                            >
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1D8800] flex items-center justify-center shrink-0">
                                    <Smartphone size={22} />
                                </div>
                                <div>
                                    <span className="block text-[11px] text-slate-400 font-medium">com</span>
                                    <span className="text-sm font-bold text-slate-900">WhatsApp</span>
                                </div>
                            </button>

                            {/* Card 2: com Email */}
                            <button
                                type="button"
                                onClick={() => {
                                    setLoginType('email');
                                    setError('');
                                    setLoginStep('identifier');
                                }}
                                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#1A1FD3] transition-all flex flex-col items-start gap-4 group cursor-pointer text-left h-36 justify-between"
                            >
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1A1FD3] flex items-center justify-center shrink-0">
                                    <Mail size={22} />
                                </div>
                                <div>
                                    <span className="block text-[11px] text-slate-400 font-medium">com</span>
                                    <span className="text-sm font-bold text-slate-900">Email</span>
                                </div>
                            </button>
                        </div>

                        {/* Bottom Full Card: Registrar minha marca */}
                        <a
                            href="https://asterysko.com/nova-marca"
                            target="_blank"
                            rel="noreferrer"
                            className="w-full bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#181A80] transition-all flex items-center justify-between group cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#181A80] flex items-center justify-center shrink-0 font-bold text-lg">
                                    ®
                                </div>
                                <span className="text-sm font-bold text-slate-900">Registrar minha marca</span>
                            </div>
                            <span className="text-xs font-semibold text-[#181A80] group-hover:translate-x-1 transition-transform">Ir</span>
                        </a>
                    </div>
                )}

                {/* STEP 2: Input Identifier (Figma Frames 40:83 & 40:136) */}
                {loginStep === 'identifier' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div>
                            <AsteryskoLogoSVG />
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-6">
                                {loginType === 'phone' ? 'Acessar com Whatsapp' : 'Acessar com Email'}
                            </h1>
                            <p className="text-xs text-[#797979] mt-1">
                                {loginType === 'phone' ? 'Digite o número cadastrado na Asterysko' : 'Digite o email cadastrado na Asterysko'}
                            </p>
                        </div>

                        <form onSubmit={handleRequestOtp} className="space-y-4">
                            {/* Pill Input with Circle Arrow Button inside (Figma 40:83 & 40:136) */}
                            <div className="bg-white p-2.5 pl-5 rounded-full border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 flex-1">
                                    {loginType === 'phone' ? (
                                        <Smartphone size={20} className="text-[#1D8800] shrink-0" />
                                    ) : (
                                        <Mail size={20} className="text-[#1A1FD3] shrink-0" />
                                    )}
                                    <input
                                        type={loginType === 'phone' ? 'tel' : 'email'}
                                        inputMode={loginType === 'phone' ? 'tel' : 'email'}
                                        value={loginType === 'phone' ? phoneInput : emailInput}
                                        onChange={loginType === 'phone' ? handlePhoneChange : (e) => setEmailInput(e.target.value)}
                                        placeholder={loginType === 'phone' ? '(00) 00000-0000' : 'email@email.com'}
                                        className="w-full bg-transparent outline-none text-slate-900 placeholder:text-[#C7C7C7] text-sm font-bold"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || !activeIdentifier.trim()}
                                    className="w-10 h-10 rounded-full bg-[#1A1FD3] hover:bg-[#1418ab] text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={18} />}
                                </button>
                            </div>

                            {error && (
                                <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-2xl flex items-center gap-2">
                                    <AlertCircle size={16} className="shrink-0 text-red-500" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </form>
                    </div>
                )}

                {/* STEP 3: OTP Code Entry (Figma Frames 40:159 & 40:198) */}
                {loginStep === 'otp' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-white/80 shadow-xs flex items-center justify-center mb-4">
                                {loginType === 'phone' ? (
                                    <Smartphone size={24} className="text-[#1D8800]" />
                                ) : (
                                    <Mail size={24} className="text-[#1A1FD3]" />
                                )}
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Código de acesso</h1>
                            <p className="text-xs text-slate-600 mt-1">
                                Insira o código que você recebeu no <span className="font-bold text-slate-900">{sentIdentifier}</span>
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* 5 White Rounded Box Inputs (Figma 40:159 & 40:198) */}
                            <div className="grid grid-cols-5 gap-2.5">
                                {otpDigits.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        id={`otp-box-${idx}`}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                        className="w-full h-14 bg-white rounded-2xl border border-slate-200/80 text-center font-bold text-xl text-slate-900 outline-none focus:border-[#1A1FD3] shadow-xs"
                                        autoFocus={idx === 0}
                                    />
                                ))}
                            </div>

                            {error && (
                                <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-2xl flex items-center gap-2">
                                    <AlertCircle size={16} className="shrink-0 text-red-500" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => submitOtpCode(otpDigits.join(''))}
                                disabled={loading || otpDigits.some(d => d === '')}
                                className={`w-full py-4 rounded-2xl font-bold text-sm text-white ${loginType === 'phone' ? 'bg-[#1D8800] hover:bg-[#156700]' : 'bg-[#1A1FD3] hover:bg-[#1418ab]'} shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Verificando...
                                    </>
                                ) : (
                                    'Entrar no Portal'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <div className="w-full max-w-sm text-center py-4 z-10">
                <p className="text-[11px] text-slate-400">Asterysko Propriedade Intelectual © 2026</p>
            </div>
        </div>
    );
};
