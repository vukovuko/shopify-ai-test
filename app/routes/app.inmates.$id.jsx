import { useLoaderData, useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect } from "react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getInmateById, updateInmate, ValidationError } from "../services/inmate.server";
import { NY_FACILITIES } from "../utils/facilities.server";
import InmateForm from "../components/InmateForm";

export const loader = async ({ request, params }) => {
  await authenticate.admin(request);
  const inmate = await getInmateById(params.id);
  if (!inmate) throw new Response("Inmate not found", { status: 404 });
  return { inmate, facilities: NY_FACILITIES };
};

export const action = async ({ request, params }) => {
  await authenticate.admin(request);
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  try {
    await updateInmate(params.id, data);
    return { success: true };
  } catch (err) {
    if (err instanceof ValidationError) {
      return { errors: err.errors };
    }
    return { errors: { form: "An unexpected error occurred" } };
  }
};

export default function EditInmate() {
  const { inmate, facilities } = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const isSubmitting = fetcher.state === "submitting";
  const errors = fetcher.data?.errors || {};

  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show("Inmate updated");
    }
    if (errors.form) {
      shopify.toast.show(errors.form, { isError: true });
    }
  }, [fetcher.data, errors.form, shopify]);

  return (
    <s-page heading={`Edit Inmate: ${inmate.din}`} back-action="/app/inmates">
      {errors.form && (
        <s-banner tone="critical">{errors.form}</s-banner>
      )}
      <InmateForm
        inmate={inmate}
        facilities={facilities}
        errors={errors}
        isSubmitting={isSubmitting}
        fetcher={fetcher}
      />
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
