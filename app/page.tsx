"use client";

import { useState, useEffect } from "react";
import { ProfileHeader } from "@/components/ProfileHeader";
import { StatsOverview } from "@/components/StatsOverview";
import { MatchHistory } from "@/components/MatchHistory";
import { Login } from "@/components/Login";
import { mlbbApi } from "@/lib/mlbb-api";
import { Loader2 } from "lucide-react";

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [userMatches, setUserMatches] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("mlbb_token");
    const userId = localStorage.getItem("mlbb_user_id");
    
    if (token && userId) {
      mlbbApi.setToken(token);
      setIsAuthenticated(true);
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // First fetch user info and seasons
      const [infoRes, seasonsRes] = await Promise.allSettled([
        mlbbApi.getUserInfo(),
        mlbbApi.getUserSeasons()
      ]);

      if (infoRes.status === "fulfilled" && infoRes.value.data) {
        setUserData(infoRes.value.data.data || infoRes.value.data);
      }

      let latestSeasonId = 0;
      if (seasonsRes.status === "fulfilled" && seasonsRes.value.data) {
        const sids = seasonsRes.value.data.sids || (seasonsRes.value.data.data && seasonsRes.value.data.data.sids) || [];
        if (sids.length > 0) {
          const maxSid = Math.max(...sids.map(Number));
          if (!isNaN(maxSid)) {
            latestSeasonId = maxSid;
          }
        }
      }

      // Fetch stats and matches using the latest season ID, and fetch `sid=0` as a fallback
      const [statsRes, matchesResLatest, matchesResZero] = await Promise.allSettled([
        mlbbApi.getUserStats(),
        mlbbApi.getUserMatches(latestSeasonId, 20),
        mlbbApi.getUserMatches(0, 20)
      ]);

      console.log("statsRes:", statsRes);
      console.log("matchesResLatest:", matchesResLatest);
      console.log("matchesResZero:", matchesResZero);

      if (statsRes.status === "fulfilled" && statsRes.value.data) {
        setUserStats(statsRes.value.data.data || statsRes.value.data);
      }
      
      let finalMatchesRes = matchesResLatest;
      
      // Define a helper to extract matches
      const extractMatches = (res: any) => {
        if (res.status !== "fulfilled" || !res.value.data) return [];
        const payload = res.value.data.data || res.value.data;
        if (Array.isArray(payload)) return payload;
        if (payload && typeof payload === 'object') {
          if (Array.isArray(payload.list)) return payload.list;
          if (Array.isArray(payload.records)) return payload.records;
          if (Array.isArray(payload.matches)) return payload.matches;
          if (Array.isArray(payload.result)) return payload.result;
          if (Array.isArray(payload.data)) return payload.data;
        }
        return [];
      };

      let matchesList = extractMatches(matchesResLatest);
      
      // If latest season has no matches, fallback to sid=0
      if (matchesList.length === 0) {
        matchesList = extractMatches(matchesResZero);
        finalMatchesRes = matchesResZero;
      }
      
      setUserMatches(matchesList);
      
      // Temporarily store raw API response in a window variable for debugging via console
      if (typeof window !== 'undefined') {
        (window as any).__DEBUG_MATCHES = {
           latestSeasonId,
           matchesResLatest: matchesResLatest.status === 'fulfilled' ? matchesResLatest.value : null,
           matchesResZero: matchesResZero.status === 'fulfilled' ? matchesResZero.value : null,
           extractedCount: matchesList.length
        };
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (token: string, userId: string) => {
    localStorage.setItem("mlbb_token", token);
    localStorage.setItem("mlbb_user_id", userId);
    mlbbApi.setToken(token);
    setIsAuthenticated(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-gaming-accent" suppressHydrationWarning />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Format data for components if we have real data, otherwise fallback to empty structures
  const formattedUser = userData ? {
    name: userData.name || "Player",
    server: userData.zoneId || "",
    avatar: userData.avatar || "",
    level: userData.level || 1,
    rank: {
      tier: userData.rank_level ? `Rank Level ${userData.rank_level}` : "Unranked",
      points: 0,
      icon: ""
    }
  } : null;

  const actualStats = userStats?.stats || userStats;
  const formattedStats = actualStats ? {
    wins: actualStats.wc || 0,
    losses: (actualStats.tc || 0) - (actualStats.wc || 0),
    winRate: actualStats.tc ? ((actualStats.wc / actualStats.tc) * 100).toFixed(1) : 0,
    totalMatches: actualStats.tc || 0,
    kda: actualStats.as ? actualStats.as.toFixed(1) : "0.0", // Using average score as KDA approximation if KDA is not available
    kills: 0, // Not provided directly in overall stats
    deaths: 0,
    assists: 0,
    killParticipation: 0, // Not provided directly
    mvp: actualStats.mvpc || 0
  } : null;

  // Extract top heroes from the highlights
  const topHeroesList = [];
  const actualHighlights = userStats?.highlights || userStats;
  if (actualHighlights) {
    if (actualHighlights.mo) topHeroesList.push({ ...actualHighlights.mo, highlight: "Most Played" });
    if (actualHighlights.hk) topHeroesList.push({ ...actualHighlights.hk, highlight: "Highest Kills" });
    if (actualHighlights.ms) topHeroesList.push({ ...actualHighlights.ms, highlight: "Highest Score" });
  }

  const formattedTopHeroes = topHeroesList.slice(0, 3).map((hero: any) => ({
    id: hero.hid,
    name: hero.n,
    image: hero.ix || hero.i2x,
    role: hero.highlight,
    winRate: 0, // Not provided in highlight
    kda: "0.0", // Not provided in highlight
    matches: 0 // Not provided in highlight
  }));

  const formattedMatches = userMatches.map((match: any) => {
    // Format timestamp to "time ago"
    const matchDate = new Date(match.ts * 1000);
    const now = new Date();
    const diffMs = now.getTime() - matchDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    let timeAgo = "Recently";
    if (diffDays > 0) timeAgo = `${diffDays}d ago`;
    else if (diffHours > 0) timeAgo = `${diffHours}h ago`;
    else if (diffMins > 0) timeAgo = `${diffMins}m ago`;

    return {
      id: match.bid,
      bid_s: match.bid_s,
      sid: match.sid || 0,
      result: match.res === 1 ? "Victory" : "Defeat",
      isWin: match.res === 1,
      type: match.lid === 5 ? "Ranked" : "Classic",
      timeAgo: timeAgo,
      duration: "00:00",
      hero: {
        name: match.hid_e?.n || match.hid_e?.name || "Unknown",
        image: match.hid_e?.ix || match.hid_e?.i2x || match.hid_e?.icon || ""
      },
      mvp: match.mvp === 1,
      score: match.s || 0,
      kda: `${match.k || 0}/${match.d || 0}/${match.a || 0}`,
    };
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <button 
          onClick={() => {
            localStorage.removeItem("mlbb_token");
            localStorage.removeItem("mlbb_user_id");
            mlbbApi.logout();
            setIsAuthenticated(false);
            setUserData(null);
          }}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>
      
      {formattedUser && <ProfileHeader user={formattedUser} />}
      {formattedStats && <StatsOverview stats={formattedStats} topHeroes={formattedTopHeroes} />}
      <MatchHistory matches={formattedMatches} />
    </div>
  );
}
