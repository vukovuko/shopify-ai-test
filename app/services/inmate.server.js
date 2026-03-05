import prisma from "../db.server";
import { validateInmateFields } from "../utils/validation";
import { parseDoccsName } from "../utils/name-parser";

const DEFAULT_PAGE_SIZE = 50;

export async function getInmates({ search = "", page = 1, pageSize = DEFAULT_PAGE_SIZE } = {}) {
  const skip = (page - 1) * pageSize;

  const where = search
    ? {
        OR: [
          { din: { contains: search.toUpperCase() } },
          { firstName: { contains: search } },
          { lastName: { contains: search } },
        ],
      }
    : {};

  const [inmates, totalCount] = await Promise.all([
    prisma.inmateProfile.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.inmateProfile.count({ where }),
  ]);

  return {
    inmates,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: page,
  };
}

export async function getInmateById(id) {
  return prisma.inmateProfile.findUnique({ where: { id } });
}

export async function getInmateByDin(din) {
  return prisma.inmateProfile.findUnique({ where: { din: din.toUpperCase() } });
}

export async function createInmate(data) {
  const { valid, errors } = validateInmateFields(data);
  if (!valid) throw new ValidationError(errors);

  const existing = await getInmateByDin(data.din);
  if (existing) throw new ValidationError({ din: "An inmate with this DIN already exists" });

  const { firstName, lastName, fullName } = parseDoccsName(data.fullName);

  return prisma.inmateProfile.create({
    data: {
      din: data.din.trim().toUpperCase(),
      fullName,
      firstName,
      lastName,
      facilityName: data.facilityName.trim(),
      facilityAddress1: data.facilityAddress1.trim(),
      facilityAddress2: data.facilityAddress2?.trim() || null,
      city: data.city.trim(),
      state: data.state.trim().toUpperCase(),
      zip: data.zip.trim(),
      country: data.country?.trim() || "US",
      isActive: data.isActive !== false,
    },
  });
}

export async function updateInmate(id, data) {
  const { valid, errors } = validateInmateFields(data);
  if (!valid) throw new ValidationError(errors);

  // Check DIN uniqueness if changed
  const existing = await getInmateByDin(data.din);
  if (existing && existing.id !== id) {
    throw new ValidationError({ din: "An inmate with this DIN already exists" });
  }

  const { firstName, lastName, fullName } = parseDoccsName(data.fullName);

  return prisma.inmateProfile.update({
    where: { id },
    data: {
      din: data.din.trim().toUpperCase(),
      fullName,
      firstName,
      lastName,
      facilityName: data.facilityName.trim(),
      facilityAddress1: data.facilityAddress1.trim(),
      facilityAddress2: data.facilityAddress2?.trim() || null,
      city: data.city.trim(),
      state: data.state.trim().toUpperCase(),
      zip: data.zip.trim(),
      country: data.country?.trim() || "US",
      isActive: data.isActive !== false,
    },
  });
}

export async function deleteInmates(ids) {
  return prisma.inmateProfile.deleteMany({
    where: { id: { in: ids } },
  });
}

export async function bulkCreateInmates(records) {
  const results = { created: 0, skipped: 0, errors: [] };

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    try {
      await createInmate(record);
      results.created++;
    } catch (err) {
      if (err instanceof ValidationError && err.errors?.din?.includes("already exists")) {
        results.skipped++;
      } else {
        results.errors.push({
          row: i + 1,
          din: record.din,
          error: err instanceof ValidationError ? Object.values(err.errors).join(", ") : "Unknown error",
        });
      }
    }
  }

  return results;
}

export async function getInmateCount() {
  const [total, active] = await Promise.all([
    prisma.inmateProfile.count(),
    prisma.inmateProfile.count({ where: { isActive: true } }),
  ]);
  return { total, active };
}

// Public API lookup - returns only safe fields
export async function lookupByDin(din) {
  const inmate = await getInmateByDin(din);
  if (!inmate) return null;

  return {
    din: inmate.din,
    fullName: inmate.fullName,
    firstName: inmate.firstName,
    lastName: inmate.lastName,
    facilityName: inmate.facilityName,
    facilityAddress1: inmate.facilityAddress1,
    facilityAddress2: inmate.facilityAddress2,
    city: inmate.city,
    state: inmate.state,
    zip: inmate.zip,
    country: inmate.country,
  };
}

export class ValidationError extends Error {
  constructor(errors) {
    super("Validation failed");
    this.name = "ValidationError";
    this.errors = errors;
  }
}
