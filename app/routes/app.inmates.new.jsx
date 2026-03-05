import { useLoaderData, useFetcher, redirect } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect } from "react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { createInmate, ValidationError } from "../services/inmate.server";
import { NY_FACILITIES } from "../utils/facilities.server";
import InmateForm from "../components/InmateForm";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return { facilities: NY_FACILITIES };
};

export const action = async ({ request }) => {
  await authenticate.admin(request);
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  try {
    await createInmate(data);
    return redirect("/app/inmates");
  } catch (err) {
    if (err instanceof ValidationError) {
      return { errors: err.errors };
    }
    return { errors: { form: "An unexpected error occurred" } };
  }
};

export default function NewInmate() {
  const { facilities } = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const isSubmitting = fetcher.state === "submitting";
  const errors = fetcher.data?.errors || {};

  useEffect(() => {
    if (errors.form) {
      shopify.toast.show(errors.form, { isError: true });
    }
  }, [errors.form, shopify]);

  return (
    <s-page heading="Add Inmate" back-action="/app/inmates">
      {errors.form && (
        <s-banner tone="critical">{errors.form}</s-banner>
      )}
      <InmateForm
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
