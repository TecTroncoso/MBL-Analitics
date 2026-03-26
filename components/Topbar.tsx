import { Search, Bell, Menu } from "lucide-react";

export function Topbar() {
  return (
    <header className="h-16 bg-gaming-card border-b border-gaming-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <button className="md:hidden text-gray-400 hover:text-white">
          <Menu className="w-6 h-6" suppressHydrationWarning />
        </button>
        
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" suppressHydrationWarning />
          <input
            type="text"
            placeholder="Search player by name or ID..."
            className="w-full bg-[#0b0e14] border border-gaming-border rounded-full py-2 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-gaming-accent transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 bg-[#0b0e14] border border-gaming-border rounded-full px-3 py-1.5 text-sm">
          <span className="text-gray-400">Region:</span>
          <span className="text-white font-medium">NA</span>
        </div>
        
        <button className="relative text-gray-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" suppressHydrationWarning />
          <span className="absolute top-0 right-0 w-2 h-2 bg-gaming-accent rounded-full border border-gaming-card"></span>
        </button>
        
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gaming-accent to-purple-500 overflow-hidden border border-gaming-border cursor-pointer">
          <img src="https://picsum.photos/seed/user/100/100" alt="User" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
}
