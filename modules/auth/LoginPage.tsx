import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';

type LoginStep = 'email' | 'password';
type FlightState = 'idle' | 'origin' | 'outbound' | 'loading' | 'returning';

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

const nextPaint = () =>
  new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));

const ManywaysMark: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 62 32" fill="none" aria-hidden="true">
    <path d="M2 27.5h57.5M2 27.5l49.8-13.3M2 27.5 42.6 4M2 27.5 30.5 0M2 27.5 16.8 1.9M2 27.5 6.7 8.1M2 27.5V12.6" />
  </svg>
);

const AsteryskoMark: React.FC = () => (
  <svg viewBox="0 0 38 34" fill="currentColor" aria-hidden="true">
    <path d="M29.2 1c-1 1-7.8 10.4-9.5 12.8-.4.4-.4 1 0 1.4.4.4 1 .4 1.4 0 2.4-1.7 11.8-8.5 12.8-9.5a3.32 3.32 0 0 0-4.7-4.7ZM35.2 15.9c-1.3 0-10.4 1.4-13.2 1.9a.82.82 0 0 0 0 1.7c2.8.4 11.9 1.9 13.2 1.9a2.75 2.75 0 1 0 0-5.5ZM29.1 28.7c-.8-.8-6.8-5.1-8.6-6.4a.65.65 0 0 0-.9.9c1.3 1.8 5.6 7.8 6.4 8.6a2.23 2.23 0 0 0 3.1-3.1ZM17.9 32.3c0-1-1-6.6-1.2-8.2a.5.5 0 0 0-1 0c-.2 1.6-1.2 7.2-1.2 8.2a1.72 1.72 0 1 0 3.4 0ZM9.3 27.2c.5-.5 2.7-3.7 3.4-4.6a.35.35 0 0 0-.5-.5c-.9.7-4.1 3-4.6 3.4a1.18 1.18 0 0 0 1.7 1.7ZM2.6 20.4c1 0 6.6-1 8.2-1.2a.5.5 0 0 0 0-1c-1.6-.2-7.2-1.2-8.2-1.2a1.72 1.72 0 1 0 0 3.4ZM.8 7.3c.9.9 9.2 6.9 10.8 8a.82.82 0 0 0 1.2-1.2c-1.2-1.6-7.2-9.9-8-10.8a2.8 2.8 0 0 0-4 4ZM14.5 5.2c0 1 .9 6.6 1.2 8.2a.5.5 0 0 0 1 0c.2-1.6 1.2-7.2 1.2-8.2a1.72 1.72 0 1 0-3.4 0Z" />
  </svg>
);

const BurstMark: React.FC = () => (
  <svg viewBox="0 0 42 42" fill="none" aria-hidden="true">
    <path d="M21 3v36M3 21h36M8.3 8.3l25.4 25.4M33.7 8.3 8.3 33.7" />
    <circle cx="21" cy="21" r="3.2" fill="currentColor" stroke="none" />
  </svg>
);

interface OrbitItemProps {
  angle: number;
  label: string;
  children: React.ReactNode;
  className?: string;
}

const OrbitItem: React.FC<OrbitItemProps> = ({ angle, label, children, className = '' }) => (
  <div
    className="orbit-node"
    style={{
      '--orbit-angle': `${angle}deg`,
      '--orbit-counter-angle': `${-angle}deg`,
    } as React.CSSProperties}
  >
    <div className={`brand-tile ${className}`} aria-label={label} title={label}>
      {children}
    </div>
  </div>
);

const OrbitScene: React.FC = () => (
  <div className="orbit-scene" aria-hidden="true">
    <div className="orbit-ring orbit-ring--outer">
      <div className="orbit-track orbit-track--outer">
        <OrbitItem angle={198} label="Milla" className="brand-tile--milla">
          <span>MILLA</span>
        </OrbitItem>
        <OrbitItem angle={226} label="Manyways" className="brand-tile--manyways">
          <BurstMark />
        </OrbitItem>
        <OrbitItem angle={270} label="Asterysko" className="brand-tile--asterysko">
          <AsteryskoMark />
        </OrbitItem>
        <OrbitItem angle={314} label="Fauves" className="brand-tile--fauves">
          <span>FAU<br />VES</span>
        </OrbitItem>
        <OrbitItem angle={342} label="Uma Chave" className="brand-tile--umachave">
          <span>uↄ</span>
        </OrbitItem>
        <OrbitItem angle={104} label="Hostizi" className="brand-tile--hostizi">
          <span>H</span>
        </OrbitItem>
      </div>
    </div>

    <div className="orbit-ring orbit-ring--middle">
      <div className="orbit-track orbit-track--middle">
        <OrbitItem angle={210} label="ManySpace" className="brand-tile--space">
          <ManywaysMark />
        </OrbitItem>
        <OrbitItem angle={327} label="Docka" className="brand-tile--docka">
          <span>D</span>
        </OrbitItem>
      </div>
    </div>

    <div className="orbit-ring orbit-ring--inner" />
  </div>
);

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);

  const [step, setStep] = useState<LoginStep>('email');
  const [flightState, setFlightState] = useState<FlightState>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [buttonOrigin, setButtonOrigin] = useState({ left: 0, top: 0, size: 56 });

  const busy = flightState !== 'idle';

  useEffect(() => {
    if (!busy) {
      const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 120);
      return () => window.clearTimeout(focusTimer);
    }
  }, [step, busy]);

  const launchAction = async () => {
    const rect = actionRef.current?.getBoundingClientRect();
    if (rect) {
      setButtonOrigin({ left: rect.left, top: rect.top, size: rect.width });
    }
    setFlightState('origin');
    await nextPaint();
    await nextPaint();
    setFlightState('outbound');
  };

  const returnAction = async () => {
    setFlightState('returning');
    await wait(480);
    setFlightState('idle');
  };

  const handleEmailStep = async () => {
    setError('');
    await launchAction();
    await wait(520);
    setFlightState('loading');
    await wait(720);
    setStep('password');
    await returnAction();
  };

  const handlePasswordStep = async () => {
    setError('');
    await launchAction();
    await wait(520);
    setFlightState('loading');

    try {
      await login({ email: email.trim(), password });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Email ou senha incorretos. Tente novamente.');
      await returnAction();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;

    if (step === 'email') {
      await handleEmailStep();
      return;
    }

    await handlePasswordStep();
  };

  const goBackToEmail = () => {
    if (busy) return;
    setStep('email');
    setPassword('');
    setError('');
    setShowPassword(false);
  };

  return (
    <main className="manyways-login">
      <div className="manyways-wordmark" aria-label="manyways">
        <ManywaysMark className="manyways-wordmark__mark" />
        <span>manyways</span>
      </div>

      <section className="login-stage" aria-labelledby="login-title">
        <h1 id="login-title" className="sr-only">Acessar o Manyways Hub</h1>

        <form className={`login-form ${error ? 'login-form--error' : ''}`} onSubmit={handleSubmit}>
          <div className="login-pill">
            {step === 'password' && (
              <button
                type="button"
                className="login-pill__back"
                onClick={goBackToEmail}
                disabled={busy}
                aria-label="Voltar para o email"
                title="Trocar email"
              >
                <ArrowLeft size={19} strokeWidth={1.6} />
              </button>
            )}

            <label className="sr-only" htmlFor="login-credential">
              {step === 'email' ? 'Digite seu email' : 'Digite sua senha'}
            </label>
            <input
              ref={inputRef}
              id="login-credential"
              key={step}
              className="login-pill__input"
              type={step === 'email' ? 'email' : showPassword ? 'text' : 'password'}
              autoComplete={step === 'email' ? 'email' : 'current-password'}
              inputMode={step === 'email' ? 'email' : 'text'}
              value={step === 'email' ? email : password}
              onChange={(event) => step === 'email' ? setEmail(event.target.value) : setPassword(event.target.value)}
              placeholder={step === 'email' ? 'Digite seu email' : 'Digite sua senha'}
              disabled={busy}
              required
            />

            {step === 'password' && (
              <button
                type="button"
                className="login-pill__visibility"
                onClick={() => setShowPassword((current) => !current)}
                disabled={busy}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            )}

            <button
              ref={actionRef}
              className="login-pill__action"
              type="submit"
              disabled={busy}
              aria-label={step === 'email' ? 'Continuar para a senha' : 'Entrar'}
            >
              <ArrowRight size={29} strokeWidth={1.25} />
            </button>
          </div>

          <div className="login-message" aria-live="polite">
            {error ? (
              <span className="login-message__error">{error}</span>
            ) : step === 'password' ? (
              <span>
                Acessando como <strong>{email}</strong>. Fale com seu gestor se perdeu seu acesso.
              </span>
            ) : (
              <span>Esqueceu sua senha ou perdeu seu acesso? Fale com seu gestor.</span>
            )}
          </div>
        </form>
      </section>

      {flightState !== 'idle' && (
        <div
          className={`login-flight login-flight--${flightState}`}
          style={{
            '--flight-left': `${buttonOrigin.left}px`,
            '--flight-top': `${buttonOrigin.top}px`,
            '--flight-size': `${buttonOrigin.size}px`,
          } as React.CSSProperties}
          aria-hidden="true"
        >
          {flightState === 'loading'
            ? <LoaderCircle className="login-flight__spinner" size={30} strokeWidth={1.6} />
            : <ArrowRight size={29} strokeWidth={1.25} />}
        </div>
      )}

      <OrbitScene />
    </main>
  );
};
