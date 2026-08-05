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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const rawMsg = error instanceof Error ? error.message : String(error);
  const isQuota = rawMsg.toLowerCase().includes('quota') || rawMsg.toLowerCase().includes('resource-exhausted') || rawMsg.toLowerCase().includes('resource_exhausted');
  
  const displayMsg = isQuota
    ? `Quota exceeded for Firestore database. Free daily quota will reset tomorrow. For details on usage limits and pricing, see https://firebase.google.com/pricing#cloud-firestore (Original error: ${rawMsg})`
    : rawMsg;

  const errInfo: FirestoreErrorInfo = {
    error: displayMsg,
    authInfo: {},
    operationType,
    path
  };
  
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
