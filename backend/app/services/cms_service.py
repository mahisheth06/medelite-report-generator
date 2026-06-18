# services/cms_service.py
import httpx
from app.models.facility import FacilityResponse

CMS_API_URL = (
    "https://data.cms.gov/provider-data/api/1/datastore/query/4pq5-n9py/0"
)


async def fetch_facility_by_ccn(ccn: str) -> FacilityResponse:
    """
    Fetches facility data from the CMS API using a CCN.
    Column names updated to match current CMS API schema (2026).
    """
    ccn_clean = ccn.strip()

    # Build query string manually to preserve bracket syntax CMS expects.
    # The correct CCN column name is now: cms_certification_number_ccn
    query_string = (
        f"conditions[0][property]=cms_certification_number_ccn"
        f"&conditions[0][value]={ccn_clean}"
        f"&conditions[0][operator]=%3D"
        f"&limit=1"
    )

    full_url = f"{CMS_API_URL}?{query_string}"

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(full_url)
        response.raise_for_status()
        data = response.json()

    results = data.get("results", [])

    if not results:
        raise ValueError(f"No facility found for CCN: {ccn}")

    facility = results[0]

    # Build full address string from updated field names
    address_parts = [
        facility.get("provider_address", ""),
        facility.get("citytown", ""),
        facility.get("state", ""),
        facility.get("zip_code", ""),
    ]
    full_address = ", ".join(part for part in address_parts if part)

    # Build Medicare Care Compare URL
    medicare_url = (
        f"https://www.medicare.gov/care-compare/details/nursing-home/{ccn_clean}"
    )

    # Map updated CMS field names to our clean model fields
    return FacilityResponse(
        ccn=ccn_clean,
        legal_name=facility.get("provider_name", "Unknown Facility"),
        address=facility.get("provider_address"),
        city=facility.get("citytown"),
        state=facility.get("state"),
        zip_code=facility.get("zip_code"),
        full_address=full_address,
        certified_beds=_safe_int(facility.get("number_of_certified_beds")),
        overall_rating=_safe_int(facility.get("overall_rating")),
        health_inspection_rating=_safe_int(facility.get("health_inspection_rating")),
        staffing_rating=_safe_int(facility.get("staffing_rating")),
        quality_rating=_safe_int(facility.get("qm_rating")),
        medicare_url=medicare_url,
    )


def _safe_int(value) -> int | None:
    """Safely converts a value to int, returning None if conversion fails."""
    if value is None:
        return None
    try:
        return int(value)
    except (ValueError, TypeError):
        return None