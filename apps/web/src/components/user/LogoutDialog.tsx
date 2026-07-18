"use client";

import { useAuthStore } from "@/store/useAuthStore";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { logoutIcon } from "@/images";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { logoutServerSide } from "@/app/actions/auth";

interface LogoutDialogProps {
  children: React.ReactNode;
  className?: string;
  triggerClassName?: string;
}

export function LogoutDialog({
  children,
  className,
  triggerClassName,
}: LogoutDialogProps) {
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogoutConfirmation = async () => {
    // 1. Clear Zustand session + cookies
    logout();

    // 2. Clear all local storage variants
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();

      // 3. Guarantee the server cookie header is destroyed
      try {
        await logoutServerSide();
      } catch (e) {}

      // 4. Forcefully hard-reload or redirect to root origin so ALL
      // RSC cache and Next.js closure memory strictly dump, forcing fresh server request.
      setTimeout(() => {
        const currentPath = window.location.pathname;
        // If the path is a protected user or admin dashboard route, it logs out to home.
        // Otherwise (like /cart, /checkout, /product) it just stays and reloads the authenticated state.
        if (currentPath.match(/^\/(en|bn|[a-z]{2})\/(user|admin)(\/|$)/)) {
          window.location.href = "/";
        } else {
          window.location.reload();
        }
      }, 100);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className={cn("w-full cursor-pointer", triggerClassName)}>
          {children}
        </div>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className={cn(
          "w-full max-w-[350px] sm:max-w-[350px] min-h-[390px] rounded-[16px] border-none bg-white p-10 shadow-2xl flex flex-col justify-between",
          className,
        )}
      >
        <DialogHeader className="p-0 w-full flex flex-col items-center gap-4">
          <div className="w-full flex items-center justify-center">
            <Image
              src={logoutIcon}
              alt="Logout Illustration"
              className="object-cover w-32 h-32"
            />
          </div>

          <div className="flex flex-col w-full items-center gap-2">
            <DialogTitle className="text-[20px] font-bold text-light-primary-text leading-[30px] m-0 p-0 text-center">
              Logout Confirmation
            </DialogTitle>
            <DialogDescription className="text-light-secondary-text text-[15px] leading-[22px] text-center m-0 p-0 px-2">
              Are you sure you want to do logout?
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="flex flex-row justify-center w-full gap-3 sm:gap-3 sm:space-x-0 mb-2">
          <DialogClose asChild>
            <button className="w-full flex-1 rounded-[50px] border border-[rgba(145,158,171,0.32)] bg-white text-light-primary-text hover:bg-gray-50 transition-colors h-[48px] font-semibold text-[16px] m-0 sm:m-0 flex items-center justify-center text-center">
              Cancel
            </button>
          </DialogClose>
          <button
            onClick={handleLogoutConfirmation}
            className="w-full flex-1 rounded-[50px] bg-warning text-gray-800 hover:bg-warning-dark transition-colors h-[48px] font-semibold text-[16px] shadow-color-warning hover:shadow-[0px_8px_16px_0px_rgba(255,193,7,0.4)] m-0 sm:m-0 border-none flex items-center justify-center text-center"
          >
            Logout
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
