"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, Heart, Zap, Sparkles, X, ArrowRight, Lock, UserPlus } from "lucide-react";
import { loginAsDemoReader, loginAsDemoCreator } from "@/lib/authStore";

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  actionType?: "bookmark" | "like" | "tip" | "general";
  redirectUrl?: string;
}

export default function AuthRequiredModal({
  isOpen,
  onClose,
  title = "Sign In Required",
  description = "You must have an account to save stories to your personal library, track your reading history, and sync across all your devices.",
  actionType = "bookmark",
  redirectUrl = "/login",
}: AuthRequiredModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleQuickReader = () => {
    loginAsDemoReader();
    onClose();
    window.location.reload();
  };

  const handleQuickCreator = () => {
    loginAsDemoCreator();
    onClose();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-white">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon Header */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#6D5DFB]/20 via-purple-500/20 to-[#F97316]/20 border border-white/10 text-white mb-5 shadow-lg shadow-indigo-600/20">
          {actionType === "bookmark" ? (
            <Bookmark className="h-7 w-7 text-[#A78BFA] fill-[#A78BFA]/30" />
          ) : actionType === "like" ? (
            <Heart className="h-7 w-7 text-rose-400 fill-rose-400/30" />
          ) : actionType === "tip" ? (
            <Zap className="h-7 w-7 text-amber-400 fill-amber-400" />
          ) : (
            <Lock className="h-7 w-7 text-[#F97316]" />
          )}
        </div>

        {/* Title & Copy */}
        <div className="text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#F97316] bg-orange-500/10 border border-orange-500/30 rounded-full px-3 py-1">
            ACCOUNT REQUIRED
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-3">
            {title}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Main Auth Actions */}
        <div className="mt-6 space-y-2.5">
          <Link
            href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] py-3 px-4 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-indigo-600/30 hover:from-[#5B4BE0] hover:to-[#6D5DFB] transition-all"
          >
            <span>Sign In to Existing Account</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/register"
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-slate-800/80 hover:bg-slate-700/80 py-3 px-4 text-xs sm:text-sm font-bold text-slate-200 hover:text-white transition-all"
          >
            <UserPlus className="h-4 w-4 text-[#F97316]" />
            <span>Create Free Account</span>
          </Link>
        </div>

        {/* Review Testing Helper */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <span className="block text-[11px] font-bold text-slate-400 mb-2">
            🧪 Fast Testing Shortcut:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleQuickReader}
              className="py-2 px-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-[11px] font-bold text-blue-300 hover:bg-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>📖 Sign In (Reader)</span>
            </button>
            <button
              type="button"
              onClick={handleQuickCreator}
              className="py-2 px-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-[11px] font-bold text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>✍️ Sign In (Creator)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
