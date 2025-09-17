import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function SignUp() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSignUp triggered", { name, email, password });
    setLoading(true);
    setMessage(null);
    const { data, error } = await supabase.auth.signUp({
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
    } else {
      setMessage(t("signup.success"));
      setTimeout(() => {
        console.log("Navigating to /login after successful sign-up");
        navigate("/login");
      }, 3000);
    }
  };

  const handleGoogleSignUp = async () => {
    setMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/onboarding`,
        queryParams: { mode: "signup" },
      },
    });
    if (error) {
      console.error("Google sign-in error:", error);
      setMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pepe-black via-pepe-dark to-pepe-black relative">
      {/* Background particles and glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pepe-gold/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pepe-gold/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          
          {/* Info Section - Left Side */}
          <div className="lg:col-span-3 space-y-8">
            <div className="max-w-2xl">
              <h1 className="text-5xl lg:text-6xl font-bold text-pepe-white mb-6 leading-tight">
                {t("signup.info.title") || "Join Pepe Shows"}
              </h1>
              <p className="text-xl text-pepe-t80 mb-8 leading-relaxed">
                {t("signup.info.p1") || "Create your account and become part of Germany's leading entertainment agency."}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-pepe-surface/30 backdrop-blur-sm border border-pepe-line/30 rounded-xl p-6">
                  <div className="w-12 h-12 bg-pepe-gold/20 rounded-lg flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-pepe-gold rounded-sm"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-pepe-white mb-2">Performance Opportunities</h3>
                  <p className="text-pepe-t64 text-sm">Access exclusive gigs and performance opportunities across Germany</p>
                </div>
                
                <div className="bg-pepe-surface/30 backdrop-blur-sm border border-pepe-line/30 rounded-xl p-6">
                  <div className="w-12 h-12 bg-pepe-gold/20 rounded-lg flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-pepe-gold rounded-sm"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-pepe-white mb-2">Professional Network</h3>
                  <p className="text-pepe-t64 text-sm">Connect with fellow artists and industry professionals</p>
                </div>
              </div>
              
              <div className="border-l-4 border-pepe-gold pl-6">
                <p className="text-pepe-t80 italic">
                  {t("signup.info.p2") || "Join hundreds of artists who trust Pepe Shows to showcase their talents."}
                </p>
              </div>
            </div>
          </div>

          {/* Form Section - Right Side */}
          <div className="lg:col-span-2">
            <div className="bg-pepe-surface/60 backdrop-blur-xl border border-pepe-line/50 rounded-2xl p-8 shadow-2xl">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-pepe-gold to-pepe-gold/70 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 border-2 border-pepe-black rounded-lg"></div>
                </div>
                <h2 className="text-2xl font-bold text-pepe-white mb-2">
                  {t("signup.form.title") || "Create Account"}
                </h2>
                <p className="text-pepe-t64 text-sm">
                  Start your journey with Pepe Shows
                </p>
              </div>

              {/* Message Display */}
              {message && (
                <div className="mb-6 p-4 rounded-lg bg-pepe-gold/10 border border-pepe-gold/30">
                  <p className="text-sm text-pepe-gold text-center">{message}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSignUp} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-pepe-white mb-2">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder={t("signup.form.namePlaceholder") || "Enter your full name"}
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-pepe-black/50 border border-pepe-line text-pepe-white placeholder:text-pepe-t64 focus:border-pepe-gold focus:ring-1 focus:ring-pepe-gold rounded-lg px-4 py-3"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-pepe-white mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("signup.form.emailPlaceholder") || "Enter your email"}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-pepe-black/50 border border-pepe-line text-pepe-white placeholder:text-pepe-t64 focus:border-pepe-gold focus:ring-1 focus:ring-pepe-gold rounded-lg px-4 py-3"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-pepe-white mb-2">
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={t("signup.form.passwordPlaceholder") || "Create a secure password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-pepe-black/50 border border-pepe-line text-pepe-white placeholder:text-pepe-t64 focus:border-pepe-gold focus:ring-1 focus:ring-pepe-gold rounded-lg px-4 py-3"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-pepe-gold hover:bg-pepe-gold/90 text-pepe-black font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {loading ? t("signup.form.loading") || "Creating Account..." : t("signup.form.submit") || "Create Account"}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-pepe-line/30"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-pepe-surface text-pepe-t64">or</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleGoogleSignUp}
                    className="w-full bg-pepe-surface border border-pepe-line hover:bg-pepe-line text-pepe-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {t("signup.form.google") || "Continue with Google"}
                  </Button>
                </div>

                {/* Login Link */}
                <div className="text-center pt-6 border-t border-pepe-line/30">
                  <p className="text-sm text-pepe-t64">
                    {t("signup.form.already") || "Already have an account?"}{" "}
                    <a 
                      href="/login" 
                      className="text-pepe-gold hover:text-pepe-gold/80 font-medium transition-colors"
                    >
                      {t("signup.form.login") || "Sign in"}
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}