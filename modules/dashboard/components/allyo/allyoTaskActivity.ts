export type AllyoActivity = {
    id: string;
    type: 'message' | 'approval_sent' | 'client_file_change' | 'management_action';
    createdAt: string;
    author: string;
    role: 'creative' | 'client' | 'system';
    text: string;
    fileName?: string;
    version?: string;
    designId?: number;
    pointsCount?: number;
};

const storageKey = (taskId: string) => `allyo:task-activity:v1:${taskId}`;
const activityEvent = 'allyo:task-activity-changed';

export const readTaskActivity = (taskId: string): AllyoActivity[] => {
    try {
        const stored = JSON.parse(window.localStorage.getItem(storageKey(taskId)) || '[]');
        return Array.isArray(stored) ? stored.filter((item) => item && typeof item.id === 'string' && typeof item.createdAt === 'string' && typeof item.text === 'string') : [];
    } catch {
        return [];
    }
};

export const addTaskActivity = (taskId: string, activity: Omit<AllyoActivity, 'id' | 'createdAt'> & { id?: string; createdAt?: string }) => {
    const current = readTaskActivity(taskId);
    const entryId = activity.id || window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
    const entryCreatedAt = activity.createdAt || new Date().toISOString();

    const entry: AllyoActivity = {
        ...activity,
        id: entryId,
        createdAt: entryCreatedAt,
    };

    const existingIndex = current.findIndex((item) => {
        if (item.id === entry.id) return true;
        if (
            item.type === entry.type &&
            item.text.trim() === entry.text.trim() &&
            (item.role === entry.role || entry.role === 'creative')
        ) {
            const timeDiff = Math.abs(new Date(item.createdAt).getTime() - new Date(entry.createdAt).getTime());
            if (timeDiff < 120000) return true;
        }
        return false;
    });

    let history: AllyoActivity[];
    if (existingIndex >= 0) {
        if (entry.id.startsWith('remote-msg-') && !current[existingIndex].id.startsWith('remote-msg-')) {
            current[existingIndex].id = entry.id;
            current[existingIndex].createdAt = entry.createdAt;
            history = [...current];
        } else {
            return current[existingIndex];
        }
    } else {
        history = [...current, entry];
    }

    history.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    window.localStorage.setItem(storageKey(taskId), JSON.stringify(history));
    window.dispatchEvent(new CustomEvent(activityEvent, { detail: taskId }));
    return entry;
};

// The client file editor can call this when a customer submits an annotated file.
export const recordClientFileChange = (taskId: string, clientName: string, fileName: string, comment = '', version?: string, designId?: number, pointsCount?: number) =>
    addTaskActivity(taskId, {
        type: 'client_file_change',
        author: clientName,
        role: 'client',
        text: comment.trim() || 'O cliente enviou alterações diretamente no arquivo.',
        fileName,
        version,
        designId,
        pointsCount,
    });

export const subscribeToTaskActivity = (taskId: string, callback: () => void) => {
    const onLocalChange = (event: Event) => {
        if ((event as CustomEvent<string>).detail === taskId) callback();
    };
    const onStorageChange = (event: StorageEvent) => {
        if (event.key === storageKey(taskId)) callback();
    };
    window.addEventListener(activityEvent, onLocalChange);
    window.addEventListener('storage', onStorageChange);
    return () => {
        window.removeEventListener(activityEvent, onLocalChange);
        window.removeEventListener('storage', onStorageChange);
    };
};
