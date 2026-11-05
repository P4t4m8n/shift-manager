"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "@/app/actions/auth";
import { inputClass, buttonClass } from "@/app/ui/styles";

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, {});

  if (state.success) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p role="status">{state.message}</p>
        <Link href="/login" className="underline">
          חזרה להתחברות
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4 w-full">
      <label className="flex flex-col gap-1 text-sm">
        שם מלא
        <input
          name="name"
          autoComplete="name"
          required
          minLength={2}
          maxLength={50}
          className={inputClass}
        />
      </label>
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
        בחר קוד (4 ספרות)
        <input
          name="pin"
          type="password"
          inputMode="numeric"
          pattern="\d{4}"
          maxLength={4}
          autoComplete="new-password"
          required
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        אימות קוד
        <input
          name="confirmPin"
          type="password"
          inputMode="numeric"
          pattern="\d{4}"
          maxLength={4}
          autoComplete="new-password"
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
        {pending ? "שולח..." : "הרשמה"}
      </button>
      <p className="text-center text-sm">
        כבר רשום?{" "}
        <Link href="/login" className="underline">
          התחברות
        </Link>
      </p>
    </form>
  );
}
