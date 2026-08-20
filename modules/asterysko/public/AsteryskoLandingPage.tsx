import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, BadgeCheck, Check, CheckCircle2, Copyright, FileCode2,
  FileText, Lightbulb, Menu, MessageCircle, PenTool, Phone, Plus,
  Radar, ShieldCheck,
} from 'lucide-react';
import api from '../../../services/api';
import './AsteryskoLandingPage.css';

type ContactPreference = 'whatsapp' | 'phone';

interface LeadFormState {
  brand: string;
  name: string;
  phone: string;
  email: string;
  preference: ContactPreference;
  website: string;
}

const initialForm: LeadFormState = {
  brand: '',
  name: '',
  phone: '',
  email: '',
  preference: 'whatsapp',
  website: '',
};

const services = [
  { icon: BadgeCheck, text: 'Registre sua marca e proteja o que identifica você.' },
  { icon: Lightbulb, text: 'Inove com segurança e exclusividade, patenteando.' },
  { icon: FileCode2, text: 'Seu código também merece proteção.' },
  { icon: Copyright, text: 'Proteja suas obras e conteúdos criativos.' },
  { icon: Radar, text: 'Acompanhamento de marcas e riscos.' },
  { icon: PenTool, text: 'Proteja desenhos industriais e criações visuais.' },
];

const clientLogos = [
  { src: '/assets/asterysko/lp/client-litorania.png', alt: 'Cliente Litorânia', className: 'lp-authority__brand lp-authority__brand--one' },
  { src: '/assets/asterysko/lp/client-reviva.png', alt: 'Cliente Instituto Reviva', className: 'lp-authority__brand lp-authority__brand--two' },
  { src: '/assets/asterysko/lp/client-irblock.png', alt: 'Cliente IR Block', className: 'lp-authority__brand lp-authority__brand--three' },
  { src: '/assets/asterysko/lp/client-lefka.png', alt: 'Cliente Lefka Brasil', className: 'lp-authority__brand lp-authority__brand--four' },
];

const scrollToForm = () => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });

const AsteryskoLandingPage: React.FC = () => {
  const [form, setForm] = useState<LeadFormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Registro de Marca no INPI | Asterysko';
    document.documentElement.classList.add('asteryko-lp-active');
    return () => {
      document.title = previousTitle;
      document.documentElement.classList.remove('asteryko-lp-active');
    };
  }, []);

  const campaignContext = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid'];
    return keys
      .map((key) => [key, params.get(key)] as const)
      .filter(([, value]) => Boolean(value))
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }, []);

  const setField = <K extends keyof LeadFormState>(field: K, value: LeadFormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const submitLead = async (event: FormEvent) => {
    event.preventDefault();
    if (form.website) return;
    setError('');
    setSubmitting(true);
    try {
      const preference = form.preference === 'whatsapp' ? 'WhatsApp' : 'Ligação';
      const context = campaignContext ? `\n\nCampanha:\n${campaignContext}` : '';
      await api.post('/asterysko/public/leads', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.replace(/\D/g, ''),
        brand: form.brand.trim(),
        source: 'lp',
        preference,
        campaign: campaignContext,
        subject: `LP Tráfego Pago — ${form.brand.trim()}`,
        message: `Marca de interesse: ${form.brand.trim()}\nPreferência de contato: ${preference}\nOrigem: Landing Page /lp${context}`,
      });
      setSubmitted(true);
      setForm(initialForm);
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Não foi possível enviar agora. Tente novamente em instantes.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="asteryko-lp">
      <section className="lp-hero" aria-labelledby="lp-title">
        <div className="lp-hero__content">
          <div className="lp-hero__copy">
            <img className="lp-hero__logo" src="/assets/asterysko/lp/logo-white.svg" alt="Asterysko" />
            <h1 id="lp-title">Registre sua<br />marca no INPI</h1>
            <p className="lp-hero__lead">Conte com quem entende do assunto! Especialistas tornam seu registro mais simples e seguro.</p>
            <div className="lp-specialists" aria-label="Especialistas Asterysko">
              <div className="lp-specialists__faces">
                {['specialist-01.png', 'specialist-02.png', 'specialist-03.png'].map((image, index) => (
                  <img key={image} src={`/assets/asterysko/lp/${image}`} alt={`Especialista Asterysko ${index + 1}`} />
                ))}
              </div>
              <div className="lp-specialists__rating">
                <img src="/assets/asterysko/lp/review-stars.svg" alt="Cinco estrelas" />
                <strong>Atendimento especializado</strong>
              </div>
            </div>
            <p className="lp-hero__support">Suporte de consultores especializados em registro de marca durante todo o processo.</p>
          </div>

          <form id="lead-form" className="lp-form" onSubmit={submitLead} noValidate>
            {submitted ? (
              <div className="lp-form__success" role="status">
                <span><CheckCircle2 size={38} /></span>
                <h2>Recebemos seus dados!</h2>
                <p>Um especialista da Asterysko entrará em contato pelo canal escolhido.</p>
                <button type="button" onClick={() => setSubmitted(false)}>Enviar outro contato</button>
              </div>
            ) : (
              <>
                <h2>Registre<sup>®</sup> sua marca em poucos passos:</h2>
                <label><span>Sua marca</span><input required autoComplete="organization" value={form.brand} onChange={(event) => setField('brand', event.target.value)} placeholder="Sua marca" /></label>
                <label><span>Seu nome</span><input required autoComplete="name" value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="Seu nome" /></label>
                <label><span>Seu WhatsApp</span><input required inputMode="tel" autoComplete="tel" value={form.phone} onChange={(event) => setField('phone', formatPhone(event.target.value))} placeholder="Seu WhatsApp" /></label>
                <label><span>Seu e-mail</span><input required type="email" autoComplete="email" value={form.email} onChange={(event) => setField('email', event.target.value)} placeholder="Seu e-mail" /></label>
                <label className="lp-form__honeypot" aria-hidden="true"><span>Site</span><input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => setField('website', event.target.value)} /></label>
                <div className="lp-form__preference">
                  <p>Como prefere receber nosso contato?</p>
                  <button type="button" className={form.preference === 'whatsapp' ? 'is-active' : ''} onClick={() => setField('preference', 'whatsapp')}><MessageCircle size={16} /> WhatsApp</button>
                  <button type="button" className={form.preference === 'phone' ? 'is-active' : ''} onClick={() => setField('preference', 'phone')}><Phone size={15} /> Ligação</button>
                </div>
                {error && <p className="lp-form__error" role="alert">{error}</p>}
                <button className="lp-form__submit" type="submit" disabled={submitting}>
                  <span>{submitting ? 'Enviando...' : 'Falar com um especialista'}</span><ArrowRight size={28} />
                </button>
                <p className="lp-form__privacy">Ao enviar seus dados, você aceita a Política de Privacidade e Termos de Uso da Asterysko.</p>
              </>
            )}
          </form>
        </div>
      </section>

      <div className="lp-seals" aria-label="Órgãos oficiais relacionados ao registro de marcas">
        <img src="/assets/asterysko/lp/inpi-seal.svg" alt="INPI — Instituto Nacional da Propriedade Industrial" />
        <img src="/assets/asterysko/lp/govbr-seal.svg" alt="Ministério do Desenvolvimento e Governo Federal" />
      </div>

      <section className="lp-authority" aria-labelledby="lp-authority-title">
        {clientLogos.map((logo) => <div className={logo.className} key={logo.src}><img src={logo.src} alt={logo.alt} /></div>)}
        <div className="lp-authority__metric lp-authority__metric--left"><strong>10k</strong><span>marcas registradas</span></div>
        <div className="lp-authority__center">
          <h2 id="lp-authority-title">Números que comprovam nossa autoridade</h2>
          <button type="button" onClick={scrollToForm}>Solicitar contato <ArrowRight size={22} /></button>
        </div>
        <div className="lp-authority__metric lp-authority__metric--right"><strong>1764</strong><span>cidades atendidas</span></div>
      </section>

      <section className="lp-services" aria-labelledby="lp-services-title">
        <div className="lp-services__inner">
          <h2 id="lp-services-title">Tudo para<br />proteger seus<br />ativos</h2>
          <div className="lp-services__grid">
            {services.map(({ icon: Icon, text }) => (
              <article key={text} className="lp-service-card"><Icon size={48} strokeWidth={1.45} /><h3>{text}</h3></article>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-portal" aria-labelledby="lp-portal-title">
        <div className="lp-portal__visual">
          <div className="lp-phone">
            <img className="lp-phone__frame" src="/assets/asterysko/lp/phone-frame.png" alt="Portal Asterysko no celular" />
            <div className="lp-phone__screen">
              <header><div><strong>Olá, André</strong><small>Acompanhe seus processos</small></div><Menu size={14} /></header>
              <div className="lp-phone__cards"><article><span>Aguardando exame</span><i /><strong>André Cakes</strong></article><article><span>Processo iniciado</span><i /><strong>André Bakery</strong></article></div>
              <button type="button"><Plus size={13} /> Registrar nova marca</button>
              <div className="lp-phone__notice"><ShieldCheck size={16} /><span><strong>Proteção não termina no registro</strong><small>Monitore, renove e expanda.</small></span></div>
            </div>
          </div>
          <div className="lp-portal__bubble lp-portal__bubble--one"><Check size={18} /> Processo atualizado</div>
          <div className="lp-portal__bubble lp-portal__bubble--two"><ShieldCheck size={18} /> Nenhuma ação necessária</div>
          <div className="lp-portal__bubble lp-portal__bubble--three"><FileText size={18} /> Documento disponível</div>
          <button type="button" className="lp-portal__bubble lp-portal__bubble--four" onClick={scrollToForm}><Plus size={18} /> Solicitar novo registro <ArrowRight size={18} /></button>
        </div>
        <div className="lp-portal__copy">
          <h2 id="lp-portal-title">Sua marca protegida.<br />Seu processo sempre à vista.</h2>
          <p>Acompanhe cada etapa, acesse seus documentos e cuide de novas marcas em um só lugar.</p>
          <button type="button" onClick={scrollToForm}>Solicitar contato <ArrowRight size={22} /></button>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-footer__links">
          <div><strong>Sobre a Asterysko</strong><a href="https://asterysko.com" target="_blank" rel="noreferrer">Sobre nós</a><a href="#lp-authority-title">Cases de sucesso</a></div>
          <div><strong>Suporte</strong><a href="https://cliente.asterysko.com/portal">Portal do cliente</a><button type="button" onClick={scrollToForm}>Solicite atendimento</button></div>
          <div><strong>Recursos</strong><a href="https://asterysko.com" target="_blank" rel="noreferrer">Consulta de marca</a><a href="mailto:contato@asterysko.com">Fale conosco</a></div>
          <div><strong>Parcerias</strong><a href="mailto:contato@asterysko.com?subject=Parceria%20Asterysko">Seja um parceiro</a><a href="mailto:contato@asterysko.com?subject=Franquia%20Asterysko">Seja um franqueado</a></div>
          <div className="lp-footer__contact"><strong>Fale conosco</strong><p>Fale com um consultor agora e tire suas dúvidas.</p><button type="button" onClick={scrollToForm}><MessageCircle size={18} /> Fale conosco</button></div>
        </div>
        <div className="lp-footer__states"><strong>Estados</strong><p>Acre • Alagoas • Amapá • Amazonas • Bahia • Ceará • Distrito Federal • Espírito Santo • Goiás • Maranhão • Mato Grosso • Mato Grosso do Sul • Minas Gerais • Pará • Paraíba • Paraná • Pernambuco • Piauí • Rio de Janeiro • Rio Grande do Norte • Rio Grande do Sul • Rondônia • Roraima • Santa Catarina • São Paulo • Sergipe • Tocantins</p></div>
        <div className="lp-footer__bottom"><span>© 2026 Asterysko® — Todos os direitos reservados.</span><img src="/brands/manyways.svg" alt="manyways" /></div>
      </footer>
    </main>
  );
};

export default AsteryskoLandingPage;
