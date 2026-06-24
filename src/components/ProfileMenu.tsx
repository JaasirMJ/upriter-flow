import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link, useRouter } from "@tanstack/react-router";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { useAuth, currentUser } from "@/lib/auth";
import { toast } from "sonner";

export function ProfileMenu() {
  const router = useRouter();
  const me = useAuth((s) => currentUser(s));
  const logout = useAuth((s) => s.logout);

  if (!me) {
    return (
      <Link to="/auth" className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90">
        Sign in
      </Link>
    );
  }

  const initials = me.name.split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    router.navigate({ to: "/auth" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-muted rounded-lg pl-1 pr-2 py-1 transition">
        <div className="size-7 rounded-full bg-gradient-hero grid place-items-center text-white text-xs font-semibold overflow-hidden">
          {me.photoDataUrl ? <img src={me.photoDataUrl} alt={me.name} className="size-full object-cover" /> : initials}
        </div>
        <div className="hidden md:block text-left leading-tight">
          <div className="text-xs font-medium truncate max-w-[140px]">{me.name}</div>
          <div className="text-[10px] text-muted-foreground capitalize">{me.role}</div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span>{me.name}</span>
          <span className="text-[10px] font-normal text-muted-foreground">{me.email ?? me.phone}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer"><UserIcon className="mr-2 size-4" /> My profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="cursor-pointer"><Settings className="mr-2 size-4" /> Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
          <LogOut className="mr-2 size-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
