"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import { inputClass, buttonClass } from "@/app/ui/styles";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});

  return (
    <form action={action} className="flex flex-col gap-4 w-full">
      <label className="flex flex-col gap-1 text-sm">
        מספר טלפון
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        קוד (4 ספרות)
        <input
          name="pin"
          type="password"
          inputMode="numeric"
          pattern="\d{4}"
          maxLength={4}
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </label>
      {state.message && (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "מתחבר..." : "התחברות"}
      </button>
      <p className="text-center text-sm">
        עובד חדש?{" "}
        <Link href="/register" className="underline">
          הרשמה
        </Link>
      </p>
    </form>
  );
}
