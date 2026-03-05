import { useState, useEffect } from "react";
import { validateDin, validateDoccsName } from "../utils/validation";

export default function InmateForm({ inmate, facilities, errors: serverErrors, isSubmitting, fetcher }) {
  const [facilityName, setFacilityName] = useState(inmate?.facilityName || "");
  const [address1, setAddress1] = useState(inmate?.facilityAddress1 || "");
  const [address2, setAddress2] = useState(inmate?.facilityAddress2 || "");
  const [city, setCity] = useState(inmate?.city || "");
  const [facilityState, setFacilityState] = useState(inmate?.state || "NY");
  const [zip, setZip] = useState(inmate?.zip || "");
  const [din, setDin] = useState(inmate?.din || "");
  const [fullName, setFullName] = useState(inmate?.fullName || "");
  const [clientErrors, setClientErrors] = useState({});

  const errors = { ...clientErrors, ...serverErrors };

  // Auto-fill address when facility is selected
  useEffect(() => {
    if (!facilityName) return;
    const facility = facilities.find((f) => f.name === facilityName);
    if (facility) {
      setAddress1(facility.address1);
      setAddress2(facility.address2 || "");
      setCity(facility.city);
      setFacilityState(facility.state);
      setZip(facility.zip);
    }
  }, [facilityName, facilities]);

  function handleSubmit(e) {
    const newErrors = {};
    const dinResult = validateDin(din);
    if (!dinResult.valid) newErrors.din = dinResult.error;
    const nameResult = validateDoccsName(fullName);
    if (!nameResult.valid) newErrors.fullName = nameResult.error;
    if (!facilityName) newErrors.facilityName = "Facility is required";
    if (!address1) newErrors.facilityAddress1 = "Address is required";
    if (!city) newErrors.city = "City is required";
    if (!zip) newErrors.zip = "ZIP is required";

    if (Object.keys(newErrors).length > 0) {
      e.preventDefault();
      setClientErrors(newErrors);
    } else {
      setClientErrors({});
    }
  }

  return (
    <fetcher.Form method="POST" onSubmit={handleSubmit}>
      {inmate?.id && <input type="hidden" name="id" value={inmate.id} />}

      <s-section heading="Inmate Information">
        <s-stack direction="block" gap="base">
          <s-text-field
            label="DIN (Department Identification Number)"
            name="din"
            value={din}
            onChange={(e) => setDin(e.currentTarget.value)}
            placeholder="12A3456"
            maxLength="7"
            error={errors.din}
            {...(inmate ? { disabled: true } : {})}
          />
          <s-text-field
            label="Full Name (DOCCS Format)"
            name="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.currentTarget.value)}
            placeholder="LAST, FIRST MIDDLE"
            error={errors.fullName}
          />
        </s-stack>
      </s-section>

      <s-section heading="Facility">
        <s-stack direction="block" gap="base">
          <s-select
            label="Facility"
            name="facilityName"
            value={facilityName}
            onChange={(e) => setFacilityName(e.currentTarget.value)}
            placeholder="Select a facility..."
            error={errors.facilityName}
          >
            {facilities.map((f) => (
              <s-option key={f.name} value={f.name}>{f.name}</s-option>
            ))}
          </s-select>
          <s-text-field
            label="Address Line 1"
            name="facilityAddress1"
            value={address1}
            onChange={(e) => setAddress1(e.currentTarget.value)}
            error={errors.facilityAddress1}
          />
          <s-text-field
            label="Address Line 2 (Optional)"
            name="facilityAddress2"
            value={address2}
            onChange={(e) => setAddress2(e.currentTarget.value)}
          />
          <s-stack direction="inline" gap="base">
            <s-text-field
              label="City"
              name="city"
              value={city}
              onChange={(e) => setCity(e.currentTarget.value)}
              error={errors.city}
            />
            <s-text-field
              label="State"
              name="state"
              value={facilityState}
              onChange={(e) => setFacilityState(e.currentTarget.value)}
            />
            <s-text-field
              label="ZIP"
              name="zip"
              value={zip}
              onChange={(e) => setZip(e.currentTarget.value)}
              error={errors.zip}
            />
          </s-stack>
        </s-stack>
      </s-section>

      <s-stack direction="inline" gap="base">
        <s-button type="submit" variant="primary" {...(isSubmitting ? { loading: true } : {})}>
          {inmate ? "Update Inmate" : "Create Inmate"}
        </s-button>
        <s-link href="/app/inmates">
          <s-button variant="tertiary">Cancel</s-button>
        </s-link>
      </s-stack>
    </fetcher.Form>
  );
}
