import React from 'react';
import { Shield } from 'lucide-react';
import DashboardPage from '../../../../components/DashboardPage';
import AsteryskoSystemLogsPanel from '../asterysko/AsteryskoSystemLogsPanel';

const DockaAuditView: React.FC = () => (
    <DashboardPage title="Auditoria & Monitoramento" icon={Shield}>
        <div className="animate-in fade-in duration-500">
            <p className="mb-8 -mt-2 text-sm text-docka-500 dark:text-zinc-400">
                Saúde operacional e registros reais do ecossistema, disponíveis somente para administradores.
            </p>
            <AsteryskoSystemLogsPanel />
        </div>
    </DashboardPage>
);

export default DockaAuditView;
