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
        console.debug("createRestoreClientPromise", "begin");

        console.debug("createRestoreClientPromise", "open database", databaseName);
        const openDbRequest = indexedDB.open(databaseName, 1);

        openDbRequest.addEventListener('upgradeneeded', async e => {
            console.debug("createRestoreClientPromise", "upgradeneeded", "begin", e);
            try {
                const db = (e.target as never as { result: IDBDatabase }).result;

                if (!db.objectStoreNames.contains(OBJECT_STORE)) {
                    console.debug("createRestoreClientPromise", "upgradeneeded", "create object store", OBJECT_STORE);
                    db.createObjectStore(OBJECT_STORE);
                }
            } catch (e) {
                console.debug("createRestoreClientPromise", "upgradeneeded", "error", e);
                reject(e);
            }
            console.debug("createRestoreClientPromise", "upgradeneeded", "end");
        });
        openDbRequest.addEventListener('success', async e => {
            console.debug("createRestoreClientPromise", "success", "begin", e);
            try {
                const database = (e.target as never as { result: IDBDatabase }).result;
                setter(database);

                console.debug("createRestoreClientPromise", "success", "open transaction", OBJECT_STORE);
                const transaction = database.transaction(OBJECT_STORE, 'readonly');

                console.debug("createRestoreClientPromise", "success", "get object store", OBJECT_STORE);
                const store = transaction.objectStore(OBJECT_STORE);

                console.debug("createRestoreClientPromise", "success", "retrieve client", OBJECT_STORE);
                const client = await idbPromise(store.get(OBJECT_KEY));
                console.debug("createRestoreClientPromise", "success", "retrieved client", OBJECT_STORE, client);

                console.debug("createRestoreClientPromise", "success", "commit transaction");
                transaction.commit();

                resolve(client);
            } catch (e) {
                console.debug("createRestoreClientPromise", "success", "error", e);
                reject(e);
            }
            console.debug("createRestoreClientPromise", "success", "end");
        });
        openDbRequest.addEventListener('error', e => {
            console.error("createRestoreClientPromise", "error", e);
            reject(e);
        })
    });
}

export default function createIndexedDBPersister(databaseName: string): Persister {
    let database: IDBDatabase | undefined;
    return {
        async persistClient(persistedClient: PersistedClient): Promise<void> {
            console.debug("createIndexedDBPersister", "persistClient", "begin")
            if (database) {
                console.debug("createIndexedDBPersister", "persistClient", "open transaction")
                const transaction = database.transaction(OBJECT_STORE, 'readwrite');

                console.debug("createIndexedDBPersister", "persistClient", "get object store", OBJECT_STORE)
                const store = transaction.objectStore(OBJECT_STORE);

                console.debug("createIndexedDBPersister", "persistClient", "put client", persistedClient)
                await idbPromise(store.put(persistedClient, OBJECT_KEY));

                console.debug("createIndexedDBPersister", "persistClient", "commit transaction")
                transaction.commit();

                console.debug("createIndexedDBPersister", "persistClient", "end")
            }
        },
        restoreClient(): Promise<PersistedClient | undefined> {
            console.debug("createIndexedDBPersister", "restoreClient", "begin");
            return createRestoreClientPromise(databaseName, (db) => {
                database = db;
            }).then(client => {
                console.debug("createIndexedDBPersister", "restoreClient", "end");
                return client;
            })


        },
        async removeClient(): Promise<void> {
            console.debug("createIndexedDBPersister", "removeClient", "begin");
            if (database) {
                console.debug("createIndexedDBPersister", "removeClient", "delete object store", OBJECT_STORE);
                database.deleteObjectStore(OBJECT_STORE);
            }

            console.debug("createIndexedDBPersister", "removeClient", "end");
        }
    }
}