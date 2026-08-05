// @ts-ignore
import { app, getInitPromise } from '../dist/server.cjs';

export default async function handler(req: any, res: any) {
  try {
    if (typeof getInitPromise === 'function') {
      await getInitPromise();
    }
  } catch (e) {
    console.warn('[Vercel API] Async init notice:', e);
  }
  return app(req, res);
}
