import { mlbbApi } from "@/lib/mlbb-api";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default async function LeaderboardsPage() {
  let rankData = [];
  try {
    const response = await mlbbApi.getHeroRank();
    rankData = response.data?.records || [];
    if (!Array.isArray(rankData)) {
      rankData = [];
    }
  } catch (error) {
    console.error("Failed to fetch hero ranks:", error);
  }

  // Sort data for different leaderboards
  const topWinRate = [...rankData].sort((a, b) => (b.data?.main_hero_win_rate || 0) - (a.data?.main_hero_win_rate || 0)).slice(0, 10);
  const topPickRate = [...rankData].sort((a, b) => (b.data?.main_hero_appearance_rate || 0) - (a.data?.main_hero_appearance_rate || 0)).slice(0, 10);
  const topBanRate = [...rankData].sort((a, b) => (b.data?.main_hero_ban_rate || 0) - (a.data?.main_hero_ban_rate || 0)).slice(0, 10);

  const renderList = (title: string, data: any[], valueKey: string, format: (val: number) => string, colorClass: string) => (
    <div className="bg-gaming-card border border-gaming-border rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      <div className="space-y-4">
        {data.map((hero: any, idx: number) => {
          const heroData = hero.data?.main_hero?.data || {};
          const imageUrl = heroData.head || `https://picsum.photos/seed/${heroData.name || 'hero'}/100/100`;
          const value = hero.data?.[valueKey] || 0;

          return (
            <div key={`${heroData.name || 'hero'}-${idx}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
              <div className="text-xl font-bold text-gray-500 w-6 text-center">
                {idx + 1}
              </div>
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gaming-bg shrink-0">
                <Image 
                  src={imageUrl} 
                  alt={heroData.name || 'Hero'} 
                  width={48} 
                  height={48} 
                  className="object-cover w-full h-full"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold truncate">{heroData.name || 'Unknown'}</div>
              </div>
              <div className={`font-bold ${colorClass}`}>
                {format(value)}
              </div>
            </div>
          );
        })}
        {data.length === 0 && (
          <div className="text-center text-gray-500 py-4">No data available</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Global Leaderboards</h1>
        <p className="text-gray-400">Top heroes across different metrics based on live MLBB data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderList("Highest Win Rate", topWinRate, "main_hero_win_rate", (v) => `${(v * 100).toFixed(2)}%`, "text-gaming-win")}
        {renderList("Most Picked", topPickRate, "main_hero_appearance_rate", (v) => `${(v * 100).toFixed(2)}%`, "text-blue-400")}
        {renderList("Most Banned", topBanRate, "main_hero_ban_rate", (v) => `${(v * 100).toFixed(2)}%`, "text-gaming-loss")}
      </div>
    </div>
  );
}
