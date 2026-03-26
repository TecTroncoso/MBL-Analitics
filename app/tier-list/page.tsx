import { mlbbApi } from "@/lib/mlbb-api";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default async function TierListPage() {
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

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Hero Tier List</h1>
        <p className="text-gray-400">Current meta rankings based on win rate, pick rate, and ban rate. Data fetched live from the MLBB API.</p>
      </div>

      <div className="bg-gaming-card border border-gaming-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gaming-bg border-b border-gaming-border text-gray-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Rank</th>
                <th className="p-4 font-medium">Hero</th>
                <th className="p-4 font-medium">Win Rate</th>
                <th className="p-4 font-medium">Pick Rate</th>
                <th className="p-4 font-medium">Ban Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gaming-border">
              {rankData.slice(0, 50).map((hero: any, idx: number) => {
                const heroData = hero.data?.main_hero?.data || {};
                const heroId = hero.data?.main_heroid || idx;
                const imageUrl = heroData.head || `https://picsum.photos/seed/${heroData.name || 'hero'}/100/100`;
                const winRate = hero.data?.main_hero_win_rate ? (hero.data.main_hero_win_rate * 100).toFixed(2) : 'N/A';
                const pickRate = hero.data?.main_hero_appearance_rate ? (hero.data.main_hero_appearance_rate * 100).toFixed(2) : 'N/A';
                const banRate = hero.data?.main_hero_ban_rate ? (hero.data.main_hero_ban_rate * 100).toFixed(2) : 'N/A';
                
                return (
                  <tr key={`${heroId}-${idx}`} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-gray-500 font-bold w-16 text-center">#{idx + 1}</td>
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gaming-bg shrink-0">
                        <Image 
                          src={imageUrl} 
                          alt={heroData.name || 'Hero'} 
                          width={40} 
                          height={40} 
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      </div>
                      <span className="text-white font-medium">{heroData.name || 'Unknown'}</span>
                    </td>
                    <td className="p-4 text-gaming-win font-medium">{winRate}%</td>
                    <td className="p-4 text-gray-300">{pickRate}%</td>
                    <td className="p-4 text-gaming-loss">{banRate}%</td>
                  </tr>
                );
              })}
              {rankData.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No data available or API is currently unreachable.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
