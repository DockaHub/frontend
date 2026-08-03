import React, { useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';
import './AsteryskoPortal.css';

interface AsteryskoLoginPageProps {
    theme?: 'light' | 'dark';
    onToggleTheme?: () => void;
}

type LoginStep = 'selection' | 'identifier' | 'otp';
type LoginType = 'phone' | 'email';

const ASSET_ROOT = '/assets/asterysko';

const formatPhoneMask = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits ? `(${digits}` : '';
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export const AsteryskoLoginPage: React.FC<AsteryskoLoginPageProps> = () => {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const [step, setStep] = useState<LoginStep>('selection');
    const [loginType, setLoginType] = useState<LoginType>('phone');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [sentIdentifier, setSentIdentifier] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

    const identifier = loginType === 'phone' ? phone : email;
    const isPhone = loginType === 'phone';
    const filledDigits = otp.filter(Boolean).length;

    const selectLoginType = (type: LoginType) => {
        setLoginType(type);
        setError('');
        setStep('identifier');
    };

    const goBack = () => {
        setError('');
        if (step === 'otp') setStep('identifier');
        else setStep('selection');
    };

    const requestOtp = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        if (!identifier.trim()) {
            setError(isPhone ? 'Informe o número do celular.' : 'Informe seu e-mail.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/request-otp', { identifier });
            setSentIdentifier(identifier);
            setOtp(['', '', '', '', '']);
            setStep('otp');
            window.setTimeout(() => otpRefs.current[0]?.focus(), 50);
        } catch (requestError: any) {
            setError(requestError.response?.data?.error || 'Não encontramos este cadastro. Verifique os dados digitados.');
        } finally {
            setLoading(false);
        }
    };

    const submitOtp = async (code: string) => {
        if (loading || code.length !== 5) return;
        setError('');
        setLoading(true);
        try {
            const response = await api.post('/auth/verify-otp', { identifier: sentIdentifier, code });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            await refreshUser();
            navigate('/portal');
        } catch (verifyError: any) {
            setError(verifyError.response?.data?.error || 'Código de acesso inválido ou expirado.');
        } finally {
            setLoading(false);
        }
    };

    const changeOtp = (index: number, rawValue: string) => {
        const value = rawValue.replace(/\D/g, '').slice(-1);
        const next = [...otp];
        next[index] = value;
        setOtp(next);
        if (value && index < 4) otpRefs.current[index + 1]?.focus();
        if (value && index === 4 && next.every(Boolean)) void submitOtp(next.join(''));
    };

    const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
        if (event.key === 'Enter' && otp.every(Boolean)) void submitOtp(otp.join(''));
    };

    const authClass = step === 'otp'
        ? `ast-page ast-auth ${isPhone ? 'ast-auth--phone-otp' : 'ast-auth--email-otp'}`
        : 'ast-page ast-auth';

    return (
        <div className={authClass}>
            <div className="ast-auth__stage">
                {step !== 'selection' && (
                    <button className="ast-round-button ast-auth__back" type="button" onClick={goBack} aria-label="Voltar">
                        <ArrowLeft size={20} strokeWidth={1.8} />
                    </button>
                )}

                {step === 'otp' && (
                    <img
                        className="ast-otp-burst"
                        src={`${ASSET_ROOT}/${isPhone ? 'otp_whatsapp-imgGroup2.svg' : 'otp_email-imgGroup2.svg'}`}
                        alt=""
                        aria-hidden="true"
                    />
                )}

                {step === 'selection' && (
                    <main className="ast-auth__content ast-auth__content--selection">
                        <img className="ast-brand-mark" src={`${ASSET_ROOT}/login-imgGroup2.svg`} alt="Asterysko" />
                        <h1 className="ast-auth__heading">Portal do Cliente</h1>
                        <p className="ast-auth__subtitle">Escolha como quer acessar sua conta</p>

                        <div className="ast-login-actions">
                            <button className="ast-login-choice" type="button" onClick={() => selectLoginType('phone')}>
                                <img className="ast-login-choice__icon" src={`${ASSET_ROOT}/login-imgIcBaselineWhatsapp.svg`} alt="" />
                                <span className="ast-login-choice__copy">
                                    <small>com</small>
                                    <strong data-channel="phone">WhatsApp</strong>
                                </span>
                            </button>
                            <button className="ast-login-choice" type="button" onClick={() => selectLoginType('email')}>
                                <img className="ast-login-choice__icon" src={`${ASSET_ROOT}/login-imgGroup.svg`} alt="" />
                                <span className="ast-login-choice__copy">
                                    <small>com</small>
                                    <strong>Email</strong>
                                </span>
                            </button>
                        </div>

                        <a className="ast-register-choice" href="https://asterysko.com/nova-marca" target="_blank" rel="noreferrer">
                            <img src={`${ASSET_ROOT}/login-imgBoxiconsRegistered.svg`} alt="" />
                            <span>Registrar minha marca</span>
                        </a>
                    </main>
                )}

                {step === 'identifier' && (
                    <main className="ast-auth__content ast-auth__content--identifier">
                        <img className="ast-brand-mark" src={`${ASSET_ROOT}/${isPhone ? 'whatsapp-imgGroup2.svg' : 'email-imgGroup2.svg'}`} alt="Asterysko" />
                        <h1 className="ast-auth__heading">
                            Acessar com <span className="ast-season">{isPhone ? 'Whatsapp' : 'Email'}</span>
                        </h1>
                        <p className="ast-auth__subtitle">
                            {isPhone ? 'Digite o número cadastrado na Asterysko' : 'Digite o email cadastrado na Asterysko'}
                        </p>

                        <form className="ast-identifier-form" onSubmit={requestOtp}>
                            <div className="ast-identifier-field">
                                <img
                                    className="ast-identifier-field__icon"
                                    src={`${ASSET_ROOT}/${isPhone ? 'whatsapp-imgIcBaselineWhatsapp.svg' : 'email-imgGroup.svg'}`}
                                    alt=""
                                />
                                <input
                                    type={isPhone ? 'tel' : 'email'}
                                    inputMode={isPhone ? 'tel' : 'email'}
                                    value={identifier}
                                    onChange={event => isPhone ? setPhone(formatPhoneMask(event.target.value)) : setEmail(event.target.value)}
                                    placeholder={isPhone ? '(00) 00000-0000' : 'email@email.com'}
                                    autoComplete={isPhone ? 'tel' : 'email'}
                                    autoFocus
                                    aria-label={isPhone ? 'Número do WhatsApp' : 'Endereço de e-mail'}
                                />
                                <button className="ast-identifier-submit" type="submit" disabled={loading || !identifier.trim()} aria-label="Continuar">
                                    {loading ? <span className="ast-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : (
                                        <img src={`${ASSET_ROOT}/${isPhone ? 'whatsapp-imgFrame1410119738.svg' : 'email-imgFrame1410119738.svg'}`} alt="" />
                                    )}
                                </button>
                            </div>
                            {error && <p className="ast-form-error" role="alert">{error}</p>}
                        </form>
                    </main>
                )}

                {step === 'otp' && (
                    <main className="ast-auth__content ast-auth__content--otp">
                        <img
                            className="ast-auth__channel-icon"
                            src={`${ASSET_ROOT}/${isPhone ? 'otp_whatsapp-imgIcBaselineWhatsapp.svg' : 'otp_email-imgGroup.svg'}`}
                            alt=""
                        />
                        <h1 className="ast-auth__heading">Código de acesso</h1>
                        <p className="ast-auth__subtitle">Insira o código que você recebeu no {sentIdentifier}</p>

                        <div className="ast-otp-fields" aria-label="Código de acesso de cinco dígitos">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={element => { otpRefs.current[index] = element; }}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                                    maxLength={1}
                                    value={digit}
                                    onChange={event => changeOtp(index, event.target.value)}
                                    onKeyDown={event => handleOtpKeyDown(index, event)}
                                    aria-label={`Dígito ${index + 1}`}
                                    disabled={loading}
                                />
                            ))}
                        </div>
                        {error && <p className="ast-form-error" role="alert">{error}</p>}
                    </main>
                )}

                {step === 'otp' && (
                    <div
                        className="ast-otp-progress"
                        data-filled={filledDigits}
                        style={{ color: isPhone ? '#1e8800' : '#1a1fd3' }}
                        aria-hidden="true"
                    />
                )}
            </div>
        </div>
    );
};

export default AsteryskoLoginPage;
