import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';
import { Smartphone, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

const AsteryskoLogoSVG = () => (
    <svg width="160" height="28" viewBox="0 0 200 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_1209_2)">
            <path d="M29.208 0.974374C28.9702 1.21152 28.779 1.47445 28.6239 1.758L19.6547 13.8217C19.2721 14.2032 19.2721 14.8218 19.6547 15.1982C20.0372 15.5745 20.6576 15.5797 21.035 15.1982L33.1317 6.25352C33.416 6.10402 33.6797 5.90811 33.9175 5.67096C35.2202 4.3718 35.2202 2.26838 33.9175 0.969219C32.6148 -0.329947 30.5056 -0.329947 29.2029 0.969219L29.208 0.974374Z" fill="currentColor" />
            <path d="M35.2461 15.9457C34.9669 15.9457 34.6929 15.987 34.4396 16.0643L21.9758 17.8893C21.5261 17.8893 21.159 18.2553 21.159 18.7039C21.159 19.1524 21.5261 19.5184 21.9758 19.5184L34.4345 21.3847C34.6878 21.462 34.9618 21.5033 35.2409 21.5033C36.7814 21.5033 38.0325 20.2608 38.0325 18.7296C38.0325 17.1985 36.7866 15.9457 35.2513 15.9457H35.2461Z" fill="currentColor" />
            <path d="M29.1356 28.7054C28.9754 28.5456 28.7996 28.4167 28.6083 28.3136L20.518 22.3127C20.2647 22.0549 19.8459 22.0549 19.5926 22.3127C19.3393 22.5704 19.3341 22.9829 19.5926 23.2355L25.5841 31.3243C25.6824 31.5151 25.8116 31.6904 25.9719 31.8502C26.8403 32.7215 28.2568 32.7215 29.1253 31.8502C29.9938 30.9789 29.9989 29.5715 29.1253 28.7054H29.1356Z" fill="currentColor" />
            <path d="M17.9435 32.2936C17.9435 32.1234 17.9177 31.9533 17.8712 31.7986L16.7442 24.1428C16.7442 23.8644 16.5219 23.6428 16.2428 23.6376C15.9636 23.6325 15.7413 23.8593 15.7361 24.1377L14.5833 31.7883C14.5368 31.943 14.511 32.1131 14.511 32.2832C14.511 33.2267 15.2761 33.9948 16.2273 34C17.1733 34 17.9435 33.237 17.9487 32.2884L17.9435 32.2936Z" fill="currentColor" />
            <path d="M9.27418 27.2464C9.3569 27.1639 9.42927 27.066 9.48096 26.968L12.6964 22.6581C12.8308 22.524 12.836 22.3024 12.6964 22.1632C12.5569 22.024 12.3397 22.024 12.2002 22.1632L7.86806 25.3544C7.76467 25.4059 7.67162 25.4781 7.58891 25.5606C7.12364 26.0246 7.12364 26.7773 7.58891 27.2412C8.05417 27.7052 8.80892 27.7052 9.27418 27.2412V27.2464Z" fill="currentColor" />
            <path d="M2.62615 20.4361C2.79674 20.4361 2.96734 20.4103 3.12242 20.3639L10.7941 19.2297C11.0732 19.2297 11.2955 19.0029 11.2955 18.7296C11.2955 18.4564 11.068 18.2296 10.7941 18.2296L3.12242 17.0954C2.96734 17.049 2.79674 17.0232 2.62615 17.0232C1.68012 17.0232 0.909851 17.7914 0.909851 18.7348C0.909851 19.6782 1.68012 20.4464 2.62615 20.4464V20.4361Z" fill="currentColor" />
            <path d="M0.811577 7.2743C1.00802 7.47536 1.23031 7.63518 1.46811 7.75891L11.5746 15.26C11.8951 15.5797 12.4121 15.5797 12.7326 15.26C13.0531 14.9404 13.0531 14.4249 12.7326 14.1052L5.24706 4.00061C5.12299 3.76346 4.95757 3.54177 4.76112 3.34587C3.67551 2.25807 1.90752 2.25807 0.816747 3.34071C-0.274031 4.42335 -0.274031 6.1865 0.811577 7.2743Z" fill="currentColor" />
            <path d="M14.5109 5.16058C14.5109 5.33071 14.5368 5.50083 14.5833 5.6555L15.7206 13.3061C15.7206 13.5845 15.9481 13.8062 16.2221 13.8062C16.4961 13.8062 16.7235 13.5794 16.7235 13.3061L17.8608 5.6555C17.9074 5.50083 17.9332 5.33071 17.9332 5.16058C17.9332 4.21713 17.1629 3.44898 16.2169 3.44898C15.2709 3.44898 14.5006 4.21713 14.5006 5.16058H14.5109Z" fill="currentColor" />
            <path d="M65.8757 25.3389C65.8757 25.3389 65.0538 25.5554 64.1594 25.5554C62.4069 25.5554 61.1197 24.7357 61.1197 22.7766V22.7406H61.0473C60.5821 23.5964 59.1191 25.5915 55.1851 25.5915C51.4681 25.5915 49.4675 23.6685 49.4675 20.9207C49.4675 17.25 52.9725 15.7859 60.4063 15.7859H60.9078V14.7187C60.9078 12.4349 59.512 10.9759 56.7256 10.9759C54.3321 10.9759 52.8639 11.94 52.8639 13.6876C52.8639 14.0795 52.9363 14.296 53.0449 14.5434L50.0775 15.0435C50.0775 15.0435 49.8604 14.4042 49.8604 13.5794C49.8604 10.5119 52.5072 8.33632 56.798 8.33632C61.373 8.33632 64.056 10.7955 64.056 14.6826V21.4929C64.056 22.4209 64.3042 22.7766 65.0951 22.7766C65.3122 22.7766 65.5604 22.7406 65.7051 22.7045L65.8861 25.344L65.8757 25.3389ZM60.9078 19.5648V17.9615H60.4063C54.6526 17.9615 52.683 18.9977 52.683 20.8485C52.683 22.1683 53.6859 22.9519 55.8313 22.9519C59.1191 22.9519 60.9078 21.1321 60.9078 19.5648Z" fill="currentColor" />
            <path d="M79.1356 13.7495C79.1356 12.0018 77.6003 10.9707 75.3825 10.9707C73.1648 10.9707 72.0585 11.9348 72.0585 13.3216C72.0585 17.281 82.2115 14.4249 82.3201 20.8073C82.3563 23.8387 79.4613 25.5864 75.3463 25.5864C71.2314 25.5864 69.0188 23.8387 68.0521 23.055L69.9803 20.9155C70.6937 21.5909 72.8029 22.9468 75.3774 22.9468C77.9518 22.9468 79.0943 22.0549 79.0943 20.7712C79.0943 17.3119 68.8327 19.5236 68.8327 13.2855C68.8327 10.5067 71.4795 8.33116 75.4446 8.33116C79.4096 8.33116 82.0564 10.3985 82.0564 13.1773C82.0564 13.8526 81.9117 14.3527 81.9117 14.3527L79.0167 14.5692C79.0891 14.3218 79.1253 13.997 79.1253 13.7495H79.1356Z" fill="currentColor" />
            <path d="M97.7616 24.4831C97.7616 24.4831 96.0815 25.5864 93.3261 25.5864C88.963 25.5864 87.2105 23.2664 87.2105 18.9565V11.079H84.5275V8.54769H87.2105V3.55724L90.3898 3.3768V8.54769H96.9344V11.079H90.3898V18.8534C90.3898 21.5651 91.3565 22.9158 93.6414 22.9158C95.6059 22.9158 96.7535 21.9518 96.7535 21.9518L97.7564 24.4831H97.7616Z" fill="currentColor" />
            <path d="M102.554 17.8171C102.874 20.9207 104.983 22.9519 108.344 22.9519C110.918 22.9519 112.381 21.7404 113.136 20.7403L115.064 22.4879C113.493 24.5553 110.991 25.5915 108.096 25.5915C102.699 25.5915 99.3021 22.1322 99.3021 16.9974C99.3021 11.8626 102.554 8.33632 107.666 8.33632C112.779 8.33632 115.354 11.7956 115.354 16.2138C115.354 17.214 115.209 17.8171 115.209 17.8171H102.554ZM102.626 15.5694H112.133C112.097 12.7906 110.344 10.9707 107.666 10.9707C104.989 10.9707 103.091 12.8628 102.626 15.5694Z" fill="currentColor" />
            <path d="M128.825 8.61986L128.04 11.7904C127.683 11.5739 127.182 11.3986 126.468 11.3986C124.571 11.3986 122.431 13.0741 122.431 16.5695V25.375H119.288V8.54769L121.505 8.43942C121.79 9.72312 121.934 11.61 121.934 12.3627H122.079C122.725 10.151 124.152 8.33632 126.654 8.33632C127.404 8.33632 128.19 8.44458 128.836 8.61986H128.825Z" fill="currentColor" />
            <path d="M133.437 32.8246C131.829 32.8246 130.826 32.2884 130.826 32.2884L131.4 29.6849C131.4 29.6849 132.186 30.1128 133.225 30.1128C134.977 30.1128 135.727 28.9735 136.301 27.4732L136.947 25.7977L129.797 8.54253H133.339L137.986 20.3072C138.343 21.163 138.415 21.4466 138.56 22.1632H138.596C138.741 21.3795 138.88 21.0599 139.17 20.3072L143.89 8.54253H147.105L139.097 28.3651C138.131 30.8604 136.559 32.8194 133.447 32.8194L133.437 32.8246Z" fill="currentColor" />
            <path d="M159.248 13.7495C159.248 12.0018 157.713 10.9707 155.495 10.9707C153.278 10.9707 152.171 11.9348 152.171 13.3216C152.171 17.281 162.324 14.4249 162.433 20.8073C162.469 23.8387 159.574 25.5864 155.459 25.5864C151.344 25.5864 149.132 23.8387 148.165 23.055L150.093 20.9155C150.806 21.5909 152.916 22.9468 155.49 22.9468C158.065 22.9468 159.207 22.0549 159.207 20.7712C159.207 17.3119 148.945 19.5236 148.945 13.2855C148.945 10.5067 151.592 8.33116 155.557 8.33116C159.522 8.33116 162.169 10.3985 162.169 13.1773C162.169 13.8526 162.024 14.3527 162.024 14.3527L159.129 14.5692C159.202 14.3218 159.238 13.997 159.238 13.7495H159.248Z" fill="currentColor" />
            <path d="M171.438 17.6367H169.613V25.375H166.47V0.206217H169.613V15.1105H171.94L177.73 8.55284H181.338L174.188 16.4303L182.051 25.3801H178.081L171.433 17.6418L171.438 17.6367Z" fill="currentColor" />
            <path d="M200 17.0335C200 22.1322 196.531 25.5915 191.315 25.5915C186.099 25.5915 182.63 22.1322 182.63 17.0335C182.63 11.9348 186.099 8.33632 191.315 8.33632C196.531 8.33632 200 11.9348 200 17.0335ZM196.785 17.0335C196.785 13.5381 194.603 10.9707 191.315 10.9707C188.027 10.9707 185.846 13.5381 185.846 17.0335C185.846 20.5289 188.027 22.9519 191.315 22.9519C194.603 22.9519 196.785 20.5289 196.785 17.0335Z" fill="currentColor" />
        </g>
        <defs>
            <clipPath id="clip0_1209_2">
                <rect width="200" height="34" fill="white" />
            </clipPath>
        </defs>
    </svg>
);

const formatPhoneMask = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits ? `(${digits}` : '';
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

interface AsteryskoLoginPageProps {
    theme?: 'light' | 'dark';
    onToggleTheme?: () => void;
}

export const AsteryskoLoginPage: React.FC<AsteryskoLoginPageProps> = () => {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    
    const [loginStep, setLoginStep] = useState<'selection' | 'identifier' | 'otp'>('selection');
    const [loginType, setLoginType] = useState<'phone' | 'email'>('phone');
    
    const [phoneInput, setPhoneInput] = useState('');
    const [emailInput, setEmailInput] = useState('');
    const [sentIdentifier, setSentIdentifier] = useState('');
    
    // 6 individual OTP digits matching Figma Frames 40:159 & 40:198
    const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
    
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
            setOtpDigits(['', '', '', '', '', '']);
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

        // Auto-advance focus to next field
        if (char && index < 5) {
            const nextEl = document.getElementById(`otp-input-${index + 1}`);
            if (nextEl) nextEl.focus();
        }

        // Auto submit if all 6 digits entered
        if (char && index === 5 && next.every(d => d !== '')) {
            submitOtpCode(next.join(''));
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            const prevEl = document.getElementById(`otp-input-${index - 1}`);
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

    return (
        <div className={`min-h-screen ${pageBgColor} flex flex-col items-center justify-between p-6 font-sans text-slate-900 transition-colors duration-300`}>
            
            {/* Header: Logo Asterysko (Figma Group 2) */}
            <div className="w-full max-w-sm flex items-center justify-between pt-4">
                <div className="text-[#1A1FD3]">
                    <AsteryskoLogoSVG />
                </div>
                {loginStep !== 'selection' && (
                    <button
                        onClick={() => {
                            setError('');
                            if (loginStep === 'otp') setLoginStep('identifier');
                            else setLoginStep('selection');
                        }}
                        className="p-2 rounded-xl text-slate-600 hover:bg-black/5 transition-colors flex items-center gap-1.5 text-xs font-bold"
                    >
                        <ArrowLeft size={16} /> Voltar
                    </button>
                )}
            </div>


                            {/* Figma Option: Registrar minha marca */}
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                                <a
                                    href="https://asterysko.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-[#1A1FD3] dark:hover:text-blue-400 transition-colors py-2 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    <span className="w-5 h-5 rounded-full bg-[#181A80] text-white flex items-center justify-center text-[10px] font-bold">®</span>
                                    Registrar minha marca
                                </a>
                            </div>
                        </div>
                    ) : (
                        /* STEP 2: Code Entry */
                        <form onSubmit={handleVerifyOtp} className="space-y-5">
                            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 flex justify-between items-center">
                                <span className="truncate pr-2">Enviado para: <strong>{activeIdentifier}</strong></span>
                                <button
                                    type="button"
                                    onClick={() => setOtpStep('identifier')}
                                    className="text-blue-400 hover:underline font-bold shrink-0 cursor-pointer"
                                >
                                    Alterar
                                </button>
                            </div>

                            {infoMessage && (
                                <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                                    <MessageCircle size={15} className="shrink-0 text-emerald-400" />
                                    <span>{infoMessage}</span>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-300 text-center uppercase tracking-wider">
                                    Código de 6 Dígitos
                                </label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    pattern="[0-9]*"
                                    inputMode="numeric"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-full text-center tracking-[10px] font-mono text-2xl py-4 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-2xl outline-none text-white placeholder:text-slate-700"
                                    style={{ fontSize: '24px' }}
                                    placeholder="000000"
                                    required
                                    autoFocus
                                />
                            </div>

                            {error && (
                                <div className="p-3.5 bg-red-950/50 border border-red-900/60 text-red-300 text-xs rounded-xl flex items-center gap-2">
                                    <AlertCircle size={16} className="shrink-0 text-red-400" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-2.5">
                                <button
                                    type="submit"
                                    disabled={loading || otpCode.length !== 6}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            Verificando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={16} />
                                            Entrar no Portal
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleRequestOtp}
                                    disabled={loading}
                                    className="w-full py-2 text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
                                >
                                    Reenviar código
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-8 text-center text-[11px] text-slate-600 font-medium">
                Asterysko Propriedade Intelectual &copy; 2026
            </footer>
        </div>
    );
};
