'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ethers } from 'ethers';
import contractData from '../contract.json';
import QRCode from 'react-qr-code';
import Link from 'next/link';

type History = {
  status: bigint;
  timestamp: bigint;
  updatedBy: string;
  location: string;
  notes: string;
};

const statusLabel = (s: number) =>
  ['Manufactured', 'Shipped', 'InTransit', 'Delivered', 'Received'][s] ?? 'Unknown';

export default function VerifyPage() {
  const params = useSearchParams();
  const productId = Number(params.get('id') || '0');

  const [account, setAccount] = useState<string>('');
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [name, setName] = useState<string>('');
  const [desc, setDesc] = useState<string>('');
  const [owner, setOwner] = useState<string>('');
  const [status, setStatus] = useState<number>(0);
  const [location, setLocation] = useState<string>('');
  const [history, setHistory] = useState<History[]>([]);

  const provider = useMemo(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      return new ethers.BrowserProvider((window as any).ethereum);
    }
    return null;
  }, []);

  useEffect(() => {
    (async () => {
      if (!provider || !productId) return;
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAccount(addr);

      const c = new ethers.Contract(
        (contractData as any).address,
        (contractData as any).abi,
        signer
      );
      setContract(c);
      await load(c);
    })().catch(console.error);
  }, [provider, productId]);

  async function load(c: ethers.Contract | null = contract) {
    if (!c || !productId) return;
    setLoading(true);
    try {
      const p = await c.getProduct(productId);
      setName(p.name);
      setDesc(p.description);
      setOwner(p.currentOwner);
      setStatus(Number(p.status));
      setLocation(p.location);

      const h: History[] = await c.getProductHistory(productId);
      setHistory(h);
    } finally {
      setLoading(false);
    }
  }

  const verifyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify?id=${productId}`
    : `/verify?id=${productId}`;

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">🔎 Verify Product #{productId || '-'}</h1>
          <Link href="/" className="text-blue-600 hover:underline">← Back</Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white rounded-xl shadow p-4 space-y-2">
            <div><b>Name:</b> {name}</div>
            <div><b>Description:</b> {desc}</div>
            <div><b>Owner:</b> {owner ? `${owner.slice(0,8)}...${owner.slice(-6)}` : '-'}</div>
            <div><b>Status:</b> {statusLabel(status)}</div>
            <div><b>Location:</b> {location}</div>

            <div className="pt-4">
              <div className="font-semibold mb-2">History</div>
              <div className="space-y-2">
                {history.length === 0 && <div className="text-slate-500 text-sm">No history.</div>}
                {history.map((h, i) => (
                  <div key={i} className="border rounded-lg p-3">
                    <div className="text-sm"><b>Status:</b> {statusLabel(Number(h.status))}</div>
                    <div className="text-xs text-slate-600"><b>Updated By:</b> {h.updatedBy ? `${h.updatedBy.slice(0,8)}...${h.updatedBy.slice(-6)}` : '-'}</div>
                    <div className="text-xs text-slate-600"><b>Location:</b> {h.location}</div>
                    <div className="text-xs text-slate-600"><b>Notes:</b> {h.notes}</div>
                    <div className="text-xs text-slate-500"><b>Time:</b> {new Date(Number(h.timestamp) * 1000).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center justify-center">
            <div className="mb-2 font-semibold">QR: Verify Link</div>
            <QRCode value={verifyUrl} size={160} />
            <div className="text-xs text-center mt-2 break-all">{verifyUrl}</div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center text-white font-semibold">
          Loading...
        </div>
      )}
    </main>
  );
}
