import { SignIn } from "@clerk/clerk-react";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { Sparkles } from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate("/profil");
    }
  }, [isLoaded, isSignedIn, navigate]);

  return (
    <div className="min-h-screen flex" style={{ background: '#0A0A0A' }}>
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4A574]/20 via-transparent to-purple-900/20" />

        {/* Animated Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#D4A574]/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12">
          <div className="max-w-md text-center">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D4A574] to-[#B8956A] flex items-center justify-center shadow-2xl shadow-[#D4A574]/25">
                <Sparkles className="w-10 h-10 text-black" />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-white mb-4">
              Willkommen bei<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A574] to-[#E6B887]">
                Pepe Shows
              </span>
            </h1>

            <p className="text-gray-400 text-lg leading-relaxed">
              Die Plattform für professionelle Künstler und Entertainer.
              Verwalte dein Profil, deine Verfügbarkeit und deine Auftritte.
            </p>

            {/* Features List */}
            <div className="mt-10 space-y-4 text-left">
              {[
                "Professionelles Künstlerprofil",
                "Verfügbarkeitskalender",
                "Buchungsanfragen verwalten",
                "Direkte Kommunikation"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-300">
                  <div className="w-2 h-2 rounded-full bg-[#D4A574]" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden pt-8 px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-[#D4A574] hover:text-[#E6B887] transition-colors">
            <Sparkles className="w-6 h-6" />
            <span className="font-semibold">Pepe Shows</span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-2xl font-bold text-white mb-2">Anmelden</h2>
              <p className="text-gray-400">
                Melde dich an, um auf dein Künstler-Dashboard zuzugreifen.
              </p>
            </div>

            {/* Clerk SignIn */}
            <SignIn
              appearance={{
                baseTheme: dark,
                variables: {
                  colorPrimary: "#D4A574",
                  colorBackground: "#1A1A1A",
                  colorInputBackground: "#0F0F0F",
                  colorInputText: "#FFFFFF",
                  colorTextOnPrimaryBackground: "#000000",
                  colorTextSecondary: "#9CA3AF",
                  borderRadius: "0.75rem",
                },
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none p-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all duration-200",
                  socialButtonsBlockButtonText: "text-white font-medium",
                  socialButtonsProviderIcon: "brightness-0 invert",
                  dividerLine: "bg-white/10",
                  dividerText: "text-gray-500 text-sm",
                  formFieldLabel: "text-gray-300 font-medium",
                  formFieldInput: "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#D4A574] focus:ring-[#D4A574]/20 transition-all duration-200",
                  formButtonPrimary: "bg-gradient-to-r from-[#D4A574] to-[#B8956A] hover:from-[#E6B887] hover:to-[#D4A574] text-black font-semibold transition-all duration-200 shadow-lg shadow-[#D4A574]/25",
                  footerActionLink: "text-[#D4A574] hover:text-[#E6B887] font-medium",
                  identityPreviewText: "text-white",
                  identityPreviewEditButton: "text-[#D4A574] hover:text-[#E6B887]",
                  formFieldInputShowPasswordButton: "text-gray-400 hover:text-white",
                  otpCodeFieldInput: "bg-white/5 border-white/10 text-white",
                  footer: "hidden",
                  formFieldAction: "text-[#D4A574] hover:text-[#E6B887]",
                  alert: "bg-red-500/10 border border-red-500/30 text-red-300",
                  alertText: "text-red-300",
                },
              }}
              routing="path"
              path="/anmelden"
              signUpUrl="/registrieren"
            />

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                Noch kein Konto?{" "}
                <Link to="/registrieren" className="text-[#D4A574] hover:text-[#E6B887] font-medium transition-colors">
                  Jetzt registrieren
                </Link>
              </p>
            </div>

            {/* Back to Home */}
            <div className="mt-6 text-center">
              <Link to="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                ← Zurück zur Startseite
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
