"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import Image from "next/image";

export function StatsOverview({ stats, topHeroes = [] }: { stats: any, topHeroes?: any[] }) {
  if (!stats) return null;

  const hasStats = stats.totalMatches > 0;

  const winRateData = [
    { name: "Wins", value: stats.wins || 0 },
    { name: "Losses", value: stats.losses || 0 },
  ];
  const COLORS = ["#10b981", "#ef4444"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Win Rate Card */}
      <div className="bg-gaming-card border border-gaming-border rounded-xl p-6 relative overflow-hidden">
        {!hasStats && (
          <div className="absolute inset-0 z-10 bg-gaming-card/80 backdrop-blur-sm flex items-center justify-center">
            <p className="text-gray-400 text-sm text-center px-4">No stats available. Play some matches or make your profile public.</p>
          </div>
        )}
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Season Stats</h3>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 relative flex items-center justify-center">
            <PieChart width={96} height={96}>
              <Pie
                data={winRateData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={45}
                stroke="none"
                dataKey="value"
              >
                {winRateData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-lg font-bold text-white">{stats.winRate || 0}%</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">{stats.totalMatches || 0} <span className="text-sm text-gray-500 font-normal">Matches</span></div>
            <div className="flex gap-3 text-sm">
              <span className="text-gaming-win font-medium">{stats.wins || 0}W</span>
              <span className="text-gray-600">|</span>
              <span className="text-gaming-loss font-medium">{stats.losses || 0}L</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gaming-border pt-6">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">KDA</div>
            <div className="text-lg font-bold text-white">{stats.kda || "0.0"}</div>
            <div className="text-xs text-gray-400">{stats.kills || 0} / {stats.deaths || 0} / {stats.assists || 0}</div>
          </div>
          <div className="text-center border-l border-gaming-border">
            <div className="text-xs text-gray-500 mb-1">Kill Part.</div>
            <div className="text-lg font-bold text-white">{stats.killParticipation || "0"}%</div>
            <div className="text-xs text-gray-400">Average</div>
          </div>
          <div className="text-center border-l border-gaming-border">
            <div className="text-xs text-gray-500 mb-1">MVPs</div>
            <div className="text-lg font-bold text-gaming-accent">{stats.mvp || 0}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
        </div>
      </div>

      {/* Top Heroes Card */}
      <div className="bg-gaming-card border border-gaming-border rounded-xl p-6 lg:col-span-2 relative overflow-hidden">
        {topHeroes.length === 0 && (
          <div className="absolute inset-0 z-10 bg-gaming-card/80 backdrop-blur-sm flex items-center justify-center">
            <p className="text-gray-400 text-sm text-center px-4">No top heroes available. Play some matches or make your profile public.</p>
          </div>
        )}
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Top Heroes</h3>
        <div className="space-y-4">
          {topHeroes.length > 0 ? topHeroes.map((hero: any, idx: number) => (
            <div key={`${hero.id || 'hero'}-${idx}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-gaming-border shrink-0">
                <Image src={hero.image || `https://picsum.photos/seed/${hero.name || 'hero'}/100/100`} alt={hero.name || "Hero"} width={48} height={48} className="object-cover w-full h-full" unoptimized />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white truncate">{hero.name || "Unknown"}</div>
                <div className="text-xs text-gray-500">{hero.role || "Fighter"}</div>
              </div>
              
              <div className="w-32">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Win Rate</span>
                  <span className={(hero.winRate || 0) >= 60 ? "text-gaming-win" : "text-white"}>{hero.winRate || 0}%</span>
                </div>
                <div className="w-full h-1.5 bg-gaming-bg rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${(hero.winRate || 0) >= 60 ? 'bg-gaming-win' : 'bg-gaming-accent'}`} 
                    style={{ width: `${hero.winRate || 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="w-24 text-right">
                <div className="font-bold text-white">{hero.kda || "0.0"} KDA</div>
                <div className="text-xs text-gray-500">{hero.matches || 0} Matches</div>
              </div>
            </div>
          )) : (
            <div className="text-center text-gray-500 py-8">No hero data available</div>
          )}
        </div>
      </div>
    </div>
  );
}
