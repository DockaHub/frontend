import { useMemo, useState } from 'react';
import { Search, UserRound, X } from 'lucide-react';
import type { AllyoUser } from '../../../../services/allyoService';
import { allyoUserRoleLabel, isAssignableAllyoUser, normalizeAllyoPerson } from './allyoUserPresentation';

interface AllyoUserPickerProps {
    users: AllyoUser[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    multiple?: boolean;
    placeholder?: string;
    disabled?: boolean;
}

const AllyoUserPicker = ({ users, selectedIds, onChange, multiple = true, placeholder = 'Digite o nome do criativo', disabled = false }: AllyoUserPickerProps) => {
    const [query, setQuery] = useState('');
    const [focused, setFocused] = useState(false);
    const assignableUsers = useMemo(() => users.filter(isAssignableAllyoUser), [users]);
    const selected = useMemo(() => selectedIds.map((id) => assignableUsers.find((user) => user.id === id)).filter((user): user is AllyoUser => Boolean(user)), [assignableUsers, selectedIds]);
    const suggestions = useMemo(() => {
        const term = normalizeAllyoPerson(query);
        return assignableUsers
            .filter((user) => !selectedIds.includes(user.id))
            .filter((user) => !term || normalizeAllyoPerson(`${user.name} ${user.email} ${allyoUserRoleLabel(user)} ${user.team || ''}`).includes(term))
            .slice(0, 8);
    }, [assignableUsers, query, selectedIds]);

    const select = (user: AllyoUser) => {
        onChange(multiple ? [...selectedIds, user.id] : [user.id]);
        setQuery('');
        setFocused(false);
    };

    return (
        <div className="relative">
            {selected.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                    {selected.map((user) => (
                        <span key={user.id} className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#dce5c9] bg-[#f6f8f1] py-1.5 pl-2.5 pr-1.5 text-xs dark:border-[#9db669]/30 dark:bg-[#9db669]/10">
                            <span className="min-w-0 truncate"><strong>{user.name}</strong><span className="ml-1 text-[#718548]">· {allyoUserRoleLabel(user)}</span></span>
                            <button type="button" disabled={disabled} onClick={() => onChange(selectedIds.filter((id) => id !== user.id))} className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[#777] hover:bg-black/5 hover:text-red-600 disabled:opacity-40" aria-label={`Remover ${user.name}`}><X size={12} /></button>
                        </span>
                    ))}
                </div>
            )}
            {(!selected.length || multiple) && (
                <div className="relative">
                    <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
                    <input
                        value={query}
                        disabled={disabled}
                        onChange={(event) => { setQuery(event.target.value); setFocused(true); }}
                        onFocus={() => setFocused(true)}
                        onBlur={() => window.setTimeout(() => setFocused(false), 120)}
                        placeholder={placeholder}
                        autoComplete="off"
                        className="h-11 w-full rounded-[10px] border border-[#dedede] bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[#9db669] focus:ring-2 focus:ring-[#9db669]/15 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900"
                    />
                </div>
            )}
            {focused && (!selected.length || multiple) && (
                <div className="absolute z-[80] mt-1 max-h-64 w-full overflow-y-auto rounded-[12px] border border-[#dedede] bg-white p-1.5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                    {suggestions.map((user) => (
                        <button key={user.id} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => select(user)} className="flex w-full items-center gap-3 rounded-[9px] px-3 py-2.5 text-left hover:bg-[#f4f6f0] dark:hover:bg-zinc-800">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0d1e1d] text-[#d7e7b1]"><UserRound size={14} /></span>
                            <span className="min-w-0"><strong className="block truncate text-xs font-semibold">{user.name}</strong><span className="mt-1 block truncate text-[10px] text-[#718548]">{allyoUserRoleLabel(user)} · {user.email}</span></span>
                        </button>
                    ))}
                    {suggestions.length === 0 && <span className="block px-3 py-4 text-center text-xs text-[#888]">Nenhum usuário interno cadastrado encontrado.</span>}
                </div>
            )}
            <p className="mt-2 text-[10px] leading-4 text-[#888]">Somente usuários internos ativos podem ser vinculados. O cargo define quais tarefas entram na fila de cada criativo.</p>
        </div>
    );
};

export default AllyoUserPicker;
