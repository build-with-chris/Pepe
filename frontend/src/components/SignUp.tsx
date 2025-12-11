import { SignUp as ClerkSignUp } from "@clerk/clerk-react";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { Sparkles, Users, Calendar, Star } from "lucide-react";

export function SignUp() {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate("/profil");
    }
  }, [isLoaded, isSignedIn, navigate]);

  return (
    <div className="min-h-screen flex" style={{ background: '#0A0A0A' }}>
      {/* Left Side - Signup Form */}
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
              <h2 className="text-2xl font-bold text-white mb-2">Konto erstellen</h2>
              <p className="text-gray-400">
                Registriere dich, um Teil unserer Künstler-Community zu werden.
              </p>
            </div>

            {/* Clerk SignUp */}
            <ClerkSignUp
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
              path="/registrieren"
              signInUrl="/anmelden"
            />

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                Bereits ein Konto?{" "}
                <Link to="/anmelden" className="text-[#D4A574] hover:text-[#E6B887] font-medium transition-colors">
                  Jetzt anmelden
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

      {/* Right Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-bl from-purple-900/20 via-transparent to-[#D4A574]/20" />

        {/* Animated Orbs */}
        <div className="absolute top-32 right-20 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#D4A574]/30 rounded-full blur-3xl animate-pulse delay-1000" />

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
              Werde Teil von<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A574] to-[#E6B887]">
                Pepe Shows
              </span>
            </h1>

            <p className="text-gray-400 text-lg leading-relaxed">
              Erstelle dein Profil und erreiche neue Kunden für deine Shows und Auftritte.
            </p>

            {/* Benefits */}
            <div className="mt-10 grid grid-cols-1 gap-4">
              {[
                { icon: Users, title: "Netzwerk", desc: "Verbinde dich mit Veranstaltern" },
                { icon: Calendar, title: "Buchungen", desc: "Verwalte deine Termine einfach" },
                { icon: Star, title: "Bewertungen", desc: "Baue deinen Ruf auf" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 text-left">
                  <div className="w-10 h-10 rounded-lg bg-[#D4A574]/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-[#D4A574]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
      </div>
    </div>
  );
}

export default SignUp;
