"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Landmark,
  ArrowLeftRight,
  CreditCard,
  Tag,
  Settings,
  Wallet,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Contas",
    href: "/contas",
    icon: Landmark,
  },
  {
    label: "Transações",
    href: "/transacoes",
    icon: ArrowLeftRight,
  },
  {
    label: "Cartões",
    href: "/cartoes",
    icon: CreditCard,
    disabled: true,
  },
  {
    label: "Categorias",
    href: "/categorias",
    icon: Tag,
    disabled: true,
  },
];

const bottomItems = [
  {
    label: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    disabled: true,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-60 flex-col border-r bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Wallet className="h-4 w-4 text-primary" />
        </div>
        <span className="font-bold text-lg tracking-tight">financ.ia</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Menu principal">
        <div className="space-y-0.5">
          <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
            Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.disabled ? "#" : item.href}
                aria-current={isActive ? "page" : undefined}
                aria-disabled={item.disabled}
                tabIndex={item.disabled ? -1 : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  item.disabled &&
                    "pointer-events-none cursor-not-allowed opacity-40"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.disabled && (
                  <span className="rounded px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide bg-sidebar-foreground/10 text-sidebar-foreground/50">
                    Em breve
                  </span>
                )}
                {isActive && (
                  <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom nav */}
      <div className="border-t p-3 space-y-0.5">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.disabled ? "#" : item.href}
              aria-current={isActive ? "page" : undefined}
              aria-disabled={item.disabled}
              tabIndex={item.disabled ? -1 : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                item.disabled && "pointer-events-none cursor-not-allowed opacity-40"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
