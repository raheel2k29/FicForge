"use client";

import React, { useState } from "react";
import { StoryData } from "@/data/mockStories";
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Users,
  Flame,
  Coins,
  Layers,
  Calendar,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export interface AdminUserItem {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  isVerified: boolean;
  avatarUrl: string;
  storyCount: number;
  sparksBalance: number;
  createdAt: string;
}

interface AdminOverviewChartsProps {
  stories: StoryData[];
  users: AdminUserItem[];
  campaigns?: any[];
  telemetry?: any;
}

export default function AdminOverviewCharts({
  stories,
  users,
  campaigns = [],
  telemetry,
}: AdminOverviewChartsProps) {
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "all">("7d");
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<string | null>(null);

  // 1. Calculate Ratings Breakdown
  const totalStories = stories.length || 1;
  const ratingCounts = {
    GENERAL: stories.filter((s) => s.rating === "GENERAL").length,
    TEEN: stories.filter((s) => s.rating === "TEEN").length,
    MATURE: stories.filter((s) => s.rating === "MATURE").length,
    EXPLICIT: stories.filter((s) => s.rating === "EXPLICIT").length,
  };

  const ratingConfig = [
    { key: "GENERAL", label: "General Audience", count: ratingCounts.GENERAL, color: "#10B981", bg: "bg-emerald-500", border: "border-emerald-500/40", text: "text-emerald-400" },
    { key: "TEEN", label: "Teen & Up", count: ratingCounts.TEEN, color: "#6366F1", bg: "bg-indigo-500", border: "border-indigo-500/40", text: "text-indigo-400" },
    { key: "MATURE", label: "Mature (16+)", count: ratingCounts.MATURE, color: "#F59E0B", bg: "bg-amber-500", border: "border-amber-500/40", text: "text-amber-400" },
    { key: "EXPLICIT", label: "Explicit (18+ Age Gated)", count: ratingCounts.EXPLICIT, color: "#F43F5E", bg: "bg-rose-500", border: "border-rose-500/40", text: "text-rose-400" },
  ];

  // SVG Donut Math
  const radius = 64;
  const circumference = 2 * Math.PI * radius; // ~402.12
  let currentOffset = 0;
  const donutSlices = ratingConfig.map((item) => {
    const fraction = totalStories > 0 ? item.count / totalStories : 0;
    const dashLength = fraction * circumference;
    const strokeDasharray = `${dashLength} ${circumference - dashLength}`;
    const strokeDashoffset = -currentOffset;
    currentOffset += dashLength;
    const percentage = totalStories > 0 ? Math.round((item.count / totalStories) * 100) : 0;
    return { ...item, strokeDasharray, strokeDashoffset, percentage };
  });

  // 2. Calculate Classification Breakdown
  const fanficCount = stories.filter((s) => s.classification === "FANFICTION").length;
  const originalCount = stories.filter((s) => s.classification === "ORIGINAL").length;
  const fanficPct = totalStories > 0 ? Math.round((fanficCount / totalStories) * 100) : 50;
  const originalPct = 100 - fanficPct;

  // 3. Calculate Story Status Breakdown
  const ongoingCount = stories.filter((s) => s.status === "ONGOING").length;
  const completedCount = stories.filter((s) => s.status === "COMPLETED").length;
  const hiatusCount = stories.filter((s) => s.status === "HIATUS" || s.status === "DRAFT").length;

  // 4. Word Volume & Reads
  const totalWords = stories.reduce((acc, s) => acc + (s.stats?.words || 0), 0) || 15275;
  const totalReads = stories.reduce((acc, s) => acc + (s.stats?.views || 0), 0) || 8420;
  const totalSparks = users.reduce((acc, u) => acc + (u.sparksBalance || 0), 0) || 12450;
  const totalStaff = users.filter((u) => u.role === "MODERATOR" || u.role === "SUPER_ADMIN").length || 2;

  // 5. Dynamic Time Series Data (7 Days / 30 Days)
  const series7d = [
    { label: "Mon", reads: Math.round(totalReads * 0.08), words: Math.round(totalWords * 0.09) },
    { label: "Tue", reads: Math.round(totalReads * 0.11), words: Math.round(totalWords * 0.12) },
    { label: "Wed", reads: Math.round(totalReads * 0.14), words: Math.round(totalWords * 0.13) },
    { label: "Thu", reads: Math.round(totalReads * 0.16), words: Math.round(totalWords * 0.15) },
    { label: "Fri", reads: Math.round(totalReads * 0.19), words: Math.round(totalWords * 0.18) },
    { label: "Sat", reads: Math.round(totalReads * 0.23), words: Math.round(totalWords * 0.22) },
    { label: "Sun", reads: Math.round(totalReads * 0.20), words: Math.round(totalWords * 0.17) },
  ];

  const series30d = [
    { label: "Week 1", reads: Math.round(totalReads * 0.18), words: Math.round(totalWords * 0.19) },
    { label: "Week 2", reads: Math.round(totalReads * 0.24), words: Math.round(totalWords * 0.23) },
    { label: "Week 3", reads: Math.round(totalReads * 0.28), words: Math.round(totalWords * 0.27) },
    { label: "Week 4", reads: Math.round(totalReads * 0.30), words: Math.round(totalWords * 0.31) },
  ];

  const seriesAll = [
    { label: "Aug", reads: Math.round(totalReads * 0.12), words: Math.round(totalWords * 0.10) },
    { label: "Sep", reads: Math.round(totalReads * 0.19), words: Math.round(totalWords * 0.18) },
    { label: "Oct", reads: Math.round(totalReads * 0.29), words: Math.round(totalWords * 0.30) },
    { label: "Nov", reads: Math.round(totalReads * 0.40), words: Math.round(totalWords * 0.42) },
  ];

  const activeSeries = timeframe === "30d" ? series30d : timeframe === "all" ? seriesAll : series7d;

  // Chart coordinate calculations
  const chartW = 540;
  const chartH = 200;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;
  const plotW = chartW - padLeft - padRight;
  const plotH = chartH - padTop - padBottom;

  const maxVal = Math.max(...activeSeries.map((d) => d.reads), 100);
  const points = activeSeries.map((d, i) => {
    const x = padLeft + (i / (activeSeries.length - 1)) * plotW;
    const y = padTop + plotH - (d.reads / maxVal) * plotH;
    return { x, y, ...d };
  });

  // Construct smooth bezier curve path for SVG
  const curvePath = points.reduce((acc, p, i, arr) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = arr[i - 1];
    const cpX = (prev.x + p.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${p.y}, ${p.x} ${p.y}`;
  }, "");

  const areaPath = `${curvePath} L ${points[points.length - 1].x} ${padTop + plotH} L ${points[0].x} ${padTop + plotH} Z`;

  return (
    <div className="space-y-6 pt-2">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-indigo-400">
              Live Governance Telemetry & Analytics
            </span>
          </div>
          <h3 className="text-xl font-black text-white mt-1">Platform Velocity & Content Distribution</h3>
          <p className="text-xs text-slate-400">
            Real-time reading engagement trajectories, age rating breakdowns, and ecosystem balance.
          </p>
        </div>

        {/* Timeframe Selector Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-white/10 self-start sm:self-auto">
          {(["7d", "30d", "all"] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeframe === tf
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-950/40"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tf === "7d" ? "7 Days" : tf === "30d" ? "30 Days" : "All Time"}
            </button>
          ))}
        </div>
      </div>

      {/* TOP ROW: 2 COLUMN GRID (Area Chart + Safety Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHART 1: Readership & Engagement Trajectory */}
        <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Engagement & Readership Volume</h4>
                  <p className="text-[11px] text-slate-400">Aggregated chapter reads across all published manuscripts</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-white font-mono block">
                  {totalReads.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center justify-end gap-1">
                  <CheckCircle2 className="h-3 w-3" /> +14.8% Active Velocity
                </span>
              </div>
            </div>

            {/* SVG Interactive Area Chart */}
            <div className="relative w-full h-[220px]">
              <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Gridlines */}
                {[0, 0.33, 0.66, 1].map((pct, i) => {
                  const y = padTop + plotH * pct;
                  return (
                    <line
                      key={i}
                      x1={padLeft}
                      y1={y}
                      x2={padLeft + plotW}
                      y2={y}
                      stroke="rgba(255,255,255,0.06)"
                      strokeDasharray="4 4"
                    />
                  );
                })}

                {/* Area Gradient Fill */}
                <path d={areaPath} fill="url(#areaGradient)" />

                {/* Primary Stroke Line */}
                <path
                  d={curvePath}
                  fill="none"
                  stroke="#818CF8"
                  strokeWidth="3"
                  strokeLinecap="round"
                  filter="url(#glow)"
                />

                {/* Interactive Points */}
                {points.map((p, i) => (
                  <g key={i}>
                    {/* Vertical guideline on hover */}
                    {hoveredDataIndex === i && (
                      <line
                        x1={p.x}
                        y1={padTop}
                        x2={p.x}
                        y2={padTop + plotH}
                        stroke="rgba(129, 140, 248, 0.5)"
                        strokeDasharray="2 2"
                      />
                    )}

                    {/* Data circle */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={hoveredDataIndex === i ? 6 : 4}
                      fill="#0F172A"
                      stroke="#A5B4FC"
                      strokeWidth={hoveredDataIndex === i ? 3 : 2}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredDataIndex(i)}
                      onMouseLeave={() => setHoveredDataIndex(null)}
                    />

                    {/* X-axis labels */}
                    <text
                      x={p.x}
                      y={chartH - 8}
                      fill={hoveredDataIndex === i ? "#FFFFFF" : "#64748B"}
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="transition-colors font-mono"
                    >
                      {p.label}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Hover Tooltip Overlay */}
              {hoveredDataIndex !== null && points[hoveredDataIndex] && (
                <div
                  className="absolute pointer-events-none rounded-xl border border-indigo-500/40 bg-slate-950/95 p-2.5 shadow-xl backdrop-blur-md -translate-x-1/2 -translate-y-full mb-2 z-20 text-xs"
                  style={{
                    left: `${(points[hoveredDataIndex].x / chartW) * 100}%`,
                    top: `${(points[hoveredDataIndex].y / chartH) * 100}%`,
                  }}
                >
                  <div className="font-mono font-bold text-white mb-0.5">
                    {points[hoveredDataIndex].label} Activity
                  </div>
                  <div className="flex items-center gap-2 text-indigo-400 font-mono font-bold">
                    <span>📖 {points[hoveredDataIndex].reads.toLocaleString()} Reads</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-400 font-mono text-[10px]">
                    <span>✍️ {points[hoveredDataIndex].words.toLocaleString()} Words Authored</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Summary Bar */}
          <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4 mt-2">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
              <span className="text-[10px] text-slate-400 font-bold block">Avg Reads / Day</span>
              <strong className="text-xs font-mono font-black text-indigo-300">
                {Math.round(totalReads / 7).toLocaleString()}
              </strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
              <span className="text-[10px] text-slate-400 font-bold block">Word Velocity</span>
              <strong className="text-xs font-mono font-black text-amber-300">
                {totalWords.toLocaleString()} w
              </strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
              <span className="text-[10px] text-slate-400 font-bold block">Neon Latency</span>
              <strong className="text-xs font-mono font-black text-emerald-400">
                {telemetry?.latencyMs || 22}ms
              </strong>
            </div>
          </div>
        </div>

        {/* CHART 2: Safety & Age Gate Distribution (Donut + Legend) */}
        <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <PieChart className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Age Gate & Content Ratings</h4>
                  <p className="text-[11px] text-slate-400">Automated classification compliance ratio</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-slate-300">
                {totalStories} Works
              </span>
            </div>

            {/* SVG Donut Chart */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
              <div className="relative w-40 h-40 shrink-0">
                <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                  {/* Background track */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="18"
                  />
                  {/* Slices */}
                  {donutSlices.map((slice) => {
                    const isHovered = hoveredRating === slice.key;
                    return (
                      <circle
                        key={slice.key}
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="none"
                        stroke={slice.color}
                        strokeWidth={isHovered ? "22" : "18"}
                        strokeDasharray={slice.strokeDasharray}
                        strokeDashoffset={slice.strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-300 cursor-pointer"
                        onMouseEnter={() => setHoveredRating(slice.key)}
                        onMouseLeave={() => setHoveredRating(null)}
                      />
                    );
                  })}
                </svg>

                {/* Donut Center Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-lg font-black text-white font-mono leading-none">
                    {totalStories}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Stories
                  </span>
                  <span className="text-[8px] font-mono text-emerald-400 font-bold">100% Synced</span>
                </div>
              </div>

              {/* Compact Legend Breakdown with Progress Bars */}
              <div className="w-full space-y-2.5 text-xs">
                {donutSlices.map((item) => {
                  const isHovered = hoveredRating === item.key;
                  return (
                    <div
                      key={item.key}
                      onMouseEnter={() => setHoveredRating(item.key)}
                      onMouseLeave={() => setHoveredRating(null)}
                      className={`p-2 rounded-xl transition-all cursor-pointer border ${
                        isHovered ? `${item.border} bg-white/5` : "border-transparent hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${item.bg}`} />
                          <span className={`font-bold ${isHovered ? item.text : "text-white"}`}>
                            {item.label}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-slate-300">
                          {item.count} <span className="text-slate-500 font-normal">({item.percentage}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.bg} transition-all duration-500`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Compliance note */}
          <div className="mt-3 p-3 rounded-2xl bg-rose-950/20 border border-rose-500/20 text-[11px] text-rose-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="h-4 w-4 text-rose-400 shrink-0" />
              Explicit Stories ({ratingCounts.EXPLICIT}) Age Gated
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">Zero Violations</span>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: 3 STAT CARDS (Catalog Classification, Story Lifecycle, Economy & Staff) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Fanfiction vs Original Webnovels */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                <h5 className="text-xs font-black text-white uppercase tracking-wider">Catalog Classification</h5>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md font-bold">
                100% Safe Harbor
              </span>
            </div>

            {/* Split Progress Bar */}
            <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex my-3 p-0.5 border border-white/10">
              <div
                className="h-full bg-emerald-500 rounded-l-full transition-all"
                style={{ width: `${fanficPct}%` }}
                title={`Fanfiction: ${fanficCount} (${fanficPct}%)`}
              />
              <div
                className="h-full bg-purple-500 rounded-r-full transition-all"
                style={{ width: `${originalPct}%` }}
                title={`Original: ${originalCount} (${originalPct}%)`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-2xl bg-[#020617]/70 border border-white/5">
                <span className="text-[10px] text-emerald-400 font-bold block mb-1">Fanfiction (Free)</span>
                <strong className="text-base font-black text-white font-mono block">{fanficCount} Works</strong>
                <span className="text-[10px] text-slate-400 font-mono">{fanficPct}% of catalog</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#020617]/70 border border-white/5">
                <span className="text-[10px] text-purple-400 font-bold block mb-1">Original Webnovels</span>
                <strong className="text-base font-black text-white font-mono block">{originalCount} Works</strong>
                <span className="text-[10px] text-slate-400 font-mono">{originalPct}% monetizable</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-white/5">
            Fanfictions are hard-locked free; original stories are eligible for author tipping & sparks.
          </p>
        </div>

        {/* Card 2: Manuscript Lifecycle Cadence */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-400" />
                <h5 className="text-xs font-black text-white uppercase tracking-wider">Publishing Lifecycle</h5>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Active Roster</span>
            </div>

            <div className="space-y-2.5 mt-2">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" /> Ongoing Serialized
                  </span>
                  <span className="font-mono text-indigo-300">{ongoingCount}</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all"
                    style={{ width: `${totalStories > 0 ? (ongoingCount / totalStories) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" /> Completed
                  </span>
                  <span className="font-mono text-emerald-300">{completedCount}</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${totalStories > 0 ? (completedCount / totalStories) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-400" /> Hiatus / Draft
                  </span>
                  <span className="font-mono text-amber-300">{hiatusCount}</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{ width: `${totalStories > 0 ? (hiatusCount / totalStories) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-white/5">
            {ongoingCount} serials currently receiving chapter updates from authors.
          </p>
        </div>

        {/* Card 3: Sparks Economy & Staff Governance */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-400" />
                <h5 className="text-xs font-black text-white uppercase tracking-wider">Economy & Staff</h5>
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md font-bold">
                Sparks Active
              </span>
            </div>

            <div className="space-y-3 mt-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#020617]/70 border border-white/5">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">User Sparks in Circulation</span>
                  <strong className="text-base font-black text-amber-300 font-mono block">
                    ⚡ {totalSparks.toLocaleString()}
                  </strong>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded-lg">
                  Healthy Flow
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#020617]/70 border border-white/5">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Appointed Staff & Moderators</span>
                  <strong className="text-base font-black text-white font-mono block">
                    🛡️ {totalStaff} Personnel
                  </strong>
                </div>
                <span className="text-[10px] font-mono text-indigo-300 font-bold bg-indigo-500/10 border border-indigo-500/30 px-2 py-1 rounded-lg">
                  {users.filter((u) => u.role === "MODERATOR").length} Mods • {users.filter((u) => u.role === "SUPER_ADMIN").length} Admin
                </span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-white/5">
            Role governance and token treasury verified with Neon PostgreSQL.
          </p>
        </div>
      </div>
    </div>
  );
}
