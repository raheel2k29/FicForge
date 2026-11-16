"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { loginUserAsync, loginAsDemoUserAsync } from "@/lib/authStore";
import { Sparkles, ArrowRight, Lock, Mail, CheckCircle2, Shield } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/my-stories";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    await loginUserAsync(email.trim());
    router.push(redirectUrl);
  };

  const handleDemoUserLogin = async () => {
    setIsLoading(true);
    await loginAsDemoUserAsync();
    router.push(redirectUrl);
  };

  return (
    <div className="min-h-screen bg-[#050B16] text-white py-14 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-[1040px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left: Branding & Pitch (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <span className="inline-flex items-center text-xs font-black tracking-widest uppercase text-[#F97316] bg-orange-500/10 border border-orange-500/30 rounded-full px-3.5 py-1.5">
            WELCOME BACK
          </span>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Sign In to Fic<span className="text-[#F97316]">Forge</span>
          </h1>

          <p className="text-base text-slate-300 leading-relaxed max-w-lg">
            Return to your reading library, continue your story drafts in the Creator Workshop, or support your favorite authors.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#6D5DFB] to-[#F97316] flex items-center justify-center text-white font-black text-sm shrink-0">
                ✍️
              </div>
              <div>
                <strong className="text-sm font-bold text-white block">Creator Workshop Access</strong>
                <span className="text-xs text-slate-400">Write chapters, batch import manuscripts, and track reader engagement.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#6D5DFB] to-[#F97316] flex items-center justify-center text-white font-black text-sm shrink-0">
                📚
              </div>
              <div>
                <strong className="text-sm font-bold text-white block">Personal Saved Library</strong>
                <span className="text-xs text-slate-400">Sync bookmarks, reading progress, and followed authors across devices.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Login Form Card (6 cols) */}
        <div className="lg:col-span-6 rounded-3xl border border-white/10 bg-slate-900/95 p-8 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white">Sign In</h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter your FicForge account credentials below.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="writer@ficforge.org"
                  className="w-full h-11 rounded-xl border border-white/10 bg-[#020617] pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-[#6D5DFB]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <Link
                  href="/reset-password"
                  className="text-xs font-bold text-amber-400 hover:text-white"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 rounded-xl border border-white/10 bg-[#020617] pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-[#6D5DFB]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-white/20 bg-slate-900 text-[#6D5DFB] h-4 w-4"
              />
              <label htmlFor="remember" className="text-xs font-bold text-slate-400 cursor-pointer">
                Remember me on this browser
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] text-sm font-black text-white shadow-lg shadow-indigo-600/30 hover:from-[#5B4BE0] hover:to-[#6D5DFB] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              Sign In to FicForge <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* 1-Click Fast Testing Shortcut */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <button
              type="button"
              onClick={handleDemoUserLogin}
              className="w-full py-2.5 px-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>⚡ 1-Click Demo Login (Valerius Frost)</span>
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{" "}
            <Link href="/register" className="font-extrabold text-[#F97316] hover:underline">
              Create an Account
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050B16] flex items-center justify-center text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
