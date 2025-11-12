import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getSupabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import posthog from "@/lib/posthog";

export default function SignUp() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSignUp triggered", { name, email, password });
    setLoading(true);
    setMessage(null);
    try {
      const sb = await getSupabase();
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            name: name
          }
        }
      });
      console.log("Supabase signUp result:", { data, error });
      setLoading(false);
      if (error) {
        setMessage(error.message);
        try { posthog.capture('signup_failed', { reason: error.message }); } catch {}
      } else {
        setMessage(t("signup.success"));
        try { posthog.capture('signup_success', { method: 'email' }); } catch {}
        setTimeout(() => {
          console.log("Navigating to /login after successful sign-up");
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      console.error("handleSignUp exception:", err);
      setMessage("Unexpected error during signup");
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (oauthLoading) return;
    setOauthLoading(true);
    setMessage(null);
    try {
      try { posthog.capture('oauth_start', { provider: 'google', mode: 'signup' }); } catch {}
      const sb = await getSupabase();
      const { error } = await sb.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
          queryParams: { mode: "signup" },
        },
      });
      if (error) {
        console.error("Google sign-in error:", error);
        setMessage(error.message);
        try { posthog.capture('signup_failed', { stage: 'oauth', provider: 'google', reason: error.message }); } catch {}
        setOauthLoading(false);
      }
    } catch (err) {
      console.error("handleGoogleSignUp exception:", err);
      setMessage("Unexpected error during Google signup");
      setOauthLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="w-full max-w-md mx-auto">
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2 pb-6">
            <CardTitle className="text-2xl font-bold text-white">
              {t("signup.form.title") || "Create your account"}
            </CardTitle>
            <CardDescription className="text-gray-400">
              Sign up to manage your bookings and performances
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              type="button"
              variant="outline"
              className="w-full border-white/20 bg-white hover:bg-white/90 text-black"
              onClick={handleGoogleSignUp}
              disabled={loading || oauthLoading}
            >
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              {t("signup.form.google") || "Sign up with Google"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900 px-2 text-gray-400">Or continue with email</span>
              </div>
            </div>

            {message && (
              <div className={`text-sm text-center p-3 rounded-lg ${
                message.includes('success') || message.includes('erfolgreich')
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  {t("signup.form.namePlaceholder") || "Full Name"}
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-black/40 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  {t("signup.form.emailPlaceholder") || "Email"}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/40 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  {t("signup.form.passwordPlaceholder") || "Password"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/40 border-white/20 text-white placeholder:text-gray-500"
                  minLength={6}
                />
                <p className="text-xs text-gray-500">
                  Must be at least 6 characters
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || oauthLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? t("signup.form.loading") || "Creating account..." : t("signup.form.submit") || "Create account"}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-400">
              {t("signup.form.already") || "Already have an account?"}{" "}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline">
                {t("signup.form.login") || "Login"}
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-500 mt-6">
          By continuing, you agree to our{" "}
          <Link to="/terms" className="underline underline-offset-4 hover:text-gray-400">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline underline-offset-4 hover:text-gray-400">
            Privacy Policy
          </Link>
        </div>

        {/* Info Section Below */}
        <div className="mt-12 p-6 border border-white/10 rounded-lg bg-white/5 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-4">
            {t("signup.info.benefitsTitle") || "Why join us?"}
          </h3>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{t("signup.info.benefits.li1") || "Manage all your bookings in one place"}</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{t("signup.info.benefits.li2") || "Track your performance schedule"}</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{t("signup.info.benefits.li3") || "Access to exclusive opportunities"}</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{t("signup.info.benefits.li4") || "Direct communication with clients"}</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{t("signup.info.benefits.li5") || "Professional support from our team"}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
