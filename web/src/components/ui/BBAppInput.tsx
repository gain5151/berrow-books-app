"use client";

import { InputHTMLAttributes } from "react";
import {
  FieldError,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BBAppInputProps<T extends FieldValues = FieldValues>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "name"> {
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: FieldError;
}

export const BBAppInput = <T extends FieldValues = FieldValues>({
  className,
  error,
  register,
  name,
  ...props
}: BBAppInputProps<T>) => {
  const registration = register(name);

  return (
    <div className="w-full">
      <input
        {...props}
        {...registration}
        className={cn(
          "w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 dark:bg-zinc-700 dark:text-white",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-zinc-300 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-600",
          className
        )}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
    </div>
  );
};

export default BBAppInput;
