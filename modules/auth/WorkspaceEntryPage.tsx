import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronRight, LoaderCircle, RefreshCw, Users } from 'lucide-react';
import { Organization } from '../../types';
import { getBackendUrl } from '../../services/api';
import './WorkspaceEntryPage.css';

interface WorkspaceEntryPageProps {
  userName: string;
  organizations: Organization[];
  loading: boolean;
  error?: string;
  onEnter: (organization: Organization) => void;
  onRetry: () => void;
  onLogout: () => void;
}

const KNOWN_BRAND_ASSETS: Record<string, string> = {
  allyo: '/brands/allyo.svg',
  fauves: '/brands/fauves.svg',
  niva: '/brands/niva.svg',
  tokyon: '/brands/tokyon.svg',
};

const BRAND_COLORS: Record<string, string> = {
  asterysko: '#0412dd',
  fauves: '#2a2ad7',
  tokyon: '#000000',
  allyo: '#0d1e1d',
  niva: '#1d0c17',
  manyspace: '#fd6b32',
};

const getLogoUrl = (logo?: string) => {
  if (!logo) return undefined;
  if (/^(https?:|data:|blob:)/.test(logo)) return logo;
  return `${getBackendUrl()}${logo.startsWith('/') ? '' : '/'}${logo}`;
};

const WorkspaceLogo: React.FC<{ organization: Organization; large?: boolean }> = ({
  organization,
  large = false,
}) => {
  const slug = organization.slug?.toLowerCase();
  const uploadedLogo = getLogoUrl(organization.logo);
  const knownAsset = KNOWN_BRAND_ASSETS[slug];
  const background = organization.iconBg || BRAND_COLORS[slug] || '#2f2f35';

  if (uploadedLogo) {
    return (
      <span className={`workspace-logo workspace-logo--uploaded ${large ? 'workspace-logo--large' : ''}`} style={{ background }}>
        <img src={uploadedLogo} alt="" />
      </span>
    );
  }

  if (organization.svgIcon) {
    return (
      <span
        className={`workspace-logo workspace-logo--custom ${large ? 'workspace-logo--large' : ''}`}
        style={{ background, color: organization.iconColor || '#fff' }}
      >
        <span
          className="workspace-logo__custom-svg"
          style={{ transform: `scale(${organization.iconScale || 1})` }}
          dangerouslySetInnerHTML={{ __html: organization.svgIcon }}
        />
      </span>
    );
  }

  if (knownAsset) {
    return (
      <span className={`workspace-logo workspace-logo--asset ${large ? 'workspace-logo--large' : ''}`}>
        <img src={knownAsset} alt="" />
      </span>
    );
  }

  if (slug === 'asterysko') {
    return (
      <span className={`workspace-logo workspace-logo--asterysko ${large ? 'workspace-logo--large' : ''}`}>
        <img src="/assets/asterysko/brand-mark.svg" alt="" />
      </span>
    );
  }

  return (
    <span className={`workspace-logo workspace-logo--fallback ${large ? 'workspace-logo--large' : ''}`} style={{ background }}>
      {organization.name.trim().charAt(0).toUpperCase()}
    </span>
  );
};

const memberLabel = (organization: Organization) => {
  const count = organization._count?.members;
  if (typeof count !== 'number') return 'Painel disponível';
  return `${count} ${count === 1 ? 'membro' : 'membros'}`;
};

export const WorkspaceEntryPage: React.FC<WorkspaceEntryPageProps> = ({
  userName,
  organizations,
  loading,
  error,
  onEnter,
  onRetry,
  onLogout,
}) => {
  const [enteringOrganization, setEnteringOrganization] = useState<Organization | null>(null);
  const entryTimer = useRef<number | null>(null);
  const firstName = userName.trim().split(/\s+/)[0] || 'Olá';

  const startEntry = (organization: Organization) => {
    if (enteringOrganization) return;
    setEnteringOrganization(organization);
  };

  useEffect(() => {
    if (!loading && !error && organizations.length === 1 && !enteringOrganization) {
      startEntry(organizations[0]);
    }
  }, [loading, error, organizations, enteringOrganization]);

  useEffect(() => {
    if (!enteringOrganization) return;
    const timer = window.setTimeout(() => onEnter(enteringOrganization), 1450);
    entryTimer.current = timer;

    return () => {
      window.clearTimeout(timer);
      if (entryTimer.current === timer) entryTimer.current = null;
    };
  }, [enteringOrganization, onEnter]);

  const showLoading = loading && !enteringOrganization;
  const showSelection = !loading && !error && organizations.length > 1 && !enteringOrganization;

  return (
    <main className={`workspace-entry ${enteringOrganization ? 'workspace-entry--entering' : ''}`}>
      <img className="workspace-entry__wordmark" src="/brands/manyways.svg" alt="manyways" />

      <section className="workspace-entry__content" aria-live="polite">
        {enteringOrganization ? (
          <div className="workspace-entering" role="status">
            <div className="workspace-entering__logo-wrap">
              <span className="workspace-entering__halo" aria-hidden="true" />
              <WorkspaceLogo organization={enteringOrganization} large />
            </div>
            <h1>Entrando em {enteringOrganization.name}</h1>
            <p>Estamos preparando o seu painel.</p>
            <span className="workspace-entering__progress" aria-hidden="true"><i /></span>
          </div>
        ) : showLoading ? (
          <div className="workspace-entry__status" role="status">
            <LoaderCircle className="workspace-entry__spinner" size={25} strokeWidth={1.5} />
            <p>Buscando seus painéis...</p>
          </div>
        ) : error ? (
          <div className="workspace-entry__status workspace-entry__status--error">
            <h1>Não foi possível carregar seus painéis</h1>
            <p>{error}</p>
            <button type="button" onClick={onRetry}><RefreshCw size={15} /> Tentar novamente</button>
            <button type="button" className="workspace-entry__quiet-action" onClick={onLogout}>
              <ArrowLeft size={14} /> Voltar ao login
            </button>
          </div>
        ) : showSelection ? (
          <>
            <header className="workspace-entry__header">
              <h1>Olá, {firstName}</h1>
              <p>Selecione um workspace</p>
            </header>

            <div className="workspace-entry__list" role="list" aria-label="Seus workspaces">
              {organizations.map((organization, index) => (
                <button
                  key={organization.id}
                  type="button"
                  className="workspace-entry__item"
                  style={{ '--workspace-index': index } as React.CSSProperties}
                  onClick={() => startEntry(organization)}
                  role="listitem"
                  aria-label={`Entrar em ${organization.name}`}
                >
                  <span className="workspace-entry__identity">
                    <WorkspaceLogo organization={organization} />
                    <span className="workspace-entry__details">
                      <strong>{organization.name}</strong>
                      <span className="workspace-entry__members">
                        <Users size={13} strokeWidth={1.4} aria-hidden="true" />
                        {memberLabel(organization)}
                      </span>
                    </span>
                  </span>
                  <ChevronRight className="workspace-entry__arrow" size={20} strokeWidth={1.5} aria-hidden="true" />
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="workspace-entry__status">
            <h1>Nenhum painel disponível</h1>
            <p>Peça a um administrador para adicionar você a um workspace.</p>
            <button type="button" className="workspace-entry__quiet-action" onClick={onLogout}>
              <ArrowLeft size={14} /> Voltar ao login
            </button>
          </div>
        )}
      </section>
    </main>
  );
};
