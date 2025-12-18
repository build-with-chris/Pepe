import { SignIn } from "@clerk/clerk-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { useAuth } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";

const Buhnenzauber = lazy(() => import('./Buhnenzauber'));

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn, isLoaded } = useAuth();

  // Determine the current path for Clerk routing
  const currentPath = location.pathname.startsWith("/login") ? "/login" : "/anmelden";
  const signUpPath = currentPath === "/login" ? "/signup" : "/registrieren";

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate("/profil");
    }
  }, [isLoaded, isSignedIn, navigate]);

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: '#0A0A0A' }}>
      {/* Particle Backdrop */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Suspense fallback={null}>
          <Buhnenzauber />
        </Suspense>
      </div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 relative z-10">
        <div className="w-full max-w-[420px]">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <img
              src="/logos/SVG/PEPE_logos_shows.svg"
              alt="Pepe Shows"
              className="h-24 w-auto"
            />
          </div>

          {/* Header */}
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-white mb-3">Anmelden</h2>
            <p className="text-gray-400 text-base leading-relaxed">
              Melde dich an, um auf dein Künstler-Dashboard zuzugreifen.
            </p>
          </div>

          {/* Clerk SignIn */}
          <SignIn
            appearance={{
              baseTheme: dark,
              variables: {
                colorPrimary: "#D4A574",
                colorBackground: "transparent",
                colorInputBackground: "#0F0F0F",
                colorInputText: "#FFFFFF",
                colorTextOnPrimaryBackground: "#000000",
                colorTextSecondary: "#9CA3AF",
                borderRadius: "0.75rem",
              },
              elements: {
                rootBox: "w-full flex justify-center",
                card: "!bg-transparent shadow-none p-0 border-none w-full",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all duration-200 py-3",
                socialButtonsBlockButtonText: "text-white font-medium",
                socialButtonsProviderIcon: "brightness-0 invert",
                dividerLine: "bg-white/10",
                dividerText: "text-gray-500 text-sm py-4",
                formFieldRow: "mb-5",
                formFieldLabel: "text-gray-300 font-medium mb-2 text-sm",
                formFieldInput: "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#D4A574] focus:ring-[#D4A574]/20 transition-all duration-200 py-3 px-4 text-base",
                formButtonPrimary: "bg-gradient-to-r from-[#D4A574] to-[#B8956A] hover:from-[#E6B887] hover:to-[#D4A574] text-black font-semibold transition-all duration-200 shadow-lg shadow-[#D4A574]/25 py-3 mt-2",
                footerActionLink: "text-[#D4A574] hover:text-[#E6B887] font-medium",
                identityPreviewText: "text-white",
                identityPreviewEditButton: "text-[#D4A574] hover:text-[#E6B887]",
                formFieldInputShowPasswordButton: "text-gray-400 hover:text-white",
                otpCodeFieldInput: "bg-white/5 border-white/10 text-white",
                footer: "hidden",
                formFieldAction: "text-[#D4A574] hover:text-[#E6B887]",
                alert: "bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-xl mb-4",
                alertText: "text-red-300",
              },
            }}
            routing="path"
            path={currentPath}
            signUpUrl={signUpPath}
          />

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500">
              Noch kein Konto?{" "}
              <Link to={signUpPath} className="text-[#D4A574] hover:text-[#E6B887] font-medium transition-colors">
                Jetzt registrieren
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link to="/" className="text-gray-500 hover:text-gray-300 transition-colors">
              ← Zurück zur Startseite
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
