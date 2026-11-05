// Israeli mobile numbers only: 05X-XXXXXXX, also accepts +972 / 972 prefixes.
export const normalizePhone = (input: string): string | null => {
  let digits = input.replace(/[\s\-().]/g, "");
  if (digits.startsWith("+972")) digits = "0" + digits.slice(4);
  else if (digits.startsWith("972")) digits = "0" + digits.slice(3);
  return /^05\d{8}$/.test(digits) ? digits : null;
};

// "0501234567" -> "050-1234567"
export const formatPhone = (phone: string): string => {
  return `${phone.slice(0, 3)}-${phone.slice(3)}`;
};
