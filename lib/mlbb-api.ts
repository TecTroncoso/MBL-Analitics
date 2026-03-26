export class MLBBAPIClient {
  // Use absolute URL on the server (since rewrites only apply to client requests)
  private baseUrl = typeof window === 'undefined' ? "https://mlbb-stats.rone.dev/api" : "/api/mlbb";
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(method: string, endpoint: string, data?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const options: RequestInit = {
      method,
      headers,
      // Add cache: 'no-store' to ensure fresh data for dynamic endpoints
      cache: 'no-store'
    };

    let finalUrl = url;

    if (data) {
      if (method === "GET") {
        const params = new URLSearchParams(data);
        finalUrl = `${url}?${params.toString()}`;
      } else {
        options.body = JSON.stringify(data);
      }
    }

    try {
      const response = await fetch(finalUrl, options);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      
      // Check for API-level errors
      if (data && typeof data.code === 'number' && data.code !== 0) {
        let errorMsg = data.msg;
        if (!errorMsg) {
          if (data.code === -20006) errorMsg = "Invalid Game ID or Server ID";
          else if (data.code === -20008) errorMsg = "Invalid Verification Code";
          else errorMsg = `API Error Code: ${data.code}`;
        }
        throw new Error(errorMsg);
      }
      
      return data;
    } catch (error) {
      console.error(`Error in request to ${endpoint}:`, error);
      throw error;
    }
  }

  // ==================== HEROES ====================
  getHeroes() { return this.request<any>("GET", "/heroes"); }
  getHeroRank() { return this.request<any>("GET", "/heroes/rank"); }
  getHeroPositions() { return this.request<any>("GET", "/heroes/positions"); }
  getHeroDetail(id: string) { return this.request<any>("GET", `/heroes/${id}`); }
  getHeroStats(id: string) { return this.request<any>("GET", `/heroes/${id}/stats`); }
  getHeroSkillCombos(id: string) { return this.request<any>("GET", `/heroes/${id}/skill-combos`); }
  getHeroTrends(id: string) { return this.request<any>("GET", `/heroes/${id}/trends`); }
  getHeroCounters(id: string) { return this.request<any>("GET", `/heroes/${id}/counters`); }
  getHeroCompatibility(id: string) { return this.request<any>("GET", `/heroes/${id}/compatibility`); }
  getHeroRelations(id: string) { return this.request<any>("GET", `/heroes/${id}/relations`); }

  // ==================== ACADEMY ====================
  getGameVersion() { return this.request<any>("GET", "/academy/meta/version"); }
  getHeroCatalog() { return this.request<any>("GET", "/academy/heroes/catalog"); }
  getRoles() { return this.request<any>("GET", "/academy/roles"); }
  getEquipment(expanded = false) { return this.request<any>("GET", expanded ? "/academy/equipment/expanded" : "/academy/equipment"); }
  getSpells() { return this.request<any>("GET", "/academy/spells"); }
  getEmblems() { return this.request<any>("GET", "/academy/emblems"); }
  getRanks(rankId?: string) { return this.request<any>("GET", rankId ? `/academy/ranks/${rankId}` : "/academy/ranks"); }
  getHeroBuilds(id: string) { return this.request<any>("GET", `/academy/heroes/${id}/builds`); }
  getHeroLane(id: string) { return this.request<any>("GET", `/academy/heroes/${id}/lane`); }
  getHeroWinrateTimeline(id: string) { return this.request<any>("GET", `/academy/heroes/${id}/win-rate/timeline`); }
  getHeroTeammates(id: string) { return this.request<any>("GET", `/academy/heroes/${id}/teammates`); }
  getRecommendedContent() { return this.request<any>("GET", "/academy/recommended"); }
  getRecommendedContentDetail(id: string) { return this.request<any>("GET", `/academy/recommended/${id}`); }
  getAcademyHeroFilters() { return this.request<any>("GET", "/academy/heroes"); }
  getAcademyHeroStats(id: string) { return this.request<any>("GET", `/academy/heroes/${id}/stats`); }
  getAcademyHeroCounters(id: string) { return this.request<any>("GET", `/academy/heroes/${id}/counters`); }
  getAcademyHeroTrends(id: string) { return this.request<any>("GET", `/academy/heroes/${id}/trends`); }
  getAcademyHeroRecommended(id: string) { return this.request<any>("GET", `/academy/heroes/${id}/recommended`); }
  getAcademyHeroRatings() { return this.request<any>("GET", "/academy/heroes/ratings"); }
  getAcademyHeroRatingsBySubject(subject: string) { return this.request<any>("GET", `/academy/heroes/ratings/${subject}`); }

  // ==================== USER (Requires Auth) ====================
  sendVerificationCode(roleId: string, zoneId: string) { 
    return this.request<any>("POST", "/user/auth/send-vc", { 
      role_id: parseInt(roleId, 10), 
      zone_id: parseInt(zoneId, 10) 
    }); 
  }
  async login(roleId: string, zoneId: string, code: string) {
    const res = await this.request<any>("POST", "/user/auth/login", { 
      role_id: parseInt(roleId, 10), 
      zone_id: parseInt(zoneId, 10), 
      vc: code 
    });
    if (res.data && res.data.jwt) {
      this.token = res.data.jwt;
    }
    return res;
  }
  logout() {
    const res = this.request<any>("POST", "/user/auth/logout");
    this.token = null;
    return res;
  }
  getUserInfo() { return this.request<any>("POST", "/user/info", { jwt: this.token }); }
  getUserStats() { return this.request<any>("POST", "/user/stats", { jwt: this.token }); }
  getUserSeasons() { return this.request<any>("POST", "/user/season", { jwt: this.token }); }
  getUserMatches(sid: number = 0, limit: number = 10) { return this.request<any>("POST", `/user/matches?sid=${sid}&limit=${limit}`, { jwt: this.token }); }
  getMatchDetails(matchId: string, sid: number = 0) { return this.request<any>("POST", `/user/matches/${matchId}?sid=${sid}`, { jwt: this.token }); }
  getUserFriends() { return this.request<any>("POST", "/user/friends", { jwt: this.token }); }
  getUserFrequentHeroes() { return this.request<any>("POST", "/user/heroes/frequent", { jwt: this.token }); }

  // ==================== UTILITIES ====================
  winRateCalculator(wins: number, losses: number) { return this.request<any>("GET", "/addon/win-rate-calculator", { wins: wins.toString(), losses: losses.toString() }); }
  ipLookup(ip?: string) { return this.request<any>("GET", "/addon/ip", ip ? { ip } : undefined); }
  getApiStatus() { return this.request<any>("GET", ""); }
}

export const mlbbApi = new MLBBAPIClient();
