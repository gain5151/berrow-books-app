"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import {
  FieldError,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";

type InputBaseProps = Omit<InputHTMLAttributes<HTMLInputElement>, "name">;

// Register方式のProps
type InputWithRegisterProps<T extends FieldValues> = InputBaseProps & {
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: FieldError;
  label?: string;
};

// Registerを使わないシンプルなProps
type InputSimpleProps = InputHTMLAttributes<HTMLInputElement> & {
  name?: string;
  register?: never;
  error?: FieldError;
  label?: string;
};

export type InputProps<T extends FieldValues = FieldValues> =
  | InputWithRegisterProps<T>
  | InputSimpleProps;

function InputInner<T extends FieldValues = FieldValues>(
  props: InputProps<T>,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const { label, className, ...rest } = props;

  // register方式
  if ("register" in rest && rest.register && rest.name) {
    const { register, name, error, ...inputProps } = rest as InputWithRegisterProps<T>;
    const registration = register(name);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={name}
            className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {label}
          </label>
        )}
        <input
          {...inputProps}
          {...registration}
          ref={(e) => {
            registration.ref(e);
            if (typeof ref === "function") ref(e);
            else if (ref) ref.current = e;
          }}
          id={name}
          className={`w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 dark:bg-zinc-700 dark:text-white ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-zinc-300 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-600"
          } ${className || ""}`}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error.message}</p>
        )}
      </div>
    );
  }

  // シンプル方式（react-hook-formなし）
  const { error, name, ...inputProps } = rest as InputSimpleProps;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          {label}
        </label>
      )}
      <input
        {...inputProps}
        ref={ref}
        id={name}
        name={name}
        className={`w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 dark:bg-zinc-700 dark:text-white ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-zinc-300 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-600"
        } ${className || ""}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error.message}</p>
      )}
    </div>
  );
}

export const Input = forwardRef(InputInner) as <T extends FieldValues = FieldValues>(
  props: InputProps<T> & { ref?: React.ForwardedRef<HTMLInputElement> }
) => React.ReactElement;

export default Input;
