import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Menu as MenuIcon } from "lucide-react";
import { Logo } from "./logo";
import { NavMenu } from "./nav-menu";

export const NavigationSheet = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <MenuIcon className="h-6 w-6 text-white" />
      </SheetTrigger>
      <SheetContent className="bg-black text-white p-0">
        <NavMenu orientation="vertical" className="p-4 space-y-4" />
        <div className="px-4 py-2">
          <Logo />
        </div>
      </SheetContent>

    </Sheet>
  );
};
