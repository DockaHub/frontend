import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import api from '../../../services/api';

interface WelcomePageProps {
    theme?: 'light' | 'dark';
    onToggleTheme?: () => void;
}

const AsteryskoLogoSVG = () => (
    <svg width="180" height="30" viewBox="0 0 200 34" fill="none" xmlns="http://www.w3.org/2000/svg">
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

const WelcomePage: React.FC<WelcomePageProps> = ({ theme, onToggleTheme }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setError('Link inválido ou expirado.');
                setValidating(false);
                return;
            }

            try {
                await api.get(`/auth/reset-password/validate?token=${token}`);
                setValidating(false);
            } catch (err: any) {
                setError('Link expirado ou inválido. Solicite um novo acesso ao suporte.');
                setValidating(false);
            }
        };

        validateToken();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        try {
            setLoading(true);
            await api.post('/auth/reset-password', { token, newPassword: password });
            setSuccess(true);

            // Redirect to portal login after 3 seconds
            setTimeout(() => {
                navigate('/portal');
            }, 3000);

        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao definir senha. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (validating) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 flex items-center justify-center">
                <Loader2 className="text-white w-10 h-10 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="bg-red-500/10 p-4 rounded-full w-fit mx-auto mb-6">
                        <AlertCircle size={40} className="text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-2">Link Inválido</h2>
                    <p className="text-slate-500 dark:text-zinc-400 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/portal')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold w-full"
                    >
                        Voltar para Login
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="bg-emerald-500/10 p-4 rounded-full w-fit mx-auto mb-6">
                        <CheckCircle2 size={40} className="text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-2">Senha Definida!</h2>
                    <p className="text-slate-500 dark:text-zinc-400 mb-6">Suas credenciais foram atualizadas. Você será redirecionado em instantes.</p>
                    <div className="flex justify-center">
                        <Loader2 className="text-blue-600 animate-spin w-6 h-6" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 flex items-center justify-center p-4 font-sans">
            {/* Theme Toggle - Absolute Position */}
            {onToggleTheme && (
                <button
                    onClick={onToggleTheme}
                    className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all shadow-lg"
                    title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            )}

            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row relative z-10">

                {/* Left Side - Form */}
                <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center">
                    <div className="mb-10 text-slate-900 dark:text-white">
                        <AsteryskoLogoSVG />
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900 dark:text-zinc-100 mb-3">Bem-vindo(a)</h1>
                    <p className="text-slate-500 dark:text-zinc-400 mb-8">
                        Para ativar sua conta e acessar o portal, por favor defina sua senha de acesso.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex gap-3">
                                <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800 dark:text-blue-200">
                                    <p className="font-bold mb-1">Dicas de Segurança</p>
                                    <ul className="list-disc list-inside text-blue-700 dark:text-blue-300/80 space-y-1 text-xs">
                                        <li>Mínimo de 6 caracteres</li>
                                        <li>Evite datas de aniversário</li>
                                        <li>Use letras e números</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 group-focus-within:text-blue-600 transition-colors" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Nova Senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-500 transition-all text-slate-900 dark:text-zinc-100 placeholder:text-slate-400"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 group-focus-within:text-blue-600 transition-colors" size={20} />
                                <input
                                    type="password"
                                    placeholder="Confirme a Senha"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-500 transition-all text-slate-900 dark:text-zinc-100 placeholder:text-slate-400"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    Definir Senha e Entrar
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Right Side - Branding/Info */}
                <div className="hidden md:flex w-1/2 bg-slate-50 dark:bg-zinc-800/50 p-14 flex-col justify-center relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-zinc-800 mb-8 max-w-sm mx-auto transform rotate-2 hover:rotate-0 transition-transform duration-500">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <Lock size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-zinc-100">Acesso Seguro</h3>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400">Seus dados protegidos</p>
                                </div>
                            </div>
                            <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed">
                                Você está definindo a senha mestra para acessar o Portal Asterysko. Nunca compartilhe sua senha com terceiros.
                            </p>
                        </div>
                    </div>

                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none">
                        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[100px] opacity-20"></div>
                        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[100px] opacity-20"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
