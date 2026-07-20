import React, { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle, XCircle, RefreshCw, Layers, Database, Globe, Image, Terminal } from 'lucide-react';

interface DiagnosticData {
  status: string;
  database: {
    connected: boolean;
    provider: string;
    databaseId: string;
    projectId: string;
    totalProducts: number;
    firstProduct: {
      id: string;
      name: string;
      imageURL: string;
      category: string;
      price: string;
    } | null;
  };
  api: {
    status: string;
    endpoints: {
      products_get: string;
      products_post: string;
      products_patch: string;
      products_delete: string;
    };
  };
}

export default function SystemCheck() {
  const [data, setData] = useState<DiagnosticData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageStatus, setImageStatus] = useState<'testing' | 'working' | 'broken'>('testing');
  const [testCount, setTestCount] = useState(0);

  const runSystemCheck = async () => {
    setIsLoading(true);
    setError(null);
    setImageStatus('testing');
    try {
      console.log('[SystemCheck] Fetching backend diagnostics...');
      const res = await fetch('/api/diagnostics');
      if (!res.ok) {
        throw new Error(`HTTP Error Status: ${res.status}`);
      }
      const json: DiagnosticData = await res.json();
      console.log('[SystemCheck] Backend diagnostics loaded:', json);
      setData(json);

      // Verify if the latest product image can be loaded
      const firstProductImage = json.database.firstProduct?.imageURL;
      if (firstProductImage) {
        const img = new window.Image();
        img.src = firstProductImage;
        img.onload = () => {
          console.log('[SystemCheck] Image load verified successfully:', firstProductImage);
          setImageStatus('working');
        };
        img.onerror = () => {
          console.error('[SystemCheck] Image load failed for:', firstProductImage);
          setImageStatus('broken');
        };
      } else {
        setImageStatus('broken');
      }
    } catch (err: any) {
      console.error('[SystemCheck] Error running diagnostics:', err);
      setError(err.message || String(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runSystemCheck();
  }, [testCount]);

  const dbPass = data ? data.database.connected : false;
  const apiPass = data ? data.api.status === 'Operational' : false;
  const envMode = (import.meta as any).env?.MODE || 'production';

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-100 flex flex-col justify-between font-sans">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black font-mono tracking-wider uppercase text-white">Immortal Electronics</h1>
              <p className="text-[10px] text-zinc-400 font-mono">SYSTEM AUDIT DESK • V1.0.4</p>
            </div>
          </div>

          <button
            onClick={() => setTestCount(prev => prev + 1)}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/15"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Re-Run Diagnostics</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl w-full mx-auto p-6 flex-1 space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl flex items-start gap-3">
            <XCircle className="w-5 h-5 shrink-0 text-red-500" />
            <div className="space-y-1">
              <span className="font-bold">System Check Failure</span>
              <p className="opacity-90 leading-relaxed font-mono text-[11px]">{error}</p>
              <button 
                onClick={() => setTestCount(prev => prev + 1)}
                className="mt-2 text-indigo-400 hover:underline font-bold"
              >
                Retry Request
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Status Matrix Card */}
          <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl space-y-5">
            <div className="flex items-center space-x-2 pb-2 border-b border-zinc-800/60">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xs font-black uppercase font-mono tracking-wider text-zinc-200">System Connection Status</h2>
            </div>

            <div className="space-y-4">
              {/* Database Status */}
              <div className="flex items-center justify-between p-3 bg-zinc-950/40 border border-zinc-800/40 rounded-xl">
                <div className="flex items-center space-x-2.5">
                  <Database className="w-4 h-4 text-zinc-400" />
                  <div>
                    <span className="text-xs font-bold text-zinc-300 block">Database Connection</span>
                    <span className="text-[10px] text-zinc-500 font-mono block">
                      {isLoading ? 'Checking connection...' : data?.database.provider || 'N/A'}
                    </span>
                  </div>
                </div>
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 text-zinc-600 animate-spin" />
                ) : dbPass ? (
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[11px] font-bold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>PASS</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400 text-[11px] font-bold">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>FAIL</span>
                  </div>
                )}
              </div>

              {/* API Connection */}
              <div className="flex items-center justify-between p-3 bg-zinc-950/40 border border-zinc-800/40 rounded-xl">
                <div className="flex items-center space-x-2.5">
                  <Globe className="w-4 h-4 text-zinc-400" />
                  <div>
                    <span className="text-xs font-bold text-zinc-300 block">API Status</span>
                    <span className="text-[10px] text-zinc-500 font-mono block">GET /api/products</span>
                  </div>
                </div>
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 text-zinc-600 animate-spin" />
                ) : apiPass ? (
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[11px] font-bold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>PASS</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400 text-[11px] font-bold">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>FAIL</span>
                  </div>
                )}
              </div>

              {/* Image URL verification */}
              <div className="flex items-center justify-between p-3 bg-zinc-950/40 border border-zinc-800/40 rounded-xl">
                <div className="flex items-center space-x-2.5">
                  <Image className="w-4 h-4 text-zinc-400" />
                  <div>
                    <span className="text-xs font-bold text-zinc-300 block">Product Images Status</span>
                    <span className="text-[10px] text-zinc-500 font-mono block truncate max-w-[150px]">
                      {isLoading ? 'Verifying latest asset...' : data?.database.firstProduct?.imageURL || 'No image'}
                    </span>
                  </div>
                </div>
                {isLoading || imageStatus === 'testing' ? (
                  <RefreshCw className="w-4 h-4 text-zinc-600 animate-spin" />
                ) : imageStatus === 'working' ? (
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[11px] font-bold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>WORKING</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400 text-[11px] font-bold">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>BROKEN</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metrics Panel */}
          <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-zinc-800/60">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xs font-black uppercase font-mono tracking-wider text-zinc-200">Environment & Counts</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-950/50 border border-zinc-800/60 rounded-xl">
                <span className="text-[10px] text-zinc-500 font-mono block uppercase">Product Count</span>
                <span className="text-2xl font-black text-white font-mono block mt-1">
                  {isLoading ? '...' : data?.database.totalProducts ?? 0}
                </span>
                <span className="text-[9px] text-zinc-400 block mt-1">catalog items loaded</span>
              </div>

              <div className="p-4 bg-zinc-950/50 border border-zinc-800/60 rounded-xl">
                <span className="text-[10px] text-zinc-500 font-mono block uppercase">Frontend Env</span>
                <span className="text-xs font-black text-indigo-400 font-mono block mt-2 uppercase tracking-wide">
                  {envMode}
                </span>
                <span className="text-[9px] text-zinc-400 block mt-1">Vite build setting</span>
              </div>
            </div>

            {/* Latest Product */}
            <div className="p-4 bg-zinc-950/40 border border-zinc-800/40 rounded-xl space-y-1">
              <span className="text-[10px] text-zinc-500 font-mono block uppercase">Latest Uploaded Product</span>
              <span className="text-xs font-bold text-zinc-200 block truncate">
                {isLoading ? 'Fetching details...' : data?.database.firstProduct?.name || 'No products in database.'}
              </span>
              {data?.database.firstProduct && (
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1">
                  <span>Price: {data.database.firstProduct.price}</span>
                  <span>Category: {data.database.firstProduct.category}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Image Verification Preview Block */}
        {data?.database.firstProduct && (
          <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl space-y-4">
            <h3 className="text-xs font-black uppercase font-mono tracking-wider text-zinc-300">Live Product Image Fetch Validation</h3>
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-zinc-950/40 border border-zinc-800/40 rounded-xl">
              <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-xl p-2 flex items-center justify-center shrink-0">
                <img
                  src={data.database.firstProduct.imageURL}
                  alt="Diagnostic Test"
                  className="max-w-full max-h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-zinc-200 block">{data.database.firstProduct.name}</span>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  The container is rendering the above live image resource fetched directly from the database's asset address. If the image renders correctly, image validation is completely healthy.
                </p>
                <div className="font-mono text-[10px] text-zinc-500 select-all p-1 bg-zinc-950 border border-zinc-800/60 rounded break-all">
                  URL: {data.database.firstProduct.imageURL}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Raw Response JSON Dump */}
        <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl space-y-3">
          <span className="text-xs font-black uppercase font-mono tracking-wider text-zinc-300 block">Raw Handshake JSON Response</span>
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl overflow-x-auto">
            <pre className="font-mono text-[11px] text-zinc-400 leading-relaxed">
              {isLoading ? 'Waiting for handshake response...' : JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 bg-zinc-950 py-4 px-6 text-center text-[11px] text-zinc-500 font-mono">
        Immortal Electronics • Production Validation Audit Systems • Accra, Ghana
      </footer>
    </div>
  );
}
