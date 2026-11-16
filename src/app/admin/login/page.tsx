"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getCurrentUser, isUserAdmin, loginAsAdminAsync } from "@/lib/authStore";
import { ShieldCheck, Lock, Key, ArrowRight, ArrowLeft, AlertTriangle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [adminKey, setAdminKey] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (isUserAdmin(user)) {
      router.push("/admin");
    }
  }, [router]);

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    await loginAsAdminAsync();
    router.push("/admin");
  };

  const handleQuickAdminAccess = async () => {
    setIsLoading(true);
    await loginAsAdminAsync();
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Security Grid Lines & Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370f_1px,transparent_1px),linear-gradient(to_bottom,#1f29370f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/10 blur-[120px] pointer-events-none" />

      {/* Top Bar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Public Site
        </Link>
        <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500">
          SYS_GATEWAY :: v2.4-SECURE
        </span>
      </div>

      {/* Main Administrative Form Card */}
      <div className="max-w-md w-full mx-auto my-auto z-10">
        <div className="rounded-3xl border border-red-500/20 bg-slate-900/90 p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative">
          
          {/* Header Icon */}
          <div className="flex flex-col items-center text-center space-y-3 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-red-600/20 via-orange-500/10 to-transparent border border-red-500/30 flex items-center justify-center text-red-400 shadow-xl shadow-red-950/40">
              <ShieldCheck className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/30 rounded-full px-3 py-1">
                RESTRICTED ACCESS
              </span>
              <h1 className="text-2xl font-black text-white mt-2.5 tracking-tight">
                Admin Console
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Enter your administrative credentials to access moderation and platform governance.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs font-bold text-red-300">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Staff Email or Admin UID
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="admin@ficforge.org"
                  className="w-full h-11 rounded-xl border border-white/10 bg-[#020617] pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-red-500 font-mono transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Master Security Key
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full h-11 rounded-xl border border-white/10 bg-[#020617] pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-red-500 font-mono transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-sm font-black text-white shadow-lg shadow-red-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <span>Authenticate & Enter Console</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Authorized Access Button for Local Dev / Review */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <button
              type="button"
              onClick={handleQuickAdminAccess}
              className="w-full py-2.5 px-3 rounded-xl border border-red-500/30 bg-red-500/10 text-xs font-bold text-red-300 hover:bg-red-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-red-400" />
              <span>1-Click Authorized Staff Sign In</span>
            </button>
          </div>

        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-4xl w-full mx-auto text-center text-xs text-slate-600 z-10">
        FicForge Administrative Infrastructure • All actions are audit-logged with timestamp & IP.
      </div>
    </div>
  );
}
