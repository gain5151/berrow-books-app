"use client";

import Link, { type LinkProps } from "next/link";
import { type ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BBAppLinkProps extends LinkProps {
  className?: string;
  children: ReactNode;
  target?: string;
  rel?: string;
}

export const BBAppLink = ({
  className,
  children,
  ...props
}: BBAppLinkProps) => {
  return (
    <Link
      className={cn(
        "rounded-md px-4 py-2 text-center transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
};

export default BBAppLink;
