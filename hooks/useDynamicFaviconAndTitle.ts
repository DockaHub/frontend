import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Organization } from '../types';
import { getOrgFaviconSvg, setDynamicFavicon, getPageTitle, MANYWAYS_FAVICON_SVG } from '../utils/brandFavicon';

interface UseDynamicFaviconAndTitleProps {
    currentOrg?: Organization | null;
    userOrgs?: Organization[];
    isTenantDomain?: boolean;
    resolvingDomain?: boolean;
    isAuthenticated?: boolean;
}

export const useDynamicFaviconAndTitle = ({
    currentOrg,
    userOrgs = [],
    isTenantDomain = false,
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
        const activeOrg = (orgIdFromUrl && userOrgs.find(o => o.id === orgIdFromUrl)) || currentOrg;

        // 1. Calculate & set Title: "ManySpace - <Empresa> - <Página>"
        const newTitle = getPageTitle({
            pathname,
            searchParams,
            currentOrg: activeOrg,
            isTenantDomain,
            isAuthenticated,
        });

        if (document.title !== newTitle) {
            document.title = newTitle;
        }

        // 2. Resolve & set Favicon dynamically based on active org / domain
        if (isTenantDomain || pathname.startsWith('/portal')) {
            const tenantOrg = activeOrg || { slug: 'asterysko', name: 'Asterysko' };
            setDynamicFavicon(getOrgFaviconSvg(tenantOrg));
        } else if (!isAuthenticated && (pathname === '/login' || pathname.startsWith('/auth'))) {
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
        resolvingDomain,
        isAuthenticated,
    ]);
};
