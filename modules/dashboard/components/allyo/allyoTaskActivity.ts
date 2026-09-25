export type AllyoActivity = {
    id: string;
    type: 'message' | 'approval_sent' | 'client_file_change' | 'management_action';
    createdAt: string;
    author: string;
    role: 'creative' | 'client' | 'system';
    text: string;
    fileName?: string;
    version?: string;
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

export const addTaskActivity = (taskId: string, activity: Omit<AllyoActivity, 'id' | 'createdAt'>) => {
    const entry: AllyoActivity = {
        ...activity,
        id: window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
        createdAt: new Date().toISOString(),
    };
    const history = [...readTaskActivity(taskId), entry];
    window.localStorage.setItem(storageKey(taskId), JSON.stringify(history));
    window.dispatchEvent(new CustomEvent(activityEvent, { detail: taskId }));
    return entry;
};

// The client file editor can call this when a customer submits an annotated file.
export const recordClientFileChange = (taskId: string, clientName: string, fileName: string, comment = '', version?: string) =>
    addTaskActivity(taskId, {
        type: 'client_file_change',
        author: clientName,
        role: 'client',
        text: comment.trim() || 'O cliente enviou alterações diretamente no arquivo.',
        fileName,
        version,
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
