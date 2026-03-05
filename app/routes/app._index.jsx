import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getInmateCount } from "../services/inmate.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  const counts = await getInmateCount();
  return counts;
};

export default function Index() {
  const { total, active } = useLoaderData();

  return (
    <s-page heading="Prison Meals - Inmate Lookup">
      <s-section heading="Database Overview">
        <s-stack direction="inline" gap="loose">
          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="tight">
              <s-text variant="headingLg">{total}</s-text>
              <s-text>Total Inmates</s-text>
            </s-stack>
          </s-box>
          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="tight">
              <s-text variant="headingLg">{active}</s-text>
              <s-text>Active Inmates</s-text>
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>
      <s-section heading="Quick Actions">
        <s-stack direction="inline" gap="base">
          <s-link href="/app/inmates">
            <s-button>Manage Inmates</s-button>
          </s-link>
          <s-link href="/app/inmates/new">
            <s-button>Add Inmate</s-button>
          </s-link>
          <s-link href="/app/inmates/import">
            <s-button>Bulk Import</s-button>
          </s-link>
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
