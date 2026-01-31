"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { loginSchema, type LoginFormData } from "./_consts";
import { LoginForm } from "./_components/LoginForm";
import { LoginSuccess } from "./_components/LoginSuccess";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");

  const validateForm = (): LoginFormData | null => {
    const result = loginSchema.safeParse({ email });
    if (!result.success) {
      const firstError = result.error.issues[0];
      setValidationError(firstError.message);
      return null;
    }
    setValidationError("");
    return result.data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validatedData = validateForm();
    if (!validatedData) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("email", {
        email: validatedData.email,
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        setError("メールの送信に失敗しました。もう一度お試しください。");
      } else {
        setIsSent(true);
      }
    } catch {
      setError("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (validationError) {
      setValidationError("");
    }
  };

  if (isSent) {
    return <LoginSuccess email={email} />;
  }

  return (
    <LoginForm
      email={email}
      isLoading={isLoading}
      validationError={validationError}
      error={error}
      onEmailChange={handleEmailChange}
      onSubmit={handleSubmit}
    />
  );
}
