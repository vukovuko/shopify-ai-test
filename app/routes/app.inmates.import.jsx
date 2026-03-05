import { useState } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { bulkCreateInmates } from "../services/inmate.server";
import { validateInmateFields } from "../utils/validation";
import { parseDoccsName } from "../utils/name-parser";
import * as XLSX from "xlsx";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }) => {
  await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("_action");

  if (action === "commit") {
    const records = JSON.parse(formData.get("records"));
    const results = await bulkCreateInmates(records);
    return { step: "results", results };
  }

  return { error: "Unknown action" };
};

export default function ImportInmates() {
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const [preview, setPreview] = useState(null);
  const [parseErrors, setParseErrors] = useState([]);
  const [validRecords, setValidRecords] = useState([]);

  const results = fetcher.data?.results;
  const isSubmitting = fetcher.state === "submitting";

  function handleFileChange(e) {
    const file = e.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const workbook = XLSX.read(evt.target.result, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        const valid = [];
        const errors = [];

        rows.forEach((row, i) => {
          const data = {
            din: String(row.din || row.DIN || "").trim().toUpperCase(),
            fullName: String(row.fullName || row.full_name || row.name || row.Name || "").trim().toUpperCase(),
            facilityName: String(row.facilityName || row.facility_name || row.facility || row.Facility || "").trim(),
            facilityAddress1: String(row.facilityAddress1 || row.address1 || row.address || row.Address || "").trim(),
            facilityAddress2: String(row.facilityAddress2 || row.address2 || "").trim() || null,
            city: String(row.city || row.City || "").trim(),
            state: String(row.state || row.State || "NY").trim(),
            zip: String(row.zip || row.ZIP || row.zipcode || "").trim(),
          };

          const { valid: isValid, errors: fieldErrors } = validateInmateFields(data);
          if (isValid) {
            valid.push(data);
          } else {
            errors.push({ row: i + 2, din: data.din, errors: fieldErrors });
          }
        });

        setValidRecords(valid);
        setParseErrors(errors);
        setPreview(rows.length);
      } catch (err) {
        shopify.toast.show("Failed to parse file", { isError: true });
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function handleCommit() {
    fetcher.submit(
      { _action: "commit", records: JSON.stringify(validRecords) },
      { method: "POST" }
    );
  }

  function handleReset() {
    setPreview(null);
    setParseErrors([]);
    setValidRecords([]);
  }

  return (
    <s-page heading="Bulk Import Inmates" back-action="/app/inmates">
      {!preview && !results && (
        <s-section heading="Upload File">
          <s-stack direction="block" gap="base">
            <s-paragraph>
              Upload a CSV or Excel file with columns: din, fullName, facilityName,
              facilityAddress1, facilityAddress2 (optional), city, state, zip.
            </s-paragraph>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
            />
          </s-stack>
        </s-section>
      )}

      {preview && !results && (
        <s-section heading="Preview">
          <s-stack direction="block" gap="base">
            <s-banner tone="info">
              Parsed {preview} rows: {validRecords.length} valid, {parseErrors.length} with errors.
            </s-banner>

            {parseErrors.length > 0 && (
              <>
                <s-heading>Errors</s-heading>
                <s-table>
                  <s-table-header-row>
                    <s-table-header listSlot="primary">Row</s-table-header>
                    <s-table-header>DIN</s-table-header>
                    <s-table-header>Issues</s-table-header>
                  </s-table-header-row>
                  <s-table-body>
                    {parseErrors.map((err, i) => (
                      <s-table-row key={i}>
                        <s-table-cell>{err.row}</s-table-cell>
                        <s-table-cell>{err.din || "—"}</s-table-cell>
                        <s-table-cell>{Object.values(err.errors).join(", ")}</s-table-cell>
                      </s-table-row>
                    ))}
                  </s-table-body>
                </s-table>
              </>
            )}

            {validRecords.length > 0 && (
              <>
                <s-heading>Valid Records ({validRecords.length})</s-heading>
                <s-table>
                  <s-table-header-row>
                    <s-table-header listSlot="primary">DIN</s-table-header>
                    <s-table-header>Name</s-table-header>
                    <s-table-header>Facility</s-table-header>
                  </s-table-header-row>
                  <s-table-body>
                    {validRecords.slice(0, 20).map((rec, i) => (
                      <s-table-row key={i}>
                        <s-table-cell>{rec.din}</s-table-cell>
                        <s-table-cell>{rec.fullName}</s-table-cell>
                        <s-table-cell>{rec.facilityName}</s-table-cell>
                      </s-table-row>
                    ))}
                    {validRecords.length > 20 && (
                      <s-table-row>
                        <s-table-cell colSpan="3">
                          ...and {validRecords.length - 20} more
                        </s-table-cell>
                      </s-table-row>
                    )}
                  </s-table-body>
                </s-table>
              </>
            )}

            <s-stack direction="inline" gap="base">
              <s-button
                variant="primary"
                onClick={handleCommit}
                disabled={validRecords.length === 0}
                {...(isSubmitting ? { loading: true } : {})}
              >
                Import {validRecords.length} Records
              </s-button>
              <s-button variant="tertiary" onClick={handleReset}>
                Cancel
              </s-button>
            </s-stack>
          </s-stack>
        </s-section>
      )}

      {results && (
        <s-section heading="Import Results">
          <s-stack direction="block" gap="base">
            <s-banner tone="success">
              Created {results.created} inmates. Skipped {results.skipped} duplicates.
              {results.errors.length > 0 && ` ${results.errors.length} errors.`}
            </s-banner>

            {results.errors.length > 0 && (
              <s-table>
                <s-table-header-row>
                  <s-table-header listSlot="primary">Row</s-table-header>
                  <s-table-header>DIN</s-table-header>
                  <s-table-header>Error</s-table-header>
                </s-table-header-row>
                <s-table-body>
                  {results.errors.map((err, i) => (
                    <s-table-row key={i}>
                      <s-table-cell>{err.row}</s-table-cell>
                      <s-table-cell>{err.din}</s-table-cell>
                      <s-table-cell>{err.error}</s-table-cell>
                    </s-table-row>
                  ))}
                </s-table-body>
              </s-table>
            )}

            <s-stack direction="inline" gap="base">
              <s-link href="/app/inmates">
                <s-button variant="primary">View Inmates</s-button>
              </s-link>
              <s-button variant="tertiary" onClick={handleReset}>
                Import More
              </s-button>
            </s-stack>
          </s-stack>
        </s-section>
      )}
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
