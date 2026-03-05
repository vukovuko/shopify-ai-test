export const DIN_REGEX = /^\d{2}[A-Z]\d{4}$/;

export function validateDin(din) {
  if (!din) return { valid: false, error: "DIN is required" };
  const trimmed = din.trim().toUpperCase();
  if (trimmed.length !== 7) return { valid: false, error: "DIN must be exactly 7 characters" };
  if (!DIN_REGEX.test(trimmed)) return { valid: false, error: "DIN must be 2 digits + 1 letter + 4 digits (e.g. 12A3456)" };
  return { valid: true, value: trimmed };
}

export function validateDoccsName(fullName) {
  if (!fullName) return { valid: false, error: "Full name is required" };
  const trimmed = fullName.trim().toUpperCase();
  if (!trimmed.includes(",")) return { valid: false, error: "Name must be in DOCCS format: LAST, FIRST MIDDLE" };
  const [last, first] = trimmed.split(",").map((s) => s.trim());
  if (!last) return { valid: false, error: "Last name is required" };
  if (!first) return { valid: false, error: "First name is required" };
  return { valid: true, value: trimmed };
}

export function validateInmateFields(data) {
  const errors = {};

  const dinResult = validateDin(data.din);
  if (!dinResult.valid) errors.din = dinResult.error;

  const nameResult = validateDoccsName(data.fullName);
  if (!nameResult.valid) errors.fullName = nameResult.error;

  if (!data.facilityName?.trim()) errors.facilityName = "Facility name is required";
  if (!data.facilityAddress1?.trim()) errors.facilityAddress1 = "Address is required";
  if (!data.city?.trim()) errors.city = "City is required";
  if (!data.state?.trim()) errors.state = "State is required";
  if (!data.zip?.trim()) errors.zip = "ZIP code is required";

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
