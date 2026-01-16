import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { put } from '@vercel/blob';
import UploadSection from "./components/UploadSection";
import RegisteredTable from "./components/RegisteredTable";
import EarningsSummary from "./components/EarningsSummary";
import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardCard } from '@/components/DashboardCard';

interface RequestItem {
  id: number;
  status: string;
  event_date: string; // YYYY-MM-DD
  artist_gage?: number | null; // gewünschte/vereinbarte Gage des Artists
}

interface InvoiceFile {
  name: string;
  url: string;
  size?: number;
  created_at?: string;
}

interface RegisteredInvoice {
  id: number;
  storage_path: string;
  status?: string;
  amount_cents?: number | null;
  currency?: string | null;
  invoice_date?: string | null; // ISO yyyy-mm-dd
  created_at?: string | null;
  updated_at?: string | null;
}

const normalize = (s?: string | null) => (s ?? '').toString().trim().toLowerCase();

const parseISODate = (iso: string) => new Date(`${iso}T00:00:00`);

export default function Buhaltung() {
  const { token } = useAuth();
  const [artistId, setArtistId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [requests, setRequests] = useState<RequestItem[]>([]);

  const [uploading, setUploading] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceFile[]>([]);
  const [invError, setInvError] = useState<string | null>(null);

  const [amount, setAmount] = useState<string>(''); // in EUR, we convert to cents
  const [invoiceDate, setInvoiceDate] = useState<string>(''); // yyyy-mm-dd
  const [note, setNote] = useState<string>('');

  const [registered, setRegistered] = useState<RegisteredInvoice[]>([]);
  const [regError, setRegError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1) Eigenen Artist laden (für artistId)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const res = await fetch(`${baseUrl}/api/artists/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const me = await res.json();
        if (!mounted) return;
        setArtistId(me.id);
      } catch (e: any) {
        if (!mounted) return;
        console.error('❌ /api/artists/me failed', e);
        setError(e?.message || 'Profil konnte nicht geladen werden');
      }
    })();
    return () => { mounted = false; };
  }, [token]);

  // 2) Eigene Anfragen laden (für Verdienstübersicht)
  useEffect(() => {
    if (!token) return;
    let mounted = true;
    (async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const res = await fetch(`${baseUrl}/api/requests/requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as RequestItem[];
        if (!mounted) return;
        setRequests(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!mounted) return;
        console.error('❌ /api/requests/requests failed', e);
        setError(e?.message || 'Anfragen konnten nicht geladen werden');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [token]);

  // 3) Registrierte Rechnungen aus Backend laden
  const listRegistered = async () => {
    try {
      setRegError(null);
      const baseUrl = import.meta.env.VITE_API_URL as string;
      const res = await fetch(`${baseUrl}/api/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 204) { setRegistered([]); setInvoices([]); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rows = (await res.json()) as RegisteredInvoice[];
      setRegistered(rows);

      // Build invoice list from registered invoices (Vercel Blob URLs are public)
      const items: InvoiceFile[] = rows.map(r => ({
        name: r.storage_path.split('/').pop() || r.storage_path,
        url: r.storage_path, // storage_path now stores the full Vercel Blob URL
        created_at: r.created_at || undefined,
      }));
      setInvoices(items);
    } catch (e: any) {
      console.error('❌ list registered invoices failed', e);
      setRegError(e?.message || 'Registrierte Rechnungen konnten nicht geladen werden');
    }
  };

  useEffect(() => {
    if (artistId) {
      listRegistered();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artistId]);

  // Upload-Handler (PDF oder Bild) - using Vercel Blob
  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!artistId) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setInvError(null);
    try {
      const backendUrl = import.meta.env.VITE_API_URL as string;

      for (const file of Array.from(files)) {
        const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
        const pathname = `invoices/${artistId}/${safeName}`;

        // Upload to Vercel Blob
        const { url } = await put(pathname, file, {
          access: 'public',
          contentType: file.type || 'application/octet-stream',
        });

        // Register invoice in backend with the Blob URL as storage_path
        try {
          await fetch(`${backendUrl}/api/invoices`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              storage_path: url, // Store the full Vercel Blob URL
              amount_cents: amount ? Math.round(parseFloat(amount.replace(',', '.')) * 100) : undefined,
              currency: 'EUR',
              invoice_date: invoiceDate || undefined,
              notes: note || undefined,
            }),
          });
        } catch (regErr) {
          console.warn('⚠️ Backend-Registrierung der Rechnung fehlgeschlagen:', regErr);
        }
      }
      await listRegistered();
      // Reset form fields
      setAmount('');
      setInvoiceDate('');
      setNote('');
    } catch (e: any) {
      console.error('❌ upload failed', e);
      setInvError(e?.message || 'Upload fehlgeschlagen');
    } finally {
      setUploading(false);
      e.currentTarget.value = '';
    }
  };

  // Verdienst-Berechnung
  const { monthTotal, yearTotal, monthCount, yearCount } = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth(); // 0-basiert
    const accepted = requests.filter((r) => normalize(r.status) === 'akzeptiert');
    let monthTotal = 0;
    let yearTotal = 0;
    let monthCount = 0;
    let yearCount = 0;
    for (const r of accepted) {
      const d = parseISODate(r.event_date);
      const val = Number(r.artist_gage ?? 0) || 0;
      if (d.getFullYear() === y) {
        yearTotal += val; yearCount += 1;
        if (d.getMonth() === m) { monthTotal += val; monthCount += 1; }
      }
    }
    return { monthTotal, yearTotal, monthCount, yearCount };
  }, [requests]);

  const fmtAmount = (cents?: number | null, currency?: string | null) => {
    if (cents == null) return '—';
    const v = cents / 100;
    try { return new Intl.NumberFormat('de-DE', { style: 'currency', currency: currency || 'EUR' }).format(v); }
    catch { return `${v.toFixed(2)} ${currency || 'EUR'}`; }
  };

  return (
    <DashboardLayout title="Buchhaltung">
      <div className="space-y-6">

        {/* Hidden file input (kept in Page to wire onChange to Supabase upload) */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="application/pdf,image/jpeg,image/png,image/webp"
          onChange={onUpload}
          disabled={!artistId || uploading}
          className="hidden"
        />

        {/* Upload Section */}
        <DashboardCard>
          <UploadSection
            amount={amount}
            setAmount={setAmount}
            invoiceDate={invoiceDate}
            setInvoiceDate={setInvoiceDate}
            note={note}
            setNote={setNote}
            uploading={uploading}
            invError={invError}
            canUpload={Boolean(artistId)}
            onPick={() => fileInputRef.current?.click()}
            onRefreshList={() => listRegistered()}
            invoices={invoices}
          />
        </DashboardCard>

        {/* Registered Invoices Table */}
        <DashboardCard title="Registrierte Rechnungen">
          <RegisteredTable
            rows={registered}
            error={regError}
            fmtAmount={fmtAmount}
          />
        </DashboardCard>

        {/* Earnings Summary */}
        <DashboardCard title="Verdienst">
          <EarningsSummary
            month={{ total: monthTotal, count: monthCount }}
            year={{ total: yearTotal, count: yearCount }}
            error={error}
          />
        </DashboardCard>

        <p className="text-xs text-gray-500">
          Hinweis: Die Verdienstsummen basieren auf deiner angegebenen Gage (<code className="text-gray-400">artist_gage</code>) für akzeptierte Anfragen.
        </p>
      </div>
    </DashboardLayout>
  );
}
