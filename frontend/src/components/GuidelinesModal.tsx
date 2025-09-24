import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "react-router-dom";

interface GuidelinesModalProps {
  openInitially?: boolean;
  onAccepted?: () => void;
}

export default function GuidelinesModal({ openInitially, onAccepted }: GuidelinesModalProps) {
  const [open, setOpen] = React.useState(false);
  const [checked, setChecked] = React.useState(false);
  const { token } = useAuth();
  const location = useLocation();

  React.useEffect(() => {
    // Open if explicitly requested via prop
    if (openInitially) {
      setOpen(true);
      return;
    }
    // Open if "?guidelines=1" is in the URL
    const qs = new URLSearchParams(location.search);
    if (qs.get('guidelines') === '1') {
      setOpen(true);
    }
    // Listen for a global trigger
    const handler = () => setOpen(true);
    window.addEventListener('artist:show-guidelines', handler as EventListener);
    return () => window.removeEventListener('artist:show-guidelines', handler as EventListener);
  }, [openInitially, location.search]);

  const accept = async () => {
    try {
      await fetch('/api/artists/me/accept_guidelines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ok: true }),
      });
    } catch (e) {
      console.warn('Failed to POST accept_guidelines:', e);
    } finally {
      setOpen(false);
      try { window.dispatchEvent(new Event('artist:guidelines-accepted')); } catch {}
      if (onAccepted) onAccepted();
    }
  };
  const later = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl sm:max-w-2xl text-left">
        <DialogHeader>
          <DialogTitle>Willkommen bei PepeShows 🎪</DialogTitle>
          <DialogDescription className="text-black">
            Ein kurzer Überblick, wie die Plattform funktioniert – deine Rechte und unsere Standards.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md bg-white border border-gray-300 p-3 text-sm text-black">
          <strong>Kurz gesagt:</strong> Fair, sicher, transparent. Du entscheidest über Anfragen &amp; Gagen,
          wir kümmern uns um Matching, Vertrag &amp; Support. Medien bleiben deine – wir nutzen sie nur zur Bewerbung.
          Bitte antworte innerhalb von <strong>24–48 h</strong> und beachte Sicherheits‑/Venue‑Regeln.
        </div>

        <ScrollArea className="max-h-[50vh] rounded-md border border-gray-300 p-4 space-y-4">
          {/* … (deine Abschnitte wie schon gebaut) … */}
          <div className="text-xs text-black">
            Vollständige Bedingungen: <a href="/artist-guidelines" className="underline">/artist‑guidelines</a>
          </div>
        </ScrollArea>

        <div className="flex items-start gap-3 pt-2">
          <Checkbox id="agree" checked={checked} onCheckedChange={(v) => setChecked(Boolean(v))} />
          <label htmlFor="agree" className="text-sm text-black select-none">
            Ich habe die Plattform‑Regeln gelesen und akzeptiere sie.
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={later}>Später lesen</Button>
          <Button onClick={accept} disabled={!checked}>Akzeptieren &amp; weiter</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}