'use client';

import { useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import contractData from './contract.json';
import Link from 'next/link';

type Product = {
  id: bigint;
  name: string;
  description: string;
  manufacturer: string;
  currentOwner: string;
  status: bigint;
  timestamp: bigint;
  location: string;
};

const statusLabel = (s: number) =>
  ['Manufactured', 'Shipped', 'InTransit', 'Delivered', 'Received'][s] ?? 'Unknown';

export default function Home() {
  const [account, setAccount] = useState<string>('');
  const [admin, setAdmin] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productCount, setProductCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const provider = useMemo(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      return new ethers.BrowserProvider((window as any).ethereum);
    }
    return null;
  }, []);

  useEffect(() => {
    (async () => {
      if (!provider) return;
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAccount(addr);

      const c = new ethers.Contract(
        (contractData as any).address,
        (contractData as any).abi,
        signer
      );
      setContract(c);

      const adminAddr: string = await c.admin();
      setAdmin(adminAddr);
      setIsAdmin(adminAddr.toLowerCase() === addr.toLowerCase());

      await refresh(c);
    })().catch(console.error);
  }, [provider]);

  async function refresh(c: ethers.Contract | null = contract) {
    if (!c) return;
    const count: bigint = await c.productCount();
    setProductCount(Number(count));
    const arr: Product[] = [];
    for (let i = 1; i <= Number(count); i++) {
      const p = await c.getProduct(i);
      arr.push(p as Product);
    }
    setProducts(arr);
  }

  async function createProduct() {
    if (!contract) return;
    const name = prompt('Product name:') || '';
    const desc = prompt('Description:') || '';
    const location = prompt('Location:') || '';
    if (!name) return;
    setLoading(true);
    try {
      const tx = await contract.createProduct(name, desc, location);
      await tx.wait();
      await refresh();
      alert('Created');
    } catch (e: any) {
      alert(e?.message ?? 'Tx failed');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: number) {
    if (!contract) return;
    const s = prompt('Status (0=Manufactured,1=Shipped,2=InTransit,3=Delivered,4=Received):') || '0';
    const location = prompt('Location:') || '';
    const notes = prompt('Notes:') || '';
    setLoading(true);
    try {
      const tx = await contract.updateStatus(id, Number(s), location, notes);
      await tx.wait();
      await refresh();
      alert('Updated');
    } catch (e: any) {
      alert(e?.message ?? 'Tx failed');
    } finally {
      setLoading(false);
    }
  }

  async function transferOwnership(id: number) {
    if (!contract) return;
    const to = prompt('New owner address:') || '';
    if (!to) return;
    setLoading(true);
    try {
      const tx = await contract.transferOwnership(id, to);
      await tx.wait();
      await refresh();
      alert('Transferred');
    } catch (e: any) {
      alert(e?.message ?? 'Tx failed');
    } finally {
      setLoading(false);
    }
  }

  async function addAuthorized() {
    if (!contract) return;
    const addr = prompt('Address to authorize:') || '';
    const enabled = prompt('Enable? (true/false):') || 'true';
    if (!addr) return;
    setLoading(true);
    try {
      const tx = await contract.addAuthorizedParty(addr, enabled === 'true');
      await tx.wait();
      alert('Authorization updated');
    } catch (e: any) {
      alert(e?.message ?? 'Tx failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">🚚 Supply Chain Tracker</h1>
          <div className="text-right text-sm text-slate-600">
            <div>{account ? `Connected: ${account.slice(0, 8)}...${account.slice(-6)}` : 'Connect wallet'}</div>
            <div className="text-xs">Admin: {admin ? `${admin.slice(0, 8)}...${admin.slice(-6)}` : '-'}</div>
          </div>
        </header>

        <div className="bg-white rounded-xl shadow p-4 flex items-center justify-between">
          <div>
            <div className="text-slate-500 text-sm">Products</div>
            <div className="text-2xl font-semibold">{productCount}</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={createProduct}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              + Create Product
            </button>
            {isAdmin && (
              <button
                onClick={addAuthorized}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                + Authorize Address
              </button>
            )}
            <Link
              href="/verify"
              className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900"
            >
              Verify Page →
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p, idx) => (
            <div className="bg-white rounded-xl shadow p-4 space-y-2" key={idx}>
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm text-slate-600">{p.description}</div>
              <div className="text-sm"><b>Status:</b> {statusLabel(Number(p.status))}</div>
              <div className="text-xs text-slate-500"><b>Owner:</b> {(p.currentOwner as string).slice(0,10)}...</div>
              <div className="text-xs text-slate-500"><b>Location:</b> {p.location}</div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => updateStatus(Number(p.id))}
                  className="px-3 py-1 rounded bg-amber-600 text-white hover:bg-amber-700 text-sm"
                >
                  Update Status
                </button>
                <button
                  onClick={() => transferOwnership(Number(p.id))}
                  className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
                >
                  Transfer
                </button>
                <Link
                  href={`/verify?id=${String(p.id)}`}
                  className="px-3 py-1 rounded bg-slate-600 text-white hover:bg-slate-700 text-sm"
                >
                  Verify
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center text-white font-semibold">
          Processing transaction...
        </div>
      )}
    </main>
  );
}
