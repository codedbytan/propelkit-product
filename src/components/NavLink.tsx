"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ComponentProps, forwardRef } from "react";

// Combine Next.js Link props with standard HTML anchor props
type NavLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  className?: string;
  activeClassName?: string; // Optional: class to add when active
};

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, href, ...props }, ref) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(className, isActive && activeClassName)}
        {...props}
      />
    );
  }
);

NavLink.displayName = "NavLink";
