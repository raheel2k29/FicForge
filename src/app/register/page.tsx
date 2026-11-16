"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginUser } from "@/lib/authStore";
import { Sparkles, ArrowRight, Lock, Mail, User, ShieldCheck, Check } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !username.trim()) return;

    loginUser(email.trim(), username.trim());
    router.push("/my-stories");
  };

  return (
    <div className="min-h-screen bg-[#050B16] text-white py-14 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-[1040px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left: Branding & Pitch (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <span className="inline-flex items-center text-xs font-black tracking-widest uppercase text-[#F97316] bg-orange-500/10 border border-orange-500/30 rounded-full px-3.5 py-1.5">
            JOIN THE FORGE
          </span>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Create Your Fic<span className="text-[#F97316]">Forge</span> Account
          </h1>

          <p className="text-base text-slate-300 leading-relaxed max-w-lg">
            Join a story-first publishing community. Save stories, follow rising creators, or forge and serialize your own fiction.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                ✓
              </div>
              <span>Free, ad-free reading across all fanfiction & original webnovels.</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                ✓
              </div>
              <span>Creator Workshop with single-click bulk manuscript importer.</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                ✓
              </div>
              <span>Safe Harbor compliant fanfiction and author rights protected.</span>
            </div>
          </div>
        </div>

        {/* Right: Registration Form Card (6 cols) */}
        <div className="lg:col-span-6 rounded-3xl border border-white/10 bg-slate-900/95 p-8 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white">Create Account</h2>
            <p className="text-xs text-slate-400 mt-1">
              Choose your writer username and email to get started.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. ValeriusFrost"
                  className="w-full h-11 rounded-xl border border-white/10 bg-[#020617] pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-[#6D5DFB]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full h-11 rounded-xl border border-white/10 bg-[#020617] pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-[#6D5DFB]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full h-11 rounded-xl border border-white/10 bg-[#020617] pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-[#6D5DFB]"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-white/20 bg-slate-900 text-[#6D5DFB] h-4 w-4"
              />
              <label htmlFor="terms" className="text-xs text-slate-400 leading-relaxed cursor-pointer">
                I agree to FicForge's{" "}
                <Link href="/terms-of-service" className="text-slate-200 underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/content-policy" className="text-slate-200 underline">
                  Content Policy
                </Link>
                .
              </label>
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#6D5DFB] via-[#7C3AED] to-[#F97316] text-sm font-black text-white shadow-lg shadow-indigo-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              Create My Account <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="font-extrabold text-[#F97316] hover:underline">
              Sign in here
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
