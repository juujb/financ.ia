import { UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      {/* Mobile: logo placeholder (sidebar is hidden) */}
      <div className="flex flex-1 items-center gap-2 md:hidden">
        <span className="font-bold text-base tracking-tight">financ.ia</span>
      </div>

      {/* Spacer for desktop */}
      <div className="hidden flex-1 md:block" />

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </div>
    </header>
  );
}
