import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Wallet } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight">financ.ia</span>
          </Link>
        </div>
        
        <div className="flex items-center justify-end space-x-4">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
