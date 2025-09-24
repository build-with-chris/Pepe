

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-2xl mb-2">Seite nicht gefunden</p>
      <p className="text-gray-400 mb-6">Du wirst gleich zur Startseite weitergeleitet...</p>
      <div className="animate-bounce text-4xl">🎪</div>
    </div>
  );
}