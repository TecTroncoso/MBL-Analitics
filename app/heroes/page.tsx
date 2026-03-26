import { mlbbApi } from "@/lib/mlbb-api";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default async function HeroesPage() {
  let heroes: any[] = [];
  try {
    const response = await mlbbApi.getHeroes();
    const data = response.data || response;
    heroes = data?.records || data?.data?.records || [];
    if (!Array.isArray(heroes)) {
      heroes = [];
    }
  } catch (error) {
    console.error("Failed to fetch heroes:", error);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Heroes Catalog</h1>
        <p className="text-gray-400">Browse all available heroes in Mobile Legends: Bang Bang. Data fetched live from the MLBB API.</p>
      </div>
      
      {heroes.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {heroes.map((hero: any, idx: number) => {
            const heroData = hero.data?.hero?.data || {};
            const heroId = hero.data?.hero_id || idx;
            const imageUrl = heroData.head || `https://picsum.photos/seed/${heroData.name || 'hero'}/100/100`;
            
            return (
              <div key={heroId} className="bg-gaming-card border border-gaming-border rounded-xl p-4 flex flex-col items-center gap-3 hover:border-gaming-accent transition-colors cursor-pointer group">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gaming-bg border-2 border-transparent group-hover:border-gaming-accent transition-colors">
                  <Image 
                    src={imageUrl} 
                    alt={heroData.name || 'Hero'} 
                    width={80} 
                    height={80} 
                    className="object-cover w-full h-full" 
                    unoptimized // Using unoptimized just in case the API returns external URLs that Next.js struggles to optimize
                  />
                </div>
                <div className="text-center">
                  <div className="text-white font-bold text-sm">{heroData.name || 'Unknown'}</div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gaming-card border border-gaming-border rounded-xl p-12 text-center">
          <p className="text-gray-400">No heroes found or API is currently unavailable.</p>
        </div>
      )}
    </div>
  );
}
