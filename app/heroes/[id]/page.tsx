import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Swords, ShieldAlert, Heart, Info, BookOpen, Star } from "lucide-react";
import { mlbbApi } from "@/lib/mlbb-api";

// Revalidate this page every hour (3600 seconds) since hero data doesn't change often
// This greatly optimizes subsequent loads
export const revalidate = 3600;

export default async function HeroDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  let heroDetail: any = null;
  let skillCombos: any = null;
  let heroBuilds: any = null;
  
  // Catalogs for mapping builds
  let equipmentList: any[] = [];
  let spellsList: any[] = [];
  let emblemsList: any[] = [];
  
  try {
    // Fetch details first to get the Lane, while also fetching static catalogs concurrently
    const [detailRes, equipRes, spellsRes, emblemsRes] = await Promise.allSettled([
      mlbbApi.getHeroDetail(id),
      mlbbApi.getEquipment(false),
      mlbbApi.getSpells(),
      mlbbApi.getEmblems()
    ]);

    if (detailRes.status === "fulfilled") {
      heroDetail = detailRes.value.data?.records?.[0]?.data || detailRes.value.data || detailRes.value;
    }

    const heroData = heroDetail?.hero?.data || heroDetail;

    // Extract lane
    let laneStr = "gold";
    const laneName = heroData?.roadsortlabel?.[0]?.toLowerCase() || "";
    if (laneName.includes("exp")) laneStr = "exp";
    else if (laneName.includes("mid")) laneStr = "mid";
    else if (laneName.includes("roam")) laneStr = "roam";
    else if (laneName.includes("jungle")) laneStr = "jungle";
    else if (laneName.includes("gold")) laneStr = "gold";

    // Now fetch combos, official builds, and UGC builds concurrently
    const [combosRes, officialRes, ugcRes] = await Promise.allSettled([
      mlbbApi.getHeroSkillCombos(id),
      mlbbApi.getHeroBuilds(id, laneStr),
      mlbbApi.getAcademyHeroRecommended(id)
    ]);
    
    if (combosRes.status === "fulfilled") {
      skillCombos = combosRes.value.data?.records || combosRes.value.data || [];
    }

    heroBuilds = [];

    // 1. Process Official Core Builds (only have 3 items, highly accurate telemetry)
    if (officialRes.status === "fulfilled") {
      const records = officialRes.value.data?.records || [];
      if (records[0]?.data?.build) {
        const offBuilds = records[0].data.build.slice(0, 2).map((b: any) => ({
          isOfficial: true,
          author: { name: "Official Global Data", avatar: null },
          stats: { votes: Math.round((b.build_pick_rate || 0) * 10000) }, // fake votes for sorting equivalent
          title: `Core Build - ${((b.build_win_rate || 0) * 100).toFixed(1)}% WR`,
          recommend: "Strictly the 3 core items with highest win-rate from global top players.",
          equips: [{ equip_title: "Core Items", equip_ids: b.equipid }],
          spell: { spell_id: b.battleskill?.battleskillid || b.battleskill?.data?.__data?.skillid || b.skillid },
          emblems: [{ emblem_title: b.emblem?.emblemname || "Emblem", emblem_gifts: b.new_rune_skill }]
        }));
        heroBuilds = [...heroBuilds, ...offBuilds];
      }
    }

    // 2. Process UGC Community Builds (have full 6 items, sorted by community votes)
    if (ugcRes.status === "fulfilled") {
      const records = ugcRes.value.data?.records || [];
      const ugcBuilds = records.map((r: any) => ({
        ...r.data?.data,
        author: r.user,
        stats: r.dynamic,
        title: r.data?.title || r.title || r.data?.data?.title
      }));
      
      // Sort UGC by votes descending
      ugcBuilds.sort((a: any, b: any) => (b.stats?.votes || 0) - (a.stats?.votes || 0));
      
      // Add top 3 UGC builds
      heroBuilds = [...heroBuilds, ...ugcBuilds.slice(0, 3)];
    }

    if (equipRes.status === "fulfilled") {
      equipmentList = equipRes.value.data?.records || equipRes.value.data || [];
    }

    if (spellsRes.status === "fulfilled") {
      spellsList = spellsRes.value.data?.records || spellsRes.value.data || [];
    }

    if (emblemsRes.status === "fulfilled") {
      emblemsList = emblemsRes.value.data?.records || emblemsRes.value.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch hero details:", error);
  }

  if (!heroDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold text-white mb-4">Hero Not Found</h2>
        <Link href="/heroes" className="text-gaming-accent hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Heroes
        </Link>
      </div>
    );
  }

  const heroData = heroDetail.hero?.data || heroDetail;
  const skills = heroData.heroskilllist?.[0]?.skilllist || [];
  const relations = heroDetail.relation || {};

  // Build Maps for O(1) Lookups
  const equipMap = Object.fromEntries(equipmentList.map(r => [r.data?.equipid || r.equipid, r.data || r]));
  const spellMap = Object.fromEntries(spellsList.map(r => [r.data?.__data?.skillid || r.skillid, r.data?.__data || r]));
  const emblemTalentMap = Object.fromEntries(emblemsList.map(r => [r.data?.giftid || r.giftid, r.data?.emblemskill || r.emblemskill || r]));

  // Sort builds by votes (descending) to filter out new troll/irrelevant builds
  const sortedBuilds = [...(heroBuilds || [])].sort((a: any, b: any) => {
    const votesA = a.stats?.votes || 0;
    const votesB = b.stats?.votes || 0;
    return votesB - votesA;
  });

  // Pick up to 5 top recommended builds
  const recommendedBuilds = sortedBuilds.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <Link href="/heroes" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4" prefetch={false}>
        <span className="flex items-center gap-2">
          <svg suppressHydrationWarning xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          Back to Catalog
        </span>
      </Link>

      {/* Hero Header Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-gaming-border bg-gaming-card h-[300px] md:h-[400px]">
        {heroData.squareheadbig && (
          <Image
            src={heroData.squareheadbig}
            alt={heroData.name}
            fill
            className="object-cover opacity-40 blur-sm"
            unoptimized
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gaming-bg via-gaming-bg/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 p-6 md:p-10 flex flex-col md:flex-row items-end gap-6 w-full">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-2 border-gaming-accent bg-gaming-bg shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <Image
              src={heroData.head_big || heroData.head || `https://picsum.photos/seed/${heroData.name}/200/200`}
              alt={heroData.name}
              width={128}
              height={128}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">{heroData.name}</h1>
              {heroData.sortlabel?.[0] && (
                <span className="bg-gaming-accent/20 border border-gaming-accent text-gaming-accent px-3 py-1 rounded-full text-sm font-medium">
                  {heroData.sortlabel[0]}
                </span>
              )}
            </div>
            
            {heroData.roadsortlabel?.[0] && (
              <div className="text-gray-300 font-medium mb-3 flex items-center gap-2">
                 {heroData.roadsorticon1 && (
                  <Image src={heroData.roadsorticon1} alt="Lane" width={20} height={20} unoptimized />
                )}
                {heroData.roadsortlabel[0]}
              </div>
            )}

            <div className="text-gray-400 max-w-3xl line-clamp-2 md:line-clamp-3 text-sm md:text-base">
              {heroData.story || heroData.tale || "No description available."}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Stats & Combos */}
        <div className="lg:col-span-2 space-y-6">

          {/* Pro Build Section */}
          {recommendedBuilds.length > 0 && (
            <div className="bg-gaming-card border border-gaming-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6 border-b border-gaming-border pb-4">
                <Star className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">Top Player Builds</h2>
              </div>
              
              <div className="space-y-8">
                {recommendedBuilds.map((build: any, index: number) => (
                  <div key={index} className="border-b border-gaming-border/50 pb-8 last:border-0 last:pb-0">
                    {/* Build Header */}
                    <div className="flex items-center gap-3 mb-4">
                      {build.author?.avatar && (
                        <Image src={build.author.avatar} alt={build.author.name || "Player"} width={32} height={32} className="rounded-full border border-gaming-accent" unoptimized />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-bold">{build.title || "Recommended Build"}</h3>
                          {build.stats?.votes > 0 && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Heart className="w-3 h-3" /> {build.stats.votes}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">by {build.author?.name || "Anonymous Player"}</p>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                      {/* Equipment */}
                      {build.equips?.[0] && (
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">{build.equips[0].equip_title || "Core Items"}</h4>
                          <div className="flex flex-wrap gap-2">
                            {build.equips[0].equip_ids?.map((eqId: number, idx: number) => {
                              const eq = equipMap[eqId];
                              return eq ? (
                                <div key={idx} className="relative group w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-gaming-border hover:border-gaming-accent transition-colors bg-gaming-bg">
                                  <Image src={eq.equipicon} alt={eq.equipname} fill className="object-cover" unoptimized />
                                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[9px] text-white text-center leading-tight px-1">{eq.equipname}</span>
                                  </div>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

                      {/* Spell & Emblems */}
                      <div className="flex gap-4 md:gap-6 shrink-0">
                        {build.spell?.spell_id && spellMap[build.spell.spell_id] && (
                          <div>
                            <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Spell</h4>
                            <div className="relative group w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden border border-gaming-border hover:border-gaming-accent transition-colors bg-gaming-bg">
                              <Image src={spellMap[build.spell.spell_id].skillicon} alt={spellMap[build.spell.spell_id].skillname} fill className="object-cover" unoptimized />
                              <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[9px] text-white text-center leading-tight px-1">{spellMap[build.spell.spell_id].skillname}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {build.emblems?.[0]?.emblem_gifts && (
                          <div>
                            <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">{build.emblems[0].emblem_title || "Emblems"}</h4>
                            <div className="flex gap-1.5">
                              {build.emblems[0].emblem_gifts.map((giftId: number, idx: number) => {
                                const talent = emblemTalentMap[giftId];
                                return talent ? (
                                  <div key={idx} className="relative group w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border border-gaming-border hover:border-gaming-accent bg-gaming-bg p-0.5">
                                    <Image src={talent.skillicon} alt={talent.skillname} fill className="object-contain p-0.5" unoptimized />
                                    <div className="absolute inset-0 bg-black/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                      <span className="text-[8px] text-white text-center leading-tight px-1">{talent.skillname}</span>
                                    </div>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* User description / recommend */}
                    {build.recommend && (
                      <p className="mt-4 text-xs md:text-sm text-gray-400 italic border-l-2 border-gaming-accent/50 pl-3">
                        "{build.recommend}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Skills */}
          {skills.length > 0 && (
            <div className="bg-gaming-card border border-gaming-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6 border-b border-gaming-border pb-4">
                <Swords className="w-5 h-5 text-gaming-accent" />
                <h2 className="text-xl font-bold text-white">Abilities</h2>
              </div>
              
              <div className="space-y-6">
                {skills.map((skill: any, idx: number) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-gaming-border bg-gaming-bg">
                      <Image 
                        src={skill.skillicon || `https://picsum.photos/seed/skill${idx}/100/100`} 
                        alt={skill.skillname || "Skill"} 
                        width={56} 
                        height={56}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    </div>
                    <div>
                      <h3 className="text-white font-bold mb-1 flex items-center gap-2">
                        {skill.skillname || (idx === 0 ? "Passive" : `Skill ${idx}`)}
                        {skill.skilltag?.map((tag: any, tidx: number) => (
                          <span key={tidx} className="text-[10px] px-1.5 py-0.5 rounded bg-gaming-bg border border-gray-700 text-gray-300" style={tag.tagrgb ? { borderColor: `rgb(${tag.tagrgb})` } : {}}>
                            {tag.tagname}
                          </span>
                        ))}
                      </h3>
                      {skill["skillcd&cost"] && <div className="text-xs text-gaming-accent mb-2">{skill["skillcd&cost"].replace(/<[^>]+>/g, '')}</div>}
                      <p className="text-gray-400 text-sm" dangerouslySetInnerHTML={{ __html: skill.skilldesc?.replace(/\n/g, '<br/>') || "" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skill Combos */}
          {skillCombos && skillCombos.length > 0 && (
            <div className="bg-gaming-card border border-gaming-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6 border-b border-gaming-border pb-4">
                <BookOpen className="w-5 h-5 text-gaming-accent" />
                <h2 className="text-xl font-bold text-white">Skill Combos & Tips</h2>
              </div>
              
              <div className="grid gap-4">
                {skillCombos.map((combo: any, idx: number) => (
                  <div key={idx} className="bg-gaming-bg rounded-lg p-4 border border-gaming-border/50">
                    <h3 className="text-white font-semibold mb-3">{combo.title || combo.caption || "Combo"}</h3>
                    
                    {combo.data?.skill_id && (
                      <div className="flex items-center gap-2 mb-4">
                        {combo.data.skill_id.map((skill: any, sIdx: number) => (
                          <div key={sIdx} className="flex items-center">
                            <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-800 border border-gray-700">
                              {skill.data?.skillicon ? (
                                <Image src={skill.data.skillicon} alt="Skill" width={40} height={40} className="w-full h-full object-cover" unoptimized />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">?</div>
                              )}
                            </div>
                            {sIdx < combo.data.skill_id.length - 1 && (
                              <ArrowLeft className="w-4 h-4 text-gray-500 mx-2 rotate-180" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-sm text-gray-400 leading-relaxed">
                      {combo.data?.desc || combo.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Relations & Extra */}
        <div className="space-y-6">
          
          {/* Relations (Counters, Synergies) */}
          {relations && (
            <div className="bg-gaming-card border border-gaming-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6 border-b border-gaming-border pb-4">
                <Info className="w-5 h-5 text-gaming-accent" />
                <h2 className="text-xl font-bold text-white">Hero Matchups</h2>
              </div>
              
              <div className="space-y-6">
                {/* Best Teammates */}
                {relations.assist && (
                  <div>
                    <h3 className="text-sm font-bold text-green-400 mb-2 uppercase tracking-wide flex items-center gap-2">
                       <Heart className="w-4 h-4" /> Works well with
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      {relations.assist.target_hero?.filter((h: any) => h && h.data?.head).map((h: any, i: number) => (
                        <div key={i} className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-500/50">
                          <Image src={h.data.head} alt="Hero" width={40} height={40} unoptimized />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">{relations.assist.desc}</p>
                  </div>
                )}
                
                {/* Strong Against */}
                {relations.strong && (
                  <div className="pt-4 border-t border-gaming-border/50">
                    <h3 className="text-sm font-bold text-blue-400 mb-2 uppercase tracking-wide flex items-center gap-2">
                       <Swords className="w-4 h-4" /> Strong Against
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      {relations.strong.target_hero?.filter((h: any) => h && h.data?.head).map((h: any, i: number) => (
                        <div key={i} className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500/50">
                          <Image src={h.data.head} alt="Hero" width={40} height={40} unoptimized />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">{relations.strong.desc}</p>
                  </div>
                )}

                {/* Weak Against */}
                {relations.weak && (
                  <div className="pt-4 border-t border-gaming-border/50">
                    <h3 className="text-sm font-bold text-red-400 mb-2 uppercase tracking-wide flex items-center gap-2">
                       <ShieldAlert className="w-4 h-4" /> Weak Against
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      {relations.weak.target_hero?.filter((h: any) => h && h.data?.head).map((h: any, i: number) => (
                        <div key={i} className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-500/50">
                          <Image src={h.data.head} alt="Hero" width={40} height={40} unoptimized />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">{relations.weak.desc}</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
