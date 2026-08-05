import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer, setLogLevel } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence non-fatal connectivity warnings in iframe/sandboxed environments
setLogLevel('silent');

const app = initializeApp(firebaseConfig);

// Use initializeFirestore with experimentalAutoDetectLongPolling
export const db = initializeFirestore(
  app,
  {
    experimentalAutoDetectLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId
);

export const auth = getAuth(app);
export const storage = getStorage(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice/Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Connection test validator to safely detect Firestore connectivity without hanging
export async function testConnection(): Promise<boolean> {
  try {
    const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 3000));
    await Promise.race([getDocFromServer(doc(db, 'test', 'connection')), timeout]);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('the client is offline') || error.message.includes('unavailable')) {
        console.warn("Firestore client running in offline mode or backend unavailable; utilizing local fallback.");
      } else {
        console.warn("Firestore connection check info:", error.message);
      }
    }
    return false;
  }
}


