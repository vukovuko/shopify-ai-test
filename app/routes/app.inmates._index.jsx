import { useState } from "react";
import { useLoaderData, useNavigate, useSearchParams } from "react-router";
import { useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getInmates, deleteInmates } from "../services/inmate.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const page = parseInt(url.searchParams.get("page") || "1", 10);

  const result = await getInmates({ search, page });
  return { ...result, search };
};

export const action = async ({ request }) => {
  await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("_action");

  if (action === "delete") {
    const ids = JSON.parse(formData.get("ids"));
    await deleteInmates(ids);
    return { success: true, deleted: ids.length };
  }

  return { success: false, error: "Unknown action" };
};

export default function InmatesList() {
  const { inmates, totalCount, totalPages, currentPage, search } = useLoaderData();
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const shopify = useAppBridge();

  const allSelected = inmates.length > 0 && selectedIds.length === inmates.length;

  function handleSearch(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setSearchParams({ search: formData.get("search"), page: "1" });
  }

  function toggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function toggleAll() {
    setSelectedIds(allSelected ? [] : inmates.map((i) => i.id));
  }

  function handleBulkDelete() {
    if (!selectedIds.length) return;
    fetcher.submit(
      { _action: "delete", ids: JSON.stringify(selectedIds) },
      { method: "POST" }
    );
    setSelectedIds([]);
    shopify.toast.show(`Deleted ${selectedIds.length} inmate(s)`);
  }

  return (
    <s-page heading="Inmates">
      <s-button slot="primary-action" variant="primary" href="/app/inmates/new">
        Add Inmate
      </s-button>

      <s-section>
        <s-stack direction="block" gap="base">
          <form onSubmit={handleSearch}>
            <s-stack direction="inline" gap="base">
              <s-search-field
                name="search"
                label="Search by DIN or name"
                label-hidden
                placeholder="Search by DIN or name..."
                defaultValue={search}
              />
              <s-button type="submit">Search</s-button>
            </s-stack>
          </form>

          {selectedIds.length > 0 && (
            <s-stack direction="inline" gap="base">
              <s-text>{selectedIds.length} selected</s-text>
              <s-button variant="destructive" onClick={handleBulkDelete}>
                Delete Selected
              </s-button>
            </s-stack>
          )}

          <s-table>
            <s-table-header-row>
              <s-table-header></s-table-header>
              <s-table-header listSlot="primary">DIN</s-table-header>
              <s-table-header>Name</s-table-header>
              <s-table-header>Facility</s-table-header>
              <s-table-header>Status</s-table-header>
              <s-table-header>Actions</s-table-header>
            </s-table-header-row>
            <s-table-body>
              {inmates.map((inmate) => (
                <s-table-row key={inmate.id}>
                  <s-table-cell>
                    <s-checkbox
                      checked={selectedIds.includes(inmate.id)}
                      onChange={() => toggleSelect(inmate.id)}
                      label={`Select ${inmate.din}`}
                      label-hidden
                    />
                  </s-table-cell>
                  <s-table-cell>{inmate.din}</s-table-cell>
                  <s-table-cell>{inmate.fullName}</s-table-cell>
                  <s-table-cell>{inmate.facilityName}</s-table-cell>
                  <s-table-cell>
                    <s-badge tone={inmate.isActive ? "success" : "critical"}>
                      {inmate.isActive ? "Active" : "Inactive"}
                    </s-badge>
                  </s-table-cell>
                  <s-table-cell>
                    <s-link href={`/app/inmates/${inmate.id}`}>Edit</s-link>
                  </s-table-cell>
                </s-table-row>
              ))}
              {inmates.length === 0 && (
                <s-table-row>
                  <s-table-cell colSpan="6">
                    <s-text>No inmates found.</s-text>
                  </s-table-cell>
                </s-table-row>
              )}
            </s-table-body>
          </s-table>

          {totalPages > 1 && (
            <s-stack direction="inline" gap="base">
              <s-button
                disabled={currentPage <= 1}
                onClick={() => setSearchParams({ search, page: String(currentPage - 1) })}
              >
                Previous
              </s-button>
              <s-text>
                Page {currentPage} of {totalPages} ({totalCount} total)
              </s-text>
              <s-button
                disabled={currentPage >= totalPages}
                onClick={() => setSearchParams({ search, page: String(currentPage + 1) })}
              >
                Next
              </s-button>
            </s-stack>
          )}
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
