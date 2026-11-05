"use server";

import { redirect } from "next/navigation";
import { LOCK_MINUTES, MAX_PIN_ATTEMPTS } from "@/lib/config";
import { users } from "@/lib/mongodb";
import { normalizePhone } from "@/lib/phone";
import { DUMMY_PIN_HASH, PIN_REGEX, hashPin, verifyPin } from "@/lib/pin";
import {
  createSession,
  deleteSession,
  type SessionPayload,
} from "@/lib/session";
import type { FormState } from "@/lib/interfaces";

const INVALID_CREDENTIALS = "מספר טלפון או קוד שגויים";
const SERVER_ERROR = "אירעה שגיאה, נסה שוב מאוחר יותר";

const field = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
};

type Registration = { name: string; phone: string; pin: string };

const parseRegistration = (
  formData: FormData,
): { error: string } | { data: Registration } => {
  const name = field(formData, "name");
  const phone = normalizePhone(field(formData, "phone"));
  const pin = field(formData, "pin");
  const confirmPin = field(formData, "confirmPin");

  if (name.length < 2 || name.length > 50) {
    return { error: "יש להזין שם (2-50 תווים)" };
  }
  if (!phone) return { error: "מספר טלפון לא תקין" };
  if (!PIN_REGEX.test(pin)) return { error: "הקוד חייב להכיל 4 ספרות" };
  if (pin !== confirmPin) return { error: "הקודים אינם תואמים" };

  return { data: { name, phone, pin } };
};

export const register = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  const parsed = parseRegistration(formData);
  if ("error" in parsed) return { message: parsed.error };
  const { name, phone, pin } = parsed.data;

  try {
    const collection = await users();
    await collection.insertOne({
      phone,
      name,
      pinHash: hashPin(pin),
      role: "worker",
      status: "pending",
      failedPinAttempts: 0,
      createdAt: new Date(),
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return { message: "מספר הטלפון כבר רשום" };
    }
    console.error("register failed", error);
    return { message: SERVER_ERROR };
  }

  return {
    success: true,
    message: "הבקשה נשלחה. תוכל להתחבר לאחר שמנהל יאשר אותך.",
  };
};

type AuthResult = { error: string } | { session: SessionPayload };

const authenticate = async (
  phone: string,
  pin: string,
): Promise<AuthResult> => {
  const collection = await users();
  const user = await collection.findOne({ phone });

  if (!user) {
    verifyPin(pin, DUMMY_PIN_HASH);
    return { error: INVALID_CREDENTIALS };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return {
      error: `יותר מדי ניסיונות שגויים. נסה שוב מאוחר יותר (נעילה של ${LOCK_MINUTES} דקות).`,
    };
  }

  if (!verifyPin(pin, user.pinHash)) {
    const updated = await collection.findOneAndUpdate(
      { _id: user._id },
      { $inc: { failedPinAttempts: 1 } },
      { returnDocument: "after" },
    );
    if (updated && updated.failedPinAttempts >= MAX_PIN_ATTEMPTS) {
      await collection.updateOne(
        { _id: user._id },
        {
          $set: {
            failedPinAttempts: 0,
            lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60 * 1000),
          },
        },
      );
    }
    return { error: INVALID_CREDENTIALS };
  }

  await collection.updateOne(
    { _id: user._id },
    { $set: { failedPinAttempts: 0 }, $unset: { lockedUntil: "" } },
  );

  // Status is only revealed after the PIN is verified.
  if (user.status === "pending") {
    return { error: "החשבון ממתין לאישור מנהל" };
  }
  if (user.status === "rejected") {
    return { error: "הבקשה להצטרפות נדחתה" };
  }

  return { session: { userId: user._id.toString(), role: user.role } };
};

export const login = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  const phone = normalizePhone(field(formData, "phone"));
  const pin = field(formData, "pin");
  if (!phone || !PIN_REGEX.test(pin)) return { message: INVALID_CREDENTIALS };

  try {
    const result = await authenticate(phone, pin);
    if ("error" in result) return { message: result.error };
    await createSession(result.session);
  } catch (error) {
    console.error("login failed", error);
    return { message: SERVER_ERROR };
  }

  // redirect() works by throwing, so it must stay outside the try/catch.
  redirect("/");
};

export const logout = async () => {
  await deleteSession();
  redirect("/login");
};
