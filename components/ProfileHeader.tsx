import Image from "next/image";

export function ProfileHeader({ user }: { user: any }) {
  if (!user) return null;
  
  const rankIcon = user.rank?.icon || "https://picsum.photos/seed/rank/100/100";
  const rankTier = user.rank?.tier || "Unranked";
  const rankPoints = user.rank?.points || 0;

  return (
    <div className="bg-gaming-card border border-gaming-border rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gaming-accent/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="relative">
        <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-gaming-border">
          <Image
            src={user.avatar || `https://picsum.photos/seed/${user.name}/100/100`}
            alt={user.name || "Player"}
            width={96}
            height={96}
            className="object-cover w-full h-full"
            unoptimized
            priority
          />
        </div>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gaming-bg border border-gaming-border px-2 py-0.5 rounded text-xs font-bold text-gray-300">
          Lv. {user.level || 1}
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-white tracking-tight">{user.name || "Unknown Player"}</h1>
          {user.server && <span className="text-sm text-gray-500 bg-gaming-bg px-2 py-1 rounded">#{user.server}</span>}
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-gaming-accent hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Update Data
          </button>
          <span className="text-xs text-gray-500">Last updated: Just now</span>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-gaming-bg p-4 rounded-xl border border-gaming-border">
        <Image
          src={rankIcon}
          alt={rankTier}
          width={64}
          height={64}
          className="object-contain"
          unoptimized
        />
        <div>
          <div className="text-sm text-gray-400 font-medium uppercase tracking-wider">Ranked</div>
          <div className="text-xl font-bold text-white">{rankTier}</div>
          <div className="text-sm text-gaming-accent font-medium">{rankPoints} Points</div>
        </div>
      </div>
    </div>
  );
}
