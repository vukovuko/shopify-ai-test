import { authenticate } from "../shopify.server";
import { lookupByDin, createInmate, ValidationError } from "../services/inmate.server";
import { validateDin } from "../utils/validation";
import { checkLookupRateLimit, checkCreateRateLimit, getClientIp } from "../utils/rate-limiter.server";

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// GET - Lookup inmate by DIN
export const loader = async ({ request }) => {
  const { session } = await authenticate.public.appProxy(request);
  const url = new URL(request.url);
  const din = url.searchParams.get("din");
  const shop = url.searchParams.get("shop") || session?.shop || "unknown";
  const ip = getClientIp(request);

  // Rate limit
  const rateCheck = checkLookupRateLimit(shop, ip);
  if (!rateCheck.allowed) {
    return jsonResponse(
      { success: false, error: "Rate limit exceeded. Try again later." },
      429
    );
  }

  // Validate DIN
  if (!din) {
    return jsonResponse({ success: false, error: "DIN parameter is required" }, 400);
  }
  const dinResult = validateDin(din);
  if (!dinResult.valid) {
    return jsonResponse({ success: false, error: dinResult.error }, 400);
  }

  // Lookup
  const inmate = await lookupByDin(dinResult.value);
  if (!inmate) {
    return jsonResponse({ success: false, error: "Inmate not found" }, 404);
  }

  return jsonResponse({ success: true, data: inmate });
};

// POST - Create new inmate
export const action = async ({ request }) => {
  const { session } = await authenticate.public.appProxy(request);
  const shop = new URL(request.url).searchParams.get("shop") || session?.shop || "unknown";
  const ip = getClientIp(request);

  // Rate limit
  const rateCheck = checkCreateRateLimit(shop, ip);
  if (!rateCheck.allowed) {
    return jsonResponse(
      { success: false, error: "Rate limit exceeded. Try again later." },
      429
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ success: false, error: "Invalid JSON body" }, 400);
  }

  try {
    const inmate = await createInmate(body);
    return jsonResponse({
      success: true,
      data: {
        din: inmate.din,
        fullName: inmate.fullName,
        firstName: inmate.firstName,
        lastName: inmate.lastName,
      },
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      return jsonResponse({ success: false, error: Object.values(err.errors).join(", ") }, 422);
    }
    console.error("Proxy create error:", err);
    return jsonResponse({ success: false, error: "An error occurred" }, 500);
  }
};
