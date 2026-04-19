"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Music, Calendar, Users, List, LogOut, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { user, signInWithGoogle, logout } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Music },
    { name: "Performances", href: "/performances", icon: Calendar },
    { name: "Members", href: "/members", icon: Users },
    { name: "Library", href: "/songs", icon: List },
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5 px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary p-0.5 group-hover:rotate-12 transition-transform">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
              <Music className="w-5 h-5 text-primary" />
            </div>
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            SteelPan<span className="text-secondary">Pro</span>
          </span>
        </Link>

        {user && (
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                    isActive 
                      ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(var(--color-primary),0.2)]" 
                      : "text-foreground/60 hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-foreground">{user.displayName}</span>
              <span className="text-xs text-foreground/40">Band Member</span>
            </div>
            <div className="group relative">
              <button className="w-10 h-10 rounded-full border border-white/10 overflow-hidden hover:border-primary/50 transition-colors">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-slate-400" />
                  </div>
                )}
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 glass rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button 
                  onClick={logout}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-400/10 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={signInWithGoogle}
            className="px-6 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
