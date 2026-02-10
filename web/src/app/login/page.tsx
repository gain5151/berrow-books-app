"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { type LoginFormData } from "./_consts";
import { LoginForm } from "./_components/LoginForm";
import { LoginSuccess } from "./_components/LoginSuccess";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");
  const [sentEmail, setSentEmail] = useState("");

  const handleSubmit = async (data: LoginFormData) => {
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("email", {
        email: data.email,
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        setError("メールの送信に失敗しました。もう一度お試しください。");
      } else {
        setSentEmail(data.email);
        setIsSent(true);
      }
    } catch {
      setError("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return <LoginSuccess email={sentEmail} />;
  }

  return (
    <LoginForm
      isLoading={isLoading}
      error={error}
      onSubmit={handleSubmit}
    />
  );
}
