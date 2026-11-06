import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Organization } from '../types';
import { getOrgFaviconSvg, setDynamicFavicon, getPageTitle, MANYWAYS_FAVICON_SVG } from '../utils/brandFavicon';

interface UseDynamicFaviconAndTitleProps {
    currentOrg?: Organization | null;
    userOrgs?: Organization[];
    isTenantDomain?: boolean;
    tenantOrg?: Pick<Organization, 'slug' | 'name'> | null;
    resolvingDomain?: boolean;
    isAuthenticated?: boolean;
}

export const useDynamicFaviconAndTitle = ({
    currentOrg,
    userOrgs = [],
    isTenantDomain = false,
    tenantOrg = null,
    resolvingDomain = false,
    isAuthenticated = false,
}: UseDynamicFaviconAndTitleProps) => {
    const location = useLocation();

    useEffect(() => {
        if (resolvingDomain) return;

        const searchParams = new URLSearchParams(location.search);
        const pathname = location.pathname;

        // Resolve active organization for favicon & title
        const orgIdFromUrl = searchParams.get('org');
        const isPortalSurface = isTenantDomain || pathname.startsWith('/portal');
        // No portal do cliente a marca vem do domínio (ou Asterysko), nunca da org padrão do ManySpace.
        const activeOrg = isPortalSurface
            ? (tenantOrg || { slug: 'asterysko', name: 'Asterysko' })
            : ((orgIdFromUrl && userOrgs.find(o => o.id === orgIdFromUrl)) || currentOrg);

        // 1. Calculate & set the title for the active workspace.
        const newTitle = getPageTitle({
            pathname,
            searchParams,
            currentOrg: activeOrg as Organization,
            isTenantDomain,
            isAuthenticated,
        });

        if (document.title !== newTitle) {
            document.title = newTitle;
        }

        // 2. Resolve & set Favicon dynamically based on active org / domain
        const isPlatformSurface = pathname.startsWith('/login') || pathname.startsWith('/auth') || pathname.startsWith('/workspaces') || pathname.startsWith('/admin');

        if (isTenantDomain || pathname.startsWith('/portal')) {
            setDynamicFavicon(getOrgFaviconSvg(activeOrg as Organization));
        } else if (isPlatformSurface || !isAuthenticated) {
            setDynamicFavicon(MANYWAYS_FAVICON_SVG);
        } else if (activeOrg) {
            setDynamicFavicon(getOrgFaviconSvg(activeOrg));
        } else {
            setDynamicFavicon(MANYWAYS_FAVICON_SVG);
        }
    }, [
        location.pathname,
        location.search,
        currentOrg?.id,
        currentOrg?.slug,
        currentOrg?.name,
        currentOrg?.svgIcon,
        currentOrg?.logo,
        currentOrg?.logoColor,
        currentOrg?.iconBg,
        userOrgs,
        isTenantDomain,
        tenantOrg?.slug,
        resolvingDomain,
        isAuthenticated,
    ]);
};
