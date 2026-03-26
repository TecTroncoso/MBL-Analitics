// MLBB Rank mapping based on /api/academy/ranks data (all 29 tiers)
// Maps rank_level (1-9999) to rank name and icon

interface RankTier {
  name: string;
  subdivision: string;
  icon: string;
  start: number;
  end: number;
}

// Complete data from https://mlbb-stats.rone.dev/api/academy/ranks?size=50
const RANK_TIERS: RankTier[] = [
  // Warrior (勇士)
  { name: "Warrior", subdivision: "Ⅲ", start: 1, end: 4, icon: "https://akmweb.youngjoygame.com/web/gms/image/e8659ed5040a378701beca13ebdc4fba.png" },
  { name: "Warrior", subdivision: "Ⅱ", start: 5, end: 7, icon: "https://akmweb.youngjoygame.com/web/gms/image/e8659ed5040a378701beca13ebdc4fba.png" },
  { name: "Warrior", subdivision: "Ⅰ", start: 8, end: 10, icon: "https://akmweb.youngjoygame.com/web/gms/image/e8659ed5040a378701beca13ebdc4fba.png" },
  // Elite (精英)
  { name: "Elite", subdivision: "Ⅲ", start: 11, end: 15, icon: "https://akmweb.youngjoygame.com/web/gms/image/a59c039465d5f17165243026c42b9d2c.png" },
  { name: "Elite", subdivision: "Ⅱ", start: 16, end: 20, icon: "https://akmweb.youngjoygame.com/web/gms/image/a59c039465d5f17165243026c42b9d2c.png" },
  { name: "Elite", subdivision: "Ⅰ", start: 21, end: 25, icon: "https://akmweb.youngjoygame.com/web/gms/image/a59c039465d5f17165243026c42b9d2c.png" },
  // Master (大师)
  { name: "Master", subdivision: "Ⅳ", start: 26, end: 30, icon: "https://akmweb.youngjoygame.com/web/gms/image/ca966487da98a5e2732f4c56a05f33d2.png" },
  { name: "Master", subdivision: "Ⅲ", start: 31, end: 35, icon: "https://akmweb.youngjoygame.com/web/gms/image/ca966487da98a5e2732f4c56a05f33d2.png" },
  { name: "Master", subdivision: "Ⅱ", start: 36, end: 40, icon: "https://akmweb.youngjoygame.com/web/gms/image/ca966487da98a5e2732f4c56a05f33d2.png" },
  { name: "Master", subdivision: "Ⅰ", start: 41, end: 45, icon: "https://akmweb.youngjoygame.com/web/gms/image/ca966487da98a5e2732f4c56a05f33d2.png" },
  // Grandmaster (宗师)
  { name: "Grandmaster", subdivision: "Ⅴ", start: 46, end: 51, icon: "https://akmweb.youngjoygame.com/web/gms/image/d5e6df23d867833a204b82e44836bd8a.png" },
  { name: "Grandmaster", subdivision: "Ⅳ", start: 52, end: 57, icon: "https://akmweb.youngjoygame.com/web/gms/image/d5e6df23d867833a204b82e44836bd8a.png" },
  { name: "Grandmaster", subdivision: "Ⅲ", start: 58, end: 63, icon: "https://akmweb.youngjoygame.com/web/gms/image/d5e6df23d867833a204b82e44836bd8a.png" },
  { name: "Grandmaster", subdivision: "Ⅱ", start: 64, end: 69, icon: "https://akmweb.youngjoygame.com/web/gms/image/d5e6df23d867833a204b82e44836bd8a.png" },
  { name: "Grandmaster", subdivision: "Ⅰ", start: 70, end: 75, icon: "https://akmweb.youngjoygame.com/web/gms/image/d5e6df23d867833a204b82e44836bd8a.png" },
  // Epic (史诗)
  { name: "Epic", subdivision: "Ⅴ", start: 76, end: 81, icon: "https://akmweb.youngjoygame.com/web/gms/image/c9aaf42eb6c6f759d13b1d4da35335b7.png" },
  { name: "Epic", subdivision: "Ⅳ", start: 82, end: 87, icon: "https://akmweb.youngjoygame.com/web/gms/image/c9aaf42eb6c6f759d13b1d4da35335b7.png" },
  { name: "Epic", subdivision: "Ⅲ", start: 88, end: 93, icon: "https://akmweb.youngjoygame.com/web/gms/image/c9aaf42eb6c6f759d13b1d4da35335b7.png" },
  { name: "Epic", subdivision: "Ⅱ", start: 94, end: 99, icon: "https://akmweb.youngjoygame.com/web/gms/image/c9aaf42eb6c6f759d13b1d4da35335b7.png" },
  { name: "Epic", subdivision: "Ⅰ", start: 100, end: 105, icon: "https://akmweb.youngjoygame.com/web/gms/image/c9aaf42eb6c6f759d13b1d4da35335b7.png" },
  // Legend (传奇)
  { name: "Legend", subdivision: "Ⅴ", start: 106, end: 111, icon: "https://akmweb.youngjoygame.com/web/gms/image/c1aa051fd25d3b88b7b2b9ac145b2b52.png" },
  { name: "Legend", subdivision: "Ⅳ", start: 112, end: 117, icon: "https://akmweb.youngjoygame.com/web/gms/image/c1aa051fd25d3b88b7b2b9ac145b2b52.png" },
  { name: "Legend", subdivision: "Ⅲ", start: 118, end: 123, icon: "https://akmweb.youngjoygame.com/web/gms/image/c1aa051fd25d3b88b7b2b9ac145b2b52.png" },
  { name: "Legend", subdivision: "Ⅱ", start: 124, end: 129, icon: "https://akmweb.youngjoygame.com/web/gms/image/c1aa051fd25d3b88b7b2b9ac145b2b52.png" },
  { name: "Legend", subdivision: "Ⅰ", start: 130, end: 135, icon: "https://akmweb.youngjoygame.com/web/gms/image/c1aa051fd25d3b88b7b2b9ac145b2b52.png" },
  // Mythic (神话)
  { name: "Mythic", subdivision: "", start: 136, end: 160, icon: "https://akmweb.youngjoygame.com/web/gms/image/641379610654942449fa3d5cf633d38c.png" },
  // Mythical Honor (百战神话)
  { name: "Mythical Honor", subdivision: "", start: 161, end: 185, icon: "https://akmweb.youngjoygame.com/web/gms/image/078ee96145da945b0cbbb8e2a48ca7c9.png" },
  // Mythical Glory (至尊神话)
  { name: "Mythical Glory", subdivision: "", start: 186, end: 235, icon: "https://akmweb.youngjoygame.com/web/gms/image/acc8347c7284e6d9caa09d3b3f8e0948.png" },
  // Glorious Mythic (荣耀神话)
  { name: "Glorious Mythic", subdivision: "", start: 236, end: 9999, icon: "https://akmweb.youngjoygame.com/web/gms/image/191257b84f57be74430d1964c4b01c8b.png" },
];

// Color scheme for each rank tier
const RANK_COLORS: Record<string, string> = {
  "Warrior": "#8B6914",
  "Elite": "#4169E1",
  "Master": "#9370DB",
  "Grandmaster": "#FFD700",
  "Epic": "#E040FB",
  "Legend": "#FF6347",
  "Mythic": "#FF4444",
  "Mythical Honor": "#FF2222",
  "Mythical Glory": "#FF0000",
  "Glorious Mythic": "#FF0000",
};

export function getRankInfo(rankLevel: number): {
  name: string;
  fullName: string;
  icon: string;
  color: string;
} {
  if (!rankLevel || rankLevel <= 0) {
    return { name: "Unranked", fullName: "Unranked", icon: "", color: "#666" };
  }

  const tier = RANK_TIERS.find(t => rankLevel >= t.start && rankLevel <= t.end);

  if (!tier) {
    return { name: "Unranked", fullName: "Unranked", icon: "", color: "#666" };
  }

  const fullName = tier.subdivision ? `${tier.name} ${tier.subdivision}` : tier.name;
  const color = RANK_COLORS[tier.name] || "#FFF";
  return { name: tier.name, fullName, icon: tier.icon, color };
}
