import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSupabase } from '@/lib/supabase';
import UploadSection from "./components/UploadSection";
import RegisteredTable from "./components/RegisteredTable";
import EarningsSummary from "./components/EarningsSummary";
// Konfiguration für den Storage-Bucket (default: invoices)
const INVOICE_BUCKET = import.meta.env.VITE_SUPABASE_INVOICES_BUCKET || 'invoices';

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

  const [uid, setUid] = useState<string | null>(null);
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

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const supabase = await getSupabase();
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (!mounted) return;
        setUid(data.user?.id ?? null);
      } catch (e) {
        console.error('❌ supabase.auth.getUser failed', e);
        if (mounted) setUid(null);
      }
    })();
    return () => { mounted = false; };
  }, []);

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

  // 3) Rechnungen aus dem Storage listen
  const listInvoices = async (aid: number) => {
    try {
      const supabase = await getSupabase();
      setInvError(null);
      if (!uid) throw new Error('Kein Supabase-User erkannt');
      const prefix = `user/${uid}`;
      const { data, error } = await supabase.storage
        .from(INVOICE_BUCKET)
        .list(prefix, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
      if (error) throw error;

      const items: InvoiceFile[] = [];
      for (const f of data || []) {
        const path = `${prefix}/${f.name}`;
        // signierte URL (1h) – für Private Buckets
        const { data: signed, error: signErr } = await supabase.storage
          .from(INVOICE_BUCKET)
          .createSignedUrl(path, 60 * 60);
        if (signErr) {
          console.warn('⚠️ createSignedUrl fehlgeschlagen, nutze publicUrl', signErr);
          const { data: pub } = supabase.storage.from(INVOICE_BUCKET).getPublicUrl(path);
          items.push({ name: f.name, url: pub.publicUrl, size: f.metadata?.size, created_at: f.created_at as any });
        } else {
          items.push({ name: f.name, url: signed.signedUrl, size: f.metadata?.size, created_at: f.created_at as any });
        }
      }
      setInvoices(items);
    } catch (e: any) {
      console.error('❌ list invoices failed', e);
      setInvError(e?.message || 'Rechnungen konnten nicht geladen werden');
    }
  };

  const listRegistered = async () => {
    try {
      setRegError(null);
      const supabase = await getSupabase();
      const baseUrl = import.meta.env.VITE_API_URL as string;
      const res = await fetch(`${baseUrl}/api/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 204) { setRegistered([]); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rows = (await res.json()) as RegisteredInvoice[];

      // try to map each storage_path to a temporary signed URL (if it belongs to this uid)
      if (uid) {
        const enriched: RegisteredInvoice[] = [];
        for (const r of rows) {
          const path = r.storage_path;
          if (path && path.startsWith(`user/${uid}/`)) {
            try {
              const { data: signed } = await supabase.storage
                .from(INVOICE_BUCKET)
                .createSignedUrl(path, 60 * 30);
              (r as any).signed_url = signed?.signedUrl;
            } catch {}
          }
          enriched.push(r);
        }
        setRegistered(enriched);
      } else {
        setRegistered(rows);
      }
    } catch (e: any) {
      console.error('❌ list registered invoices failed', e);
      setRegError(e?.message || 'Registrierte Rechnungen konnten nicht geladen werden');
    }
  };

  useEffect(() => {
    if (artistId && uid) {
      listInvoices(artistId);
      listRegistered();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artistId, uid]);

  // Upload-Handler (PDF oder Bild)
  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!artistId) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setInvError(null);
    try {
      const supabase = await getSupabase();
      if (!uid) throw new Error('Kein Supabase-User erkannt');
      const prefix = `user/${uid}`;
      const backendUrl = import.meta.env.VITE_API_URL as string;

      for (const file of Array.from(files)) {
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
        const path = `${prefix}/${safeName}`;

        const { error: upErr } = await supabase.storage
          .from(INVOICE_BUCKET)
          .upload(path, file, {
            contentType: file.type || (ext ? `application/${ext}` : 'application/octet-stream'),
            upsert: false,
          });
        if (upErr) throw upErr;

        // OPTIONAL: Rechnung im Backend registrieren (falls Endpoint vorhanden)
        try {
          await fetch(`${backendUrl}/api/invoices`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              storage_path: path,
              amount_cents: amount ? Math.round(parseFloat(amount.replace(',', '.')) * 100) : undefined,
              currency: 'EUR',
              invoice_date: invoiceDate || undefined,
              notes: note || undefined,
            }),
          });
        } catch (regErr) {
          console.warn('⚠️ Backend-Registrierung der Rechnung fehlgeschlagen (optional):', regErr);
        }
      }
      if (artistId) await listInvoices(artistId);
      await listRegistered();
      // optional: Felder zurücksetzen
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
    <div className="max-w-6xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">🧾 Money money money</h1>

      {/* Upload & Archiv */}
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
        onRefreshList={() => artistId && listInvoices(artistId)}
        invoices={invoices}
      />

      <RegisteredTable
        rows={registered}
        error={regError}
        fmtAmount={fmtAmount}
      />

      <EarningsSummary
        month={{ total: monthTotal, count: monthCount }}
        year={{ total: yearTotal, count: yearCount }}
        error={error}
      />

      <p className="text-xs text-gray-500 mt-6">
        Hinweis: Die Verdienstsummen basieren auf deiner angegebenen Gage (<code>artist_gage</code>) für akzeptierte Anfragen.
      </p>
    </div>
  );
}