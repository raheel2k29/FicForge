"use client";

import Link from "next/link";
import { useState } from "react";
import { KeyRound, Mail, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";

export default function ResetPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Please enter your account email address or username.");
      return;
    }

    setError(null);
    setIsLoading(true);

    // Simulate password recovery dispatch
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#050B16] text-white py-14 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-[#6D5DFB]/15 via-[#F97316]/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-[1040px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Column: Context & Steps */}
        <div className="lg:col-span-6 space-y-6">
          <span className="inline-flex items-center text-xs font-black tracking-widest uppercase text-[#F97316] bg-orange-500/10 border border-orange-500/30 rounded-full px-3.5 py-1.5">
            ACCOUNT RECOVERY
          </span>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Recover Access to Your Fic<span className="text-[#F97316]">Forge</span> Account
          </h1>

          <p className="text-base text-slate-300 leading-relaxed max-w-lg">
            Enter your registered email address or username. We will dispatch a secure recovery link so you can reset your password and return to your stories, library, and Sparks.
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#6D5DFB] to-[#F97316] flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                1
              </div>
              <div>
                <strong className="block text-sm font-bold text-white">Enter Account Details</strong>
                <span className="text-xs text-slate-400 leading-relaxed">
                  Provide the email address or username associated with your author or reader account.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#6D5DFB] to-[#F97316] flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                2
              </div>
              <div>
                <strong className="block text-sm font-bold text-white">Check Your Inbox</strong>
                <span className="text-xs text-slate-400 leading-relaxed">
                  Look for an email from FicForge security containing single-use reset instructions.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#6D5DFB] to-[#F97316] flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                3
              </div>
              <div>
                <strong className="block text-sm font-bold text-white">Set New Password & Return</strong>
                <span className="text-xs text-slate-400 leading-relaxed">
                  Choose a new password and immediately log in to access your Creator Workshop and bookmarks.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Reset Card */}
        <div className="lg:col-span-6">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
            
            {isSubmitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-950/30">
                  <CheckCircle2 className="h-8 w-8" />
                </div>

                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full inline-block">
                  RECOVERY LINK DISPATCHED
                </span>

                <h2 className="text-2xl font-black text-white tracking-tight">
                  Check Your Inbox
                </h2>

                <p className="text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
                  If an account is associated with <span className="font-bold text-white font-mono bg-white/10 px-2 py-0.5 rounded">{identifier}</span>, password reset instructions have been sent.
                </p>

                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-200/90 text-left">
                  <strong>Didn't receive the email?</strong>
                  <p className="mt-1 text-slate-400">
                    Be sure to check your spam/junk folder. If you still need assistance, visit our{" "}
                    <Link href="/support" className="text-amber-400 underline font-bold">
                      Support Center
                    </Link>.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-3">
                  <Link
                    href="/login"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] py-3.5 px-6 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/30 hover:opacity-95 transition-all text-center"
                  >
                    <span>Return to Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setIdentifier("");
                    }}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Send to a different email address
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#6D5DFB]/20 to-[#F97316]/20 border border-white/10 flex items-center justify-center text-[#F97316]">
                    <KeyRound className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">
                      Reset Password
                    </h2>
                    <p className="text-xs text-slate-400">
                      Enter your account username or email below.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs font-bold text-red-300">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Email Address or Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="e.g. author@ficforge.org or @username"
                        required
                        className="w-full rounded-xl border border-white/10 bg-slate-800/80 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#6D5DFB] focus:outline-none focus:ring-1 focus:ring-[#6D5DFB] transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] py-3.5 px-6 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/30 hover:opacity-95 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Verifying...
                      </span>
                    ) : (
                      <>
                        <span>Send Reset Link</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 font-bold text-slate-300 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                  </Link>

                  <Link
                    href="/register"
                    className="font-bold text-[#F97316] hover:text-orange-300 transition-colors"
                  >
                    Create Account →
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
