"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  RotateCcw,
  Wallet,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Target,
  Activity,
  Bell,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Recurring Costs", href: "/recurring", icon: RotateCcw },
  { name: "Investments", href: "/investments", icon: Wallet },
  { name: "Partners", href: "/partners", icon: Users },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Budgets", href: "/budgets", icon: Target },
  { name: "Activity", href: "/activity", icon: Activity },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("/api/notifications");
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    if (user) fetchNotifications();
  }, [user]);

  return (
    <div className="flex flex-col w-64 border-r bg-card h-screen relative">
      <div className="p-8 flex items-center justify-between">
        <h1 className="text-xl font-black tracking-tighter text-primary uppercase italic">FinanceFlow</h1>
        <div className="relative">
            <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-muted rounded-xl transition-all relative group"
            >
                <Bell className={cn("h-5 w-5", notifications.length > 0 ? "text-primary animate-pulse" : "text-muted-foreground")} />
                {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-card"></span>
                )}
            </button>

            {showNotifications && (
                <div className="absolute left-0 mt-2 w-72 bg-card border rounded-2xl shadow-2xl z-50 overflow-hidden ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b bg-muted/30">
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Notifications</p>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-[11px] font-medium text-muted-foreground">No new alerts</p>
                            </div>
                        ) : (
                            notifications.map((n: any) => (
                                <div key={n.id} className="p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full",
                                            n.type === "ALERT" ? "bg-red-500" : n.type === "WARNING" ? "bg-amber-500" : "bg-blue-500"
                                        )}></div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider">{n.title}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
      <nav className="flex-1 px-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-2.5 text-[13px] font-medium rounded-xl transition-all",
                isActive
                   ? "bg-primary text-primary-foreground shadow-sm"
                   : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("mr-3 h-4 w-4", isActive ? "opacity-100" : "opacity-60")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-6 border-t space-y-4">
        {user && (
          <div className="flex items-center space-x-3 px-4 py-3 bg-muted/40 rounded-xl border border-border/50">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-[11px] font-bold text-primary-foreground shadow-inner">
              {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold truncate leading-none mb-1">{user.name}</p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{user.role}</p>
            </div>
          </div>
        )}
        <button
          className="flex items-center w-full px-4 py-2.5 text-[13px] font-semibold text-muted-foreground rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
          onClick={() => {
              // Handle logout
              document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
              window.location.href = "/login";
          }}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
