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

      // Decide where to route after login
      const role = (supUser.app_metadata as any)?.role;
      const isAdmin = Boolean(me?.is_admin) || role === 'admin';
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        if (!meOk) {
          alert("Dein Profil konnte nicht geladen werden. Bitte versuche es erneut oder kontaktiere den Support.");
        }
        // Show Artist Guidelines once after admin approval, on next login
        const approved = !!(me && (me.approved === true || me.isApproved === true || me.status === 'approved'));
        const guidelinesAccepted = !!(me && (me.guidelinesAccepted === true || me.guidelinesAccepted === 1 || me.guidelines_accepted === true || me.guidelines_accepted === 1));
        if (approved && !guidelinesAccepted) {
          // Open the modal on the profile page via query param and custom event
          navigate('/profile?guidelines=1');
          try { window.dispatchEvent(new Event('artist:show-guidelines')); } catch {}
        } else {
          navigate('/profile');
        }
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
    <div className={cn("flex flex-col gap-6 w-full md:max-w-screen-md mx-auto", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Login for Artists</CardTitle>
          <CardDescription>
            Login with your Apple or Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="" onSubmit={handleSignIn}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading || oauthLoading}>
                  Login with Google
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    data-ph-no-capture
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    data-ph-no-capture
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
                <Button type="submit" className="w-full mt-2" disabled={loading || oauthLoading}>
                  Login
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
