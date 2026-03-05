/**
 * Parse DOCCS format name "LAST, FIRST MIDDLE" into separate fields.
 * e.g. "SMITH, JOHN PAUL" -> { firstName: "John Paul", lastName: "Smith", fullName: "SMITH, JOHN PAUL" }
 */
export function parseDoccsName(fullName) {
  if (!fullName || !fullName.includes(",")) {
    return { firstName: "", lastName: fullName?.trim() || "", fullName: fullName?.trim().toUpperCase() || "" };
  }

  const [rawLast, ...rest] = fullName.split(",");
  const lastName = rawLast.trim().toUpperCase();
  const firstName = rest.join(",").trim().toUpperCase();
  const normalized = `${lastName}, ${firstName}`;

  return {
    firstName: toTitleCase(firstName),
    lastName: toTitleCase(lastName),
    fullName: normalized,
  };
}

/**
 * Build DOCCS format name from separate fields.
 * e.g. ("John Paul", "Smith") -> "SMITH, JOHN PAUL"
 */
export function formatDoccsName(firstName, lastName) {
  return `${lastName.trim().toUpperCase()}, ${firstName.trim().toUpperCase()}`;
}

function toTitleCase(str) {
  return str
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());
}
