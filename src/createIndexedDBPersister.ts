import type {PersistedClient, Persister} from "@tanstack/react-query-persist-client";

function idbPromise<T>(req: IDBRequest<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        req.addEventListener('success', () => resolve(req.result));
        req.addEventListener('error', () => reject(req.error!));
    });
}

const OBJECT_STORE = 'persistedClientStore' as const;
const OBJECT_KEY = 'client' as const;

async function createRestoreClientPromise(databaseName: string, setter: (database: IDBDatabase) => void): Promise<PersistedClient | undefined> {
    return new Promise<PersistedClient>((resolve, reject) => {
        const openDbRequest = indexedDB.open(databaseName, 1);

        const upgradeSchema = async (e: IDBVersionChangeEvent) => {
            try {
                const db = (e.target as never as { result: IDBDatabase }).result;

                if (!db.objectStoreNames.contains(OBJECT_STORE)) {
                    db.createObjectStore(OBJECT_STORE);
                }
            } catch (e) {
                console.error("createRestoreClientPromise", "upgradeneeded", e);
                reject(e);
            }
        };

        const restoreClient = async (e: Event) => {
            try {
                const database = (e.target as never as { result: IDBDatabase }).result;
                setter(database);

                const transaction = database.transaction(OBJECT_STORE, 'readonly');
                const store = transaction.objectStore(OBJECT_STORE);
                const client = await idbPromise(store.get(OBJECT_KEY));

                transaction.commit();

                resolve(client);
            } catch (e) {
                console.error("createRestoreClientPromise", "success", e);
                reject(e);
            }
        };

        const reportError = (e: Event) => {
            console.error("createRestoreClientPromise", "error", e);
            reject(e);
        };

        openDbRequest.addEventListener('upgradeneeded', upgradeSchema);
        openDbRequest.addEventListener('success', restoreClient);
        openDbRequest.addEventListener('error', reportError)
    });
}

export default function createIndexedDBPersister(databaseName: string): Persister {
    let database: IDBDatabase | undefined;
    return {
        async persistClient(persistedClient: PersistedClient): Promise<void> {
            if (database) {
                const transaction = database.transaction(OBJECT_STORE, 'readwrite');
                const store = transaction.objectStore(OBJECT_STORE);

                await idbPromise(store.put(persistedClient, OBJECT_KEY));

                transaction.commit();
            }
        },
        restoreClient(): Promise<PersistedClient | undefined> {
            return createRestoreClientPromise(databaseName, (db) => {
                database = db;
            });
        },
        async removeClient(): Promise<void> {
            if (database) {
                database.deleteObjectStore(OBJECT_STORE);
            }
        }
    }
}