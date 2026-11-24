"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
  ExternalLink,
  Flag,
} from "lucide-react";

interface ReportStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  storySlug: string;
  storyTitle: string;
  chapterSlug?: string;
  chapterTitle?: string;
}

export default function ReportStoryModal({
  isOpen,
  onClose,
  storySlug,
  storyTitle,
  chapterSlug,
  chapterTitle,
}: ReportStoryModalProps) {
  const [reason, setReason] = useState<"COPYRIGHT" | "EXPLICIT_SAFETY" | "HARASSMENT" | "OTHER">(
    "COPYRIGHT"
  );
  const [claimantName, setClaimantName] = useState("");
  const [claimantEmail, setClaimantEmail] = useState("");
  const [originalWorkUrl, setOriginalWorkUrl] = useState("");
  const [description, setDescription] = useState("");
  const [digitalSignature, setDigitalSignature] = useState("");
  const [agreedToLegal, setAgreedToLegal] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTicketId, setSuccessTicketId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (reason === "COPYRIGHT" && !agreedToLegal) {
      setError("Please confirm the legal declaration before submitting a copyright notice.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storySlug,
          storyTitle,
          chapterSlug,
          claimantName,
          claimantEmail,
          reason,
          originalWorkUrl,
          description,
          digitalSignature: reason === "COPYRIGHT" ? digitalSignature : claimantName,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit report.");
      }

      setSuccessTicketId(data.ticketId);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccessTicketId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-[#0B1120] p-6 sm:p-8 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {successTicketId ? (
          /* SUCCESS SCREEN */
          <div className="py-8 text-center space-y-4">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-black text-white">Report Successfully Logged</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              Your takedown report has been officially logged in the FicForge DMCA Clearinghouse.
              Our moderation staff will review the complaint against statutory safe harbor procedures.
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 max-w-xs mx-auto">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Official Tracking ID
              </span>
              <strong className="text-base font-mono text-indigo-400 block mt-0.5">
                #{successTicketId.slice(-8).toUpperCase()}
              </strong>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-black text-white shadow-lg shadow-indigo-950/50 transition-all cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          /* REPORT FORM */
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldAlert className="h-4 w-4" /> Content Integrity & Copyright Desk
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Report Story or Claim Infringement
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Filing for: <strong className="text-slate-200">{storyTitle}</strong>
                {chapterTitle ? ` (Chapter: ${chapterTitle})` : ""}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Report Category */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1.5">
                  Select Reason for Report *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReason("COPYRIGHT")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      reason === "COPYRIGHT"
                        ? "border-rose-500 bg-rose-500/10 text-white shadow-md shadow-rose-950/40"
                        : "border-white/10 bg-slate-950/50 text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <span>🛡️</span> Copyright / Plagiarism
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      This is my original work copied without consent.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReason("EXPLICIT_SAFETY")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      reason === "EXPLICIT_SAFETY"
                        ? "border-amber-500 bg-amber-500/10 text-white shadow-md shadow-amber-950/40"
                        : "border-white/10 bg-slate-950/50 text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <span>🔞</span> Inappropriate / Misrated
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Underage mature themes or missing age warnings.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReason("HARASSMENT")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      reason === "HARASSMENT"
                        ? "border-indigo-500 bg-indigo-500/10 text-white shadow-md shadow-indigo-950/40"
                        : "border-white/10 bg-slate-950/50 text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <span>🚫</span> Harassment / Hate
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Targeted abuse, bullying, or hate speech.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReason("OTHER")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      reason === "OTHER"
                        ? "border-indigo-500 bg-indigo-500/10 text-white shadow-md shadow-indigo-950/40"
                        : "border-white/10 bg-slate-950/50 text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <span>⚠️</span> Other Violation
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Spam, commercial scams, or policy violations.
                    </p>
                  </button>
                </div>
              </div>

              {/* Complainant Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1">
                    Your Full Name / Pen Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={claimantName}
                    onChange={(e) => setClaimantName(e.target.value)}
                    placeholder="e.g. John Doe / Apex Legal"
                    className="w-full h-10 rounded-xl border border-white/10 bg-slate-950 px-3 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1">
                    Your Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={claimantEmail}
                    onChange={(e) => setClaimantEmail(e.target.value)}
                    placeholder="legal@yourdomain.com"
                    className="w-full h-10 rounded-xl border border-white/10 bg-slate-950 px-3 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              {/* If Copyright: Link to Original Work */}
              {reason === "COPYRIGHT" && (
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1">
                    Link to Original Authorized Publication *
                  </label>
                  <input
                    type="url"
                    required
                    value={originalWorkUrl}
                    onChange={(e) => setOriginalWorkUrl(e.target.value)}
                    placeholder="https://amazon.com/... or https://wattpad.com/... or personal site"
                    className="w-full h-10 rounded-xl border border-white/10 bg-slate-950 px-3 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500 transition-colors"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Provide a verifiable link demonstrating prior publication or ownership.
                  </span>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1">
                  Specific Infringement Details / Chapters *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain exactly which chapters or text passages were copied or how this violates platform rules..."
                  className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500 transition-colors resize-none"
                />
              </div>

              {/* If Copyright: Digital Signature & Perjury Acknowledgment */}
              {reason === "COPYRIGHT" && (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1">
                      Digital Signature (Type your full legal name) *
                    </label>
                    <input
                      type="text"
                      required
                      value={digitalSignature}
                      onChange={(e) => setDigitalSignature(e.target.value)}
                      placeholder="e.g. Johnathan Sterling"
                      className="w-full h-10 rounded-xl border border-white/10 bg-slate-950 px-3 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>

                  <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-950/60 border border-white/10 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={agreedToLegal}
                      onChange={(e) => setAgreedToLegal(e.target.checked)}
                      className="mt-0.5 rounded border-white/20 text-rose-500 focus:ring-0"
                    />
                    <span className="text-[11px] text-slate-400 leading-relaxed">
                      I have a good-faith belief that use of the material is not authorized by the copyright owner. I state under penalty of perjury that this notification is accurate.
                    </span>
                  </label>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-black text-white shadow-lg shadow-rose-950/50 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Flag className="h-3.5 w-3.5" />
                  {isSubmitting ? "Submitting Ticket..." : "Submit Formal Report"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
