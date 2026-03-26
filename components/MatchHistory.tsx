"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { mlbbApi } from "@/lib/mlbb-api";
import { Loader2, ChevronDown, ChevronUp, Swords, Shield } from "lucide-react";

interface MatchDetailPlayer {
  f: number; // team flag: 1 = Team A, 2 = Team B
  hid: number;
  rid: number;
  zid: number;
  k: number;
  d: number;
  a: number;
  s: number;
  mvp: number;
  o: number; // damage dealt
  op: number; // damage %
  tfr: number; // team fight rate
  bd: number; // battle duration
  hlvl: number;
  rname: string;
  its_e: Array<{ id: number; n: string; ix: string; i2x: string }>;
  hid_e: { id: number; n: string; ix: string; i2x: string };
}

function MatchDetailPanel({ matchId, sid }: { matchId: string; sid: number }) {
  const [details, setDetails] = useState<MatchDetailPlayer[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    
    mlbbApi
      .getMatchDetails(matchId, sid)
      .then((res: any) => {
        if (cancelled) return;
        const payload = res.data?.data || res.data;
        const players: MatchDetailPlayer[] = Array.isArray(payload)
          ? payload
          : payload?.result || payload?.list || [];
        setDetails(players);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setError(err.message || "Failed to load details");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [matchId, sid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-gaming-accent mr-2" />
        <span className="text-sm text-gray-400">Loading match details...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-4 text-sm text-red-400">{error}</div>;
  }

  if (!details || details.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-gray-500">
        No detailed data available for this match.
      </div>
    );
  }

  // Get battle duration from first player
  const battleDuration = details[0]?.bd || 0;
  const durationMins = Math.floor(battleDuration / 60);
  const durationSecs = battleDuration % 60;

  // Split into two teams
  const teamA = details.filter((p) => p.f === 1);
  const teamB = details.filter((p) => p.f === 2);

  const TeamTable = ({
    players,
    label,
    color,
  }: {
    players: MatchDetailPlayer[];
    label: string;
    color: string;
  }) => (
    <div>
      <div className={`flex items-center gap-2 mb-3 text-sm font-semibold ${color}`}>
        {label === "Your Team" ? <Shield className="w-4 h-4" /> : <Swords className="w-4 h-4" />}
        {label}
      </div>
      <div className="space-y-2">
        {players.map((p, idx) => (
          <div
            key={`${p.rid}-${idx}`}
            className="flex items-center gap-3 bg-black/30 rounded-lg p-2.5 border border-gaming-border/50"
          >
            {/* Hero icon */}
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-gaming-border shrink-0 relative">
              <Image
                src={p.hid_e?.ix || p.hid_e?.i2x || ""}
                alt={p.hid_e?.n || "Hero"}
                width={40}
                height={40}
                className="object-cover w-full h-full"
                unoptimized
              />
              {p.mvp === 1 && (
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[7px] font-bold px-1 rounded uppercase leading-tight">
                  MVP
                </div>
              )}
            </div>

            {/* Hero name & role */}
            <div className="w-20 shrink-0 min-w-0">
              <div className="text-sm font-semibold text-white truncate">
                {p.hid_e?.n || "Unknown"}
              </div>
              <div className="text-[10px] text-gray-500 truncate">
                {p.rname || `Lv.${p.hlvl || "?"}`}
              </div>
            </div>

            {/* KDA */}
            <div className="w-20 text-center shrink-0">
              <div className="text-sm font-bold text-white">
                {p.k}/{p.d}/{p.a}
              </div>
              <div className="text-[10px] text-gray-500">Score: {p.s}</div>
            </div>

            {/* Damage */}
            <div className="w-16 text-center shrink-0 hidden sm:block">
              <div className="text-xs font-medium text-orange-400">
                {p.o ? (p.o / 1000).toFixed(1) + "k" : "—"}
              </div>
              <div className="text-[10px] text-gray-500">DMG</div>
            </div>

            {/* Items */}
            <div className="flex flex-wrap gap-1 flex-1 min-w-0 justify-end">
              {(p.its_e || []).filter(Boolean).slice(0, 6).map((item, iIdx) => (
                <div
                  key={`${item?.id ?? 'item'}-${iIdx}`}
                  className="w-7 h-7 rounded overflow-hidden border border-gaming-border/50 bg-gaming-bg/50"
                  title={item?.n || ""}
                >
                  <Image
                    src={item?.ix || item?.i2x || ""}
                    alt={item?.n || "Item"}
                    width={28}
                    height={28}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                </div>
              ))}
              {/* Fill empty slots */}
              {Array.from({ length: Math.max(0, 6 - ((p.its_e || []).filter(Boolean).length)) }).map((_, eIdx) => (
                <div
                  key={`empty-${eIdx}`}
                  className="w-7 h-7 rounded border border-gaming-border/30 bg-gaming-bg/30"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mt-3 p-4 bg-gaming-bg/50 border border-gaming-border/50 rounded-xl space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Match Duration: {durationMins}:{durationSecs.toString().padStart(2, "0")}</span>
        <span>{details.length} Players</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TeamTable players={teamA} label="Your Team" color="text-blue-400" />
        <TeamTable players={teamB} label="Enemy Team" color="text-red-400" />
      </div>
    </div>
  );
}

export function MatchHistory({ matches = [] }: { matches?: any[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!matches || matches.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
          Recent Matches
        </h3>
        <div className="bg-gaming-card border border-gaming-border rounded-xl p-8 text-center">
          <p className="text-gray-500">
            No recent matches found. Play some matches or make your profile public.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
        Recent Matches
      </h3>

      {matches.map((match: any, idx: number) => {
        const isWin =
          match.result === "Victory" || match.result === "Win" || match.isWin;
        const isExpanded = expandedId === (match.id || idx).toString();

        return (
          <div key={`${match.id || "match"}-${idx}`}>
            <div
              className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border-l-4 border-y border-r transition-colors ${
                isWin
                  ? "border-l-gaming-win border-y-gaming-border border-r-gaming-border bg-gaming-win-bg hover:bg-gaming-win/10"
                  : "border-l-gaming-loss border-y-gaming-border border-r-gaming-border bg-gaming-loss-bg hover:bg-gaming-loss/10"
              } ${isExpanded ? "rounded-b-none" : ""}`}
            >
              {/* Match Info */}
              <div className="w-24 shrink-0">
                <div
                  className={`font-bold ${
                    isWin ? "text-gaming-win" : "text-gaming-loss"
                  }`}
                >
                  {match.result || (isWin ? "Victory" : "Defeat")}
                </div>
                <div className="text-xs text-gray-400">
                  {match.type || "Ranked"}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {match.timeAgo || "Recently"}
                </div>
              </div>

              {/* Hero Info */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gaming-border">
                    <Image
                      src={
                        match.hero?.image ||
                        `https://picsum.photos/seed/${
                          match.hero?.name || "hero"
                        }/100/100`
                      }
                      alt={match.hero?.name || "Hero"}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  </div>
                  {match.mvp && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                      MVP
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {match.hero?.name || "Unknown"}
                  </div>
                </div>
              </div>

              {/* KDA */}
              <div className="w-32 text-center shrink-0">
                <div className="font-bold text-white tracking-wide">
                  {match.kda || "0/0/0"}
                </div>
                <div className="text-xs text-gray-500">KDA</div>
              </div>

              {/* Score */}
              <div className="flex-1 text-center hidden sm:block">
                <div className="text-sm font-medium text-gaming-accent">
                  {match.score || "—"}
                </div>
                <div className="text-xs text-gray-500">Score</div>
              </div>

              {/* Details Button */}
              <div className="shrink-0 w-full sm:w-auto text-right">
                <button
                  onClick={() =>
                    setExpandedId(
                      isExpanded ? null : (match.id || idx).toString()
                    )
                  }
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-gaming-bg hover:bg-white/5 border border-gaming-border rounded-lg text-sm font-medium text-gray-300 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      Hide <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      Details <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Expandable details panel */}
            {isExpanded && (
              <MatchDetailPanel
                matchId={match.bid_s || match.id?.toString()}
                sid={match.sid || 0}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
