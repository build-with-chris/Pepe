import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { getSupabase } from "@/lib/supabase";
import posthog from "@/lib/posthog";

export function Login({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { setUser, setToken } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleSignIn = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    console.log("handleSignIn triggered", { email, password });
    setLoading(true);
    const API = import.meta.env.VITE_API_URL;
    if (!API) {
      console.warn("VITE_API_URL is not set – requests will fail.");
    }
    try {
      // Authenticate with Supabase
      const sb = await getSupabase();
      const { data: signInData, error: signInError } = await sb.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        console.error("Supabase signIn error:", signInError);
        try { posthog.capture('login_failed', { stage: 'supabase', reason: signInError.message }); } catch {}
        alert("Login failed: " + signInError.message);
        return;
      }
      const session = signInData.session;
      const supUser = signInData.user;
      if (!session || !supUser) {
        throw new Error("No session or user returned from Supabase");
      }
      const token = session.access_token;
      // Verify Supabase JWT with backend
      const verifyRes = await fetch(`${API}/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Verify response:", verifyRes.status);
      const verifyJson = await verifyRes.json().catch(() => ({}));
      if (!verifyRes.ok) {
        console.error("Verify failed:", verifyJson);
        try { posthog.capture('login_failed', { stage: 'backend_verify', status: verifyRes.status, reason: (verifyJson && (verifyJson.message || verifyJson.error)) || 'verify_failed' }); } catch {}
        alert("Token verification failed");
        return;
      }

      // Update AuthContext with user identity
      setToken(token);
      setUser({
        sub: supUser.id,
        email: supUser.email || undefined,
        role: (supUser.app_metadata as any)?.role || undefined,
      });
      try {
        posthog.identify(supUser.id, {
          email: supUser.email ?? undefined,
          role: (supUser.app_metadata as any)?.role ?? undefined,
          sign_in_provider: (supUser.app_metadata as any)?.provider ?? undefined,
        });
        posthog.capture('login_success', { method: 'password' });
      } catch (e) {
        console.warn('PostHog identify/capture failed', e);
      }
      // Ensure an Artist row exists / is linked for this Supabase user
      try {
        const ensureRes = await fetch(`${API}/api/artists/me/ensure`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!ensureRes.ok) {
          const t = await ensureRes.text().catch(() => "");
          console.warn("/api/artists/me/ensure failed:", ensureRes.status, t);
        }
      } catch (e) {
        console.warn("ensure request error", e);
      }
      // Immediately verify that the artist is now resolvable
      let meOk = false;
      let me: any = null;
      try {
        const meRes = await fetch(`${API}/api/artists/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        meOk = meRes.ok;
        me = await meRes.json().catch(() => null);
        console.log("/api/artists/me status=", meRes.status, "json=", me);
      } catch (e) {
        console.warn("/api/artists/me request error", e);
      }
      try {
        posthog.capture(meOk ? 'artist_profile_loaded' : 'artist_profile_missing');
      } catch {}

      // Update user in AuthContext with backend admin flag so the UI can react immediately
      try {
        setUser({
          sub: supUser.id,
          email: supUser.email || undefined,
          role: (supUser.app_metadata as any)?.role || undefined,
          is_admin: Boolean(me?.is_admin),
        });
      } catch {}

      // Decide where to route after login based on database artists table
      const role = (supUser.app_metadata as any)?.role;
      const isAdmin = Boolean(me?.is_admin || role === 'admin');

      console.log('User type check:', {
        userEmail: supUser.email,
        userRole: role,
        backendUser: me,
        isAdmin,
        hasBackendProfile: Boolean(me)
      });

      if (!meOk || !me) {
        alert("Dein Profil konnte nicht geladen werden. Bitte versuche es erneut oder kontaktiere den Support.");
        const sb = await getSupabase();
        await sb.auth.signOut();
        return;
      }

      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        // Artist user - redirect to profile
        navigate('/profile');
      }
    } catch (err) {
      console.error("handleSignIn exception:", err);
      try { posthog.capture('login_exception', { message: err instanceof Error ? err.message : String(err) }); } catch {}
      alert("Unexpected error during login: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (
    e?: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>
  ) => {
    if (e && typeof (e as any).preventDefault === 'function') {
      (e as any).preventDefault();
    }
    if (oauthLoading) return;
    setOauthLoading(true);
    try {
      try { posthog.capture('oauth_start', { provider: 'google', mode: 'login' }); } catch {}
      const sb = await getSupabase();
      const { error } = await sb.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
          queryParams: { mode: 'login' },
        },
      });
      if (error) {
        console.error('Google OAuth error:', error);
        try { posthog.capture('login_failed', { stage: 'oauth', provider: 'google', reason: error.message }); } catch {}
        alert('Google Login failed: ' + error.message);
        setOauthLoading(false);
      }
      // On success, Supabase will redirect to the provided URL; no further action needed here.
    } catch (err) {
      console.error('handleGoogleLogin exception:', err);
      try { posthog.capture('login_exception', { provider: 'google', message: err instanceof Error ? err.message : String(err) }); } catch {}
      alert('Unexpected error during Google login: ' + (err instanceof Error ? err.message : String(err)));
      setOauthLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className={cn("w-full max-w-md mx-auto", className)} {...props}>
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2 pb-6">
            <CardTitle className="text-2xl font-bold text-white">Admin & Artist Login</CardTitle>
            <CardDescription className="text-gray-400">
              Login with your Google account or email/password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              type="button"
              variant="outline"
              className="w-full border-white/20 bg-white hover:bg-white/90 text-black"
              onClick={handleGoogleLogin}
              disabled={loading || oauthLoading}
            >
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              Login with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900 px-2 text-gray-400">Or continue with</span>
              </div>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  data-ph-no-capture
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  className="bg-black/40 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  data-ph-no-capture
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="bg-black/40 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading || oauthLoading}
              >
                {loading ? "Signing in..." : "Login"}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-400">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline">
                Sign up
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
      </div>
    </div>
  );
}
