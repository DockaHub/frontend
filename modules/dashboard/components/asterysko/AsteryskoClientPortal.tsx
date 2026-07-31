import React, { useState, useEffect } from 'react';
import { FileSignature, FileText, CheckCircle2, Download, Menu, User, Bell, Shield, ShieldCheck, ExternalLink, LogOut, HelpCircle, ChevronDown, Share2, Building2, Lock, Mail, MessageSquare, AlertCircle, Loader2, Briefcase, CreditCard, Smartphone, Copy, Upload, UploadCloud, Sun, Moon, Clock, Award, X, ChevronRight, Plus, ArrowLeft } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import api, { getBackendUrl } from '../../../../services/api';
import { useAuth } from '../../../../context/AuthContext';
import { forceDownloadFile } from './utils/fileDownload';

interface AsteryskoClientPortalProps {
    onExit: () => void;
    theme?: 'light' | 'dark';
    onToggleTheme?: () => void;
}

// Asterysko Logo SVG (Figma Group 2)
const AsteryskoLogoSVG = () => (
    <svg width="160" height="28" viewBox="0 0 200 34" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-auto block">
        <path d="M29.208 0.974374C28.9702 1.21152 28.779 1.47445 28.6239 1.758L19.6547 13.8217C19.2721 14.2032 19.2721 14.8218 19.6547 15.1982C20.0372 15.5745 20.6576 15.5797 21.035 15.1982L33.1317 6.25352C33.416 6.10402 33.6797 5.90811 33.9175 5.67096C35.2202 4.3718 35.2202 2.26838 33.9175 0.969219C32.6148 -0.329947 30.5056 -0.329947 29.2029 0.969219L29.208 0.974374Z" fill="#1A1FD3" />
        <path d="M35.2461 15.9457C34.9669 15.9457 34.6929 15.987 34.4396 16.0643L21.9758 17.8893C21.5261 17.8893 21.159 18.2553 21.159 18.7039C21.159 19.1524 21.5261 19.5184 21.9758 19.5184L34.4345 21.3847C34.6878 21.462 34.9618 21.5033 35.2409 21.5033C36.7814 21.5033 38.0325 20.2608 38.0325 18.7296C38.0325 17.1985 36.7866 15.9457 35.2513 15.9457H35.2461Z" fill="#1A1FD3" />
        <path d="M29.1356 28.7054C28.9754 28.5456 28.7996 28.4167 28.6083 28.3136L20.518 22.3127C20.2647 22.0549 19.8459 22.0549 19.5926 22.3127C19.3393 22.5704 19.3341 22.9829 19.5926 23.2355L25.5841 31.3243C25.6824 31.5151 25.8116 31.6904 25.9719 31.8502C26.8403 32.7215 28.2568 32.7215 29.1253 31.8502C29.9938 30.9789 29.9989 29.5715 29.1253 28.7054H29.1356Z" fill="#1A1FD3" />
        <path d="M17.9435 32.2936C17.9435 32.1234 17.9177 31.9533 17.8712 31.7986L16.7442 24.1428C16.7442 23.8644 16.5219 23.6428 16.2428 23.6376C15.9636 23.6325 15.7413 23.8593 15.7361 24.1377L14.5833 31.7883C14.5368 31.943 14.511 32.1131 14.511 32.2832C14.511 33.2267 15.2761 33.9948 16.2273 34C17.1733 34 17.9435 33.237 17.9487 32.2884L17.9435 32.2936Z" fill="#1A1FD3" />
        <path d="M9.27418 27.2464C9.3569 27.1639 9.42927 27.066 9.48096 26.968L12.6964 22.6581C12.8308 22.524 12.836 22.3024 12.6964 22.1632C12.5569 22.024 12.3397 22.024 12.2002 22.1632L7.86806 25.3544C7.76467 25.4059 7.67162 25.4781 7.58891 25.5606C7.12364 26.0246 7.12364 26.7773 7.58891 27.2412C8.05417 27.7052 8.80892 27.7052 9.27418 27.2412V27.2464Z" fill="#1A1FD3" />
        <path d="M2.62615 20.4361C2.79674 20.4361 2.96734 20.4103 3.12242 20.3639L10.7941 19.2297C11.0732 19.2297 11.2955 19.0029 11.2955 18.7296C11.2955 18.4564 11.068 18.2296 10.7941 18.2296L3.12242 17.0954C2.96734 17.049 2.79674 17.0232 2.62615 17.0232C1.68012 17.0232 0.909851 17.7914 0.909851 18.7348C0.909851 19.6782 1.68012 20.4464 2.62615 20.4464V20.4361Z" fill="#1A1FD3" />
        <path d="M0.811577 7.2743C1.00802 7.47536 1.23031 7.63518 1.46811 7.75891L11.5746 15.26C11.8951 15.5797 12.4121 15.5797 12.7326 15.26C13.0531 14.4249 13.0531 14.4249 12.7326 14.1052L5.24706 4.00061C5.12299 3.76346 4.95757 3.54177 4.76112 3.34587C3.67551 2.25807 1.90752 2.25807 0.816747 3.34071C-0.274031 4.42335 -0.274031 6.1865 0.811577 7.2743Z" fill="#1A1FD3" />
        <path d="M14.5109 5.16058C14.5109 5.33071 14.5368 5.50083 14.5833 5.6555L15.7206 13.3061C15.7206 13.5845 15.9481 13.8062 16.2221 13.8062C16.4961 13.8062 16.7235 13.5794 16.7235 13.3061L17.8608 5.6555C17.9074 5.50083 17.9332 5.33071 17.9332 5.16058C17.9332 4.21713 17.1629 3.44898 16.2169 3.44898C15.2709 3.44898 14.5006 4.21713 14.5006 5.16058H14.5109Z" fill="#1A1FD3" />
        <path d="M65.8757 25.3389C65.8757 25.3389 65.0538 25.5554 64.1594 25.5554C62.4069 25.5554 61.1197 24.7357 61.1197 22.7766V22.7406H61.0473C60.5821 23.5964 59.1191 25.5915 55.1851 25.5915C51.4681 25.5915 49.4675 23.6685 49.4675 20.9207C49.4675 17.25 52.9725 15.7859 60.4063 15.7859H60.9078V14.7187C60.9078 12.4349 59.512 10.9759 56.7256 10.9759C54.3321 10.9759 52.8639 11.94 52.8639 13.6876C52.8639 14.0795 53.0449 14.5434L50.0775 15.0435C50.0775 15.0435 49.8604 14.4042 49.8604 13.5794C49.8604 10.5119 52.5072 8.33632 56.798 8.33632C61.373 8.33632 64.056 10.7955 64.056 14.6826V21.4929C64.056 22.4209 64.3042 22.7766 65.0951 22.7766C65.3122 22.7766 65.5604 22.7406 65.7051 22.7045L65.8861 25.344L65.8757 25.3389ZM60.9078 19.5648V17.9615H60.4063C54.6526 17.9615 52.683 18.9977 52.683 20.8485C52.683 22.1683 53.6859 22.9519 55.8313 22.9519C59.1191 22.9519 60.9078 21.1321 60.9078 19.5648Z" fill="#1A1FD3" />
        <path d="M79.1356 13.7495C79.1356 12.0018 77.6003 10.9707 75.3825 10.9707C73.1648 10.9707 72.0585 11.9348 72.0585 13.3216C72.0585 17.281 82.2115 14.4249 82.3201 20.8073C82.3563 23.8387 79.4613 25.5864 75.3463 25.5864C71.2314 25.5864 69.0188 23.8387 68.0521 23.055L69.9803 20.9155C70.6937 21.5909 72.8029 22.9468 75.3774 22.9468C77.9518 22.9468 79.0943 22.0549 79.0943 20.7712C79.0943 17.3119 68.8327 19.5236 68.8327 13.2855C68.8327 10.5067 71.4795 8.33116 75.4446 8.33116C79.4096 8.33116 82.0564 10.3985 82.0564 13.1773C82.0564 13.8526 81.9117 14.3527 81.9117 14.3527L79.0167 14.5692C79.0891 14.3218 79.1253 13.997 79.1253 13.7495H79.1356Z" fill="#1A1FD3" />
        <path d="M97.7616 24.4831C97.7616 24.4831 96.0815 25.5864 93.3261 25.5864C88.963 25.5864 87.2105 23.2664 87.2105 18.9565V11.079H84.5275V8.54769H87.2105V3.55724L90.3898 3.3768V8.54769H96.9344V11.079H90.3898V18.8534C90.3898 21.5651 91.3565 22.9158 93.6414 22.9158C95.6059 22.9158 96.7535 21.9518 96.7535 21.9518L97.7564 24.4831H97.7616Z" fill="#1A1FD3" />
        <path d="M102.554 17.8171C102.874 20.9207 104.983 22.9519 108.344 22.9519C110.918 22.9519 112.381 21.7404 113.136 20.7403L115.064 22.4879C113.493 24.5553 110.991 25.5915 108.096 25.5915C102.699 25.5915 99.3021 22.1322 99.3021 16.9974C99.3021 11.8626 102.554 8.33632 107.666 8.33632C112.779 8.33632 115.354 11.7956 115.354 16.2138C115.354 17.214 115.209 17.8171 115.209 17.8171H102.554ZM102.626 15.5694H112.133C112.097 12.7906 110.344 10.9707 107.666 10.9707C104.989 10.9707 103.091 12.8628 102.626 15.5694Z" fill="#1A1FD3" />
        <path d="M128.825 8.61986L128.04 11.7904C127.683 11.5739 127.182 11.3986 126.468 11.3986C124.571 11.3986 122.431 13.0741 122.431 16.5695V25.375H119.288V8.54769L121.505 8.43942C121.79 9.72312 121.934 11.61 121.934 12.3627H122.079C122.725 10.151 124.152 8.33632 126.654 8.33632C127.404 8.33632 128.19 8.44458 128.836 8.61986H128.825Z" fill="#1A1FD3" />
        <path d="M133.437 32.8246C131.829 32.8246 130.826 32.2884 130.826 32.2884L131.4 29.6849C131.4 29.6849 132.186 30.1128 133.225 30.1128C134.977 30.1128 135.727 28.9735 136.301 27.4732L136.947 25.7977L129.797 8.54253H133.339L137.986 20.3072C138.343 21.163 138.415 21.4466 138.56 22.1632H138.596C138.741 21.3795 138.88 21.0599 139.17 20.3072L143.89 8.54253H147.105L139.097 28.3651C138.131 30.8604 136.559 32.8194 133.447 32.8194L133.437 32.8246Z" fill="#1A1FD3" />
        <path d="M159.248 13.7495C159.248 12.0018 157.713 10.9707 155.495 10.9707C153.278 10.9707 152.171 11.9348 152.171 13.3216C152.171 17.281 162.324 14.4249 162.433 20.8073C162.469 23.8387 159.574 25.5864 155.459 25.5864C151.344 25.5864 149.132 23.8387 148.165 23.055L150.093 20.9155C150.806 21.5909 152.916 22.9468 155.49 22.9468C158.065 22.9468 159.207 22.0549 159.207 20.7712C159.207 17.3119 148.945 19.5236 148.945 13.2855C148.945 10.5067 151.592 8.33116 155.557 8.33116C159.522 8.33116 162.169 10.3985 162.169 13.1773C162.169 13.8526 162.024 14.3527 162.024 14.3527L159.129 14.5692C159.202 14.3218 159.238 13.997 159.238 13.7495H159.248Z" fill="#1A1FD3" />
        <path d="M171.438 17.6367H169.613V25.375H166.47V0.206217H169.613V15.1105H171.94L177.73 8.55284H181.338L174.188 16.4303L182.051 25.3801H178.081L171.433 17.6418L171.438 17.6367Z" fill="#1A1FD3" />
        <path d="M200 17.0335C200 22.1322 196.531 25.5915 191.315 25.5915C186.099 25.5915 182.63 22.1322 182.63 17.0335C182.63 11.9348 186.099 8.33632 191.315 8.33632C196.531 8.33632 200 11.9348 200 17.0335ZM196.785 17.0335C196.785 13.5381 194.603 10.9707 191.315 10.9707C188.027 10.9707 185.846 13.5381 185.846 17.0335C185.846 20.5289 188.027 22.9519 191.315 22.9519C194.603 22.9519 196.785 20.5289 196.785 17.0335Z" fill="#1A1FD3" />
    </svg>
);

// Asterysko Bottom Gray Starburst Icon (Figma Group 26 / 101:659)
const AsteryskoBottomIconSVG = () => (
    <svg width="256" height="229" viewBox="0 0 256 229" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-48 h-auto max-w-full">
        <path d="M196.605 6.59295C195.004 8.18912 193.717 9.95883 192.673 11.8673L132.304 93.0649C129.729 95.6327 129.729 99.7963 132.304 102.33C134.878 104.863 139.054 104.898 141.594 102.33L223.014 42.1255C224.928 41.1192 226.702 39.8006 228.303 38.2044C237.071 29.4601 237.071 15.3026 228.303 6.55826C219.535 -2.18608 205.338 -2.18608 196.57 6.55826L196.605 6.59295Z" fill="#D4D4D4"/>
        <path d="M237.245 107.361C235.366 107.361 233.522 107.639 231.817 108.16L147.927 120.443C144.9 120.443 142.429 122.907 142.429 125.926C142.429 128.945 144.9 131.408 147.927 131.408L231.783 143.97C233.488 144.49 235.332 144.768 237.21 144.768C247.579 144.768 256 136.405 256 126.099C256 115.794 247.614 107.361 237.28 107.361H237.245Z" fill="#D4D4D4"/>
        <path d="M196.117 193.243C195.039 192.168 193.856 191.3 192.568 190.606L138.115 150.216C136.41 148.481 133.591 148.481 131.886 150.216C130.181 151.95 130.146 154.727 131.886 156.427L172.213 210.87C172.875 212.155 173.744 213.335 174.823 214.41C180.668 220.275 190.202 220.275 196.048 214.41C201.894 208.546 201.928 199.073 196.048 193.243H196.117Z" fill="#D4D4D4"/>
        <path d="M120.786 217.394C120.786 216.249 120.613 215.104 120.3 214.062L112.714 162.533C112.714 160.659 111.218 159.168 109.339 159.133C107.46 159.099 105.964 160.625 105.929 162.499L98.1697 213.993C97.8567 215.034 97.683 216.179 97.683 217.324C97.683 223.675 102.833 228.844 109.235 228.879C115.602 228.879 120.786 223.744 120.821 217.359L120.786 217.394Z" fill="#D4D4D4"/>
        <path d="M62.4354 183.423C62.9922 182.868 63.4793 182.209 63.8272 181.549L85.4695 152.54C86.3741 151.638 86.4091 150.146 85.4695 149.209C84.5305 148.272 83.0686 148.272 82.1297 149.209L52.9712 170.688C52.2753 171.035 51.649 171.521 51.0923 172.076C47.9607 175.199 47.9607 180.266 51.0923 183.388C54.2238 186.511 59.3039 186.511 62.4354 183.388V183.423Z" fill="#D4D4D4"/>
        <path d="M17.6893 137.585C18.8375 137.585 19.9857 137.411 21.0295 137.099L72.6656 129.465C74.5441 129.465 76.0404 127.938 76.0404 126.099C76.0404 124.26 74.5091 122.733 72.6656 122.733L21.0295 115.099C19.9857 114.787 18.8375 114.613 17.6893 114.613C11.3218 114.613 6.13733 119.784 6.13733 126.134C6.13733 132.483 11.3218 137.654 17.6893 137.654V137.585Z" fill="#D4D4D4"/>
        <path d="M5.47586 48.9957C6.79807 50.349 8.29424 51.4247 9.89481 52.2575L77.9189 102.745C80.0761 104.897 83.5559 104.897 85.7131 102.745C87.8703 100.594 87.8703 97.1245 85.7131 94.9726L35.3299 26.9613C34.4948 25.3651 33.3814 23.873 32.0592 22.5545C24.7522 15.2328 12.8524 15.2328 5.51066 22.5197C-1.83108 29.8067 -1.83108 41.674 5.47586 48.9957Z" fill="#D4D4D4"/>
        <path d="M97.6824 34.7689C97.6824 35.914 97.8567 37.059 98.1697 38.1L105.825 89.5942C105.825 91.468 107.356 92.9602 109.2 92.9602C111.044 92.9602 112.575 91.4337 112.575 89.5942L120.23 38.1C120.543 37.059 120.717 35.914 120.717 34.7689C120.717 28.4187 115.532 23.2485 109.165 23.2485C102.798 23.2485 97.613 28.4187 97.613 34.7689H97.6824Z" fill="#D4D4D4"/>
    </svg>
);

export const AsteryskoClientPortal: React.FC<AsteryskoClientPortalProps> = ({ onExit }) => {
    const { user, logout } = useAuth();
    
    // View state strictly mapped to Figma APP frames:
    // 'home' -> Frame 41:222
    // 'details' -> Frame 59:980
    // 'profile' -> Frame 53:672
    // 'contracts' -> Frame 58:863
    const [currentView, setCurrentView] = useState<'home' | 'details' | 'profile' | 'contracts'>('home');
    const [processSubTab, setProcessSubTab] = useState<'details' | 'payments' | 'documents'>('details');

    const [clientData, setClientData] = useState<any>(null);
    const [processes, setProcesses] = useState<any[]>([]);
    const [financials, setFinancials] = useState<any>({ invoices: [], contracts: [] });
    const [selectedProcess, setSelectedProcess] = useState<any>(null);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const urlToken = new URLSearchParams(window.location.search).get('token');
        if (urlToken) {
            localStorage.setItem('token', urlToken);
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const [dashboardRes, financialsRes] = await Promise.all([
                    api.get('/asterysko/portal/dashboard'),
                    api.get('/asterysko/portal/financials')
                ]);

                const { client } = dashboardRes.data || {};
                const { invoices, contracts } = financialsRes.data || {};

                if (client) setClientData(client);
                setFinancials({ 
                    invoices: Array.isArray(invoices) ? invoices : [], 
                    contracts: Array.isArray(contracts) ? contracts : [] 
                });

                const allProcessesMap = new Map();
                client?.brands?.forEach((brand: any) => {
                    brand.processes?.forEach((proc: any) => {
                        if (!allProcessesMap.has(proc.id)) {
                            allProcessesMap.set(proc.id, {
                                ...proc,
                                brandName: brand.name,
                                brandLogo: brand.logoUrl
                            });
                        }
                    });
                });

                const allProc = Array.from(allProcessesMap.values());
                setProcesses(allProc);
                if (allProc.length > 0) setSelectedProcess(allProc[0]);
                setLoading(false);
            } catch (err: any) {
                console.error('Error loading portal data:', err);
                if (err.response?.status === 401) {
                    logout();
                    window.location.replace('/portal/login');
                    return;
                }
                setError('Não foi possível carregar os dados do portal.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-[#F3F3F3] flex flex-col items-center justify-center z-[100]">
                <Loader2 className="w-10 h-10 text-[#1A1FD3] animate-spin mb-4" />
                <p className="text-slate-600 font-medium text-sm">Carregando seu portal...</p>
            </div>
        );
    }

    const currentBrandName = selectedProcess?.brandName || 'Litorânea Tendas';

    return (
        <div className="fixed inset-0 bg-[#F3F3F3] text-slate-900 flex flex-col font-sans z-[100] overflow-hidden">
            
            {/* SCROLLABLE AREA */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative custom-scrollbar">

                {/* 1. TOP HEADER BAR */}
                <div className="bg-[#F3F3F3] pt-6 px-6 pb-2 max-w-lg mx-auto w-full flex justify-between items-center z-20 relative">
                    {currentView === 'home' ? (
                        <div className="cursor-pointer" onClick={() => setCurrentView('home')}>
                            <AsteryskoLogoSVG />
                        </div>
                    ) : (
                        <button
                            onClick={() => setCurrentView('home')}
                            className="p-2 rounded-full hover:bg-black/5 text-slate-800 transition-colors cursor-pointer"
                        >
                            <ArrowLeft size={22} />
                        </button>
                    )}

                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="p-2 rounded-full hover:bg-black/5 text-slate-900 transition-colors cursor-pointer"
                        title="Abrir Menu"
                    >
                        <Menu size={24} />
                    </button>
                </div>

                {/* 2. MAIN CONTAINER */}
                <div className="max-w-lg mx-auto px-6 pt-4 pb-16">
                    {/* ======================================================== */}
                    {/* FRAME 41:222 - HOME VIEW                                */}
                    {/* ======================================================== */}
                    {currentView === 'home' && (
                        <div className="space-y-6 animate-in fade-in duration-300 relative pb-12">
                            {/* Greeting Header (Figma Group 3 / 53:659) */}
                            <div>
                                <h1 className="font-season text-[26px] font-medium text-slate-900 leading-tight">
                                    Olá, {clientData?.name ? clientData.name.split(' ')[0] : 'Levy'}
                                </h1>
                                <p className="font-sans text-[14px] text-slate-600 mt-0.5">
                                    Acompanhe seus processos
                                </p>
                            </div>

                            {/* 1. PROCESS CARDS GRID - OPTIMAL MOBILE UX WITHOUT HORIZONTAL SCROLL */}
                            <div className="grid grid-cols-2 gap-3 w-full">
                                {processes.length > 0 ? (
                                    processes.map((proc, idx) => (
                                        <div
                                            key={proc.id || idx}
                                            onClick={() => {
                                                setSelectedProcess(proc);
                                                setCurrentView('details');
                                            }}
                                            className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:border-[#1A1FD3] transition-all cursor-pointer flex flex-col justify-between overflow-hidden h-48 relative"
                                        >
                                            {/* Top Pill Header (Figma Frame 1410119740) */}
                                            <div className={`w-full py-2 px-2 text-center text-white text-[9px] font-medium tracking-tight truncate ${idx % 2 === 0 ? 'bg-[#1A1FD3]' : 'bg-[#797979]'}`}>
                                                {proc.status === 'EXAM_MERIT' || idx % 2 === 0 ? 'Aguardando exame de mérito' : 'Processo iniciado'}
                                            </div>

                                            {/* Card Body (Figma Frame 1410119739) */}
                                            <div className="p-3.5 flex flex-col justify-between flex-1">
                                                <div className="w-9 h-9 rounded-xl bg-[#D9D9D9] flex items-center justify-center font-bold text-slate-600 text-xs">
                                                    {proc.brandName ? proc.brandName[0] : 'L'}
                                                </div>
                                                <h3 className="font-season text-[16px] font-medium text-slate-900 leading-tight">
                                                    {proc.brandName || 'Litorânea Tendas'}
                                                </h3>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    /* Figma Frame 2 & Frame 5 Default Preview Cards */
                                    <>
                                        {/* Card 1 (Frame 2 - 41:241) */}
                                        <div
                                            onClick={() => setCurrentView('details')}
                                            className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:border-[#1A1FD3] transition-all cursor-pointer flex flex-col justify-between overflow-hidden h-48 relative"
                                        >
                                            <div className="w-full py-2 px-2 text-center text-white text-[9px] font-medium tracking-tight bg-[#1A1FD3] truncate">
                                                Aguardando exame de mérito
                                            </div>
                                            <div className="p-3.5 flex flex-col justify-between flex-1">
                                                <div className="w-9 h-9 rounded-xl bg-[#D9D9D9] flex items-center justify-center font-bold text-slate-600 text-xs">LT</div>
                                                <h3 className="font-season text-[16px] font-medium text-slate-900 leading-tight">Litorânea Tendas</h3>
                                            </div>
                                        </div>

                                        {/* Card 2 (Frame 5 - 41:316) */}
                                        <div
                                            onClick={() => setCurrentView('details')}
                                            className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:border-[#797979] transition-all cursor-pointer flex flex-col justify-between overflow-hidden h-48 relative"
                                        >
                                            <div className="w-full py-2 px-2 text-center text-white text-[9px] font-medium tracking-tight bg-[#797979] truncate">
                                                Processo iniciado
                                            </div>
                                            <div className="p-3.5 flex flex-col justify-between flex-1">
                                                <div className="w-9 h-9 rounded-xl bg-[#D9D9D9] flex items-center justify-center font-bold text-slate-600 text-xs">LT</div>
                                                <h3 className="font-season text-[16px] font-medium text-slate-900 leading-tight">Litorânea Tendas</h3>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Card 3: Registrar uma nova marca (Frame 4 - 41:262) */}
                                <a
                                    href="https://asterysko.com/nova-marca"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:border-[#1A1FD3] transition-all cursor-pointer flex items-center justify-between p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1A1FD3] flex items-center justify-center shrink-0">
                                            <Plus size={20} />
                                        </div>
                                        <span className="font-sans text-[13px] font-semibold text-slate-900 leading-tight">
                                            Registrar uma nova marca
                                        </span>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-400" />
                                </a>
                            </div>

                            {/* 2. BANNER CARD (Frame 13 / 53:660) */}
                            <div className="w-full bg-[#1A1FD3] rounded-2xl p-5 text-white flex items-start gap-4 shadow-md relative overflow-hidden">
                                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 text-white font-bold text-xl">
                                    ®
                                </div>
                                <div>
                                    <h3 className="font-sans text-[15px] font-normal text-white leading-snug">
                                        Proteção não termina no registro
                                    </h3>
                                    <p className="font-sans text-[12px] text-[#588DFF] mt-1 leading-relaxed">
                                        Monitore, renove e expanda sua marca.
                                    </p>
                                </div>
                            </div>

                            {/* 3. SECTION "MAIS BENEFÍCIOS" (Figma 41:322 & Frames 6, 7, 8) */}
                            <div className="space-y-3 pt-2">
                                <h3 className="font-sans text-[14px] font-normal text-slate-900">Mais benefícios</h3>
                                
                                <div className="grid grid-cols-2 gap-3 w-full">
                                    {/* Benefit Card 1 (Frame 6 - 41:323) */}
                                    <div className="bg-[#0D1E1D] rounded-2xl p-4 text-white flex flex-col justify-between h-32 relative overflow-hidden border border-teal-900/50 shadow-xs">
                                        <div className="flex justify-between items-start">
                                            <span className="px-2 py-0.5 bg-white text-[#0D1E1D] text-[7px] font-bold rounded-full uppercase tracking-wider">
                                                Teste grátis
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-season text-[16px] text-white leading-tight">Allyo</h4>
                                            <p className="font-sans text-[9px] text-teal-100/70 mt-0.5 leading-tight">
                                                Time criativo do seu time criativo
                                            </p>
                                        </div>
                                    </div>

                                    {/* Benefit Card 2 (Frame 7 - 41:358) */}
                                    <div className="bg-[#0D1E1D] rounded-2xl p-4 text-white flex flex-col justify-between h-32 relative overflow-hidden border border-teal-900/50 shadow-xs">
                                        <div className="flex justify-between items-start">
                                            <span className="px-2 py-0.5 bg-white text-[#0D1E1D] text-[7px] font-bold rounded-full uppercase tracking-wider">
                                                Exclusivo
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-season text-[16px] text-white leading-tight">Scout AI</h4>
                                            <p className="font-sans text-[9px] text-teal-100/70 mt-0.5 leading-tight">
                                                Vigilância ativa contra imitações
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 4. BOTTOM FOOTER ASTERYKSKO GRAY STARBURST VECTOR (Figma Group 26 / 101:659) */}
                            <div className="pt-10 flex flex-col items-center justify-center relative">
                                <AsteryskoBottomIconSVG />
                                <p className="text-[10px] text-slate-400 font-medium mt-3">Asterysko Propriedade Intelectual © 2026</p>
                            </div>
                        </div>
                    )}

                    {/* ======================================================== */}
                    {/* FRAMES 59:980, 59:1204, 59:1288 - PROCESSO DETALHES     */}
                    {/* ======================================================== */}
                    {currentView === 'details' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* Process Header Badge & Name */}
                            <div className="space-y-2">
                                <div>
                                    <span className="px-3 py-1 rounded-full text-[11px] font-bold text-white bg-[#1D8800]">
                                        Ativo
                                    </span>
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900">{currentBrandName}</h1>
                            </div>

                            {/* 3 Sub-tabs Pill Navigation (Figma 59:980, 59:1204, 59:1288) */}
                            <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-200/80">
                                <button
                                    onClick={() => setProcessSubTab('details')}
                                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${processSubTab === 'details' ? 'bg-[#F3F3F3] text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                                >
                                    Detalhes
                                </button>
                                <button
                                    onClick={() => setProcessSubTab('payments')}
                                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${processSubTab === 'payments' ? 'bg-[#F3F3F3] text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                                >
                                    Pagamentos
                                </button>
                                <button
                                    onClick={() => setProcessSubTab('documents')}
                                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${processSubTab === 'documents' ? 'bg-[#F3F3F3] text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                                >
                                    Documentos
                                </button>
                            </div>

                            {/* SUB-TAB 1: DETALHES & TIMELINE (Figma 59:980) */}
                            {processSubTab === 'details' && (
                                <div className="space-y-6">
                                    {/* Informações Gerais Card */}
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-3">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Informações gerais</h3>
                                        <div className="grid grid-cols-2 gap-4 pt-1">
                                            <div>
                                                <span className="block text-[11px] text-slate-400">Apresentação</span>
                                                <span className="text-sm font-bold text-slate-900">Mista</span>
                                            </div>
                                            <div>
                                                <span className="block text-[11px] text-slate-400">Classificação NCL</span>
                                                <span className="text-sm font-bold text-slate-900">Classe 35</span>
                                            </div>
                                            <div>
                                                <span className="block text-[11px] text-slate-400">Data de protocolo</span>
                                                <span className="text-sm font-bold text-slate-900">Classe 35</span>
                                            </div>
                                            <div>
                                                <span className="block text-[11px] text-slate-400">Protocolo INPI</span>
                                                <span className="text-sm font-bold text-slate-900">928374655</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline Steps Box */}
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Andamento</h3>
                                        
                                        <div className="space-y-4 relative pl-2">
                                            {[
                                                { title: 'Aguardando exame de mérito', date: '14 jun 2026', desc: 'Aguardando análise pelo INPI', active: true },
                                                { title: 'Protocolo realizado', date: '15 jun 2026', desc: 'Pedido depositado com sucesso', active: true },
                                                { title: 'Procuração assinada', date: '17 jun 2026', desc: 'Documento homologado', active: true },
                                                { title: 'Pagamento confirmado', date: '18 jun 2026', desc: 'Guia GRU quitada', active: true },
                                                { title: 'Contrato assinado', date: '19 jun 2026', desc: 'Termos aceitos', active: true }
                                            ].map((step, idx) => (
                                                <div key={idx} className="flex gap-4 items-start">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold ${step.active ? 'bg-[#1D8800]' : 'bg-slate-300'}`}>
                                                        ✓
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                                                            <span className="text-[10px] text-slate-400">{step.date}</span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SUB-TAB 2: PAGAMENTOS (Figma 59:1204) */}
                            {processSubTab === 'payments' && (
                                <div className="space-y-6">
                                    {/* Card Cartão de Crédito */}
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-400 uppercase">Cartão de crédito</span>
                                        </div>
                                        <p className="text-base font-bold font-mono text-slate-900">•••• •••• •••• 1234</p>
                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            Sua próxima cobrança será no valor de R$ 179,00.<br />
                                            Sua fatura vence no dia 1 de todo mês.
                                        </p>
                                        <button className="text-xs font-bold text-[#1A1FD3] hover:underline cursor-pointer pt-1 block">
                                            Alterar data de vencimento &gt;
                                        </button>
                                    </div>

                                    {/* Histórico de pagamento */}
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Histórico de pagamento</h3>
                                        
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                                <div>
                                                    <span className="px-2 py-0.5 bg-[#1D8800] text-white text-[10px] font-bold rounded-full">Paga</span>
                                                    <p className="text-sm font-bold text-slate-900 mt-1">R$ 179,00</p>
                                                    <p className="text-[10px] text-slate-400">Cartão • 09/07/2026</p>
                                                </div>
                                                <ChevronRight size={16} className="text-slate-400" />
                                            </div>

                                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                                <div>
                                                    <span className="px-2 py-0.5 bg-[#1D8800] text-white text-[10px] font-bold rounded-full">Paga</span>
                                                    <p className="text-sm font-bold text-slate-900 mt-1">R$ 179,00</p>
                                                    <p className="text-[10px] text-slate-400">Cartão • 09/06/2026</p>
                                                </div>
                                                <ChevronRight size={16} className="text-slate-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SUB-TAB 3: DOCUMENTOS (Figma 59:1288) */}
                            {processSubTab === 'documents' && (
                                <div className="space-y-3">
                                    {[
                                        'Proposta',
                                        'Contrato',
                                        'Procuração',
                                        'Protocolo INPI',
                                        'Guia e comprovante GRU',
                                        'Logomarca'
                                    ].map((docName, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => alert(`Baixando ${docName}...`)}
                                            className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#1A1FD3] transition-all flex items-center justify-between cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900">{docName}</h4>
                                                    <p className="text-[11px] text-slate-400">Clique para baixar</p>
                                                </div>
                                            </div>
                                            <Download size={18} className="text-slate-400" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ======================================================== */}
                    {/* FRAME 53:672 - MEUS DADOS                               */}
                    {/* ======================================================== */}
                    {currentView === 'profile' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Meus dados</h1>
                                <p className="text-xs text-slate-500 mt-1">Gerencie as informações cadastrais e de segurança da sua conta.</p>
                            </div>

                            {/* Dados da Empresa */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dados da empresa</h3>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                                        <div>
                                            <span className="block text-[11px] text-slate-400">Razão social</span>
                                            <span className="text-sm font-bold text-slate-900">Litorânea LTDA</span>
                                        </div>
                                        <button className="text-xs font-bold text-[#1A1FD3]">Editar</button>
                                    </div>

                                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                                        <div>
                                            <span className="block text-[11px] text-slate-400">CNPJ</span>
                                            <span className="text-sm font-bold text-slate-900">00.288.650/0001-00</span>
                                        </div>
                                        <button className="text-xs font-bold text-[#1A1FD3]">Editar</button>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="block text-[11px] text-slate-400">Endereço</span>
                                            <span className="text-sm font-bold text-slate-900">Rua 1, número 2, estado 3, 4</span>
                                        </div>
                                        <button className="text-xs font-bold text-[#1A1FD3]">Editar</button>
                                    </div>
                                </div>
                            </div>

                            {/* Dados Pessoais */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dados pessoais</h3>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                                        <div>
                                            <span className="block text-[11px] text-slate-400">Nome completo</span>
                                            <span className="text-sm font-bold text-slate-900">Levy Câmara Sestari</span>
                                        </div>
                                        <button className="text-xs font-bold text-[#1A1FD3]">Editar</button>
                                    </div>

                                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                                        <div>
                                            <span className="block text-[11px] text-slate-400">CPF</span>
                                            <span className="text-sm font-bold text-slate-900">000.288.650-00</span>
                                        </div>
                                        <button className="text-xs font-bold text-[#1A1FD3]">Editar</button>
                                    </div>

                                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                                        <div>
                                            <span className="block text-[11px] text-slate-400">Email</span>
                                            <span className="text-sm font-bold text-slate-900">email@email.com</span>
                                        </div>
                                        <button className="text-xs font-bold text-[#1A1FD3]">Editar</button>
                                    </div>

                                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                                        <div>
                                            <span className="block text-[11px] text-slate-400">Whatsapp</span>
                                            <span className="text-sm font-bold text-slate-900">(00) 00000-0000</span>
                                        </div>
                                        <button className="text-xs font-bold text-[#1A1FD3]">Editar</button>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="block text-[11px] text-slate-400">Endereço residencial</span>
                                            <span className="text-sm font-bold text-slate-900">ondeganha.com</span>
                                        </div>
                                        <button className="text-xs font-bold text-[#1A1FD3]">Editar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ======================================================== */}
                    {/* FRAME 58:863 - MEUS CONTRATOS                           */}
                    {/* ======================================================== */}
                    {currentView === 'contracts' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Contratos</h1>
                                <p className="text-xs text-slate-500 mt-1">Acesse e baixe todos os contratos de prestação de serviços e termos legais.</p>
                            </div>

                            <div className="space-y-3">
                                {/* Card 1: Assinado */}
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex justify-between items-center">
                                    <div className="space-y-2">
                                        <span className="px-3 py-1 bg-[#D5F7CB] text-[#1D8800] text-[11px] font-bold rounded-full inline-block">
                                            ✓ Assinado
                                        </span>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900">Contrato - Registro de Marca</h4>
                                            <p className="text-[11px] text-slate-400">14 jun 2026</p>
                                        </div>
                                    </div>
                                    <button onClick={() => alert('Baixando contrato...')} className="p-2.5 rounded-full hover:bg-slate-100 text-slate-600">
                                        <Download size={20} />
                                    </button>
                                </div>

                                {/* Card 2: Aguardando Assinatura */}
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex justify-between items-center">
                                    <div className="space-y-2">
                                        <span className="px-3 py-1 bg-[#F7F1CB] text-[#856404] text-[11px] font-bold rounded-full inline-block">
                                            Aguardando assinatura
                                        </span>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900">Contrato - Registro de Marca</h4>
                                            <p className="text-[11px] text-slate-400">14 jun 2026</p>
                                        </div>
                                    </div>
                                    <button onClick={() => alert('Baixando contrato...')} className="p-2.5 rounded-full hover:bg-slate-100 text-slate-600">
                                        <Download size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ======================================================== */}
            {/* FRAME 59:1496 - MENU DRAWER                             */}
            {/* ======================================================== */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[150] flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
                    <div 
                        className="w-full max-w-xs bg-[#F3F3F3] h-full p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300 shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="space-y-6">
                            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#1A1FD3] text-white flex items-center justify-center font-bold text-sm">
                                        S
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Sua conta</p>
                                        <p className="text-[11px] text-slate-500">Mantenha seus dados atualizados.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => { setCurrentView('profile'); setIsMenuOpen(false); }}
                                    className="w-full bg-white p-4 rounded-2xl border border-slate-200 text-left flex items-center justify-between cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <User size={18} className="text-[#1A1FD3]" />
                                        <span className="text-xs font-bold text-slate-900">Meus dados</span>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-400" />
                                </button>

                                <button
                                    onClick={() => { setCurrentView('contracts'); setIsMenuOpen(false); }}
                                    className="w-full bg-white p-4 rounded-2xl border border-slate-200 text-left flex items-center justify-between cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <Shield size={18} className="text-[#1A1FD3]" />
                                        <span className="text-xs font-bold text-slate-900">Meus contratos</span>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-400" />
                                </button>

                                <button
                                    onClick={() => { alert('Link copiado!'); setIsMenuOpen(false); }}
                                    className="w-full bg-white p-4 rounded-2xl border border-slate-200 text-left flex items-center justify-between cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <Share2 size={18} className="text-[#1A1FD3]" />
                                        <span className="text-xs font-bold text-slate-900">Indique a Asterysko</span>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-400" />
                                </button>

                                <div className="grid grid-cols-3 gap-2 pt-2">
                                    <button onClick={() => setIsMenuOpen(false)} className="bg-white p-3 rounded-xl border border-slate-200 text-center flex flex-col items-center gap-1.5">
                                        <HelpCircle size={16} className="text-slate-600" />
                                        <span className="text-[9px] font-bold text-slate-900 leading-tight">Central de atendimento</span>
                                    </button>
                                    <button onClick={() => setIsMenuOpen(false)} className="bg-white p-3 rounded-xl border border-slate-200 text-center flex flex-col items-center gap-1.5">
                                        <Shield size={16} className="text-slate-600" />
                                        <span className="text-[9px] font-bold text-slate-900 leading-tight">Central de clientes</span>
                                    </button>
                                    <button onClick={() => setIsMenuOpen(false)} className="bg-white p-3 rounded-xl border border-slate-200 text-center flex flex-col items-center gap-1.5">
                                        <Lock size={16} className="text-slate-600" />
                                        <span className="text-[9px] font-bold text-slate-900 leading-tight">Portal de transparência</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-200">
                            <button
                                onClick={() => {
                                    logout();
                                    window.location.replace('/portal/login');
                                }}
                                className="w-full py-3 bg-white border border-slate-200 rounded-2xl text-red-600 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <LogOut size={16} /> Sair
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AsteryskoClientPortal;
