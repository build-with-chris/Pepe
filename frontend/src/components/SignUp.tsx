import { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";

const inputClassName = "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#D4A574]/50 focus:ring-[#D4A574]/20";

export default function SignUp() {
  const { signUp, isLoaded, setActive } = useSignUp();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setLoading(true);
    setError("");

    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      console.error("Sign up error:", err);
      setError(err.errors?.[0]?.message || "Registrierung fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setLoading(true);
    setError("");

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/kuenstler-richtlinien");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.errors?.[0]?.message || "Verifizierung fehlgeschlagen. Bitte überprüfe den Code.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!isLoaded || !signUp) return;

    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/kuenstler-richtlinien",
      });
    } catch (err: any) {
      console.error("Google sign up error:", err);
      setError("Google Registrierung fehlgeschlagen");
    }
  };

  // Verification screen
  if (pendingVerification) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-12"
        style={{ background: 'var(--pepe-black)' }}
      >
        <Card className="w-full max-w-md bg-[#1A1A1A]/80 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-[#D4A574]/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-[#D4A574]" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              E-Mail bestätigen
            </CardTitle>
            <CardDescription className="text-gray-400">
              Wir haben einen Code an <span className="text-white">{email}</span> gesendet
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleVerification} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="code" className="text-gray-300">
                  Bestätigungscode
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className={cn(inputClassName, "text-center text-2xl tracking-widest")}
                  maxLength={6}
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#D4A574] hover:bg-[#E6B887] text-black font-semibold py-6 rounded-xl transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifizieren...
                  </>
                ) : (
                  "E-Mail bestätigen"
                )}
              </Button>

              <p className="text-center text-gray-400 text-sm">
                Keinen Code erhalten?{" "}
                <button
                  type="button"
                  onClick={async () => {
                    if (signUp) {
                      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
                    }
                  }}
                  className="text-[#D4A574] hover:text-[#E6B887] font-medium transition-colors"
                >
                  Erneut senden
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Registration form
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'var(--pepe-black)' }}
    >
      <Card className="w-full max-w-md bg-[#1A1A1A]/80 backdrop-blur-xl border-white/10 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-white">
            Konto erstellen
          </CardTitle>
          <CardDescription className="text-gray-400">
            Werde Teil unserer Künstler-Community
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Google Sign Up */}
          <Button
            type="button"
            variant="outline"
            className="w-full bg-white hover:bg-gray-100 text-black border-0 font-medium py-6"
            onClick={handleGoogleSignUp}
            disabled={loading}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Mit Google registrieren
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#1A1A1A] px-2 text-gray-500">
                oder mit E-Mail
              </span>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-300">
                  Vorname
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Max"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClassName}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-300">
                  Nachname
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Mustermann"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClassName}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                E-Mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="deine@email.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClassName}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Passwort
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(inputClassName, "pr-10")}
                  required
                  disabled={loading}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Mindestens 8 Zeichen
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#D4A574] hover:bg-[#E6B887] text-black font-semibold py-6 rounded-xl transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrieren...
                </>
              ) : (
                "Konto erstellen"
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Mit der Registrierung akzeptierst du unsere{" "}
              <Link to="/agb" className="text-[#D4A574] hover:underline">
                AGB
              </Link>{" "}
              und{" "}
              <Link to="/datenschutz" className="text-[#D4A574] hover:underline">
                Datenschutzrichtlinien
              </Link>
            </p>
          </form>

          <p className="text-center text-gray-400 text-sm">
            Bereits registriert?{" "}
            <Link
              to="/anmelden"
              className="text-[#D4A574] hover:text-[#E6B887] font-medium transition-colors"
            >
              Jetzt anmelden
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
