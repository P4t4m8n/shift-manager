import { users } from "../lib/mongodb.ts";
import { normalizePhone } from "../lib/phone.ts";
import { PIN_REGEX, hashPin } from "../lib/pin.ts";

const name = process.env.ADMIN_NAME?.trim();
const phone = normalizePhone(process.env.ADMIN_PHONE ?? "");
const pin = process.env.ADMIN_PIN?.trim() ?? "";

if (!name || !phone || !PIN_REGEX.test(pin)) {
  console.error(
    "Set ADMIN_NAME, ADMIN_PHONE (05XXXXXXXX) and ADMIN_PIN (4 digits) in .env.local",
  );
  process.exit(1);
}

const collection = await users();
const result = await collection.updateOne(
  { phone },
  {
    $set: { name, pinHash: hashPin(pin), role: "admin", status: "approved" },
    $setOnInsert: { failedPinAttempts: 0, createdAt: new Date() },
  },
  { upsert: true },
);

console.log(
  result.upsertedCount ? `Admin created: ${phone}` : `Admin updated: ${phone}`,
);
process.exit(0);
