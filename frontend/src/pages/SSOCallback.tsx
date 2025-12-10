import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function SSOCallback() {
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        // Redirect to profile after successful OAuth
        navigate('/profil', { replace: true });
      } else {
        // Something went wrong, redirect to login
        navigate('/anmelden', { replace: true });
      }
    }
  }, [isLoaded, isSignedIn, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--pepe-black)' }}
    >
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-[#D4A574] animate-spin mx-auto mb-4" />
        <p className="text-white text-lg">Anmeldung wird verarbeitet...</p>
      </div>
    </div>
  );
}
