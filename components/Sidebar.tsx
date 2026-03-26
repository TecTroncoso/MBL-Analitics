"use client";

import { Home, Trophy, Users, BarChart2, Settings, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();
  
  return (
    <aside className="w-64 bg-gaming-card border-r border-gaming-border h-screen sticky top-0 flex flex-col hidden md:flex">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-gaming-accent flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" suppressHydrationWarning />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">MLBB Analytics</span>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <NavItem href="/" icon={<Home className="w-5 h-5" suppressHydrationWarning />} label="Home" active={pathname === "/"} />
        <NavItem href="/tier-list" icon={<Trophy className="w-5 h-5" suppressHydrationWarning />} label="Tier List" active={pathname === "/tier-list"} />
        <NavItem href="/heroes" icon={<Users className="w-5 h-5" suppressHydrationWarning />} label="Heroes" active={pathname === "/heroes"} />
        <NavItem href="/leaderboards" icon={<BarChart2 className="w-5 h-5" suppressHydrationWarning />} label="Leaderboards" active={pathname === "/leaderboards"} />
      </nav>

      <div className="p-4 border-t border-gaming-border">
        <NavItem href="/settings" icon={<Settings className="w-5 h-5" suppressHydrationWarning />} label="Settings" active={pathname === "/settings"} />
      </div>
    </aside>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
        active
          ? "bg-gaming-accent/10 text-gaming-accent font-medium"
          : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
